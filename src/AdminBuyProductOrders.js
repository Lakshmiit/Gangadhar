import React, { useState, useEffect } from "react";
import "./App.css";
import AdminSidebar from "./AdminSidebar";
import Footer from "./Footer.js";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowBack, Dashboard as MoreVertIcon } from "@mui/icons-material";
import ForwardIcon from "@mui/icons-material/Forward";
import { Button, Form, Row, Col } from "react-bootstrap";
// import { appConfig } from "./config.js";
const AdminBuyProductOrders = () => {
  const navigate = useNavigate();
  const { buyProductId } = useParams();
  const [buyProductTicketId, setBuyProductTicketId] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [productData, setProductData] = useState("");
  const [category, setCategory] = useState("");
  const [productSize, setProductSize] = useState("");
  const [productCatalogue, setProductCatalogue] = useState("");
  const [color, setColor] = useState("");
  const [selectedColors, setSelectedColors] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [requiredQuantity, setRequiredQuantity] = useState("");
  const [rate, setRate] = useState("");
  const [discount, setDiscount] = useState("");
  const [afterDiscount, setAfterDiscount] = useState("");
  const [productName, setProductName] = useState("");
  const [addressType, setAddressType] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [pincode, setPincode] = useState("");
  const [address, setAddress] = useState("");
  const [id, setId] = useState("");
  const [deliveryCharges, setDeliveryCharges] = useState(0);
  const [serviceCharges, setServiceCharges] = useState(0);
  const [totalPaymentAmount, setTotalPaymentAmount] = useState(0);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [technicianDetails, setTechnicianDetails] = useState("");
  const [invoiceDetails, setInvoiceDetails] = useState("");
  const [technicianConfirmationCode, setTechnicianConfirmationCode] =
    useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [productInvoice, setProdctInvoice] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [paymentMode, setPaymentMode] = useState("");
  const [transactionDetails, setTransactionDetails] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [date, setDate] = useState("");
  const [warrantyPeriod, setWarrantyPeriod] = useState("");
  const [error, setError] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [selectPincode, setSelectPincode] = useState("");
  const [selectTechnician, setSelectTechnician] = useState("");

  const location = useLocation();
  useEffect(() => {
    if (location.state) {
      const {
        productName,
        catalogue,
        productSize,
        color,
        rate,
        discount,
        afterDiscount,
        requiredQuantity,
        id,
      } = location.state;
      setProductName(productName);
      setProductCatalogue(catalogue);
      setProductSize(productSize);
      setColor(color);
      setRate(rate);
      setDiscount(discount);
      setAfterDiscount(afterDiscount);
      setRequiredQuantity(requiredQuantity);
      setId(id);
    }
  }, [location.state]);

  useEffect(() => {
    console.log(productData);
  }, [productData]);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await fetch(
          `https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/BuyProduct/GetBuyProductDetailsById/${buyProductId}`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch product data");
        }
        const data = await response.json();
        setProductData(data);
        setDate(data.date);
        setId(data.id);
        setBuyProductTicketId(data.buyProductId);
        setAddress(data.address);
        setCategory(data.category);
        setProductName(data.productName);
        setProductCatalogue(data.productCatalogue);
        setProductSize(data.productSize);
        setRate(data.rate);
        setDiscount(data.discount);
        setAfterDiscount(data.afterDiscountPrice);
        setSelectedColors(data.selectedColors);
        setTotalAmount(data.totalAmount);
        setRequiredQuantity(data.requiredQuantity);
        setAddressType(data.addressType);
        setCustomerId(data.customerId);
        setState(data.state);
        setDistrict(data.district);
        setPincode(data.zipCode);
        setMobileNumber(data.customerPhoneNumber);
        setColor(data.color);
        setCustomerName(data.customerName);
        setDeliveryCharges(data.deliveryCharges);
        setServiceCharges(data.serviceCharges);
        setTotalPaymentAmount(data.totalPaymentAmount);
        setTechnicianConfirmationCode(data.technicianConfirmationCode);
        setPaymentMode(data.paymentMode);
        setTransactionDetails(data.utrTransactionNumber);
        setTechnicianDetails(data.technicianDetils);
        setInvoiceDetails(data.invoiceDetails);
        setDeliveryDate(data.deliveryDate);
        setEmailAddress(data.customerEmail);
      } catch (error) {
        console.error("Error fetching product data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
  }, [buyProductId]);

  const handleTechnicianDetailsChange = (e) => {
    setTechnicianDetails(e.target.value);
    setError((prevErrors) => ({ ...prevErrors, technicianDetails: "" }));
  };

  const handleInvoiceDetailsChange = (e) => {
    setInvoiceDetails(e.target.value);
    setError((prevErrors) => ({ ...prevErrors, invoiceDetails: "" }));
  };

  const handleWarrantyPeriodChange = (e) => {
    setWarrantyPeriod(e.target.value);
    setError((prevErrors) => ({ ...prevErrors, warrantyPeriod: "" }));
  };

  const validateForm = () => {
    let newErrors = {};

    if (!technicianDetails)
      newErrors.technicianDetails = "Technician Details are required.";
    if (!invoiceDetails)
      newErrors.invoiceDetails = "Invoice Details are required.";
    if (!warrantyPeriod)
      newErrors.warrantyPeriod = "Warranty Period is required.";
    if (!assignedTo) newErrors.assignedTo = "Please select an assignedTo.";
    if (productInvoice.length === 0)
      newErrors.productInvoice = "Please upload an invoice.";
    if (assignedTo === "Technician") {
      if (!selectPincode) newErrors.selectPincode = "Pincode is required.";
      if (!selectTechnician)
        newErrors.selectTechnician = "Technician is required.";
    }
    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAssignedToChange = (e) => {
    const selectedAssignedTo = e.target.value;
    setAssignedTo(selectedAssignedTo);
    setError({});
    if (selectedAssignedTo === "Customer") {
      setSelectPincode("");
      setSelectTechnician("");
    }
  };

  const handleGetQuotation = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const payload = {
      BuyProductId: buyProductTicketId,
      id: id,
      date: date,
      Address: address,
      CustomerPhoneNumber: mobileNumber,
      category: category,
      status: "Assigned",
      productName: productName,
      ProductCatalogue: productCatalogue,
      productSize: productSize,
      rate: rate.toString(),
      discount: discount.toString(),
      afterDiscountPrice: afterDiscount.toString(),
      color: color,
      selectedColors: selectedColors,
      requiredQuantity: requiredQuantity.toString(),
      totalAmount: totalAmount.toString(),
      AssignedTo: "Customer",
      DeliveryCharges: deliveryCharges,
      ServiceCharges: serviceCharges,
      TotalPaymentAmount: totalPaymentAmount,
      AddressType: addressType,
      State: state,
      District: district,
      ZipCode: pincode,
      CustomerId: customerId,
      CustomerName: customerName,
      RequestedBy: customerName,
      PaymentMode: paymentMode,
      UTRTransactionNumber: transactionDetails,
      TechnicianConfirmationCode: technicianConfirmationCode,
      DeliveryDate: deliveryDate,
      TechnicianDetils: technicianDetails,
      ProductView: "Assigned",
      InvoiceDetails: invoiceDetails,
      UploadInvoice: uploadedFiles.map((file) => file.src),
      WarrentyPeriod: warrantyPeriod,
      CustomerEmail: emailAddress,
      OrderId: "",
      OrderDate: "",
      PaidAmount: "",
      TransactionStatus: "",
      TransactionType: "",
      InvoiceId: "",
      InvoiceURL: "",
    };

    try {
      const response = await fetch(
        `https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/BuyProduct/${buyProductId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok) {
        throw new Error("Failed to update Buy Product Invoice Details.");
      }
      alert("Product Order Forwarded to Customer Successfully!");
      navigate("/adminNotifications");
    } catch (error) {
      console.error("Error update Buy Product Invoice Details:", error);
      window.alert(
        "Failed to update Buy Product Invoice Details. Please try again later.",
      );
    }
  };

  // Detect screen size for responsiveness
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + productInvoice.length > 1) {
      alert("You can upload up to 1 file.");
      return;
    }
    setProdctInvoice([...productInvoice, ...files]);
    setShowAlert(true);
    setError((prev) => ({ ...prev, productInvoice: "" }));
  };

  const handleUploadFiles = async () => {
    setLoading(true);
    setShowAlert(false);
    const uploadedFilesList = [];
    for (let i = 0; i < productInvoice.length; i++) {
      const file = productInvoice[i];
      const fileName = file.name;
      const mimetype = file.type;
      const byteArray = await getFileByteArray(file);
      const response = await uploadFile(byteArray, fileName, mimetype, file);
      if (response) {
        uploadedFilesList.push({
          src: response,
          alt: fileName,
        });
      } else {
        alert("Failed Upload Invoice");
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
        `https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/FileUpload/upload?filename=` +
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

  useEffect(() => {
    return () => {
      uploadedFiles.forEach((file) => URL.revokeObjectURL(file));
    };
  }, [uploadedFiles]);

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
          <h3 className="mb-2 text-center">Buy Products Orders</h3>
          <div className="rounded-3 p-4 bx_sdw w-100">
            <form className="form" onSubmit={handleSubmit}>
              <div className="text-center">
                <strong className="m-2 fs-5">
                  Order Number:<span>{buyProductTicketId}</span>
                </strong>
              </div>
              <div className="form-group">
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
              <div className="form-group">
                <label>
                  Customer Address <span className="req_star">*</span>
                </label>
                <input
                  as="textarea"
                  type="text"
                  className="form-control"
                  value={`${address}, ${district}, ${state}, ${pincode} ${mobileNumber}`}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Customer Address"
                  readOnly
                />
              </div>
              <div className="form-group">
                <label>
                  Category <span className="req_star">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Category"
                  readOnly
                />
              </div>
              <div className="form-group">
                <label>
                  Product Name <span className="req_star">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Product Name"
                  readOnly
                />
              </div>
              <div className="form-group">
                <label>
                  Product Catalogue <span className="req_star">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={productCatalogue}
                  onChange={(e) => setProductCatalogue(e.target.value)}
                  placeholder="Product Catalogue"
                  readOnly
                />
              </div>
              <div className="row">
                <div className="col-md-6">
                  <label>
                    Product Size <span className="req_star">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={productSize}
                    onChange={(e) => setProductSize(e.target.value)}
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
                    value={rate}
                    onChange={rate}
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
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
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
                    value={afterDiscount}
                    placeholder="After Discount"
                    readOnly
                  />
                </div>
              </div>
              <div className="row">
                <div className="row ticket-info">
                  <div className="col-md-6">
                    <p>
                      <strong className="me-2">
                        {" "}
                        Choose Color (Optional):
                      </strong>
                      {color}
                    </p>
                    <p>
                      <strong className="me-2"> Select Required Color:</strong>
                      {selectedColors}
                    </p>
                    <p>
                      <strong className="me-2"> Required Quantity:</strong>
                      {requiredQuantity}
                    </p>
                    <p>
                      <strong className="me-2"> Total Amount:</strong>
                      {`Rs ${totalAmount}/-`}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p>
                      <strong className="me-2"> Delivery Charges:</strong>
                      {deliveryCharges}
                    </p>
                    <p>
                      <strong className="me-2"> Service Charges:</strong>
                      {serviceCharges}
                    </p>
                    <p>
                      <strong> Delivery Date: </strong>
                      {deliveryDate}
                    </p>
                    <p>
                      <strong> Total Payment Amount: </strong>
                      {`Rs ${totalPaymentAmount}/-`}
                    </p>
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
                      checked={paymentMode === "technician"}
                      readOnly
                    />
                    Pay On In Presence of Technician
                  </label>
                </div>

                <div className="form-group">
                  <label>Payment Transaction Details </label>
                  <input
                    type="text"
                    className="form-control "
                    value={transactionDetails}
                    onChange={(e) => setTransactionDetails(e.target.value)}
                    placeholder="Payment Transaction Details"
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>
                    Technician Details <span className="req_star">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={technicianDetails}
                    onChange={handleTechnicianDetailsChange}
                    placeholder="Enter Technician Details"
                    required
                  />
                  {error.technicianDetails && (
                    <p className="text-danger">{error.technicianDetails}</p>
                  )}
                </div>
                <div className="form-group">
                  <label>
                    Invoice Details <span className="req_star">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={invoiceDetails}
                    onChange={handleInvoiceDetailsChange}
                    placeholder="Enter Invoice Details"
                    required
                  />
                  {error.invoiceDetails && (
                    <p className="text-danger">{error.invoiceDetails}</p>
                  )}
                  <div className="form-group">
                    <label className="fs-5">
                      Warranty Period <span className="req_star">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={warrantyPeriod}
                      onChange={handleWarrantyPeriodChange}
                      placeholder="DD-MM-YYYY"
                      required
                    />
                    {error.warrantyPeriod && (
                      <p className="text-danger">{error.warrantyPeriod}</p>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="section-title fs-5 m-1">
                      Upload Invoice
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={handleFileChange}
                      required
                    />
                    {error.productInvoice && (
                      <p className="text-danger">{error.productInvoice}</p>
                    )}
                    {showAlert && (
                      <div className="alert alert-danger  mt-2">
                        <strong>Note:</strong> Invoice will be uploaded only
                        once; if uploaded, it cannot be changed.
                        <br />
                        Please click the <strong>Upload Invoice</strong> button
                        to upload the selected Invoice.
                      </div>
                    )}
                    <div className="mt-1">
                      {productInvoice.map((file, index) => (
                        <p key={index}>{file.name}</p>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary mt-1"
                      onClick={handleUploadFiles}
                      disabled={loading || productInvoice.length === 0}
                    >
                      {loading ? "Uploading..." : "Upload Invoice"}
                    </button>
                    {/* <button className='btn btn-warning m-1' onClick={handleUploadInvoice}
              >Save</button> */}
                  </div>
                </div>
                <div className="col-md-6">
                  <label>
                    Order Confirmation Code <span className="req_star">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={technicianConfirmationCode}
                    placeholder="Order Confirmation Code"
                    readOnly
                  />
                </div>

                <Row>
                  {/* Assigned To */}
                  <Col md={12}>
                    <Form.Group>
                      <label>Assigned To</label>
                      <Form.Control
                        as="select"
                        value={assignedTo}
                        onChange={handleAssignedToChange}
                        required
                      >
                        <option value="">Select Assigned</option>
                        <option value="Customer">Customer</option>
                      </Form.Control>
                      {error.assignedTo && (
                        <p className="text-danger">{error.assignedTo}</p>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
                <div className="mt-3 d-flex justify-content-between">
                  <Button
                    type="submit"
                    className="btn btn-warning text-white mx-2"
                    onClick={() => navigate(`/adminNotifications`)}
                    title="Forward"
                  >
                    <ArrowBack />
                  </Button>
                  <Button
                    type="submit"
                    className="btn btn-warning text-white mx-2"
                    onClick={handleGetQuotation}
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

export default AdminBuyProductOrders;
