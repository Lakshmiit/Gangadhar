// import { useState, useEffect } from "react";
// import {  useParams } from "react-router-dom";
// import { db, collection, onSnapshot } from "./FirebaseConflict.js";
// import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
// import notificationSound from "./Bell.mp3";

// const RaiseQuoteNotificationBell = () => {
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);
// //   const navigate = useNavigate();
//   const { userId } = useParams();
//   const { category1 } = useParams();
//   const { district1 } = useParams();

//   useEffect(() => {
//     const notificationsRef = collection(db, "notifications");

//     const unsubscribe = onSnapshot(notificationsRef, async (snapshot) => {
//       try {
//         const response = await fetch(
//             `https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/RaiseTicket/GetNotificationsByNotExistTechnicianId?category=${category1}&district=${district1}&technicianId=${userId}`
//           );
//         const data = await response.json();
// // alert(getTechnicianFiltered.length);
// const getTicketsFiltered = data.filter((item) => item.assignedTo ==="Technical Agency");

//         // Check for new notifications
//         if (getTicketsFiltered.length > notifications.length) {
//           setUnreadCount(getTicketsFiltered.length - notifications.length);
//          playNotificationSound();
//         }

//         setNotifications(getTicketsFiltered);
//       } catch (error) {
//         console.error("Error fetching notifications:", error);
//       }
//     });

//     return () => unsubscribe();
//   }, [ category1, district1,userId,  notifications]); // Added dependencies to re-run effect when `userId` or `notifications` change

//     const playNotificationSound = () => {
//       const audio = new Audio(notificationSound);
//       audio.play();
//     };

//   //   const handleNotificationClick = (ticketId) => {
//   //     setUnreadCount(0);
//   //     navigate(`/ticket/${ticketId}`);
//   //   };

//   return (
//     <div className="relative">
//       <div className="relative p-2" onClick={() => setUnreadCount(0)}>
//         <RequestQuoteIcon sx={{ color: "black" }}/>
//         {unreadCount > 0 && (
//           <span className="bell-count">{unreadCount}</span>
//         )}
//       </div>
//       {/* Uncomment if you want to show notifications */}
//       {/* <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-md p-2">
//         {notifications.map((ticket) => (
//           <div
//             key={ticket.id}
//             className="cursor-pointer p-2 hover:bg-gray-200"
//             onClick={() => handleNotificationClick(ticket.id)}
//           >
//             {ticket.title}
//           </div>
//         ))}
//       </div> */}
//     </div>
//   );
// };

// export default RaiseQuoteNotificationBell;
