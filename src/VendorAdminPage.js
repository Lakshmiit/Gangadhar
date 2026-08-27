import React from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ShoppingCart } from "lucide-react";
import "./App.css";
import { useParams } from "react-router-dom";

export default function VendorAdminPage() {
  const navigate = useNavigate();

  const { vendorId } = useParams();

  console.log("vendorid............", vendorId);

  return (
    <div className="vendor-admin-container">
      <h2 className="vendor-admin-title">Vendor Dashboard</h2>

      <div className="vendor-admin-grid">
        {/* Notifications */}
        <div
          className="vendor-admin-card"
          onClick={() => alert("Notifications page coming soon...")}
        >
          <Bell size={42} color="#2E7D32" />
          <h3>View Notifications</h3>
          <p>View customer orders and notifications.</p>
        </div>

        {/* Upload Grocery */}
        <div
          className="vendor-admin-card"
          onClick={() =>
            navigate(`/VendorUploadGrocery/${vendorId}`)
          }
        >
          <ShoppingCart size={42} color="#2E7D32" />
          <h3>Upload Grocery</h3>
          <p>Add grocery products to your store.</p>
        </div>
      </div>
    </div>
  );
}
