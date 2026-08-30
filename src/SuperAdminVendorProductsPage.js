// import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { getVendorProductsByVendorId, updateVendorProductsValues, zoneData } from "./utils/superAdminStore";
// import { getGroceryItems } from "./utils/groceryStore";
// import ImageCache from "./utils/ImageCache";
// import { getImageFilename, imageValueToUrl } from "./utils/imageSource";
// import SuperAdminNav from "./SuperAdminNav";

// const SuperAdminVendorProductsPage = () => {
//   const { vendorId } = useParams();
//   const navigate = useNavigate();

//   const [record, setRecord] = useState(null);
//   const [catalogById, setCatalogById] = useState({});
//   const [imageUrls, setImageUrls] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [message, setMessage] = useState("");
//   const [saving, setSaving] = useState(false);

//   // Pincodes the super admin is assigning to this vendor's coverage —
//   // seeded from whatever the vendor already has on record, editable here,
//   // and sent back as "pincodes" on approve/reject.
//   const [selectedPincodes, setSelectedPincodes] = useState([]);

//   // Display order of this vendor's categories, editable by the admin with
//   // the up/down arrows below. Seeded from record.categorie — sorted by
//   // whatever "rank" the backend already has (falling back to the order the
//   // API returned them in for records with no rank yet) — then kept in
//   // local state so re-ordering is instant, with rank 1..N re-assigned
//   // every time the order changes and saved back explicitly.
//   const [orderedCategories, setOrderedCategories] = useState([]);

//   // productId -> boolean, true meaning "this product is Approved". Seeded
//   // from each product's own status field. Checking/unchecking here is
//   // exactly what moves a product between the "Approved" and "Pending
//   // approval" sections below — the two sections are just the same product
//   // list filtered by this state, never two separately-tracked lists.
//   const [productApproval, setProductApproval] = useState({});
//   // Snapshot of productApproval taken right after load/save, so we can
//   // tell whether the admin has made any unsaved approval changes yet.
//   const [originalApproval, setOriginalApproval] = useState({});

//   useEffect(() => {
//     let cancelled = false;
//     (async () => {
//       setLoading(true);
//       setError("");
//       setMessage("");
//       try {
//         const [productRecord, catalog] = await Promise.all([
//           getVendorProductsByVendorId(vendorId),
//           getGroceryItems().catch(() => []),
//         ]);
//         if (cancelled) return;
//         setRecord(productRecord);
//         setSelectedPincodes(
//           Array.isArray(productRecord?.pincodes) ? productRecord.pincodes : [],
//         );
//         const cats = Array.isArray(productRecord?.categorie) ? productRecord.categorie : [];
//         const sorted = [...cats].sort((a, b) => {
//           const rankA = Number(a.rank);
//           const rankB = Number(b.rank);
//           if (Number.isFinite(rankA) && Number.isFinite(rankB)) return rankA - rankB;
//           if (Number.isFinite(rankA)) return -1;
//           if (Number.isFinite(rankB)) return 1;
//           return 0;
//         });
//         const orderedCats = sorted.map((cat, idx) => ({ ...cat, rank: String(idx + 1) }));
//         setOrderedCategories(orderedCats);

//         // Seed the checkbox state from each product's own status.
//         const approvalSeed = {};
//         orderedCats.forEach((cat) => {
//           (cat.products || []).forEach((p) => {
//             approvalSeed[p.productIds] = p.status === "Approved";
//           });
//         });
//         setProductApproval(approvalSeed);
//         setOriginalApproval(approvalSeed);

//         const byId = {};
//         (Array.isArray(catalog) ? catalog : []).forEach((item) => {
//           if (item?.id) byId[String(item.id)] = item;
//         });
//         setCatalogById(byId);
//       } catch (err) {
//         console.error("Failed to load vendor products", err);
//         if (!cancelled) setError("Unable to load this vendor's submitted products right now.");
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     })();
//     return () => {
//       cancelled = true;
//     };
//   }, [vendorId]);

//   // Resolve each product's photo against the master LMart catalog —
//   // cache-first, same pattern used everywhere else images are shown.
//   useEffect(() => {
//     if (!record) return;
//     const products = (record.categorie || []).flatMap((cat) => cat.products || []);
//     const imageProducts = products
//       .map((p) => {
//         const master = catalogById[String(p.productIds)];
//         const photo = Array.isArray(master?.images) ? master.images[0] : null;
//         return { productId: p.productIds, photo };
//       })
//       .filter(({ photo }) => Boolean(photo));
//     if (!imageProducts.length) return;

//     const controller = new AbortController();
//     let cancelled = false;

//     const fetchOne = async ({ productId, photo }) => {
//       try {
//         const filename = getImageFilename(photo);
//         if (!filename) {
//           const directUrl = imageValueToUrl(photo);
//           if (directUrl && !cancelled) setImageUrls((prev) => ({ ...prev, [productId]: directUrl }));
//           return;
//         }
//         let imageData = await ImageCache.getBase64(filename);
//         if (!imageData) {
//           const response = await fetch(imageValueToUrl(filename), { signal: controller.signal });
//           if (!response.ok) return;
//           const data = await response.json();
//           imageData = data?.imageData || "";
//           if (!imageData || cancelled) return;
//           await ImageCache.setBase64(filename, imageData);
//         }
//         if (!cancelled) {
//           setImageUrls((prev) => ({ ...prev, [productId]: `data:image/jpeg;base64,${imageData}` }));
//         }
//       } catch {}
//     };

//     Promise.allSettled(imageProducts.map(fetchOne));

//     return () => {
//       cancelled = true;
//       controller.abort();
//     };
//   }, [record, catalogById]);

//   const totalProducts = useMemo(() => {
//     if (!record) return 0;
//     return (record.categorie || []).reduce((sum, cat) => sum + (cat.products || []).length, 0);
//   }, [record]);

//   const togglePincode = (pin) => {
//     setSelectedPincodes((prev) =>
//       prev.includes(pin) ? prev.filter((p) => p !== pin) : [...prev, pin],
//     );
//   };

//   const isZoneFullySelected = (zone) =>
//     zoneData[zone].every((pin) => selectedPincodes.includes(pin));

//   const toggleZone = (zone) => {
//     const pins = zoneData[zone];
//     setSelectedPincodes((prev) => {
//       const allSelected = pins.every((pin) => prev.includes(pin));
//       return allSelected
//         ? prev.filter((pin) => !pins.includes(pin))
//         : Array.from(new Set([...prev, ...pins]));
//     });
//   };

//   // Move a category up (-1) or down (+1) in the display order and
//   // re-number every category's rank 1..N to match the new order. This
//   // controls the customer-facing storefront order, so it's shown attached
//   // to the Approved section below (only approved products are visible to
//   // customers in the first place).
//   const moveCategory = (index, direction) => {
//     setOrderedCategories((prev) => {
//       const targetIndex = index + direction;
//       if (targetIndex < 0 || targetIndex >= prev.length) return prev;
//       const next = [...prev];
//       [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
//       return next.map((cat, idx) => ({ ...cat, rank: String(idx + 1) }));
//     });
//   };

