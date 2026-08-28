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

const AdminLakshmiCollectionsUpdate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isMobile, setIsMobile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [collection, setCollection] = useState(null);
  const [collectionName, setCollectionName] = useState("");
  const [category, setCategory] = useState("");
  const [catalogue, setCatalogue] = useState("");
  const [collectionSize, setCollectionSize] = useState("");
  const [lakshmicollectionId, setLakshmiCollectionId] = useState("");
  const [collectionPhotos, setCollectionPhotos] = useState([]);
  const [rate, setRate] = useState("");
  const [discount, setDiscount] = useState("");
  const [specifications, setSpecifications] = useState([
    { name: "", value: "" },
  ]);
  const [date, setDate] = useState("");
  const [moreInfo, setMoreInfo] = useState("");
  const [deliveryInDays, setDeliveryInDays] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [color, setColor] = useState("");
  const [specificationDesc, setSpecificationDesc] = useState("");
  const { selectedUserType } = useParams();
  const [stockLeft, setStockLeft] = useState("");
  const [productVideos, setProductVideos] = useState([]);
  const [showPhotoAlert, setShowPhotoAlert] = useState(false);
  const [showVideoAlert, setShowVideoAlert] = useState(false);
  const [collectionStatus, setCollectionStatus] = useState("");
  const [error, setError] = useState(null);
  const [existingFiles, setExistingFiles] = useState([]);
  const [existingVideos, setExistingVideos] = useState([]);
  const [uploadedVideos, setUploadedVideos] = useState([]);

  useEffect(() => {
    console.log(error, collectionStatus);
  }, [error, collectionStatus]);

  useEffect(() => {
    const fetchCollectionData = async () => {
      try {
        setLoading(true);
        const collectionResponse = await fetch(
          `https://lmartapiv1-fxcyd2b4btacgsav.westus2-01.azurewebsites.net/api/UploadLakshmiCollection/GetLakshmiCollections?id=${id}`,
        );
        if (!collectionResponse.ok) {
          throw new Error("Product not found");
        }
        const collectionData = await collectionResponse.json();
        console.log("collectionData:", collectionData);
        setCollection(collectionData);
        setCollectionName(collectionData.productName);
        setLakshmiCollectionId(collectionData.lakshmicollectionId);
        setCollectionStatus(collectionData.status);
        setCategory(collectionData.category);
        setCatalogue(collectionData.catalogue);
        setColor(collectionData.colour);
        setCollectionSize(collectionData.size);
        setDate(collectionData.date);
        setRate(collectionData.rate);
        setDiscount(collectionData.discount);
        setSpecifications(
          collectionData.descriptions || [{ name: "", value: "" }],
        );
        setSpecificationDesc(collectionData.optional);
        setMoreInfo(collectionData.moreInfo);
        setDeliveryInDays(collectionData.deliveryInDays);
        setExistingFiles(collectionData.images || []);
        setExistingVideos(collectionData.videos || []);
        setStockLeft(collectionData.stockLeft);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchCollectionData();
    }
  }, [id]);

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
    if (selectedFiles.length + collectionPhotos.length > 5) {
      alert("You can only upload up to 5 files.");
      return;
    }
    setCollectionPhotos([...collectionPhotos, ...selectedFiles]);
    setShowPhotoAlert(true);
  };

  const handleRemoveExistingFile = (index) => {
    const updated = [...existingFiles];
    updated.splice(index, 1);
    setExistingFiles(updated);
  };

  const handleRemoveFile = (index) => {
    const updatedUploadedFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(updatedUploadedFiles);
  };

  const handleRemoveVideo = (index) => {
    const updatedUploadedVideos = uploadedVideos.filter((_, i) => i !== index);
    setUploadedVideos(updatedUploadedVideos);
  };

  const handleRemoveExistingVideo = (index) => {
    const updated = [...existingVideos];
    updated.splice(index, 1);
    setExistingVideos(updated);
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
    for (let i = 0; i < collectionPhotos.length; i++) {
      const file = collectionPhotos[i];
      const fileName = file.name;
      const mimeType = file.type;
      // Covert the file to a byte array (use FileReader)
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
        `https://lmartapiv1-fxcyd2b4btacgsav.westus2-01.azurewebsites.net/api/FileUpload/upload?filename=` +
          fileName,
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

    const allCollectionPhotos = [
      ...existingFiles,
      ...uploadedFiles.map((file) => file.src),
    ];
    const allCollectionVideos = [
      ...existingVideos,
      ...uploadedVideos.map((v) => v.src),
    ];

    const payload = {
      id: id,
      lakshmicollectionId: lakshmicollectionId,
      date: date,
      productName: collectionName,
      category: category,
      catalogue: catalogue,
      size: collectionSize,
      colour: color,
      images: allCollectionPhotos,
      videos: allCollectionVideos,
      rate: parseFloat(rate).toString(),
      discount: parseFloat(discount).toString(),
      afterDiscount: (
        parseFloat(rate) -
        (parseFloat(rate) * parseFloat(discount)) / 100
      ).toString(),
      descriptions: specifications.map((spec) => ({
        name: spec.name,
        value: spec.value,
      })),
      optional: specificationDesc,
      moreInfo: moreInfo,
      deliveryInDays: deliveryInDays,
      stockLeft: stockLeft,
      RequestedBy: "Admin",
      Status: collectionStatus,
    };

    try {
      const response = await fetch(
        `https://lmartapiv1-fxcyd2b4btacgsav.westus2-01.azurewebsites.net/api/UploadLakshmiCollection/UpdateLakshmiCollection?id=${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (response.ok) {
        alert("Collections updated successfully!");
        navigate(`/adminCollectionsList/Admin`);
      } else {
        alert("Failed to update Collection.");
      }
    } catch (error) {
      alert("An error occurred while updating the Collection.");
    }
  };

  // Handle change of specification field (label or value)
  const handleSpecificationChange = (index, field, value) => {
    const updatedSpecifications = [...specifications];
    updatedSpecifications[index][field] = value;
    setSpecifications(updatedSpecifications);
  };

  if (!collection) {
    return <div>No data available for the selected collection.</div>;
  }

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
    setSpecifications([...specifications, { name: "", value: "" }]);
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
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                placeholder="Enter Product Name"
              />
            </div>
            {/* Category */}
            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Enter Catalogue"
              />
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
                value={collectionSize}
                onChange={(e) => setCollectionSize(e.target.value)}
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
              {/* Render existing filenames from server */}
              {existingFiles.length > 0 && (
                <div className="mt-2">
                  <strong>Existing Photos:</strong>
                  {existingFiles.map((file, index) => (
                    <div
                      key={index}
                      className="d-flex align-items-center gap-2 mb-2"
                    >
                      <p>{file}</p>
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingFile(index)}
                        className="btn btn-danger btn-sm px-2 py-1"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Render newly added files */}
              {collectionPhotos.length > 0 && (
                <div className="mt-2">
                  <strong>New Uploads:</strong>
                  {collectionPhotos.map((file, index) => (
                    <div
                      key={index}
                      className="d-flex align-items-center gap-2 mb-2"
                    >
                      <p>{file.name}</p>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="btn btn-danger btn-sm px-2 py-1"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              {/* Alert for uploading files */}
              {showPhotoAlert && (
                <div className="alert alert-danger  mt-2">
                  Please click the <strong>Upload Files</strong> button to
                  upload the selected images.
                </div>
              )}
              <button
                type="button"
                className="btn btn-primary mt-2"
                onClick={handleUploadFiles}
                disabled={loading || collectionPhotos.length === 0}
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

              {/* Existing videos */}
              {existingVideos.length > 0 && (
                <div className="mt-2">
                  <strong>Existing Videos:</strong>
                  {existingVideos.map((file, index) => (
                    <div
                      key={index}
                      className="d-flex align-items-center gap-2 mb-2"
                    >
                      <span className="text-truncate">{file}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingVideo(index)}
                        className="btn btn-danger btn-sm px-2 py-1"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Newly selected (before upload) */}
              {productVideos.length > 0 && (
                <div className="mt-2">
                  <strong>New Selections (to be uploaded):</strong>
                  {productVideos.map((file, index) => (
                    <div
                      key={index}
                      className="d-flex align-items-center gap-2 mb-2"
                    >
                      <span>{file.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveVideo(index)}
                        className="btn btn-danger btn-sm px-2 py-1"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              )}

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
                    value={spec.name}
                    onChange={(e) =>
                      handleSpecificationChange(index, "name", e.target.value)
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
                <span>Update Collection</span>
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

export default AdminLakshmiCollectionsUpdate;
