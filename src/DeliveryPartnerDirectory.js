// import React, { useState, useEffect } from "react";
// import { Button, Modal } from "react-bootstrap";
// import axios from 'axios';
// import AdminSidebar from "./AdminSidebar";
// import Footer from './Footer.js';
// import { Link } from "react-router-dom";
// import { FaTrash, FaEye } from "react-icons/fa";
// import {
//   Dashboard as MoreVertIcon,
//   Forward as ForwardIcon,
// } from "@mui/icons-material";
// import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
// import "./App.css";

// const DeliveryPartnerDirectory = () => {
//  const [assignedTo, setAssignedTo] = useState("");
//   const [isMobile, setIsMobile] = useState(false);
//   const [showMenu, setShowMenu] = useState(false);
//   const [deliveryData, setDeliveryData] = useState([]);
//  const [zipCode, setZipcode] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [filteredData, setFilteredData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [pinCodes, setPinCodes] = useState([]);
//   const [assigned, setAssigned] = useState([]);
//   const [showModal, setShowModal] = useState(false);
// const [selectedItem, setSelectedItem] = useState(null);
// const [approving, setApproving] = useState(false);
// const [detailsLoading] = useState(false);
// const [detailsError, setDetailsError] = useState("");
//  const [districtList, setDistrictList] = useState([]);
//   const [stateList, setStateList] = useState([]);
//   const [district, setDistrict] = useState("");
//   const [districtId, setDistrictId] = useState("");
//   const [stateId, setStateId] = useState(null);
//   const [state, setState] = useState("");
//   const rowsPerPage = 15;

//   useEffect(() => {
//     console.log(state, district, loading);
//   }, [state, district, loading]);

//   const handleOpenModal = async (row) => {
//   setSelectedItem(row);
//   setShowModal(true);
//   };

//   const handleCloseModal = () => {
//   setShowModal(false);
//   setSelectedItem(null);
//   setDetailsError("");
// };

//   useEffect(() => {
//     axios.get("https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/MasterData/getStates")
//       .then((res) => {
//         setStateList(res.data || []);
//         setStateId("");
//       })
//       .catch((err) => console.error("Error fetching states:", err));
//   }, []);

//   useEffect(() => {
//     if (!stateId) { setDistrictList([]); return; }
//     axios.get(`https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/MasterData/getDistricts/${stateId}`)
//       .then((res) => setDistrictList(res.data || []))
//       .catch((err) => console.error("Error fetching districts:", err));
//   }, [stateId]);

//   useEffect(() => {
//     setLoading(true);
//     const url = ``
//     axios.get(url)
//       .then(response => {
//         const technicians = response.data.map((technician) => ({
//           ...technician,
//         }));
//         const assignedTechnicians = technicians.filter((technician) =>  (technician.status === "Assigned"));
//         setFilteredData(assignedTechnicians);
//         setDeliveryData(assignedTechnicians);
//         const uniquePinCode = [...new Set(technicians.map(technician => technician.zipCode))];
//         const uniqueAssigned = [...new Set(technicians.map(technician => technician.assignedTo))]
//         setPinCodes(uniquePinCode);
//         setAssigned(uniqueAssigned);
//       })
//       .catch(error => {
//         console.error("Error fetching ticket data:", error);
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   }, []);

//   const handleDelete = (technicianId) => {
//     const confirmDelete = window.confirm('Are you sure you want to delete this ticket?');
//     if (confirmDelete) {
//       axios.delete(`https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/RaiseTicket/${technicianId}`)
//         .then(() => {
//           setDeliveryData(prevData => prevData.filter(technician => technician.id !== technicianId));
//           setFilteredData(prevData => prevData.filter(technician => technician.id !== technicianId));
//         })
//         .catch(error => {
//           console.error("Error deleting ticket:", error);
//         });
//     }
//   };

//   useEffect(() => {
//   let filtered = deliveryData;
//   const stateObj = stateList.find(s => String(s.StateId) === String(stateId));
//   const stateName = stateObj?.StateName || "";

//   const districtObj = districtList.find(d => String(d.DistrictId) === String(districtId));
//   const districtName = districtObj?.DistrictName || "";

//   if (stateId) {
//     filtered = filtered.filter(t =>
//       String(t.stateId) === String(stateId) ||
//       t.state === stateName
//     );
//   }

//   if (districtId) {
//     filtered = filtered.filter(t =>
//       String(t.districtId) === String(districtId) ||
//       t.district === districtName
//     );
//   }

//   if (zipCode) filtered = filtered.filter(t => t.zipCode === zipCode);
//   if (assignedTo) filtered = filtered.filter(t => t.assignedTo === assignedTo);

//   setFilteredData(filtered);
//   setCurrentPage(1);
// }, [stateId, districtId, zipCode, assignedTo, deliveryData, stateList, districtList]);

