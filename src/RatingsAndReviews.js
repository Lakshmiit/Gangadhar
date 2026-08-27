// import React, { useState } from 'react';
// import './App.css'; 
// import Header from './Header';
// import Footer from './Footer';

// const RatingsAndReviews = () => {
//   const [rating, setRating] = useState(0);
//   const [hoverRating, setHoverRating] = useState(0);
//   const [reviewText, setReviewText] = useState('');
//   const [reviews, setReviews] = useState([]);
//   const [customerName, setCustomerName] = useState('');

//   const handleRating = (rate) => {
//     setRating(rate);
//   };

//   const handleSubmit = () => {
//     if (rating === 0 || reviewText.trim() === '' || customerName.trim() === '') {
//       alert('Please provide rating, name and review!');
//       return;
//     }

//     const newReview = {
//       customerName,
//       rating,
//       text: reviewText,
//       date: new Date().toLocaleString(),
//     };
//     setReviews([newReview, ...reviews]);
//     setRating(0);
//     setHoverRating(0);
//     setReviewText('');
//     setCustomerName('');
//   };

//   return (
//     <>
//     <Header />
//     <div className="review-container">
//      <h2 style={{ fontFamily: 'Poppins', fontWeight: '600' }}>
//         Leave a Review
//      </h2>

//       <div className="star-rating">
//         {[1, 2, 3, 4, 5].map((star) => (
//           <span
//             key={star}
//             className={`star ${star <= (hoverRating || rating) ? 'filled' : ''}`}
//             onClick={() => handleRating(star)}
//             onMouseEnter={() => setHoverRating(star)}
//             onMouseLeave={() => setHoverRating(0)}
//           >
//             ★
//           </span>
//         ))}
//       </div>

//      <input
//         className="form-control"
//         placeholder="Your Good Name Please ..."
//         value={customerName}
//         onChange={(e) => setCustomerName(e.target.value)}
//       />
//       <textarea
//         className="review-input"
//         placeholder="Write your review here..."
//         value={reviewText}
//         onChange={(e) => setReviewText(e.target.value)}
//       />

//       <button
//         className="submit-btn"
//         onClick={handleSubmit}
//         style={{ fontFamily: 'Playfair Display, serif', fontWeight: '600', fontSize: '16px' }}
//         >
//         Submit Review
//       </button>

//       <div className="review-list">
//         <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#333' }}>
//         Reviews
//         </h3>
//         {reviews.length === 0 && <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '16px', color: '#666' }}>
//             No reviews yet.
//          </p>}
//         {reviews.map((rev, index) => (
//           <div key={index} className="review-item">
//             <div className="review-stars">
//               {'★'.repeat(rev.rating)}
//               {'☆'.repeat(5 - rev.rating)}
//             </div>
//             <div>{rev.customerName}</div>
//             <div>{rev.text}</div>
//             <div>{rev.date}</div>
//           </div>
//         ))}
//       </div>
//     </div>
//     <div style={{ marginTop: '70px' }}>
//   <Footer />
// </div>
//     </>
//   );
// };

// export default RatingsAndReviews;
