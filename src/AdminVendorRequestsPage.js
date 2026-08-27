import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import {
  isVendorAdminLoggedIn,
  vendorAdminLogout,
  zoneData,
  assignPincodesToVendor,
  getPendingVendorProductRequests,
  approveVendorProductRequests,
  getVendorProfiles,
} from "./utils/vendorStorage";

const ZONE_NAMES = Object.keys(zoneData);

const AdminVendorRequestsPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState({}); // { [itemId]: true }
  const [selectedZone, setSelectedZone] = useState({}); // { [vendorName]: "A" }
  const [selectedPincodes, setSelectedPincodes] = useState({}); // { [vendorName]: Set<string> }
  const [approving, setApproving] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [expandedCategory, setExpandedCategory] = useState({}); // { [vendorName]: category | null }
  const [quantities, setQuantities] = useState({}); // { [itemId]: number }
  const [prices, setPrices] = useState({}); // { [itemId]: number } — admin-edited price
  const [editingPrice, setEditingPrice] = useState(null); // itemId currently being edited, or null
  const [expandedVendor, setExpandedVendor] = useState(null); // vendorName currently expanded, or null

  const vendorProfilesByName = useMemo(() => {
    const map = {};
    getVendorProfiles().forEach((profile) => { map[profile.name] = profile; });
    return map;
  }, []);

  useEffect(() => {
    if (!isVendorAdminLoggedIn()) {
      navigate("/vendor/login");
    }
  }, [navigate]);

  // Requests are saved locally (for now) by the vendor's "Submit for
  // Approval" action, instead of coming from the remote grocery API.
  const refreshItems = useCallback(() => {
    setItems(getPendingVendorProductRequests());
  }, []);

  useEffect(() => {
    refreshItems();
  }, [refreshItems]);

  const handleLogout = () => {
    vendorAdminLogout();
    navigate("/vendor/login");
  };

  // Pending requests, grouped by the vendor who submitted them.
  const vendorGroups = useMemo(() => {
    const groups = {};
    items.forEach((item) => {
      const vendorName = item.requestedBy || "Unknown Vendor";
      if (!groups[vendorName]) groups[vendorName] = { categories: new Set(), products: [] };
      groups[vendorName].categories.add(item.category || "Unspecified");
      groups[vendorName].products.push(item);
    });
    return groups;
  }, [items]);

  const toggleProduct = (id) => {
    setSelectedIds((current) => ({ ...current, [id]: !current[id] }));
  };

  const getCategoryProducts = (group, category) =>
    group.products.filter((item) => (item.category || "Unspecified") === category);

  const isCategoryFullySelected = (group, category) => {
    const products = getCategoryProducts(group, category);
    return products.length > 0 && products.every((item) => selectedIds[item.id]);
  };

  const toggleCategorySelectAll = (group, category, event) => {
    event.stopPropagation();
    const products = getCategoryProducts(group, category);
    const allSelected = products.every((item) => selectedIds[item.id]);
    setSelectedIds((current) => {
      const next = { ...current };
      products.forEach((item) => { next[item.id] = !allSelected; });
      return next;
    });
  };

  // Accordion: only one category open per vendor at a time, to keep the page compact.
  const toggleCategoryExpand = (vendorName, category) => {
    setExpandedCategory((current) => ({
      ...current,
      [vendorName]: current[vendorName] === category ? null : category,
    }));
  };

  const getQuantity = (itemId) => quantities[itemId] || 1;

  const changeQuantity = (itemId, delta, event) => {
    event.preventDefault();
    event.stopPropagation();
    setQuantities((current) => ({ ...current, [itemId]: Math.max(1, getQuantity(itemId) + delta) }));
  };

  // Accordion: only one vendor open at a time, so many vendors stay
  // scannable instead of dumping every card's full detail on screen.
  const toggleVendorExpand = (vendorName) => {
    setExpandedVendor((current) => (current === vendorName ? null : vendorName));
    setEditingPrice(null);
  };

  const getPrice = (item) => prices[item.id] ?? Math.round(item.afterDiscount || item.mrp || 0);

  const setPriceFor = (itemId, value) => {
    const num = Number(value);
    setPrices((current) => ({ ...current, [itemId]: Number.isFinite(num) && num >= 0 ? num : 0 }));
  };
  const togglePincode = (vendorName, code) => {
    setSelectedPincodes((current) => {
      const existing = new Set(current[vendorName] || []);
      existing.has(code) ? existing.delete(code) : existing.add(code);
      return { ...current, [vendorName]: existing };
    });
  };

  const approveVendor = (vendorName, products) => {
    const chosenProductIds = products.filter((p) => selectedIds[p.id]).map((p) => p.id);
    const productsToApprove = chosenProductIds.length ? products.filter((p) => chosenProductIds.includes(p.id)) : products;
    const pincodes = Array.from(selectedPincodes[vendorName] || []);

    if (pincodes.length === 0) {
      setError(`Select at least one pin code for ${vendorName} before approving.`);
      return;
    }

    setApproving(vendorName);
    setError("");
    setMessage("");
    try {
      // Approved locally (for now) instead of calling the remote grocery API.
      approveVendorProductRequests(vendorName, productsToApprove.map((p) => p.id), quantities, prices);
      assignPincodesToVendor(vendorName, pincodes);
      refreshItems();
      setSelectedIds((current) => {
        const next = { ...current };
        productsToApprove.forEach((p) => delete next[p.id]);
        return next;
      });
      setMessage(
        `Approved: ${productsToApprove.length} product${productsToApprove.length === 1 ? "" : "s"} from ${vendorName} for pin code${
          pincodes.length === 1 ? "" : "s"
        } ${pincodes.join(", ")}.`
      );
    } catch (err) {
      console.error("Vendor approval failed", err);
      setError(`Could not approve products for ${vendorName}. Please try again.`);
    } finally {
      setApproving("");
    }
  };

  const vendorNames = Object.keys(vendorGroups).sort();

  return (
    <div className="container py-4 pb-5">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div className="d-flex align-items-center gap-2">
          <StorefrontIcon style={{ color: "#2F6B4F" }} fontSize="large" />
          <div>
            <h3 className="mb-0">Vendor Requests</h3>
            <small className="text-muted">Categories &amp; products submitted by vendors, pending approval</small>
          </div>
        </div>
        <button className="btn btn-outline-secondary d-inline-flex align-items-center gap-1" onClick={handleLogout}>
          <LogoutIcon fontSize="small" /> Logout
        </button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {vendorNames.length === 0 ? (
        <div className="text-center text-muted py-5">No pending vendor requests right now.</div>
      ) : (
        vendorNames.map((vendorName) => {
          const group = vendorGroups[vendorName];
          const zone = selectedZone[vendorName] || ZONE_NAMES[0];
          const vendorPincodes = selectedPincodes[vendorName] || new Set();
          const checkedCount = group.products.filter((p) => selectedIds[p.id]).length;
          const vendorProfile = vendorProfilesByName[vendorName];
          const isVendorExpanded = expandedVendor === vendorName;

          return (
            <div key={vendorName} className="card border-0 shadow-sm mb-4 overflow-hidden">
              <div
                className="card-body d-flex justify-content-between align-items-start flex-wrap gap-2"
                style={{ cursor: "pointer", background: isVendorExpanded ? "#F4F8F5" : "#fff" }}
                onClick={() => toggleVendorExpand(vendorName)}
              >
                <div className="d-flex align-items-start gap-2">
                  <StorefrontIcon style={{ color: "#2F6B4F" }} fontSize="small" className="mt-1" />
                  <div>
                    <h4 className="mb-1">{vendorName}</h4>
                    {vendorProfile && (
                      <div className="mb-1">
                        {vendorProfile.phone && <small className="text-muted d-block">Phone: {vendorProfile.phone}</small>}
                        {vendorProfile.email && <small className="text-muted d-block">Email: {vendorProfile.email}</small>}
                      </div>
                    )}
                    <div>
                      {Array.from(group.categories).map((category) => (
                        <span key={category} className="badge bg-success me-1 mb-1">
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-warning text-dark fs-6">{group.products.length} product{group.products.length === 1 ? "" : "s"} pending</span>
                  {isVendorExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </div>
              </div>

              {isVendorExpanded && (
              <div className="card-body pt-0">
                {/* Categories — select-all checkbox, click to expand and see products */}
                <div className="mb-3">
                  {Array.from(group.categories).map((category) => {
                    const catProducts = getCategoryProducts(group, category);
                    const catChecked = isCategoryFullySelected(group, category);
                    const catCheckedCount = catProducts.filter((item) => selectedIds[item.id]).length;
                    const isExpanded = expandedCategory[vendorName] === category;
                    return (
                      <div className="border rounded-3 mb-2 overflow-hidden" key={category}>
                        <div
                          className="d-flex justify-content-between align-items-center p-2 px-3"
                          style={{ cursor: "pointer", background: isExpanded ? "#F4F8F5" : "#fff" }}
                          onClick={() => toggleCategoryExpand(vendorName, category)}
                        >
                          <div className="d-flex align-items-center gap-2">
                            <input
                              className="form-check-input mt-0"
                              type="checkbox"
                              checked={catChecked}
                              onClick={(event) => event.stopPropagation()}
                              onChange={(event) => toggleCategorySelectAll(group, category, event)}
                              aria-label={`Select all products in ${category}`}
                            />
                            <strong>{category}</strong>
                            <span className="badge bg-success">{catProducts.length}</span>
                            {catCheckedCount > 0 && (
                              <span className="badge bg-info text-dark">{catCheckedCount} selected</span>
                            )}
                          </div>
                          <span className="text-muted">{isExpanded ? "▲" : "▼"}</span>
                        </div>

                        {isExpanded && (
                          <div className="row g-2 p-2 pt-0">
                            {catProducts.map((item) => {
                              const checked = !!selectedIds[item.id];
                              return (
                                <div className="col-12 col-md-6 col-lg-4" key={item.id}>
                                  <label className={`card h-100 shadow-sm ${checked ? "border-success border-2" : ""}`} style={{ cursor: "pointer" }}>
                                    <div className="card-body py-2 px-3">
                                      <div className="form-check float-end">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          checked={checked}
                                          onChange={() => toggleProduct(item.id)}
                                          aria-label={`Select ${item.name}`}
                                        />
                                      </div>
                                      <div className="fw-bold pe-4">{item.name}</div>
                                      <small className="text-muted d-block">{item.category || "Unspecified"}</small>
                                      {editingPrice === item.id ? (
                                        <input
                                          type="number"
                                          min="0"
                                          autoFocus
                                          className="form-control form-control-sm mt-1"
                                          style={{ width: 90 }}
                                          value={getPrice(item)}
                                          onClick={(event) => event.preventDefault()}
                                          onChange={(event) => setPriceFor(item.id, event.target.value)}
                                          onBlur={() => setEditingPrice(null)}
                                          onKeyDown={(event) => event.key === "Enter" && setEditingPrice(null)}
                                        />
                                      ) : (
                                        <small
                                          className="d-inline-flex align-items-center gap-1"
                                          onClick={(event) => { event.preventDefault(); setEditingPrice(item.id); }}
                                        >
                                          ₹{getPrice(item)}
                                          <span className="text-muted" style={{ fontSize: "10px", textDecoration: "underline" }}>edit</span>
                                        </small>
                                      )}
                                      <div className="d-flex align-items-center gap-2 mt-2">
                                        <small className="text-muted">Qty:</small>
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-outline-secondary py-0 px-2"
                                          onClick={(event) => changeQuantity(item.id, -1, event)}
                                        >
                                          −
                                        </button>
                                        <span className="fw-bold">{getQuantity(item.id)}</span>
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-outline-secondary py-0 px-2"
                                          onClick={(event) => changeQuantity(item.id, 1, event)}
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div>
                                  </label>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <small className="text-muted d-block mb-3">
                  {checkedCount > 0 ? `${checkedCount} product(s) selected — only these will be approved.` : "None selected — approving will apply to all products above."}
                </small>

                {/* Pin code multi-select, grouped by zone */}
                <div className="border-top pt-3">
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                    <strong>Assign pin codes to this vendor</strong>
                    {vendorPincodes.size > 0 && <span className="badge bg-info text-dark">{vendorPincodes.size} pin code{vendorPincodes.size === 1 ? "" : "s"} selected</span>}
                  </div>
                  <div className="d-flex gap-2 flex-wrap mb-2">
                    {ZONE_NAMES.map((z) => (
                      <button
                        type="button"
                        key={z}
                        className={`btn btn-sm ${zone === z ? "btn-dark" : "btn-outline-dark"}`}
                        onClick={() => setSelectedZone((current) => ({ ...current, [vendorName]: z }))}
                      >
                        Zone {z}
                      </button>
                    ))}
                  </div>
                  <div className="d-flex gap-2 flex-wrap mb-3">
                    {zoneData[zone].map((code) => {
                      const isChecked = vendorPincodes.has(code);
                      return (
                        <div className="form-check form-check-inline" key={code}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`${vendorName}-${code}`}
                            checked={isChecked}
                            onChange={() => togglePincode(vendorName, code)}
                          />
                          <label className="form-check-label" htmlFor={`${vendorName}-${code}`}>
                            {code}
                          </label>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    className="btn"
                    style={{ backgroundColor: "#2F6B4F", color: "#fff" }}
                    disabled={approving === vendorName}
                    onClick={() => approveVendor(vendorName, group.products)}
                  >
                    {approving === vendorName ? "Approving…" : "Approve for selected pin codes"}
                  </button>
                </div>
              </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default AdminVendorRequestsPage;