//   // Whether the admin has reordered categories since the record was
//   // loaded (or last saved) — same on/off pattern as pincodesChanged,
//   // shown as a "Save category order" action.
//   const categoryOrderChanged = useMemo(() => {
//     if (!record) return false;
//     const original = (record.categorie || []).map((cat) => cat.categoryName);
//     const current = orderedCategories.map((cat) => cat.categoryName);
//     return JSON.stringify(original) !== JSON.stringify(current);
//   }, [record, orderedCategories]);

//   const handleSaveCategoryOrder = async () => {
//     if (!record) return;
//     setSaving(true);
//     setError("");
//     setMessage("");
//     try {
//       const payload = {
//         ...record,
//         updatedDate: new Date().toISOString(),
//         categorie: orderedCategories,
//       };
//       await updateVendorProductsValues(payload);
//       setRecord(payload);
//       setMessage("Category order updated.");
//     } catch (err) {
//       console.error("Failed to update category order", err);
//       setError("Unable to save the category order. Please try again.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const statusBadgeClass = (status) => {
//     if (status === "Approved") return "bg-success";
//     if (status === "Reject" || status === "Rejected") return "bg-danger";
//     return "bg-warning text-dark";
//   };

//   // Whether the admin has changed the zone/pincode selection since the
//   // record was loaded — lets the "Save pincodes" action stay independent
//   // of whatever the current Approved/Rejected status is.
//   const pincodesChanged = useMemo(() => {
//     if (!record) return false;
//     const original = Array.isArray(record.pincodes) ? [...record.pincodes].sort() : [];
//     const current = [...selectedPincodes].sort();
//     return JSON.stringify(original) !== JSON.stringify(current);
//   }, [record, selectedPincodes]);

//   const handleDecision = async (newStatus) => {
//     if (!record) return;
//     setSaving(true);
//     setError("");
//     setMessage("");
//     try {
//       const payload = {
//         ...record,
//         status: newStatus,
//         updatedDate: new Date().toISOString(),
//         pincodes: selectedPincodes,
//       };
//       await updateVendorProductsValues(payload);
//       setRecord(payload);
//       setMessage(newStatus === "Approved" ? "Submission approved." : "Submission rejected.");
//     } catch (err) {
//       console.error("Failed to update vendor products", err);
//       setError("Unable to save this decision. Please try again.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Lets the admin update just the pincode/zone mapping — at any time,
//   // whether the submission is Pending, Approved, or Rejected — without
//   // changing the current approval status.
//   const handleSavePincodes = async () => {
//     if (!record) return;
//     setSaving(true);
//     setError("");
//     setMessage("");
//     try {
//       const payload = {
//         ...record,
//         updatedDate: new Date().toISOString(),
//         pincodes: selectedPincodes,
//       };
//       await updateVendorProductsValues(payload);
//       setRecord(payload);
//       setMessage("Pincode mapping updated.");
//     } catch (err) {
//       console.error("Failed to update vendor pincodes", err);
//       setError("Unable to save the pincode changes. Please try again.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const toggleProductApproval = (productId) => {
//     setProductApproval((prev) => ({ ...prev, [productId]: !prev[productId] }));
//   };

//   // orderedCategories split into two parallel views, purely by the current
//   // (unsaved) checkbox state — a product lives in exactly one of these at
//   // any moment, and toggling its checkbox is what moves it between them.
//   const { approvedCategories, pendingCategories } = useMemo(() => {
//     const approved = [];
//     const pending = [];
//     orderedCategories.forEach((cat) => {
//       const approvedProducts = [];
//       const pendingProducts = [];
//       (cat.products || []).forEach((p) => {
//         if (productApproval[p.productIds]) approvedProducts.push(p);
//         else pendingProducts.push(p);
//       });
//       if (approvedProducts.length) approved.push({ ...cat, products: approvedProducts });
//       if (pendingProducts.length) pending.push({ ...cat, products: pendingProducts });
//     });
//     return { approvedCategories: approved, pendingCategories: pending };
//   }, [orderedCategories, productApproval]);

//   // Whether any checkbox differs from what's currently saved on the
//   // server — enables the "Save approval changes" action.
//   const approvalChanged = useMemo(
//     () => JSON.stringify(originalApproval) !== JSON.stringify(productApproval),
//     [originalApproval, productApproval],
//   );

//   // Persists the current checkbox state back to each product's status
//   // field ("Approved" if checked, "Pending" if not), keeping every other
//   // field on the record (pincodes, category order, quantity/discount/
//   // limit per product) untouched.
//   const handleSaveApprovals = async () => {
//     if (!record) return;
//     setSaving(true);
//     setError("");
//     setMessage("");
//     try {
//       const updatedCategorie = orderedCategories.map((cat) => ({
//         ...cat,
//         products: (cat.products || []).map((p) => ({
//           ...p,
//           status: productApproval[p.productIds] ? "Approved" : "Pending",
//         })),
//       }));
//       const payload = {
//         ...record,
//         updatedDate: new Date().toISOString(),
//         categorie: updatedCategorie,
//       };
//       await updateVendorProductsValues(payload);
//       setRecord(payload);
//       setOrderedCategories(updatedCategorie);
//       setOriginalApproval(productApproval);
//       setMessage("Product approvals updated.");
//     } catch (err) {
//       console.error("Failed to update product approvals", err);
//       setError("Unable to save the approval changes. Please try again.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const renderProductCard = (p) => {
//     const master = catalogById[String(p.productIds)];
//     const photo = imageUrls[p.productIds];
//     const checked = !!productApproval[p.productIds];
//     return (
//       <div className="col-12 col-sm-6 col-lg-4" key={p.productIds}>
//         <label
//           className={`border rounded p-2 d-flex gap-2 align-items-center w-100 ${checked ? "border-success border-2" : ""}`}
//           style={{ cursor: "pointer" }}
//         >
//           <input
//             type="checkbox"
//             className="form-check-input mt-0 flex-shrink-0"
//             checked={checked}
//             onChange={() => toggleProductApproval(p.productIds)}
//           />
//           <div
//             className="flex-shrink-0 bg-light rounded d-flex align-items-center justify-content-center overflow-hidden"
//             style={{ width: 48, height: 48 }}
//           >
//             {photo ? (
//               <img src={photo} alt={master?.name || "Product"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
//             ) : (
//               <span className="text-muted" style={{ fontSize: "9px" }}>
//                 No image
//               </span>
//             )}
//           </div>
//           <div className="small">
//             <div className="fw-bold">{master?.name || `Product ${p.productIds}`}</div>
//             <div>
//               Qty: {p.quantity} &middot; Discount: {p.discount}% &middot; Limit: {p.limit}
//             </div>
//           </div>
//         </label>
//       </div>
//     );
//   };

