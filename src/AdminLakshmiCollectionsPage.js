import React, { useState, useEffect } from "react";
import "./App.css";
import AdminSidebar from "./AdminSidebar";
import Footer from "./Footer.js";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowBack, Dashboard as MoreVertIcon } from "@mui/icons-material";
import ForwardIcon from "@mui/icons-material/Forward";
import { Button, Modal } from "react-bootstrap";
// import { appConfig } from "./config";

const AdminLakshmiCollectionsPage = () => {
  const navigate = useNavigate();
  const { collectionId } = useParams();
  const [lakshmiCollectionId, setLakshmiCollectionId] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [grandTotal, setGrandTotal] = useState("");
  const [totalItemsSelected, setTotalItemsSelected] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [pincode, setPincode] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [utrTransactionNumber, setUTRTransactionNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [collectionDetails, setCollectionDetails] = useState("");
  const [collectionItems, setCollectionItems] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [imageLoading, setImageLoading] = useState(true);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [zoomImage, setZoomImage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    console.log(collectionDetails, error);
  }, [collectionDetails, error]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const downloadImage = async (fileName) => {
    if (!fileName) return null;
    const res = await fetch(
      `https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/FileUpload/download?generatedfilename=${encodeURIComponent(
        fileName,
      )}`,
    );
    if (!res.ok) {
      throw new Error(`Image fetch failed: ${res.status} ${res.statusText}`);
    }
    const ct = (res.headers.get("content-type") || "").toLowerCase();
    if (ct.includes("application/json")) {
      const data = await res.json();
      const b64 =
        data?.imageData || data?.base64 || data?.fileBytes || data?.data;
      if (!b64 || typeof b64 !== "string" || b64.trim().length === 0) {
        return null;
      }
      const byteChars = atob(b64);
      const byteNums = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++)
        byteNums[i] = byteChars.charCodeAt(i);
      const blob = new Blob([new Uint8Array(byteNums)], { type: "image/jpeg" });
      return URL.createObjectURL(blob);
    }
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  };

  // Fetch order + images (same pattern as list page)
  useEffect(() => {
    const blobUrls = [];
    const fetchCollectionData = async () => {
      try {
        if (!collectionId) {
          console.error("No id found in props or params");
          return;
        }
        setImageLoading(true);
        const response = await fetch(
          `https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/LakshmiCollection/GetLakshmicollectionsById?id=${collectionId}`,
        );
        if (!response.ok) throw new Error("Failed to fetch collection details");
        const data = await response.json();
        setCollectionDetails(data);
        const items = (data?.categoriess || []).map((p, index) => ({
          id: `${data.id}-${index}`,
          productName: p.productName,
          categoryName: p.categoryName,
          colour: p.colour,
          afterDiscountPrice: Number(p.afterDiscountPrice) || 0,
          mrp: Number(p.mrp) || 0,
          discount: Number(p.discount) || 0,
          size: p.size,
          stockLeft: p.stockLeft ?? "",
          noOfQuantity: p.noOfQuantity,
          productImage: p.productImage,
        }));
        setLakshmiCollectionId(data.lakshmiCollectionId);
        setCustomerName(data.customerName);
        setAddress(data.address);
        setMobileNumber(data.customerPhonenumber);
        setPincode(data.zipCode);
        setState(data.state);
        setDistrict(data.district);
        setTotalItemsSelected(data.totalItemsSelected);
        setGrandTotal(data.grandTotal);
        setUTRTransactionNumber(data.utrTransactionNumber);
        setPaymentMode(data.paymentMode);
        setCollectionItems(items);

        const results = await Promise.allSettled(
          items.map(async (it) => {
            try {
              const url = await downloadImage(it.productImage);
              if (url && url.startsWith("blob:")) {
                blobUrls.push(url);
              }
              return [it.id, url ? [url] : []];
            } catch (e) {
              console.warn("Image fetch failed for", it.productImage, e);
              return [it.id, []];
            }
          }),
        );
        const nextMap = {};
        for (const r of results) {
          if (r.status === "fulfilled") {
            const [id, arr] = r.value;
            nextMap[id] = arr;
          }
        }
        setImageUrls(nextMap);
        setImageLoading(false);
      } catch (err) {
        console.error("Error fetching collection:", err);
        setError(err.message);
        setImageLoading(false);
      }
    };
    fetchCollectionData();
    return () => {
      blobUrls.forEach((src) => {
        if (src && src.startsWith("blob:")) URL.revokeObjectURL(src);
      });
    };
  }, [collectionId]);

  const openZoom = (src) => {
    setZoomImage(src);
    setShowZoomModal(true);
  };

  return (
    <>
      <div className="d-flex flex-row justify-content-start align-items-start mt-100">
        {/* Sidebar menu for Larger Screens */}
        {!isMobile && (
          <div className=" ml-0 p-0 adm_mnu h-90">
            <AdminSidebar />
          </div>
        )}

        {isMobile && (
          <div className="floating-menu">
            <Button
              variant="primary"
              className="rounded-circle shadow"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreVertIcon />
            </Button>
            {showMenu && (
              <div className="sidebar-container">
                <AdminSidebar />
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className={`container m-1 ${isMobile ? "w-100" : "w-75"}`}>
          <h3 className=" text-center">Lakshmi Collection Orders</h3>
          <div className="rounded-3 p-2 bx_sdw w-100">
            <form className="form" onSubmit={handleSubmit}>
              <div className="text-center">
                <strong className=" fs-5">
                  Collection Order Number: <span>{lakshmiCollectionId}</span>
                </strong>
              </div>

              <div className="row">
                <div className="col-md-6 form-group">
                  <label>
                    Customer Name <span className="req_star">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Customer Name"
                    readOnly
                  />
                </div>
                <div className="col-md-6 form-group">
                  <label>
                    Customer Address <span className="req_star">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    style={{
                      overflow: "hidden",
                      resize: "none",
                      minHeight: "80px",
                    }}
                    value={[address, district, state, pincode, mobileNumber]
                      .filter(Boolean)
                      .join(", ")}
                    onChange={(e) => {
                      e.target.style.height = "auto";
                      e.target.style.height = e.target.scrollHeight + "px";
                      setAddress(e.target.value);
                    }}
                    placeholder="Customer Address"
                    readOnly
                  ></textarea>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 form-group">
                  <label>
                    Collection Name <span className="req_star">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={collectionItems[0]?.productName}
                    placeholder="Collection Name"
                    readOnly
                  />
                </div>
                <div className="col-md-6 form-group">
                  <label>
                    Category <span className="req_star">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={collectionItems[0]?.categoryName}
                    placeholder="Category"
                    readOnly
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <label>
                    Product Size <span className="req_star">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={collectionItems[0]?.size}
                    placeholder="Product Size"
                    readOnly
                  />
                </div>
                <div className="col-md-6">
                  <label>
                    Rate <span className="req_star">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={collectionItems[0]?.mrp}
                    placeholder="Rate"
                    readOnly
                  />
                </div>
                <div className="col-md-6">
                  <label>
                    Discount <span className="req_star">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={collectionItems[0]?.discount}
                    placeholder="Discount"
                    readOnly
                  />
                </div>
                <div className="col-md-6">
                  <label>
                    Price After Discount <span className="req_star">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={collectionItems[0]?.afterDiscountPrice}
                    placeholder="After Discount"
                    readOnly
                  />
                </div>
              </div>

              <div className="row">
                <div className="row ticket-info">
                  <div className="col-md-6">
                    <p>
                      <strong className="me-2"> Total Amount:</strong>
                      {`Rs ${grandTotal}/-`}
                    </p>
                    <p>
                      <strong className="me-2"> Required Quantity:</strong>
                      {totalItemsSelected}
                    </p>
                  </div>

                  <div className="col-md-6">
                    {/* IMAGE: same UX as list page */}
                    {collectionItems[0] && (
                      <div
                        className="mb-3 d-flex justify-content-center align-items-center position-relative"
                        style={{ minHeight: 130 }}
                      >
                        {imageLoading ? (
                          <span className="text-muted small">
                            Loading Image
                          </span>
                        ) : imageUrls[collectionItems[0].id]?.[0] ? (
                          <img
                            src={imageUrls[collectionItems[0].id][0]}
                            alt={collectionItems[0].productName || "Product"}
                            style={{
                              maxWidth: 150,
                              maxHeight: 130,
                              height: "auto",
                              borderRadius: 8,
                              objectFit: "cover",
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              openZoom(imageUrls[collectionItems[0].id][0])
                            }
                            onError={(e) => {
                              console.error(
                                "IMG render failed:",
                                e.currentTarget.src,
                              );
                              e.currentTarget.replaceWith(
                                Object.assign(document.createElement("div"), {
                                  innerText: "Image failed to load",
                                  style: "font-size:12px;color:#666;",
                                }),
                              );
                            }}
                          />
                        ) : (
                          <div style={{ fontSize: 12, color: "#666" }}>
                            No image available
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="payment m-2">
                  <label className="bg-warning fw-bold fs-5 w-100 p-2">
                    Payment Mode
                  </label>
                  <label className="fs-5 m-1">
                    <input
                      type="checkbox"
                      className="form-check-input border-secondary m-2 border-dark"
                      checked={paymentMode === "online"}
                      readOnly
                    />
                    Pay Through Online
                  </label>
                  <label className="fs-5 m-1">
                    <input
                      type="checkbox"
                      className="form-check-input border-secondary m-2 border-dark"
                      checked={paymentMode === "cash"}
                      readOnly
                    />
                    Cash On Delivery
                  </label>
                </div>

                <div className="form-group">
                  <label>Payment Transaction Details </label>
                  <input
                    type="text"
                    className="form-control "
                    value={utrTransactionNumber}
                    placeholder="Payment Transaction Details"
                    readOnly
                  />
                </div>

                <div className="mt-3 d-flex justify-content-between">
                  <Button
                    type="submit"
                    className="btn btn-warning text-white mx-2"
                    onClick={() => navigate(`/adminNotifications`)}
                    title="Back"
                  >
                    <ArrowBack />
                  </Button>
                  <Button
                    type="submit"
                    className="btn btn-warning text-white mx-2"
                    title="Forward"
                  >
                    <ForwardIcon />
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Styles for floating menu */}
        <style jsx>{`
          .floating-menu {
            position: fixed;
            top: 80px;
            left: 20px;
            z-index: 1000;
          }
          .menu-popup {
            position: absolute;
            top: 50px;
            left: 0;
            background: white;
            border: 1px solid #ddd;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            width: 200px;
          }
        `}</style>
      </div>

      {/* Zoom Modal — same feel as list page */}
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
            <img src={zoomImage} alt="Zoomed Product" className="zoom-image" />
          </div>
        </Modal.Body>
      </Modal>

      <style jsx>{`
        .zoom-container {
          position: relative;
          display: inline-block;
        }
        .close-button {
          position: absolute;
          top: 4px;
          right: 5px;
          background: red;
          border: none;
          font-size: 24px;
          color: white;
          padding: 5px;
          border-radius: 50%;
          cursor: pointer;
          transition: 0.3s;
        }
        .close-button:hover {
          background: darkred;
        }
        .zoom-image {
          max-width: 80%;
          height: auto;
          border-radius: 5px;
        }
      `}</style>

      <Footer />
    </>
  );
};

export default AdminLakshmiCollectionsPage;
