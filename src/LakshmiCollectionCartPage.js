import React, { useEffect, useState, useRef } from "react";
import { Divider, IconButton } from "@mui/material";
import { Close as CloseIcon, Info as InfoIcon } from "@mui/icons-material";
import "./App.css";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Modal } from "react-bootstrap";
import Collections from "./img/Collections.jpeg";
// import { appConfig } from "./config";

const currency = (n) =>
  (isNaN(n) ? "0" : Math.round(n)).toLocaleString("en-IN");

const LakshmiCollectionCartPage = () => {
  const navigate = useNavigate();
  const { userId, userType } = useParams();
  const removalTimers = useRef({});
  const location = useLocation();
  const uploadedId =
    location.state?.uploadedId || localStorage.getItem("uploadedId");
  const [imageLoading, setImageLoading] = useState(true);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [zoomImage, setZoomImage] = useState("");
  const [collectionDetails, setCollectionDetails] = useState(null);
  const [collectionItems, setCollectionItems] = useState([]);

  // Clear any pending removal timers on unmount
  useEffect(() => {
    return () => {
      Object.values(removalTimers.current).forEach((t) => clearTimeout(t));
      removalTimers.current = {};
    };
  }, []);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        if (!uploadedId) {
          console.error("No id found in localStorage or location state");
          return;
        }
        const response = await fetch(
          `https://lmartapiv1-fxcyd2b4btacgsav.westus2-01.azurewebsites.net/api/LakshmiCollection/GetLakshmiCollectionDetails/${uploadedId}`,
        );
        if (!response.ok) throw new Error("Failed to fetch collection details");
        const data = await response.json();
        setCollectionDetails(data);
        const itemsWithImages = await Promise.all(
          (data?.categoriess || []).map(async (p, index) => {
            let productImageUrl = null;
            const productImageFilename = p.productImage || null;
            if (productImageFilename) {
              try {
                const imgRes = await fetch(
                  `https://lmartapiv1-fxcyd2b4btacgsav.westus2-01.azurewebsites.net/api/FileUpload/download?generatedfilename=${productImageFilename}`,
                );
                const imgData = await imgRes.json();
                if (imgData?.imageData) {
                  const byteCharacters = atob(imgData.imageData);
                  const byteNumbers = new Array(byteCharacters.length);
                  for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                  }
                  const byteArray = new Uint8Array(byteNumbers);
                  const blob = new Blob([byteArray], { type: "image/jpeg" });
                  productImageUrl = URL.createObjectURL(blob);
                }
              } catch (err) {
                console.error(
                  "Image fetch failed for",
                  productImageFilename,
                  err,
                );
              }
            }
            return {
              id: `${data.id}-${index}`,
              date: p.date,
              categoryName: p.categoryName,
              productName: p.productName,
              productImageUrl,
              productImage: productImageFilename,
              afterDiscountPrice: Number(p.afterDiscountPrice) || 0,
              mrp: Number(p.mrp) || 0,
              discount: Number(p.discount) || 0,
              size: p.size,
              stockLeft: Number(p.stockLeft),
              colour: p.colour,
              noOfQuantity: Number(p.noOfQuantity) || 0,
            };
          }),
        );
        setCollectionItems(itemsWithImages);
        setImageLoading(false);
      } catch (error) {
        console.error("Error fetching cart:", error);
        setImageLoading(false);
      }
    };
    fetchCart();
  }, [uploadedId]);

  const handleImageClick = (imageSrc) => {
    if (!imageSrc) return;
    setZoomImage(imageSrc);
    setShowZoomModal(true);
  };

  const itemsTotal = collectionItems.reduce(
    (acc, item) => acc + (Number(item.mrp) || 0) * Number(item.qty ?? 1),
    0,
  );
  const grandTotal = collectionItems.reduce(
    (acc, item) =>
      acc + (Number(item.afterDiscountPrice) || 0) * Number(item.qty ?? 1),
    0,
  );

  const roundedItemsTotal = Math.round(itemsTotal);
  const roundedGrandTotal = Math.round(grandTotal);

  const handleUpdateCollection = async (event) => {
    event.preventDefault();

    const totalItemsSelected = collectionItems.reduce(
      (sum, item) => sum + Number(item.qty ?? 1),
      0,
    );

    const payload = {
      id: uploadedId,
      date: collectionDetails?.date,
      lakshmiCollectionId: collectionDetails?.lakshmiCollectionId,
      customerId: userId,
      customerName: "",
      customerPhonenumber: "",
      stockLeft: collectionDetails?.stockLeft,
      totalItemsSelected: totalItemsSelected.toString(),
      address: "",
      state: "",
      district: "",
      zipCode: "",
      status: "",
      paymentMode: "",
      utrTransactionNumber: "",
      transactionNumber: "",
      transactionStatus: "",
      transactionType: "",
      paidAmount: "",
      AssignedTo: "",
      DeliveryPartnerUserId: "",
      grandTotal: String(roundedGrandTotal),
      categoriess: collectionItems.map((item) => ({
        categoryName: item.categoryName,
        colour: item.colour,
        productName: item.productName,
        mrp: item.mrp.toString(),
        discount: item.discount.toString(),
        afterDiscountPrice: item.afterDiscountPrice.toString(),
        productImage: item.productImage,
        size: item.size,
        stockLeft: item.stockLeft.toString(),
        noOfQuantity: totalItemsSelected,
        code: "",
      })),
    };

    try {
      const response = await fetch(
        `https://lmartapiv1-fxcyd2b4btacgsav.westus2-01.azurewebsites.net/api/LakshmiCollection/UpdateLakshmiCollectionDetails/${uploadedId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) throw new Error("Failed to update collection details");

      const result = await response.json();
      console.log("Update success:", result);
      navigate(
        `/lakshmiCollectionPaymentMethod/${userType}/${userId}/${uploadedId}`,
      );
    } catch (error) {
      console.error("Error updating collection:", error);
      alert("Update failed!");
    }
  };

  return (
    <div
      className="cart-container d-flex flex-column"
      style={{
        maxWidth: 600,
        margin: 5,
        padding: 5,
        borderRadius: 8,
        height: "100vh",
      }}
    >
      {/* Header */}
      <div className="cart-header d-flex justify-content-between">
        <div className="d-flex align-items-center">
          <img
            src={Collections}
            alt="Collections"
            style={{
              height: 50,
              width: 45,
              borderRadius: "50%",
              marginRight: 6,
              objectFit: "cover",
            }}
          />
          <h3 className="ms-1" style={{ fontSize: 18 }}>
            My Collections
          </h3>
        </div>
        <IconButton
          onClick={() => navigate(`/profilePage/${userType}/${userId}`)}
        >
          <CloseIcon
            style={{ cursor: "pointer", fontSize: 30, color: "tomato" }}
          />
        </IconButton>
      </div>
      <Divider />

      {/* Collections Items */}
      <div
        className="cart-items flex-grow-1"
        style={{ overflowY: "auto", padding: 8, marginTop: 50 }}
      >
        {imageLoading && (
          <div className="text-muted" style={{ fontSize: 12 }}>
            Loading items…
          </div>
        )}

        {!imageLoading && collectionItems.length === 0 && (
          <div className="text-muted" style={{ fontSize: 12 }}>
            No items in the collection. Please add products.
          </div>
        )}

        {collectionItems.map((item) => {
          const qty = Number(item.qty ?? 1);
          return (
            <div
              key={item.id}
              className="cart-item d-flex align-items-start justify-content-between mb-2"
              style={{
                borderRadius: 8,
                padding: 6,
                border: "1px solid #eee",
              }}
            >
              {/* Product Image */}
              <img
                src={item.productImageUrl || ""}
                alt={item.productname}
                onClick={() => handleImageClick(item.productImageUrl)}
                style={{
                  height: 80,
                  width: 60,
                  cursor: item.productImageUrl ? "pointer" : "default",
                  borderRadius: 6,
                  objectFit: "cover",
                  background: "#f0f0f0",
                }}
              />

              {/* Product Details */}
              <div style={{ flex: 1, marginLeft: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 12, lineHeight: 1.2 }}>
                  {item.productName}
                </div>
                <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>
                  MRP: <s>{currency(item.mrp)}</s>&nbsp;
                  <span style={{ color: "red" }}>{item.discount}% off</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  ₹{currency(item.afterDiscountPrice * qty)}
                  {item.size && (
                    <span style={{ fontSize: 11, color: "#000" }}>
                      Size: {item.size}
                    </span>
                  )}
                  {item.colour && (
                    <span style={{ fontSize: 11, color: "#000" }}>
                      Colour: {item.colour}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bill Details */}
      <div className="bill-details p-1" style={{ background: "#fff" }}>
        <p className="fs-6 fw-bold" style={{ marginBottom: 6 }}>
          Bill details
        </p>
        <div
          className="d-flex justify-content-between align-items-center"
          style={{ fontSize: 13 }}
        >
          <span>📋 Items total</span>
          <span>
            <s className="text-muted">₹{currency(roundedItemsTotal)}</s>&nbsp;₹
            {currency(roundedGrandTotal)}
          </span>
        </div>
        <div
          className="d-flex justify-content-between align-items-center"
          style={{ fontSize: 13 }}
        >
          <span>
            🚲 Delivery charge <InfoIcon fontSize="small" />
          </span>
          <span className="text-danger fw-bold" style={{ fontSize: 11 }}>
            FREE
          </span>
        </div>
        <div
          className="d-flex justify-content-between align-items-center"
          style={{ fontSize: 13 }}
        >
          <span>
            👜 Handling charge <InfoIcon fontSize="small" />
          </span>
          <span className="text-danger fw-bold" style={{ fontSize: 11 }}>
            FREE
          </span>
        </div>
        <hr className="my-2" />
        <div className="d-flex justify-content-between align-items-center fw-bold">
          <span>Grand total</span>
          <span>₹{currency(roundedGrandTotal)}</span>
        </div>
      </div>
      <Divider />

      {/* Sticky Footer */}
      <div
        className="cart-footer d-flex justify-content-between align-items-center mt-1 px-3 py-2"
        style={{
          backgroundColor: "#ec3b83",
          color: "white",
          borderRadius: 8,
          width: "100%",
          position: "sticky",
          bottom: 0,
        }}
      >
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>
            ₹{currency(roundedGrandTotal)}
          </div>
          <div style={{ fontSize: 12 }}>TOTAL</div>
        </div>

        <button
          className="btn btn-light"
          style={{ fontWeight: 600, fontSize: 14 }}
          onClick={handleUpdateCollection}
          disabled={collectionItems.length === 0}
        >
          Proceed
        </button>
      </div>

      <div className="text-start">
        <button
          className="btn btn-warning mt-1 mb-1"
          onClick={() => navigate(`/profilePage/${userType}/${userId}`)}
        >
          Back
        </button>
      </div>

      {/* Zoom Modal */}
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
            <img
              src={zoomImage}
              alt="Zoomed Product"
              className="zoom-image"
              style={{ maxWidth: "100%", borderRadius: 8 }}
            />
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default LakshmiCollectionCartPage;
