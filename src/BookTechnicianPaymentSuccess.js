// import React, { useEffect, useState } from "react";
// import { useLocation, Link } from "react-router-dom";
// import HandymanLogo from './img/Hm_Logo 1.png';
// const PaymentSuccess = () => {
//   const location = useLocation();
//   const queryParams = new URLSearchParams(location.search);
//   const paymentId = queryParams.get("paymentId");
//    const orderId = queryParams.get("orderId");
//   const amount = queryParams.get("amount");
//   const id = queryParams.get("id");
//   const address = queryParams.get("address");
//  const [orderBooking, setOrderBooking] = useState('');
//   const [loading, setLoading] = useState(true);
//  const [customerId, setUserId] = useState("");
//  const [totalAmount,setTotalAmount] =useState("");
//  const [statusMessage, setStatusMessage] = useState("Updating payment status...");

// useEffect(() => {
//   console.log(loading, orderBooking);
// }, [loading, orderBooking]);

// useEffect(() => {
//     fetch(`https://localhost:7091/api/BookTechnician/GetBookTechnician/${id}`)
//       .then((res) => res.json())
//       .then((data) => {
//         setOrderBooking(data);
//         setTotalAmount(data.totalAmount)
//         setUserId(data.customerId);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("❌ Error loading booking:", err);
//         setLoading(false);
//       });
//   }, [id]);

//   // ✅ Step 1: Call API on page load
//   useEffect(() => {
//     const updatePayment = async () => {
//       try {
//         const payload = {
//           id: id,
//           orederId: orderId,
//           orderDate: new Date().toISOString().split("T")[0], // yyyy-MM-dd
//           PaidAmount: totalAmount,
//           transactionStatus: "Success",
//           transactionType: "Payment",
//           invoiceId: "your-invoice-id",
//           invoiceURL: "your-invoice-url",
//           uTRNumber: paymentId,
//         };

//         const response = await fetch(
//           "https://localhost:7091/api/BookTechnician/bookTechnicianEdit",
//           {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(payload),
//           }
//         );

//         if (response.ok) {
//           setStatusMessage("✅ Payment updated successfully.");
//         } else {
//           // const error = await response.text();
//           // setStatusMessage("❌ Failed to update payment: " + error);
//         }
//       } catch (error) {
//         setStatusMessage("❌ Error: " + error.message);
//       }
//     };

//     updatePayment();
//   }, [paymentId, orderId, totalAmount, id]);

//   // ✅ Step 2: Render UI
//   return (
//     <div className="mt-5 h-100 d-flex align-items-center py-2 flex-column">
//       <div className="login_section rounded-3 p-4">
//         <div className="rgt_cnt text-center">
//           <img
//             src={HandymanLogo}
//             alt="Handy Man Logo"
//             className="d-block mx-auto"
//             style={{ maxWidth: "150px" }}
//           />
//           <h4>Handyman Service Providers Payment</h4>

//           <div className="thank-you">Order Details</div>
//           <div className="payment-msg">
//             Thank you for your payment. Your transaction was successful.
//           </div>
//           <p>{statusMessage}</p>

//           <table className="table mt-3 text-start">
//             <tbody>
//               <tr>
//                 <th>Job Description</th>
//                 <td>{orderBooking.jobDescription}</td>
//               </tr>
//               <tr>
//                 <th>Payment ID</th>
//                 <td>{paymentId}</td>
//               </tr>
//               <tr>
//                 <th>Ticket ID</th>
//                 <td>{orderBooking.bookTechnicianId}</td>
//               </tr>
//               <tr>
//                 <th>Paid Amount</th>
//                 <td>₹ {amount}</td>
//               </tr>
//               <tr>
//                 <th>Address</th>
//                 <td>{address}</td>
//               </tr>
//               <tr>
//                 <th></th>
//                 <td>
//                   <Link to={`/profilePage/customer/${customerId}`} className="btn btn-primary">
//                     Back
//                   </Link>
//                 </td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PaymentSuccess;
