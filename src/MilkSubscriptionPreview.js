import React, { useMemo, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import Header from "./Header";
import Footer from "./Footer";

const planOptions = [
  {
    id: "daily",
    label: "Daily Milk Plan",
    note: "Doorstep delivery every morning",
  },
  {
    id: "weekly",
    label: "Weekly Plan",
    note: "Pick selected delivery days",
  },
  {
    id: "monthly",
    label: "Monthly Booking",
    note: "Fixed quantity with monthly billing",
  },
  {
    id: "preorder",
    label: "Pre-Order Booking",
    note: "Reserve festive or bulk milk orders",
  },
];

const milkProducts = [
  {
    id: 1,
    title: "Farm Fresh Cow Milk",
    size: "500 ml pouch",
    price: 28,
    delivery: "Morning fresh delivery",
  },
  {
    id: 2,
    title: "Full Cream Buffalo Milk",
    size: "1 litre bottle",
    price: 64,
    delivery: "Best for tea, curd and sweets",
  },
  {
    id: 3,
    title: "A2 Desi Milk",
    size: "750 ml glass bottle",
    price: 82,
    delivery: "Premium bottle subscription",
  },
];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const addOns = [
  { name: "Curd", price: 35 },
  { name: "Paneer", price: 90 },
  { name: "Ghee", price: 220 },
  { name: "Country Eggs", price: 78 },
];

const formatMoney = (value) => `Rs. ${Number(value || 0).toFixed(0)}`;

const MilkSubscriptionPreview = () => {
  const [selectedPlan, setSelectedPlan] = useState("weekly");
  const [selectedProduct, setSelectedProduct] = useState(milkProducts[0]);
  const [quantity, setQuantity] = useState(2);
  const [selectedDays, setSelectedDays] = useState(["Mon", "Wed", "Fri"]);
  const [selectedAddOns, setSelectedAddOns] = useState(["Curd", "Country Eggs"]);
  const [timeSlot, setTimeSlot] = useState("05:30 AM - 07:00 AM");
  const [startDate, setStartDate] = useState("2026-08-03");
  const [pauseDate, setPauseDate] = useState("2026-08-15");

  const activePlan = planOptions.find((item) => item.id === selectedPlan) || planOptions[0];

  const estimatedTotal = useMemo(() => {
    const base = Number(selectedProduct?.price || 0) * quantity;
    const addOnTotal = addOns
      .filter((item) => selectedAddOns.includes(item.name))
      .reduce((sum, item) => sum + item.price, 0);

    if (selectedPlan === "monthly") return base * 30 + addOnTotal * 4;
    if (selectedPlan === "weekly") return base * Math.max(selectedDays.length, 1) + addOnTotal;
    if (selectedPlan === "preorder") return base * 10 + addOnTotal;
    return base + addOnTotal;
  }, [quantity, selectedAddOns, selectedDays.length, selectedPlan, selectedProduct]);

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day],
    );
  };

  const toggleAddon = (name) => {
    setSelectedAddOns((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name],
    );
  };

  return (
    <>
      <Header />
      <div className="container mt_100px mb-4">
        <div className="bg-white rounded-3 p-3 bx_sdw mb-3">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <h3 className="text-center text-md-start">Milk Subscription & Pre-Order Preview</h3>
              <p className="gry_fnt mb-0 mt-2">
                Using the existing HandyMan template for daily, weekly, monthly and pre-order milk
                bookings.
              </p>
            </div>
            <div className="text-md-end">
              <div className="gry_fnt small">Estimated plan value</div>
              <h4 className="text-warning">{formatMoney(estimatedTotal)}</h4>
            </div>
          </div>
        </div>

        <Row className="g-3">
          <Col lg={8}>
            <div className="bg-white rounded-3 p-3 bx_sdw mb-3">
              <h4 className="mb-3">Choose Plan</h4>
              <Row className="g-3">
                {planOptions.map((plan) => {
                  const isActive = selectedPlan === plan.id;
                  return (
                    <Col md={6} key={plan.id}>
                      <button
                        type="button"
                        className={`milk-template-tile ${isActive ? "active" : ""}`}
                        onClick={() => setSelectedPlan(plan.id)}
                      >
                        <strong>{plan.label}</strong>
                        <span>{plan.note}</span>
                      </button>
                    </Col>
                  );
                })}
              </Row>
            </div>

            <div className="bg-white rounded-3 p-3 bx_sdw mb-3">
              <h4 className="mb-3">Select Milk Product</h4>
              <Row className="g-3">
                {milkProducts.map((product) => {
                  const isActive = selectedProduct.id === product.id;
                  return (
                    <Col md={6} xl={4} key={product.id}>
                      <button
                        type="button"
                        className={`milk-template-product ${isActive ? "active" : ""}`}
                        onClick={() => setSelectedProduct(product)}
                      >
                        <div className="milk-product-badge">{product.size}</div>
                        <strong>{product.title}</strong>
                        <span>{product.delivery}</span>
                        <div className="text-warning fw-bold mt-2">{formatMoney(product.price)}</div>
                      </button>
                    </Col>
                  );
                })}
              </Row>
            </div>

            <div className="bg-white rounded-3 p-3 bx_sdw mb-3">
              <h4 className="mb-3">Plan Schedule</h4>
              <Row className="g-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Quantity per delivery</Form.Label>
                    <Form.Select value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}>
                      {[1, 2, 3, 4, 5].map((value) => (
                        <option key={value} value={value}>
                          {value} pack{value > 1 ? "s" : ""}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Start date</Form.Label>
                    <Form.Control
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Time slot</Form.Label>
                    <Form.Select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
                      <option>05:30 AM - 07:00 AM</option>
                      <option>07:00 AM - 09:00 AM</option>
                      <option>04:00 PM - 06:00 PM</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <div className="mt-3">
                <Form.Label>Delivery days</Form.Label>
                <div className="milk-day-row">
                  {weekDays.map((day) => (
                    <button
                      type="button"
                      key={day}
                      className={`milk-day-chip ${selectedDays.includes(day) ? "active" : ""}`}
                      onClick={() => toggleDay(day)}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <Row className="g-3 mt-2">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Pause / Skip date</Form.Label>
                    <Form.Control
                      type="date"
                      value={pauseDate}
                      onChange={(e) => setPauseDate(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="d-flex align-items-end">
                  <div className="milk-hint-box w-100">
                    Next delivery: <strong>Tomorrow, {timeSlot}</strong>
                  </div>
                </Col>
              </Row>
            </div>

            <div className="bg-white rounded-3 p-3 bx_sdw">
              <h4 className="mb-3">Add-on Essentials</h4>
              <Row className="g-3">
                {addOns.map((item) => (
                  <Col md={6} key={item.name}>
                    <button
                      type="button"
                      className={`milk-addon-card ${selectedAddOns.includes(item.name) ? "active" : ""}`}
                      onClick={() => toggleAddon(item.name)}
                    >
                      <div>
                        <strong>{item.name}</strong>
                        <div className="gry_fnt small">Add to subscription basket</div>
                      </div>
                      <span className="text-warning fw-bold">{formatMoney(item.price)}</span>
                    </button>
                  </Col>
                ))}
              </Row>
            </div>
          </Col>

          <Col lg={4}>
            <div className="bg-white rounded-3 p-3 bx_sdw mb-3">
              <h4 className="mb-3">Subscription Summary</h4>
              <div className="milk-summary-line">
                <span>Plan</span>
                <strong>{activePlan.label}</strong>
              </div>
              <div className="milk-summary-line">
                <span>Product</span>
                <strong>{selectedProduct.title}</strong>
              </div>
              <div className="milk-summary-line">
                <span>Quantity</span>
                <strong>{quantity} packs</strong>
              </div>
              <div className="milk-summary-line">
                <span>Days</span>
                <strong>{selectedDays.join(", ") || "Daily"}</strong>
              </div>
              <div className="milk-summary-line">
                <span>Time slot</span>
                <strong>{timeSlot}</strong>
              </div>
              <div className="milk-summary-line">
                <span>Add-ons</span>
                <strong>{selectedAddOns.join(", ") || "None"}</strong>
              </div>
              <hr />
              <div className="milk-summary-total">
                <span>Total estimate</span>
                <strong>{formatMoney(estimatedTotal)}</strong>
              </div>
              <Button className="btn_thm w-100 mt-3">Start Subscription</Button>
            </div>

            <div className="bg-white rounded-3 p-3 bx_sdw">
              <h4 className="mb-3">Pre-Order Booking</h4>
              <Form.Group className="mb-3">
                <Form.Label>Booking type</Form.Label>
                <Form.Select>
                  <option>Milk bulk order</option>
                  <option>Paneer booking</option>
                  <option>Ghee pre-order</option>
                  <option>Festival combo pack</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Delivery date</Form.Label>
                <Form.Control type="date" defaultValue="2026-08-10" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Special instructions</Form.Label>
                <Form.Control as="textarea" rows={3} defaultValue="Need early morning delivery and extra insulated packing." />
              </Form.Group>
              <div className="milk-hint-box mb-3">
                Reserve weekly milk, monthly bottle plans, or special pre-orders from the same page.
              </div>
              <Button className="btn btn-primary w-100">Book Pre-Order</Button>
            </div>
          </Col>
        </Row>
      </div>
      <Footer />

      <style>{`
        .milk-template-tile,
        .milk-template-product,
        .milk-addon-card,
        .milk-day-chip {
          width: 100%;
          border: 1px solid #e1e1e1;
          background: #fff;
          border-radius: 12px;
          padding: 14px;
          text-align: left;
          transition: all 0.2s ease-in-out;
        }

        .milk-template-tile:hover,
        .milk-template-product:hover,
        .milk-addon-card:hover,
        .milk-day-chip:hover {
          box-shadow: var(--bxsdw);
        }

        .milk-template-tile.active,
        .milk-template-product.active,
        .milk-addon-card.active,
        .milk-day-chip.active {
          border-color: #f3b524;
          background: #fff8e1;
        }

        .milk-template-tile strong,
        .milk-template-product strong,
        .milk-addon-card strong {
          display: block;
          color: #1f1f1f;
          margin-bottom: 4px;
        }

        .milk-template-tile span,
        .milk-template-product span {
          color: #6b6b6b;
          font-size: 14px;
        }

        .milk-product-badge {
          display: inline-block;
          background: #ffe8ac;
          color: #000;
          border-radius: 999px;
          padding: 4px 10px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .milk-day-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .milk-day-chip {
          width: auto;
          min-width: 64px;
          text-align: center;
          padding: 10px 12px;
          font-weight: 600;
        }

        .milk-hint-box {
          background: #f6f6f6;
          border-radius: 10px;
          padding: 12px;
          color: #444;
          font-size: 14px;
        }

        .milk-summary-line,
        .milk-summary-total {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 10px;
        }

        .milk-summary-line span,
        .milk-summary-total span {
          color: #6b6b6b;
        }

        .milk-summary-total strong {
          color: #000;
          font-size: 18px;
        }

        @media (max-width: 767px) {
          .milk-day-chip {
            min-width: 56px;
          }
        }
      `}</style>
    </>
  );
};

export default MilkSubscriptionPreview;