//   if (loading) {
//     return (
//       <div className="container py-4">
//         <SuperAdminNav active="/superadmin/vendors" />
//         <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
//           <div className="spinner-border text-primary" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container py-4">
//       <SuperAdminNav active="/superadmin/vendors" />

//       <button className="btn btn-link px-0 mb-3" onClick={() => navigate("/superadmin/vendors")}>
//         &larr; Back to vendors
//       </button>

//       {error && <div className="alert alert-danger">{error}</div>}
//       {message && <div className="alert alert-success">{message}</div>}

//       {!record && !error && (
//         <div className="text-muted text-center py-5">This vendor hasn't submitted any products yet.</div>
//       )}

//       {record && (
//         <>
//           <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
//             <div>
//               <h3 className="mb-1">{record.storeName || "Vendor"}</h3>
//               <div className="text-muted small">
//                 {totalProducts} product{totalProducts === 1 ? "" : "s"} across{" "}
//                 {(record.categorie || []).length} categor{(record.categorie || []).length === 1 ? "y" : "ies"}
//               </div>
//             </div>
//             <span className={`badge ${statusBadgeClass(record.status)} fs-6`}>{record.status || "Pending"}</span>
//           </div>

//           {/* ---- Pincodes this vendor is assigned to service, editable by zone ---- */}
//           <div className="mb-4">
//             <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
//               <h6 className="mb-0">Serviceable pincodes</h6>
//               <div className="d-flex align-items-center gap-2">
//                 {selectedPincodes.length > 0 && (
//                   <span className="badge bg-primary">
//                     {selectedPincodes.length} pincode{selectedPincodes.length === 1 ? "" : "s"} selected
//                   </span>
//                 )}
//                 {pincodesChanged && (
//                   <button
//                     className="btn btn-sm btn-outline-primary"
//                     disabled={saving}
//                     onClick={handleSavePincodes}
//                   >
//                     {saving ? "Saving..." : "Save pincodes"}
//                   </button>
//                 )}
//               </div>
//             </div>
//             <p className="text-muted small mb-2">
//               The zone/pincode mapping can be changed at any time, regardless of the current approval status.
//             </p>
//             <div className="row g-3">
//               {Object.entries(zoneData).map(([zone, pins]) => (
//                 <div className="col-12 col-sm-6 col-lg-4" key={zone}>
//                   <div className="border rounded p-2 h-100">
//                     <label className="d-flex align-items-center gap-2 fw-bold mb-2" style={{ cursor: "pointer" }}>
//                       <input
//                         type="checkbox"
//                         className="form-check-input mt-0"
//                         checked={isZoneFullySelected(zone)}
//                         onChange={() => toggleZone(zone)}
//                       />
//                       Zone {zone}
//                     </label>
//                     <div className="d-flex flex-wrap gap-2">
//                       {pins.map((pin) => (
//                         <label
//                           key={pin}
//                           className={`border rounded px-2 py-1 small d-flex align-items-center gap-1 ${
//                             selectedPincodes.includes(pin) ? "border-primary border-2" : ""
//                           }`}
//                           style={{ cursor: "pointer" }}
//                         >
//                           <input
//                             type="checkbox"
//                             className="form-check-input mt-0"
//                             checked={selectedPincodes.includes(pin)}
//                             onChange={() => togglePincode(pin)}
//                           />
//                           {pin}
//                         </label>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* ---- Approved products — checked here, visible to customers ---- */}
//           <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
//             <h5 className="mb-0">
//               Approved{" "}
//               {approvedCategories.length > 0 && (
//                 <span className="badge bg-success ms-1">
//                   {approvedCategories.reduce((sum, c) => sum + c.products.length, 0)}
//                 </span>
//               )}
//             </h5>
//             <div className="d-flex align-items-center gap-2">
//               {categoryOrderChanged && (
//                 <button
//                   className="btn btn-sm btn-outline-primary"
//                   disabled={saving}
//                   onClick={handleSaveCategoryOrder}
//                 >
//                   {saving ? "Saving..." : "Save category order"}
//                 </button>
//               )}
//               {approvalChanged && (
//                 <button
//                   className="btn btn-sm btn-success"
//                   disabled={saving}
//                   onClick={handleSaveApprovals}
//                 >
//                   {saving ? "Saving..." : "Save approval changes"}
//                 </button>
//               )}
//             </div>
//           </div>

//           {approvedCategories.length === 0 ? (
//             <p className="text-muted small mb-4">No products approved yet.</p>
//           ) : (
//             approvedCategories.map((cat) => {
//               // Use the position in the full orderedCategories list (not
//               // this filtered array) so up/down still reflects the real
//               // customer-facing category order, even while some
//               // categories are hidden here for having zero approved items.
//               const fullIndex = orderedCategories.findIndex(
//                 (c) => c.categoryName === cat.categoryName,
//               );
//               return (
//                 <div key={cat.categoryName} className="mb-4">
//                   <div className="d-flex align-items-center gap-2 mb-2">
//                     <span className="badge bg-secondary">#{cat.rank}</span>
//                     <h6 className="mb-0">{cat.categoryName}</h6>
//                     <div className="btn-group btn-group-sm ms-auto" role="group">
//                       <button
//                         type="button"
//                         className="btn btn-outline-secondary"
//                         title="Move up"
//                         disabled={fullIndex <= 0}
//                         onClick={() => moveCategory(fullIndex, -1)}
//                       >
//                         &uarr;
//                       </button>
//                       <button
//                         type="button"
//                         className="btn btn-outline-secondary"
//                         title="Move down"
//                         disabled={fullIndex === -1 || fullIndex >= orderedCategories.length - 1}
//                         onClick={() => moveCategory(fullIndex, 1)}
//                       >
//                         &darr;
//                       </button>
//                     </div>
//                   </div>
//                   <div className="row g-2">{cat.products.map(renderProductCard)}</div>
//                 </div>
//               );
//             })
//           )}

//           {/* ---- Pending approval — unchecked here, hidden from customers until approved ---- */}
//           <h5 className="mt-4 mb-2">
//             Pending approval{" "}
//             {pendingCategories.length > 0 && (
//               <span className="badge bg-warning text-dark ms-1">
//                 {pendingCategories.reduce((sum, c) => sum + c.products.length, 0)}
//               </span>
//             )}
//           </h5>

//           {pendingCategories.length === 0 ? (
//             <p className="text-muted small mb-4">Nothing pending — every product has been reviewed.</p>
//           ) : (
//             pendingCategories.map((cat) => (
//               <div key={cat.categoryName} className="mb-4">
//                 <h6 className="mb-2">{cat.categoryName}</h6>
//                 <div className="row g-2">{cat.products.map(renderProductCard)}</div>
//               </div>
//             ))
//           )}

//           <div className="d-flex gap-2 mt-2">
//             <button
//               className="btn btn-success"
//               disabled={saving}
//               onClick={() => handleDecision("Approved")}
//             >
//               {saving ? "Saving..." : record.status === "Approved" ? "Re-approve" : "Approve"}
//             </button>
//             <button
//               className="btn btn-outline-danger"
//               disabled={saving}
//               onClick={() => handleDecision("Reject")}
//             >
//               Reject
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default SuperAdminVendorProductsPage;

