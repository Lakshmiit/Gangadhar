import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import "./App.css";
import { Button } from "react-bootstrap";
import { Dashboard as MoreVertIcon } from "@mui/icons-material";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
// import { appConfig } from "./config";

const AdminLakshmiCollectionsApproval = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { selectedUserType } = useParams();
  const [collectionData, setCollectionData] = useState(null);
  const [collectionType, setCollectionType] = useState("Approved");
  const [comments, setComments] = useState("");
  const { id } = useParams();
  const videoRefs = useRef([]);
  const [mediaItems, setMediaItems] = useState([]);
  const navigate = useNavigate();

  const base64ToBlobUrl = (b64, contentType = "") => {
    const byteCharacters = atob(b64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++)
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    const blob = new Blob([new Uint8Array(byteNumbers)], { type: contentType });
    return URL.createObjectURL(blob);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://localhost:7091/api/UploadLakshmiCollection/GetLakshmiCollections?id=${id}`,
        );
        const data = await response.json();
        setCollectionData(data);
        const imagePromises = (data.images ?? []).map(async (file) => {
          const r = await fetch(
            `https://localhost:7091/api/FileUpload/download?generatedfilename=${encodeURIComponent(file)}`,
          );
          const j = await r.json();
          const b64 = j.imageData || j.fileData || j.videoData;
          const contentType = j.contentType || "image/jpeg";
          const src = contentType.startsWith("image/")
            ? `data:${contentType};base64,${b64}`
            : base64ToBlobUrl(b64, contentType);
          return { type: "image", name: file, src };
        });
        const videoPromises = (data.videos ?? []).map(async (file) => {
          const r = await fetch(
            `https://localhost:7091/api/FileUpload/download?generatedfilename=${encodeURIComponent(file)}`,
          );
          const j = await r.json();
          const b64 = j.videoData || j.fileData || j.imageData;
          const contentType = j.contentType || "video/mp4";
          const src = base64ToBlobUrl(b64, contentType);
          return { type: "video", name: file, src, contentType };
        });
        const [images, videos] = await Promise.all([
          Promise.all(imagePromises),
          Promise.all(videoPromises),
        ]);
        const merged = [...images, ...videos];
        setMediaItems(merged);
        videoRefs.current = Array(merged.length).fill(null);
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };
    fetchData();
    return () => {
      mediaItems.forEach((m) => {
        if (m.type === "video" && m.src.startsWith("blob:")) {
          URL.revokeObjectURL(m.src);
        }
      });
    };
  }, [id, mediaItems]);

  useEffect(() => {
    const el = document.getElementById("collectionCarousel");
    if (!el) return;
    const handleSlide = (e) => {
      const prevIndex = e.from;
      const prevVid = videoRefs.current[prevIndex];
      if (prevVid) {
        prevVid.pause();
        prevVid.currentTime = 0;
      }
    };
    const handleSlid = (e) => {
      const nextIndex = e.to;
      const nextVid = videoRefs.current[nextIndex];
      if (nextVid) {
        nextVid.play().catch(() => {});
      }
    };
    el.addEventListener("slide.bs.carousel", handleSlide);
    el.addEventListener("slid.bs.carousel", handleSlid);
    return () => {
      el.removeEventListener("slide.bs.carousel", handleSlide);
      el.removeEventListener("slid.bs.carousel", handleSlid);
    };
  }, [mediaItems]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmit = async () => {
    if (!collectionData) {
      console.error("No product data to submit.");
      return;
    }
    const payload = {
      ...collectionData,
      status: collectionType,
      comments,
      deliveryInDays,
      stockLeft,
    };
    try {
      const response = await fetch(
        `https://localhost:7091/api/UploadLakshmiCollection/UpdateLakshmiCollection?id=${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );
      if (response.ok) {
        alert("Collection status updated successfully.");
        navigate(`/adminCollectionsList/Admin`);
      } else {
        const errorData = await response.json();
        console.error("Error updating collection:", errorData);
        alert("Failed to update collection. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting collection data:", error);
      alert("An error occurred. Please try again later.");
    }
  };

  if (!collectionData) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const {
    productName,
    category,
    catalogue,
    size,
    colour,
    rate,
    discount,
    afterDiscount,
    descriptions,
    optional,
    moreInfo,
    deliveryInDays,
    stockLeft,
  } = collectionData;

  return (
    <div
      className="d-flex flex-row justify-content-start align-items-start mt-mob-50"
      style={{ fontFamily: "Baloo 2" }}
    >
      {/* Sidebar */}
      {!isMobile && (
        <div className="ml-0 m-4 p-0 adm_mnu">
          <AdminSidebar userType={selectedUserType} />
        </div>
      )}
      {/* Floating menu for mobile */}
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
              <AdminSidebar userType={selectedUserType} />
            </div>
          )}
        </div>
      )}
      {/* Main Content */}
      <div className={`container m-3 ${isMobile ? "w-100" : "w-75"}`}>
        <div className=" col-md-11">
          <div className="bg-white p-4 rounded shadow-sm">
            <h3 className="mb-4 text-dark">Collection Details Approval</h3>
            {/* Carousel */}
            <div
              id="collectionCarousel"
              className="carousel slide mb-4 rounded"
              data-bs-ride="carousel"
            >
              <div className="carousel-indicators">
                {mediaItems.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    data-bs-target="#collectionCarousel"
                    data-bs-slide-to={index}
                    className={index === 0 ? "active" : ""}
                    aria-current={index === 0 ? "true" : "false"}
                    aria-label={`Slide ${index + 1}`}
                  />
                ))}
              </div>

              <div className="carousel-inner">
                {mediaItems.map((item, index) => (
                  <div
                    className={`carousel-item ${index === 0 ? "active" : ""}`}
                    key={`${item.type}-${item.name}-${index}`}
                  >
                    {item.type === "image" ? (
                      <img
                        src={item.src}
                        className="d-block mx-auto rounded"
                        style={{
                          maxHeight: "650px",
                          width: "40%",
                          objectFit: "cover",
                        }}
                        alt={`Slide ${index + 1}`}
                      />
                    ) : (
                      <video
                        ref={(el) => (videoRefs.current[index] = el)}
                        src={item.src}
                        className="d-block mx-auto rounded"
                        style={{
                          maxHeight: "500px",
                          width: "50%",
                          objectFit: "cover",
                        }}
                        controls
                        muted
                        playsInline
                        preload="metadata"
                        autoPlay={index === 0}
                      />
                    )}
                  </div>
                ))}
              </div>
              <button
                className="carousel-control-prev"
                type="button"
                data-bs-target="#collectionCarousel"
                data-bs-slide="prev"
              >
                <span
                  className="carousel-control-prev-icon"
                  aria-hidden="true"
                  style={{
                    filter:
                      "invert(27%) sepia(98%) saturate(2000%) hue-rotate(200deg) brightness(95%) contrast(90%)",
                  }}
                ></span>
                <span className="visually-hidden">Previous</span>
              </button>

              <button
                className="carousel-control-next"
                type="button"
                data-bs-target="#collectionCarousel"
                data-bs-slide="next"
              >
                <span
                  className="carousel-control-next-icon"
                  aria-hidden="true"
                  style={{
                    filter:
                      "invert(27%) sepia(98%) saturate(2000%) hue-rotate(200deg) brightness(95%) contrast(90%)",
                  }}
                ></span>
                <span className="visually-hidden">Next</span>
              </button>
            </div>

            {/* Product Details */}
            <div className="row">
              <div className="col-md-6">
                <p>
                  <strong>Category:</strong> {category}
                </p>
                <p>
                  <strong>Name:</strong> {productName}
                </p>
                <p>
                  <strong>Catalogue:</strong> {catalogue}
                </p>
                <p>
                  <strong>Size:</strong> {size}
                </p>
                <p>
                  <strong>Color:</strong> {colour}
                </p>
                <p>
                  <strong>Rate:</strong> Rs {rate}
                </p>
                <p>
                  <strong>Discount:</strong> {discount}%
                </p>
                <p>
                  <strong>Price After Discount:</strong> Rs {afterDiscount}
                </p>
              </div>
              <div className="col-md-6">
                <h5>Description</h5>
                <ul>
                  {descriptions?.map((spec, index) => (
                    <li key={index}>
                      {spec.name}: {spec.value}
                    </li>
                  ))}
                  <li>{optional}</li>
                </ul>
                <p>
                  <strong>Stock Left:</strong> {stockLeft}
                </p>
                <p>
                  <strong>Additional Information:</strong> {moreInfo}
                </p>
                <p>
                  <strong>Delivery In Days:</strong> {deliveryInDays}
                </p>
              </div>
            </div>
            {/* Approval Section */}
            <div className="">
              <h5>Approval</h5>
              <div className="d-flex">
                <div className="form-check">
                  <input
                    type="radio"
                    className="form-check-input"
                    name="collectionstatus"
                    id="approve"
                    value="Approved"
                    checked={collectionType === "Approved"}
                    onChange={() => setCollectionType("Approved")}
                  />
                  <label className="form-check-label" htmlFor="approve">
                    Approve
                  </label>
                </div>
                <div className="form-check ms-4">
                  <input
                    type="radio"
                    className="form-check-input"
                    name="collectionStatus"
                    id="reject"
                    value="Reject"
                    checked={collectionType === "Reject"}
                    onChange={() => setCollectionType("Reject")}
                  />
                  <label className="form-check-label" htmlFor="reject">
                    Reject
                  </label>
                </div>
              </div>
              <textarea
                className="form-control"
                placeholder="Comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </div>
            {/* Submit Button */}
            <div>
              <button className="btn btn-primary m-1" onClick={handleSubmit}>
                Submit
              </button>
              <button
                type="button"
                className="btn btn-warning text-white"
                onClick={() => navigate(`/adminCollectionsList/Admin`)}
              >
                <span>Back</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLakshmiCollectionsApproval;
