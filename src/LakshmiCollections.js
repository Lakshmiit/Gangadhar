import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "./App.css";
import Sidebar from "./Sidebar.js";
import "bootstrap/dist/css/bootstrap.min.css";
import { Dashboard as MoreVertIcon } from "@mui/icons-material";
import { Button } from "react-bootstrap";
import SearchIcon from "@mui/icons-material/Search";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// import { appConfig } from "./config";

const LakshmiCollections = () => {
  const navigate = useNavigate();
  const { userType, userId, selectedUserType } = useParams();
  const [likedProducts, setLikedProducts] = useState([]);
  const location = useLocation();
  const encodedCategory =
    location.state?.encodedCategory || localStorage.getItem("encodedCategory");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [products, setProducts] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [imageLoading, setImageLoading] = useState(true);
  const [checked] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    console.log(checked, imageLoading);
  }, [checked, imageLoading]);

  const handleLike = (productId, e) => {
    if (e) e.stopPropagation();
    setLikedProducts((prevLiked) =>
      prevLiked.includes(productId)
        ? prevLiked.filter((id) => id !== productId)
        : [...prevLiked, productId],
    );
  };

  useEffect(() => {
    const fetchCollectionData = async () => {
      try {
        setSelectedCategory(encodedCategory);
        setImageLoading(true);
        const url = `https://lmartapiv1-fxcyd2b4btacgsav.westus2-01.azurewebsites.net/api/UploadLakshmiCollection/GetAllLakshmiCollectionsByCategory?category=${encodedCategory}`;
        const response = await axios.get(url);
        const list = Array.isArray(response.data) ? response.data : [];
        const approvedList = list.filter(
          (p) =>
            String(p?.status || "")
              .trim()
              .toLowerCase() === "approved",
        );
        setProducts(approvedList);
        setImageUrls({});
        approvedList.forEach(async (product) => {
          const firstPhoto = product.images?.[0];
          if (!firstPhoto) return;
          try {
            const res = await fetch(
              `https://lmartapiv1-fxcyd2b4btacgsav.westus2-01.azurewebsites.net/api/FileUpload/download?generatedfilename=${encodeURIComponent(firstPhoto)}`,
            );
            let blob;
            const ct = res.headers.get("content-type") || "";
            if (ct.includes("application/json")) {
              const data = await res.json();
              if (!data?.imageData) return;
              const byteChars = atob(data.imageData);
              const byteNums = new Array(byteChars.length);
              for (let i = 0; i < byteChars.length; i++) {
                byteNums[i] = byteChars.charCodeAt(i);
              }
              blob = new Blob([new Uint8Array(byteNums)], {
                type: "image/jpeg",
              });
            } else {
              blob = await res.blob();
            }
            const imageUrl = URL.createObjectURL(blob);
            setImageUrls((prev) => ({
              ...prev,
              [product.id]: [imageUrl],
            }));
          } catch (err) {
            console.warn("Image fetch failed for", product.id, err);
          }
        });
        setImageLoading(false);
      } catch (error) {
        console.error("Error fetching grocery products:", error);
        setProducts([]);
        setImageLoading(false);
      }
    };
    if (encodedCategory) {
      fetchCollectionData();
    }
  }, [encodedCategory]);

  useEffect(() => {
    if (encodedCategory) {
      setSelectedCategory(decodeURIComponent(encodedCategory));
    }
  }, [encodedCategory]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <div style={{ fontFamily: "Baloo 2" }}>
        <div>
          <h1
            style={{
              backgroundImage: "linear-gradient( #ff9800, #ff5722, #ff4081)",
              color: "white",
              fontFamily: "'Baloo 2'",
              fontSize: "25px",
              padding: "10px",
              fontWeight: "bold",
              textAlign: "center",
              width: "100%",
              boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
              letterSpacing: "1px",
              marginBottom: "2px",
              position: "fixed",
              top: 0,
              left: 0,
              zIndex: 1000,
            }}
          >
            Lakshmi Collections
          </h1>
        </div>

        <div className="wrapper d-flex" style={{ marginTop: "50px" }}>
          {/* Sidebar */}
          {!isMobile ? (
            <div className="ml-0 p-0 sde_mnu">
              <Sidebar userType={selectedUserType} />
            </div>
          ) : (
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
                  <Sidebar userType={selectedUserType} />
                </div>
              )}
            </div>
          )}

          <div className={`container ${isMobile ? "w-100" : "w-75"} `}>
            <div className="position-relative flex-grow-1 ms-5">
              <input
                type="text"
                className="form-control w-60 mt-2 ps-5 "
                placeholder="Search Products"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.trimStart())}
              />
              <SearchIcon
                className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                style={{ pointerEvents: "none" }}
              />
            </div>
            <div className="d-flex align-items-center">
              <ArrowBackIcon
                className="me-2"
                style={{ color: "#ff4081", cursor: "pointer" }}
                onClick={() => navigate(`/profilePage/${userType}/${userId}`)}
              />
              <h4 className="fw-bold mb-0">{selectedCategory}</h4>
            </div>
            <div className="collection-row flex flex-wrap gap-1">
              {products
                .filter(
                  (p) =>
                    (selectedCategory
                      ? p.category?.toLowerCase() ===
                        selectedCategory.toLowerCase()
                      : true) &&
                    (searchQuery === "" ||
                      p.productName
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase())),
                )
                .map((product) => {
                  const mrp = Number(product.rate ?? 0) || 0;
                  const after = Number(product.afterDiscount ?? mrp) || mrp;
                  const discountPct = Number(product.discount ?? 0) || 0;
                  return (
                    <div
                      key={product.id}
                      className="w-[200px] flex flex-col p-1 bg-white rounded shadow-sm border position-relative"
                      style={{ minHeight: "160px" }}
                      onClick={() =>
                        navigate(
                          `/lakshmiCollectionDesigns/${userType}/${userId}/${product.id}`,
                        )
                      }
                    >
                      {/* --- Discount badge (card top-left) --- */}
                      {discountPct > 0 && (
                        <div
                          className="position-absolute"
                          style={{
                            top: 6,
                            left: 6,
                            padding: "6px",
                            borderRadius: "50%",
                            fontWeight: 700,
                            fontSize: 11,
                            color: "#fff",
                            background:
                              "linear-gradient(135deg, #ff416c, #ff4b2b)",
                            boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
                            zIndex: 3,
                          }}
                        >
                          {Math.round(discountPct)}%
                        </div>
                      )}
                      {/* Image Wrapper */}
                      <div
                        className="d-flex justify-content-center align-items-center position-relative"
                        style={{ height: "125px" }}
                      >
                        {/* Like Icon */}
                        <button
                          className="position-absolute top-0 end-0 m-1"
                          style={{
                            border: "none",
                            cursor: "pointer",
                            background: "transparent",
                          }}
                          onClick={(e) => handleLike(product.id, e)} // NEW: stopPropagation inside
                          aria-label={
                            likedProducts.includes(product.id)
                              ? "Unlike"
                              : "Like"
                          }
                        >
                          {likedProducts.includes(product.id) ? (
                            <FavoriteIcon style={{ color: "red" }} />
                          ) : (
                            <FavoriteBorderIcon style={{ color: "gray" }} />
                          )}
                        </button>

                        {imageUrls[product.id]?.[0] ? (
                          <img
                            src={imageUrls[product.id][0]}
                            alt={product.productName}
                            style={{
                              maxHeight: "110px",
                              maxWidth: "100%",
                              objectFit: "contain",
                              cursor: "pointer",
                              borderRadius: "6px",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(
                                `/lakshmiCollectionDesigns/${userType}/${userId}/${product.id}`,
                              );
                            }}
                          />
                        ) : (
                          <span className="text-muted small">
                            Loading Image
                          </span>
                        )}
                      </div>

                      <h6
                        className="text-start fw-bold m-0"
                        style={{ fontSize: "12px" }}
                      >
                        {product.productName}
                      </h6>
                      <div
                        className="d-flex justify-content-between align-items-baseline m-0"
                        style={{ fontSize: "12px" }}
                      >
                        <span
                          className={
                            discountPct > 0 && after < mrp
                              ? "text-muted text-decoration-line-through"
                              : "text-muted"
                          }
                        >
                          ₹{mrp}
                        </span>
                        <span className="fw-bold">₹{Math.round(after)}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
<style jsx>{`
  .zoomable-image {
    transition: transform 0.3s ease-in-out;
  }
  .zoomable-image:hover {
    transform: scale(1.1);
  }
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
`}</style>;

export default LakshmiCollections;