// // import React, { useEffect, useMemo, useState } from "react";
// // import { useNavigate, useParams } from "react-router-dom";
// // import { getVendorProductsByVendorId, updateVendorProductsValues, zoneData } from "./utils/superAdminStore";
// // import { getGroceryItems } from "./utils/groceryStore";
// // import ImageCache from "./utils/ImageCache";
// // import { getImageFilename, imageValueToUrl } from "./utils/imageSource";
// // import SuperAdminNav from "./SuperAdminNav";

// // const SuperAdminVendorProductsPage = () => {
// //   const { vendorId } = useParams();
// //   const navigate = useNavigate();

// //   const [record, setRecord] = useState(null);
// //   const [catalogById, setCatalogById] = useState({});
// //   const [imageUrls, setImageUrls] = useState({});
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState("");
// //   const [message, setMessage] = useState("");
// //   const [saving, setSaving] = useState(false);

// //   // Pincodes the super admin is assigning to this vendor's coverage —
// //   // seeded from whatever the vendor already has on record, editable here,
// //   // and sent back as "pincodes" on approve/reject.
// //   const [selectedPincodes, setSelectedPincodes] = useState([]);

// //   // Display order of this vendor's categories, editable by the admin with
// //   // the up/down arrows below. Seeded from record.categorie — sorted by
// //   // whatever "rank" the backend already has (falling back to the order the
// //   // API returned them in for records with no rank yet) — then kept in
// //   // local state so re-ordering is instant, with rank 1..N re-assigned
// //   // every time the order changes and saved back explicitly.
// //   const [orderedCategories, setOrderedCategories] = useState([]);

// //   useEffect(() => {
// //     let cancelled = false;
// //     (async () => {
// //       setLoading(true);
// //       setError("");
// //       setMessage("");
// //       try {
// //         const [productRecord, catalog] = await Promise.all([
// //           getVendorProductsByVendorId(vendorId),
// //           getGroceryItems().catch(() => []),
// //         ]);
// //         if (cancelled) return;
// //         setRecord(productRecord);
// //         setSelectedPincodes(
// //           Array.isArray(productRecord?.pincodes) ? productRecord.pincodes : [],
// //         );
// //         const cats = Array.isArray(productRecord?.categorie) ? productRecord.categorie : [];
// //         const sorted = [...cats].sort((a, b) => {
// //           const rankA = Number(a.rank);
// //           const rankB = Number(b.rank);
// //           if (Number.isFinite(rankA) && Number.isFinite(rankB)) return rankA - rankB;
// //           if (Number.isFinite(rankA)) return -1;
// //           if (Number.isFinite(rankB)) return 1;
// //           return 0;
// //         });
// //         setOrderedCategories(sorted.map((cat, idx) => ({ ...cat, rank: String(idx + 1) })));
// //         const byId = {};
// //         (Array.isArray(catalog) ? catalog : []).forEach((item) => {
// //           if (item?.id) byId[String(item.id)] = item;
// //         });
// //         setCatalogById(byId);
// //       } catch (err) {
// //         console.error("Failed to load vendor products", err);
// //         if (!cancelled) setError("Unable to load this vendor's submitted products right now.");
// //       } finally {
// //         if (!cancelled) setLoading(false);
// //       }
// //     })();
// //     return () => {
// //       cancelled = true;
// //     };
// //   }, [vendorId]);

// //   // Resolve each product's photo against the master LMart catalog —
// //   // cache-first, same pattern used everywhere else images are shown.
// //   useEffect(() => {
// //     if (!record) return;
// //     const products = (record.categorie || []).flatMap((cat) => cat.products || []);
// //     const imageProducts = products
// //       .map((p) => {
// //         const master = catalogById[String(p.productIds)];
// //         const photo = Array.isArray(master?.images) ? master.images[0] : null;
// //         return { productId: p.productIds, photo };
// //       })
// //       .filter(({ photo }) => Boolean(photo));
// //     if (!imageProducts.length) return;

// //     const controller = new AbortController();
// //     let cancelled = false;

// //     const fetchOne = async ({ productId, photo }) => {
// //       try {
// //         const filename = getImageFilename(photo);
// //         if (!filename) {
// //           const directUrl = imageValueToUrl(photo);
// //           if (directUrl && !cancelled) setImageUrls((prev) => ({ ...prev, [productId]: directUrl }));
// //           return;
// //         }
// //         let imageData = await ImageCache.getBase64(filename);
// //         if (!imageData) {
// //           const response = await fetch(imageValueToUrl(filename), { signal: controller.signal });
// //           if (!response.ok) return;
// //           const data = await response.json();
// //           imageData = data?.imageData || "";
// //           if (!imageData || cancelled) return;
// //           await ImageCache.setBase64(filename, imageData);
// //         }
// //         if (!cancelled) {
// //           setImageUrls((prev) => ({ ...prev, [productId]: `data:image/jpeg;base64,${imageData}` }));
// //         }
// //       } catch {}
// //     };

// //     Promise.allSettled(imageProducts.map(fetchOne));

// //     return () => {
// //       cancelled = true;
// //       controller.abort();
// //     };
// //   }, [record, catalogById]);

// //   const totalProducts = useMemo(() => {
// //     if (!record) return 0;
// //     return (record.categorie || []).reduce((sum, cat) => sum + (cat.products || []).length, 0);
// //   }, [record]);

// //   const togglePincode = (pin) => {
// //     setSelectedPincodes((prev) =>
// //       prev.includes(pin) ? prev.filter((p) => p !== pin) : [...prev, pin],
// //     );
// //   };

// //   const isZoneFullySelected = (zone) =>
// //     zoneData[zone].every((pin) => selectedPincodes.includes(pin));

// //   const toggleZone = (zone) => {
// //     const pins = zoneData[zone];
// //     setSelectedPincodes((prev) => {
// //       const allSelected = pins.every((pin) => prev.includes(pin));
// //       return allSelected
// //         ? prev.filter((pin) => !pins.includes(pin))
// //         : Array.from(new Set([...prev, ...pins]));
// //     });
// //   };

// //   // Move a category up (-1) or down (+1) in the display order and
// //   // re-number every category's rank 1..N to match the new order.
// //   const moveCategory = (index, direction) => {
// //     setOrderedCategories((prev) => {
// //       const targetIndex = index + direction;
// //       if (targetIndex < 0 || targetIndex >= prev.length) return prev;
// //       const next = [...prev];
// //       [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
// //       return next.map((cat, idx) => ({ ...cat, rank: String(idx + 1) }));
// //     });
// //   };

