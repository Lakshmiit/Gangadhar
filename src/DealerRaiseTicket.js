// import React, { useState, useEffect } from 'react';
// import { Button, Form, Row, Col } from 'react-bootstrap'; // Import Bootstrap components for modal
// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap/dist/js/bootstrap.bundle.min.js";
// import { Dashboard as MoreVertIcon,} from '@mui/icons-material';
// import "./App.css";
// import Sidebar from './Sidebar';
// import Footer from './Footer.js';
// import Header from './Header.js';
// import ForwardIcon from '@mui/icons-material/Forward';
// import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
// import {Link, useParams} from 'react-router-dom';

// const RaiseQuotation = () => {
//   const [isMobile, setIsMobile] = useState(false);
//   const [showMenu, setShowMenu] = useState(false);
//   const {raiseTicketId} = useParams();
//   const [id, setId] = useState('');
//   const [ticketData, setTicketData] = useState('');
//   const [subject, setSubject] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [attachments, setAttachments] = useState([]);
//   const [specifications, setSpecifications] = useState([{ material: "", quantity: "", price: "", total: "" }]);
//   const [commentsList, setCommentsList] = useState([{updatedDate: new Date(), commentText: ""}]);
//   const [requestType, setRequestType] = useState('');
//   const [customerId, setCustomerId] = useState('');
//   const [status, setStatus] = useState('');
//   const [gst, setGST] = useState("");
//   const [fixedOtherCharge, setFixedOtherCharge] = useState('');
//   const [raiseAQuoteId,setRaiseAQuoteId]=useState('');
//   const [fixedGST, setFixedGSTs] = useState('');
//   const [lowestBidder, setLowestBidder] = useState("");
//   const [othercharges, setOtherCharge] = useState("");
//   const [addrRmarks, setAddRemarks] = useState([{requestedDate: new Date(), remarks: ""}]);
//   const [assignedTo, setAssignedTo] = useState('');
//   const [isWithMaterial, setIsWithMaterial] = useState(false);
//     const [technicianDetails, setTechnicianDetails] = useState([]);
//     const [fixedServiceCharge, setFixedServiceCharge] = useState('');
//     const [discount, setDiscount] = useState("");
//     const [fixedDiscount, setFixedDiscount] = useState('');
//     const [totalAmount, setTotalAmount] = useState('');
//     const [serviceCharges, setServiceCharge] = useState('');
//     const [enterQuoteAmount, setQuote] = useState('');
//     const [fixedQuote, setFixedQuote] = useState('');
//     const [state, setState] = useState('');
//     const [district, setDistrict] = useState('')
//     const [zipCode, setZipcode] = useState('');
//     const [address, setAddress] = useState('');
//     const [rateQuotedBy, setRateQuotedBy] = useState("Customer Care");
//     const [material, setMaterialQuotation] = useState([{discounts: "", fixedDiscounts: "", deliveryCharges: "", fixedDeliveryCharges: "", serviceCharges: "", fixedServiceCharges: "", gsts: "", fixedGSTS: "", grandtotal: ""}])
//     const [category, setCategory] = useState('');
//     const {userType} = useParams();

//     useEffect(() => {
//       console.log(subject, loading, isWithMaterial, id, raiseAQuoteId, totalAmount, enterQuoteAmount, fixedQuote );
//     }, [subject, loading, isWithMaterial, id, raiseAQuoteId, totalAmount, enterQuoteAmount, fixedQuote]);

//     // Fetch data from API on component mount
//     useEffect(() => {
//       const apiUrl = `https://lmartapiv1-fxcyd2b4btacgsav.westus2-01.azurewebsites.net/api/RaiseAQuote/GetRaiseAQuoteDetailsByid?raiseAQuotetId=${raiseTicketId}`;
//       const fetchData = async () => {
//         try {
//           const response = await fetch(apiUrl);
//           const quotedata = await response.json();
//           setTechnicianDetails(quotedata);
//           setRaiseAQuoteId(quotedata.raiseAQuoteId);
//           setQuote(quotedata.enterQuoteAmount);
//           setFixedQuote(quotedata.fixedQuote);
//           setDiscount(quotedata.discount);
//           setFixedDiscount(quotedata.fixedDiscount);
//           setId(quotedata.id);
//           setGST(quotedata.gst);
//           setFixedGSTs(quotedata.fixedGST);
//           setOtherCharge(quotedata.othercharges);
//           setServiceCharge(quotedata.serviceCharges);
//           setFixedServiceCharge(quotedata.fixedServiceCharge);
//           setFixedOtherCharge(quotedata.fixedOtherCharge);
//         } catch (error) {
//           console.error('Error fetching data:', error);
//         }
//       };
//       fetchData();
//     }, [raiseTicketId]);

