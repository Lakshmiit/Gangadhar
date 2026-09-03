import React, { useEffect, useMemo, useState } from "react";
import "./Notifications.css";

const API_URL =
  "https://lmartapiv1-fxcyd2b4btacgsav.westus2-01.azurewebsites.net/api/UploadGrocery/GetAllGroceryItemsForAdmin";

const NOTIFICATION_DAYS = 10;

const Notifications = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // Keep read notification IDs locally for now.
  // Later we can move this to your backend/database.
  const [readNotifications, setReadNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem("inventory_read_notifications");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // --------------------------------------------------
  // Fetch products
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
      console.error("Notification API Error:", err);
      setError("Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // --------------------------------------------------
  // Calculate days remaining
  // --------------------------------------------------

  const getDaysLeft = (expiryDate) => {
    if (!expiryDate) {
      return null;
    }

    const expiry = new Date(expiryDate);

    if (Number.isNaN(expiry.getTime())) {
      return null;
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    const difference = expiry.getTime() - today.getTime();

    return Math.ceil(difference / (1000 * 60 * 60 * 24));
  };

  // --------------------------------------------------
  // Notification type
  // --------------------------------------------------

  const getNotificationType = (daysLeft) => {
    if (daysLeft === null) {
      return null;
    }

    if (daysLeft < 0) {
      return {
        type: "EXPIRED",
        title: "Product Expired",
        className: "expired",
        icon: "❌",
      };
    }

    if (daysLeft === 0) {
      return {
        type: "TODAY",
        title: "Expires Today",
        className: "critical",
        icon: "🚨",
      };
    }

    if (daysLeft <= 3) {
      return {
        type: "THREE_DAYS",
        title: "Expires Very Soon",
        className: "critical",
        icon: "🔴",
      };
    }

    if (daysLeft <= 7) {
      return {
        type: "SEVEN_DAYS",
        title: "Expiry Warning",
        className: "warning",
        icon: "🟠",
      };
    }

    if (daysLeft <= NOTIFICATION_DAYS) {
      return {
        type: "TEN_DAYS",
        title: "Expiry Alert",
        className: "alert",
        icon: "🟡",
      };
    }

    return null;
  };

  // --------------------------------------------------
  // Format expiry date
  // --------------------------------------------------

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "-";
    }

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
  // Create notifications from products
  // --------------------------------------------------

  const notifications = useMemo(() => {
    return items
      .map((item) => {
        const daysLeft = getDaysLeft(item.expiryDate);

        const notificationType = getNotificationType(daysLeft);

        if (!notificationType) {
          return null;
        }

        // Unique notification ID
        const notificationId = `${item.id}_${item.expiryDate}`;

        return {
          notificationId,
          itemId: item.id,
          productName: item.name || "Unknown Product",
          batchId: item.batchId || null,
          stockLeft: item.stockLeft ?? 0,
          category: item.category || "-",
          code: item.code || "-",
          expiryDate: item.expiryDate,
          manufactureDate: item.manufactureDate,
          daysLeft,
          ...notificationType,
          isRead: readNotifications.includes(notificationId),
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        // Expired first, then earliest expiry
        return a.daysLeft - b.daysLeft;
      });
  }, [items, readNotifications]);

  // --------------------------------------------------
  // Search + unread filter
  // --------------------------------------------------

  const filteredNotifications = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return notifications.filter((notification) => {
      if (showUnreadOnly && notification.isRead) {
        return false;
      }

      if (!searchValue) {
        return true;
      }

      return (
        notification.productName.toLowerCase().includes(searchValue) ||
        notification.batchId?.toLowerCase().includes(searchValue) ||
        notification.code?.toLowerCase().includes(searchValue) ||
        notification.category?.toLowerCase().includes(searchValue)
      );
    });
  }, [notifications, search, showUnreadOnly]);

  // --------------------------------------------------
  // Counts
  // --------------------------------------------------

  const notificationCounts = useMemo(() => {
    return {
      total: notifications.length,

      unread: notifications.filter((notification) => !notification.isRead)
        .length,

      expired: notifications.filter(
        (notification) => notification.type === "EXPIRED",
      ).length,

      today: notifications.filter(
        (notification) => notification.type === "TODAY",
      ).length,

      critical: notifications.filter(
        (notification) => notification.type === "THREE_DAYS",
      ).length,

      warning: notifications.filter(
        (notification) => notification.type === "SEVEN_DAYS",
      ).length,

      tenDays: notifications.filter(
        (notification) => notification.type === "TEN_DAYS",
      ).length,
    };
  }, [notifications]);

  // --------------------------------------------------
  // Mark notification as read
  // --------------------------------------------------

  const markAsRead = (notificationId) => {
    setReadNotifications((previous) => {
      if (previous.includes(notificationId)) {
        return previous;
      }

      const updated = [...previous, notificationId];

      localStorage.setItem(
        "inventory_read_notifications",
        JSON.stringify(updated),
      );

      return updated;
    });
  };

  // --------------------------------------------------
  // Mark all as read
  // --------------------------------------------------

  const markAllAsRead = () => {
    const allIds = notifications.map(
      (notification) => notification.notificationId,
    );

    setReadNotifications(allIds);

    localStorage.setItem(
      "inventory_read_notifications",
      JSON.stringify(allIds),
    );
  };

  // --------------------------------------------------
  // Mark all as unread
  // --------------------------------------------------

  const markAllAsUnread = () => {
    setReadNotifications([]);

    localStorage.removeItem("inventory_read_notifications");
  };

  // --------------------------------------------------
  // Days text
  // --------------------------------------------------

  const getDaysText = (daysLeft) => {
    if (daysLeft < 0) {
      return `${Math.abs(daysLeft)} days overdue`;
    }

    if (daysLeft === 0) {
      return "Expires today";
    }

    if (daysLeft === 1) {
      return "Expires tomorrow";
    }

    return `Expires in ${daysLeft} days`;
  };

  return (
    <div className="notifications-page">
      {/* ---------------------------------------- */}
      {/* Header */}
      {/* ---------------------------------------- */}

      <div className="notifications-header">
        <div>
          <h1>Notifications</h1>

          <p>Products that require attention before expiry.</p>
        </div>

        <div className="notification-header-actions">
          <button
            className="notification-refresh-btn"
            onClick={fetchItems}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>

          {notificationCounts.unread > 0 && (
            <button className="mark-all-btn" onClick={markAllAsRead}>
              Mark All as Read
            </button>
          )}

          {notificationCounts.unread === 0 && notificationCounts.total > 0 && (
            <button className="mark-all-btn" onClick={markAllAsUnread}>
              Mark All as Unread
            </button>
          )}
        </div>
      </div>

      {/* ---------------------------------------- */}
      {/* Summary */}
      {/* ---------------------------------------- */}

      <div className="notification-summary">
        <div className="notification-summary-card total">
          <span>Total Alerts</span>
          <strong>{notificationCounts.total}</strong>
        </div>

        <div className="notification-summary-card unread">
          <span>Unread</span>
          <strong>{notificationCounts.unread}</strong>
        </div>

        <div className="notification-summary-card expired">
          <span>Expired</span>
          <strong>{notificationCounts.expired}</strong>
        </div>

        <div className="notification-summary-card critical">
          <span>Critical</span>
          <strong>
            {notificationCounts.today + notificationCounts.critical}
          </strong>
        </div>

        <div className="notification-summary-card warning">
          <span>7 Day Warning</span>
          <strong>{notificationCounts.warning}</strong>
        </div>

        <div className="notification-summary-card alert">
          <span>10 Day Alert</span>
          <strong>{notificationCounts.tenDays}</strong>
        </div>
      </div>

      {/* ---------------------------------------- */}
      {/* Search / Filter */}
      {/* ---------------------------------------- */}

      <div className="notifications-toolbar">
        <input
          type="text"
          className="notifications-search"
          placeholder="Search product, batch, code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <label className="unread-checkbox">
          <input
            type="checkbox"
            checked={showUnreadOnly}
            onChange={(e) => setShowUnreadOnly(e.target.checked)}
          />
          Show unread only
        </label>

        <span className="notification-result-count">
          {filteredNotifications.length} alert
          {filteredNotifications.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ---------------------------------------- */}
      {/* Error */}
      {/* ---------------------------------------- */}

      {error && <div className="notifications-error">{error}</div>}

      {/* ---------------------------------------- */}
      {/* Loading */}
      {/* ---------------------------------------- */}

      {loading && items.length === 0 ? (
        <div className="notifications-loading">Loading notifications...</div>
      ) : filteredNotifications.length === 0 ? (
        /* -------------------------------------- */
        /* Empty */
        /* -------------------------------------- */

        <div className="notifications-empty">
          <div className="notifications-empty-icon">🔔</div>

          <h2>
            {showUnreadOnly ? "No unread notifications" : "No expiry alerts"}
          </h2>

          <p>
            {showUnreadOnly
              ? "All expiry notifications have been read."
              : "There are currently no products expiring within the next 10 days."}
          </p>
        </div>
      ) : (
        /* -------------------------------------- */
        /* Notification List */
        /* -------------------------------------- */

        <div className="notifications-list">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.notificationId}
              className={`notification-item ${
                notification.isRead ? "read" : "unread"
              }`}
            >
              {/* Icon */}
              <div className={`notification-icon ${notification.className}`}>
                {notification.icon}
              </div>

              {/* Content */}
              <div className="notification-content">
                <div className="notification-top">
                  <div>
                    <h3>{notification.title}</h3>

                    <h2>{notification.productName}</h2>
                  </div>

                  {!notification.isRead && (
                    <span className="new-badge">NEW</span>
                  )}
                </div>

                <div className="notification-message">
                  {notification.daysLeft < 0 ? (
                    <>
                      This product expired{" "}
                      <strong>
                        {Math.abs(notification.daysLeft)} days ago
                      </strong>
                      .
                    </>
                  ) : notification.daysLeft === 0 ? (
                    <>
                      This product <strong>expires today</strong>.
                    </>
                  ) : (
                    <>
                      This product{" "}
                      <strong>{getDaysText(notification.daysLeft)}</strong>.
                    </>
                  )}
                </div>

                {/* Details */}
                <div className="notification-details">
                  <div>
                    <span>Batch</span>

                    <strong>{notification.batchId || "Not Set"}</strong>
                  </div>

                  <div>
                    <span>Stock</span>

                    <strong>{notification.stockLeft}</strong>
                  </div>

                  <div>
                    <span>Expiry Date</span>

                    <strong>{formatDate(notification.expiryDate)}</strong>
                  </div>

                  <div>
                    <span>Category</span>

                    <strong>{notification.category}</strong>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="notification-action">
                {notification.isRead ? (
                  <span className="read-label">✓ Read</span>
                ) : (
                  <button
                    className="read-btn"
                    onClick={() => markAsRead(notification.notificationId)}
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
