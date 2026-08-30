import React, { useEffect, useState, useRef, useCallback } from "react";
import { Divider, IconButton } from "@mui/material";
import { Modal } from "react-bootstrap";
import {
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import "./App.css";
import CartImg from "./img/Cart.jpeg";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "./Footer.js";
import {
  IMAGE_DOWNLOAD_URL,
  getImageFilename,
  imageValueToUrl,
} from "./utils/imageSource";
// import { appConfig } from "./config";

// import { useLocation } from "react-router-dom";

const IMAGE_DOWNLOAD = IMAGE_DOWNLOAD_URL;

const getLimit = (item) => {
  const limit = Number(item?.limit);
  if (Number.isFinite(limit) && limit > 0) return limit;
  return Infinity;
};

const clampQty = (item, qty) => {
  const stockMax = Number.isFinite(item.stockLeft) ? item.stockLeft : Infinity;
  const limit = getLimit(item);
  const maxAllowed = Math.min(stockMax, limit);
  return Math.max(0, Math.min(qty, maxAllowed));
};

const fileToUrl = imageValueToUrl;

const isValidCartItem = (it) => {
  const hasName = Boolean(String(it.name || "").trim());
  const hasQty = Number(it.qty) > 0;
  const hasPrice = Number(it.price) > 0 || Number(it.mrp) > 0;
  return hasName && hasQty && hasPrice;
};

const mapSavedToItems = (saved) => {
  return saved
    .flatMap((cat) =>
      (cat.products || []).map((p, idx) => {
        const persisted = p.image ?? p.productImage ?? "";
        const imageFilename = getImageFilename(persisted);
        const imageUrl = imageValueToUrl(persisted);

        const qty = Number(p.qty || p.noOfQuantity || 0);
        const mrp = Number(p.mrp || 0);
        const discount = Number(p.discount || 0);
        const price = Number(
          p.afterDiscountPrice || p.afterDiscount || p.price || 0,
        );
        const stockLeft = Number(p.stockLeft || 0);
        const item = {
          id: `${cat.categoryName}-${p.productId ?? p.id ?? idx}`,
          productId: p.productId ?? p.id ?? idx,
          name: p.productName ?? p.name ?? "",
          category: cat.categoryName,
          qty,
          mrp,
          discount,
          price,
          stockLeft,
          code: p.code,
          units: p.units,
          limit: Number(p.limit || 0),
          imageFilename,
          imageUrl,
        };

        return item;
      }),
    )
    .filter(isValidCartItem);
};

const computeTotals = (items) => ({
  items: items.reduce((s, it) => s + Number(it.qty || 0), 0),
  total: Math.round(
    items.reduce((s, it) => s + Number(it.price || 0) * Number(it.qty || 0), 0),
  ),
});

const writeBackToStorage = (items) => {
  const grouped = items.reduce((acc, it) => {
    (acc[it.category] ||= []).push({
      productId: it.productId,
      productName: it.name,
      qty: it.qty,
      mrp: it.mrp,
      discount: it.discount,
      afterDiscountPrice: it.price,
      stockLeft: it.stockLeft,
      code: it.code,
      units: it.units,
      limit: it.limit,
      image:
        it.imageFilename ||
        getImageFilename(it.imageUrl) ||
        it.imageUrl ||
        null,
    });
    return acc;
  }, {});

  const allCategories = Object.entries(grouped).map(
    ([categoryName, products]) => ({
      categoryName,
      products: products.filter((p) => Number(p.qty) > 0),
    }),
  );
  localStorage.setItem("allCategories", JSON.stringify(allCategories));
};

const GroceryOffersCartPage = () => {
  const navigate = useNavigate();
  // const location = useLocation();
  const { userId, userType } = useParams();
  const [cartItems, setCartItems] = useState([]);
  const [imageBlobMap, setImageBlobMap] = useState({});
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [zoomImage, setZoomImage] = useState("");
  const [grandSummary, setGrandSummary] = useState({ items: 0, total: 0 });
  const [walletAmount, setWalletAmount] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [fullName, setFullName] = useState("");
  const [isNewUser, setIsNewUser] = useState(true);
  const isGuestName = (name) => (name ?? "").trim().toLowerCase() === "guest";
  const [referralAmount, setReferralAmount] = useState(0);
  const MIN_ORDER_TOTAL =
    Number(walletAmount) === 50 || Number(referralAmount) > 0 ? 150 : 100;
  const normalizeName = (name) =>
    String(name || "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  useEffect(() => {
    console.log(addresses, fullName, isNewUser);
  }, [addresses, fullName, isNewUser]);

  console.log("Wallet:", walletAmount);

  const getReferralRecord = async (userId) => {
    if (!userId) return null;
    const url = `https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/ReferralPoints/GetReferralPointsByUserId?referreId=${encodeURIComponent(userId)}`;
    const res = await fetch(url);
    const text = await res.text();
    let data = [];
    try {
      data = text ? JSON.parse(text) : [];
    } catch {
      data = [];
    }
    if (Array.isArray(data) && data.length > 0) {
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      return data[0];
    }
    return null;
  };

  useEffect(() => {
    const fetchReferral = async () => {
      const rec = await getReferralRecord(userId);
      const points = Number(rec?.points || 0);
      setReferralAmount(points);
    };
    if (userId) {
      fetchReferral();
    }
  }, [userId]);

  const fetchCustomerData = useCallback(async () => {
    try {
      const response = await fetch(
        `https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/Address/GetAddressById/${userId}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch customer profile data");
      }
      const data = await response.json();
      console.log(data);
      const addresses = Array.isArray(data) ? data : [data];
      const formattedAddresses = addresses.map((addr) => ({
        id: addr.addressId,
        type: addr.isPrimaryAddress ? "primary" : "secondary",
        address: addr.address,
        state: addr.state,
        district: addr.district,
        zipCode: addr.zipCode,
        emailAddress: addr.emailAddress,
        mobileNumber: addr.mobileNumber,
        fullName: addr.fullName,
        walletAmount: addr.walletAmount,
      }));
      setAddresses(formattedAddresses);
      // console.log(JSON.stringify(data));
      const apiFullName = addresses[0]?.fullName ?? "";
      setFullName(apiFullName);
      const wallet = addresses[0]?.walletAmount ?? 0;
      setWalletAmount(Number(wallet));
      if (!apiFullName || isGuestName(apiFullName)) {
        setIsNewUser(true);
      } else {
        setIsNewUser(false);
      }
    } catch (error) {
      console.error("Error fetching customer data:", error);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchCustomerData();
    }
  }, [userId, fetchCustomerData]);

  useEffect(() => {
    const safeParse = (key) => {
      try {
        return JSON.parse(localStorage.getItem(key) || "[]");
      } catch {
        return [];
      }
    };

    const saved0 = safeParse("allCategories");
    if (!saved0.length) {
      const activeOrderId = localStorage.getItem("activeOrderId");
      const snap =
        activeOrderId && localStorage.getItem(`cartSnapshot_${activeOrderId}`);
      if (snap) localStorage.setItem("allCategories", snap);
    }
    const saved = safeParse("allCategories");
    const rawItems = mapSavedToItems(saved);

    const clampedItems = rawItems.map((it) => ({
      ...it,
      qty: clampQty(it, Number(it.qty || 0)),
    }));

    writeBackToStorage(clampedItems);
    setCartItems(clampedItems);
    setGrandSummary(computeTotals(clampedItems));
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== "allCategories") return;
      try {
        const saved = JSON.parse(e.newValue || "[]");
        const allItems = mapSavedToItems(saved);
        setCartItems(allItems);
        setGrandSummary(computeTotals(allItems));
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const filenames = Array.from(
      new Set(
        cartItems
          .map((i) => i.imageFilename)
          .filter(Boolean)
          .filter((fn) => !(fn in imageBlobMap)),
      ),
    );
    if (!filenames.length) return;

    let cancelled = false;
    (async () => {
      try {
        const results = await Promise.allSettled(
          filenames.map(async (fn) => {
            const res = await fetch(
              `${IMAGE_DOWNLOAD}${encodeURIComponent(fn)}`,
            );
            const contentType = res.headers.get("content-type") || "";
            if (contentType.includes("application/json")) {
              const data = await res.json();
              if (!data?.imageData) throw new Error("No imageData");
              const byte = atob(data.imageData);
              const arr = new Uint8Array(byte.length);
              for (let i = 0; i < byte.length; i++) arr[i] = byte.charCodeAt(i);
              const blob = new Blob([arr], { type: "image/*" });
              const blobUrl = URL.createObjectURL(blob);
              return { fn, url: blobUrl };
            } else {
              return {
                fn,
                url: `${IMAGE_DOWNLOAD}${encodeURIComponent(fn)}`,
              };
            }
          }),
        );
        if (cancelled) return;
        const mapUpdate = {};
        results.forEach((r) => {
          if (r.status === "fulfilled" && r.value?.fn && r.value?.url) {
            mapUpdate[r.value.fn] = r.value.url;
          }
        });
        if (Object.keys(mapUpdate).length) {
          setImageBlobMap((prev) => ({ ...prev, ...mapUpdate }));
        }
      } catch (e) {
        console.error("prefetch images failed", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cartItems, imageBlobMap]);

  const handleQtyChange = async (rowId, delta) => {
    const item = cartItems.find((i) => i.id === rowId);
    if (!item) return;
    const latest = await fetchLatestStock(item.name);
    setCartItems((prev) => {
      const updated = prev
        .map((it) => {
          if (it.id !== rowId) return it;
          const limitMax = latest.limit > 0 ? latest.limit : Infinity;
          const maxAllowed = Math.min(latest.stockLeft, limitMax);
          const proposedQty = Number(it.qty || 0) + delta;
          if (latest.stockLeft === null) {
            return it;
          }

          if (latest.stockLeft <= 0) {
            return null;
          }
          if (proposedQty <= 0) {
            return null;
          }
          return {
            ...it,
            stockLeft: latest.stockLeft,
            limit: latest.limit,
            qty: Math.min(proposedQty, maxAllowed),
          };
        })
        .filter(Boolean);
      writeBackToStorage(updated);
      setGrandSummary(computeTotals(updated));
      return updated;
    });
  };

  const fetchLatestStock = useCallback(async (productName) => {
    try {
      const res = await fetch(
        `https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/UploadGrocery/GetGroceryItemsByProductName?productName=${encodeURIComponent(productName)}`,
      );
      const data = await res.json();
      const normalizedInput = normalizeName(productName);
      const exactMatch = (Array.isArray(data) ? data : []).filter(
        (x) => normalizeName(x.name) === normalizedInput,
      );
      const latest = exactMatch.sort(
        (a, b) => Date.parse(b?.date || 0) - Date.parse(a?.date || 0),
      )[0];
      if (!latest) {
        return {
          stockLeft: null,
          limit: null,
        };
      }
      return {
        stockLeft: Number(latest.stockLeft),
        limit: Number(latest.limit || 0),
      };
    } catch (err) {
      console.error(err);
      return {
        stockLeft: null,
        limit: null,
      };
    }
  }, []);

  const refreshAllCartStocks = useCallback(async () => {
    const currentItems = cartItemsRef.current;
    if (!currentItems.length) return;

    const stockResults = await Promise.all(
      currentItems.map(async (item) => ({
        name: item.name,
        latest: await fetchLatestStock(item.name),
      })),
    );

    const updated = currentItems
      .map((item) => {
        const match = stockResults.find(
          (x) => normalizeName(x.name) === normalizeName(item.name),
        );
        if (!match) return item;
        const latestStock = match.latest.stockLeft;
        const latestLimit =
          match.latest.limit > 0 ? match.latest.limit : Infinity;
        if (latestStock === null) {
          return item;
        }

        if (latestStock <= 0) {
          return null;
        }
        return {
          ...item,
          stockLeft: latestStock,
          limit: latestLimit,
          qty: Math.min(item.qty, latestStock, latestLimit),
        };
      })
      .filter(Boolean);
    setCartItems(updated);
    writeBackToStorage(updated);
    setGrandSummary(computeTotals(updated));
  }, [fetchLatestStock]);

  useEffect(() => {
    refreshAllCartStocks();
  }, [refreshAllCartStocks]);

  useEffect(() => {
    const handleFocus = () => refreshAllCartStocks();
    const handleOnline = () => refreshAllCartStocks();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshAllCartStocks();
      }
    };
    window.addEventListener("focus", handleFocus);
    window.addEventListener("online", handleOnline);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("online", handleOnline);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [refreshAllCartStocks]);

  const validateCartStockBeforeCheckout = async () => {
    const checks = await Promise.all(
      cartItems.map(async (item) => ({
        name: item.name,
        requestedQty: item.qty,
        latest: await fetchLatestStock(item.name),
      })),
    );
    const invalidItems = checks.filter(
      (x) => x.latest.stockLeft <= 0 || x.requestedQty > x.latest.stockLeft,
    );
    if (invalidItems.length > 0) {
      await refreshAllCartStocks();
      alert("Some items are out of stock. Cart updated.");
      return false;
    }
    return true;
  };

  // ----- Proceed -----
  const handleGroceryProceed = async (event) => {
    const valid = await validateCartStockBeforeCheckout();
    if (!valid) return;
    const allCategories =
      JSON.parse(localStorage.getItem("allCategories")) || [];
    //  const firstOrderData = await CheckFirstOrder(mobileNumber);
    //   // If null → new user
    //   const isNewUser = !firstOrderData;
    //   // ✅ SIMPLE WALLET LOGIC
    //   const walletValue = isNewUser ? "50" : "0";

    const payload = {
      id: "string",
      martId: "string",
      date: "string",
      customerId: userId,
      status: "Draft",
      walletAmount: "walletValue",
      paymentMode: "",
      utrTransactionNumber: "",
      transactionNumber: "",
      transactionStatus: "",
      TransactionType: "",
      paidAmount: "",
      customerName: "",
      address: "",
      state: "",
      district: "",
      zipCode: "",
      customerPhoneNumber: "",
      AssignedTo: "",
      DeliveryPartnerUserId: "",
      latitude: 0,
      longitude: 0,
      isPickUp: false,
      isDelivered: false,

      totalWalletAmount: "",
      availedAmount: "",
      remainingAmount: "",

      deliveryAssignedTime: "",
      deliverySubmitTime: "",
      GrandTotal: String(grandSummary.total),
      TotalItemsSelected: String(grandSummary.items),
      categories: allCategories.map((cat) => {
        const products = (cat.products || [])
          .map((p) => {
            const persisted = p.image ?? p.productImage ?? "";
            const filename = getImageFilename(persisted);
            const safeImage =
              filename || (typeof persisted === "string" ? persisted : "");
            const qty = Number(p.qty || p.noOfQuantity || 0);
            const price = Number(p.afterDiscountPrice || p.price || 0);
            const mrp = Number(p.mrp || 0);

            if (
              qty <= 0 ||
              (!mrp && !price) ||
              !String(p.productName || p.name || "").trim()
            ) {
              return null;
            }

            return {
              productName: (p.productName || p.name || "").trim(),
              noOfQuantity: String(qty),
              productImage: safeImage,
              mrp: String(mrp),
              discount: String(p.discount || 0),
              afterDiscountPrice: String(price),
              stockLeft: String((Number(p.stockLeft) || 0) - qty),
              code: String(p.code || ""),
              units: String(p.units || ""),
            };
          })
          .filter(Boolean);
        return {
          categoryName: cat.categoryName,
          numberOfItemsSelected: products.reduce(
            (sum, p) => sum + Number(p.noOfQuantity),
            0,
          ),
          totalAmount: Math.round(
            products.reduce(
              (sum, p) =>
                sum + Number(p.afterDiscountPrice) * Number(p.noOfQuantity),
              0,
            ),
          ),
          products,
        };
      }),
    };
    try {
      const response = await fetch(
        `https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/Mart/UploadProductDetails`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (response.ok) {
        const data = await response.json();
        const extractedId = data.id;
        if (extractedId) {
          const currentCart = localStorage.getItem("allCategories") || "[]";
          localStorage.setItem(`cartSnapshot_${extractedId}`, currentCart);
          localStorage.setItem("activeOrderId", extractedId);
          localStorage.setItem(
            `cartMeta_${extractedId}`,
            JSON.stringify({
              items: grandSummary.items,
              total: grandSummary.total,
            }),
          );
          navigate(
            `/groceryPaymentMethod/${userType}/${userId}/${extractedId}`,
          );
        }
      } else {
        const errorText = await response.text();
        alert("Failed to upload order: " + errorText);
      }
    } catch (error) {
      console.error("API Error:", error);
      alert("An error occurred while uploading the order.");
    }
  };

  const cartItemsRef = useRef([]);

  useEffect(() => {
    cartItemsRef.current = cartItems;
  }, [cartItems]);

  const handleImageClick = (imageSrc) => {
    setZoomImage(imageSrc);
    setShowZoomModal(true);
  };

  const itemsTotal = Math.round(
    cartItems.reduce(
      (s, it) =>
        s +
        (Number(it.mrp) > 0
          ? Number(it.mrp) * Number(it.qty)
          : Number(it.price) * Number(it.qty)),
      0,
    ),
  );

  return (
    <div
      className="cart-container d-flex flex-column"
      style={{
        maxWidth: "600px",
        margin: "5px",
        padding: "5px",
        borderRadius: "8px",
        height: "100vh",
      }}
    >
      {/* Header */}
      <div className="cart-header d-flex justify-content-between">
        <div className="d-flex align-items-center">
          <img src={CartImg} alt="Cart" className="cart-icon" />
          <h3 className="ms-1" style={{ fontSize: "18px" }}>
            My Cart
          </h3>
        </div>
        <IconButton>
          <CloseIcon
            onClick={() => navigate(`/profilePage/${userType}/${userId}`)}
            style={{
              cursor: "pointer",
              fontSize: "30px",
              color: "tomato",
            }}
          />
        </IconButton>
      </div>
      <Divider />

      {/* Cart Items */}
      <div
        className="cart-items flex-grow-1"
        style={{ overflowY: "auto", padding: "8px", marginTop: "48px" }}
      >
        {cartItems.map((item) => {
          const stockMax = Number.isFinite(item.stockLeft)
            ? item.stockLeft
            : Infinity;
          const limit = getLimit(item);
          const maxAllowed = Math.min(stockMax, limit);
          const canAdd = item.qty < maxAllowed;

          return (
            <div
              key={item.id}
              className="cart-item d-flex align-items-start justify-content-between mb-2"
            >
              {/* Product Image */}
              <img
                src={
                  (item.imageFilename && imageBlobMap[item.imageFilename]) ||
                  (item.imageFilename && fileToUrl(item.imageFilename)) ||
                  item.imageUrl ||
                  "/placeholder.png"
                }
                alt={item.name}
                onClick={() =>
                  handleImageClick(
                    (item.imageFilename && imageBlobMap[item.imageFilename]) ||
                      (item.imageFilename && fileToUrl(item.imageFilename)) ||
                      item.imageUrl ||
                      "/placeholder.png",
                  )
                }
                style={{
                  height: 50,
                  width: 30,
                  cursor: "pointer",
                  borderRadius: 6,
                }}
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.png";
                }}
              />
              {/* Product Details */}
              <div style={{ flex: 1, marginLeft: "8px" }}>
                <div
                  style={{
                    fontWeight: "500",
                    fontSize: "12px",
                    marginRight: "5px",
                  }}
                >
                  {item.name}
                </div>

                <div style={{ fontSize: "12px", color: "#666" }}>
                  {Number(item.mrp) > 0 && (
                    <>
                      MRP: <s>₹{Math.round(item.mrp)}</s>&nbsp;
                      <span style={{ color: "red" }}>
                        {Math.round(item.discount)}% off
                      </span>
                    </>
                  )}
                  {item.units && (
                    <span style={{ color: "dark", marginLeft: "5px" }}>
                      {item.units}
                    </span>
                  )}
                </div>
                <div style={{ fontWeight: "600", fontSize: "12px" }}>
                  ₹{Math.round(item.price)}
                </div>
              </div>
              {/* Quantity Box */}
              <div
                className="qty-box d-flex align-items-center justify-content-between"
                style={{
                  backgroundColor: "#2e7d32",
                  borderRadius: "6px",
                  color: "white",
                  minWidth: "60px",
                  height: "25px",
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => handleQtyChange(item.id, -1)}
                  style={{ color: "white", padding: "2px" }}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: "12px",
                  }}
                >
                  {item.qty}
                </span>
                <IconButton
                  size="small"
                  onClick={() => canAdd && handleQtyChange(item.id, +1)}
                  style={{
                    color: "white",
                    padding: "2px",
                    opacity: canAdd ? 1 : 0.5,
                    cursor: canAdd ? "pointer" : "not-allowed",
                  }}
                  disabled={!canAdd}
                  title={
                    canAdd
                      ? "Add one"
                      : item.qty >= stockMax && stockMax !== Infinity
                        ? "No more stock"
                        : Number.isFinite(limit)
                          ? `Limit ${limit} per customer`
                          : "No more allowed"
                  }
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bill Details */}
      <div className="bill-details p-1">
        <p className="fs-6 fw-bold">Bill details</p>
        <div className="d-flex justify-content-between align-items-center">
          <span>📋 Items total</span>
          <span>
            <s className="text-muted">₹{itemsTotal}</s> ₹{grandSummary.total}
          </span>
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <span>
            🚲 Delivery charge <InfoIcon fontSize="small" />
          </span>
          <span className="text-danger fw-bold" style={{ fontSize: "10px" }}>
            FREE
          </span>
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <span>
            👜 Handling charge <InfoIcon fontSize="small" />
          </span>
          <span className="text-danger fw-bold" style={{ fontSize: "10px" }}>
            FREE
          </span>
        </div>
        <hr className="my-2" />
        <div className="d-flex justify-content-between align-items-center fw-bold">
          <span>Grand total</span>
          <span>₹{grandSummary.total}</span>
        </div>
      </div>
      <Divider />

      {grandSummary.total < MIN_ORDER_TOTAL && (
        <p
          style={{
            color: "red",
            fontSize: "13px",
            marginTop: "0px",
          }}
        >
          Minimum order is ₹{MIN_ORDER_TOTAL} and above
          {walletAmount === 50 && " (Wallet applied)"}
          {referralAmount > 0 && " (Referral applied)"}
        </p>
      )}

      {/* Footer CTA */}
      <div
        className="cart-footer d-flex justify-content-between align-items-center mt-2 px-3 py-2"
        style={{
          backgroundColor: "#008000",
          color: "white",
          borderRadius: "8px",
          width: "100%",
        }}
      >
        <div>
          <span style={{ fontSize: "12px" }}>{grandSummary.items} items</span>
          <div
            style={{
              fontWeight: "500",
              fontSize: "15px",
            }}
          >
            ₹{grandSummary.total}
          </div>
        </div>

        <div
          style={{
            fontWeight: "500",
            fontSize: "15px",
            cursor:
              grandSummary.total < MIN_ORDER_TOTAL ? "not-allowed" : "pointer",
            opacity: grandSummary.total < MIN_ORDER_TOTAL ? 0.6 : 1,
          }}
          onClick={
            grandSummary.total >= MIN_ORDER_TOTAL
              ? handleGroceryProceed
              : undefined
          }
        >
          {grandSummary.total < MIN_ORDER_TOTAL
            ? "Add More Items"
            : "Proceed →"}
        </div>
      </div>

      <div className="text-start">
        <button
          className="btn btn-warning mt-1 mb-1"
          onClick={() => navigate(`/profilePage/${userType}/${userId}`)}
        >
          Back
        </button>
      </div>
      <Footer />

      {/* Zoom Modal */}
      <Modal
        show={showZoomModal}
        onHide={() => setShowZoomModal(false)}
        centered
      >
        <button
          className="close-button text-end mt-0"
          onClick={() => setShowZoomModal(false)}
        >
          &times;
        </button>
        <Modal.Body className="text-center">
          <div className="zoom-container">
            <img src={zoomImage} alt="Zoomed Product" className="zoom-image" />
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default GroceryOffersCartPage;