//   useEffect(() => {
//     const handleResize = () => setIsMobile(window.innerWidth <= 768);
//     handleResize();
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   const handleApprove = async () => {
//   if (!selectedItem) return;
//   try {
//     setApproving(true);
//     await axios.put(
//       ``,
//       { status: "Approved" }
//     );
//     setDeliveryData((prev) =>
//       prev.map((t) =>
//         t.id === selectedItem.id ? { ...t, status: "Approved" } : t
//       )
//     );
//     setFilteredData((prev) =>
//       prev.map((t) =>
//         t.id === selectedItem.id ? { ...t, status: "Approved" } : t
//       )
//     );
//     setSelectedItem((prev) => ({ ...prev, status: "Approved" }));
//   } catch (e) {
//     alert("Failed to approve. Please try again.");
//   } finally {
//     setApproving(false);
//   }
// };

//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//   };

//  // Get paginated data
//  const indexOfLastTicket = currentPage * rowsPerPage;
//  const indexOfFirstTicket = indexOfLastTicket - rowsPerPage;
//  const currentBookTechnician = filteredData.slice(indexOfFirstTicket, indexOfLastTicket);

//   return (
//     <>
//     <div className="d-flex flex-row justify-content-start align-items-start mt-mob-50">
//       {!isMobile && (
//         <div className="ml-0 m-4 p-0 adm_mnu">
//           <AdminSidebar />
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
//                 <AdminSidebar />
//               </div>
//           )}
//         </div>
//       )}

//       <div className={`container m-1 ${isMobile ? "w-100" : "w-75"}`}>
//         <h2 className="text-center mb-2">Delivery Partner Notifications</h2>
//         <div className={`d-flex ${isMobile ? "flex-column" : "flex-wrap"} align-items-center justify-content-between`}>
//          {/* State */}
//         <div className="form-group col-12 col-md-2 m-2">
//         <label>State <span className="req_star">*</span></label>
//         <select
//             className="form-control"
//             value={stateId || ""}
//             onChange={(e) => {
//             const selectedId = e.target.value;
//             setStateId(selectedId);
//             const selectedState = (stateList || []).find(
//                 (s) => s?.StateId?.toString() === selectedId
//             );
//             setState(selectedState ? selectedState.StateName : "");
//             setDistrictId("");
//             setDistrict("");
//             }}
//             required>
//             <option value="">Select State</option>
//             {(Array.isArray(stateList) ? stateList : [])
//             .filter((s) => s && s.StateId && s.StateName)
//             .map((s) => (
//                 <option key={s.StateId} value={s.StateId.toString()}>
//                 {s.StateName}
//                 </option>
//             ))}
//         </select>
//         </div>

//         {/* District */}
//         <div className="form-group col-12 col-md-2 m-2">
//         <label>District <span className="req_star">*</span></label>
//         <select
//             className="form-control"
//             value={districtId || ""}
//             onChange={(e) => {
//             const selectedId = e.target.value;
//             setDistrictId(selectedId);
//             const selectedDistrict = (districtList || []).find(
//                 (d) => d?.districtId?.toString() === selectedId
//             );
//             setDistrict(selectedDistrict ? selectedDistrict.districtName : "");
//             }}
//             disabled={!stateId}
//             required>
//             <option value="">
//             {stateId ? "Select District" : "Select State first"}
//             </option>
//             {(Array.isArray(districtList) ? districtList : []).map((d) => (
//             <option key={d.districtId} value={d.districtId.toString()}>
//                 {d.districtName}
//             </option>
//             ))}
//         </select>
//         </div>

//           {/* Pin Code */}
//           <div className="form-group col-12 col-md-2 m-2">
//             <label>Pin Code</label>
//             <select
//               className="form-control"
//               value={zipCode}
//               onChange={(e) => setZipcode(e.target.value)}
//             >
//               <option value="">Select Pincode</option>
//               {pinCodes.map((pinCodeOption, index) => (
//                 <option key={index} value={pinCodeOption}>{pinCodeOption}</option>
//               ))}
//             </select>
//           </div>

//           {/* Assigned To */}
//           <div className="form-group col-12 col-md-2 m-2">
//             <label>Assigned To</label>
//             <select
//               className="form-control"
//               value={assignedTo}
//               onChange={(e) => setAssignedTo(e.target.value)}
//             >
//               <option value="">Select Assigned To</option>
//               {assigned.map((assignedOption, index) => (
//                 <option key={index} value={assignedOption}>{assignedOption}</option>
//               ))}
//             </select>
//           </div>
//         </div>

//         <>
//         {currentBookTechnician.length > 0 ? (
//         !isMobile ? (
//         <table className="table table-bordered">
//           <thead>
//             <tr>
//               <th>Customer ID</th>
//               <th>Ticket ID</th>
//               <th>Category</th>
//               <th>Job Description</th>
//               <th>Assigned To</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {currentBookTechnician.map((technician, index) => (
//               <tr key={index}>
//                 <td>{technician.customerId}</td>
//                 <td>{technician.bookTechnicianId}</td>
//                 <td>{technician.category}</td>
//                 <td>{technician.jobDescription}</td>
//                 <td>{technician.assignedTo}</td>
//                 <td className="d-flex align-items-center">
//                   <Button
//                     variant="info"
//                     className="mx-2"
//                     onClick={() => handleOpenModal(technician)}
//                     title="View"
//                     >
//                     <FaEye />
//                     </Button>
//                   <Link
//                     onClick={() => handleDelete(technician.id)}
//                     className="btn btn-danger mx-2"
//                   >
//                     <FaTrash />
//                   </Link>
//                   <Link to="#" className="btn btn-success mx-2">
//                     <ForwardIcon />
//                   </Link>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//         ) : (
//           <div className="mobile-ticket-grid">
//   {currentBookTechnician.map((technician, index) => (
//     <div key={index} className="ticket-card">
//       <div className="ticket-body">
//       <strong>Customer ID:</strong> {technician.customerId} <br />
//       <strong>Ticket ID:</strong> {technician.bookTechnicianId}
//         <p><strong>Category:</strong> {technician.category}</p>
//         <p><strong>Description:</strong> {technician.jobDescription}</p>
//         <p><strong>Assigned To:</strong> {technician.assignedTo}</p>
//       </div>
//       <div className="ticket-actions">
//       <Link
//                     to={`/bookTechnicianAdminView/${technician.id}`}
//                     className="btn btn-info mx-2"
//                   >
//                     <FaEye />
//                   </Link>
//                   <Link
//                     onClick={() => handleDelete(technician.id)}
//                     className="btn btn-danger mx-2"
//                   >
//                     <FaTrash />
//                   </Link>
//                   <Link to="#" className="btn btn-success mx-2">
//                     <ForwardIcon />
//                   </Link>
//       </div>
//     </div>
//   ))}
// </div>
//         )
//       ) : (
//         <p className="text-center text-muted">No Tickets Data Found</p>

//         )}
//       </>

//         <div className="mt-4 text-end">
//           <Link to='/adminNotifications' className="btn btn-warning text-white mx-2" title='Back'>
//             <ArrowLeftIcon />
//           </Link>
//         </div>
//         {/* Pagination */}
//         <div className="d-flex justify-content-center mt-3">
//           <nav aria-label="Page navigation">
//             <ul className="pagination">
//               {[...Array(Math.ceil(filteredData.length / rowsPerPage))].map(
//                 (_, index) => (
//                   <li
//                     key={index}
//                     className={`page-item ${
//                       index + 1 === currentPage ? "active" : ""
//                     }`}
//                   >
//                     <button
//                       className="page-link"
//                       onClick={() => handlePageChange(index + 1)}
//                     >
//                       {index + 1}
//                     </button>
//                   </li>
//                 )
//               )}
//             </ul>
//           </nav>
//         </div>
//       </div>
//       <Modal show={showModal} onHide={handleCloseModal} centered size="md">
//   <Modal.Header closeButton>
//     <Modal.Title>Delivery Partner Details</Modal.Title>
//   </Modal.Header>

//   <Modal.Body>
//     {detailsLoading ? (
//       <div className="text-center py-4">Loading details…</div>
//     ) : selectedItem ? (
//       <>
//         <div className="d-flex align-items-start gap-3 mb-3">
//           <img
//             src={selectedItem.photoUrl || selectedItem.photo || "/placeholder.png"}
//             alt="Partner"
//             style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }}
//             onError={(e) => (e.currentTarget.src = "/placeholder.png")}
//           />
//           <div>
//             <div><strong>Name:</strong> {selectedItem.name || selectedItem.customerName || "N/A"}</div>
//             <div><strong>Phone:</strong> {selectedItem.phone || selectedItem.customerPhoneNumber || "N/A"}</div>
//             <div><strong>Status:</strong> {selectedItem.status || "N/A"}</div>
//           </div>
//         </div>

//         <div className="mb-2">
//           <strong>Address:</strong>
//           <div>
//             {[
//               selectedItem.address,
//               selectedItem.district,
//               selectedItem.state,
//               selectedItem.zipCode,
//             ].filter(Boolean).join(", ") || "N/A"}
//           </div>
//         </div>

//         {detailsError && (
//           <div className="alert alert-danger my-2">{detailsError}</div>
//         )}
//       </>
//     ) : (
//       <div className="text-muted">No details</div>
//     )}
//   </Modal.Body>

//   <Modal.Footer>
//     <Button variant="secondary" onClick={handleCloseModal}>
//       Close
//     </Button>
//     <Button
//       variant="success"
//       onClick={handleApprove}
//       disabled={approving || (selectedItem?.status || "").toLowerCase() === "approved"}
//     >
//       {approving ? "Approving…" : "Approve"}
//     </Button>
//   </Modal.Footer>
// </Modal>

//       {/* Styles for floating menu */}
// <style jsx>{`
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
//       `}</style>
//     </div>
//           <Footer />
//       </>
//   );
// };

// export default DeliveryPartnerDirectory;
