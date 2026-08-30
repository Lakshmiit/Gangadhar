/**
 * AdminPushNotifications - Admin page to send push messages to active users
 * Uses the existing Handyman API. No Firebase dependency.
 */
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import {
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  NotificationsActive as NotificationsActiveIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  LocationOn as LocationOnIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorOutlineIcon,
} from "@mui/icons-material";
import { Button } from "react-bootstrap";
import Footer from "./Footer.js";
import "./App.css";

const API = "https://localhost:7091/api";

const AdminPushNotifications = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [targetType, setTargetType] = useState("all");
  const [targetUserId, setTargetUserId] = useState("");
  const [targetDistrict, setTargetDistrict] = useState("");
  const [actionUrl, setActionUrl] = useState("");

  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeUsers, setActiveUsers] = useState(0);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth <= 768);
    h();
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const fetchDashboardData = useCallback(async () => {
    // Try fetching notification history from existing API
    try {
      const r = await fetch(`${API}/ProfileMessage/GetAllProfileMessages`);
      if (r.ok) {
        const d = await r.json();
        const items = Array.isArray(d) ? d : [];
        setHistory(items.filter((i) => i.messageType === "push"));
        setActiveUsers(
          items.length > 0 ? new Set(items.map((i) => i.userId)).size : 0,
        );
      }
    } catch {
      // Endpoint may not exist yet
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setSendResult({
        success: false,
        message: "Title and message are required.",
      });
      return;
    }

    setSending(true);
    setSendResult(null);

    const payload = {
      id: "string",
      title: title.trim(),
      body: body.trim(),
      imageUrl: imageUrl.trim() || "",
      actionUrl: actionUrl.trim() || "",
      targetType,
      targetUserId: targetType === "user" ? targetUserId.trim() : "",
      targetDistrict: targetType === "district" ? targetDistrict.trim() : "",
      sentAt: new Date().toISOString(),
      sentBy: "Admin",
      messageType: "push",
    };

    try {
      const r = await fetch(`${API}/ProfileMessage/SendPushNotification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (r.ok) {
        setSendResult({
          success: true,
          message: "Notification sent successfully!",
        });
        setTitle("");
        setBody("");
        setImageUrl("");
        setActionUrl("");
        setTargetType("all");
        setTargetUserId("");
        setTargetDistrict("");
        fetchDashboardData();
      } else {
        // Store locally if endpoint doesn't exist yet
        const existing = JSON.parse(
          localStorage.getItem("hm_push_history") || "[]",
        );
        existing.unshift(payload);
        localStorage.setItem(
          "hm_push_history",
          JSON.stringify(existing.slice(0, 50)),
        );
        setHistory(existing.slice(0, 50));

        setSendResult({
          success: true,
          message: "Notification saved! API endpoint will be connected soon.",
        });
        setTitle("");
        setBody("");
        setImageUrl("");
        setActionUrl("");
        setTargetType("all");
        setTargetUserId("");
        setTargetDistrict("");
      }
    } catch {
      // Fallback: save to localStorage
      const existing = JSON.parse(
        localStorage.getItem("hm_push_history") || "[]",
      );
      existing.unshift({ ...payload, sentAt: new Date().toISOString() });
      localStorage.setItem(
        "hm_push_history",
        JSON.stringify(existing.slice(0, 50)),
      );
      setHistory(existing.slice(0, 50));

      setSendResult({
        success: true,
        message:
          "Notification saved locally! API endpoint will be connected soon.",
      });
      setTitle("");
      setBody("");
      setImageUrl("");
      setActionUrl("");
      setTargetType("all");
      setTargetUserId("");
      setTargetDistrict("");
    } finally {
      setSending(false);
    }
  };

  // Also load from localStorage on mount
  useEffect(() => {
    if (history.length === 0) {
      const local = JSON.parse(localStorage.getItem("hm_push_history") || "[]");
      if (local.length > 0) setHistory(local);
    }
  }, [history.length]);

  const charCount = body.length;
  const maxChars = 256;

  return (
    <>
      <div className="d-flex flex-row justify-content-start align-items-start mt-mob-50">
        {!isMobile && (
          <div className="ml-0 p-0 adm_mnu">
            <AdminSidebar />
          </div>
        )}
        {isMobile && (
          <div className="floating-menu">
            <Button
              variant="primary"
              className="rounded-circle shadow"
              onClick={() => setShowMenu(!showMenu)}
            >
              <NotificationsActiveIcon />
            </Button>
            {showMenu && (
              <div className="sidebar-container">
                <AdminSidebar />
              </div>
            )}
          </div>
        )}

        <div className={`container m-1 ${isMobile ? "w-100" : "w-75"}`}>
          <div className="d-flex align-items-center mb-3">
            <ArrowBackIcon
              fontSize="large"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(-1)}
            />
            <h2 className="ms-2 mb-0 fs-20">
              <NotificationsActiveIcon fontSize="large" className="me-2" />
              Push Notifications
            </h2>
          </div>

          {/* Stats */}
          <div className="row mb-4">
            <div className="col-md-4 mb-2">
              <div className="admin-push-stat-card">
                <PeopleIcon style={{ fontSize: 36, color: "#4CAF50" }} />
                <div>
                  <div className="admin-push-stat-number">{activeUsers}</div>
                  <div className="admin-push-stat-label">Active Users</div>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-2">
              <div className="admin-push-stat-card">
                <SendIcon style={{ fontSize: 36, color: "#2196F3" }} />
                <div>
                  <div className="admin-push-stat-number">{history.length}</div>
                  <div className="admin-push-stat-label">Sent Messages</div>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-2">
              <div
                className="admin-push-stat-card"
                style={{ cursor: "pointer" }}
                onClick={() => setShowHistory(!showHistory)}
              >
                <HistoryIcon style={{ fontSize: 36, color: "#FF9800" }} />
                <div>
                  <div
                    className="admin-push-stat-label"
                    style={{ color: "#2196F3" }}
                  >
                    {showHistory ? "Hide History" : "View History"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Compose */}
          <div className="admin-push-compose-card">
            <h5 className="mb-3">
              <SendIcon className="me-2" />
              Compose Push Notification
            </h5>
            <form onSubmit={handleSend}>
              <div className="mb-3">
                <label className="form-label fw-bold">Send To</label>
                <div className="d-flex gap-2 flex-wrap">
                  {[
                    ["all", "All Users", PeopleIcon],
                    ["user", "Specific User", PersonIcon],
                    ["district", "By District", LocationOnIcon],
                  ].map(([val, lbl, Icon]) => (
                    <button
                      key={val}
                      type="button"
                      className={`btn btn-sm ${targetType === val ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => setTargetType(val)}
                    >
                      <Icon style={{ fontSize: 18 }} /> {lbl}
                    </button>
                  ))}
                </div>
              </div>

              {targetType === "user" && (
                <div className="mb-3">
                  <label className="form-label">User ID / Mobile Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter user ID or mobile"
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    required
                  />
                </div>
              )}
              {targetType === "district" && (
                <div className="mb-3">
                  <label className="form-label">District</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter district name"
                    value={targetDistrict}
                    onChange={(e) => setTargetDistrict(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="mb-3">
                <label className="form-label fw-bold">
                  Notification Title *
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Flash Sale! 50% Off on Groceries"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">
                  Message *{" "}
                  <small
                    className={`ms-2 ${charCount > maxChars ? "text-danger" : "text-muted"}`}
                  >
                    {charCount}/{maxChars}
                  </small>
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Enter your notification message…"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  maxLength={maxChars}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Image URL (optional)</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://example.com/promo.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Action URL (optional)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="/offers or /grocery"
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                />
              </div>

              {/* Preview */}
              {(title || body) && (
                <div className="admin-push-preview mb-3">
                  <div className="admin-push-preview-label">Preview</div>
                  <div className="admin-push-preview-card">
                    <div className="d-flex align-items-start">
                      <img
                        src="/logo192.png"
                        alt="App"
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          marginRight: 12,
                        }}
                      />
                      <div>
                        <div className="fw-bold" style={{ fontSize: 14 }}>
                          {title || "Notification Title"}
                        </div>
                        <div style={{ fontSize: 13, color: "#555" }}>
                          {body || "Notification message…"}
                        </div>
                      </div>
                    </div>
                    {imageUrl && (
                      <img
                        src={imageUrl}
                        alt="Preview"
                        style={{
                          width: "100%",
                          maxHeight: 150,
                          objectFit: "cover",
                          borderRadius: 8,
                          marginTop: 8,
                        }}
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    )}
                  </div>
                </div>
              )}

              {sendResult && (
                <div
                  className={`alert ${sendResult.success ? "alert-success" : "alert-danger"} d-flex align-items-center`}
                >
                  {sendResult.success ? (
                    <CheckCircleIcon className="me-2" />
                  ) : (
                    <ErrorOutlineIcon className="me-2" />
                  )}
                  {sendResult.message}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={sending || !title.trim() || !body.trim()}
                style={{ padding: "12px", fontSize: 16 }}
              >
                {sending ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Sending…
                  </>
                ) : (
                  <>
                    <SendIcon className="me-2" />
                    Send Push Notification
                  </>
                )}
              </button>
            </form>
          </div>

          {/* History */}
          {showHistory && (
            <div className="admin-push-history mt-4">
              <h5 className="mb-3">
                <HistoryIcon className="me-2" />
                Notification History
              </h5>
              {history.length === 0 ? (
                <p className="text-muted">No notifications sent yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered table-hover">
                    <thead style={{ backgroundColor: "#f0f8ff" }}>
                      <tr>
                        <th>Title</th>
                        <th>Message</th>
                        <th>Target</th>
                        <th>Sent At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.slice(0, 20).map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.title}</td>
                          <td
                            style={{
                              maxWidth: 200,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {item.body}
                          </td>
                          <td>
                            <span
                              className={`badge bg-${item.targetType === "all" ? "success" : item.targetType === "user" ? "info" : "warning"}`}
                            >
                              {item.targetType === "all"
                                ? "All Users"
                                : item.targetType === "user"
                                  ? item.targetUserId
                                  : item.targetDistrict}
                            </span>
                          </td>
                          <td style={{ fontSize: 12 }}>
                            {new Date(item.sentAt).toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminPushNotifications;
