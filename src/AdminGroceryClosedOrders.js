import React, { useState, useEffect } from "react";
import "./App.css";
import Footer from "./Footer.js";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";
// import ForwardIcon from '@mui/icons-material/Forward';
import { Button, Form, Row, Col, Modal } from "react-bootstrap";
// import { appConfig } from "./config";

const AdminGroceryClosedOrders = () => {
  const navigate = useNavigate();
  const { groceryItemId } = useParams();
  const [martId, setMartId] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [imageUrls, setImageUrls] = useState({});
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [pincode, setPincode] = useState("");
  const [address, setAddress] = useState("");
  const [id, setId] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [deliveryAssignedTime, setDeliveryAssignedTime] = useState("");
  const [deliverySubmitTime, setDeliverySubmitTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [paymentMode, setPaymentMode] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [longitude, setLongitude] = useState("");
  const [latitude, setLatitude] = useState("");
  const [grandTotal, setGrandTotal] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [transactionNumber, setTransactionNumber] = useState("");
  const [transactionStatus, setTransactionStatus] = useState("");
  const [totalItemsSelected, setTotalItemsSelected] = useState("");
  const [cartData, setCartData] = useState(null);
  const [code, setCode] = useState("");
  const [units, setUnits] = useState("");
  const [groceryData, setgroceryData] = useState();
  const [groceryId, setgroceryId] = useState();
  const [cashbackAmount, setCashbackAmount] = useState(0);
  const showFreeSugar = Number(grandTotal) > 699 && Number(grandTotal) < 998;
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [zoomImage, setZoomImage] = useState("");
  const [zoomProduct, setZoomProduct] = useState(null);
  const [status, setStatus] = useState("");
  useEffect(() => {
    const fetchCart = async () => {
      if (!groceryItemId) return;

      const ctrl = new AbortController();
      try {
        const res1 = await fetch(
          `https://localhost:7091/api/Mart/GetProductDetails?id=${groceryItemId}`,
          { signal: ctrl.signal },
        );
        if (!res1.ok) throw new Error("Failed to fetch product details");
        const data = await res1.json();
        setCartData(data);
        setMartId(data.martId);
        setGrandTotal(data.grandTotal);
        setTotalItemsSelected(data.totalItemsSelected);
        setCustomerName(data.customerName);
        setDate(data.date);
        setAssignedTo(data.assignedTo);
        const products = (data?.categories ?? []).flatMap(
          (c) => c?.products ?? [],
        );
        const selected = products.filter(
          (p) =>
            p?.isSelected || p?.selected || (p?.qty ?? p?.quantity ?? 0) > 0,
        );
        const baseList = selected.length ? selected : products;
        const productNames = Array.from(
          new Set(baseList.map((p) => p?.productName?.trim()).filter(Boolean)),
        );

        if (productNames.length === 0) {
          console.warn("⚠️ No product names found in the first API response");
          setgroceryData([]);
          setgroceryId(null);
          return;
        }

        const requests = productNames.map(async (name) => {
          const url = `https://localhost:7091/api/UploadGrocery/GetGroceryItemsByProductName?productName=${encodeURIComponent(
            name,
          )}`;
          const res = await fetch(url, { signal: ctrl.signal });
          if (!res.ok)
            throw new Error(
              `UploadGrocery failed for "${name}" (HTTP ${res.status})`,
            );
          const items = await res.json();
          const arr = Array.isArray(items) ? items : items ? [items] : [];
          return arr.map((it) => ({ ...it, _matchedProductName: name }));
        });
        const settled = await Promise.allSettled(requests);

        const allItems = [];
        settled.forEach((r, idx) => {
          const n = productNames[idx];
          if (r.status === "fulfilled") {
            allItems.push(...r.value);
          } else {
            console.warn(`UploadGrocery lookup failed for "${n}":`, r.reason);
          }
        });

        setgroceryData(allItems);
        const firstId = allItems?.[0]?.id ?? null;
        setgroceryId(firstId);
        console.log("✅ Combined UploadGrocery items:", allItems);
        console.log("✅ First grocery id:", firstId);
      } catch (err) {
        if (err?.name === "AbortError") return;
        setError(err.message || String(err));
        console.error("Error fetching cart data:", err);
      }
      return () => ctrl.abort();
    };
    fetchCart();
  }, [groceryItemId]);

  useEffect(() => {
    console.log(
      error,
      groceryData,
      groceryId,
      id,
      customerId,
      loading,
      longitude,
      latitude,
      grandTotal,
      paidAmount,
      transactionNumber,
      transactionStatus,
      totalItemsSelected,
      cartData,
      code,
      units,
    );
  }, [
    error,
    groceryData,
    groceryId,
    id,
    customerId,
    loading,
    longitude,
    latitude,
    grandTotal,
    paidAmount,
    transactionNumber,
    transactionStatus,
    totalItemsSelected,
    cartData,
    code,
    units,
  ]);

  useEffect(() => {
    const fetchGroceryData = async () => {
      try {
        const response = await fetch(
          `https://localhost:7091/api/Mart/GetProductDetails?id=${groceryItemId}`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch grocery product data");
        }
        const data = await response.json();
        console.log("Fetched Grocery Data:", data);
        setCartData(data);
        setCustomerId(data.userId);
        setId(data.id);
        setDate(data.date);
        setMartId(data.martId);
        setCustomerName(data.customerName);
        setMobileNumber(data.customerPhoneNumber);
        setAddress(data.address);
        setState(data.state);
        setDistrict(data.district);
        setPincode(data.zipCode);
        setPaymentMode(data.paymentMode);
        setLongitude(data.longitude);
        setLatitude(data.latitude);
        setGrandTotal(data.grandTotal);
        setPaymentMode(data.paymentMode);
        setTotalItemsSelected(data.totalItemsSelected);
        setTransactionStatus(data.transactionStatus);
        setPaidAmount(data.paidAmount);
        setDeliveryAssignedTime(data.deliveryAssignedTime);
        setDeliverySubmitTime(data.deliverySubmitTime);
        setTransactionNumber(data.transactionNumber);
        setStatus(data.status);
        let allProducts = [];
        let totalAmountFromApi = 0;

        if (data.categories && Array.isArray(data.categories)) {
          data.categories.forEach((cat) => {
            totalAmountFromApi += Number(cat.totalAmount) || 0;
            cat.products.forEach((p, idx) => {
              allProducts.push({
                id: p.productImage,
                serial: allProducts.length + 1,
                name: p.productName,
                category: cat.categoryName,
                mrp: p.mrp,
                discount: Math.round(p.discount),
                afterDiscountPrice: p.afterDiscountPrice,
                quantity: p.noOfQuantity,
                total: Math.round(p.afterDiscountPrice * p.noOfQuantity),
                code: p.code,
                units: p.units,
                image: p.productImage,
              });
            });
          });
          setItems(allProducts);
          if (allProducts.length > 0) {
            setCode(allProducts[0].code || "");
            setUnits(allProducts[0].units || "");
          }
        }
        const grandTotalNumeric = Number(data.grandTotal) || 0;
        const cashback = totalAmountFromApi - grandTotalNumeric;

        if (
          (cashback >= 49 && cashback <= 51) ||
          (cashback >= 29 && cashback <= 31) ||
          (cashback >= 79 && cashback <= 81) ||
          (cashback >= 99 && cashback <= 101) ||
          (cashback >= 149 && cashback <= 151) ||
          (cashback >= 199 && cashback <= 201)
        ) {
          setCashbackAmount(cashback);
        } else {
          setCashbackAmount(0);
        }
      } catch (error) {
        console.error("Error fetching grocery product data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (groceryItemId) {
      fetchGroceryData();
    }
  }, [groceryItemId, grandTotal]);

  // ForwardIcon
  const handleUpdatePaymentMethod = async () => {
    try {
      const payload = {
        ...cartData,
        customerName: customerName,
        address: address,
        state: state,
        district: district,
        zipCode: pincode,
        customerPhoneNumber: mobileNumber,
        id: groceryItemId,
        userId: customerId,
        martId: martId,
        date: date,
        grandTotal: grandTotal,
        totalItemsSelected: totalItemsSelected,
        status: "Closed",
        paymentMode: paymentMode,
        utrTransactionNumber: "",
        transactionNumber: transactionNumber,
        transactionStatus: transactionStatus,
        paidAmount: paidAmount,
        AssignedTo: cartData.assignedTo,
        DeliveryPartnerUserId: cartData.deliveryPartnerUserId,
        deliveryAssignedTime: deliveryAssignedTime,
        deliverySubmitTime: deliverySubmitTime,
        latitude: latitude,
        longitude: longitude,
        code: code,
        units: units,
      };

      let response = await fetch(
        `https://localhost:7091/api/Mart/UpdateProductDetails/${groceryItemId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok) {
        throw new Error("Failed to Update Delivery Partner.");
      }
      navigate(`/adminGroceryDashboard`);
    } catch (error) {
      console.error("Error:", error);
      window.alert(
        "Failed to Update Delivery Partner. Please try again later.",
      );
    }
  };

  // Detect screen size for responsiveness
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  useEffect(() => {
    if (!items.length) return;
    const controller = new AbortController();
    async function loadImages() {
      const map = {};
      await Promise.all(
        items.map(async (item) => {
          if (!item.image) return;
          try {
            const res = await fetch(
              `https://localhost:7091/api/FileUpload/download?generatedfilename=${encodeURIComponent(
                item.image,
              )}`,
              { signal: controller.signal },
            );
            const json = await res.json();
            if (!json?.imageData) return;
            map[item.id] = `data:image/jpeg;base64,${json.imageData}`;
          } catch (err) {
            console.error("Image fetch failed:", err);
          }
        }),
      );
      setImageUrls(map);
    }
    loadImages();
    return () => controller.abort();
  }, [items]);

  const handleImageClick = (imageSrc, product) => {
    setZoomImage(imageSrc);
    setZoomProduct(product);
    setShowZoomModal(true);
  };

  return (
    <>
      <div
        className="d-flex flex-row justify-content-start align-items-start"
        style={{ marginTop: "130px" }}
      >
        {/* Main Content */}
        <div className={`container ${isMobile ? "w-100" : "w-75"}`}>
          <h3 className="text-center">Grocery Items Orders</h3>
          <div className="rounded-3bx_sdw w-100">
            <form className="form" onSubmit={handleSubmit}>
              <div className="text-center">
                <strong className="fs-5">
                  Order Number:<span>{martId}</span>
                </strong>
              </div>
              <div className="row">
                <div className="col-md-6 form-group">
                  <label>
                    Customer Name <span className="req_star">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={customerName}
                    placeholder="Customer Name"
                    readOnly
                  />
                </div>

                <div className="col-md-6 form-group">
                  <label>
                    Customer Address <span className="req_star">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    style={{
                      overflow: "hidden",
                      resize: "none",
                      minHeight: "80px",
                    }}
                    value={[address, district, state, pincode, mobileNumber]
                      .filter(Boolean)
                      .join(", ")}
                    onInput={(e) => {
                      e.target.style.height = "auto";
                      e.target.style.height = e.target.scrollHeight + "px";
                    }}
                    onFocus={(e) => {
                      e.target.style.height = "auto";
                      e.target.style.height = e.target.scrollHeight + "px";
                    }}
                    placeholder="Customer Address"
                    readOnly
                  ></textarea>
                </div>
                <div className="col-md-6 form-group">
                  Date: {date ? date.split("T")[0] : ""}
                </div>
              </div>
              <h4 className="m-0">Grocery Items</h4>
              <table className="table table-bordered table-striped">
                <thead>
                  <tr>
                    <th style={{ background: "green", color: "white" }}>
                      Sl. No
                    </th>
                    <th style={{ background: "green", color: "white" }}>
                      Item Name
                    </th>
                    <th style={{ background: "green", color: "white" }}>
                      Photo
                    </th>
                    <th style={{ background: "green", color: "white" }}>
                      Code
                    </th>
                    <th style={{ background: "green", color: "white" }}>
                      Category
                    </th>
                    <th style={{ background: "green", color: "white" }}>MRP</th>
                    <th style={{ background: "green", color: "white" }}>
                      Discount (%)
                    </th>
                    <th style={{ background: "green", color: "white" }}>
                      After Discount <br /> Price
                    </th>
                    <th style={{ background: "green", color: "white" }}>
                      Required <br /> Quantity
                    </th>
                    <th style={{ background: "green", color: "white" }}>
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.serial}</td>
                      <td>{item.name}</td>
                      <td>
                        {imageUrls[item.id] ? (
                          <img
                            src={imageUrls[item.id]}
                            alt={item.name}
                            onClick={() =>
                              handleImageClick(imageUrls[item.id], item)
                            }
                            style={{
                              width: "50px",
                              height: "50px",
                              objectFit: "contain",
                              borderRadius: "6px",
                              border: "1px solid red",
                            }}
                          />
                        ) : (
                          <span className="text-muted small">Loading</span>
                        )}
                      </td>
                      <td>{item.code}</td>
                      <td>{item.category}</td>
                      <td>₹{item.mrp}</td>
                      <td>{item.discount}%</td>
                      <td>₹{item.afterDiscountPrice.toFixed(0)}</td>
                      <td>{item.quantity}</td>
                      <td>₹{item.total.toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  {cashbackAmount > 0 && (
                    <tr>
                      <td colSpan="9" className="text-end fw-bold text-danger">
                        Cashback Applied:
                      </td>
                      <td className="fw-bold text-success">
                        ₹{cashbackAmount}
                      </td>
                    </tr>
                  )}
                  {showFreeSugar && (
                    <tr>
                      <td colSpan="10" className="text-end fw-bold text-danger">
                        🎁 Give Customer <strong> Sugar 1 Kg FREE</strong>
                      </td>
                    </tr>
                  )}

                  {/* {giftName && (
<tr>
  <td colSpan="9" className="text-end fw-bold text-success">
    🎁 Free Gift:
  </td>
  <td className="fw-bold text-danger">
    {giftName}
  </td>
</tr>
)} */}
                  <tr>
                    <td colSpan="9" className="text-end fw-bold">
                      Grand Total:
                    </td>
                    <td className="fw-bold">₹{grandTotal}</td>
                  </tr>
                </tfoot>
              </table>

              <Row>
                <Col md={6}>
                  <Form.Group>
                    <div>
                      <strong>Delivery Assigned Time:</strong>{" "}
                      {new Date(deliveryAssignedTime).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                      })}
                      <br />
                    </div>
                    <div>
                      <strong>Delivery Submit Time:</strong>{" "}
                      {new Date(deliverySubmitTime).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                      })}
                      <br />
                    </div>
                    <div>
                      <strong>Payment Mode:</strong> {paymentMode}
                    </div>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <div>
                      <strong>Paid Amount:</strong> Rs {paidAmount} /-
                    </div>
                    <div>
                      <strong>Delivery Assigned To:</strong> {assignedTo}
                    </div>
                  </Form.Group>
                </Col>
              </Row>
              <div className="mt-2 d-flex justify-content-between">
                <Button
                  type="submit"
                  className=" text-white mx-2"
                  style={{ background: "green" }}
                  onClick={() => navigate(`/adminGroceryDashboard`)}
                  title="Back"
                >
                  <ArrowBack />
                </Button>
                <Button
                  type="submit"
                  className="text-white mx-2"
                  style={{ background: "red" }}
                  title="Closed"
                  onClick={handleUpdatePaymentMethod}
                  disabled={status === "Closed"}
                >
                  Closed
                </Button>
              </div>
            </form>
          </div>
        </div>
        <Modal
          show={showZoomModal}
          onHide={() => {
            setShowZoomModal(false);
            setZoomProduct(null);
          }}
          centered
        >
          <button
            className="close-button text-end mt-0"
            onClick={() => {
              setShowZoomModal(false);
              setZoomProduct(null);
            }}
          >
            &times;
          </button>
          <Modal.Body className="text-center">
            <div className="zoom-container">
              <img
                src={zoomImage}
                alt={zoomProduct?.name || "Zoomed Product"}
                className="zoom-image"
              />
            </div>
            <h6 className="text-start fw-bold m-0" style={{ fontSize: "20px" }}>
              {zoomProduct?.name || ""}
            </h6>
          </Modal.Body>
        </Modal>
        {/* Styles for floating menu */}
        <style jsx>{`
          .floating-menu {
            position: fixed;
            top: 80px; /* Increased from 20px to avoid overlapping with the logo */
            left: 20px; /* Adjusted for placement on the left side */
            z-index: 1000;
          }
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

export default AdminGroceryClosedOrders;
