import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { confirmDialog } from "./DialogSystem";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
// import { appConfig } from "./config";

const AdminCollectionsList = () => {
  const [collectionData, setCollectionData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [catalogues, setCatalogues] = useState([]);
  const [status, setStatus] = useState([]);
  const [category, setCategory] = useState("");
  const [collectionstatus, setCollectionstatus] = useState("");
  const [catalogue, setCatalogue] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const rowsPerPage = 15;
  const navigate = useNavigate();
  useEffect(() => {
    setLoading(true);
    const url = `https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/UploadLakshmiCollection/GetAllLakshmiCollections`;
    axios
      .get(url)
      .then((response) => {
        const collections = response.data.map((collection) => ({
          ...collection,
          afterDiscountPrice: collection.discount
            ? collection.rate - (collection.rate * collection.discount) / 100
            : collection.rate,
        }));
        setCollectionData(collections);
        setFilteredData(collections);

        const uniqueCategories = [
          ...new Set(collections.map((collection) => collection.category)),
        ];
        const uniqueCatalogues = [
          ...new Set(collections.map((collection) => collection.catalogue)),
        ];
        const uniqueStatus = [
          ...new Set(collections.map((collection) => collection.status)),
        ];
        setCategories(uniqueCategories);
        setCatalogues(uniqueCatalogues);
        setStatus(uniqueStatus);
      })
      .catch((error) => {
        console.error("Error fetching product data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleDelete = async (collectionId) => {
    const confirmDelete = await confirmDialog(
      "Are you sure you want to delete this product?",
    );
    if (confirmDelete) {
      axios
        .delete(
          `https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/Product/${collectionId}`,
        )
        .then(() => {
          setCollectionData((prevData) =>
            prevData.filter((collection) => collection.id !== collectionId),
          );
          setFilteredData((prevData) =>
            prevData.filter((collection) => collection.id !== collectionId),
          );
        })
        .catch((error) => {
          console.error("Error deleting collection:", error);
        });
    }
  };

  useEffect(() => {
    let filtered = collectionData;
    if (category) {
      filtered = filtered.filter(
        (collection) => collection.category === category,
      );
    }
    if (catalogue) {
      filtered = filtered.filter(
        (collection) => collection.catalogue === catalogue,
      );
    }
    if (collectionstatus) {
      filtered = filtered.filter(
        (collection) => collection.status === collectionstatus,
      );
    }
    if (searchTerm) {
      filtered = filtered.filter((collection) =>
        collection.productName.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [category, catalogue, collectionstatus, searchTerm, collectionData]);

  const indexOfLastCollection = currentPage * rowsPerPage;
  const indexOfFirstCollection = indexOfLastCollection - rowsPerPage;
  const currentCollections = filteredData.slice(
    indexOfFirstCollection,
    indexOfLastCollection,
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mt-3">
      <h2 className="text-center">All Collections</h2>
      {/* Search Bar */}
      <div className="form-group col-md-3">
        <label>Search Collections Here</label>
        <input
          type="text"
          className="form-control"
          placeholder="Search by product name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="d-flex align-items-center justify-content-between">
        {/* Category */}
        <div className="form-group text-start col-md-2 m-2 ml-2 mb-3">
          <label>Category</label>
          <select
            className="form-control"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((categoryOption, index) => (
              <option key={index} value={categoryOption}>
                {categoryOption}
              </option>
            ))}
          </select>
        </div>

        {/* Catalogue */}
        <div className="form-group col-md-2 m-2 mb-3">
          <label>Catalogues</label>
          <select
            className="form-control"
            value={catalogue}
            onChange={(e) => setCatalogue(e.target.value)}
          >
            <option value="">All Catalogues</option>
            {catalogues.map((catalogueOption, index) => (
              <option key={index} value={catalogueOption}>
                {catalogueOption}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="form-group col-md-2 m-2 mb-3">
          <label>Collection Status</label>
          <select
            className="form-control"
            value={collectionstatus}
            onChange={(e) => setCollectionstatus(e.target.value)}
          >
            <option value="">All Collection Status</option>
            {status.map((statusoption, index) => (
              <option key={index} value={statusoption}>
                {statusoption}
              </option>
            ))}
          </select>
        </div>

        {/* Add New Collection Button */}
        <div className="d-flex justify-content-end col-md-6 mb-1 gap-2">
          <button
            className="btn btn-success"
            onClick={() => navigate(`/adminCollectionsUpload/Admin`)}
          >
            Add New Collection
          </button>
        </div>
      </div>
      {filteredData.length === 0 ? (
        <div className="text-center my-5">
          <h4>No Collections Available</h4>
        </div>
      ) : (
        <>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Collection Name</th>
                <th>Price</th>
                <th>Discount</th>
                <th>After Discount Price</th>
                <th>Requested By</th>
                <th>Stock Left</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentCollections.map((collection, index) => (
                <tr key={index}>
                  <td className="product-name-cell">
                    {collection.productName}
                  </td>
                  <td>₹{collection.rate}</td>
                  <td>
                    {collection.discount
                      ? `${Math.round(collection.discount)}%`
                      : "No discount"}
                  </td>
                  <td>₹{collection.afterDiscountPrice.toFixed(0) || "N/A"}</td>
                  <td>
                    {collection.requestedBy ? (
                      <span
                        style={{
                          textDecoration: "underline",
                          color: "blue",
                          cursor: "pointer",
                        }}
                        title={collection.requestedBy}
                      >
                        {collection.requestedBy}
                      </span>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td>
                    {collection.stockLeft <= 0
                      ? "No Stock"
                      : collection.stockLeft}
                  </td>
                  <td className="actions-cell">
                    <Link
                      to={`/adminCollectionsUpdate/${collection.id}/Admin`}
                      className="btn btn-warning"
                      title="Edit"
                    >
                      <FaEdit />
                    </Link>
                    <Link
                      to={`/adminCollectionsApproval/${collection.id}/Admin`}
                      className="btn btn-info mx-2"
                      title="View"
                    >
                      <FaEye />
                    </Link>
                    <button
                      onClick={() => handleDelete(collection.id)}
                      className="btn btn-danger"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

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
        </>
      )}
    </div>
  );
};

export default AdminCollectionsList;
