import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UploadIcon from "@mui/icons-material/Upload";
import AdminSidebar from "./AdminSidebar";
import { Dashboard as MoreVertIcon } from "@mui/icons-material";
import { Button } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
// import { appConfig } from "./config";

const AdminLakshmiCollectionsUpload = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [catalogue, setCatalogue] = useState("");
  const [productSize, setProductSize] = useState("");
  const [productPhotos, setProductPhotos] = useState([]);
  const [rate, setRate] = useState("");
  const [discount, setDiscount] = useState("");
  const [specifications, setSpecifications] = useState([
    { label: "", value: "" },
  ]);
  const [moreInfo, setMoreInfo] = useState("");
  const [deliveryInDays, setDeliveryInDays] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [color, setColor] = useState("");
  const [specificationDesc, setSpecificationDesc] = useState("");
  const { selectedUserType } = useParams();
  const [stockLeft, setStockLeft] = useState("");
  const [productVideos, setProductVideos] = useState([]);
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [showPhotoAlert, setShowPhotoAlert] = useState(false);
  const [showVideoAlert, setShowVideoAlert] = useState(false);

  // For videos
  const handleVideoChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length + productVideos.length > 3) {
      alert("You can only upload up to 3 videos.");
      return;
    }
    setProductVideos([...productVideos, ...selectedFiles]);
    setShowVideoAlert(true);
  };

  // Upload videos
  const handleUploadVideos = async () => {
    setLoading(true);
    setShowVideoAlert(false);
    const uploadedVideosList = [];

    for (let i = 0; i < productVideos.length; i++) {
      const file = productVideos[i];
      const fileName = file.name;
      const mimeType = file.type;
      const byteArray = await getFileByteArray(file);

      const response = await uploadFile(byteArray, fileName, mimeType, file);
      if (response) {
        uploadedVideosList.push({
          src: response,
          alt: fileName,
        });
        alert("Video Uploaded Successfully");
      } else {
        alert("Failed to Upload Video");
      }
    }

    setUploadedVideos(uploadedVideosList);
    setLoading(false);
  };

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length + productPhotos.length > 5) {
      alert("You can only upload up to 5 files.");
      return;
    }
    setProductPhotos([...productPhotos, ...selectedFiles]);
    setShowPhotoAlert(true);
  };

  // Detect screen size for responsiveness
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle file upload
  const handleUploadFiles = async () => {
    setLoading(true);
    setShowPhotoAlert(false);
    const uploadedFilesList = [];

    // Loop through selected files and upload each one
    for (let i = 0; i < productPhotos.length; i++) {
      const file = productPhotos[i];
      const fileName = file.name;
      const mimeType = file.type;

      // Convert the file to a byte array (use FileReader)
      const byteArray = await getFileByteArray(file);

      // Upload the file and get the response (filename or URL)
      const response = await uploadFile(byteArray, fileName, mimeType, file);
      if (response) {
        uploadedFilesList.push({
          src: response,
          alt: fileName,
        });
        alert("Image Uploaded Sucessfully");
      } else {
        alert("Failed Upload Image");
      }
    }
    // Once all files are uploaded, update the state with the uploaded files
    setUploadedFiles(uploadedFilesList);
    setLoading(false);
  };

  // Convert the file to a byte array
  const getFileByteArray = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const byteArray = new Uint8Array(reader.result);
        resolve(byteArray);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  // Upload the file using the backend API
  const uploadFile = async (byteArray, fileName, mimeType, file) => {
    try {
      const formData = new FormData();
      formData.append(
        "file",
        new Blob([byteArray], { type: mimeType }),
        fileName,
      );
      formData.append("fileName", fileName);

      const response = await fetch(
        `https://localhost:7091/api/FileUpload/upload?filename=` + fileName,
        {
          method: "POST",
          headers: {
            Accept: "text/plain",
          },
          body: formData,
        },
      );

      const responseData = await response.text();
      return responseData || "";
    } catch (error) {
      console.error("Error uploading file:", error);
      return "";
    }
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      id: "string",
      lakshmicollectionId: "string",
      date: "string",
      productName: productName,
      category: category,
      catalogue: catalogue,
      size: productSize,
      colour: color,
      images: uploadedFiles.map((file) => file.src),
      videos: uploadedVideos.map((v) => v.src),
      rate: parseFloat(rate).toString(),
      discount: parseFloat(discount).toString(),
      afterDiscount: (
        parseFloat(rate) -
        (parseFloat(rate) * parseFloat(discount)) / 100
      ).toString(),
      descriptions: specifications.map((spec) => ({
        name: spec.label,
        value: spec.value,
      })),
      optional: specificationDesc,
      moreInfo: moreInfo,
      deliveryInDays: deliveryInDays,
      stockLeft: stockLeft,
      RequestedBy: "Admin",
      Status: "Pending Approval",
    };

    try {
      const response = await fetch(
        `https://localhost:7091/api/UploadLakshmiCollection/UploadLakshmiCollection`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (response.ok) {
        alert("Collection uploaded successfully!");
        navigate(`/adminCollectionsList/Admin`);
      } else {
        alert("Please fill in all mandatory fields.");
        alert("Failed to upload Collection.");
      }
    } catch (error) {
      alert("An error occurred while uploading the Collection.");
    }
  };

  // Handle change of specification field (label or value)
  const handleSpecificationChange = (index, field, value) => {
    const updatedSpecifications = [...specifications];
    updatedSpecifications[index][field] = value;
    setSpecifications(updatedSpecifications);
  };

  const handleSpecificationDescChange = (value) => {
    setSpecificationDesc(value);
  };

  // Handle removal of a specification
  const handleRemoveSpecification = (index) => {
    const updatedSpecifications = specifications.filter((_, i) => i !== index);
    setSpecifications(updatedSpecifications);
  };

  // Handle adding a new specification
  const handleAddSpecification = () => {
    setSpecifications([...specifications, { label: "", value: "" }]);
  };

  return (
    <div className="d-flex flex-row justify-content-start align-items-start">
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

      <div className={`container m-3 ${isMobile ? "w-100" : "w-75"}`}>
        <h3 className="mb-3 text-center">Lakshmi Collections</h3>
        <div className="bg-white rounded-3 p-3 bx_sdw w-60 m-auto">
          <form onSubmit={handleSubmit}>
            {/* Product Name */}
            <div className="form-group">
              <label>
                Product Name <span className="req_star">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Enter Product Name"
              />
            </div>
            {/* Category */}
            <div className="form-group">
              <label>
                Category <span className="req_star">*</span>
              </label>
              <select
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>Choose Category</option>
                <option>Kurta Sets</option>
                <option>Dupatta Sets</option>
              </select>
            </div>

            {/* Catalogue */}
            <div className="form-group">
              <label>
                Catalogue <span className="req_star">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                value={catalogue}
                onChange={(e) => setCatalogue(e.target.value)}
                placeholder="Enter Catalogue"
              />
            </div>

            {/* Product Size */}
            <div className="form-group">
              <label>
                Size <span className="req_star">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                value={productSize}
                onChange={(e) => setProductSize(e.target.value)}
                placeholder="Enter Product Size"
              />
            </div>

            {/* Color */}
            <div className="form-group">
              <label>
                Color <span className="req_star">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Enter Color"
              />
            </div>

            {/* Product Photos */}
            <div className="form-group">
              <label>
                Product Photos <span className="req_star">*</span>
              </label>
              <input
                type="file"
                className="form-control"
                multiple
                onChange={handleFileChange}
              />
              {showPhotoAlert && (
                <div className="alert alert-danger  mt-2">
                  Please click the <strong>Upload Files</strong> button to
                  upload the selected images.
                </div>
              )}
              <div className="mt-2">
                {productPhotos.map((file, index) => (
                  <p key={index}>{file.name}</p>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-primary mt-2"
                onClick={handleUploadFiles}
                disabled={loading || productPhotos.length === 0}
              >
                {loading ? "Uploading..." : "Upload Files"}
              </button>
            </div>

            {/* Product Videos */}
            <div className="form-group">
              <label>
                Product Videos <span className="req_star">*</span>
              </label>
              <input
                type="file"
                className="form-control"
                multiple
                accept="video/*"
                onChange={handleVideoChange}
              />
              {showVideoAlert && (
                <div className="alert alert-danger mt-2">
                  Please click the <strong>Upload Videos</strong> button to
                  upload the selected videos.
                </div>
              )}
              <div className="mt-2">
                {productVideos.map((file, index) => (
                  <p key={index}>{file.name}</p>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-primary mt-2"
                onClick={handleUploadVideos}
                disabled={loading || productVideos.length === 0}
              >
                {loading ? "Uploading..." : "Upload Videos"}
              </button>
            </div>

            {/* Rate */}
            <div className="form-group">
              <label>
                Rate <span className="req_star">*</span>{" "}
              </label>
              <input
                type="text"
                className="form-control"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="Enter Product Rate"
              />
            </div>

            {/* Discount */}
            <div className="form-group">
              <label>
                Discount <span className="req_star">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="If any Discount Enter Percentage"
              />
            </div>

            {/* After Discount Price */}
            <div className="form-group">
              <label>
                After Discount Price <span className="req_star">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                value={Math.round(
                  Number(rate || 0) -
                    (Number(rate || 0) *
                      Number((discount || "0").toString().replace("%", ""))) /
                      100,
                )}
                placeholder="If any Discount Enter Percentage"
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label>
                Description <span className="req_star">*</span>
              </label>
              {specifications.map((spec, index) => (
                <div key={index} className="d-flex gap-3">
                  <input
                    type="text"
                    className="form-control mb-1"
                    placeholder="Name"
                    value={spec.label}
                    onChange={(e) =>
                      handleSpecificationChange(index, "label", e.target.value)
                    }
                  />
                  <input
                    type="text"
                    className="form-control mb-1"
                    placeholder="Value"
                    value={spec.value}
                    onChange={(e) =>
                      handleSpecificationChange(index, "value", e.target.value)
                    }
                  />
                  <button
                    type="button"
                    className="btn btn-danger mb-1"
                    onClick={() => handleRemoveSpecification(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}

              <textarea
                type="text"
                className="form-control mt-2"
                placeholder="Optional"
                value={specificationDesc}
                onChange={(e) => handleSpecificationDescChange(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-primary m-1"
                onClick={handleAddSpecification}
              >
                Add Description
              </button>
            </div>

            {/* Additional Info */}
            <div className="form-group">
              <label>
                More Info <span className="req_star">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                value={moreInfo}
                onChange={(e) => setMoreInfo(e.target.value)}
                placeholder="Additional Information"
              />
            </div>

            {/* Delivery In Days */}
            <div className="form-group">
              <label>
                Delivery In Days <span className="req_star">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                value={deliveryInDays}
                onChange={(e) => setDeliveryInDays(e.target.value)}
                placeholder="Delivery In Days"
              />
            </div>

            {/* Stock Left */}
            <div className="form-group">
              <label>
                Stock Left <span className="req_star">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                value={stockLeft}
                onChange={(e) => setStockLeft(e.target.value)}
                placeholder="Stock Left"
              />
            </div>

            {/* Submit Button */}
            <div className="d-flex justify-content-between gap-3 mt-3">
              {/* Upload Product Button */}
              <button
                type="submit"
                className="btn btn-success w-100 d-flex justify-content-center align-items-center p-3 shadow-lg"
              >
                <UploadIcon className="me-2" />
                <span>Upload Collection</span>
              </button>

              {/* View Single Product Button */}
              <button
                type="button"
                className="btn btn-primary w-100 d-flex justify-content-center align-items-center p-3 shadow-lg"
                onClick={() => navigate(`/adminCollectionsList/Admin`)}
              >
                <VisibilityIcon className="me-2" />
                <span>View Collection</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLakshmiCollectionsUpload;
