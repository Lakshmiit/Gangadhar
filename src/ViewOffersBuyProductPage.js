import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
// import Sidebar from './Sidebar';
// import Header from './Header.js';
// import Footer from './Footer.js';
// import { appConfig } from "./config";

const ProductViewModal = ({ show, handleClose, productId }) => {
  const [productData, setProductData] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [zoomImage, setZoomImage] = useState("");
  //  const [isMobile, setIsMobile] = useState(false);
  //   const [otherThanProduct] = useState("");
  //     const [requiredQuality] = useState("");
  //     const [units] = useState("");

  useEffect(() => {
    if (!productId) return;

    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://lmartapiv1-fxcyd2b4btacgsav.westus2-01.azurewebsites.net/api/Product/${productId}`,
        );
        const data = await response.json();
        setProductData(data);

        const imageRequests =
          data.productPhotos?.map((photo) =>
            fetch(
              `https://lmartapiv1-fxcyd2b4btacgsav.westus2-01.azurewebsites.net/api/FileUpload/download?generatedfilename=${photo}`,
            )
              .then((res) => res.json())
              .then((data) => ({ src: photo, imageData: data.imageData })),
          ) || [];

        const images = await Promise.all(imageRequests);
        setImageUrls(images);
      } catch (error) {
        console.error("Error loading product:", error);
      }
    };

    fetchData();
  }, [productId]);

  const handleImageClick = (imageSrc) => {
    setZoomImage(imageSrc);
    setShowZoomModal(true);
  };

  if (!productData) return null;

  const {
    productName,
    category,
    catalogue,
    productSize,
    color,
    rate,
    discount,
    specifications,
    warranty,
    additionalInformation,
  } = productData;
  const afterDiscountPrice = rate - (rate * discount) / 100;

  return (
    <>
      <Modal
        show={showZoomModal}
        onHide={() => setShowZoomModal(false)}
        centered
      >
        <Modal.Body className="text-center position-relative">
          <div className="zoom-container m-2">
            {/* Close Button (X) */}
            <button
              className="close-button text-end"
              onClick={() => setShowZoomModal(false)}
            >
              &times;
            </button>
            <img src={zoomImage} alt="Zoomed Product" className="zoom-image" />
          </div>
        </Modal.Body>
      </Modal>

      <Modal show={show} onHide={handleClose} size="lg" centered scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Product Details</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {/* Carousel */}
          <div
            id="productCarousel"
            className="carousel slide rounded"
            data-bs-ride="carousel"
          >
            {/* Indicators */}
            <div className="carousel-indicators">
              {imageUrls.map((_, index) => (
                <button
                  type="button"
                  data-bs-target="#productCarousel"
                  data-bs-slide-to={index}
                  className={index === 0 ? "active" : ""}
                  aria-current={index === 0 ? "true" : "false"}
                  aria-label={`Slide ${index + 1}`}
                  key={index}
                ></button>
              ))}
            </div>

            {/* Carousel items */}
            <div className="carousel-inner">
              {imageUrls.map((img, index) => (
                <div
                  className={`carousel-item ${index === 0 ? "active" : ""}`}
                  key={img.src}
                >
                  <img
                    src={`data:image/jpeg;base64,${img.imageData}`}
                    className="d-block rounded"
                    style={{
                      height: "400px",
                      width: "500px",
                      objectFit: "cover",
                    }}
                    alt={`Slide ${index + 1}`}
                    onClick={() =>
                      handleImageClick(
                        `data:image/jpeg;base64,${img.imageData}`,
                      )
                    }
                  />
                </div>
              ))}
            </div>

            {/* Controls */}
            <button
              className="carousel-control-prev"
              type="button"
              data-bs-target="#productCarousel"
              data-bs-slide="prev"
            >
              <span
                className="carousel-control-prev-icon"
                aria-hidden="true"
              ></span>
              <span className="visually-hidden">Previous</span>
            </button>
            <button
              className="carousel-control-next"
              type="button"
              data-bs-target="#productCarousel"
              data-bs-slide="next"
            >
              <span
                className="carousel-control-next-icon"
                aria-hidden="true"
              ></span>
              <span className="visually-hidden">Next</span>
            </button>
          </div>
          <div className="row">
            <div className="col-md-6">
              <p>
                <strong>Product Name:</strong> {productName}
              </p>
              <p>
                <strong>Category:</strong> {category}
              </p>
              <p>
                <strong>Catalogue:</strong> {catalogue}
              </p>
              <p>
                <strong>Size:</strong> {productSize}
              </p>
              <p>
                <strong>Color:</strong> {color}
              </p>
              <p>
                <strong>Rate:</strong> Rs {rate}
              </p>
              <p>
                <strong>Discount:</strong> {discount}%
              </p>
              <p>
                <strong>Price After Discount:</strong> Rs{" "}
                {afterDiscountPrice.toFixed(0)}
              </p>
            </div>
            <div className="col-md-6">
              <h5>Specifications</h5>
              <ul>
                {specifications?.map((spec, index) => (
                  <li key={index}>
                    {spec.label}: {spec.value}
                  </li>
                ))}
              </ul>
              <h5>Warranty</h5>
              <p>{warranty}</p>
              <h5>Additional Information</h5>
              <p>{additionalInformation}</p>
            </div>
          </div>
          {/* {imageUrls.map((img, idx) => (
          <img
            key={idx}
            src={`data:image/jpeg;base64,${img.imageData}`}
            alt="Product"
            style={{ maxWidth: '100%', margin: '10px 0' }}
          />
        ))} */}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ProductViewModal;
