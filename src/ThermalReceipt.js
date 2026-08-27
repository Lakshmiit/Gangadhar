// import React, { forwardRef } from "react";
// import "./App.css";

// const ThermalReceipt = forwardRef(
//   ({ cartData, items, martId, cashier = "ADMIN" }, ref) => {
//     const billDate = cartData?.date
//       ? new Date(cartData.date).toLocaleString()
//       : "";
//     const totalItems = items.length;
//     const totalQty = items.reduce((s, i) => s + Number(i.quantity || 0), 0);
//     const subTotal = items.reduce((s, i) => s + Number(i.total || 0), 0);
//     // const cgst = cartData?.cgst || 0;
//     // const sgst = cartData?.sgst || 0;
//     const grandTotal = Number(cartData?.grandTotal ?? subTotal);

//     const gstGroups = {};
//     items.forEach((i) => {
//       const gst = Number(i.gst || 0); 
//       if (!gstGroups[gst]) gstGroups[gst] = [];
//       gstGroups[gst].push(i);
//     });

//     return (
//       <div ref={ref} className="thermal">
//         <div className="center bold lg">HANDYMAN</div>
//         <div className="center bold">Lakshmi Mart</div>
//         <div className="center xs">Avenue Supermarts Ltd</div>
//         <div className="sep">--------------------------------</div>
//         <div className="xs">
//           <div>CIN : L51900MH2000PLC126473</div>
//           <div>GSTIN : 29AACCA8432H1ZM</div>
//           <div>FSSAI : 1512013000113</div>
//         </div>
//         <div className="sep">--------------------------------</div>
//         <div className="xs">
//           <div>Electronic City, Bengaluru</div>
//           <div>Phone : 6281198953</div>
//         </div>
//        <div className="sep">--------------------------------</div>
//         <div className="center bold">TAX INVOICE</div>
//        <div className="sep">--------------------------------</div>
//         {/* BILL INFO */}
//         <div className="xs">
//           <div>Bill No : {martId}</div>
//           <div>Bill Dt : {billDate}</div>
//           <div>Cashier : {cashier}</div>
//         </div>
//         <div className="sep">--------------------------------</div>
//         {/* TABLE HEADER */}
//         <div className="row bold xs">
//           <span>HSN / Item</span>
//           <span>Qty</span>
//           <span>Rate</span>
//           <span>Value</span>
//         </div>
//        <div className="sep">--------------------------------</div>
//         {Object.keys(gstGroups).map((gst) => (
//   <div key={gst}>
//     <div className="xs bold">
//       CGST @ {(gst / 2).toFixed(2)}% &nbsp; SGST @ {(gst / 2).toFixed(2)}%
//     </div>

//     {gstGroups[gst].map((item, i) => (
//       <div key={i} className="xs">
//         {/* Item name line */}
//         <div className="item-name">
//           {item.hsn || "--"} {item.name}
//         </div>

//         {/* Qty / Rate / Value line */}
//         <div className="item-line">
//           <span className="col-qty">{item.quantity}</span>
//           <span className="col-rate">
//             {item.afterDiscountPrice.toFixed(2)}
//           </span>
//           <span className="col-val">
//             {item.total.toFixed(2)}
//           </span>
//         </div>
//       </div>
//     ))}

//     <div className="sep">--------------------------------</div>
//   </div>
// ))}

//         {/* ITEM COUNT */}
//         <div className="row xs bold">
//           <span>Items: {totalItems}</span>
//           <span>Qty: {totalQty}</span>
//           <span>{grandTotal.toFixed(2)}</span>
//         </div>
//         <div className="sep">--------------------------------</div>
//         <div className="center bold xs">GST Breakup Details</div>
//         <div className="sep">--------------------------------</div>
//         <div className="row bold xs">
//           <span>GST%</span>
//           <span>Taxable</span>
//           <span>CGST</span>
//           <span>SGST</span>
//           <span>Total</span>
//         </div>
//         {Object.keys(gstGroups).map((gst) => {
//           const taxable = gstGroups[gst].reduce(
//             (s, i) => s + Number(i.total || 0),
//             0
//           );
//           const gstAmt = (taxable * gst) / 100;
//           return (
//             <div key={gst} className="row xs">
//               <span>{gst}%</span>
//               <span>{taxable.toFixed(2)}</span>
//               <span>{(gstAmt / 2).toFixed(2)}</span>
//               <span>{(gstAmt / 2).toFixed(2)}</span>
//               <span>{(taxable + gstAmt).toFixed(2)}</span>
//             </div>
//           );
//         })}
//         <div className="sep">--------------------------------</div>
//         <div className="row bold">
//           <span>GRAND TOTAL</span>
//           <span>₹{grandTotal.toFixed(2)}</span>
//         </div>
//         <div className="sep">--------------------------------</div>
//         <div className="center xs">Amount Received From Customer</div>
//         <div className="center bold">₹{grandTotal.toFixed(2)}</div>
//         <div className="sep">--------------------------------</div>
//         <div className="center xs">*** THANK YOU ***</div>
//         <div className="center xs">Visit Again 🙏</div>
//       </div>
//     );
//   }
// );

// export default ThermalReceipt;     