// //   // Whether the admin has reordered categories since the record was
// //   // loaded (or last saved) — same on/off pattern as pincodesChanged,
// //   // shown as a "Save category order" action.
// //   const categoryOrderChanged = useMemo(() => {
// //     if (!record) return false;
// //     const original = (record.categorie || []).map((cat) => cat.categoryName);
// //     const current = orderedCategories.map((cat) => cat.categoryName);
// //     return JSON.stringify(original) !== JSON.stringify(current);
// //   }, [record, orderedCategories]);

// //   const handleSaveCategoryOrder = async () => {
// //     if (!record) return;
// //     setSaving(true);
// //     setError("");
// //     setMessage("");
// //     try {
// //       const payload = {
// //         ...record,
// //         updatedDate: new Date().toISOString(),
// //         categorie: orderedCategories,
// //       };
// //       await updateVendorProductsValues(payload);
// //       setRecord(payload);
// //       setMessage("Category order updated.");
// //     } catch (err) {
// //       console.error("Failed to update category order", err);
// //       setError("Unable to save the category order. Please try again.");
// //     } finally {
// //       setSaving(false);
// //     }
// //   };

// //   const statusBadgeClass = (status) => {
// //     if (status === "Approved") return "bg-success";
// //     if (status === "Reject" || status === "Rejected") return "bg-danger";
// //     return "bg-warning text-dark";
// //   };

// //   // Whether the admin has changed the zone/pincode selection since the
// //   // record was loaded — lets the "Save pincodes" action stay independent
// //   // of whatever the current Approved/Rejected status is.
// //   const pincodesChanged = useMemo(() => {
// //     if (!record) return false;
// //     const original = Array.isArray(record.pincodes) ? [...record.pincodes].sort() : [];
// //     const current = [...selectedPincodes].sort();
// //     return JSON.stringify(original) !== JSON.stringify(current);
// //   }, [record, selectedPincodes]);

// //   const handleDecision = async (newStatus) => {
// //     if (!record) return;
// //     setSaving(true);
// //     setError("");
// //     setMessage("");
// //     try {
// //       const payload = {
// //         ...record,
// //         status: newStatus,
// //         updatedDate: new Date().toISOString(),
// //         pincodes: selectedPincodes,
// //       };
// //       await updateVendorProductsValues(payload);
// //       setRecord(payload);
// //       setMessage(newStatus === "Approved" ? "Submission approved." : "Submission rejected.");
// //     } catch (err) {
// //       console.error("Failed to update vendor products", err);
// //       setError("Unable to save this decision. Please try again.");
// //     } finally {
// //       setSaving(false);
// //     }
// //   };

// //   // Lets the admin update just the pincode/zone mapping — at any time,
// //   // whether the submission is Pending, Approved, or Rejected — without
// //   // changing the current approval status.
// //   const handleSavePincodes = async () => {
// //     if (!record) return;
// //     setSaving(true);
// //     setError("");
// //     setMessage("");
// //     try {
// //       const payload = {
// //         ...record,
// //         updatedDate: new Date().toISOString(),
// //         pincodes: selectedPincodes,
// //       };
// //       await updateVendorProductsValues(payload);
// //       setRecord(payload);
// //       setMessage("Pincode mapping updated.");
// //     } catch (err) {
// //       console.error("Failed to update vendor pincodes", err);
// //       setError("Unable to save the pincode changes. Please try again.");
// //     } finally {
// //       setSaving(false);
// //     }
// //   };

// //   if (loading) {
// //     return (
// //       <div className="container py-4">
// //         <SuperAdminNav active="/superadmin/vendors" />
// //         <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
// //           <div className="spinner-border text-primary" role="status">
// //             <span className="visually-hidden">Loading...</span>
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="container py-4">
// //       <SuperAdminNav active="/superadmin/vendors" />

// //       <button className="btn btn-link px-0 mb-3" onClick={() => navigate("/superadmin/vendors")}>
// //         &larr; Back to vendors
// //       </button>

// //       {error && <div className="alert alert-danger">{error}</div>}
// //       {message && <div className="alert alert-success">{message}</div>}

// //       {!record && !error && (
// //         <div className="text-muted text-center py-5">This vendor hasn't submitted any products yet.</div>
// //       )}

// //       {record && (
// //         <>
// //           <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
// //             <div>
// //               <h3 className="mb-1">{record.storeName || "Vendor"}</h3>
// //               <div className="text-muted small">
// //                 {totalProducts} product{totalProducts === 1 ? "" : "s"} across{" "}
// //                 {(record.categorie || []).length} categor{(record.categorie || []).length === 1 ? "y" : "ies"}
// //               </div>
// //             </div>
// //             <span className={`badge ${statusBadgeClass(record.status)} fs-6`}>{record.status || "Pending"}</span>
// //           </div>

// //           {/* ---- Pincodes this vendor is assigned to service, editable by zone ---- */}
// //           <div className="mb-4">
// //             <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
// //               <h6 className="mb-0">Serviceable pincodes</h6>
// //               <div className="d-flex align-items-center gap-2">
// //                 {selectedPincodes.length > 0 && (
// //                   <span className="badge bg-primary">
// //                     {selectedPincodes.length} pincode{selectedPincodes.length === 1 ? "" : "s"} selected
// //                   </span>
// //                 )}
// //                 {pincodesChanged && (
// //                   <button
// //                     className="btn btn-sm btn-outline-primary"
// //                     disabled={saving}
// //                     onClick={handleSavePincodes}
// //                   >
// //                     {saving ? "Saving..." : "Save pincodes"}
// //                   </button>
// //                 )}
// //               </div>
// //             </div>
// //             <p className="text-muted small mb-2">
// //               The zone/pincode mapping can be changed at any time, regardless of the current approval status.
// //             </p>
// //             <div className="row g-3">
// //               {Object.entries(zoneData).map(([zone, pins]) => (
// //                 <div className="col-12 col-sm-6 col-lg-4" key={zone}>
// //                   <div className="border rounded p-2 h-100">
// //                     <label className="d-flex align-items-center gap-2 fw-bold mb-2" style={{ cursor: "pointer" }}>
// //                       <input
// //                         type="checkbox"
// //                         className="form-check-input mt-0"
// //                         checked={isZoneFullySelected(zone)}
// //                         onChange={() => toggleZone(zone)}
// //                       />
// //                       Zone {zone}
// //                     </label>
// //                     <div className="d-flex flex-wrap gap-2">
// //                       {pins.map((pin) => (
// //                         <label
// //                           key={pin}
// //                           className={`border rounded px-2 py-1 small d-flex align-items-center gap-1 ${
// //                             selectedPincodes.includes(pin) ? "border-primary border-2" : ""
// //                           }`}
// //                           style={{ cursor: "pointer" }}
// //                         >
// //                           <input
// //                             type="checkbox"
// //                             className="form-check-input mt-0"
// //                             checked={selectedPincodes.includes(pin)}
// //                             onChange={() => togglePincode(pin)}
// //                           />
// //                           {pin}
// //                         </label>
// //                       ))}
// //                     </div>
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //           </div>