//     const handleMaterialChange = (index, field, value) => {
//       const updatedSpecifications = [...specifications];
//       updatedSpecifications[index][field] = field === "quantity" || field === "price" ? parseFloat(value) : value;

//       if (field === "quantity" || field === "price") {
//         const quantity = parseFloat(updatedSpecifications[index].quantity);
//         const price = parseFloat(updatedSpecifications[index].price);
//         updatedSpecifications[index].total = quantity * price;
//       }
//       setSpecifications(updatedSpecifications);
//     };

//     const handleRateQuotedByChange = (value) => {
//       setRateQuotedBy(value);
//     };

//     const materialAmount = () => specifications.reduce((sum, spec) => sum + Number(spec.total), 0);

// const calculateTotalPrice = () => {

//   setMaterialQuotation((prev) => {
//     const updated = [...prev];
//     const discount = updated[0]?.discounts;
//     const deliveryCharges = updated[0]?.deliveryCharges;
//     const serviceCharges = updated[0]?.serviceCharges;
//     const gst = updated[0]?.gsts;
//     const baseAmount = materialAmount();

//     const fixedDiscounts = baseAmount * (discount / 100);
//     const fixedDeliveryCharges = deliveryCharges;
//     const fixedServiceCharges = ((baseAmount - fixedDiscounts + deliveryCharges) * serviceCharges) / 100;;
//     const fixedGSTS = ((baseAmount - fixedDiscounts + deliveryCharges + serviceCharges) * gst) / 100;
//     const grandtotal =
//       baseAmount - fixedDiscounts + fixedDeliveryCharges + fixedServiceCharges + fixedGSTS;

//     updated[0] = {
//       ...updated[0],
//       fixedDiscounts,
//       fixedDeliveryCharges,
//       fixedServiceCharges,
//       fixedGSTS,
//       grandtotal,
//     };
//     return updated;
//   });

// };

// useEffect(() => {
//   calculateTotalPrice();
// });

//   useEffect(() => {
//         const fetchticketData = async () => {
//           try {
//             const response = await fetch(`https://lmartapiv1-fxcyd2b4btacgsav.westus2-01.azurewebsites.net/api/RaiseTicket/GetTicket/${raiseTicketId}`);
//             if (!response.ok) {
//               throw new Error('Failed to fetch ticket data');
//             }
//             const data = await response.json();
//             setTicketData(data);
//             setState(data.state);
//             setDistrict(data.district);
//             setZipcode(data.zipCode);
//             setAddress(data.address);
//             setSubject(data.subject);
//             setId(data.id);
//             setCustomerId(data.customerId);
//             setIsWithMaterial(data.isMaterialType);
//             setAssignedTo(data.assignedTo);
//             setStatus(data.status);
//             setRequestType(data.requestType || 'Without Material');
//             setAttachments(data.attachments);
//             setSpecifications(data.materials || [{ material: "", quantity: ""}]);
//             setMaterialQuotation(data.materialQuotation || [{ discounts: "", fixedDiscounts: "", deliveryCharges: "", fixedDeliveryCharges: "", serviceCharges: "", fixedServiceCharges: "", gsts: "", fixedGSTS: "", grandtotal: ""}])
//             setCommentsList(data.comments || [{ updatedDate: new Date(), commentText: ""}])
//           } catch (error) {
//             console.error('Error fetching ticket data:', error);
//           } finally {
//             setLoading(false);
//           }
//         };
//         fetchticketData();
//       }, [raiseTicketId]);

//       useEffect(() => {
//         if (technicianDetails.length > 0) {
//           const lowest = technicianDetails.reduce((prev, current) => {
//             const prevAmount = parseFloat(prev.totalAmount);
//             const currentAmount = parseFloat(current.totalAmount);
//             return currentAmount < prevAmount ? current : prev;
//           });
//           setTotalAmount(lowest.totalAmount);
//           setQuote(lowest.enterQuoteAmount);
//           setRaiseAQuoteId(lowest.raiseAQuoteId);
//           setId(lowest.id);
//           setFixedQuote(lowest.fixedQuote);
//           setDiscount(lowest.discount);
//           setFixedDiscount(lowest.fixedDiscount);
//           setGST(lowest.gst);
//           setFixedGSTs(lowest.fixedGST);
//           setOtherCharge(lowest.othercharges);
//           setFixedOtherCharge(lowest.fixedOtherCharge);
//           setServiceCharge(lowest.serviceCharges);
//           setFixedServiceCharge(lowest.fixedServiceCharge);
//           setLowestBidder(lowest.technicianId);
//           setSpecifications(lowest.materials);
//           setMaterialQuotation(lowest.materialQuotation);

