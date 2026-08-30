import React, { useEffect, useMemo, useState } from "react";

import "./InventoryStock.css";

const API_URL =
  "https://localhost:7091/api/UploadGrocery/GetAllGroceryItemsForAdmin";

const InventoryStock = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchInventoryItems = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      // Supports both direct array response and { data: [] }
      const result = Array.isArray(data) ? data : data?.data || [];

      setItems(result);
    } catch (err) {
      console.error("Failed to fetch inventory items:", err);
      setError("Unable to load inventory items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryItems();
  }, []);

  // ----------------------------------------
  // Calculate expiry information
  // ----------------------------------------
  const getExpiryInfo = (expiryDate) => {
    if (!expiryDate) {
      return {
        status: "No Expiry Date",
        className: "no-date",
        daysLeft: null,
      };
    }

    const expiry = new Date(expiryDate);

    if (Number.isNaN(expiry.getTime())) {
      return {
        status: "Invalid Date",
        className: "invalid",
        daysLeft: null,
      };
    }

    const today = new Date();

    // Ignore time portion
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    const difference = expiry.getTime() - today.getTime();
    const daysLeft = Math.ceil(difference / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return {
        status: "Expired",
        className: "expired",
        daysLeft,
      };
    }

    if (daysLeft === 0) {
      return {
        status: "Expires Today",
        className: "critical",
        daysLeft: 0,
      };
    }

    if (daysLeft <= 3) {
      return {
        status: "Critical",
        className: "critical",
        daysLeft,
      };
    }

    if (daysLeft <= 7) {
      return {
        status: "Expiring Soon",
        className: "warning",
        daysLeft,
      };
    }

    if (daysLeft <= 10) {
      return {
        status: "10 Day Alert",
        className: "alert",
        daysLeft,
      };
    }

    return {
      status: "Good",
      className: "good",
      daysLeft,
    };
  };

  // ----------------------------------------
  // Format date
  // ----------------------------------------
  const formatDate = (dateValue) => {
    if (!dateValue) return "-";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ----------------------------------------
  // Search
  // ----------------------------------------
  const filteredItems = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return items;
    }

    return items.filter((item) => {
      return (
        item.name?.toLowerCase().includes(searchValue) ||
        item.batchId?.toLowerCase().includes(searchValue) ||
        item.code?.toLowerCase().includes(searchValue) ||
        item.category?.toLowerCase().includes(searchValue)
      );
    });
  }, [items, search]);

  // ----------------------------------------
  // Summary
  // ----------------------------------------
  const summary = useMemo(() => {
    let expired = 0;
    let critical = 0;
    let warning = 0;
    let alert = 0;
    let good = 0;
    let noDate = 0;

    items.forEach((item) => {
      const expiry = getExpiryInfo(item.expiryDate);

      switch (expiry.className) {
        case "expired":
          expired++;
          break;

        case "critical":
          critical++;
          break;

        case "warning":
          warning++;
          break;

        case "alert":
          alert++;
          break;

        case "good":
          good++;
          break;

        default:
          noDate++;
      }
    });

    return {
      total: items.length,
      expired,
      critical,
      warning,
      alert,
      good,
      noDate,
    };
  }, [items]);

  return (
    <div className="inventory-stock-page">
      {/* Header */}
      <div className="inventory-header">
        <div>
          <h1>Inventory Stock</h1>
          <p>Manage stock batches and expiry dates</p>
        </div>

        <button
          type="button"
          className="refresh-btn"
          onClick={fetchInventoryItems}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="inventory-summary">
        <div className="summary-card">
          <div className="summary-label">Total Items</div>
          <div className="summary-value">{summary.total}</div>
        </div>

        <div className="summary-card expired-card">
          <div className="summary-label">Expired</div>
          <div className="summary-value">{summary.expired}</div>
        </div>

        <div className="summary-card critical-card">
          <div className="summary-label">Critical</div>
          <div className="summary-value">{summary.critical}</div>
        </div>

        <div className="summary-card warning-card">
          <div className="summary-label">Within 7 Days</div>
          <div className="summary-value">{summary.warning}</div>
        </div>

        <div className="summary-card alert-card">
          <div className="summary-label">Within 10 Days</div>
          <div className="summary-value">{summary.alert}</div>
        </div>

        <div className="summary-card good-card">
          <div className="summary-label">Good</div>
          <div className="summary-value">{summary.good}</div>
        </div>
      </div>

      {/* Search */}
      <div className="inventory-toolbar">
        <input
          type="text"
          placeholder="Search product, batch, code or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="inventory-search"
        />

        <div className="result-count">
          {filteredItems.length} item
          {filteredItems.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Error */}
      {error && <div className="inventory-error">{error}</div>}

      {/* Loading */}
      {loading && items.length === 0 ? (
        <div className="inventory-loading">Loading inventory...</div>
      ) : (
        <div className="inventory-table-container">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Batch</th>
                <th>Stock</th>
                <th>Manufacture Date</th>
                <th>Expiry Date</th>
                <th>Days Left</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-row">
                    No inventory items found.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const expiry = getExpiryInfo(item.expiryDate);

                  return (
                    <tr key={item.id}>
                      {/* Product */}
                      <td>
                        <div className="product-info">
                          {item.images?.length > 0 && (
                            <img
                              src={item.images[0]}
                              alt={item.name}
                              className="product-image"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          )}

                          <div>
                            <div className="product-name">
                              {item.name || "-"}
                            </div>

                            <div className="product-code">
                              Code: {item.code || "-"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td>{item.category || "-"}</td>

                      {/* Batch */}
                      <td>
                        {item.batchId ? (
                          <span className="batch-badge">{item.batchId}</span>
                        ) : (
                          <span className="not-set">Not Set</span>
                        )}
                      </td>

                      {/* Stock */}
                      <td>
                        <strong>{item.stockLeft ?? 0}</strong>
                      </td>

                      {/* Manufacture Date */}
                      <td>{formatDate(item.manufactureDate)}</td>

                      {/* Expiry Date */}
                      <td>{formatDate(item.expiryDate)}</td>

                      {/* Days Left */}
                      <td>
                        {expiry.daysLeft === null
                          ? "-"
                          : expiry.daysLeft < 0
                            ? `${Math.abs(expiry.daysLeft)} days ago`
                            : expiry.daysLeft === 0
                              ? "Today"
                              : `${expiry.daysLeft} days`}
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`expiry-status ${expiry.className}`}>
                          {expiry.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InventoryStock;
