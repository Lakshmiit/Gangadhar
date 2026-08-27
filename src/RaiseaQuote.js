// import React, { useState, useEffect } from 'react';
// import { Button, Form, Row, Col } from 'react-bootstrap'; // Import Bootstrap components for modal
// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap/dist/js/bootstrap.bundle.min.js";
// import "./App.css";
// import { Dashboard as MoreVertIcon,} from '@mui/icons-material';
// import { useParams } from 'react-router-dom';
// import Sidebar from './Sidebar';
// import Header from './Header.js';
// import Footer from './Footer.js';

// const RaiseQuote = () => {
//   const {selectedUserType} = useParams();
//   const [isMobile, setIsMobile] = useState(false);
//   const [showMenu, setShowMenu] = useState(false);
//   const [materials, setMaterials] = useState([]);
//   const [quantity, setQuantity] = useState([]);
//   const [otherCharge, setOtherCharge] = useState("");
//   const [fixedOtherCharge, setFixedOtherCharge] = useState("");
//   const [serviceCharge, setServiceCharge] = useState("");
//   const [fixedServiceCharge, setFixedServiceCharge] = useState("");
//   const [gst, setGST] = useState("");
//   const [fixedGST, setFixedGST] = useState("");
//   const [totalAmount, setTotalAmount] = useState("");
//   const [addremarks, setAddRemarks] = useState("");
//   const [assignedTo, setAssignedTo] = useState('');
//   const [uploadedFiles, setUploadedFiles] = useState([]);
//   const [quote, setQuote] = useState("");
//   const [fixedQuote, setFixedQuote] = useState("");
//   const [discount, setDiscount] = useState("");
//   const [fixedDiscount, setFixedDiscount] = useState("");
//   const [formData, setFormData] = useState({
//     customerId: '',
//     subject: '',
//     details: '',
//     category: '',
//   });
//   const [showAlert, setShowAlert] = useState(false);
//   const [alertMessage, setAlertMessage] = useState('');
//   const [isWithMaterial, setIsWithMaterial] = useState(false);

//   // Handle form data changes
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));
//   };
  
