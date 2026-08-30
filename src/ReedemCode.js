import RedeemIcon from "@mui/icons-material/Redeem";
import UsersData from "./UsersData.json";
// import { appConfig } from "./config";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
function ReedemCode({
  initialOpen = true,
  userPoints = 0,
  onPointsChange,
  onSendRef,
  onRedeem,
  onInviteSuccess,
  referrerId = "",
  customerName,
  showTrigger = false,
  badgeClassName = "redeem-badge",
  openOverride,
  onClose,
  closeOnInvite = true,
  initialConsumed = false,
}) {
  const [open, setOpen] = useState(initialOpen);
  const [refs, setRefs] = useState(["", "", ""]);
  const [status, setStatus] = useState(["", "", ""]);
  const [errors, setErrors] = useState(["", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [consumed] = useState(initialConsumed);
  const [polling, setPolling] = useState(false);
  const mountedRef = useRef(false);
  const [showCoinsModal, setShowCoinsModal] = useState(false);
  const [numbers, setNumbers] = useState([]);

  // localStorage key for *awarded* points (per referrer)
  useEffect(() => {
    console.log(showCoinsModal);
  }, [showCoinsModal]);

  const fetchNumbers = async () => {
    try {
      const response = await fetch(
        "https://localhost:7091/api/Customer/download-json",
      );
      const data = await response.json();
      setNumbers(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchNumbers();
    const interval = setInterval(
      () => {
        fetchNumbers();
      },
      3 * 60 * 60 * 1000,
    );
    return () => clearInterval(interval);
  }, []);

  const AWARDED_POINTS_KEY = useMemo(
    () => `hm_referral_awarded_points_${referrerId || "guest"}`,
    [referrerId],
  );
  // ----- external visibility control -----
  useEffect(() => {
    if (typeof openOverride === "boolean") setOpen(openOverride);
  }, [openOverride]);

  //   useEffect(() => {
  //   const lock = localStorage.getItem(`hm_referral_lock_${referrerId || "guest"}`);
  //   if (initialOpen && lock !== "true") {
  //     setOpen(true);
  //   }
  // }, [initialOpen, referrerId]);

  const existingNumbersSet = useMemo(() => {
    return new Set((UsersData || []).map((num) => String(num)));
  }, []);

  const isInUsersData = useCallback(
    (num) => {
      return existingNumbersSet.has(num);
    },
    [existingNumbersSet],
  );

  const closeDialog = useCallback(() => {
    setOpen(false);
    if (typeof onClose === "function") onClose();
  }, [onClose]);

  // ---------- helpers ----------
  const onlyDigits10 = useCallback(
    (v) => (v || "").replace(/\D/g, "").slice(0, 10),
    [],
  );
  const isTen = useCallback((v) => /^\d{10}$/.test(v || ""), []);
  const isDuplicate = useCallback(
    (val, idx, arr) => val && arr.some((v, i) => i !== idx && v === val),
    [],
  );
  const splitCsvNumbers = useCallback(
    (csv = "") =>
      (csv || "")
        .split(",")
        .map((s) => s.trim())
        .filter(isTen)
        .filter((v, i, arr) => arr.indexOf(v) === i),
    [isTen],
  );
  const fixed4 = useCallback(
    (arr) => [arr[0] || "", arr[1] || "", arr[2] || "", arr[3] || ""].join(","),
    [],
  );

  // ----- server calls -----
  const checkNewOrExisting = useCallback(async (num) => {
    try {
      const res = await fetch(
        `https://localhost:7091/api/UserOnBoarding/GuestUserVerificationByMobileNo?mobileNo=${encodeURIComponent(
          num,
        )}`,
      );
      const text = await res.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }
      // API contract: null => not existing
      if (data === null) return "eligible";
      return "exists";
    } catch {
      return "invalid";
    }
  }, []);

  const isNowRegistered = useCallback(
    async (num) => (await checkNewOrExisting(num)) === "exists",
    [checkNewOrExisting],
  );

  const getReferralRecord = async (userId) => {
    if (!userId) return null;
    const url = `https://localhost:7091/api/ReferralPoints/GetReferralPointsByUserId?referreId=${encodeURIComponent(
      userId,
    )}`;
    const res = await fetch(url);
    const text = await res.text();
    let data = [];
    try {
      data = text ? JSON.parse(text) : [];
    } catch {
      data = [];
    }
    if (Array.isArray(data) && data.length > 0) {
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      const record = data[0];
      return record;
    }
    return null;
  };

  const hydrateFromServer = useCallback(async () => {
    //   const lock = localStorage.getItem(`hm_referral_lock_${referrerId || "guest"}`);
    // // ✅ STOP opening popup if already invited
    // if (lock === "true") {
    //   setOpen(false);
    //   return;
    // }
    // If we already awarded earlier in this browser, respect that.
    const lsAward = Number(localStorage.getItem(AWARDED_POINTS_KEY) || "0");
    if (!Number.isFinite(lsAward)) {
      try {
        localStorage.setItem(AWARDED_POINTS_KEY, "0");
      } catch {}
    }
    // If no referrerId, treat as new/guest and show the modal if asked to.
    if (!referrerId) {
      if (initialOpen) setOpen(true);
      return;
    }
    try {
      const record = await getReferralRecord(referrerId);
      // Brand-new user: no record yet → open popup if initialOpen
      if (!record) {
        if (initialOpen) setOpen(true);
        // ensure awarded stays 0
        try {
          localStorage.setItem(AWARDED_POINTS_KEY, "0");
        } catch {}
        return;
      }
      // Bind any server numbers
      const serverNums = splitCsvNumbers(record.referralNumbers);
      const nextRefs = [
        serverNums[0] || "",
        serverNums[1] || "",
        serverNums[2] || "",
      ];
      setRefs(nextRefs);
      // Check which are registered now
      const checks = await Promise.all(
        nextRefs.map((n) => (isTen(n) ? isNowRegistered(n) : false)),
      );
      const nextStatus = nextRefs.map((n, i) => {
        if (!isTen(n)) return "";
        return checks[i] ? "registered" : "not-registered-yet";
      });
      setStatus(nextStatus);
      setErrors(["", "", ""]);
      const regCount = nextStatus.filter((s) => s === "registered").length;
      const allRegistered = regCount === 3;
      if (allRegistered) {
        // Award and close if fully registered already
        try {
          localStorage.setItem(AWARDED_POINTS_KEY, "100");
        } catch {}
        if (typeof onPointsChange === "function") onPointsChange(100);
        setOpen(false);
        return;
      }
      // - If there are no numbers at all, or some pending, and we have not awarded yet → show modal
      const hasAnyNumber = nextRefs.some((n) => isTen(n));
      const alreadyAwarded =
        Number(localStorage.getItem(AWARDED_POINTS_KEY) || "0") === 100;
      if (!alreadyAwarded && initialOpen && (!hasAnyNumber || regCount < 3)) {
        setOpen(true);
      }
    } catch (e) {
      console.error("Failed to fetch referral record:", e);
      // If server fails and user wanted initial open, still open to let them enter numbers
      if (initialOpen) setOpen(true);
    }
  }, [
    referrerId,
    initialOpen,
    AWARDED_POINTS_KEY,
    splitCsvNumbers,
    isNowRegistered,
    isTen,
    onPointsChange,
  ]);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    hydrateFromServer();
  }, [hydrateFromServer]);

  useEffect(() => {
    hydrateFromServer();
  }, [hydrateFromServer, referrerId]);

  // Keep dialog open while waiting; close only when fully done.
  useEffect(() => {
    if (!open) return;
    const allRegistered =
      status.every((s) => s === "registered") && status.some((s) => s);
    if (allRegistered) closeDialog();
  }, [status, open, closeDialog]);

  // ---------- input change ----------
  const handlePhoneChange = async (index, raw) => {
    const value = onlyDigits10(raw);
    // Lock fields that are already registered
    if (status[index] === "registered") return;
    const nextRefs = [...refs];
    nextRefs[index] = value;
    setRefs(nextRefs);
    const nextStatus = [...status];
    const nextErrors = [...errors];
    if (!value) {
      nextStatus[index] = "";
      nextErrors[index] = "";
      setStatus(nextStatus);
      setErrors(nextErrors);
      return;
    }
    if (!isTen(value)) {
      nextStatus[index] = "invalid";
      nextErrors[index] = "Enter 10-digit mobile number.";
      setStatus(nextStatus);
      setErrors(nextErrors);
      return;
    }
    if (isDuplicate(value, index, nextRefs)) {
      nextStatus[index] = "invalid";
      nextErrors[index] = "Duplicate number — enter a different one.";
      setStatus(nextStatus);
      setErrors(nextErrors);
      return;
    }

    if (isInUsersData(value)) {
      nextStatus[index] = "invalid";
      nextErrors[index] = "This number already exists. Enter a NEW number.";
      setStatus(nextStatus);
      setErrors(nextErrors);
      return;
    }
    // Check with GuestUserVerification
    nextStatus[index] = "checking";
    nextErrors[index] = "";
    setStatus([...nextStatus]);
    setErrors([...nextErrors]);
    const kind = await checkNewOrExisting(value);
    if (kind === "eligible") {
      // NEW number (good)
      nextStatus[index] = "eligible";
      nextErrors[index] = "";
    } else if (kind === "exists") {
      // Existing user (invalid per requirement)
      nextStatus[index] = "invalid";
      nextErrors[index] = "Already an existing user. Enter a NEW number.";
    } else {
      nextStatus[index] = "invalid";
      nextErrors[index] = "Unable to verify number. Try again.";
    }
    setStatus([...nextStatus]);
    setErrors([...nextErrors]);
  };

  // ---------- Invite is enabled only when all three NEW (eligible) ----------
  const canInvite = useMemo(() => {
    const ok = [0, 1, 2].every(
      (i) => isTen(refs[i]) && status[i] === "eligible",
    );
    return ok;
  }, [refs, status, isTen]);

  // ---------- Server upsert (store numbers only) ----------
  const upsertReferral = async ({ record, numbersCsv }) => {
    const payload = {
      id: record?.id || "string",
      date: record?.date || new Date().toISOString(),
      referralNumbers: numbersCsv,
      referreId: referrerId,
      isReferralUsed: false,
      referralPoints: String(
        record?.referralPoints ??
          record?.referralpoints ??
          record?.ReferralPoints ??
          record?.ReferralPoints ??
          0,
      ),
    };

    if (record?.id) {
      const putUrl = `https://localhost:7091/api/ReferralPoints/UpdateReferralPoints?id=${encodeURIComponent(
        record.id,
      )}`;
      const r = await fetch(putUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload),
      });
      const t = await r.text();
      let d = null;
      try {
        d = t ? JSON.parse(t) : null;
      } catch {}
      if (!r.ok) throw new Error(d?.message || `PUT failed: ${r.status}`);
      return d || { ok: true };
    } else {
      const postUrl = `https://localhost:7091/api/ReferralPoints/UploadReferralPoints`;
      const r = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload),
      });
      const t = await r.text();
      let d = null;
      try {
        d = t ? JSON.parse(t) : null;
      } catch {}
      if (!r.ok) throw new Error(d?.message || `POST failed: ${r.status}`);
      return d || { ok: true };
    }
  };

  // Always save (registered first, then eligible) in 3 slots
  const buildNumbersCsvForSave = (currentRefs, currentStatus) => {
    const locked = [];
    const fill = [];
    for (let i = 0; i < 3; i++)
      if (currentStatus[i] === "registered") locked.push(currentRefs[i]);
    for (let i = 0; i < 3; i++)
      if (currentStatus[i] === "eligible") fill.push(currentRefs[i]);
    const merged = [...locked, ...fill].filter(isTen).slice(0, 4);
    return fixed4(merged);
  };
  // ---------- INVITE ----------
  const handleRedeem = async () => {
    try {
      setSubmitting(true);
      if (!canInvite) {
        alert("Please enter three NEW (eligible) 10-digit numbers.");
        return;
      }
      // 1) Save numbers to ReferralPoints (create or update)
      const record = await getReferralRecord(referrerId);
      const numbersCsv = buildNumbersCsvForSave(refs, status);
      const numbersArr = splitCsvNumbers(numbersCsv);
      await upsertReferral({
        record,
        numbersCsv: fixed4(numbersArr),
        userId: referrerId,
      });
      // 2) Send promo SMS to all 3 new numbers
      await fetch(`https://localhost:7091/api/Auth/sendpromosms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: numbersArr.join(","),
          name: customerName,
        }),
      });
      alert(
        `🎉 Thank you for referring your friend! ₹100 referral amount has been added to your wallet after they registered.🙏💰✨`,
      );
      localStorage.setItem(`hm_referral_lock_${referrerId || "guest"}`, "true");
      closeDialog();
      setShowCoinsModal(true);
      onPointsChange?.(0);
      onInviteSuccess?.({
        refRecord: {
          referralNumbers: numbersArr.join(","),
        },
        points: 0,
      });
      setPolling(true);
      // if (!smsRes.ok) throw new Error(`Promo SMS failed: ${smsRes.status}`);
      const nextStatus = [0, 1, 2].map(() => "not-registered-yet");
      setStatus(nextStatus);
      setErrors(["", "", ""]);
      setPolling(true);
    } catch (err) {
      console.error("Invite failed:", err);
      alert(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Poll until all three become registered ----------
  //   const recheckRegistration = useCallback(async () => {
  //     const next = await Promise.all(
  //       refs.map(async (n, i) => {
  //         if (!isTen(n)) return "";
  //         const was = status[i];
  //         if (was === "registered") return "registered";
  //         if (was === "" || was === "invalid") return was;
  //         const reg = await isNowRegistered(n);
  //         return reg ? "registered" : "not-registered-yet";
  //       })
  //     );
  //     setStatus(next);
  //     const regCount = next.filter((s) => s === "registered").length;
  //     // Award coins only when 3/3 registered; persist to localStorage
  //     if (regCount === 3) {
  //       try { localStorage.setItem(AWARDED_POINTS_KEY, "100"); } catch {}
  //       if (typeof onPointsChange === "function") onPointsChange(100);
  //       setPolling(false);
  //       if (closeOnInvite) closeDialog();
  //       setTimeout(() => {
  //       // window.location.reload();
  //       onPointsChange?.(100);
  //     }, 800);
  //     }
  //   }, [refs, status, isTen, isNowRegistered, AWARDED_POINTS_KEY, onPointsChange, closeOnInvite, closeDialog]);

  useEffect(() => {
    if (!polling) return;
    const interval = setInterval(async () => {
      console.log("Checking registration...");
      const results = await Promise.all(
        refs.map(async (num) => {
          if (!num || num.length !== 10) return "";
          const res = await checkNewOrExisting(num);
          return res === "exists" ? "registered" : "pending";
        }),
      );
      setStatus(results);
      const allRegistered = results.every((s) => s === "registered");
      if (allRegistered) {
        localStorage.setItem(AWARDED_POINTS_KEY, "100");
        // ✅ instead of setClaimAvailable
        onPointsChange?.(100);
        setPolling(false);
        alert("🎉 All 3 users registered! You can claim coins.");
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [polling, refs, AWARDED_POINTS_KEY, checkNewOrExisting, onPointsChange]);

  // ---------- UI helpers ----------
  const inputDisabledGlobal = consumed;
  const renderIcon = (s) => {
    if (s === "checking")
      return (
        <span style={{ fontSize: 12, position: "absolute", right: 8 }}>…</span>
      );
    if (s === "eligible")
      return (
        <span
          title="New number (eligible)"
          style={{
            color: "#0ea5e9",
            fontSize: 16,
            position: "absolute",
            right: 8,
          }}
        >
          ✔
        </span>
      );
    if (s === "registered")
      return (
        <span
          title="User registered (locked)"
          style={{
            color: "green",
            fontSize: 16,
            position: "absolute",
            right: 8,
          }}
        >
          ✔
        </span>
      );
    if (s === "not-registered-yet" || s === "exists" || s === "invalid")
      return (
        <span
          title={
            s === "not-registered-yet"
              ? "Not registered yet"
              : "Invalid or existing user"
          }
          style={{ color: "red", fontSize: 16, position: "absolute", right: 8 }}
        >
          ✖
        </span>
      );
    return null;
  };

  return (
    <div>
      {/* Optional badge trigger — hidden by default on profile */}
      {showTrigger && (
        <button
          type="button"
          className={badgeClassName}
          title="Redeem Coins"
          aria-label="Redeem Coins"
          onClick={() => setOpen(true)}
          style={{
            marginTop: 0,
            border: "none",
            background: "transparent",
            padding: 0,
          }}
        >
          <span style={{ display: "inline-flex" }}>{0}</span>
        </button>
      )}

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="redeem-title"
        style={{
          position: "fixed",
          inset: 0,
          display: open ? "flex" : "none",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1055,
          background: "rgba(0,0,0,0.3)",
        }}
      >
        <div
          role="document"
          style={{
            background: "#fff",
            width: "100%",
            maxWidth: 520,
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px",
              borderBottom: "1px solid #f3f4f6",
            }}
          >
            <RedeemIcon fontSize="small" />
            <h2
              id="redeem-title"
              style={{ fontSize: 16, margin: 0, fontWeight: 600 }}
            >
              Referral Offer
            </h2>
            {/* We allow closing manually, but will re-open on hydrate if needed */}
            <button
              type="button"
              aria-label="Close"
              onClick={closeDialog}
              style={{
                marginLeft: "auto",
                backgroundColor: "red",
                color: "white",
                border: "none",
                fontSize: 18,
                cursor: "pointer",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
          </div>
          <div style={{ padding: 10 }}>
            <div className="offer-line">
              <span className="offer-text">
                🎉 Invite <b>3 New Friends</b> - Get <b>₹100</b> after they
                Register 🎉
              </span>
            </div>
            {[0, 1, 2].map((i) => {
              const v = refs[i];
              const s = status[i];
              const isLockedField = s === "registered" || inputDisabledGlobal;
              const isInvalid = s === "invalid" || s === "exists";
              const border =
                s === "registered"
                  ? "1px solid green"
                  : s === "eligible"
                    ? "1px solid #16a34a"
                    : isInvalid || s === "not-registered-yet"
                      ? "1px solid red"
                      : s === "checking"
                        ? "1px dashed #9ca3af"
                        : "1px solid #e5e7eb";

              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    marginBottom: errors[i] ? 18 : 8,
                    position: "relative",
                    width: "100%",
                    maxWidth: 320,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      position: "relative",
                    }}
                  >
                    <input
                      id={`ref-${i}`}
                      type="text"
                      inputMode="numeric"
                      placeholder={`Enter Your Friend or Relative Phone Number ${i + 1}`}
                      value={v}
                      onChange={(e) => handlePhoneChange(i, e.target.value)}
                      maxLength={10}
                      readOnly={isLockedField}
                      style={{
                        flex: 1,
                        padding: "8px",
                        background: isLockedField ? "#f8fafc" : "white",
                        cursor: isLockedField ? "not-allowed" : "text",
                        border,
                        borderRadius: 6,
                        fontSize: 13,
                      }}
                    />
                    {renderIcon(s)}
                  </div>

                  {errors[i] && (
                    <p style={{ color: "red", fontSize: 12 }}>{errors[i]}</p>
                  )}
                  {s === "registered" && !inputDisabledGlobal && (
                    <p style={{ color: "#16a34a", fontSize: 12 }}>
                      Registered ✅ (locked)
                    </p>
                  )}
                  {/* {s === "not-registered-yet" && !inputDisabledGlobal && (
                    <p style={{ color: "#dc2626", fontSize: 12 }}>
                      Not registered yet — we’ll keep checking.
                    </p>
                  )} */}
                </div>
              );
            })}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
              padding: "12px",
              borderTop: "1px solid #f3f4f6",
            }}
          >
            <div>
              <div
                className="text-danger blinking-text"
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                🎉 Limited Time Only — Don’t miss it 🎁
              </div>
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={closeDialog}
                // disabled={inputDisabledGlobal}
              >
                Close
              </button>
            </div>
            <button
              type="button"
              className="btn btn-success"
              onClick={handleRedeem}
              disabled={!canInvite || submitting}
              aria-disabled={!canInvite || submitting}
            >
              Invite
            </button>
          </div>
        </div>
      </div>
      <style>{`
        .redeem-badge {
          position: relative;
          background: #d4af37;
          color: #000;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          overflow: hidden;
          box-shadow: 0 0 10px #ffd700;
          animation: glowPulse 1.5s infinite ease-in-out;
        }
        .redeem-badge::before {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            120deg,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0.4) 50%,
            rgba(255,255,255,0) 100%
          );
          transform: rotate(45deg) translateX(-120%);
          animation: sparkleSweep 2.5s infinite;
        }
        @keyframes sparkleSweep {
          0%   { transform: rotate(45deg) translateX(-120%); }
          100% { transform: rotate(45deg) translateX(120%);  }
        }
        @keyframes glowPulse {
          0%   { box-shadow: 0 0 5px #d4af37, 0 0 10px #d4af37, 0 0 20px #d4af37; transform: scale(1); }
          50%  { box-shadow: 0 0 15px #ffd700, 0 0 30px #ffd700, 0 0 50px #ffd700; transform: scale(1.07); }
          100% { box-shadow: 0 0 5px #d4af37, 0 0 10px #d4af37, 0 0 20px #d4af37; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default ReedemCode;
