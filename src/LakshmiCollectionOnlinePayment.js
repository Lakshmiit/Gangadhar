// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import HandymanLogo from './img/Hm_Logo 1.png';

// const LakshmiCollectionsOnlinePayment = () => {
//   const { collectionId } = useParams();
//   const navigate = useNavigate();
//   const [orderBooking, setOrderBooking] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [userId, setUserId] = useState('');
//   const [grandTotal,setGrandTotal] = useState('');
//   const [lakshmiCollectionId,setLakshmiCollectionId] = useState('');

//   useEffect(() => {
//     console.log(userId);
//   }, [userId]);

//   // ✅ Step 1: Fetch booking details from your API
//   useEffect(() => {
//     fetch(`https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/LakshmiCollection/GetLakshmiCollectionDetails/${collectionId}`)
//       .then((res) => res.json())
//       .then((data) => {
//         setOrderBooking(data);
//         setUserId(data.customerId);
//         setGrandTotal(data.grandTotal);
//         setLakshmiCollectionId(data.lakshmiCollectionId);
//         localStorage.setItem("userId", data.customerId);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("❌ Error loading booking:", err);
//         setLoading(false);
//       });
//   }, [collectionId]);

//   // ✅ Step 2: Handle Pay Now
//   const handlePayment = () => {
//     if (!orderBooking) return;

//     const options = {
//       key: "rzp_live_RQiggcAf80YY99",
//       amount: (orderBooking.grandTotal || 1) * 100,
//       currency: "INR",
//       name: "HandyMan Service Providers",
//       handler: function (response) {
//         console.log("✅ Payment Success:", response);
//         navigate(
//           `/lakshmiCollectionPaymentSuccess?paymentId=${response.razorpay_payment_id}&amount=${grandTotal}&id=${orderBooking.id}&address=${orderBooking.address}&BookingId=${lakshmiCollectionId}`
//         );
//       },
//       prefill: {
//         name: orderBooking.customerName,
//         email: orderBooking.customerEmail,
//         contact: orderBooking.customerPhoneNumber,
//       },
//       theme: { color: "#3399cc" },
//     };

//     const rzp1 = new window.Razorpay(options);
//     rzp1.open();
//   };

//   if (loading) return <p>Loading booking details...</p>;
//   if (!orderBooking) return <p style={{ color: "red" }}>Error loading booking details.</p>;

//   return (
//     <div className="mt-5 h-100 d-flex align-items-center py-2 flex-column">
//       <div className="login_section rounded-3 p-1" style={{ maxWidth: "500px", width: "100%" }}>
//         <div className="rgt_cnt text-start">
//           <div className="text-center mb-3">
//             <img
//               src={HandymanLogo}
//               alt="Handy Man Logo"
//               className="d-block mx-auto"
//               style={{ maxWidth: "150px" }}
//             />
//             <h5 className="mt-2">Handyman Service Providers Payment</h5>
//             <h6 style={{ color: "#ec3b83" }}>Lakshmi Collections</h6>
//           </div>

//           <p><strong>Customer Name:</strong> {orderBooking.customerName}</p>
//           <p><strong>Phone Number:</strong> {orderBooking.customerPhonenumber}</p>
//             {orderBooking.category?.map((item, index) => (
//              <strong>Collection Name: <span key={index}>
//                 {item.productname} - Rs {item.price} ({item.productSize})
//               </span>
//               </strong>
//             ))}
//           <p><strong>Total Amount:</strong> ₹{orderBooking.grandTotal} /-</p>

//           <div className="text-center mt-4">
//             <button
//               onClick={handlePayment}
//               className="btn text-white px-4 py-2"
//               style={{ background: "#ec3b83", borderRadius: "20px" }}
//             >
//               Pay Now
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LakshmiCollectionsOnlinePayment;