//         } else {
//           setLowestBidder('');
//           setTotalAmount('');
//           setQuote('');
//           setFixedQuote('');
//           setDiscount('');
//           setFixedDiscount('');
//           setServiceCharge('');
//           setOtherCharge('')
//           setFixedOtherCharge('');
//           setFixedServiceCharge('');
//           setGST('');
//           setFixedGSTs('');
//         }
//       }, [technicianDetails, discount, fixedDiscount, othercharges, fixedOtherCharge, serviceCharges,fixedServiceCharge, gst, fixedGST]);

//   // Handle form data changes
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setTicketData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));
//   };

//   const handleAddRemarks = (index, field, value) => {
//     const updatedRemarks = [...addrRmarks];
//     updatedRemarks[index][field] = value;
//     setAddRemarks(updatedRemarks);
//   };

//   const handleSaveTicket = async (e) => {
//     e.preventDefault();

//     const payload = {
//       RaiseTicketId: ticketData.raiseTicketId,
//       date: new Date().toISOString(),
//       address: address,
//       subject: ticketData.subject,
//       details: ticketData.details,
//       category: category,
//       assignedTo: "Dealer/Trader",
//       id : raiseTicketId,
//       status: status,
//       InternalStatus: "Assigned",
//       TicketOwner: ticketData.customerId,
//       CustomerId: customerId,
//       state: state,
//       district: district,
//       ZipCode: zipCode,
//       RequestType: requestType,
//       attachments:attachments.map((file) => file.src),
//       materials: specifications.map((spec) => ({
//           material: spec.material,
//           quantity: spec.quantity,
//           price: "",
//           Total: "",
//       })),
//       comments: commentsList.map((comment) => ({
//           updatedDate: comment.updatedDate,
//           CommentText: comment.commentText,
//       })),
//       LowestBidderTechnicainId: lowestBidder,
//     };
//     try {

//       const response = await fetch(`https://lmartapiv1-fxcyd2b4btacgsav.westus2-01.azurewebsites.net/api/RaiseTicket/${raiseTicketId}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(payload),
//       });
//       if (!response.ok) {
//         throw new Error('Failed to save ticket data');
//       }
//       alert('Ticket saved Successfully!');
//     } catch (error) {
//       console.error('Error saving ticket data:', error);
//       window.alert('Failed to save the ticket data. Please try again later.')
//     }
//   };

// const handleUpdateTicket = async (e) => {
//   e.preventDefault();
//   const payload1 = {
//     id :"string",
//     ticketId: ticketData.raiseTicketId,
//     CustomerId: ticketData.customerId,
//     dealerId: "",
//     raiseTicketId: raiseTicketId,
//     raiseAQuoteDate: new Date().toISOString(),
//     raiseAQuoteByDealerId: "string",
//     addrRmarks: addrRmarks.map((comment) => ({
//       requestedDate: comment.requestedDate,
//       remarks: comment.remarks,
//   })),
//   materials: specifications.map((spec) => ({
//     material: spec.material,
//     quantity: spec.quantity,
//     price: spec.price.toString(),
//     total: spec.total.toString(),
// })),
// materialQuotation: material.map((mat) => ({
//   discount: mat.discounts.toString(),
//   fixedDiscount: mat.fixedDiscounts.toString(),
//   deliveryCharges: mat.deliveryCharges.toString(),
//   fixedDeliveryChargs: mat.fixedDeliveryCharges.toString(),
//   serviceCharge: mat.serviceCharges.toString(),
//   fixedServicecharges: mat.fixedServiceCharges.toString(),
//   gst: mat.gsts.toString(),
//   fixedGST: mat.fixedGSTS.toString(),
//   grandtotal: mat.grandtotal.toString(),
// })),
//   };
//   try {
//     const response = await fetch(`https://lmartapiv1-fxcyd2b4btacgsav.westus2-01.azurewebsites.net/api/RaiseAQuoteByDealer/CreateRaiseAQuoteByDealer`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(payload1),
//     });
//     if (!response.ok) {
//       throw new Error('Failed to save Dealer ticket data');
//     }
//     alert('Ticket  Dealer saved Successfully!');
//   } catch (error) {
//     console.error('Error saving Dealer ticket data:', error);
//     window.alert('Failed to save the Dealer ticket data. Please try again later.')
//   }
// };

//   const handleBothActions =  (e) => {
//     e.preventDefault();
//     handleSaveTicket(e);
//    handleUpdateTicket(e);
//   }

