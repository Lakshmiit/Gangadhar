import React, { useState, useEffect } from "react";
import axios from "axios";
import Footer from "./Footer.js";
import { confirmDialog } from "./DialogSystem";
import { Link } from "react-router-dom";
import { FaTrash, FaEye } from "react-icons/fa";
import { Forward as ForwardIcon } from "@mui/icons-material";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import "./App.css";
// import { appConfig } from "./config";

const AdminGroceryItemNotificationGrid = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [groceryData, setGroceryData] = useState([]);
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [zipCode, setZipcode] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [pinCodes, setPinCodes] = useState([]);
  const rowsPerPage = 15;
  const [activeTab, setActiveTab] = useState("Open");

  const sortNewestFirst = (a, b) => {
    const aDate =
      a.createdAt ||
      a.created_on ||
      a.createdOn ||
      a.createdDate ||
      a.date ||
      a.created ||
      a.timestamp;
    const bDate =
      b.createdAt ||
      b.created_on ||
      b.createdOn ||
      b.createdDate ||
      b.date ||
      b.created ||
      b.timestamp;
    const aTime = aDate ? new Date(aDate).getTime() : NaN;
    const bTime = bDate ? new Date(bDate).getTime() : NaN;

    if (!isNaN(aTime) && !isNaN(bTime)) {
      return bTime - aTime;
    }
    const aId = Number.isFinite(+a.id)
      ? +a.id
      : Number.isFinite(+a.martId)
        ? +a.martId
        : 0;
    const bId = Number.isFinite(+b.id)
      ? +b.id
      : Number.isFinite(+b.martId)
        ? +b.martId
        : 0;
    return bId - aId;
  };

  useEffect(() => {
    setLoading(true);
    const url = `https://lmartapiv1-fxcyd2b4btacgsav.westus2-01.azurewebsites.net/api/Mart/GetAllMartItems`;

    axios
      .get(url)
      .then((response) => {
        const groceries = response.data.map((g) => ({ ...g }));
        // const groceriesStatus = groceries.filter((g) =>  (g.status === "Open" || g.status === "Closed"));
        const sorted = [...groceries].sort(sortNewestFirst);
        setGroceryData(sorted);
        setFilteredData(sorted);
        const uniqueStates = [
          ...new Set(sorted.map((g) => g.state).filter(Boolean)),
        ];
        const uniqueDistricts = [
          ...new Set(sorted.map((g) => g.district).filter(Boolean)),
        ];
        const uniquePinCodes = [
          ...new Set(sorted.map((g) => g.zipCode).filter(Boolean)),
        ];
        setStates(uniqueStates);
        setDistricts(uniqueDistricts);
        setPinCodes(uniquePinCodes);
        setCurrentPage(1);
      })
      .catch((error) => {
        console.error("Error fetching grocery data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleDelete = async (groceryId) => {
    const confirmDelete = await confirmDialog(
      "Are you sure you want to delete this grocery?",
    );
    if (confirmDelete) {
      axios
        .delete(
          `https://lmartapiv1-fxcyd2b4btacgsav.westus2-01.azurewebsites.net/api/RaiseTicket/${groceryId}`,
        )
        .then(() => {
          setGroceryData((prev) => prev.filter((g) => g.id !== groceryId));
          setFilteredData((prev) => prev.filter((g) => g.id !== groceryId));
          setCurrentPage(1);
        })
        .catch((error) => {
          console.error("Error deleting grocery:", error);
        });
    }
  };

  useEffect(() => {
    let filtered = groceryData;
    if (activeTab === "Open") {
      filtered = filtered.filter((g) => g.status === "Open");
    } else if (activeTab === "Closed") {
      filtered = filtered.filter((g) => g.status === "Closed");
    } else if (activeTab === "Delivered") {
      filtered = filtered.filter((g) => g.isDeliver === true);
    }
    if (state) {
      filtered = filtered.filter((g) => g.state === state);
    }
    if (district) {
      filtered = filtered.filter((g) => g.district === district);
    }
    if (zipCode) {
      filtered = filtered.filter((g) => g.zipCode === zipCode);
    }

    const resorted = [...filtered].sort(sortNewestFirst);
    setFilteredData(resorted);
    setCurrentPage(1);
  }, [activeTab, state, district, zipCode, groceryData]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Paginate after sorting newest-first
  const indexOfLastTicket = currentPage * rowsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - rowsPerPage;
  const currentProduct = filteredData.slice(
    indexOfFirstTicket,
    indexOfLastTicket,
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="d-flex flex-row justify-content-start align-items-start mt-mob-50">
        {/* {!isMobile && (
          <div className="ml-0 m-4 p-0 adm_mnu">
            <AdminSidebar />
          </div>
        )} */}

        {/* Floating menu for mobile */}
        {/* {isMobile && (
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
        )} */}

        <div className={`container ${isMobile ? "w-100" : "w-75"}`}>
          <h2 className="text-center">Grocery Item Notifications</h2>
          <div className="d-flex mb-3">
            <button
              className={`btn mx-2 ${activeTab === "Open" ? "btn-warning" : "btn-outline-warning"}`}
              onClick={() => setActiveTab("Open")}
            >
              Open Tickets
            </button>

            <button
              className={`btn mx-2 ${activeTab === "Closed" ? "btn-danger" : "btn-outline-danger"}`}
              onClick={() => setActiveTab("Closed")}
            >
              Closed Tickets
            </button>

            <button
              className={`btn mx-2 ${activeTab === "Delivered" ? "btn-success" : "btn-outline-success"}`}
              onClick={() => setActiveTab("Delivered")}
            >
              Delivered Tickets
            </button>
          </div>
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
          </div>

          <>
            {currentProduct.length > 0 ? (
              !isMobile ? (
                <table className="table table-bordered equal-table">
                  <thead>
                    <tr>
                      <th style={{ width: "30%" }}>Customer ID</th>
                      <th style={{ width: "30%" }}>Customer Name</th>
                      <th style={{ width: "30%" }}>Grocery ID</th>
                      <th style={{ width: "30%" }}>Category</th>
                      <th style={{ width: "60%" }}>Product Name</th>
                      <th style={{ width: "20%" }}>Status</th>
                      <th style={{ width: "25%" }}>Grand Total</th>
                      <th style={{ width: "55%" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentProduct.map((grocery, index) => (
                      <tr key={index}>
                        <td>{grocery.customerId}</td>
                        <td>{grocery.customerName}</td>
                        <td>{grocery.martId}</td>
                        <td>
                          {grocery.categories &&
                            grocery.categories.map((cat, i) => (
                              <div key={i}>{cat.categoryName}</div>
                            ))}
                        </td>
                        <td>
                          {grocery.categories && (
                            <ol style={{ paddingLeft: "20px", margin: 0 }}>
                              {grocery.categories.flatMap((cat) =>
                                (cat.products || []).map((p, j) => (
                                  <li key={`${cat.categoryName}-${j}`}>
                                    {p.productName}
                                  </li>
                                )),
                              )}
                            </ol>
                          )}
                        </td>
                        <td>{grocery.status}</td>
                        <td>{grocery.grandTotal}</td>
                        <td className="d-flex align-items-center">
                          <Link
                            to={`/adminGroceryOrderPage/${grocery.id}`}
                            className="btn btn-info mx-2"
                          >
                            <FaEye />
                          </Link>
                          <Link
                            onClick={() => handleDelete(grocery.id)}
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
                  {currentProduct.map((grocery, index) => (
                    <div key={index} className="ticket-card">
                      <div className="ticket-body">
                        <p className="mb-1">
                          <strong>Customer ID:</strong> {grocery.customerId}
                        </p>
                        <p className="mb-2">
                          <strong>Grocery ID:</strong> {grocery.martId}
                        </p>

                        <div className="mb-2">
                          <strong>Category:</strong>
                          <div className="mt-1">
                            {grocery.categories &&
                            grocery.categories.length > 0 ? (
                              grocery.categories.map((cat, i) => (
                                <div key={i}>{cat.categoryName}</div>
                              ))
                            ) : (
                              <span className="text-muted"> — </span>
                            )}
                          </div>
                        </div>

                        <div className="mb-2">
                          <strong>Product Name:</strong>
                          <div className="mt-1">
                            {grocery.categories &&
                            grocery.categories.length > 0 ? (
                              <ol style={{ paddingLeft: "20px", margin: 0 }}>
                                {grocery.categories.flatMap((cat) =>
                                  (cat.products || []).map((p, j) => (
                                    <li key={`${cat.categoryName}-${j}`}>
                                      {p.productName}
                                    </li>
                                  )),
                                )}
                              </ol>
                            ) : (
                              <span className="text-muted"> — </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="ticket-actions d-flex">
                        <Link
                          to={`/adminGroceryOrderPage/${grocery.id}`}
                          className="btn btn-info mx-2"
                        >
                          <FaEye />
                        </Link>
                        <Link
                          onClick={() => handleDelete(grocery.id)}
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
          {/* <div className="d-flex justify-content-center mt-3">
            <nav aria-label="Page navigation">
              <ul className="pagination">
                {[...Array(Math.ceil(filteredData.length / rowsPerPage))].map(
                  (_, index) => (
                    <li
                      key={index}
                      className={`page-item ${index + 1 === currentPage ? "active" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(index + 1)}
                      >
                        {index + 1}
                      </button>
                    </li>
                  )
                )}
              </ul>
            </nav>
          </div> */}
        </div>

        {/* Styles for floating menu */}
        <style jsx>{`
          .menu-popup {
            position: absolute;
            top: 50px;
            left: 0;
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

export default AdminGroceryItemNotificationGrid;
