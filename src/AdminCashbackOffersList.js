import React, { useEffect, useMemo, useState } from "react";
import { Table, Button, Modal, Form, Row, Col } from "react-bootstrap";
import Header from "./Header";
import Footer from "./Footer";
import { confirmDialog } from "./DialogSystem";
import { useNavigate } from "react-router-dom";
import {
  CASHBACK_CONFIG_HEADER,
  CASHBACK_CONFIG_TITLE,
  deleteLocalCashbackOffer,
  getLocalCashbackOffers,
  updateLocalCashbackOffer,
} from "./utils/localCashbackOffers";

const createEmptyCashbackRule = () => ({
  minAmount: "",
  maxAmount: "",
  cashback: "",
});

const parseCashbackRules = (value) => {
  if (!value) return [];

  return String(value)
    .split(/\r?\n|;/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(
        /^(?:>=\s*)?(\d+)(?:\s*-\s*(\d+)|\s*\+)?\s*[:=,>]\s*(\d+)$/,
      );
      if (!match) return null;
      return {
        minAmount: match[1] || "",
        maxAmount: match[2] || "",
        cashback: match[3] || "",
      };
    })
    .filter(Boolean);
};

const serializeCashbackRules = (rules) =>
  rules
    .map((rule) => ({
      minAmount: String(rule.minAmount || "").trim(),
      maxAmount: String(rule.maxAmount || "").trim(),
      cashback: String(rule.cashback || "").trim(),
    }))
    .filter((rule) => rule.minAmount && rule.cashback)
    .map((rule) =>
      rule.maxAmount
        ? `${rule.minAmount}-${rule.maxAmount}=${rule.cashback}`
        : `${rule.minAmount}=${rule.cashback}`,
    )
    .join("\n");

