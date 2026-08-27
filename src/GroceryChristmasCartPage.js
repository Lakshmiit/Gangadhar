import React, { useEffect, useState, useRef } from "react";
import {
  Divider,
  IconButton,
} from "@mui/material"; 
import { Modal } from 'react-bootstrap'; 
import {
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import "./App.css"; 
import CartImg from './img/Cart.jpeg';
import { useNavigate, useParams } from "react-router-dom";
import Footer from "./Footer.js";

const GroceryChristmasCartPage = () => {    
  const navigate = useNavigate();
  const {userId} = useParams();
  const {userType} = useParams();
  const [cartItems, setCartItems] = useState([]);
  const removalTimers = useRef({});
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [zoomImage, setZoomImage] = useState("");
  const [grandSummary, setGrandSummary] = useState({ items: 0, total: 0 });
  const [imageBlobMap, setImageBlobMap] = useState({}); 

  const IMAGE_DOWNLOAD =
    "https://handymanapiv4-d4baa3hhdcftgabe.centralindia-01.azurewebsites.net/api/FileUpload/download?generatedfilename=";

  function toNum(v, f = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : f;
  }

function getCustomLimit(name) {
  const n = String(name || "").toLowerCase().trim();
  if (n === "visakha dairy curd 180 g" ||
    n === "visakha dairy happy full cream milk 500 ml" ||
    n === "visakha dairy milk 200 ml" || n === "visakha dairy good milk 180 ml" || n === "lemon (nimakaya) (3pcs)" ||
    n === "freedom refined sunflower oil 5 l" ||
    n === "gold drop refined sunflower oil can 5 l" ||
    n === "aashirvaad high fibre atta with multigrains 5 kg" ||
    n === "aashirvaad superior whole wheat atta 5 kg" || 
    n === "freedom refined sunflower oil 1 l" ||
    n === "pomegranate 2 pcs (300-400 g)" ||
    n === "royal gala apple 2 pcs (200-300 g)" ||
    n === "banana 3 pcs"
  ) return 1;
  if (
    n === "onion (ulligadda) 500 g" || 
    n === "potato (bangala dumpa) 500 g" ||
    n === "ivy gourd (dondakaya) 250 g" ||
    n === "green chilli (pachchi mirchi) 100 g" || 
    n === "tomato 250 g" ||
    n === "raw banana 1 pc" || 
    n === "independence refined sunflower oil 1 l" || 
    n === "visakha dairy ganga toned milk 500 ml"
 ) return 2;
 if (
    n === "gold drop refined sunflower oil 1 l"
   ) return 3;
  return Infinity;   
}

  function getFilenameFromValue(value) {
    if (!value) return "";
    const v = String(value);
    const i = v.indexOf("generatedfilename=");
    if (i >= 0) return decodeURIComponent(v.slice(i + "generatedfilename=".length));
    if (/^https?:\/\//i.test(v)) return "";
    return v.trim();
  }
  function fileToUrl(filenameOrUrl) {
    if (!filenameOrUrl) return "";
    if (/^https?:\/\//i.test(String(filenameOrUrl))) return filenameOrUrl;
    return `${IMAGE_DOWNLOAD}${encodeURIComponent(String(filenameOrUrl))}`;
  }

    //  const norm = (s) => String(s || "").toLowerCase().trim();
     const MIN_ORDER_TOTAL = 1999;

  const refreshStocksOnce = React.useCallback(
    async (signal) => {
      const norm = (s) => String(s || "").toLowerCase().trim();
      const isOffersRow = (obj) => norm(obj?.category) === "offers";
 
      function pickBestNonOffer(items, name) {
        const pool = (items || []).filter((it) => !isOffersRow(it));
        if (!pool.length) return null;

        const lname = norm(name);
        const exact = pool.filter((it) => norm(it?.name) === lname);
        const p = exact.length ? exact : pool;

        return (
          p
            .slice()
            .sort((a, b) => {
              const aStock = Number(a?.stockLeft || 0);
              const bStock = Number(b?.stockLeft || 0);
              if ((bStock > 0) !== (aStock > 0)) return bStock > 0 ? 1 : -1;
              return Date.parse(b?.date || 0) - Date.parse(a?.date || 0);
            })[0] || null
        );
      }

      const saved = JSON.parse(localStorage.getItem("allCategories") || "[]");

      const flat = saved
        .flatMap((cat) =>
      //     isBlockedCategory(cat.categoryName)
      // ? [] :
          (cat.products || []).map((p) => ({
            categoryName: cat.categoryName,
            productName: p.productName || p.name || "",
            qty: toNum(p.qty, 0),
            mrp: toNum(p.mrp, 0),
            discount: toNum(p.discount, 0),
            price: toNum(p.afterDiscountPrice ?? p.price, 0),
            stockLeft: toNum(p.stockLeft, 0),
            code: p.code,
            units: p.units,
            image: p.image ?? p.productImage ?? null,
          }))
        )
        .filter((x) => x.qty > 0 && x.productName);

      if (!flat.length) return;

      const uniqueNames = Array.from(new Set(flat.map((x) => x.productName.trim())));

      const lookups = await Promise.allSettled(
        uniqueNames.map(async (name) => {
          const url = `https://handymanapiv4-d4baa3hhdcftgabe.centralindia-01.azurewebsites.net/api/UploadGrocery/GetGroceryItemsByProductName?productName=${encodeURIComponent(
            name
          )}`;
          const res = await fetch(url, { signal });
          const text = await res.text();
          let data = [];
          try {
            data = text ? JSON.parse(text) : [];
          } catch {
            data = [];
          }
          return { name, items: Array.isArray(data) ? data : data ? [data] : [] };
        })
      );

      const stockMap = new Map();
      lookups.forEach((r) => {
        if (r.status !== "fulfilled") return;
        const { name, items } = r.value || {};
        const best = pickBestNonOffer(items, name);
        if (!best) return;
        const newStock = toNum(best?.stockLeft, null);
        if (newStock !== null) stockMap.set(name, newStock);
      });

      if (!stockMap.size) return;

      const updated = saved.map((cat) => ({
        ...cat,
        products: (cat.products || [])
          .map((p) => {
            const pname = p.productName || p.name || "";
            if (!pname) return p;
            const latestStock = stockMap.get(pname);
            if (latestStock == null) return p;
            const currentQty = toNum(p.qty, 0);
            const clampedQty = Math.max(
              0,
              Math.min(
                currentQty,
                latestStock,
                getCustomLimit(p.productName || p.name || "")
              )
            );
            // const clampedQty = Math.max(0, Math.min(currentQty, latestStock));
            return {
              ...p,
              stockLeft: String(latestStock),
              qty: clampedQty,
            };
          })
          .filter((p) => toNum(p.qty, 0) > 0),
      }));

      localStorage.setItem("allCategories", JSON.stringify(updated));

      const allItems = updated
        .flatMap((cat) =>
      //     isBlockedCategory(cat.categoryName)
      // ? [] : 
      (cat.products || []).map((p, idx) => {
            const persisted = p.image ?? p.productImage ?? "";
            const imageFilename = getFilenameFromValue(persisted);
            const imageUrl = imageFilename
              ? fileToUrl(imageFilename)
              : typeof persisted === "string"
              ? persisted
              : "";
            return {
              id: `${cat.categoryName}-${p.productId ?? p.id ?? idx}`,
              productId: p.productId ?? p.id ?? idx,
              name: p.productName ?? p.name ?? "",
              category: cat.categoryName,
              qty: toNum(p.qty, 0),
              mrp: toNum(p.mrp, 0),
              discount: toNum(p.discount, 0),
              price: toNum(p.afterDiscountPrice ?? p.price, 0),
              stockLeft: toNum(p.stockLeft, 0),
              code: p.code,
              units: p.units,
              imageFilename,
              imageUrl,
            };
          })
        )
        // ✅ include offers too; only require qty > 0
        .filter((it) => it.qty > 0);

      setCartItems(allItems);
      setGrandSummary({
        items: allItems.reduce((s, it) => s + toNum(it.qty, 0), 0),
        total: Math.round(
          allItems.reduce((s, it) => s + toNum(it.price, 0) * toNum(it.qty, 0), 0)
        ),
      });
    },
    [] 
  );

  useEffect(() => {
    const ctrl = new AbortController();

    const tick = () => {
      if (ctrl.signal.aborted) return;
      refreshStocksOnce(ctrl.signal).catch((e) => {
        if (e?.name !== "AbortError") console.warn("Stock refresh failed:", e);
      });
    };

    tick();                   
    const id = setInterval(tick, 5000);
    return () => {
      clearInterval(id);
      ctrl.abort();
    };
  }, [refreshStocksOnce]);

  useEffect(() => {
    const safeParse = (key) => {
      try { return JSON.parse(localStorage.getItem(key) || "[]"); }
      catch { return []; }
    };

    const saved0 = safeParse("allCategories");
    if (!saved0.length) {
      const activeOrderId = localStorage.getItem("activeOrderId");
      const snap = activeOrderId && localStorage.getItem(`cartSnapshot_${activeOrderId}`);
      if (snap) {
        localStorage.setItem("allCategories", snap);
      }
    }         

    const saved = safeParse("allCategories");
    const allItems = saved.flatMap((cat) =>
    //    isBlockedCategory(cat.categoryName)
    // ? []  :
      (cat.products || []).map((p, idx) => {
        const persisted = p.image ?? p.productImage ?? "";
        const imageFilename = getFilenameFromValue(persisted);
        const imageUrl = imageFilename
          ? fileToUrl(imageFilename)
          : (typeof persisted === "string" ? persisted : "");
        return {
          id: `${cat.categoryName}-${p.productId ?? p.id ?? idx}`,
          productId: p.productId ?? p.id ?? idx,
          name: p.productName ?? p.name ?? "",
          category: cat.categoryName,
          // qty: Number(p.qty || 0),
          qty: Math.min(
            Number(p.qty || 0),
            Number.isFinite(Number(p.stockLeft)) ? Number(p.stockLeft) : Infinity,
            getCustomLimit(p.productName ?? p.name ?? "")
          ),
          mrp: Number(p.mrp || 0),
          discount: Number(p.discount || 0),
          price: Number(p.afterDiscountPrice || p.price || 0),
          stockLeft: Number(p.stockLeft || 0),
          code: p.code,
          units: p.units,
          imageFilename,
          imageUrl,
        };
      })
    );

    const filtered = allItems.filter((it) => it.qty > 0); // includes offers
    setCartItems(filtered);
    setGrandSummary({
      items: filtered.reduce((s, it) => s + Number(it.qty || 0), 0),
      total: Math.round(filtered.reduce((s, it) => s + Number(it.price || 0) * Number(it.qty || 0), 0)),
    });
  }, []);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("allCategories") || "[]");
    const allItems = saved.flatMap((cat) =>
      (cat.products || []).map((p, idx) => {
        const persisted = p.image ?? p.productImage ?? "";
        const imageFilename = getFilenameFromValue(persisted);
        const imageUrl = imageFilename ? fileToUrl(imageFilename) : (typeof persisted === "string" ? persisted : "");

        return {
          id: `${cat.categoryName}-${p.productId ?? p.id ?? idx}`,
          productId: p.productId ?? p.id ?? idx,
          name: p.productName ?? p.name ?? "",
          category: cat.categoryName,
          // qty: Number(p.qty || 0),
          qty: Math.min(
            Number(p.qty || 0),
            Number.isFinite(Number(p.stockLeft)) ? Number(p.stockLeft) : Infinity,
            getCustomLimit(p.productName ?? p.name ?? "")
          ),
          mrp: Number(p.mrp || 0),
          discount: Number(p.discount || 0),
          price: Number(p.afterDiscountPrice || p.price || 0),
          stockLeft: Number(p.stockLeft || 0),
          code: p.code,
          units: p.units,
          imageFilename,       
          imageUrl,         
        };
      })
    );
    setCartItems(allItems.filter(it => it.qty > 0)); // includes offers
    setGrandSummary({
      items: allItems.reduce((s, it) => s + Number(it.qty || 0), 0),
      total: Math.round(allItems.reduce((s, it) => s + Number(it.price || 0) * Number(it.qty || 0), 0)),
    });
  }, []);

  useEffect(() => {
    const filenames = Array.from(
      new Set(
        cartItems
          .map(i => i.imageFilename)
          .filter(Boolean)
          .filter(fn => !(fn in imageBlobMap))
      )
    );
    if (!filenames.length) return;

    let cancelled = false;
    (async () => {
      try {
        const results = await Promise.allSettled(
          filenames.map(async (fn) => {
            const res = await fetch(`${IMAGE_DOWNLOAD}${encodeURIComponent(fn)}`);
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
              return { fn, url: `${IMAGE_DOWNLOAD}${encodeURIComponent(fn)}` };
            }
          })
        );
        if (cancelled) return;
        const mapUpdate = {};
        results.forEach(r => {
          if (r.status === "fulfilled" && r.value?.fn && r.value?.url) {
            mapUpdate[r.value.fn] = r.value.url;
          }
        });
        if (Object.keys(mapUpdate).length) {
          setImageBlobMap(prev => ({ ...prev, ...mapUpdate }));
        }
      } catch (e) {
        console.error("prefetch images failed", e);
      }
    })();
    return () => { cancelled = true; };
  }, [cartItems, imageBlobMap]);

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
        image: it.imageFilename || getFilenameFromValue(it.imageUrl) || it.imageUrl || null,
      });
      return acc;
    }, {});
    const allCategories = Object.entries(grouped).map(([categoryName, products]) => ({
      categoryName,
      products: products.filter(p => Number(p.qty) > 0),
    }));
    localStorage.setItem("allCategories", JSON.stringify(allCategories));
  };

  // const handleQtyChange = (rowId, delta) => {
  //   setCartItems(prev => {
  //     const next = prev
  //       .map(it => {
  //         if (it.id !== rowId) return it;
  //         const max = Number.isFinite(it.stockLeft) ? it.stockLeft : Infinity;
  //         const current = Number(it.qty || 0);
  //         const proposed = current + delta;
  //         const clamped = Math.max(0, Math.min(proposed, max));
  //         return { ...it, qty: clamped };
  //       })
  //       .filter(it => it.qty > 0);

  //     writeBackToStorage(next);
  //     setGrandSummary(computeTotals(next));
  //     return next;
  //   });
  // };

  const handleQtyChange = (rowId, delta) => {
  setCartItems(prev => {
    const next = prev
      .map(it => {
        if (it.id !== rowId) return it;
        const stockMax = Number.isFinite(it.stockLeft) ? it.stockLeft : Infinity;
        const limitMax = getCustomLimit(it.name);
        const max = Math.min(stockMax, limitMax);

        const current = Number(it.qty || 0);
        const proposed = current + delta;
        const clamped = Math.max(0, Math.min(proposed, max));
        return { ...it, qty: clamped };
      })
      .filter(it => it.qty > 0);

    writeBackToStorage(next);
    setGrandSummary(computeTotals(next));
    return next;
  });
};

  const computeTotals = (items) => ({
    items: items.reduce((s, it) => s + Number(it.qty || 0), 0),
    total: Math.round(items.reduce((s, it) => s + Number(it.price || 0) * Number(it.qty || 0), 0)),
  });

  const handleGroceryProceed = async (event) => {
    event.preventDefault();
    const allCategories = JSON.parse(localStorage.getItem("allCategories")) || [];
    const payload = { 
      id: "string",
      martId: "string",
      date: "string",
      customerId: userId,
      VendorId : "string",
      status: "Draft",
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
      GrandTotal: (roundedGrandTotal).toString(),
      TotalItemsSelected: (grandSummary.items).toString(),
      categories: allCategories.map((cat) => {
        const products = (cat.products || []).map((p) => {
          const persisted = p.image ?? p.productImage ?? "";
          const filename = getFilenameFromValue(persisted);
          const safeImage = filename || (typeof persisted === "string" ? persisted : "");
          return {
            productName: (p.productName?.trim() || p.name?.trim() || ""),
            noOfQuantity: String(p.qty),
            productImage: safeImage, 
            mrp: String(p.mrp || 0),
            discount: String(p.discount || 0),
            afterDiscountPrice: String(p.afterDiscountPrice || p.price || 0),
            stockLeft: String(p.stockLeft - p.qty),
            code: String(p.code),
            units: String(p.units),
          };
        });
        return {
          categoryName: cat.categoryName,
          numberOfItemsSelected: products.reduce((sum, p) => sum + Number(p.noOfQuantity), 0),
          totalAmount: Math.round(
            products.reduce((sum, p) => sum + Number(p.afterDiscountPrice) * Number(p.noOfQuantity), 0)
          ),
          products,
        };
      }),
    };

    try {
      const response = await fetch(
        `https://handymanapiv4-d4baa3hhdcftgabe.centralindia-01.azurewebsites.net/api/Mart/UploadProductDetails`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (response.ok) {
        const data = await response.json();
        const extractedId = data.id;
        if (extractedId) {
          const currentCart = localStorage.getItem("allCategories") || "[]";
          localStorage.setItem(`cartSnapshot_${extractedId}`, currentCart);
          localStorage.setItem("activeOrderId", extractedId);
          localStorage.setItem(`cartMeta_${extractedId}`,JSON.stringify({ items: grandSummary.items, total: roundedGrandTotal }));
          navigate(`/groceryPaymentMethod/${userType}/${userId}/${extractedId}`);
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

  const handleImageClick = (imageSrc) => {
    setZoomImage(imageSrc); 
    setShowZoomModal(true);
  };

  const handleRestore = (id) => {
    clearTimeout(removalTimers.current[id]);
    delete removalTimers.current[id];
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: 1, removing: false } : item
      )
    );
  };

  const itemsTotal = Math.round(cartItems.reduce((s, it) => s + it.mrp   * it.qty, 0));
  const grandTotal = Math.round(cartItems.reduce((s, it) => s + it.price * it.qty, 0));
  const roundedItemsTotal = Math.round(itemsTotal);
  const roundedGrandTotal = Math.round(grandTotal);

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
        style={{
          overflowY: "auto",
          padding: "8px",
          marginTop: "48px",
        }}
      >
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="cart-item d-flex align-items-start justify-content-between mb-2"
          >
            {/* Product Image */}
            <img
              src={ (item.imageFilename && imageBlobMap[item.imageFilename]) ||
                  (item.imageFilename && fileToUrl(item.imageFilename)) ||
                  item.imageUrl || "/placeholder.png" }
              alt={item.name}
              onClick={() => handleImageClick(
                (item.imageFilename && imageBlobMap[item.imageFilename]) ||
                (item.imageFilename && fileToUrl(item.imageFilename)) ||
                item.imageUrl ||
                "/placeholder.png"
              )}
              style={{ height: 50, width: 30, cursor: "pointer", borderRadius: 6 }}
              onError={(e) => { e.currentTarget.src = "/placeholder.png"; }}
            />

            {/* Product Details */}
            <div style={{ flex: 1, marginLeft: "8px" }}>
              <div style={{ fontWeight: "500", fontSize: "12px", marginRight: "5px"}}>{item.name}</div>
              <div style={{ fontSize: "12px", color: "#666" }}>
                MRP: <s>₹{Math.round(item.mrp)}</s> &nbsp;
                <span style={{ color: "red" }}>{Math.round(item.discount)}% off</span>
                <span style={{ color: "dark", marginLeft: "5px" }}>{item.units}</span>
              </div>
              <div style={{ fontWeight: "600", fontSize: "12px" }}>₹{Math.round(item.price)}</div>
            </div>

            {/* Quantity Box */}
            {item.removing ? (
              <button 
                onClick={() => handleRestore(item.id)}
                style={{
                  backgroundColor: "white",
                  color: "green",
                  border: "1px solid green",
                  borderRadius: "6px",
                  fontSize: "14px",
                  padding: "8px",
                }} 
              >
                Add
              </button>
            ) : (
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
                <span style={{ fontWeight: "bold", fontSize: "12px" }}>{item.qty}</span>
                <IconButton
                  size="small"
                  onClick={() => handleQtyChange(item.id, 1)}
                  style={{ color: "white", padding: "2px", opacity: item.qty >= item.stockLeft ? 0.5 : 1 }}
                  disabled={Number.isFinite(item.stockLeft) && item.qty >= item.stockLeft}
                  title={Number.isFinite(item.stockLeft) && item.qty >= item.stockLeft ? "No more stock" : "Add one"}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bill Details */}
      <div className="bill-details p-1">
        <p className="fs-6 fw-bold">Bill details</p>
        <div className="d-flex justify-content-between align-items-center">
          <span>📋 Items total</span>
          <span>
            <s className="text-muted">₹{roundedItemsTotal}</s> ₹{roundedGrandTotal}
          </span>
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <span>🚲 Delivery charge <InfoIcon fontSize="small" /></span>
          <span className="text-danger fw-bold" style={{ fontSize: "10px" }}>
            FREE
          </span>
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <span>👜 Handling charge <InfoIcon fontSize="small" /></span>
          <span className="text-danger fw-bold" style={{ fontSize: "10px" }}>
            FREE
          </span>
        </div>
        <hr className="my-2" />
        <div className="d-flex justify-content-between align-items-center fw-bold">
          <span>Grand total</span>
          <span>₹{roundedGrandTotal}</span>
        </div>
      </div>
      <Divider />
        {roundedGrandTotal < MIN_ORDER_TOTAL && (
          <p style={{ color: "red", fontSize: "13px", marginTop: "0px" }}>
            Minimum order is ₹{MIN_ORDER_TOTAL} and above
          </p>
        )}

      {/* {roundedGrandTotal < 50 && (
        <p style={{ color: "red", fontSize: "13px", marginTop: "0px" }}>
          Minimum order is 50 and above
        </p>
      )} */}

      {/* Footer */}
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
          <div style={{ fontWeight: "500", fontSize: "15px" }}>₹{roundedGrandTotal}</div>
        </div>
        
        <div
          style={{
            fontWeight: "500",
            fontSize: "15px",
            cursor: roundedGrandTotal < MIN_ORDER_TOTAL ? "not-allowed" : "pointer",
            opacity: roundedGrandTotal < MIN_ORDER_TOTAL ? 0.6 : 1
          }}
          onClick={roundedGrandTotal >= MIN_ORDER_TOTAL ? handleGroceryProceed : undefined}
        >
          {roundedGrandTotal < MIN_ORDER_TOTAL ? "Add More Items" : "Proceed →"}
        </div>

        {/* <div
          style={{
            fontWeight: "500",
            fontSize: "15px",
            cursor: roundedGrandTotal < 50 ? "not-allowed" : "pointer",
            opacity: roundedGrandTotal < 50 ? 0.6 : 1
          }}
          onClick={roundedGrandTotal >= 50 ? handleGroceryProceed : undefined}
        >
          {roundedGrandTotal < 50 ? "Add More Items" : "Proceed →"}
        </div> */}
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
      <Modal show={showZoomModal} onHide={() => setShowZoomModal(false)} centered>
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

export default GroceryChristmasCartPage;

