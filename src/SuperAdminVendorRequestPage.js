// vendor-request.js
// Fetches a vendor's request and renders it into #content on the page.
// Include this file with: <script src="vendor-request.js"></script>

const VENDOR_ID = "e4499d40-5d51-4e55-8d7a-f5cb7db1267c";
const API_URL = `https://lmartapiv1-fxcyd2b4btacgsav.westus2-01.azurewebsites.net/api/VendorUploadProducts/GetVendorProductsvalues?vendorId=${VENDOR_ID}`;

function formatDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return d;
  }
}

function render(vendor) {
  const content = document.getElementById("content");
  const statusClass =
    (vendor.status || "").toLowerCase() === "approved" ? "" : "pending";
  const pincodes = (vendor.pincodes || [])
    .map((p) => `<span class="pin">${p}</span>`)
    .join("");
  const productCount = (vendor.categorie || []).reduce(
    (sum, c) => sum + (c.products ? c.products.length : 0),
    0,
  );

  content.innerHTML = `
    <div class="card">
      <div class="row">
        <div class="store-name">${vendor.storeName || "Unnamed store"}</div>
        <div class="status ${statusClass}">${vendor.status || "Unknown"}</div>
      </div>
      <div class="meta">
        <strong>District:</strong> ${vendor.district || "—"}<br>
        <strong>Requested:</strong> ${formatDate(vendor.createdDate)}<br>
        <strong>Last updated:</strong> ${formatDate(vendor.updatedDate)}<br>
        <strong>Categories submitted:</strong> ${(vendor.categorie || []).length}
        · <strong>Products:</strong> ${productCount}
      </div>
      <div class="message-block">
        <div class="message-label"> Message from vendor </div>
        <div class="message-text">${vendor.message || "(no message provided)"}</div>
      </div>
      ${
        pincodes
          ? `<div class="meta" style="margin-top:18px;margin-bottom:0;">
               <strong>Serviceable pincodes</strong>
               <div class="pincodes">${pincodes}</div>
             </div>`
          : ""
      }
    </div>
    <div class="footer-note">Vendor ID: ${vendor.vendorId}</div>
  `;
}

function renderError(message) {
  const content = document.getElementById("content");
  content.innerHTML = `
    <div class="state error">
      Couldn't load the vendor request.<br>${message}
      <br><button class="retry" id="retry-btn">Try again</button>
    </div>`;
  document
    .getElementById("retry-btn")
    .addEventListener("click", loadVendorRequest);
}

function renderLoading() {
  const content = document.getElementById("content");
  content.innerHTML = `<div class="state" id="loading">Loading vendor request…</div>`;
}

async function loadVendorRequest() {
  renderLoading();
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    const data = await res.json();
    const vendor = Array.isArray(data) ? data[0] : data;
    if (!vendor) throw new Error("No vendor request found");
    render(vendor);
  } catch (err) {
    renderError(err.message);
  }
}

document.addEventListener("DOMContentLoaded", loadVendorRequest);