//   // Detect screen size for responsiveness
//   useEffect(() => {
//     const handleResize = () => setIsMobile(window.innerWidth <= 768);
//     handleResize(); 
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   const calculateTotalPrice = (quote, discountPercentage, otherCharges, serviceChargePercentage, gstPercentage) => {
//     const discountAmount = quote * (discountPercentage / 100); 
//     const priceAfterDiscount = quote - discountAmount; 
//     const priceAfterOtherCharges = priceAfterDiscount + otherCharges; 
//     const serviceCharge = priceAfterDiscount * (serviceChargePercentage / 100); 
//     const priceAfterServiceCharge = priceAfterOtherCharges + serviceCharge; 
//     const gst = priceAfterServiceCharge * (gstPercentage / 100); 
//     const total = priceAfterServiceCharge + gst; 
//     return { total, gst }; 
// };

// const handleFixedChange = (setter, fixedSetter) => (e) => {
//   const value = parseFloat(e.target.value);
//   setter(value); 

//   if (setter === setDiscount) {
//     fixedSetter((quote * value) / 100); // Set discount amount
//     setFixedDiscount((quote * value) / 100); // Set fixed discount
//   } else if (setter === setGST) {
//     setFixedGST(gst); // Set only the GST portion
//     const { total } = calculateTotalPrice(quote, value, otherCharge, serviceCharge, gst);
//     setTotalAmount(total); // Update totalAmount state
//   } else if (setter === setOtherCharge) {
//     setFixedOtherCharge(value); // Set fixed other charges
//     const { total } = calculateTotalPrice(quote, discount, value, serviceCharge, gst);
//     setTotalAmount(total); // Update totalAmount state
//   } else if (setter === setServiceCharge) {
//     setFixedServiceCharge(value); // Set fixed service charge
//     const { total } = calculateTotalPrice(quote, discount, otherCharge, value, gst);
//     setTotalAmount(total); // Update totalAmount state
//   } else {
//     fixedSetter(value); // For other fields
//   }
// };

//   // Handle material input change
//   const handleMaterialChange = (index, value) => {
//     const updatedMaterials = [...materials];
//     updatedMaterials[index] = value;
//     setMaterials(updatedMaterials);
//   };

//   // Handle quantity input change
//   const handleInputChange = (index, value) => {
//     const updatedQuantities = [...quantity];
//     updatedQuantities[index] = value;
//     setQuantity(updatedQuantities);
//   };

//   // Add new material and quantity fields
//   const handleAddMaterial = () => {
//     setMaterials([...materials, ""]);
//     setQuantity([...quantity, ""]);
//   };

//   // Remove a material and its corresponding quantity
//   const handleRemoveMaterial = (index) => {
//     const updatedMaterials = materials.filter((_, i) => i !== index);
//     const updatedQuantities = quantity.filter((_, i) => i !== index);
//     setMaterials(updatedMaterials);
//     setQuantity(updatedQuantities);
//   };

//   // Handle file upload
//   const handleFileUpload = (e) => {
//     const files = Array.from(e.target.files);
//     setUploadedFiles((prevFiles) => [...prevFiles, ...files]);
//   };

//   // Handle file deletion
//   const handleFileDelete = (index) => {
//     const newUploadedFiles = [...uploadedFiles];
//     newUploadedFiles.splice(index, 1);
//     setUploadedFiles(newUploadedFiles);
//   };

//   // Handle preview and confirmation on ticket submission
//   const handleSaveTicket = (e) => {
//     e.preventDefault();

//     // Ensure all fields are filled before submitting
//     if (
//       !formData.customerId ||
//       !formData.subject ||
//       !formData.details ||
//       !formData.category ||
//       !assignedTo
//     ) {
//       setAlertMessage('Please fill in all mandatory fields.');
//       setShowAlert(true);
//       return;
//     }

//     setAlertMessage('Ticket has been submitted successfully! Customer Care will contact you shortly.');
//     setShowAlert(true);
//   };

//   useEffect(() => {
//     return () => {
//       uploadedFiles.forEach((file) => URL.revokeObjectURL(file));
//     };
//   }, [uploadedFiles]);


//   return (
//     <div>
//   {isMobile && <Header />}
//     <div className="d-flex flex-row justify-content-start align-items-start">
//        {/* Sidebar menu for Larger Screens */}
//        {!isMobile && (
//         <div className=" ml-0 m-4 p-0 sde_mnu">
//           <Sidebar userType={selectedUserType} />
//         </div>
//       )}

//       {/* Floating menu for mobile */}
//       {isMobile && (
//         <div className="floating-menu">
//           <Button
//             variant="primary"
//             className="rounded-circle shadow"
//             onClick={() => setShowMenu(!showMenu)}
//           >
//             <MoreVertIcon />
//           </Button>

//           {showMenu && (
//               <div className="sidebar-container">
//                 <Sidebar userType={selectedUserType} />
//               </div>
//           )}
//         </div>
//       )}

//     <div className={`container m-1 ${isMobile ? 'w-100' : 'w-75'}`}>
//       <h1 className="text-center mb-2">Raise a Quote</h1>

//       {/* Ticket Form */}
//       <Form onSubmit={handleSaveTicket}>
//         <Row>
//             <Col md={12}>
//             <Form.Group>
//           <label>Customer Ticket Number</label>
//           <Form.Control
//           type="text"
//           name="customerId"
//           value={FormData.customerId}
//           onChange={handleChange}
//           placeholder="Ticket Number"
//           required/>
//         </Form.Group>
//             </Col>

//         </Row>

//         {/* Subject */}
//         <Row>
//           <Col md={12}>
//             <Form.Group>
//               <label>Subject</label>
//               <Form.Control
//                 type="text"
//                 name="subject"
//                 value={formData.subject}
//                 onChange={handleChange}
//                 placeholder="Enter subject"
//                 required
//               />
//             </Form.Group>
//           </Col>
//         </Row>

//         {/* Details */}
//         <Form.Group>
//           <label>Details</label>
//           <Form.Control
//             as="textarea"
//             name="details"
//             value={formData.details}
//             onChange={handleChange}
//             rows="4"
//             placeholder="Enter details"
//             required
//           />
//         </Form.Group>

//         {/* Category */}
//         <Row>
//           <Col md={6}>
//             <Form.Group>
//               <label>Category</label>
//               <Form.Control
//                 as="select"
//                 name="category"
//                 value={formData.category}
//                 onChange={handleChange}
//                 required
//               >
//                 <option value="">Select Category</option>
//                 <option>Plumbing & Sanitary</option>
//                 <option>Electrical</option>
//                 <option>Painting</option>
//                 <option>Interior</option>
//                 <option>Carpentry</option>
//                 <option>Pest Control</option>
//                 <option>Electronics Appliance Repairs</option>
//                 <option>Tiles Repairs</option>
//                 <option>Civil Works</option>
//                 <option>Water Proofing Works</option>
//               </Form.Control>
//             </Form.Group>
//           </Col>
//         </Row>
//         {/* Assigned To */}
//         <Row>
//         <Col md={6}>
//             <Form.Group>
//               <label>Assigned To</label>
//               <Form.Control
//                 as="select"
//                 name="assignedTo"
//                 value={assignedTo}
//                 onChange={(e) => setAssignedTo(e.target.value)}
//                 required
//               >
//                 <option value="">Select</option>
//                 <option value="Customer Care">Customer Care</option>
//               </Form.Control>
//             </Form.Group>
//           </Col>
//         </Row>

//         {/* File Upload */}
//         <div className="form-group mt-4">
//           <label className="text-danger">View Query Photos or Videos</label>
//           <div className="d-flex flex-column align-items-center">
//             <button
//               className="btn btn-warning text-dark"
//               onClick={() => document.getElementById('fileInput').click()}
//             >
//               View
//             </button>
//             <input
//               type="file"
//               id="fileInput"
//               accept="image/*,video/*"
//               multiple
//               onChange={handleFileUpload}
//               className="d-none"
//             />
//           </div>
//         </div>

//         {/* File Preview */}
//         <div className="preview-container mt-3">
//           {uploadedFiles.length > 0 &&
//             uploadedFiles.map((file, index) => {
//               const fileUrl = URL.createObjectURL(file);
//               return (
//                 <div key={index} className="file-preview">
//                   <span>{file.name}</span>
//                   <button
//                     type="button"
//                     className="btn btn-danger btn-sm ml-2"
//                     onClick={() => handleFileDelete(index)}
//                   >
//                     Delete
//                   </button>
//                   <div className="mt-2">
//                     {/* Preview the file (image or video) */}
//                     {file.type.startsWith('image') && (
//                       <img
//                         src={fileUrl}
//                         alt={file.name}
//                         className="img-fluid"
//                         style={{ maxWidth: '200px' }}
//                       />
//                     )}
//                     {file.type.startsWith('video') && (
//                       <video
//                         controls
//                         src={fileUrl}
//                         className="img-fluid"
//                         style={{ maxWidth: '200px' }}
//                       />
//                     )}
//                   </div>
//                 </div>
//               );
//             })}

//           {/* Radio Buttons */}
//           <div className="radio">
//       <label className="m-1">
//         <input
//           className="form-check-input"
//           type="radio"
//           name="IsWithMaterial"
//           value="With Material"
//           checked={isWithMaterial === "With Material"}
//           onChange={(e) => setIsWithMaterial(e.target.value)}
//           required
//         />
//         With Material
//       </label>

//       <label className="m-1">
//         <input
//           className="form-check-input"
//           type="radio"
//           name="IsWithMaterial"
//           value="Without Material"
//           checked={isWithMaterial === "Without Material"}
//           onChange={(e) => setIsWithMaterial(e.target.value)}
//         />
//         Without Material
//       </label>

//           {/* Material Input Fields */}
//       {isWithMaterial === "With Material" && (
//         <div className="form-group">
//           <label>Required (Optional)</label>
//           {materials.map((material, index) => (
//             <div className="d-flex gap-3 mb-2" key={index}>
//               <input
//                 type="text"
//                 className="form-control"
//                 value={material}
//                 placeholder="Enter Material"
//                 onChange={(e) => handleMaterialChange(index, e.target.value)}
//               />
//               <input
//                 type="text"
//                 className="form-control"
//                 placeholder="Enter Quantity"
//                 value={quantity[index] || ""}
//                 onChange={(e) => handleInputChange(index, e.target.value)}
//               />
//               <button
//                 type="button"
//                 className="btn btn-danger"
//                 onClick={() => handleRemoveMaterial(index)}
//               >
//                 Remove
//               </button>
//             </div>
//           ))}
//           <button type="button" className="btn btn-primary" onClick={handleAddMaterial}>
//             Add Material
//           </button>
//         </div>
//       )}
//     </div>
//     </div>

// <table className="table table-bordered">
//   <tbody>
//     {/* Quote Amount */}
//     <tr>
//       <td>
//         <label htmlFor="quoteAmount">Enter Quote Amount</label>
//       </td>
//       <td colSpan="2">
//         <input
//             type="number"
//             className="form-control"
//             value={quote}
//             onChange={handleFixedChange(setQuote, setFixedQuote)}
//             placeholder="Enter Quote Amount"
//         />
//       </td>
//         <td colSpan="2">
//         <input
//           type="number"
//           className="form-control"
//           value={fixedQuote}
//           disabled
//           placeholder="Fixed Quote Amount"
//         />
//       </td>
//     </tr>

//     {/* Discount */}
//     <tr>
//       <td>
//         <label>Discount</label>
//       </td>
//       <td colSpan="2">
//         <input
//           type="number"
//           className="form-control"
//           value={discount}
//           onChange={handleFixedChange(setDiscount, setFixedDiscount)}
//           placeholder="Enter Discount"
//         />
//       </td>
//       <td colSpan="2">
//         <input
//           type="number"
//           className="form-control"
//           value={fixedDiscount}
//           disabled
//           placeholder="Fixed Discount"
//         />
//       </td>
//     </tr>

//     {/* Any Other Charges */}
//     <tr>
//       <td>
//         <label>Any Other Charges</label>
//       </td>
//       <td colSpan="2">
//         <input
//           type="number"
//           className="form-control"
//           value={otherCharge}
//           onChange={handleFixedChange(setOtherCharge, setFixedOtherCharge)}
//           placeholder="Enter Other Charges"
//         />
//       </td>
//       <td colSpan="2">
//         <input
//           type="number"
//           className="form-control"
//           value={fixedOtherCharge}
//           disabled
//           placeholder="Fixed Other Charges"
//         />
//       </td>
//     </tr>

//     {/* Service Charges */}
//     <tr>
//       <td>
//         <label>Service Charges</label>
//       </td>
//       <td colSpan="2">
//         <input
//           type="number"
//           className="form-control"
//           value={serviceCharge}
//           onChange={handleFixedChange(setServiceCharge, setFixedServiceCharge)}
//           placeholder="Enter Service Charges"
//         />
//       </td>
//       <td colSpan="2">
//         <input
//           type="number"
//           className="form-control"
//           value={fixedServiceCharge}
//           disabled
//           placeholder="Fixed Service Charges"
//         />
//       </td>
//     </tr>

//     {/* GST */}
//     <tr>
//       <td>
//         <label>GST</label>
//       </td>
//       <td colSpan="2">
//         <input
//           type="number"
//           className="form-control"
//           value={gst}
//           onChange={handleFixedChange(setGST, setFixedGST)}
//           placeholder="Enter GST"
//         />
//       </td>
//       <td colSpan="2">
//         <input
//           type="number"
//           className="form-control"
//           value={fixedGST}
//           disabled
//           placeholder="Fixed GST"
//         />
//       </td>
//     </tr>

//     {/* Total Amount */}
//         <tr>
//         <td>
//             <label>Total Amount</label>
//         </td>
//         <td colspan="4">
//             <input
//             type="number"
//             className="form-control text-end"
//             value={totalAmount}
//             readOnly
//             placeholder="Total Amount"
//             />
//         </td>
//         </tr>
//         </tbody>
//         </table>

//        {/* Add Remarks */}
//        <div className="form-group col-md-6">
//             <label>Add Remarks</label>
//             <input 
//             type="text"
//             className="form-control"
//             value={addremarks}
//             placeholder="Enter Remarks"
//             onChange={(e) => setAddRemarks(e.target.value)}
//             />
//         </div>

//         {/* Send Quote Button */}
//         <div className="mt-4">
//           <Button variant="success" type="submit">
//             Send Quote
//           </Button>
//         </div>
//       </Form>

//       {/* Success Alert */}
//       {showAlert && (
//         <div className="mt-4 alert alert-info" role="alert">
//           {alertMessage}
//         </div>
//       )}
//     </div>

//     </div>
//     <Footer /> 

//     {/* Styles for floating menu */}
// <style jsx>{`
//         .floating-menu {
//           position: fixed;
//           top: 80px; /* Increased from 20px to avoid overlapping with the logo */
//           left: 20px; /* Adjusted for placement on the left side */
//           z-index: 1000;
//         }
//         .menu-popup {
//           position: absolute;
//           top: 50px; /* Keeps the popup aligned below the floating menu */
//           left: 0; /* Aligns the popup to the left */
//           background: white;
//           border: 1px solid #ddd;
//           border-radius: 5px;
//           box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
//           width: 200px;
//         }
//         .menu-item {
//           padding: 10px;
//           border-bottom: 1px solid #ddd;
//           display: flex;
//           align-items: center;
//           justify-content: flex-start;
//         }
//         .menu-item:last-child {
//           border-bottom: none;
//         }
//       `}</style>
//   </div>
//   );
// };

// export default RaiseQuote;
