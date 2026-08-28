import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import axios from "axios";
import Footer from "./Footer.js";
import AdminSidebar from "./AdminSidebar";
import { confirmDialog } from "./DialogSystem";
import { Link } from "react-router-dom";
import { FaTrash, FaEye } from "react-icons/fa";
import {
  Dashboard as MoreVertIcon,
  Forward as ForwardIcon,
} from "@mui/icons-material";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import "./App.css";
//  import { appConfig } from "./config";

const BuyProductNotificationGrid = () => {
  const [assignedTo, setAssignedTo] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [productData, setProductData] = useState([]);
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [zipCode, setZipcode] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [pinCodes, setPinCodes] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const rowsPerPage = 15;

  useEffect(() => {
    setLoading(true);
    const url = `https://lmartapiv1-fxcyd2b4btacgsav.westus2-01.azurewebsites.net/api/BuyProduct/GetBuyProductDetailsForAdminList`;
    axios
      .get(url)
      .then((response) => {
        const products = response.data.map((product) => ({
          ...product,
        }));
        const buyProducts = products.filter(
          (product) =>
            (product.status === "Approved" || product.status === "Assigned") &&
            (product.assignedTo === "Customer Care" ||
              product.assignedTo === "Customer"),
        );
        setFilteredData(buyProducts);
        setProductData(buyProducts);

        const uniqueStates = [
          ...new Set(products.map((product) => product.state)),
        ];
        const uniqueDistricts = [
          ...new Set(products.map((product) => product.district)),
        ];
        const uniquePinCode = [
          ...new Set(products.map((product) => product.zipCode)),
        ];
        const uniqueAssigned = [
          ...new Set(products.map((product) => product.assignedTo)),
        ];
        setStates(uniqueStates);
        setDistricts(uniqueDistricts);
        setPinCodes(uniquePinCode);
        setAssigned(uniqueAssigned);
      })
      .catch((error) => {
        console.error("Error fetching product data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleDelete = async (productId) => {
    const confirmDelete = await confirmDialog(
      "Are you sure you want to delete this product?",
    );
    if (confirmDelete) {
      axios
        .delete(
          `https://lmartapiv1-fxcyd2b4btacgsav.westus2-01.azurewebsites.net/api/RaiseTicket/${productId}`,
        )
        .then(() => {
          setProductData((prevData) =>
            prevData.filter((product) => product.id !== productId),
          );
          setFilteredData((prevData) =>
            prevData.filter((product) => product.id !== productId),
          );
        })
        .catch((error) => {
          console.error("Error deleting product:", error);
        });
    }
  };

  useEffect(() => {
    let filtered = productData;

    if (state) {
      filtered = filtered.filter((product) => product.state === state);
    }

    if (district) {
      filtered = filtered.filter((product) => product.district === district);
    }

    if (zipCode) {
      filtered = filtered.filter((product) => product.zipCode === zipCode);
    }
    if (assignedTo) {
      filtered = filtered.filter(
        (product) => product.assignedTo === assignedTo,
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [state, district, zipCode, assignedTo, productData]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Get paginated data
  const indexOfLastTicket = currentPage * rowsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - rowsPerPage;
  const currentBuyProduct = filteredData.slice(
    indexOfFirstTicket,
    indexOfLastTicket,
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="d-flex flex-row justify-content-start align-items-start mt-mob-50">
        {!isMobile && (
          <div className="ml-0 m-4 p-0 adm_mnu">
            <AdminSidebar />
          </div>
        )}

        {/* Floating menu for mobile */}
        {isMobile && (
          <div className="floating-menu">
            <Button
              variant="primary"
              className="rounded-circle shadow"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreVertIcon />
            </Button>

            {showMenu && (
              <div className="sidebar-container">
                <AdminSidebar />
              </div>
            )}
          </div>
        )}

        <div className={`container ${isMobile ? "w-100" : "w-75"}`}>
          <h2 className="text-center">Buy Product Notifications</h2>
          <div
            className={`d-flex ${isMobile ? "flex-column" : "flex-wrap"} align-items-center justify-content-between`}
          >
            <div
              className={`form-group ${isMobile ? "col-12" : "col-12 col-md-2"} m-2`}
            >
              <label>State</label>
              <select
                className="form-control"
                value={state}
                onChange={(e) => setState(e.target.value)}
              >
                <option value="">All States</option>
                {states.map((stateOption, index) => (
                  <option key={index} value={stateOption}>
                    {stateOption}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group col-12 col-md-2 m-2">
              <label>District</label>
              <select
                className="form-control"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              >
                <option value="">All Districts</option>
                {districts.map((districtOption, index) => (
                  <option key={index} value={districtOption}>
                    {districtOption}
                  </option>
                ))}
              </select>
            </div>
            {/* Pin Code */}
            <div className="form-group col-12 col-md-2 m-2">
              <label>Pin Code</label>
              <select
                className="form-control"
                value={zipCode}
                onChange={(e) => setZipcode(e.target.value)}
              >
                <option value="">Select Pincode</option>
                {pinCodes.map((pinCodeOption, index) => (
                  <option key={index} value={pinCodeOption}>
                    {pinCodeOption}
                  </option>
                ))}
              </select>
            </div>

            {/* Assigned To */}
            <div className="form-group col-12 col-md-2 m-2">
              <label>Assigned To</label>
              <select
                className="form-control"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              >
                <option value="">Select Assigned To</option>
                {assigned.map((assignedOption, index) => (
                  <option key={index} value={assignedOption}>
                    {assignedOption}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <>
            {currentBuyProduct.length > 0 ? (
              !isMobile ? (
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Customer ID</th>
                      <th>Buy Product ID</th>
                      <th>Category</th>
                      <th>Product Name</th>
                      <th>Assigned To</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentBuyProduct.map((product, index) => (
                      <tr key={index}>
                        <td>{product.customerId}</td>
                        <td>{product.buyProductId}</td>
                        <td>{product.category}</td>
                        <td>{product.productName}</td>
                        <td>{product.assignedTo}</td>
                        <td className="d-flex align-items-center">
                          <Link
                            to={`/adminBuyProductOrderGridView/${product.id}`}
                            className="btn btn-info mx-2"
                          >
                            <FaEye />
                          </Link>
                          <Link
                            onClick={() => handleDelete(product.id)}
                            className="btn btn-danger mx-2"
                          >
                            <FaTrash />
                          </Link>
                          <Link to="#" className="btn btn-success mx-2">
                            <ForwardIcon />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="mobile-ticket-grid">
                  {currentBuyProduct.map((product, index) => (
                    <div key={index} className="ticket-card">
                      <div className="ticket-body">
                        <strong>Customer ID:</strong> {product.customerId}{" "}
                        <br />
                        <strong>Buy Product ID:</strong> {product.buyProductId}
                        <p>
                          <strong>Category:</strong> {product.category}
                        </p>
                        <p>
                          <strong>Product Name:</strong> {product.productName}
                        </p>
                        <p>
                          <strong>Assigned To:</strong> {product.assignedTo}
                        </p>
                      </div>
                      <div className="ticket-actions">
                        <Link
                          to={`adminBuyProductOrderGridView/${product.id}`}
                          className="btn btn-info mx-2"
                        >
                          <FaEye />
                        </Link>
                        <Link
                          onClick={() => handleDelete(product.id)}
                          className="btn btn-danger mx-2"
                        >
                          <FaTrash />
                        </Link>
                        <Link to="#" className="btn btn-success mx-2">
                          <ForwardIcon />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <p className="text-center text-muted">No Tickets Data Found</p>
            )}
          </>

          <div className="mt-4 text-end">
            <Link
              to="/adminNotifications"
              className="btn btn-warning text-white mx-2"
              title="Back"
            >
              <ArrowLeftIcon />
            </Link>
          </div>
          {/* Pagination */}
          <div className="d-flex justify-content-center mt-3">
            <nav aria-label="Page navigation">
              <ul className="pagination">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  >
                    &laquo;
                  </button>
                </li>
                {Array.from(
                  { length: Math.ceil(filteredData.length / rowsPerPage) },
                  (_, i) => i + 1,
                )
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === Math.ceil(filteredData.length / rowsPerPage) ||
                      (page >= currentPage - 2 && page <= currentPage + 2),
                  )
                  .map((page, i, arr) => {
                    const prevPage = arr[i - 1];
                    if (prevPage && page - prevPage > 1) {
                      return (
                        <React.Fragment key={page}>
                          <li className="page-item disabled">
                            <span className="page-link">...</span>
                          </li>
                          <li
                            className={`page-item ${page === currentPage ? "active" : ""}`}
                          >
                            <button
                              className="page-link"
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </button>
                          </li>
                        </React.Fragment>
                      );
                    }
                    return (
                      <li
                        key={page}
                        className={`page-item ${page === currentPage ? "active" : ""}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      </li>
                    );
                  })}
                <li
                  className={`page-item ${
                    currentPage === Math.ceil(filteredData.length / rowsPerPage)
                      ? "disabled"
                      : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(
                          p + 1,
                          Math.ceil(filteredData.length / rowsPerPage),
                        ),
                      )
                    }
                  >
                    &raquo;
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Styles for floating menu */}
        <style jsx>{`
          .menu-popup {
            position: absolute;
            top: 50px; /* Keeps the popup aligned below the floating menu */
            left: 0; /* Aligns the popup to the left */
            background: white;
            border: 1px solid #ddd;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            width: 200px;
          }
        `}</style>
      </div>
      <Footer />
    </>
  );
};

export default BuyProductNotificationGrid;