// //           {orderedCategories.length > 0 && (
// //             <div className="d-flex justify-content-between align-items-center mb-2">
// //               <h6 className="mb-0">Category order (as shown to customers)</h6>
// //               {categoryOrderChanged && (
// //                 <button
// //                   className="btn btn-sm btn-outline-primary"
// //                   disabled={saving}
// //                   onClick={handleSaveCategoryOrder}
// //                 >
// //                   {saving ? "Saving..." : "Save category order"}
// //                 </button>
// //               )}
// //             </div>
// //           )}

// //           {orderedCategories.map((cat, index) => (
// //             <div key={cat.categoryName} className="mb-4">
// //               <div className="d-flex align-items-center gap-2 mb-2">
// //                 <span className="badge bg-secondary">#{cat.rank}</span>
// //                 <h6 className="mb-0">{cat.categoryName}</h6>
// //                 <div className="btn-group btn-group-sm ms-auto" role="group">
// //                   <button
// //                     type="button"
// //                     className="btn btn-outline-secondary"
// //                     title="Move up"
// //                     disabled={index === 0}
// //                     onClick={() => moveCategory(index, -1)}
// //                   >
// //                     &uarr;
// //                   </button>
// //                   <button
// //                     type="button"
// //                     className="btn btn-outline-secondary"
// //                     title="Move down"
// //                     disabled={index === orderedCategories.length - 1}
// //                     onClick={() => moveCategory(index, 1)}
// //                   >
// //                     &darr;
// //                   </button>
// //                 </div>
// //               </div>
// //               <div className="row g-2">
// //                 {(cat.products || []).map((p) => {
// //                   const master = catalogById[String(p.productIds)];
// //                   const photo = imageUrls[p.productIds];
// //                   return (
// //                     <div className="col-12 col-sm-6 col-lg-4" key={p.productIds}>
// //                       <div className="border rounded p-2 d-flex gap-2 align-items-center">
// //                         <div
// //                           className="flex-shrink-0 bg-light rounded d-flex align-items-center justify-content-center overflow-hidden"
// //                           style={{ width: 48, height: 48 }}
// //                         >
// //                           {photo ? (
// //                             <img src={photo} alt={master?.name || "Product"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
// //                           ) : (
// //                             <span className="text-muted" style={{ fontSize: "9px" }}>
// //                               No image
// //                             </span>
// //                           )}
// //                         </div>
// //                         <div className="small">
// //                           <div className="fw-bold">{master?.name || `Product ${p.productIds}`}</div>
// //                           <div>
// //                             Qty: {p.quantity} &middot; Discount: {p.discount}% &middot; Limit: {p.limit}
// //                           </div>
// //                         </div>
// //                       </div>
// //                     </div>
// //                   );
// //                 })}
// //               </div>
// //             </div>
// //           ))}

// //           <div className="d-flex gap-2 mt-2">
// //             <button
// //               className="btn btn-success"
// //               disabled={saving}
// //               onClick={() => handleDecision("Approved")}
// //             >
// //               {saving ? "Saving..." : record.status === "Approved" ? "Re-approve" : "Approve"}
// //             </button>
// //             <button
// //               className="btn btn-outline-danger"
// //               disabled={saving}
// //               onClick={() => handleDecision("Reject")}
// //             >
// //               Reject
// //             </button>
// //           </div>
// //         </>
// //       )}
// //     </div>
// //   );
// // };

// // export default SuperAdminVendorProductsPage;

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getVendorProductsByVendorId,
  updateVendorProductsValues,
} from "./utils/superAdminStore";
import { getGroceryItems } from "./utils/groceryStore";
import ImageCache from "./utils/ImageCache";
import { getImageFilename, imageValueToUrl } from "./utils/imageSource";
import SuperAdminNav from "./SuperAdminNav";