const AdminCashbackOffersList = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;
  const [offersList, setOffersList] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editOffer, setEditOffer] = useState({
    id: "",
    title: CASHBACK_CONFIG_TITLE,
    cashbackRules: [createEmptyCashbackRule()],
    createdDate: "",
    updatedDate: "",
    startDate: "",
    endDate: "",
  });

  const fetchOffers = () => {
    try {
      setLoading(true);
      const onlyCashbackOffers = getLocalCashbackOffers().filter(
        (banner) => String(banner?.header || "").trim().toLowerCase() === CASHBACK_CONFIG_HEADER,
      );
      setOffersList(onlyCashbackOffers);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch cashback offers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentOffers = useMemo(
    () => offersList.slice(indexOfFirst, indexOfLast),
    [offersList, indexOfFirst, indexOfLast],
  );

  const handleView = (offer) => {
    setSelectedOffer(offer);
    setShowViewModal(true);
  };

  const handleEdit = (offer) => {
    const cashbackRules = parseCashbackRules(offer.description);
    setEditOffer({
      id: offer.id,
      title: CASHBACK_CONFIG_TITLE,
      cashbackRules: cashbackRules.length > 0 ? cashbackRules : [createEmptyCashbackRule()],
      createdDate: offer.createdDate,
      updatedDate: offer.updatedDate,
      startDate: offer.startDate?.slice(0, 16),
      endDate: offer.endDate?.slice(0, 16),
    });
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (!(await confirmDialog("Delete this cashback offer?"))) return;
    try {
      deleteLocalCashbackOffer(id);
      alert("Cashback offer deleted successfully");
      fetchOffers();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const handleCashbackRuleChange = (index, field, value) => {
    const sanitizedValue = value.replace(/[^0-9]/g, "");
    setEditOffer((prev) => ({
      ...prev,
      cashbackRules: prev.cashbackRules.map((rule, ruleIndex) =>
        ruleIndex === index ? { ...rule, [field]: sanitizedValue } : rule,
      ),
    }));
  };

  const addCashbackRule = () => {
    setEditOffer((prev) => ({
      ...prev,
      cashbackRules: [...prev.cashbackRules, createEmptyCashbackRule()],
    }));
  };

  const removeCashbackRule = (index) => {
    setEditOffer((prev) => ({
      ...prev,
      cashbackRules:
        prev.cashbackRules.length === 1
          ? [createEmptyCashbackRule()]
          : prev.cashbackRules.filter((_, ruleIndex) => ruleIndex !== index),
    }));
  };

  const handleUpdate = () => {
    try {
      const serializedRules = serializeCashbackRules(editOffer.cashbackRules || []);
      if (!serializedRules) {
        alert("Please add at least one cashback rule.");
        return;
      }

      updateLocalCashbackOffer(editOffer.id, {
        cashbackRules: editOffer.cashbackRules,
        startDate: editOffer.startDate,
        endDate: editOffer.endDate,
      });

      alert("Cashback offer updated successfully");
      setShowEditModal(false);
      fetchOffers();
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  const totalPages = Math.ceil(offersList.length / rowsPerPage);

  return (
    <>
      <Header />

      <div className="container" style={{ paddingTop: "80px", marginTop: "10px" }}>
        <div className="position-relative mb-3" style={{ height: "50px" }}>
          <h3
            className="text-center m-0"
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              width: "100%",
            }}
          >
            All Cashback Offers
          </h3>

          <button
            className="btn btn-success"
            style={{ position: "absolute", right: 0 }}
            onClick={() => navigate("/adminCashbackOfferCreate/Admin")}
          >
            Create Offer
          </button>
        </div>

        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <Table bordered hover responsive>
            <thead style={{ backgroundColor: "#cfe2d9" }}>
              <tr>
                <th>S.No</th>
                <th>Title</th>
                <th>Rules</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>View</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>

            <tbody>
              {currentOffers.map((offer, index) => {
                const rules = parseCashbackRules(offer.description);
                return (
                  <tr key={offer.id}>
                    <td>{indexOfFirst + index + 1}</td>
                    <td>{offer.title}</td>
                    <td>{rules.length}</td>
                    <td>{new Date(offer.startDate).toLocaleString()}</td>
                    <td>{new Date(offer.endDate).toLocaleString()}</td>
                    <td>
                      <Button size="sm" onClick={() => handleView(offer)}>
                        View
                      </Button>
                    </td>
                    <td>
                      <Button variant="warning" size="sm" onClick={() => handleEdit(offer)}>
                        Edit
                      </Button>
                    </td>
                    <td>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(offer.id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </div>

      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Cashback Offer Details</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selectedOffer && (
            <>
              <h4>{selectedOffer.title}</h4>
              <Table bordered size="sm" className="mt-2 mb-3">
                <thead>
                  <tr>
                    <th>Min Amount</th>
                    <th>Max Amount</th>
                    <th>Cashback</th>
                  </tr>
                </thead>
                <tbody>
                  {parseCashbackRules(selectedOffer.description).map((rule, index) => (
                    <tr key={`selected-offer-rule-${index}`}>
                      <td>{rule.minAmount}</td>
                      <td>{rule.maxAmount || "No limit"}</td>
                      <td>{rule.cashback}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <p>
                <strong>Start:</strong> {new Date(selectedOffer.startDate).toLocaleString()}
              </p>
              <p>
                <strong>End:</strong> {new Date(selectedOffer.endDate).toLocaleString()}
              </p>
            </>
          )}
        </Modal.Body>
      </Modal>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Cashback Offer</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Title</Form.Label>
              <Form.Control value={CASHBACK_CONFIG_TITLE} readOnly />
            </Form.Group>

            <div className="border rounded p-2 my-3 bg-light">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label className="fw-bold mb-0">Cashback Slabs</Form.Label>
                <Button type="button" size="sm" variant="success" onClick={addCashbackRule}>
                  Add Row
                </Button>
              </div>
              {editOffer.cashbackRules.map((rule, index) => (
                <Row key={`edit-offer-rule-${index}`} className="g-2 align-items-end mb-2">
                  <Form.Group as={Col} xs={4}>
                    <Form.Label className="small fw-bold">Min Amount</Form.Label>
                    <Form.Control
                      type="text"
                      inputMode="numeric"
                      value={rule.minAmount}
                      onChange={(e) => handleCashbackRuleChange(index, "minAmount", e.target.value)}
                      placeholder="300"
                    />
                  </Form.Group>
                  <Form.Group as={Col} xs={4}>
                    <Form.Label className="small fw-bold">Max Amount</Form.Label>
                    <Form.Control
                      type="text"
                      inputMode="numeric"
                      value={rule.maxAmount}
                      onChange={(e) => handleCashbackRuleChange(index, "maxAmount", e.target.value)}
                      placeholder="Optional"
                    />
                  </Form.Group>
                  <Form.Group as={Col} xs={3}>
                    <Form.Label className="small fw-bold">Cashback</Form.Label>
                    <Form.Control
                      type="text"
                      inputMode="numeric"
                      value={rule.cashback}
                      onChange={(e) => handleCashbackRuleChange(index, "cashback", e.target.value)}
                      placeholder="20"
                    />
                  </Form.Group>
                  <Col xs={1} className="d-flex justify-content-end">
                    <Button
                      type="button"
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeCashbackRule(index)}
                    >
                      ×
                    </Button>
                  </Col>
                </Row>
              ))}
            </div>

            <Form.Group>
              <Form.Label>Start Date & Time</Form.Label>
              <Form.Control
                type="datetime-local"
                value={editOffer.startDate}
                onChange={(e) =>
                  setEditOffer({
                    ...editOffer,
                    startDate: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>End Date & Time</Form.Label>
              <Form.Control
                type="datetime-local"
                value={editOffer.endDate}
                onChange={(e) =>
                  setEditOffer({
                    ...editOffer,
                    endDate: e.target.value,
                  })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleUpdate}>
            Update
          </Button>
        </Modal.Footer>
      </Modal>

      <div className="d-flex justify-content-center mt-3">
        <nav aria-label="Page navigation">
          <ul className="pagination">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}>
                &laquo;
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (page) =>
                  page === 1 ||
                  page === totalPages ||
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
                      <li className={`page-item ${page === currentPage ? "active" : ""}`}>
                        <button className="page-link" onClick={() => setCurrentPage(page)}>
                          {page}
                        </button>
                      </li>
                    </React.Fragment>
                  );
                }
                return (
                  <li key={page} className={`page-item ${page === currentPage ? "active" : ""}`}>
                    <button className="page-link" onClick={() => setCurrentPage(page)}>
                      {page}
                    </button>
                  </li>
                );
              })}
            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              >
                &raquo;
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <Footer />
    </>
  );
};

export default AdminCashbackOffersList;
