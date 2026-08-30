import React, { useEffect, useMemo, useState } from "react";
import "./ExpiryManagement.css";

const API_URL =
  "https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/UploadGrocery/GetAllGroceryItemsForAdmin";

const ExpiryManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  // --------------------------------------------------
  // Get all products
  // --------------------------------------------------
  const fetchItems = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      const result = Array.isArray(data) ? data : data?.data || [];

      setItems(result);
    } catch (err) {
      console.error("Expiry API Error:", err);
      setError("Unable to load expiry information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // --------------------------------------------------
  // Calculate expiry status
  // --------------------------------------------------
  const getExpiryInfo = (expiryDate) => {
    if (!expiryDate) {
      return {
        key: "NO_DATE",
        label: "No Expiry Date",
        className: "no-date",
        daysLeft: null,
      };
    }

    const expiry = new Date(expiryDate);

    if (Number.isNaN(expiry.getTime())) {
      return {
        key: "NO_DATE",
        label: "Invalid Date",
        className: "no-date",
        daysLeft: null,
      };
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    const difference = expiry.getTime() - today.getTime();

    const daysLeft = Math.ceil(difference / (1000 * 60 * 60 * 24));

    // Already expired
    if (daysLeft < 0) {
      return {
        key: "EXPIRED",
        label: "Expired",
        className: "expired",
        daysLeft,
      };
    }

    // Expires today
    if (daysLeft === 0) {
      return {
        key: "TODAY",
        label: "Expires Today",
        className: "critical",
        daysLeft,
      };
    }

    // 1-3 days
    if (daysLeft <= 3) {
      return {
        key: "THREE_DAYS",
        label: "Within 3 Days",
        className: "critical",
        daysLeft,
      };
    }

    // 4-7 days
    if (daysLeft <= 7) {
      return {
        key: "SEVEN_DAYS",
        label: "Within 7 Days",
        className: "warning",
        daysLeft,
      };
    }

    // 8-10 days
    if (daysLeft <= 10) {
      return {
        key: "TEN_DAYS",
        label: "Within 10 Days",
        className: "alert",
        daysLeft,
      };
    }

    // More than 10 days
    return {
      key: "SAFE",
      label: "More Than 10 Days",
      className: "good",
      daysLeft,
    };
  };

  // --------------------------------------------------
  // Format date
  // --------------------------------------------------
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

  // --------------------------------------------------
  // Summary counts
  // --------------------------------------------------
  const summary = useMemo(() => {
    const result = {
      total: items.length,
      expired: 0,
      today: 0,
      threeDays: 0,
      sevenDays: 0,
      tenDays: 0,
      safe: 0,
      noDate: 0,
    };

    items.forEach((item) => {
      const expiry = getExpiryInfo(item.expiryDate);

      switch (expiry.key) {
        case "EXPIRED":
          result.expired++;
          break;

        case "TODAY":
          result.today++;
          break;

        case "THREE_DAYS":
          result.threeDays++;
          break;

        case "SEVEN_DAYS":
          result.sevenDays++;
          break;

        case "TEN_DAYS":
          result.tenDays++;
          break;

        case "SAFE":
          result.safe++;
          break;

        default:
          result.noDate++;
      }
    });

    return result;
  }, [items]);

  // --------------------------------------------------
  // Filter + Search
  // --------------------------------------------------
  const filteredItems = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return items.filter((item) => {
      const expiry = getExpiryInfo(item.expiryDate);

      // Status filter
      if (filter !== "ALL") {
        if (filter === "EXPIRING") {
          if (
            !["TODAY", "THREE_DAYS", "SEVEN_DAYS", "TEN_DAYS"].includes(
              expiry.key,
            )
          ) {
            return false;
          }
        } else if (expiry.key !== filter) {
          return false;
        }
      }

      // Search
      if (!searchValue) {
        return true;
      }

      return (
        item.name?.toLowerCase().includes(searchValue) ||
        item.batchId?.toLowerCase().includes(searchValue) ||
        item.code?.toLowerCase().includes(searchValue) ||
        item.category?.toLowerCase().includes(searchValue)
      );
    });
  }, [items, search, filter]);

  // --------------------------------------------------
  // Days left display
  // --------------------------------------------------
  const getDaysText = (daysLeft) => {
    if (daysLeft === null) {
      return "-";
    }

    if (daysLeft < 0) {
      return `${Math.abs(daysLeft)} days ago`;
    }

    if (daysLeft === 0) {
      return "Today";
    }

    return `${daysLeft} days`;
  };

  return (
    <div className="expiry-management-page">
      {/* ------------------------------------------- */}
      {/* Header */}
      {/* ------------------------------------------- */}

      <div className="expiry-header">
        <div>
          <h1>Expiry Management</h1>
          <p>Monitor products before they expire and take action.</p>
        </div>

        <button
          className="expiry-refresh-btn"
          onClick={fetchItems}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* ------------------------------------------- */}
      {/* Summary Cards */}
      {/* ------------------------------------------- */}

      <div className="expiry-summary">
        <button
          className={`expiry-summary-card ${
            filter === "ALL" ? "selected" : ""
          }`}
          onClick={() => setFilter("ALL")}
        >
          <span>Total Products</span>
          <strong>{summary.total}</strong>
        </button>

        <button
          className={`expiry-summary-card expired ${
            filter === "EXPIRED" ? "selected" : ""
          }`}
          onClick={() => setFilter("EXPIRED")}
        >
          <span>Expired</span>
          <strong>{summary.expired}</strong>
        </button>

        <button
          className={`expiry-summary-card critical ${
            filter === "TODAY" ? "selected" : ""
          }`}
          onClick={() => setFilter("TODAY")}
        >
          <span>Expires Today</span>
          <strong>{summary.today}</strong>
        </button>

        <button
          className={`expiry-summary-card critical ${
            filter === "THREE_DAYS" ? "selected" : ""
          }`}
          onClick={() => setFilter("THREE_DAYS")}
        >
          <span>Within 3 Days</span>
          <strong>{summary.threeDays}</strong>
        </button>

        <button
          className={`expiry-summary-card warning ${
            filter === "SEVEN_DAYS" ? "selected" : ""
          }`}
          onClick={() => setFilter("SEVEN_DAYS")}
        >
          <span>Within 7 Days</span>
          <strong>{summary.sevenDays}</strong>
        </button>

        <button
          className={`expiry-summary-card alert ${
            filter === "TEN_DAYS" ? "selected" : ""
          }`}
          onClick={() => setFilter("TEN_DAYS")}
        >
          <span>Within 10 Days</span>
          <strong>{summary.tenDays}</strong>
        </button>

        <button
          className={`expiry-summary-card good ${
            filter === "SAFE" ? "selected" : ""
          }`}
          onClick={() => setFilter("SAFE")}
        >
          <span>Safe</span>
          <strong>{summary.safe}</strong>
        </button>

        <button
          className={`expiry-summary-card no-date ${
            filter === "NO_DATE" ? "selected" : ""
          }`}
          onClick={() => setFilter("NO_DATE")}
        >
          <span>No Expiry Date</span>
          <strong>{summary.noDate}</strong>
        </button>
      </div>

      {/* ------------------------------------------- */}
      {/* Search + Filter */}
      {/* ------------------------------------------- */}

      <div className="expiry-toolbar">
        <input
          type="text"
          className="expiry-search"
          placeholder="Search product, batch, code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="expiry-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="ALL">All Products</option>
          <option value="EXPIRING">Expiring Soon</option>
          <option value="EXPIRED">Expired</option>
          <option value="TODAY">Expires Today</option>
          <option value="THREE_DAYS">Within 3 Days</option>
          <option value="SEVEN_DAYS">Within 7 Days</option>
          <option value="TEN_DAYS">Within 10 Days</option>
          <option value="SAFE">Safe</option>
          <option value="NO_DATE">No Expiry Date</option>
        </select>

        <div className="expiry-result-count">
          {filteredItems.length} result
          {filteredItems.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* ------------------------------------------- */}
      {/* Error */}
      {/* ------------------------------------------- */}

      {error && <div className="expiry-error">{error}</div>}

      {/* ------------------------------------------- */}
      {/* Loading */}
      {/* ------------------------------------------- */}

      {loading && items.length === 0 ? (
        <div className="expiry-loading">Loading expiry information...</div>
      ) : (
        /* ----------------------------------------- */
        /* Table */
        /* ----------------------------------------- */

        <div className="expiry-table-container">
          <table className="expiry-table">
            <thead>
              <tr>
                <th>Product</th>
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
                  <td colSpan="7" className="expiry-empty">
                    No products found for this filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const expiry = getExpiryInfo(item.expiryDate);

                  return (
                    <tr key={item.id}>
                      {/* Product */}
                      <td>
                        <div className="expiry-product">
                          {item.images?.length > 0 && (
                            <img
                              src={item.images[0]}
                              alt={item.name}
                              className="expiry-product-image"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          )}

                          <div>
                            <div className="expiry-product-name">
                              {item.name || "-"}
                            </div>

                            <div className="expiry-product-code">
                              Code: {item.code || "-"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Batch */}
                      <td>
                        {item.batchId ? (
                          <span className="expiry-batch">{item.batchId}</span>
                        ) : (
                          <span className="expiry-not-set">Not Set</span>
                        )}
                      </td>

                      {/* Stock */}
                      <td>
                        <strong>{item.stockLeft ?? 0}</strong>
                      </td>

                      {/* Manufacture */}
                      <td>{formatDate(item.manufactureDate)}</td>

                      {/* Expiry */}
                      <td>{formatDate(item.expiryDate)}</td>

                      {/* Days */}
                      <td>
                        <span className={`expiry-days ${expiry.className}`}>
                          {getDaysText(expiry.daysLeft)}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`expiry-status ${expiry.className}`}>
                          {expiry.label}
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

export default ExpiryManagement;
