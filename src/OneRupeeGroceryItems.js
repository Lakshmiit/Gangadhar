// import React, { useEffect, useState } from "react";
// import axios from "axios";

// export default function OneRupeeStore() {
//   const [products, setProducts] = useState([]);
//   const [imageUrls, setImageUrls] = useState({});
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const selectedCategory = "₹1 Store";

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   const fetchProducts = async () => {
//     try {
//       const url = `https://lmartapiv1-fxcyd2b4btacgsav.westus2-01.azurewebsites.net/api/UploadGrocery/GetGroceryItemsBycategory?Category=${encodeURIComponent(
//         selectedCategory
//       )}`;

//       const { data } = await axios.get(url);

//       const items = Array.isArray(data) ? data : [];
//       setProducts(items);

//       // ✅ Image loading (same logic simplified)
//       const images = {};
//       await Promise.all(
//         items.map(async (p) => {
//           if (p.images?.[0]) {
//             try {
//               const res = await fetch(
//                 `https://lmartapiv1-fxcyd2b4btacgsav.westus2-01.azurewebsites.net/api/FileUpload/download?generatedfilename=${encodeURIComponent(
//                   p.images[0]
//                 )}`
//               );
//               const json = await res.json();
//               if (json?.imageData) {
//                 images[p.id] = `data:image/jpeg;base64,${json.imageData}`;
//               }
//             } catch {}
//           }
//         })
//       );

//       setImageUrls(images);
//     } catch (err) {
//       console.error("API Error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ SINGLE SELECT LOGIC
//   const handleSelect = (item) => {
//     if (selectedItem?.id === item.id) {
//       setSelectedItem(null);
//     } else {
//       setSelectedItem(item);
//     }
//   };

//   return (
//     <div style={{ padding: "10px", background: "#f5f5f5" }}>
//       {/* Header */}
//       <div
//         style={{
//           background: "green",
//           color: "white",
//           textAlign: "center",
//           padding: "10px",
//           fontWeight: "bold",
//         }}
//       >
//         ₹1 Store
//       </div>
//        {/* Summary */}
//       <div
//         style={{
//           marginTop: "15px",
//           padding: "10px",
//           background: "#fff",
//           textAlign: "center",
//           fontWeight: "bold",
//         }}
//       >
//         Selected Item:{" "}
//         <span style={{ color: "green" }}>
//           {selectedItem ? selectedItem.name : "None"}
//         </span>
//       </div>
//       {loading ? (
//         <p>Loading...</p>
//       ) : (
//       <div
//         style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(3, 1fr)",
//             gap: "8px",
//             padding: "8px",
//         }}
//         >
//         {products.map((product) => {
//             const isSelected = selectedItem?.id === product.id;
//             const isDisabled = selectedItem && !isSelected;
//             const isOutOfStock = Number(product.stockLeft || 0) <= 0;

//             return (
//             <div
//                 key={product.id}
//                 style={{
//                 background: "#fff",
//                 borderRadius: "10px",
//                 padding: "6px",
//                 position: "relative",
//                 boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
//                 border: isSelected ? "2px solid green" : "1px solid #eee",
//                 opacity: isDisabled || isOutOfStock ? 0.5 : 1,
//                 minHeight: "210px",
//                 }}
//             >
//                 {/* Discount */}
//                 {product.discount > 0 && (
//                 <div
//                     style={{
//                     position: "absolute",
//                     top: "5px",
//                     left: "5px",
//                     background: "#ff6b6b",
//                     color: "#fff",
//                     fontSize: "10px",
//                     padding: "2px 6px",
//                     borderRadius: "10px",
//                     fontWeight: "bold",
//                     }}
//                 >
//                     {Math.round(product.discount)}%
//                 </div>
//                 )}

//                 {/* Wishlist */}
//                 <div
//                 style={{
//                     position: "absolute",
//                     top: "5px",
//                     right: "5px",
//                     fontSize: "14px",
//                     color: "#999",
//                 }}
//                 >
//                 ♡
//                 </div>

//                 {/* Image */}
//                 <div
//                 style={{
//                     height: "80px",
//                     display: "flex",
//                     justifyContent: "center",
//                     alignItems: "center",
//                 }}
//                 >
//                 <img
//                     src={imageUrls[product.id]}
//                     alt={product.name}
//                     style={{
//                     maxHeight: "70px",
//                     objectFit: "contain",
//                     }}
//                 />
//                 </div>

//                 {/* Name */}
//                 <div
//                 style={{
//                     fontSize: "11px",
//                     fontWeight: "600",
//                     lineHeight: "1.2",
//                     height: "34px",
//                     overflow: "hidden",
//                 }}
//                 >
//                 {product.name}
//                 </div>

//                 {/* Price */}
//                 <div style={{ fontSize: "11px" }}>
//                 <span style={{ color: "green", fontWeight: "bold" }}>
//                     ₹{Math.round(product.afterDiscount || 1)}
//                 </span>{" "}
//                 <span
//                     style={{
//                     textDecoration: "line-through",
//                     color: "#999",
//                     fontSize: "10px",
//                     }}
//                 >
//                     ₹{product.mrp}
//                 </span>
//                 </div>

//                 {/* Units */}
//                 <div style={{ fontSize: "10px", color: "green" }}>
//                 {product.units}
//                 </div>

//                 {/* Max limit */}
//                 {product.limit && (
//                 <div
//                     style={{
//                     fontSize: "9px",
//                     color: "red",
//                     fontWeight: "600",
//                     }}
//                 >
//                     Max {product.limit} per customer
//                 </div>
//                 )}

//                 {/* Checkbox */}
//                 <input
//                 type="checkbox"
//                 checked={isSelected}
//                 readOnly
//                 style={{
//                     position: "absolute",
//                     bottom: "8px",
//                     left: "6px",
//                 }}
//                 />

//                 {/* ADD Button */}
//                 {!isOutOfStock && (
//                 <button
//                     onClick={() => handleSelect(product)}
//                     disabled={isDisabled}
//                     style={{
//                     position: "absolute",
//                     bottom: "6px",
//                     right: "6px",
//                     border: "1px solid green",
//                     color: "green",
//                     background: "#f6fff6",
//                     borderRadius: "8px",
//                     padding: "2px 10px",
//                     fontSize: "11px",
//                     fontWeight: "bold",
//                     cursor: isDisabled ? "not-allowed" : "pointer",
//                     }}
//                 >
//                     {isSelected ? "SELECTED" : "ADD"}
//                 </button>
//                 )}

//                 {/* Out of stock overlay */}
//                 {isOutOfStock && (
//                 <div
//                     style={{
//                     position: "absolute",
//                     top: 0,
//                     left: 0,
//                     width: "100%",
//                     height: "100%",
//                     background: "rgba(255,255,255,0.7)",
//                     display: "flex",
//                     justifyContent: "center",
//                     alignItems: "center",
//                     borderRadius: "10px",
//                     }}
//                 >
//                     <span
//                     style={{
//                         background: "gray",
//                         color: "#fff",
//                         fontSize: "10px",
//                         padding: "3px 6px",
//                         borderRadius: "6px",
//                     }}
//                     >
//                     Out of Stock
//                     </span>
//                 </div>
//                 )}
//             </div>
//             );
//         })}
//         </div>
//       )}
//     </div>
//   );
// }
