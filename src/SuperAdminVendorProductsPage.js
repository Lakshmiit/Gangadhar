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
//         setOrderedCategories(sorted.map((cat, idx) => ({ ...cat, rank: String(idx + 1) })));
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
//   // re-number every category's rank 1..N to match the new order.
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

//           {orderedCategories.length > 0 && (
//             <div className="d-flex justify-content-between align-items-center mb-2">
//               <h6 className="mb-0">Category order (as shown to customers)</h6>
//               {categoryOrderChanged && (
//                 <button
//                   className="btn btn-sm btn-outline-primary"
//                   disabled={saving}
//                   onClick={handleSaveCategoryOrder}
//                 >
//                   {saving ? "Saving..." : "Save category order"}
//                 </button>
//               )}
//             </div>
//           )}

//           {orderedCategories.map((cat, index) => (
//             <div key={cat.categoryName} className="mb-4">
//               <div className="d-flex align-items-center gap-2 mb-2">
//                 <span className="badge bg-secondary">#{cat.rank}</span>
//                 <h6 className="mb-0">{cat.categoryName}</h6>
//                 <div className="btn-group btn-group-sm ms-auto" role="group">
//                   <button
//                     type="button"
//                     className="btn btn-outline-secondary"
//                     title="Move up"
//                     disabled={index === 0}
//                     onClick={() => moveCategory(index, -1)}
//                   >
//                     &uarr;
//                   </button>
//                   <button
//                     type="button"
//                     className="btn btn-outline-secondary"
//                     title="Move down"
//                     disabled={index === orderedCategories.length - 1}
//                     onClick={() => moveCategory(index, 1)}
//                   >
//                     &darr;
//                   </button>
//                 </div>
//               </div>
//               <div className="row g-2">
//                 {(cat.products || []).map((p) => {
//                   const master = catalogById[String(p.productIds)];
//                   const photo = imageUrls[p.productIds];
//                   return (
//                     <div className="col-12 col-sm-6 col-lg-4" key={p.productIds}>
//                       <div className="border rounded p-2 d-flex gap-2 align-items-center">
//                         <div
//                           className="flex-shrink-0 bg-light rounded d-flex align-items-center justify-content-center overflow-hidden"
//                           style={{ width: 48, height: 48 }}
//                         >
//                           {photo ? (
//                             <img src={photo} alt={master?.name || "Product"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
//                           ) : (
//                             <span className="text-muted" style={{ fontSize: "9px" }}>
//                               No image
//                             </span>
//                           )}
//                         </div>
//                         <div className="small">
//                           <div className="fw-bold">{master?.name || `Product ${p.productIds}`}</div>
//                           <div>
//                             Qty: {p.quantity} &middot; Discount: {p.discount}% &middot; Limit: {p.limit}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           ))}

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

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getVendorProductsByVendorId,
  updateVendorProductsValues,
  getVendorZipcodes,
  getZoneForPincode,
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

  // The pincodes this vendor registered as serviceable (from
  // GetVendorDetailsByVendorId) — this is now the full universe of
  // checkboxes shown below, instead of every zone in the city.
  const [vendorZipcodes, setVendorZipcodes] = useState([]);

  // Pincodes the super admin is assigning to this vendor's coverage —
  // seeded from whatever the vendor already has on record, editable here,
  // and sent back as "pincodes" on approve/reject. Always a subset of
  // vendorZipcodes.
  const [selectedPincodes, setSelectedPincodes] = useState([]);

  // Display order of this vendor's categories, editable by the admin with
  // the up/down arrows below. Seeded from record.categorie — sorted by
  // whatever "rank" the backend already has (falling back to the order the
  // API returned them in for records with no rank yet) — then kept in
  // local state so re-ordering is instant, with rank 1..N re-assigned
  // every time the order changes and saved back explicitly.
  const [orderedCategories, setOrderedCategories] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      setMessage("");
      try {
        const [productRecord, catalog, zipcodes] = await Promise.all([
          getVendorProductsByVendorId(vendorId),
          getGroceryItems().catch(() => []),
          getVendorZipcodes(vendorId).catch(() => []),
        ]);
        if (cancelled) return;
        setRecord(productRecord);
        setVendorZipcodes(zipcodes);
        // Seed selection from whatever's already saved on the product
        // record, but only keep entries that are still among the vendor's
        // registered zipcodes — anything else (e.g. left over from the
        // old zone-based picker) would just be dead weight here.
        const savedPincodes = Array.isArray(productRecord?.pincodes)
          ? productRecord.pincodes
          : [];
        setSelectedPincodes(
          zipcodes.length
            ? savedPincodes.filter((pin) => zipcodes.includes(pin))
            : savedPincodes,
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
        setOrderedCategories(
          sorted.map((cat, idx) => ({ ...cat, rank: String(idx + 1) })),
        );
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

  const allVendorPincodesSelected =
    vendorZipcodes.length > 0 &&
    vendorZipcodes.every((pin) => selectedPincodes.includes(pin));

  const toggleAllVendorPincodes = () => {
    setSelectedPincodes((prev) =>
      vendorZipcodes.every((pin) => prev.includes(pin))
        ? []
        : [...vendorZipcodes],
    );
  };

  // Move a category up (-1) or down (+1) in the display order and
  // re-number every category's rank 1..N to match the new order.
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

  // Whether the admin has changed the pincode selection since the record
  // was loaded — lets the "Save pincodes" action stay independent of
  // whatever the current Approved/Rejected status is.
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

  // Lets the admin update just the pincode mapping — at any time, whether
  // the submission is Pending, Approved, or Rejected — without changing
  // the current approval status.
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

          {/* ---- Pincodes this vendor registered as serviceable ---- */}
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
              These are the pincodes this vendor registered as serviceable. Pick
              which ones to actually assign — this can be changed at any time,
              regardless of the current approval status.
            </p>

            {vendorZipcodes.length === 0 ? (
              <div className="text-muted small fst-italic">
                No registered pincodes found for this vendor.
              </div>
            ) : (
              <div className="border rounded p-2">
                <label
                  className="d-flex align-items-center gap-2 fw-bold mb-2"
                  style={{ cursor: "pointer" }}
                >
                  <input
                    type="checkbox"
                    className="form-check-input mt-0"
                    checked={allVendorPincodesSelected}
                    onChange={toggleAllVendorPincodes}
                  />
                  Select all
                </label>
                <div className="d-flex flex-wrap gap-2">
                  {vendorZipcodes.map((pin) => {
                    const zone = getZoneForPincode(pin);
                    return (
                      <label
                        key={pin}
                        className={`border rounded px-2 py-1 small d-flex align-items-center gap-1 ${
                          selectedPincodes.includes(pin)
                            ? "border-primary border-2"
                            : ""
                        }`}
                        style={{ cursor: "pointer" }}
                      >
                        <input
                          type="checkbox"
                          className="form-check-input mt-0"
                          checked={selectedPincodes.includes(pin)}
                          onChange={() => togglePincode(pin)}
                        />
                        {pin}
                        {zone && (
                          <span className="text-muted">(Zone {zone})</span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {orderedCategories.length > 0 && (
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0">Category order (as shown to customers)</h6>
              {categoryOrderChanged && (
                <button
                  className="btn btn-sm btn-outline-primary"
                  disabled={saving}
                  onClick={handleSaveCategoryOrder}
                >
                  {saving ? "Saving..." : "Save category order"}
                </button>
              )}
            </div>
          )}

          {orderedCategories.map((cat, index) => (
            <div key={cat.categoryName} className="mb-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge bg-secondary">#{cat.rank}</span>
                <h6 className="mb-0">{cat.categoryName}</h6>
                <div className="btn-group btn-group-sm ms-auto" role="group">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    title="Move up"
                    disabled={index === 0}
                    onClick={() => moveCategory(index, -1)}
                  >
                    &uarr;
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    title="Move down"
                    disabled={index === orderedCategories.length - 1}
                    onClick={() => moveCategory(index, 1)}
                  >
                    &darr;
                  </button>
                </div>
              </div>
              <div className="row g-2">
                {(cat.products || []).map((p) => {
                  const master = catalogById[String(p.productIds)];
                  const photo = imageUrls[p.productIds];
                  return (
                    <div
                      className="col-12 col-sm-6 col-lg-4"
                      key={p.productIds}
                    >
                      <div className="border rounded p-2 d-flex gap-2 align-items-center">
                        <div
                          className="flex-shrink-0 bg-light rounded d-flex align-items-center justify-content-center overflow-hidden"
                          style={{ width: 48, height: 48 }}
                        >
                          {photo ? (
                            <img
                              src={photo}
                              alt={master?.name || "Product"}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <span
                              className="text-muted"
                              style={{ fontSize: "9px" }}
                            >
                              No image
                            </span>
                          )}
                        </div>
                        <div className="small">
                          <div className="fw-bold">
                            {master?.name || `Product ${p.productIds}`}
                          </div>
                          <div>
                            Qty: {p.quantity} &middot; Discount: {p.discount}%
                            &middot; Limit: {p.limit}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

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
