import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { vendorAdminLogin } from "./utils/vendorStorage";

// Admin login for the vendor-approval console. Credentials are intentionally
// fixed (adminuser / admin@123) — this is a separate, lightweight admin
// gate from the main Handyman admin login, scoped only to vendor requests.
const AdminVendorLoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    const ok = vendorAdminLogin(username, password);
    if (!ok) {
      setError("Invalid admin credentials.");
      return;
    }

    navigate("/admin/vendor/requests");
  };

  return (
    <div className="h-100 mt-4 d-flex justify-content-center align-items-center">
      <div className="card p-4 shadow-sm" style={{ minWidth: 320, maxWidth: 420, width: "100%" }}>
        <div className="text-center mb-3">
          <StorefrontIcon fontSize="large" style={{ color: "#2F6B4F" }} />
          <h3 className="mt-2 mb-0">Vendor Admin Login</h3>
          <small className="text-muted">Review and approve vendor requests</small>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Admin Username</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="adminuser"
              autoFocus
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <button type="submit" className="btn w-100" style={{ backgroundColor: "#2F6B4F", color: "#fff" }}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminVendorLoginPage;
