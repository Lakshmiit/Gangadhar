import React, { useState, useEffect } from "react";
import { Button, Form, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import AdminSidebar from "./AdminSidebar";
import Footer from "./Footer.js";
import { Dashboard as MoreVertIcon } from "@mui/icons-material";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ForwardIcon from "@mui/icons-material/Forward";
import { Link, useParams } from "react-router-dom";
import "./App.css";
import JSZip from "jszip";
import { saveAs } from "file-saver";
// import { appConfig } from "./config";

const ApartmentRaiseActionView = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { apartmentRaiseTicketId } = useParams();
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [apartmentData, setApartmentData] = useState("");
  const [loading, setLoading] = useState(true);
  const [attachments, setAttachments] = useState([]);
  const [pincode, setPincode] = useState("");
  const [status, setStatus] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [newPhotoCount, setPhotoCount] = useState(0);
  const [consentPersonName, setConsentPersonName] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [isSubscription, setIsSubscription] = useState("");
  const [numberOfFlats, setNumberOfFlats] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [userId, setUserId] = useState("");
  const [apartmentName, setApartmentName] = useState("");
  const [apartmentAddress, setApartmentAddress] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    console.log(
      status,
      apartmentData,
      paidAmount,
      paymentId,
      userId,
      totalAmount,
      numberOfFlats,
      isSubscription,
    );
  }, [
    status,
    apartmentData,
    paidAmount,
    paymentId,
    userId,
    totalAmount,
    numberOfFlats,
    isSubscription,
  ]);

  useEffect(() => {
    const fetchapartmentData = async () => {
      try {
        const response = await fetch(
          `https://lmartapiv1-fxcyd2b4btacgsav.westus2-01.azurewebsites.net/api/ApartmentRaiseTicket/GetApartmentMaintenanceRaiseTicket/${apartmentRaiseTicketId}`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch ticket data");
        }
        const data = await response.json();
        setApartmentData(data);
        setUserId(data.userId);
        setSubject(data.subject);
        setDetails(data.details);
        setState(data.state);
        setCategory(data.category);
        setDistrict(data.district);
        setApartmentName(data.apartmentName);
        setStatus(data.status);
        setPhoneNumber(data.phoneNumber);
        setNumberOfFlats(data.numberOfFlats);
        setTotalAmount(data.totalAmount);
        setConsentPersonName(data.consentPersonName);
        setApartmentAddress(data.apartmentAddress);
        setPincode(data.pincode);
        setPaymentId(data.paymentId);
        setPaidAmount(data.paidAmount);
        setIsSubscription(data.isSubscription);
        const imageRequests =
          data.attachments?.map((photo) =>
            fetch(
              `https://lmartapiv1-fxcyd2b4btacgsav.westus2-01.azurewebsites.net/api/FileUpload/download?generatedfilename=${photo}`,
            )
              .then((res) => res.json())
              .then((data) => ({
                src: photo,
                imageData: data.imageData,
              })),
          ) || [];
        const images = await Promise.all(imageRequests);
        setAttachments(images);
        setPhotoCount(images.length);
      } catch (error) {
        console.error("Error fetching Apartment data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchapartmentData();
  }, [apartmentRaiseTicketId]);

  const handleDownloadAllAttachments = async () => {
    if (attachments.length === 0) {
      alert("No files to download");
      return;
    }

    const zip = new JSZip();
    const folder = zip.folder("TicketAttachments");
    for (const attachment of attachments) {
      try {
        const response = await fetch(
          `data:image/jpeg;base64,${attachment.imageData}`,
        );
        const blob = await response.blob();
        folder.file(attachment.src.split("/").pop(), blob);
      } catch (error) {
        console.error("Error fetching attachment:", error);
      }
    }

    try {
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "TicketAttachments.zip");
    } catch (error) {
      console.error("Error generating ZIP:", error);
      alert("Failed to download attachments. Please try again.");
    }
  };

  // Detect screen size for responsiveness
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle form data changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setApartmentData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="d-flex flex-row justify-content-start align-items-start">
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

        <div className={`container m-1 ${isMobile ? "w-100" : "w-75"}`}>
          <h1 className="text-center mb-2">Apartment Raise a Ticket</h1>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group>
                  <label>Ticket ID</label>
                  <Form.Control
                    type="text"
                    name="ticketID"
                    value={apartmentData.apartmentRaiseTicketId}
                    onChange={handleChange}
                    placeholder="Ticket ID"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Subject */}
            <Row>
              <Col md={12}>
                <Form.Group>
                  <label>Subject</label>
                  <Form.Control
                    type="text"
                    name="subject"
                    value={subject}
                    onChange={handleChange}
                    placeholder="Subject"
                    required
                    readOnly
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Details */}
            <Form.Group>
              <label>Details</label>
              <Form.Control
                as="textarea"
                name="details"
                value={details}
                onChange={handleChange}
                rows="4"
                placeholder="Details"
                required
                readOnly
              />
            </Form.Group>

            {/* Apartment Name */}
            <Row>
              <Col md={12}>
                <Form.Group>
                  <label>Apartment Name</label>
                  <Form.Control
                    type="text"
                    name="ticketOwner"
                    value={apartmentName}
                    onChange={handleChange}
                    placeholder="Apartment Name"
                    required
                    readOnly
                  />
                </Form.Group>
              </Col>
            </Row>

            {/*Consent Person Name*/}
            <Row>
              <Col md={12}>
                <Form.Group>
                  <label>Consent Person Name</label>
                  <Form.Control
                    type="text"
                    name="customerName"
                    value={consentPersonName}
                    onChange={handleChange}
                    placeholder="Consent Person Name"
                    required
                    readOnly
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Apartment Address */}
            <Row>
              <Col md={12}>
                <Form.Group>
                  <label>Apartment Address</label>
                  <Form.Control
                    as="textarea"
                    type="text"
                    name="address"
                    value={[
                      apartmentAddress,
                      district,
                      state,
                      pincode,
                      phoneNumber,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                    onChange={handleChange}
                    placeholder="Apartment Address"
                    readOnly
                  />
                </Form.Group>
              </Col>
            </Row>

            {/*Number of Flats*/}
            <Row>
              <Col md={12}>
                <Form.Group>
                  <label>Number of Flats</label>
                  <Form.Control
                    type="text"
                    name="numberofFlats"
                    value={numberOfFlats}
                    onChange={handleChange}
                    placeholder="Number of Flats"
                    required
                    readOnly
                  />
                </Form.Group>
              </Col>
            </Row>
            {/* Total Amount */}
            <Row>
              <Col md={12}>
                <Form.Group>
                  <label>Total Amount</label>
                  <Form.Control
                    type="text"
                    name="totalAmount"
                    value={`Rs ${totalAmount}/-`}
                    onChange={handleChange}
                    placeholder="Total Amount"
                    required
                    readOnly
                  />
                </Form.Group>
              </Col>
            </Row>
            {/* Category */}
            <Row>
              <Col md={12}>
                <Form.Group>
                  <label>Category</label>
                  <Form.Control
                    type="text"
                    name="category"
                    value={category}
                    onChange={handleChange}
                    placeholder="Category"
                    required
                    readOnly
                  ></Form.Control>
                </Form.Group>
              </Col>
            </Row>

            {/*Attachments*/}
            <div className="form-group mt-4">
              <label>
                Uploaded Photos{" "}
                {newPhotoCount > 0 && (
                  <span
                    className="badge bg-danger"
                    style={{ fontSize: "18px" }}
                  >
                    {newPhotoCount}
                  </span>
                )}
              </label>
              <Button
                className="btn btn-primary m-3"
                onClick={handleDownloadAllAttachments}
              >
                Download All Attachments
              </Button>

              <div
                id="ticketCarousel"
                className="carousel slide mb-4 rounded"
                data-bs-ride="carousel"
              >
                <div className="carousel-indicators">
                  {attachments.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      data-bs-target="#ticketCarousel"
                      data-bs-slide-to={index}
                      className={index === 0 ? "active" : ""}
                      aria-current={index === 0 ? "true" : "false"}
                      aria-label={`Slide ${index + 1}`}
                    ></button>
                  ))}
                </div>

                <div className="carousel-inner">
                  {attachments.map((img, index) => (
                    <div
                      className={`carousel-item ${index === 0 ? "active" : ""}`}
                      key={img.src}
                    >
                      <img
                        src={`data:image/jpeg;base64,${img.imageData}`}
                        className="d-block w-50 rounded"
                        style={{ maxHeight: "200px", objectFit: "cover" }}
                        alt={`Slide ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>

                <button
                  className="carousel-control-prev"
                  type="button"
                  data-bs-target="#ticketCarousel"
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
                  data-bs-target="#ticketCarousel"
                  data-bs-slide="next"
                >
                  <span
                    className="carousel-control-next-icon"
                    aria-hidden="true"
                  ></span>
                  <span className="visually-hidden">Next</span>
                </button>
              </div>
            </div>

            {/* Assigned To */}
            <Row>
              <Col md={12}>
                <Form.Group>
                  <label>Assigned To</label>
                  <Form.Control
                    as="select"
                    name="assignedTo"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    required
                  >
                    <option>Select Assigned</option>
                    <option>Technical Agency</option>
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>

            <div className="mt-4 text-end">
              <Link
                to="/apartmentNotificationGrid"
                className="btn btn-warning text-white mx-2"
                title="Back"
              >
                <ArrowLeftIcon />
              </Link>
              <Button
                type="submit"
                className="btn btn-warning text-white mx-2"
                title="Forward"
              >
                <ForwardIcon />
              </Button>
            </div>
          </Form>
        </div>
        {/* Styles for floating menu */}
        <style jsx>{`
          .floating-menu {
            position: fixed;
            top: 80px; /* Increased from 20px to avoid overlapping with the logo */
            left: 20px; /* Adjusted for placement on the left side */
            z-index: 1000;
          }
          .menu-popup {
            position: absolute;
            top: 50px; /* Keeps the popup aligned below the floating menu */
            left: 0; /* Aligns the popup to the left */
            background: white;
            border: 1px solid #ddd;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            width: 200px;
          }
        `}</style>
      </div>
      <Footer />
    </>
  );
};

export default ApartmentRaiseActionView;
