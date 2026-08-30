import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "./Sidebar";
import { Button, Modal } from "react-bootstrap";
import { Dashboard as MoreVertIcon } from "@mui/icons-material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// import { appConfig } from "./config";

const LakshmiCollectionDesigns = () => {
  const { id } = useParams();
  const { userId } = useParams();
  const { userType } = useParams();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [collectionData, setCollectionData] = useState(null);
  const [attachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [idx, setIdx] = useState(0);
  const [posting, setPosting] = useState(false);
  const [postMsg, setPostMsg] = useState("");
  const [selectedSize, setSelectedSize] = useState(null);
  const [sizeError, setSizeError] = useState("");
  const [zoomImage, setZoomImage] = useState("");
  const [media, setMedia] = useState([]);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [zoomType, setZoomType] = useState("image");
  const imgRef = useRef(null);
  const [magVisible, setMagVisible] = useState(false);
  const [magPos, setMagPos] = useState({ x: 0, y: 0 });
  const MAG_SIZE = 160;
  const MAG_ZOOM = 2.2;

  useEffect(() => {
    console.log(loading, err, postMsg);
  }, [loading, err, postMsg]);

  const handleImgMouseMove = (e) => {
    if (!imgRef.current) return;
    const bounds = imgRef.current.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;
    const clampedX = Math.max(0, Math.min(x, bounds.width));
    const clampedY = Math.max(0, Math.min(y, bounds.height));
    setMagPos({ x: clampedX, y: clampedY });
    setMagVisible(true);
  };

  const handleImgMouseLeave = () => setMagVisible(false);

  const isVideoFile = (name = "") => {
    const ext = name.split(".").pop()?.toLowerCase();
    return ["mp4", "webm", "ogg", "mov", "m4v"].includes(ext);
  };

  const guessVideoMime = (name = "") => {
    const ext = name.split(".").pop()?.toLowerCase();
    if (ext === "mp4" || ext === "m4v" || ext === "mov") return "video/mp4";
    if (ext === "webm") return "video/webm";
    if (ext === "ogg") return "video/ogg";
    return "video/*";
  };

  const extractBase64 = (payload) =>
    payload?.imageData ||
    payload?.videoData ||
    payload?.fileData ||
    payload?.data ||
    payload?.base64 ||
    null;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const fetchTicketData = async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch(
          `https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/UploadLakshmiCollection/GetLakshmiCollections?id=${id}`,
        );
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        if (cancelled) return;

        setCollectionData(data);
        const imgFiles = Array.isArray(data.images) ? data.images : [];
        const vidFiles = Array.isArray(data.videos) ? data.videos : [];

        const buildRequest = async (fileName) => {
          const r = await fetch(
            `https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/FileUpload/download?generatedfilename=${encodeURIComponent(
              fileName,
            )}`,
          );
          if (!r.ok) throw new Error("File fetch failed");
          const payload = await r.json();

          const b64 = extractBase64(payload);
          if (!b64) return null;

          const isVid = isVideoFile(fileName);
          const mime = isVid ? guessVideoMime(fileName) : "image/*";

          const dataUrl = b64.startsWith("data:")
            ? b64
            : `data:${mime};base64,${b64}`;

          return { fileName, dataUrl, type: isVid ? "video" : "image" };
        };

        const mediaResults = (
          await Promise.all([...imgFiles, ...vidFiles].map(buildRequest))
        ).filter(Boolean);

        if (!cancelled) setMedia(mediaResults);
      } catch (e) {
        console.error("Error fetching collection:", e);
        if (!cancelled) {
          setErr(
            e?.message ||
              "Something went wrong while loading the collection. Please try again.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTicketData();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const hasMedia = media.length > 0;
  const current = hasMedia ? media[idx] : null;

  const nextItem = () =>
    setIdx((p) => (media.length ? (p + 1) % media.length : 0));
  const prevItem = () =>
    setIdx((p) => (media.length ? (p - 1 + media.length) % media.length : 0));

  const handleMediaClick = (src, type) => {
    setZoomImage(src);
    setZoomType(type);
    setShowZoomModal(true);
  };

  const parseSizesWithStock = (raw) => {
    if (!raw) return [];
    const toPair = (token) => {
      const t = String(token).trim();
      let m = t.match(/^([A-Za-z0-9]+)\s*[:-]\s*(\d+)$/);
      if (m) return { size: m[1], stock: Math.max(0, Number(m[2]) || 0) };
      m = t.match(/^([A-Za-z0-9]+)\s*\((\d+)\)$/);
      if (m) return { size: m[1], stock: Math.max(0, Number(m[2]) || 0) };
      return { size: t, stock: null };
    };

    if (Array.isArray(raw)) return raw.map(toPair);
    if (typeof raw === "string")
      return raw
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
        .map(toPair);
    if (typeof raw === "object" && raw.size)
      return [
        {
          size: String(raw.size),
          stock: Math.max(0, Number(raw.stock ?? 0) || 0),
        },
      ];
    return [];
  };

  const sizes = useMemo(
    () => parseSizesWithStock(collectionData?.size),
    [collectionData?.size],
  );

  const stockLabel = (stock) => {
    if (stock === null || stock === undefined) return "";
    if (stock <= 0) return "No stock";
    if (stock === 1) return "1 left";
    return `${stock} left`;
  };

  const allOutOfStock =
    sizes.length > 0 && sizes.every((s) => (s.stock ?? 0) <= 0);

  const onPostSelection = async (event) => {
    event.preventDefault();
    if (!collectionData) return;

    if (sizes.length > 0 && !selectedSize) {
      setSizeError("Please select a size before adding to cart.");
      document
        .getElementById("size-section")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    } else {
      setSizeError("");
    }

    const selectedImageFileName =
      attachments?.[idx]?.fileName ??
      (Array.isArray(collectionData.images) && collectionData.images[0]) ??
      "";
    const rate = Number(collectionData?.rate ?? 0);
    const after = Number(collectionData?.afterDiscount ?? rate);
    const qty = 1;

    const payload = {
      id: collectionData.id,
      lakshmicollectionId: collectionData.lakshmicollectionId ?? "",
      date: "string",
      customerId: userId,
      customerName: "",
      customerPhonenumber: "",
      stockLeft: String(collectionData.stockLeft - qty),
      totalItemsSelected: String(qty),
      address: "",
      state: "",
      district: "",
      zipCode: "",
      status: "",
      isDelivered: false,
      latitude: 0,
      longitude: 0,
      paymentMode: "",
      utrTransactionNumber: "",
      transactionNumber: "",
      transactionStatus: "",
      transactionType: "",
      DeliveryPartnerUserId: "",
      AssignedTo: "",
      paidAmount: "0",
      grandTotal: String(Math.round(after * qty)),
      categoriess: [
        {
          categoryName: collectionData.category,
          productname: collectionData.productName ?? "",
          mrp: rate.toString(),
          code: "",
          discount: (collectionData.discount ?? 0).toString(),
          afterDiscountPrice: after.toString(),
          productImage: String(selectedImageFileName),
          size: String(selectedSize ?? collectionData.size ?? ""),
          colour: "",
          stockLeft: String(collectionData.stockLeft - qty),
          noOfQuantity: String(qty),
        },
      ],
    };
    try {
      setPosting(true);
      setPostMsg(null);
      const res = await fetch(
        `https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/LakshmiCollection/UploadColectionsDetails`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(
          `POST failed (${res.status}): ${txt || res.statusText}`,
        );
      }
      const data = await res.json();
      const uploadedId = data?.id;
      localStorage.setItem("uploadedId", uploadedId);
      navigate(`/lakshmiCollectionCart/${userType}/${userId}`);
    } catch (err) {
      console.error("Failed to add to cart:", err);
    } finally {
      setPosting(false);
    }
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundImage: "linear-gradient(#ff9800, #ff5722, #ff4081)",
          color: "white",
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", padding: "8px" }}>
          <button
            onClick={() =>
              navigate(`/lakshmiCollections/${userType}/${userId}`)
            }
            aria-label="Back"
            style={{
              background: "transparent",
              border: "none",
              color: "white",
              cursor: "pointer",
              padding: 4,
            }}
          >
            <ArrowBackIcon />
          </button>
          <h1
            style={{
              flex: 1,
              margin: 0,
              textAlign: "center",
              fontFamily: "'Baloo 2'",
              fontSize: 25,
              fontWeight: "bold",
              letterSpacing: "1px",
            }}
          >
            Lakshmi Collections
          </h1>
          <span style={{ width: 36 }} />
        </div>
      </div>

      <div
        className="d-flex flex-row justify-content-start align-items-start"
        style={{ marginTop: 70 }}
      >
        {/* Sidebar */}
        {!isMobile && (
          <div className="ml-0 p-0 adm_mnu h-90">
            <Sidebar />
          </div>
        )}

        {isMobile && (
          <div className="collectionfloating-menu">
            <Button
              variant="primary"
              className="rounded-circle shadow"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreVertIcon />
            </Button>

            {showMenu && (
              <div className="sidebar-container">
                <Sidebar />
              </div>
            )}
          </div>
        )}

        {/* Main */}
        <div className={`container ${isMobile ? "w-100" : "w-75"}`}>
          <div className="row">
            {/* Image Section */}
            <div className="col-12 col-md-6">
              <div
                className="position-relative border rounded-3 d-flex justify-content-center align-items-center"
                style={{ minHeight: 310 }}
              >
                {!current ? (
                  <div className="text-muted">Photos loading…</div>
                ) : current.type === "image" ? (
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "60%",
                      maxHeight: 300,
                      borderRadius: 10,
                      cursor: "zoom-in",
                    }}
                    onMouseMove={handleImgMouseMove}
                    onMouseLeave={handleImgMouseLeave}
                    onClick={() => handleMediaClick(current.dataUrl, "image")}
                  >
                    <img
                      ref={imgRef}
                      src={current.dataUrl}
                      alt={current.fileName || "Product"}
                      style={{
                        display: "block",
                        maxHeight: 300,
                        width: "100%",
                        borderRadius: 10,
                        objectFit: "contain",
                        userSelect: "none",
                      }}
                      draggable={false}
                    />

                    {/* Magnifier Lens */}
                    {magVisible && imgRef.current && (
                      <div
                        aria-hidden
                        style={{
                          position: "absolute",
                          width: MAG_SIZE,
                          height: MAG_SIZE,
                          left: magPos.x - MAG_SIZE / 2,
                          top: magPos.y - MAG_SIZE / 2,
                          borderRadius: 8,
                          border: "2px solid rgba(255,255,255,0.9)",
                          boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
                          pointerEvents: "none",
                          overflow: "hidden",
                          backgroundImage: `url(${current.dataUrl})`,
                          backgroundRepeat: "no-repeat",
                          backgroundSize: `${imgRef.current.clientWidth * MAG_ZOOM}px ${imgRef.current.clientHeight * MAG_ZOOM}px`,
                          backgroundPosition: `${-(magPos.x * MAG_ZOOM - MAG_SIZE / 2)}px ${-(magPos.y * MAG_ZOOM - MAG_SIZE / 2)}px`,
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <video
                    src={current.dataUrl}
                    controls
                    playsInline
                    style={{ maxHeight: 300, width: "100%", borderRadius: 10 }}
                  />
                )}

                {hasMedia && media.length > 1 && (
                  <>
                    <Button
                      variant="white"
                      className="position-absolute top-50 start-0 translate-middle-y"
                      onClick={prevItem}
                    >
                      ‹
                    </Button>
                    <Button
                      variant="white"
                      className="position-absolute top-50 end-0 translate-middle-y"
                      onClick={nextItem}
                    >
                      ›
                    </Button>
                  </>
                )}
              </div>

              {hasMedia && media.length > 1 && (
                <div className="d-flex gap-2 mt-2 flex-wrap">
                  {media.map((m, i) => (
                    <button
                      key={m.fileName + i}
                      className={`border rounded ${i === idx ? "border-2" : ""}`}
                      style={{
                        padding: 0,
                        background: "transparent",
                        outline: "none",
                      }}
                      onClick={() => setIdx(i)}
                      title={m.fileName}
                    >
                      {m.type === "image" ? (
                        <img
                          src={m.dataUrl}
                          alt={m.fileName}
                          style={{
                            width: 64,
                            height: 75,
                            objectFit: "cover",
                            borderRadius: 6,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 64,
                            height: 75,
                            position: "relative",
                            borderRadius: 6,
                            overflow: "hidden",
                          }}
                        >
                          <video
                            src={m.dataUrl}
                            muted
                            playsInline
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 18,
                              color: "#fff",
                              fontWeight: 700,
                            }}
                          >
                            ▶
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="col-12 col-md-6">
              <h2
                style={{
                  fontFamily: "'Baloo 2'",
                  fontSize: "18px",
                  fontWeight: "bold",
                }}
              >
                {collectionData?.productName || "—"}
              </h2>
              <div className="d-flex align-items-end gap-3 mb-2">
                {collectionData?.afterDiscount && (
                  <span
                    className="fw-bold"
                    style={{ fontSize: "14px", color: "black" }}
                  >
                    ₹{Math.round(collectionData.afterDiscount)}
                  </span>
                )}
                {collectionData?.rate && (
                  <span
                    className="text-muted text-decoration-line-through"
                    style={{ fontSize: "14px" }}
                  >
                    ₹{collectionData.rate}
                  </span>
                )}
              </div>

              {/* Size Selection */}
              <div id="size-section" className="">
                <div className="fw-semibold">Select Size</div>
                {sizes.length === 0 ? (
                  <div className="text-muted small">No size info available</div>
                ) : (
                  <div className="d-flex flex-wrap gap-3">
                    {sizes.map(({ size, stock }) => {
                      const isSelected = selectedSize === size;
                      const outOfStock = (stock ?? 0) <= 0;
                      return (
                        <div
                          key={size}
                          className="d-flex flex-column align-items-center"
                          style={{ minWidth: 40 }}
                        >
                          <button
                            type="button"
                            className={`btn btn-sm ${isSelected ? "btn-danger" : "btn-outline-danger"}`}
                            onClick={() => {
                              if (outOfStock) return;
                              setSelectedSize(isSelected ? null : size);
                              setSizeError("");
                            }}
                            disabled={outOfStock}
                            aria-pressed={isSelected}
                            aria-disabled={outOfStock}
                            style={{ minWidth: 45 }}
                            title={
                              outOfStock
                                ? "Out of stock"
                                : `${stockLabel(stock)}`
                            }
                          >
                            {size}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                {/* Validation error */}
                <div className="mt-1">
                  {sizeError && (
                    <p
                      className="text-danger mb-0"
                      style={{ fontSize: "12px" }}
                    >
                      {sizeError}
                    </p>
                  )}
                </div>
                {sizes.length > 0 && allOutOfStock && (
                  <div className="mt-2 text-danger fw-semibold">
                    This item is currently out of stock.
                  </div>
                )}
              </div>

              {/* Description Pairs */}
              {Array.isArray(collectionData?.descriptions) &&
                collectionData.descriptions.length > 0 && (
                  <div className="mb-2">
                    <div className="fw-semibold">Description</div>
                    <ul className="list-unstyled mb-0">
                      {collectionData.descriptions.map((d, i) => (
                        <li key={`${d.name}-${i}`} className="small">
                          <span className="text-muted">{d.name?.trim()}:</span>{" "}
                          <span className="fw-semibold">{d.value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              <div className="d-flex justify-content-between gap-2 mb-1">
                <Button
                  variant="outline-secondary"
                  style={{ fontWeight: "bold" }}
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                >
                  Top ↑
                </Button>
                <button
                  style={{
                    background: "#ff4080b7",
                    color: "white",
                    borderRadius: "10px",
                    padding: "4px",
                    fontWeight: "bold",
                  }}
                  onClick={onPostSelection}
                  disabled={posting || !collectionData || allOutOfStock}
                  title={
                    allOutOfStock
                      ? "Out of stock"
                      : sizes.length > 0 && !selectedSize
                        ? "Select a size"
                        : "Add to cart"
                  }
                >
                  {posting
                    ? "Submitting..."
                    : allOutOfStock
                      ? "Out of Stock"
                      : "Add To Cart"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <Modal
          show={showZoomModal}
          onHide={() => setShowZoomModal(false)}
          centered
        >
          <button
            className="close-button text-end mt-0"
            onClick={() => setShowZoomModal(false)}
          >
            &times;
          </button>
          <Modal.Body className="text-center">
            <div className="zoom-container">
              {zoomType === "video" ? (
                <video
                  src={zoomImage}
                  controls
                  playsInline
                  style={{ width: "100%", borderRadius: 8 }}
                />
              ) : (
                <img
                  src={zoomImage}
                  alt="Zoomed Product"
                  className="zoom-image"
                />
              )}
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
};

export default LakshmiCollectionDesigns;
