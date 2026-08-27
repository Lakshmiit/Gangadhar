import React, { useState, useRef, useEffect } from "react";
import {
  CloudUploadOutlined,
  CloseRounded,
  ExpandMoreRounded,
  CheckRounded,
  ApartmentRounded,
  DescriptionRounded,
  ReceiptLongRounded,
  BadgeRounded,
  PlaceRounded,
  LockRounded,
  StorefrontRounded,
  AutorenewRounded,
  VerifiedRounded,
  PictureAsPdfRounded,
} from "@mui/icons-material";

const zoneData = {
  A: ["530001", "530002", "530003", "530004"],
  B: ["530005", "530013", "530016", "530020", "530024", "530022", "530017"],
  C: ["530007", "530008", "530009", "530012", "530018"],
  D: ["530011", "530031", "530029", "530026", "530032", "530049"],
  E: ["530027", "530028", "530040"],
  F: ["530014", "530041", "530043", "530045", "530048"],
  G: ["531162", "531163", "531173"],
};

const PINCODES = Object.values(zoneData).flat();

export default function MartRegistration() {
  const [form, setForm] = useState({
    fullName: "",
    address: "",
    phone: "",
    userName: "",
    password: "",
    storeName: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeSection, setActiveSection] = useState("owner");

  // Shop logo
  const [pendingLogo, setPendingLogo] = useState(null);
  const [companyLogo, setCompanyLogo] = useState(null);
  const logoInputRef = useRef(null);

  // Registration certificate (optional, single file)
  const [regPending, setRegPending] = useState(null);
  const [regFile, setRegFile] = useState(null);
  const regRef = useRef(null);

  // GST certificate (required, single file)
  const [gstPending, setGSTPending] = useState(null);
  const [gstFile, setGSTFile] = useState(null);
  const gstRef = useRef(null);

  // Aadhar card (required, single file)
  const [aadharPending, setAadharPending] = useState(null);
  const [aadharFile, setAadharFile] = useState(null);
  const aadharRef = useRef(null);

  // Delivery zones
  const [pincodeOpen, setPincodeOpen] = useState(false);
  const [expandedZone, setExpandedZone] = useState(null);
  const [selectedPincodes, setSelectedPincodes] = useState([]);
  const dropdownRef = useRef(null);

  const sectionRefs = {
    owner: useRef(null),
    documents: useRef(null),
    coverage: useRef(null),
    access: useRef(null),
  };

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const ACCEPTED_DOC_TYPE = (f) =>
    f.type.startsWith("image/") || f.type === "application/pdf";

  const readAsDataUrl = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) =>
        resolve({
          url: e.target.result,
          name: file.name,
          type: file.type,
          id: `${Date.now()}-${Math.random()}`,
        });
      reader.readAsDataURL(file);
    });

  const makePicker = (setPending) => (fileList) => {
    const file = Array.from(fileList || []).find(ACCEPTED_DOC_TYPE);
    if (!file) return;
    readAsDataUrl(file).then(setPending);
  };

  const pickReg = makePicker(setRegPending);
  const pickGST = makePicker(setGSTPending);
  const pickAadhar = makePicker(setAadharPending);

  const uploadReg = () => {
    if (!regPending) return;
    setRegFile(regPending);
    setRegPending(null);
    setErrors((er) => ({ ...er, documents: undefined }));
  };
  const uploadGST = () => {
    if (!gstPending) return;
    setGSTFile(gstPending);
    setGSTPending(null);
    setErrors((er) => ({ ...er, gst: undefined }));
  };
  const uploadAadhar = () => {
    if (!aadharPending) return;
    setAadharFile(aadharPending);
    setAadharPending(null);
    setErrors((er) => ({ ...er, aadhar: undefined }));
  };

  const pickLogo = (fileList) => {
    const file = Array.from(fileList || []).find((f) =>
      f.type.startsWith("image/"),
    );
    if (!file) return;
    readAsDataUrl(file).then(setPendingLogo);
  };
  const uploadLogo = () => {
    if (!pendingLogo) return;
    setCompanyLogo(pendingLogo);
    setPendingLogo(null);
    setErrors((er) => ({ ...er, companyLogo: undefined }));
  };

  const togglePincode = (pin) => {
    setSelectedPincodes((prev) =>
      prev.includes(pin) ? prev.filter((p) => p !== pin) : [...prev, pin],
    );
    setErrors((er) => ({ ...er, pincode: undefined }));
  };
  const selectAllPincodes = () => {
    setSelectedPincodes((prev) =>
      prev.length === PINCODES.length ? [] : PINCODES,
    );
  };
  const selectedZones = Object.entries(zoneData)
    .filter(([, pins]) => pins.some((p) => selectedPincodes.includes(p)))
    .map(([zone]) => zone);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setPincodeOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  /* ---------------------------- validation ---------------------------- */

  const ownerComplete =
    !!form.fullName.trim() && !!form.address.trim() && !!form.storeName.trim();
  const documentsComplete = !!gstFile && !!aadharFile;
  const coverageComplete = selectedPincodes.length > 0;
  const accessComplete =
    /^\d{10}$/.test(form.phone.trim()) &&
    !!form.userName.trim() &&
    !!form.password.trim();

  const stamps = [
    {
      id: "owner",
      label: "Owner & Shop",
      icon: StorefrontRounded,
      done: ownerComplete,
    },
    {
      id: "documents",
      label: "Documents",
      icon: DescriptionRounded,
      done: documentsComplete,
    },
    {
      id: "coverage",
      label: "Coverage Area",
      icon: PlaceRounded,
      done: coverageComplete,
    },
    {
      id: "access",
      label: "Account Access",
      icon: LockRounded,
      done: accessComplete,
    },
  ];
  const doneCount = stamps.filter((s) => s.done).length;

  const scrollTo = (id) => {
    setActiveSection(id);
    sectionRefs[id]?.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const validate = () => {
    const er = {};
    if (!form.fullName.trim()) er.fullName = "First name is required";
    if (!form.address.trim()) er.address = "Address is required";
    if (!form.storeName.trim()) er.storeName = "Store name is required";
    if (!gstFile) er.gst = "Upload your GST certificate";
    if (!aadharFile) er.aadhar = "Upload your Aadhar card";
    if (selectedPincodes.length === 0)
      er.pincode = "Select at least one pincode";
    if (!/^\d{10}$/.test(form.phone.trim()))
      er.phone = "Enter a valid 10-digit phone number";
    if (!form.userName.trim()) er.userName = "Username is required";
    if (!form.password.trim()) er.password = "Password is required";
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const handleRegister = async () => {
    if (loading) return;
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        id: "",
        date: new Date().toISOString(),
        vendorId: "",
        fullName: form.fullName,
        address: form.address,
        storeName: form.storeName,
        registrationCertificate: regFile ? regFile.url : "",
        gst: gstFile ? gstFile.url : "",
        aadharCard: aadharFile ? aadharFile.url : "",
        zipCode: selectedPincodes.join(","),
        mobileNumber: form.phone,
        userName: form.userName,
        password: form.password,
      };

      const response = await fetch(
        "https://localhost:7091/api/VendorRegistration/UploadVendorDetails",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        let detail = "";
        try {
          detail = await response.text();
        } catch {}
        throw new Error(
          `Server responded ${response.status} ${response.statusText}${detail ? ` — ${detail}` : ""}`,
        );
      }
      await response.json();

      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    } catch (error) {
      console.error(error);
      const message =
        error instanceof TypeError
          ? "Could not reach the server. Check that the API is running, the URL is correct, and CORS is enabled."
          : error.message || "Registration failed. Please try again.";
      setErrors((er) => ({ ...er, submit: message }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vr-root">
      <div className="vr-shell">
        {/* Masthead */}
        <div className="vr-mast">
          <div>
            <p className="vr-mast-eyebrow">Vendor Onboarding Ledger</p>
            <h1>Mart Registration</h1>
            <p>
              List your shop for local delivery. Complete every entry below —
              each section is verified and stamped as you go.
            </p>
          </div>
          <div className="vr-mast-badge">
            <VerifiedRounded style={{ fontSize: 15 }} />
            {doneCount}/4 entries stamped
          </div>
        </div>

        {/* Mobile stepper */}
        <div className="vr-mobile-steps">
          {stamps.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`vr-mobile-chip${s.done ? " done" : ""}`}
              onClick={() => scrollTo(s.id)}
            >
              {s.done ? (
                <CheckRounded style={{ fontSize: 12 }} />
              ) : (
                <s.icon style={{ fontSize: 12 }} />
              )}
              {s.label}
            </button>
          ))}
        </div>

        <div className="vr-grid">
          {/* Ledger rail */}
          <aside className="vr-rail">
            <p className="vr-rail-title">Registration entries</p>
            {stamps.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`vr-stamp-row${activeSection === s.id ? " active" : ""}`}
                onClick={() => scrollTo(s.id)}
              >
                <span className={`vr-stamp-circle${s.done ? " done" : ""}`}>
                  {s.done ? (
                    <CheckRounded style={{ fontSize: 16 }} />
                  ) : (
                    <s.icon style={{ fontSize: 15 }} />
                  )}
                </span>
                <span className="vr-stamp-label">
                  <b>{s.label}</b>
                  <span>{s.done ? "Complete" : "Pending"}</span>
                </span>
              </button>
            ))}
            <div className="vr-rail-progress">
              <div
                className="vr-rail-progress-fill"
                style={{ width: `${(doneCount / stamps.length) * 100}%` }}
              />
            </div>
            <p className="vr-rail-count">
              {doneCount} of {stamps.length} stamped
            </p>
          </aside>

          {/* Paper form */}
          <div className="vr-paper">
            <div className="vr-perforation" />

            {/* Entry 01 — Owner & Shop */}
            <section
              className="vr-section"
              ref={sectionRefs.owner}
              onMouseEnter={() => setActiveSection("owner")}
            >
              <div className="vr-section-head">
                <span className="vr-entry-no">Entry 01</span>
                <h2>Owner &amp; shop details</h2>
              </div>

              <div className="vr-field-grid">
                <Field
                  label="Owner's first name"
                  required
                  error={errors.fullName}
                >
                  <input
                    className={`vr-input${errors.fullName ? " vr-error-input" : ""}`}
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={form.fullName}
                    onChange={handleChange("fullName")}
                  />
                </Field>
                <Field label="Store name" required error={errors.storeName}>
                  <input
                    className={`vr-input${errors.storeName ? " vr-error-input" : ""}`}
                    type="text"
                    placeholder="e.g. Ramesh General Store"
                    value={form.storeName}
                    onChange={handleChange("storeName")}
                  />
                </Field>
                <Field
                  label="Shop address"
                  required
                  error={errors.address}
                  span2
                >
                  <textarea
                    className={`vr-textarea${errors.address ? " vr-error-input" : ""}`}
                    placeholder="Shop no, street, area, city"
                    value={form.address}
                    onChange={handleChange("address")}
                    rows={3}
                  />
                </Field>

                <Field
                  label="Shop logo (optional)"
                  Tag
                  error={errors.companyLogo}
                  span2
                >
                  <div className="vr-logo-row">
                    <div
                      className="vr-logo-slot"
                      onClick={() => logoInputRef.current?.click()}
                    >
                      {companyLogo ? (
                        <img src={companyLogo.url} alt="Shop logo" />
                      ) : pendingLogo ? (
                        <img
                          src={pendingLogo.url}
                          alt="Selected logo"
                          style={{ opacity: 0.6 }}
                        />
                      ) : (
                        <ApartmentRounded
                          style={{ fontSize: 24, color: "var(--ink-soft)" }}
                        />
                      )}
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => {
                          pickLogo(e.target.files);
                          e.target.value = "";
                        }}
                      />
                    </div>
                    <div className="vr-logo-actions">
                      <span className="vr-hint">
                        {companyLogo
                          ? "Logo attached — click the tile to replace it."
                          : "Square image works best, under 2MB."}
                      </span>
                      {pendingLogo && (
                        <button
                          type="button"
                          className="vr-btn vr-btn-upload"
                          style={{ padding: "8px 16px" }}
                          onClick={uploadLogo}
                        >
                          Attach logo
                        </button>
                      )}
                    </div>
                  </div>
                </Field>
              </div>
            </section>

            {/* Entry 02 — Documents */}
            <section
              className="vr-section"
              ref={sectionRefs.documents}
              onMouseEnter={() => setActiveSection("documents")}
            >
              <div className="vr-section-head">
                <span className="vr-entry-no">Entry 02</span>
                <h2>Verification documents</h2>
              </div>

              <UploadBlock
                icon={DescriptionRounded}
                title="Vendor registration certificate (optional)"
                error={errors.documents}
                inputRef={regRef}
                onPick={pickReg}
                pending={regPending}
                uploaded={regFile}
                onUpload={uploadReg}
                onRemovePending={() => setRegPending(null)}
                onRemoveUploaded={() => setRegFile(null)}
              />

              <UploadBlock
                icon={ReceiptLongRounded}
                title="GST certificate"
                error={errors.gst}
                inputRef={gstRef}
                onPick={pickGST}
                pending={gstPending}
                uploaded={gstFile}
                onUpload={uploadGST}
                onRemovePending={() => setGSTPending(null)}
                onRemoveUploaded={() => setGSTFile(null)}
              />

              <UploadBlock
                icon={BadgeRounded}
                title="Aadhar card"
                error={errors.aadhar}
                inputRef={aadharRef}
                onPick={pickAadhar}
                pending={aadharPending}
                uploaded={aadharFile}
                onUpload={uploadAadhar}
                onRemovePending={() => setAadharPending(null)}
                onRemoveUploaded={() => setAadharFile(null)}
              />
            </section>

            {/* Entry 03 — Coverage */}
            <section
              className="vr-section"
              ref={sectionRefs.coverage}
              onMouseEnter={() => setActiveSection("coverage")}
            >
              <div className="vr-section-head">
                <span className="vr-entry-no">Entry 03</span>
                <h2>Delivery coverage area</h2>
              </div>

              <Field
                label="Pincodes you deliver to"
                required
                error={errors.pincode}
              >
                <div ref={dropdownRef} className="vr-pincode-wrap">
                  <button
                    type="button"
                    className="vr-pincode-trigger"
                    onClick={() => setPincodeOpen((o) => !o)}
                  >
                    <span>
                      {selectedPincodes.length > 0
                        ? `${selectedPincodes.length} pincode${selectedPincodes.length > 1 ? "s" : ""} selected`
                        : "Select pincodes by zone"}
                    </span>
                    <ExpandMoreRounded
                      style={{
                        fontSize: 18,
                        transform: pincodeOpen
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: ".2s",
                        color: "var(--ink-soft)",
                      }}
                    />
                  </button>

                  {pincodeOpen && (
                    <div className="vr-pincode-menu">
                      <div
                        className="vr-pincode-option"
                        onClick={selectAllPincodes}
                      >
                        <Checkbox
                          checked={selectedPincodes.length === PINCODES.length}
                        />
                        <span>Select all zones</span>
                      </div>
                      <div className="vr-pincode-divider" />
                      {Object.entries(zoneData).map(([zone, pins]) => (
                        <div key={zone}>
                          <div
                            className="vr-zone-header"
                            onClick={() =>
                              setExpandedZone(
                                expandedZone === zone ? null : zone,
                              )
                            }
                          >
                            <span>
                              Zone {zone} · {pins.length} pincodes
                            </span>
                            <ExpandMoreRounded
                              style={{
                                fontSize: 14,
                                transform:
                                  expandedZone === zone
                                    ? "rotate(180deg)"
                                    : "rotate(0deg)",
                                transition: ".2s",
                              }}
                            />
                          </div>
                          {expandedZone === zone &&
                            pins.map((pin) => (
                              <div
                                key={pin}
                                className="vr-pincode-option"
                                onClick={() => togglePincode(pin)}
                              >
                                <Checkbox
                                  checked={selectedPincodes.includes(pin)}
                                />
                                <span>{pin}</span>
                              </div>
                            ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedZones.length > 0 && (
                  <div className="vr-zone-chips">
                    {selectedZones.map((z) => (
                      <span key={z} className="vr-zone-chip">
                        Zone {z}
                      </span>
                    ))}
                  </div>
                )}
              </Field>
            </section>

            {/* Entry 04 — Account access */}
            <section
              className="vr-section"
              ref={sectionRefs.access}
              onMouseEnter={() => setActiveSection("access")}
            >
              <div className="vr-section-head">
                <span className="vr-entry-no">Entry 04</span>
                <h2>Account access</h2>
              </div>

              <div className="vr-field-grid">
                <Field label="Mobile number" required error={errors.phone}>
                  <input
                    className={`vr-input${errors.phone ? " vr-error-input" : ""}`}
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={form.phone}
                    onChange={handleChange("phone")}
                    maxLength={10}
                  />
                </Field>
                <Field label="Username" required error={errors.userName}>
                  <input
                    className={`vr-input${errors.userName ? " vr-error-input" : ""}`}
                    type="text"
                    placeholder="Choose a username"
                    value={form.userName}
                    onChange={handleChange("userName")}
                  />
                </Field>
                <Field label="Password" required error={errors.password} span2>
                  <input
                    className={`vr-input${errors.password ? " vr-error-input" : ""}`}
                    type="password"
                    placeholder="Create a password"
                    value={form.password}
                    onChange={handleChange("password")}
                  />
                </Field>
              </div>
            </section>

            {submitted && (
              <div className="vr-success-banner">
                <CheckRounded style={{ fontSize: 16 }} />
                Registration submitted — your ledger entry is being reviewed.
              </div>
            )}

            <div className="vr-submit-row">
              <span className="vr-submit-note">
                {errors.submit ? (
                  <span className="vr-submit-error">{errors.submit}</span>
                ) : (
                  "All four entries must be stamped before your mart goes live."
                )}
              </span>
              <button
                type="button"
                className="vr-btn vr-btn-primary vr-submit-btn"
                onClick={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <AutorenewRounded
                      style={{
                        fontSize: 16,
                        animation: "vr-spin 0.8s linear infinite",
                      }}
                    />
                    Submitting…
                  </>
                ) : (
                  "Submit registration"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes vr-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Small pieces                                                      */
/* ------------------------------------------------------------------ */

function Field({ label, required, optionalTag, error, children, span2 }) {
  return (
    <div className={`vr-field${span2 ? " vr-span-2" : ""}`}>
      <label className="vr-label">
        {label}
        {required && <span className="vr-required">*</span>}
        {optionalTag && <span className="vr-optional-tag">optional</span>}
      </label>
      {children}
      {error && <span className="vr-error-text">{error}</span>}
    </div>
  );
}

function Checkbox({ checked }) {
  return (
    <div className={`vr-checkbox${checked ? " checked" : ""}`}>
      {checked && <CheckRounded style={{ fontSize: 13, color: "#12241f" }} />}
    </div>
  );
}

function DocThumb({ file, tone, onRemove, removeLabel }) {
  const isPdf = file.type === "application/pdf";
  return (
    <div className={`vr-thumb${tone === "pending" ? " pending" : ""}`}>
      {isPdf ? (
        <div className="vr-thumb-pdf">
          <PictureAsPdfRounded style={{ fontSize: 22 }} />
        </div>
      ) : (
        <img src={file.url} alt={file.name} />
      )}
      <button
        type="button"
        className="vr-thumb-remove"
        onClick={onRemove}
        aria-label={removeLabel}
      >
        <CloseRounded style={{ fontSize: 11 }} />
      </button>
    </div>
  );
}

function UploadBlock({
  icon: Icon,
  title,
  optional,
  error,
  inputRef,
  onPick,
  pending,
  uploaded,
  onUpload,
  onRemovePending,
  onRemoveUploaded,
}) {
  return (
    <div className="vr-upload-block">
      <div className="vr-upload-title">
        <Icon style={{ fontSize: 16, color: "var(--ink-soft)" }} />
        {title}
        {optional ? (
          <span className="vr-optional-tag">optional</span>
        ) : (
          <span className="vr-required">*</span>
        )}
      </div>

      {!uploaded && (
        <div className="vr-upload-row">
          <div
            className="vr-upload-box"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              onPick(e.dataTransfer.files);
            }}
          >
            <span className="vr-upload-icon">
              <CloudUploadOutlined style={{ fontSize: 17 }} />
            </span>
            <span className="vr-upload-text">
              <b>Click or drag a file here</b>
              One image or PDF only
            </span>
            <input
              ref={inputRef}
              type="file"
              accept="image/*,application/pdf"
              hidden
              onChange={(e) => {
                onPick(e.target.files);
                e.target.value = "";
              }}
            />
          </div>
          <button
            type="button"
            className="vr-btn vr-btn-upload"
            disabled={!pending}
            onClick={onUpload}
          >
            Attach
          </button>
        </div>
      )}

      {error && <span className="vr-error-text">{error}</span>}

      {pending && !uploaded && (
        <div>
          <p className="vr-thumb-label">Ready to attach — {pending.name}</p>
          <div className="vr-thumb-grid">
            <DocThumb
              file={pending}
              tone="pending"
              onRemove={onRemovePending}
              removeLabel="Remove selected file"
            />
          </div>
        </div>
      )}

      {uploaded && (
        <div>
          <p className="vr-thumb-label">Attached — {uploaded.name}</p>
          <div className="vr-thumb-grid">
            <DocThumb
              file={uploaded}
              onRemove={onRemoveUploaded}
              removeLabel="Remove attached file"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// import React, { useState, useRef } from "react";
// import { Upload, X, ChevronDown, Check, Building2 } from "lucide-react";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "./App.css";
// import Header from "./Header.js";
// import Footer from "./Footer.js";
// import { Password } from "@mui/icons-material";
// import { useNavigate } from "react-router-dom";

// const zoneData = {
//   A: ["530001", "530002", "530003", "530004"],
//   B: ["530005", "530013", "530016", "530020", "530024", "530022", "530017"],
//   C: ["530007", "530008", "530009", "530012", "530018"],
//   D: ["530011", "530031", "530029", "530026", "530032", "530049"],
//   E: ["530027", "530028", "530040"],
//   F: ["530014", "530041", "530043", "530045", "530048"],
//   G: ["531162", "531163", "531173"],
// };

// const PINCODES = Object.values(zoneData).flat();
// const MartRegistration = () => {
//   const [form, setForm] = useState({
//     fullName: "",
//     //lastName: "",
//     address: "",
//     phone: "",
//     userName: "",
//     password: "",
//     //email: "",
//     storeName: "",
//   });

//   // Document photos: files picked but not yet "uploaded", vs confirmed/uploaded images
//   const [pendingDocs, setPendingDocs] = useState([]);
//   const [images, setImages] = useState([]);

//   const [loading, setLoading] = useState(false);

//   // Company logo: picked but not yet uploaded, vs confirmed
//   const [pendingLogo, setPendingLogo] = useState(null);
//   const [companyLogo, setCompanyLogo] = useState(null);

//   const [pincodeOpen, setPincodeOpen] = useState(false);
//   const [selectedPincodes, setSelectedPincodes] = useState([]);
//   const [errors, setErrors] = useState({});
//   const [submitted, setSubmitted] = useState(false);

//   const docsInputRef = useRef(null);
//   const logoInputRef = useRef(null);
//   const dropdownRef = useRef(null);

//   const navigate = useNavigate();

//   const handleChange = (field) => (e) => {
//     setForm((f) => ({ ...f, [field]: e.target.value }));
//     setErrors((er) => ({ ...er, [field]: undefined }));
//   };

//   //const [expandedZones, setExpandedZones] = useState({});

//   const [expandedZone, setExpandedZone] = useState(null);
//   const toggleZone = (zone) => {
//     setExpandedZone((prev) => ({
//       ...prev,
//       [zone]: !prev[zone],
//     }));
//   };
//   const gstRef = useRef(null);

//   const [gstPending, setGSTPending] = useState([]);
//   const [gstImages, setGSTImages] = useState([]);

//   const [aadharPending, setAadharPending] = useState([]);
//   const [aadharImages, setAadharImages] = useState([]);

//   const readAsDataUrl = (file) =>
//     new Promise((resolve) => {
//       const reader = new FileReader();
//       reader.onload = (e) =>
//         resolve({
//           url: e.target.result,
//           name: file.name,
//           id: `${Date.now()}-${Math.random()}`,
//         });
//       reader.readAsDataURL(file);
//     });

//   const selectAllPincodes = () => {
//     if (selectedPincodes.length === PINCODES.length) {
//       setSelectedPincodes([]);
//     } else {
//       setSelectedPincodes(PINCODES);
//     }
//   };

//   const selectedZones = Object.entries(zoneData)
//     .filter(([_, pins]) => pins.some((pin) => selectedPincodes.includes(pin)))
//     .map(([zone]) => `Zone ${zone}`);

//   const triggerText =
//     selectedZones.length === 0
//       ? "Select pincode by zone"
//       : selectedZones.join(", ");

//   // ---- Document photos flow: pick -> preview as "pending" -> click Upload to confirm ----
//   const handlePickDocs = (fileList) => {
//     const files = Array.from(fileList).filter((f) =>
//       f.type.startsWith("image/"),
//     );
//     Promise.all(files.map(readAsDataUrl)).then((results) => {
//       setPendingDocs((prev) => [...prev, ...results]);
//     });
//   };

//   const handleRegistrationPick = (files) => {
//     if (!files || files.length === 0) return;

//     const newFiles = Array.from(files).map((file) => ({
//       id: Date.now() + Math.random(),
//       file,
//       name: file.name,
//       url: URL.createObjectURL(file),
//     }));

//     setPendingDocs((prev) => [...prev, ...newFiles]);
//   };

//   const uploadRegistration = () => {
//     if (pendingDocs.length === 0) return;
//     setRegistrationImages((prev) => [...prev, ...pendingDocs]);
//     setPendingDocs([]);
//   };

//   const handleGSTPick = (files) => {
//     const list = Array.from(files).map((file) => ({
//       id: Date.now() + Math.random(),
//       file,
//       name: file.name,
//       url: URL.createObjectURL(file),
//     }));

//     setGSTPending((prev) => [...prev, ...list]);
//   };

//   const uploadGST = () => {
//     setGSTImages((prev) => [...prev, ...gstPending]);
//     setGSTPending([]);
//   };

//   const handleAadharPick = (files) => {
//     const list = Array.from(files).map((file) => ({
//       id: Date.now() + Math.random(),
//       file,
//       name: file.name,
//       url: URL.createObjectURL(file),
//     }));

//     setAadharPending((prev) => [...prev, ...list]);
//   };
//   const uploadAadhar = () => {
//     setAadharImages((prev) => [...prev, ...aadharPending]);
//     setAadharPending([]);
//   };

//   const removePendingDoc = (id) => {
//     setPendingDocs((prev) => prev.filter((img) => img.id !== id));
//   };

//   const removeUploadedDoc = (id) => {
//     setImages((prev) => prev.filter((img) => img.id !== id));
//   };

//   // ---- Company logo flow: pick -> preview as "pending" -> click Upload to confirm ----
//   const handlePickLogo = (fileList) => {
//     const file = Array.from(fileList).find((f) => f.type.startsWith("image/"));
//     if (!file) return;
//     readAsDataUrl(file).then((result) => setPendingLogo(result));
//   };

//   const uploadLogo = () => {
//     if (!pendingLogo) return;
//     setCompanyLogo(pendingLogo);
//     setPendingLogo(null);
//     setErrors((er) => ({ ...er, companyLogo: undefined }));
//   };

//   const removeCompanyLogo = () => {
//     setCompanyLogo(null);
//   };

//   // ---- Pincode dropdown ----
//   const togglePincode = (pin) => {
//     setSelectedPincodes((prev) =>
//       prev.includes(pin) ? prev.filter((p) => p !== pin) : [...prev, pin],
//     );
//     setErrors((er) => ({ ...er, pincode: undefined }));
//   };

//   React.useEffect(() => {
//     const onClickOutside = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//         setPincodeOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", onClickOutside);
//     return () => document.removeEventListener("mousedown", onClickOutside);
//   }, []);

//   const validate = () => {
//     const er = {};

//     if (!(form.fullName || "").trim()) er.fullName = "First name is required";

//     if (!(form.address || "").trim()) er.address = "Address is required";

//     if (images.length < 1) er.documents = "Upload at least one document";

//     if (selectedPincodes.length === 0)
//       er.pincode = "Select at least one pincode";

//     if (!/^\d{10}$/.test((form.phone || "").trim()))
//       er.phone = "Enter a valid 10-digit phone number";

//     if (!(form.storeName || "").trim()) er.storeName = "Store name is required";

//     if (!(form.userName || "").trim()) er.userName = "User Name is Required";

//     if (!(form.password || "").trim()) er.password = "Password is Required";

//     if (!companyLogo) er.companyLogo = "Upload your company logo";

//     setErrors(er);
//     return Object.keys(er).length === 0;
//   };

//   const [registrationImages, setRegistrationImages] = useState([]);

//   const [registrationPending, setRegistrationPending] = useState([]);

//   const registrationRef = useRef();

//   const aadharRef = useRef();

//   const removeGSTPending = (id) => {
//     setGSTPending((prev) => prev.filter((x) => x.id !== id));
//   };

//   const removeGSTImage = (id) => {
//     setGSTImages((prev) => prev.filter((x) => x.id !== id));
//   };

//   const removeAadharpending = (id) => {
//     setGSTPending((prev) => prev.filter((x) => x.id !== id));
//   };

//   const removeAadharimage = (id) => {
//     setGSTImages((prev) => prev.filter((x) => x.id !== id));
//   };

//   // const handleRegister = async () => {
//   //   // Stop if validation fails
//   //   // if (!validate()) {
//   //   //   return;
//   //   // }

//   //   setSubmitted(true);
//   //   setTimeout(() => setSubmitted(false), 3000);

//   //   try {
//   //     const payload = {
//   //       id: "",
//   //       date: new Date().toISOString(),
//   //       vendorId: "",
//   //       fullName: form.fullName,
//   //       address: form.address,
//   //       storeName: form.storeName,
//   //       registrationCertificate:
//   //         registrationImages.length > 0 ? registrationImages[0].url : "",
//   //       gst: gstImages.length > 0 ? gstImages[0].url : "",
//   //       aadharCard: aadharImages.length > 0 ? aadharImages[0].url : "",
//   //       zipCode: selectedPincodes.join(","),
//   //       mobileNumber: form.phone,
//   //       userName: form.userName,
//   //       password: form.password,
//   //     };

//   //     const response = await fetch(
//   //       "https://localhost:7091/api/VendorRegistration/UploadVendorDetails",
//   //       {
//   //         method: "POST",
//   //         headers: {
//   //           "Content-Type": "application/json",
//   //         },
//   //         body: JSON.stringify(payload),
//   //       },
//   //     );

//   //     if (!response.ok) {
//   //       throw new Error("Failed to register vendor.");
//   //     }

//   //     const result = await response.json();

//   //     console.log(result);

//   //     alert("Vendor Registered Successfully");

//   //     // Navigate after successful registration
//   //     navigate("/vendorlogin");
//   //   } catch (error) {
//   //     console.error(error);
//   //     alert("Registration Failed");
//   //   }
//   // };

//   const handleRegister = async () => {
//     if (loading) return; // Prevent duplicate clicks

//     setLoading(true);

//     try {
//       const payload = {
//         id: "",
//         date: new Date().toISOString(),
//         vendorId: "",
//         fullName: form.fullName,
//         address: form.address,
//         storeName: form.storeName,
//         registrationCertificate:
//           registrationImages.length > 0 ? registrationImages[0].url : "",
//         gst: gstImages.length > 0 ? gstImages[0].url : "",
//         aadharCard: aadharImages.length > 0 ? aadharImages[0].url : "",
//         zipCode: selectedPincodes.join(","),
//         mobileNumber: form.phone,
//         userName: form.userName,
//         password: form.password,
//       };

//       const response = await fetch(
//         "https://localhost:7091/api/VendorRegistration/UploadVendorDetails",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(payload),
//         },
//       );

//       if (!response.ok) {
//         throw new Error("Failed to register vendor.");
//       }

//       const result = await response.json();

//       console.log(result);

//       setSubmitted(true);

//       setTimeout(() => {
//         setSubmitted(false);
//       }, 3000);

//       alert("Vendor Registered Successfully");

//       navigate("/vendorlogin");
//     } catch (error) {
//       console.error(error);
//       alert("Registration Failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="mart-reg-page">
//       {/* Header */}
//       <Header className="mt-5" />

//       {/* Main content */}
//       <main className="mart-reg-main">
//         <div className="mart-reg-card">
//           <div className="mart-reg-card-head">
//             <h1 className="mart-reg-heading">Mart Registration</h1>
//             <p className="mart-reg-subheading">
//               All fields below are required. Fill them in to register your mart.
//             </p>
//           </div>

//           <div className="mart-reg-form-grid">
//             {/* First / Last name */}
//             <div className="mart-reg-field-row">
//               <Field label="First Name" required error={errors.fullName}>
//                 <input
//                   className="mart-reg-input"
//                   type="text"
//                   placeholder="e.g. Ramesh kumar"
//                   value={form.fullName}
//                   onChange={handleChange("fullName")}
//                 />
//               </Field>
//             </div>

//             {/* Address */}
//             <Field label="Address" required error={errors.address}>
//               <textarea
//                 className="mart-reg-input mart-reg-textarea"
//                 placeholder="Shop no, street, area, city"
//                 value={form.address}
//                 onChange={handleChange("address")}
//                 rows={3}
//               />
//             </Field>

//             {/* Vendor company name */}
//             <Field label="Store Name" required error={errors.storeName}>
//               <input
//                 className="mart-reg-input"
//                 type="text"
//                 placeholder="e.g. Ramesh General Store"
//                 value={form.storeName}
//                 onChange={handleChange("storeName")}
//               />
//             </Field>

//             {/* Upload Registration Certificate */}
//             <Field
//               label="Vendor Registration Certificate"
//               required
//               error={errors.documents}
//             >
//               <div className="mart-reg-upload-row">
//                 <div
//                   className="mart-reg-upload-box"
//                   onClick={() => registrationRef.current?.click()}
//                   onDragOver={(e) => e.preventDefault()}
//                   onDrop={(e) => {
//                     e.preventDefault();
//                     handleRegistrationPick(e.dataTransfer.files);
//                   }}
//                 >
//                   <Upload size={22} color="#6B7A6E" />

//                   <span className="mart-reg-upload-text">
//                     Click or drag to choose document photos
//                   </span>

//                   <input
//                     ref={registrationRef}
//                     type="file"
//                     accept="image/*"
//                     multiple
//                     hidden
//                     onChange={(e) => {
//                       console.log("Selected Files:", e.target.files);

//                       handleRegistrationPick(e.target.files);

//                       e.target.value = "";
//                     }}
//                   />
//                 </div>

//                 <button
//                   type="button"
//                   disabled={pendingDocs.length === 0}
//                   onClick={uploadRegistration}
//                 >
//                   Upload {pendingDocs.length > 0 && `(${pendingDocs.length})`}
//                 </button>
//               </div>

//               {/* Ready to Upload */}
//               {pendingDocs.length > 0 && (
//                 <>
//                   <span className="mart-reg-pending-label">
//                     Ready to upload:
//                   </span>

//                   <div className="mart-reg-thumb-grid">
//                     {pendingDocs.map((img) => (
//                       <div
//                         key={img.id}
//                         className="mart-reg-thumb-wrap mart-reg-thumb-pending"
//                       >
//                         <img
//                           src={img.url}
//                           alt={img.name}
//                           className="mart-reg-thumb-img"
//                         />

//                         <button
//                           type="button"
//                           className="mart-reg-thumb-remove"
//                           onClick={() => removePendingDoc(img.id)}
//                           aria-label="Remove selected image"
//                         >
//                           <X size={12} color="#fff" />
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 </>
//               )}

//               {/* Uploaded Images */}
//               {images.length > 0 && (
//                 <>
//                   <span className="mart-reg-pending-label">Uploaded:</span>

//                   <div className="mart-reg-thumb-grid">
//                     {images.map((img) => (
//                       <div key={img.id} className="mart-reg-thumb-wrap">
//                         <img
//                           src={img.url}
//                           alt={img.name}
//                           className="mart-reg-thumb-img"
//                         />

//                         <button
//                           type="button"
//                           className="mart-reg-thumb-remove"
//                           onClick={() => removeUploadedDoc(img.id)}
//                           aria-label="Remove uploaded image"
//                         >
//                           <X size={12} color="#fff" />
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 </>
//               )}
//             </Field>

//             {/* Upload GST Certificate */}

//             <Field label="Vendor GST Certificate" required>
//               <div className="mart-reg-upload-row">
//                 <div
//                   className="mart-reg-upload-box"
//                   onClick={() => gstRef.current.click()}
//                   onDragOver={(e) => e.preventDefault()}
//                   onDrop={(e) => {
//                     e.preventDefault();
//                     handleGSTPick(e.dataTransfer.files);
//                   }}
//                 >
//                   <Upload size={22} />

//                   <span>Click or drag to choose document photos</span>

//                   <input
//                     ref={gstRef}
//                     type="file"
//                     hidden
//                     multiple
//                     accept="image/*"
//                     onChange={(e) => {
//                       handleGSTPick(e.target.files);
//                       e.target.value = "";
//                     }}
//                   />
//                 </div>

//                 <button
//                   type="button"
//                   disabled={gstPending.length === 0}
//                   onClick={uploadGST}
//                 >
//                   Upload {gstPending.length > 0 && `(${gstPending.length})`}
//                 </button>
//               </div>

//               {gstPending.length > 0 && (
//                 <div className="mart-reg-thumb-grid">
//                   {gstPending.map((img) => (
//                     <div key={img.id} className="mart-reg-thumb-wrap">
//                       <img
//                         src={img.url}
//                         alt=""
//                         className="mart-reg-thumb-img"
//                       />

//                       <button
//                         type="button"
//                         onClick={() => removeGSTPending(img.id)}
//                       >
//                         <X size={12} />
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}

//               {gstImages.length > 0 && (
//                 <div className="mart-reg-thumb-grid">
//                   {gstImages.map((img) => (
//                     <div key={img.id} className="mart-reg-thumb-wrap">
//                       <img
//                         src={img.url}
//                         alt=""
//                         className="mart-reg-thumb-img"
//                       />

//                       <button
//                         type="button"
//                         onClick={() => removeGSTImage(img.id)}
//                       >
//                         <X size={12} />
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </Field>

//             {/* Update Aadhar Card */}

//             <Field label="Vendor Aadhar Card" required>
//               <div className="mart-reg-upload-row">
//                 <div
//                   className="mart-reg-upload-box"
//                   onClick={() => aadharRef.current.click()}
//                   onDragOver={(e) => e.preventDefault()}
//                   onDrop={(e) => {
//                     e.preventDefault();
//                     handleAadharPick(e.dataTransfer.files);
//                   }}
//                 >
//                   <Upload size={22} />

//                   <span>Click or drag to choose document photos</span>

//                   <input
//                     ref={aadharRef}
//                     type="file"
//                     hidden
//                     multiple
//                     accept="image/*"
//                     onChange={(e) => {
//                       handleAadharPick(e.target.files);
//                       e.target.value = "";
//                     }}
//                   />
//                 </div>

//                 <button
//                   type="button"
//                   disabled={aadharPending.length === 0}
//                   onClick={uploadAadhar}
//                 >
//                   Upload{" "}
//                   {aadharPending.length > 0 && `(${aadharPending.length})`}
//                 </button>
//               </div>

//               {aadharPending.length > 0 && (
//                 <div className="mart-reg-thumb-grid">
//                   {aadharPending.map((img) => (
//                     <div key={img.id} className="mart-reg-thumb-wrap">
//                       <img
//                         src={img.url}
//                         alt=""
//                         className="mart-reg-thumb-img"
//                       />

//                       <button
//                         type="button"
//                         onClick={() => removeAadharpending(img.id)}
//                       >
//                         <X size={12} />
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}

//               {aadharImages.length > 0 && (
//                 <div className="mart-reg-thumb-grid">
//                   {aadharImages.map((img) => (
//                     <div key={img.id} className="mart-reg-thumb-wrap">
//                       <img
//                         src={img.url}
//                         alt=""
//                         className="mart-reg-thumb-img"
//                       />

//                       <button
//                         type="button"
//                         onClick={() => removeAadharimage(img.id)}
//                       >
//                         <X size={12} />
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </Field>

//             {/* select zones*/}

//             <Field label="Available Pincodes" required error={errors.pincode}>
//               <div ref={dropdownRef} className="mart-reg-pincode-wrap">
//                 <button
//                   type="button"
//                   className="mart-reg-pincode-trigger"
//                   onClick={() => setPincodeOpen(!pincodeOpen)}
//                 >
//                   <span className="mart-reg-pincode-trigger-text">
//                     {selectedPincodes.length > 0
//                       ? `${selectedPincodes.length} Pincode(s) Selected`
//                       : "Select pincode by Zone wise"}
//                   </span>

//                   <ChevronDown
//                     size={18}
//                     style={{
//                       transform: pincodeOpen
//                         ? "rotate(180deg)"
//                         : "rotate(0deg)",
//                       transition: ".2s",
//                     }}
//                   />
//                 </button>

//                 {pincodeOpen && (
//                   <div className="mart-reg-pincode-menu">
//                     {/* Select All */}

//                     <div
//                       className="mart-reg-pincode-option"
//                       onClick={selectAllPincodes}
//                     >
//                       <Checkbox
//                         checked={selectedPincodes.length === PINCODES.length}
//                       />

//                       <span>Select All</span>
//                     </div>

//                     <div className="mart-reg-pincode-divider" />

//                     {Object.entries(zoneData).map(([zone, pins]) => (
//                       <div key={zone}>
//                         {/* Zone Header */}

//                         <div
//                           className="mart-reg-zone-header"
//                           onClick={() =>
//                             setExpandedZone(expandedZone === zone ? null : zone)
//                           }
//                         >
//                           <span>Zone {zone}</span>

//                           <ChevronDown
//                             size={15}
//                             style={{
//                               transform:
//                                 expandedZone === zone
//                                   ? "rotate(180deg)"
//                                   : "rotate(0deg)",
//                               transition: ".2s",
//                             }}
//                           />
//                         </div>

//                         {/* Pincodes */}

//                         {expandedZone === zone &&
//                           pins.map((pin) => (
//                             <div
//                               key={pin}
//                               className="mart-reg-pincode-option"
//                               onClick={() => togglePincode(pin)}
//                             >
//                               <Checkbox
//                                 checked={selectedPincodes.includes(pin)}
//                               />

//                               <span>{pin}</span>
//                             </div>
//                           ))}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </Field>

//             {/* Phone / Email */}
//             <div className="mart-reg-field-row">
//               <Field label="Mobile Number" required error={errors.phone}>
//                 <input
//                   className="mart-reg-input"
//                   type="tel"
//                   placeholder="10-digit mobile number"
//                   value={form.phone}
//                   onChange={handleChange("phone")}
//                   maxLength={10}
//                 />
//               </Field>

//               {/* Usrer name */}

//               <div className="mart-reg-field-row">
//                 <Field label="User Name" required error={errors.userName}>
//                   <input
//                     className="mart-reg-input"
//                     type="text"
//                     placeholder="enter username"
//                     value={form.userName}
//                     onChange={handleChange("userName")}
//                   />
//                 </Field>
//               </div>

//               {/*password*/}

//               <div className="mart-reg-field-row">
//                 <Field label="Password" required error={errors.password}>
//                   <input
//                     className="mart-reg-input"
//                     type="text"
//                     placeholder="Password"
//                     value={form.password}
//                     onChange={handleChange("password")}
//                   />
//                 </Field>
//               </div>
//             </div>

//             <div className="mart-reg-section-divider" />

//             {/* Login button */}
//             <button
//               className="login-btn"
//               type="button"
//               onClick={handleRegister}
//             >
//               Register
//             </button>
//             {/* <p className="mart-reg-success-text">
//               Registration submitted successfully.
//             </p> */}
//           </div>
//         </div>
//       </main>

//       {/* Footer */}
//       <Footer />
//     </div>
//   );
// };
// export default MartRegistration;

// function Field({ label, required, error, children }) {
//   return (
//     <div className="mart-reg-field">
//       <label className="mart-reg-label">
//         {label} {required && <span className="mart-reg-required-mark">*</span>}
//       </label>
//       {children}
//       {error && <span className="mart-reg-error-text">{error}</span>}
//     </div>
//   );
// }

// function Checkbox({ checked }) {
//   return (
//     <div className={`mart-reg-checkbox${checked ? " checked" : ""}`}>
//       {checked && <Check size={12} color="#fff" strokeWidth={3} />}
//     </div>
//   );
// }