//   // Detect screen size for responsiveness
//   useEffect(() => {
//     const handleResize = () => setIsMobile(window.innerWidth <= 768);
//     handleResize();
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   return (
//     <>
//     <div>
//   {isMobile && <Header />}
//     <div className="d-flex flex-row justify-content-start align-items-start">
//       {!isMobile && (
//         <div className=" ml-0 m-4 p-0 sde_mnu h-90">
//           <Sidebar />
//         </div>
//       )}

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
//             <div className="sidebar-container">
//               <Sidebar />
//             </div>
//           )}
//         </div>
//       )}

//       <div className={`container m-1 ${isMobile ? 'w-100' : 'w-75'}`}>
//       <h1 className="text-center mb-2">Raise a Ticket Dealer</h1>

//       {/* Ticket Form */}
//       <Form onSubmit={handleSaveTicket}>
//         <Row>
//             <Col md={12}>
//             <Form.Group>
//           <label>Customer Ticket ID</label>
//           <Form.Control
//           type="text"
//           name="customerId"
//           value={ticketData.raiseTicketId}
//           onChange={handleChange}
//           placeholder="Ticket Number"
//           required/>
//         </Form.Group>
//         </Col>
//         </Row>

//         {/* Subject */}
//         <Row>
//           <Col md={12}>
//             <Form.Group>
//               <label>Subject</label>
//               <Form.Control
//                 type="text"
//                 name="subject"
//                 value={ticketData.subject}
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
//             value={ticketData.details}
//             onChange={handleChange}
//             rows="4"
//             placeholder="Enter details"
//             required
//           />
//         </Form.Group>

//         {/* Category */}
//         <Row>
//         <Col md={6}>
//             <Form.Group>
//               <label>Category</label>
//               <Form.Control
//                 as="select"
//                 name="category"
//                 value={category}
//                 onChange={(e) => setCategory(e.target.value)}
//                 required
//               >
//                 <option value="">Select</option>
//                 <option value="Electrical items">Electrical items</option>
//                 <option value="Plumbing Materials">Plumbing Materials</option>
//                 <option value="Sanitary items">Sanitary items</option>
//                 <option value="Electronics appliances">Electronics appliances</option>
//                 <option value="Paints">Paints</option>
//                 <option value="Hardware items">Hardware items</option>
//                 <option value="Civil Waterproofing Materials">Civil Waterproofing Materials</option>
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
//                 <option value="Customer Care">Dealer/Trader</option>
//               </Form.Control>
//             </Form.Group>
//           </Col>
//         </Row>
//           {/* Radio Buttons */}
//           <div className="radio">
//                   <div className="form-group">
//               <label>Rate Quoted By<span className="req_star">*</span></label>
//               <div className="radio">
//                 <label className="m-1">
//                   <input
//                   className="form-check-input m-2"
//                   type="radio"
//                   name="RateQuotedBy"
//                   value="Dealer/Trader"
//                   checked={rateQuotedBy === "Dealer/Trader"}
//                   onChange={(e) => handleRateQuotedByChange(e.target.value)}
//                   required
//                   />
//                   Dealer/Trader
//                 </label>
//               </div>
//             </div>

//           {/* Material Input Fields */}
//       {requestType === "With Material" && (
//         <div className="form-group">
//           <label>Required (Optional)</label>
//           {specifications.map((spec, index) => (
//             <div className="d-flex gap-3 mb-2" key={index}>
//               <input
//                 type="text"
//                 className="form-control"
//                 value={spec.material}
//                 placeholder="Enter Material"
//                 onChange={(e) => handleMaterialChange(index, "material", e.target.value)}
//               />
//               <input
//                 type="text"
//                 className="form-control"
//                 placeholder="Enter Quantity"
//                 value={spec.quantity}
//                 onChange={(e) => handleMaterialChange(index, "quantity", e.target.value)}
//               />
//               <input
//                 type="text"
//                 className="form-control"
//                 placeholder="Enter Price"
//                 value={spec.price}
//                 onChange={(e) => handleMaterialChange(index, "price", e.target.value)}
//               />
//               <input
//                 type="text"
//                 className="form-control"
//                 placeholder="Total"
//                 value={spec.total}
//                 onChange={(e) => handleMaterialChange(index, "total", e.target.value)}
//               />
//             </div>
//           ))}
//         </div>
//       )}
//     </div>

//     <table className="table table-bordered m-1">
//     <tbody>
//   {/* Quote Amount */}
//   <tr>
//     <td>
//       <label className="mb-0 fw-bold">Total</label>
//     </td>
//     <td colSpan="4">
//       <input
//         type="number"
//         className="form-control text-end"
//         value={materialAmount()}
//         readOnly
//       />
//     </td>
//   </tr>
//   <tr>
//     <td>
//       <label>Discount</label>
//     </td>
//     <td colSpan="2">
//       <input
//         type="number"
//         className="form-control"
//         value={material[0]?.discounts}
//         onChange={(e) =>
//           setMaterialQuotation((prev) => {
//             const updated = [...prev];
//             updated[0].discounts = parseFloat(e.target.value) || 0;
//             return updated;
//           })
//         }
//         placeholder="Enter Discount"
//       />
//     </td>
//     <td colSpan="2">
//       <input
//         type="number"
//         className="form-control"
//         value={material[0]?.fixedDiscounts}
//         readOnly
//         placeholder="Fixed Discount"
//       />
//     </td>
//   </tr>

//   {/* Delivery Charges */}
//   <tr>
//     <td>
//       <label htmlFor="deliveryCharges">Delivery Charges</label>
//     </td>
//     <td colSpan="2">
//       <input
//         type="number"
//         className="form-control"
//         value={material[0]?.deliveryCharges}
//         onChange={(e) =>
//           setMaterialQuotation((prev) => {
//             const updated = [...prev];
//             updated[0].deliveryCharges = parseFloat(e.target.value) || 0;
//             return updated;
//           })
//         }
//         placeholder="Enter Delivery Charges"
//       />
//     </td>
//     <td colSpan="2">
//       <input
//         type="number"
//         className="form-control"
//         value={material[0]?.fixedDeliveryCharges}
//         readOnly
//         placeholder="Fixed Delivery Amount"
//       />
//     </td>
//   </tr>

//   {/* Service Charges */}
//   <tr>
//     <td>
//       <label>Service Charges</label>
//     </td>
//     <td colSpan="2">
//       <input
//         type="number"
//         className="form-control"
//         value={material[0]?.serviceCharges}
//         onChange={(e) =>
//           setMaterialQuotation((prev) => {
//             const updated = [...prev];
//             updated[0].serviceCharges = parseFloat(e.target.value) || 0;
//             return updated;
//           })
//         }
//         placeholder="Enter Service Charges"
//       />
//     </td>
//     <td colSpan="2">
//       <input
//         type="number"
//         className="form-control"
//         value={material[0]?.fixedServiceCharges}
//         readOnly
//         placeholder="Fixed Service Charges"
//       />
//     </td>
//   </tr>

//   {/* GST */}
//   <tr>
//     <td>
//       <label>GST</label>
//     </td>
//     <td colSpan="2">
//       <input
//         type="number"
//         className="form-control"
//         value={material[0]?.gsts }
//         onChange={(e) =>
//           setMaterialQuotation((prev) => {
//             const updated = [...prev];
//             updated[0].gsts = parseFloat(e.target.value) || 0;
//             return updated;
//           })
//         }
//         placeholder="Enter GST"
//       />
//     </td>
//     <td colSpan="2">
//       <input
//         type="number"
//         className="form-control"
//         value={material[0]?.fixedGSTS}
//         readOnly
//         placeholder="Fixed GST"
//       />
//     </td>
//   </tr>

//   {/* Grand Total */}
//   <tr>
//     <td>
//       <label>Grand Total</label>
//     </td>
//     <td colSpan="4">
//       <input
//         type="number"
//         className="form-control text-end"
//         value={material[0]?.grandtotal}
//         readOnly
//         placeholder="Grand Total"
//       />
//     </td>
//   </tr>
// </tbody>
//  </table>

//        {/* Dealer Remarks */}
//        <div className="form-group col-md-6">
//           <label>Dealer Remarks</label>
//           {addrRmarks.map((remarks, index) => (
//             <div className="d-flex gap-3 mb-2" key={index}>
//               <input
//                 type="text"
//                 className="form-control"
//                 placeholder="Remarks"
//                 value={remarks.remarks}
//                 onChange={(e) => handleAddRemarks(index,"remarks", e.target.value)}
//               />
//             </div>
//           ))}
//         </div>

//         {/* Send Quote Button */}
//         <div className="mt-4 text-end">
//           <Link to={`/dealerNotifications/${userType}/${district}/${category}`} className="btn btn-warning text-white mx-2" title='Back'>
//             <ArrowLeftIcon />
//           </Link>
//           <Link onClick={handleBothActions} className="btn btn-warning text-white mx-2" title='Forward'>
//             <ForwardIcon />
//           </Link>
//         </div>
//       </Form>
//     </div>
//     </div>
//   </div>
//       <Footer />
// </>
//   );
// };

// export default RaiseQuotation;