const SuperAdminVendorProductsPage = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();

  const [record, setRecord] = useState(null);
  const [catalogById, setCatalogById] = useState({});
  const [imageUrls, setImageUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  // Pincodes the super admin is assigning to this vendor's coverage —
  // seeded from whatever the vendor already has on record, editable here,
  // and sent back as "pincodes" on approve/reject.
  const [selectedPincodes, setSelectedPincodes] = useState([]);

  // Display order of this vendor's categories, editable by the admin with
  // the up/down arrows below. Seeded from record.categorie — sorted by
  // whatever "rank" the backend already has (falling back to the order the
  // API returned them in for records with no rank yet) — then kept in
  // local state so re-ordering is instant, with rank 1..N re-assigned
  // every time the order changes and saved back explicitly.
  const [orderedCategories, setOrderedCategories] = useState([]);

  // productId -> boolean, true meaning "this product is Approved". Seeded
  // from each product's own status field. Checking/unchecking here is
  // exactly what moves a product between the "Approved" and "Pending
  // approval" sections below — the two sections are just the same product
  // list filtered by this state, never two separately-tracked lists.
  const [productApproval, setProductApproval] = useState({});
  // Snapshot of productApproval taken right after load/save, so we can
  // tell whether the admin has made any unsaved approval changes yet.
  const [originalApproval, setOriginalApproval] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      setMessage("");
      try {
        const [productRecord, catalog] = await Promise.all([
          getVendorProductsByVendorId(vendorId),
          getGroceryItems().catch(() => []),
        ]);
        if (cancelled) return;
        setRecord(productRecord);
        setSelectedPincodes(
          Array.isArray(productRecord?.pincodes) ? productRecord.pincodes : [],
        );
        const cats = Array.isArray(productRecord?.categorie)
          ? productRecord.categorie
          : [];
        const sorted = [...cats].sort((a, b) => {
          const rankA = Number(a.rank);
          const rankB = Number(b.rank);
          if (Number.isFinite(rankA) && Number.isFinite(rankB))
            return rankA - rankB;
          if (Number.isFinite(rankA)) return -1;
          if (Number.isFinite(rankB)) return 1;
          return 0;
        });
        const orderedCats = sorted.map((cat, idx) => ({
          ...cat,
          rank: String(idx + 1),
        }));
        setOrderedCategories(orderedCats);

        // Seed the checkbox state from each product's own status.
        const approvalSeed = {};
        orderedCats.forEach((cat) => {
          (cat.products || []).forEach((p) => {
            approvalSeed[p.productIds] = p.status === "Approved";
          });
        });
        setProductApproval(approvalSeed);
        setOriginalApproval(approvalSeed);

        const byId = {};
        (Array.isArray(catalog) ? catalog : []).forEach((item) => {
          if (item?.id) byId[String(item.id)] = item;
        });
        setCatalogById(byId);
      } catch (err) {
        console.error("Failed to load vendor products", err);
        if (!cancelled)
          setError(
            "Unable to load this vendor's submitted products right now.",
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [vendorId]);

  // Resolve each product's photo against the master LMart catalog —
  // cache-first, same pattern used everywhere else images are shown.
  useEffect(() => {
    if (!record) return;
    const products = (record.categorie || []).flatMap(
      (cat) => cat.products || [],
    );
    const imageProducts = products
      .map((p) => {
        const master = catalogById[String(p.productIds)];
        const photo = Array.isArray(master?.images) ? master.images[0] : null;
        return { productId: p.productIds, photo };
      })
      .filter(({ photo }) => Boolean(photo));
    if (!imageProducts.length) return;

    const controller = new AbortController();
    let cancelled = false;

    const fetchOne = async ({ productId, photo }) => {
      try {
        const filename = getImageFilename(photo);
        if (!filename) {
          const directUrl = imageValueToUrl(photo);
          if (directUrl && !cancelled)
            setImageUrls((prev) => ({ ...prev, [productId]: directUrl }));
          return;
        }
        let imageData = await ImageCache.getBase64(filename);
        if (!imageData) {
          const response = await fetch(imageValueToUrl(filename), {
            signal: controller.signal,
          });
          if (!response.ok) return;
          const data = await response.json();
          imageData = data?.imageData || "";
          if (!imageData || cancelled) return;
          await ImageCache.setBase64(filename, imageData);
        }
        if (!cancelled) {
          setImageUrls((prev) => ({
            ...prev,
            [productId]: `data:image/jpeg;base64,${imageData}`,
          }));
        }
      } catch {}
    };

    Promise.allSettled(imageProducts.map(fetchOne));

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [record, catalogById]);

  const totalProducts = useMemo(() => {
    if (!record) return 0;
    return (record.categorie || []).reduce(
      (sum, cat) => sum + (cat.products || []).length,
      0,
    );
  }, [record]);

  const togglePincode = (pin) => {
    setSelectedPincodes((prev) =>
      prev.includes(pin) ? prev.filter((p) => p !== pin) : [...prev, pin],
    );
  };

  // Move a category up (-1) or down (+1) in the display order and
  // re-number every category's rank 1..N to match the new order. This
  // controls the customer-facing storefront order, so it's shown attached
  // to the Approved section below (only approved products are visible to
  // customers in the first place).
  const moveCategory = (index, direction) => {
    setOrderedCategories((prev) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next.map((cat, idx) => ({ ...cat, rank: String(idx + 1) }));
    });
  };

  // Whether the admin has reordered categories since the record was
  // loaded (or last saved) — same on/off pattern as pincodesChanged,
  // shown as a "Save category order" action.
  const categoryOrderChanged = useMemo(() => {
    if (!record) return false;
    const original = (record.categorie || []).map((cat) => cat.categoryName);
    const current = orderedCategories.map((cat) => cat.categoryName);
    return JSON.stringify(original) !== JSON.stringify(current);
  }, [record, orderedCategories]);

  const handleSaveCategoryOrder = async () => {
    if (!record) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        ...record,
        updatedDate: new Date().toISOString(),
        categorie: orderedCategories,
      };
      await updateVendorProductsValues(payload);
      setRecord(payload);
      setMessage("Category order updated.");
    } catch (err) {
      console.error("Failed to update category order", err);
      setError("Unable to save the category order. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const statusBadgeClass = (status) => {
    if (status === "Approved") return "bg-success";
    if (status === "Reject" || status === "Rejected") return "bg-danger";
    return "bg-warning text-dark";
  };

  // Whether the admin has changed the zone/pincode selection since the
  // record was loaded — lets the "Save pincodes" action stay independent
  // of whatever the current Approved/Rejected status is.
  const pincodesChanged = useMemo(() => {
    if (!record) return false;
    const original = Array.isArray(record.pincodes)
      ? [...record.pincodes].sort()
      : [];
    const current = [...selectedPincodes].sort();
    return JSON.stringify(original) !== JSON.stringify(current);
  }, [record, selectedPincodes]);

  const handleDecision = async (newStatus) => {
    if (!record) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        ...record,
        status: newStatus,
        updatedDate: new Date().toISOString(),
        pincodes: selectedPincodes,
      };
      await updateVendorProductsValues(payload);
      setRecord(payload);
      setMessage(
        newStatus === "Approved"
          ? "Submission approved."
          : "Submission rejected.",
      );
    } catch (err) {
      console.error("Failed to update vendor products", err);
      setError("Unable to save this decision. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Lets the admin update just the pincode/zone mapping — at any time,
  // whether the submission is Pending, Approved, or Rejected — without
  // changing the current approval status.
  const handleSavePincodes = async () => {
    if (!record) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        ...record,
        updatedDate: new Date().toISOString(),
        pincodes: selectedPincodes,
      };
      await updateVendorProductsValues(payload);
      setRecord(payload);
      setMessage("Pincode mapping updated.");
    } catch (err) {
      console.error("Failed to update vendor pincodes", err);
      setError("Unable to save the pincode changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const toggleProductApproval = (productId) => {
    setProductApproval((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  // orderedCategories split into two parallel views, purely by the current
  // (unsaved) checkbox state — a product lives in exactly one of these at
  // any moment, and toggling its checkbox is what moves it between them.
  const { approvedCategories, pendingCategories } = useMemo(() => {
    const approved = [];
    const pending = [];
    orderedCategories.forEach((cat) => {
      const approvedProducts = [];
      const pendingProducts = [];
      (cat.products || []).forEach((p) => {
        if (productApproval[p.productIds]) approvedProducts.push(p);
        else pendingProducts.push(p);
      });
      if (approvedProducts.length)
        approved.push({ ...cat, products: approvedProducts });
      if (pendingProducts.length)
        pending.push({ ...cat, products: pendingProducts });
    });
    return { approvedCategories: approved, pendingCategories: pending };
  }, [orderedCategories, productApproval]);

  // Whether any checkbox differs from what's currently saved on the
  // server — enables the "Save approval changes" action.
  const approvalChanged = useMemo(
    () => JSON.stringify(originalApproval) !== JSON.stringify(productApproval),
    [originalApproval, productApproval],
  );

  // Persists the current checkbox state back to each product's status
  // field ("Approved" if checked, "Pending" if not), keeping every other
  // field on the record (pincodes, category order, quantity/discount/
  // limit per product) untouched.
  const handleSaveApprovals = async () => {
    if (!record) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const updatedCategorie = orderedCategories.map((cat) => ({
        ...cat,
        products: (cat.products || []).map((p) => ({
          ...p,
          status: productApproval[p.productIds] ? "Approved" : "Pending",
        })),
      }));
      const payload = {
        ...record,
        updatedDate: new Date().toISOString(),
        categorie: updatedCategorie,
      };
      await updateVendorProductsValues(payload);
      setRecord(payload);
      setOrderedCategories(updatedCategorie);
      setOriginalApproval(productApproval);
      setMessage("Product approvals updated.");
    } catch (err) {
      console.error("Failed to update product approvals", err);
      setError("Unable to save the approval changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const renderProductCard = (p) => {
    const master = catalogById[String(p.productIds)];
    const photo = imageUrls[p.productIds];
    const checked = !!productApproval[p.productIds];
    return (
      <div className="col-12 col-sm-6 col-lg-4" key={p.productIds}>
        <label
          className={`border rounded p-2 d-flex gap-2 align-items-center w-100 ${checked ? "border-success border-2" : ""}`}
          style={{ cursor: "pointer" }}
        >
          <input
            type="checkbox"
            className="form-check-input mt-0 flex-shrink-0"
            checked={checked}
            onChange={() => toggleProductApproval(p.productIds)}
          />
          <div
            className="flex-shrink-0 bg-light rounded d-flex align-items-center justify-content-center overflow-hidden"
            style={{ width: 48, height: 48 }}
          >
            {photo ? (
              <img
                src={photo}
                alt={master?.name || "Product"}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span className="text-muted" style={{ fontSize: "9px" }}>
                No image
              </span>
            )}
          </div>
          <div className="small">
            <div className="fw-bold">
              {master?.name || `Product ${p.productIds}`}
            </div>
            <div>
              Qty: {p.quantity} &middot; Discount: {p.discount}% &middot; Limit:{" "}
              {p.limit}
            </div>
          </div>
        </label>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container py-4">
        <SuperAdminNav active="/superadmin/vendors" />
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "50vh" }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <SuperAdminNav active="/superadmin/vendors" />

      <button
        className="btn btn-link px-0 mb-3"
        onClick={() => navigate("/superadmin/vendors")}
      >
        &larr; Back to vendors
      </button>

      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      {!record && !error && (
        <div className="text-muted text-center py-5">
          This vendor hasn't submitted any products yet.
        </div>
      )}

      {record && (
        <>
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
            <div>
              <h3 className="mb-1">{record.storeName || "Vendor"}</h3>
              <div className="text-muted small">
                {totalProducts} product{totalProducts === 1 ? "" : "s"} across{" "}
                {(record.categorie || []).length} categor
                {(record.categorie || []).length === 1 ? "y" : "ies"}
              </div>
            </div>
            <span className={`badge ${statusBadgeClass(record.status)} fs-6`}>
              {record.status || "Pending"}
            </span>
          </div>

          {/* ---- Pincodes this vendor is assigned to service, editable by zone ---- */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
              <h6 className="mb-0">Serviceable pincodes</h6>
              <div className="d-flex align-items-center gap-2">
                {selectedPincodes.length > 0 && (
                  <span className="badge bg-primary">
                    {selectedPincodes.length} pincode
                    {selectedPincodes.length === 1 ? "" : "s"} selected
                  </span>
                )}
                {pincodesChanged && (
                  <button
                    className="btn btn-sm btn-outline-primary"
                    disabled={saving}
                    onClick={handleSavePincodes}
                  >
                    {saving ? "Saving..." : "Save pincodes"}
                  </button>
                )}
              </div>
            </div>
            <p className="text-muted small mb-2">
              The pincode mapping can be changed at any time, regardless of the
              current approval status.
            </p>
            {/* Flat list, bound straight to the "pincodes" array on the
                vendor record itself — no zone grouping. */}
            <div className="d-flex flex-column gap-1">
              {(record?.pincodes || []).map((pin) => (
                <label
                  key={pin}
                  className="d-flex align-items-center gap-2 small mb-0"
                  style={{ cursor: "pointer" }}
                >
                  <input
                    type="checkbox"
                    className="form-check-input mt-0"
                    checked={selectedPincodes.includes(pin)}
                    onChange={() => togglePincode(pin)}
                  />
                  {pin}
                </label>
              ))}
            </div>
          </div>

          {/* ---- Approved products — checked here, visible to customers ---- */}
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
            <h5 className="mb-0">
              Approved{" "}
              {approvedCategories.length > 0 && (
                <span className="badge bg-success ms-1">
                  {approvedCategories.reduce(
                    (sum, c) => sum + c.products.length,
                    0,
                  )}
                </span>
              )}
            </h5>
            <div className="d-flex align-items-center gap-2">
              {categoryOrderChanged && (
                <button
                  className="btn btn-sm btn-outline-primary"
                  disabled={saving}
                  onClick={handleSaveCategoryOrder}
                >
                  {saving ? "Saving..." : "Save category order"}
                </button>
              )}
              {approvalChanged && (
                <button
                  className="btn btn-sm btn-success"
                  disabled={saving}
                  onClick={handleSaveApprovals}
                >
                  {saving ? "Saving..." : "Save approval changes"}
                </button>
              )}
            </div>
          </div>

          {approvedCategories.length === 0 ? (
            <p className="text-muted small mb-4">No products approved yet.</p>
          ) : (
            approvedCategories.map((cat) => {
              // Use the position in the full orderedCategories list (not
              // this filtered array) so up/down still reflects the real
              // customer-facing category order, even while some
              // categories are hidden here for having zero approved items.
              const fullIndex = orderedCategories.findIndex(
                (c) => c.categoryName === cat.categoryName,
              );
              return (
                <div key={cat.categoryName} className="mb-4">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="badge bg-secondary">#{cat.rank}</span>
                    <h6 className="mb-0">{cat.categoryName}</h6>
                    <div
                      className="btn-group btn-group-sm ms-auto"
                      role="group"
                    >
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        title="Move up"
                        disabled={fullIndex <= 0}
                        onClick={() => moveCategory(fullIndex, -1)}
                      >
                        &uarr;
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        title="Move down"
                        disabled={
                          fullIndex === -1 ||
                          fullIndex >= orderedCategories.length - 1
                        }
                        onClick={() => moveCategory(fullIndex, 1)}
                      >
                        &darr;
                      </button>
                    </div>
                  </div>
                  <div className="row g-2">
                    {cat.products.map(renderProductCard)}
                  </div>
                </div>
              );
            })
          )}

          {/* ---- Pending approval — unchecked here, hidden from customers until approved ---- */}
          <h5 className="mt-4 mb-2">
            Pending approval{" "}
            {pendingCategories.length > 0 && (
              <span className="badge bg-warning text-dark ms-1">
                {pendingCategories.reduce(
                  (sum, c) => sum + c.products.length,
                  0,
                )}
              </span>
            )}
          </h5>

          {pendingCategories.length === 0 ? (
            <p className="text-muted small mb-4">
              Nothing pending — every product has been reviewed.
            </p>
          ) : (
            pendingCategories.map((cat) => (
              <div key={cat.categoryName} className="mb-4">
                <h6 className="mb-2">{cat.categoryName}</h6>
                <div className="row g-2">
                  {cat.products.map(renderProductCard)}
                </div>
              </div>
            ))
          )}

          <div className="d-flex gap-2 mt-2">
            <button
              className="btn btn-success"
              disabled={saving}
              onClick={() => handleDecision("Approved")}
            >
              {saving
                ? "Saving..."
                : record.status === "Approved"
                  ? "Re-approve"
                  : "Approve"}
            </button>
            <button
              className="btn btn-outline-danger"
              disabled={saving}
              onClick={() => handleDecision("Reject")}
            >
              Reject
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SuperAdminVendorProductsPage;
