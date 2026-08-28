import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ImageCache from "./utils/ImageCache";
import { CartStorage } from "./CartStorage";
import { getImageFilename, imageValueToUrl } from "./utils/imageSource";

const API_BASE =
  "https://lmartapiv1-fxcyd2b4btacgsav.westus2-01.azurewebsites.net";

const getLimit = (product) => {
  if (!product) return Infinity;
  const apiLimit = Number(product.limit);
  if (Number.isFinite(apiLimit) && apiLimit > 0) return apiLimit;
  return Infinity;
};

const clampQtyFor = (product, qty) => {
  const n = Math.max(0, Number(qty) || 0);
  const limit = getLimit(product);
  const stock = Number(product?.stockLeft || 0);
  return Math.min(n, limit, stock);
};

const fetchImage = async (photo, signal) => {
  if (!photo) return null;

  const filename = getImageFilename(photo);
  if (!filename) return imageValueToUrl(photo) || null;

  const blobUrl = ImageCache.getBlobUrl(filename);
  if (blobUrl) return blobUrl;

  const cached = await ImageCache.getBase64(filename);
  if (cached) {
    const dataUrl = `data:image/jpeg;base64,${cached}`;
    ImageCache.setBlobUrl(filename, dataUrl);
    return dataUrl;
  }

  try {
    const res = await fetch(imageValueToUrl(filename), { signal });
    const json = await res.json();
    const b64 = json?.imageData || "";
    if (b64) {
      const dataUrl = `data:image/jpeg;base64,${b64}`;
      await ImageCache.setBase64(filename, b64);
      ImageCache.setBlobUrl(filename, dataUrl);
      return dataUrl;
    }
  } catch (err) {
    console.error("fetchImage failed:", err);
  }
  return null;
};

const fetchProductByName = async (name, signal) => {
  const { data } = await axios.get(
    `${API_BASE}/api/UploadGrocery/GetGroceryItemsByProductName?productName=${encodeURIComponent(name)}`,
    { signal },
  );
  return Array.isArray(data) ? data[0] : data;
};

const groupDeliveryItems = (deliveryIn = "") => {
  if (!deliveryIn.trim()) return {};

  // ── New structured format: "[Category] item1, item2 | [Category2] item3"
  if (deliveryIn.includes("[") && deliveryIn.includes("]")) {
    const groups = {};
    const segments = deliveryIn
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);

    for (const segment of segments) {
      const catMatch = segment.match(/^\[(.+?)\]/);
      if (!catMatch) continue;

      const cat = catMatch[1].trim();
      const rest = segment.slice(catMatch[0].length).trim();
      const names = rest
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (names.length > 0) {
        groups[cat] = names;
      }
    }
    return groups;
  }

  const names = deliveryIn
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const categoryOf = (name) => {
    const n = name.toLowerCase();
    if (n.includes("rice")) return "Rice";
    if (n.includes("oil")) return "Oil";
    if (n.includes("sugar")) return "Sugar";
    if (
      n.includes("dal") ||
      n.includes("urad") ||
      n.includes("moong") ||
      n.includes("chana")
    )
      return "Dal";
    if (n.includes("rava") || n.includes("sooji")) return "Rava";
    if (n.includes("flour") || n.includes("maida") || n.includes("atta"))
      return "Flour";
    if (n.includes("salt")) return "Salt";
    if (n.includes("poha") || n.includes("flattened")) return "Poha";
    return "Other";
  };

  const groups = {};
  for (const name of names) {
    const cat = categoryOf(name);
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(name);
  }
  return groups;
};

const SubProductCard = ({ name, selected, onSelect, image, loading }) => (
  <div
    onClick={onSelect}
    style={{
      cursor: "pointer",
      border: selected ? "2.5px solid #16a34a" : "1.5px solid #e5e7eb",
      borderRadius: "14px",
      padding: "10px 8px",
      background: selected ? "#f0fdf4" : "#fff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "6px",
      position: "relative",
      transition: "all 0.18s",
      boxShadow: selected ? "0 0 0 3px #bbf7d0" : "0 1px 4px rgba(0,0,0,0.07)",
      minWidth: "120px",
      flex: "1 1 120px",
    }}
  >
    {selected && (
      <CheckCircleIcon
        style={{
          position: "absolute",
          top: 6,
          right: 6,
          color: "#16a34a",
          fontSize: 18,
        }}
      />
    )}
    <div
      style={{
        width: 72,
        height: 72,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        overflow: "hidden",
        background: "#f9fafb",
      }}
    >
      {loading ? (
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "#e5e7eb",
          }}
        />
      ) : image ? (
        <img
          src={image}
          alt={name}
          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
        />
      ) : (
        <span style={{ fontSize: 28 }}>🛒</span>
      )}
    </div>
    <span
      style={{
        fontSize: "11px",
        fontWeight: 600,
        textAlign: "center",
        color: selected ? "#16a34a" : "#374151",
        lineHeight: 1.3,
        maxWidth: "100%",
        display: "-webkit-box",
        WebkitLineClamp: 3,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}
    >
      {name}
    </span>
  </div>
);

const GroceryComboOffer = () => {
  const navigate = useNavigate();
  const { userType, userId } = useParams();
  const location = useLocation();
  const { product: mainProduct, imageUrl: mainImageUrl } = location.state || {};
  const [mainImg, setMainImg] = useState(mainImageUrl || null);
  const [subProducts, setSubProducts] = useState({});
  const [groups, setGroups] = useState({});
  const [selections, setSelections] = useState({});
  const [cart, setCart] = useState({});
  const [grandSummary, setGrandSummary] = useState({ items: 0, total: 0 });

  const mobileNumber = localStorage.getItem("customerMobileNumber");
  // const MIN_ORDER_TOTAL = 100;

  useEffect(() => {
    console.log(grandSummary);
  }, [grandSummary]);

  const selectedCategory = mainProduct
    ? `Grocery Value Combo Packs`
    : "Grocery Value Combo Packs";

  const stockLeft = Number(mainProduct?.stockLeft || 0);
  const isOutOfStock = stockLeft <= 0;
  const afterDiscount = Math.round(Number(mainProduct?.afterDiscount || 0));
  const mrp = Math.round(Number(mainProduct?.mrp || 0));
  const discountPct = Math.round(Number(mainProduct?.discount || 0));

  const getQty = (id) => Number(cart?.[id] || 0);

  const canAddMore = (id) => {
    if (!mainProduct) return false;
    return getQty(id) < clampQtyFor(mainProduct, Infinity);
  };

  const handleAddClick = () => {
    if (!mainProduct) return;
    const qty = clampQtyFor(mainProduct, 1);
    if (qty <= 0) return;
    setCart((prev) => ({ ...prev, [mainProduct?.id]: qty }));
  };

  const handleIncrement = () => {
    if (!mainProduct) return;
    setCart((prev) => {
      const nextQty = clampQtyFor(
        mainProduct,
        (prev[mainProduct?.id] || 0) + 1,
      );
      if (nextQty === prev[mainProduct?.id]) return prev;
      return { ...prev, [mainProduct?.id]: nextQty };
    });
  };

  const handleDecrementClick = () => {
    if (!mainProduct) return;
    setCart((prev) => {
      const next = (prev[mainProduct?.id] || 0) - 1;
      const copy = { ...prev };
      if (next <= 0) delete copy[mainProduct?.id];
      else copy[mainProduct?.id] = next;
      return copy;
    });
  };

  useEffect(() => {
    if (!selectedCategory) return;
    const saved = CartStorage.getAll() || [];
    const categories = Array.isArray(saved) ? saved : [saved];
    const exist = categories.find((c) => c.categoryName === selectedCategory);
    if (exist) {
      const restored = {};
      (exist.products || []).forEach((p) => {
        restored[String(p.productId)] = Number(p.qty);
      });
      setCart(restored);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (!selectedCategory || !mainProduct) return;
    const current = Object.entries(cart).map(([productId, qty]) => ({
      productId,
      productName: mainProduct.name || "",
      qty: Number(qty),
      mrp: Number(mainProduct.mrp || 0),
      discount: Number(mainProduct.discount || 0),
      afterDiscountPrice: Number(mainProduct.afterDiscount || 0),
      stockLeft: Number(mainProduct.stockLeft || 0),
      image: getImageFilename(mainProduct.images?.[0]),
      code: mainProduct.code || "",
      units: mainProduct.units || "",
    }));

    CartStorage.upsertCategory(selectedCategory, current);
    setGrandSummary(CartStorage.grandSummary());
  }, [cart, selectedCategory, mainProduct]);

  // ── Clamp existing cart qty if product data changes ────────────────────
  useEffect(() => {
    if (!mainProduct) return;
    setCart((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const [pid, qty] of Object.entries(prev)) {
        const clamped = clampQtyFor(mainProduct, qty);
        if (clamped !== qty) {
          if (clamped <= 0) delete next[pid];
          else next[pid] = clamped;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [mainProduct]);

  // ── Also persist to legacy cartData key
  useEffect(() => {
    localStorage.setItem("cartData", JSON.stringify(cart));
  }, [cart]);

  // ── Load sub-products
  useEffect(() => {
    if (!mainProduct?.deliveryIn) return;
    const grouped = groupDeliveryItems(mainProduct.deliveryIn);
    setGroups(grouped);

    const defaultSelections = {};
    for (const [cat, names] of Object.entries(grouped)) {
      defaultSelections[cat] = names[0];
    }
    setSelections(defaultSelections);

    const controller = new AbortController();
    const allNames = Object.values(grouped).flat();

    const loadOne = async (name) => {
      setSubProducts((prev) => ({
        ...prev,
        [name]: { ...(prev[name] || {}), loading: true },
      }));
      try {
        const prod = await fetchProductByName(name, controller.signal);
        const photo = Array.isArray(prod?.images) ? prod.images[0] : null;
        const img = photo ? await fetchImage(photo, controller.signal) : null;
        setSubProducts((prev) => ({
          ...prev,
          [name]: { data: prod, image: img, loading: false },
        }));
      } catch {
        setSubProducts((prev) => ({
          ...prev,
          [name]: { data: null, image: null, loading: false },
        }));
      }
    };

    allNames.forEach(loadOne);
    return () => controller.abort();
  }, [mainProduct]);

  // ── Load main image if not passed via state
  useEffect(() => {
    if (mainImg || !mainProduct?.images?.[0]) return;
    const controller = new AbortController();
    fetchImage(mainProduct.images[0], controller.signal).then(
      (url) => url && setMainImg(url),
    );
    return () => controller.abort();
  }, [mainProduct, mainImg]);

  const handleSelect = (cat, name) =>
    setSelections((prev) => ({ ...prev, [cat]: name }));

  const currentQty = getQty(mainProduct?.id);
  const allSelected = Object.keys(groups).every((cat) => selections[cat]);
  const canProceed = currentQty > 0 && allSelected;

  const handleProceed = () => {
    const selectedItems = Object.entries(selections).map(([cat, name]) => ({
      category: cat,
      productName: name,
      productData: subProducts[name]?.data,
    }));

    localStorage.setItem(
      "comboSelectedItems",
      JSON.stringify({
        comboProductId: mainProduct?.id,
        comboProductName: mainProduct?.name,
        items: selectedItems.map(({ category, productName, productData }) => ({
          category,
          productName,
          image: getImageFilename(
            Array.isArray(productData?.images) ? productData.images[0] : null,
          ),
        })),
      }),
    );

    navigate(`/groceryCart/${userType}/${userId}`, {
      state: {
        comboProduct: mainProduct,
        comboQty: currentQty,
        selectedItems,
        mobileNumber,
      },
    });
  };

  // ── Grand-summary cart bar
  const CartBar = () => {
    const readAllCategories = () => {
      try {
        const raw = localStorage.getItem("allCategories");
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        return arr.filter(Boolean).map((cat) => ({
          ...cat,
          products: Array.isArray(cat?.products) ? cat.products : [],
        }));
      } catch {
        return [];
      }
    };

    const allCategories = readAllCategories();
    const summary = allCategories.reduce(
      (acc, cat) => {
        for (const p of cat.products) {
          const qty = Number(p?.qty) || 0;
          if (!qty) continue;
          const price =
            Number(p?.afterDiscountPrice ?? p?.price ?? p?.finalPrice ?? 0) ||
            0;
          acc.items += qty;
          acc.total += price * qty;
        }
        return acc;
      },
      { items: 0, total: 0 },
    );

    const items = summary.items;
    // const total = Math.round(summary.total);
    if (items === 0) return null;

    if (!mainProduct) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* <span style={{ fontSize: 40 }}>⚠️</span> */}
          <p style={{ fontWeight: 600, color: "#374151" }}>
            Product not found.
          </p>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "green",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 24px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Go Back
          </button>
        </div>
      );
    }
    // click on the image choose products and add the cart
    // return (
    //   <div
    //     style={{
    //       position: "fixed",
    //       bottom: 0, left: 0,
    //       width: "100%",
    //       backgroundColor: "green",
    //       color: "white",
    //       padding: "6px",
    //       display: "flex",
    //       justifyContent: "space-between",
    //       alignItems: "center",
    //       fontWeight: "bold",
    //       zIndex: 2000,
    //       borderRadius: "20px",
    //       marginBottom: "5px",
    //     }}
    //   >
    //     <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
    //       🛒
    //       <div style={{ display: "flex", flexDirection: "column" }}>
    //         <span style={{ fontSize: "10px" }}>{items} items</span>
    //         <span style={{ fontSize: "10px" }}>₹{total}</span>
    //         {total < MIN_ORDER_TOTAL && (
    //           <span style={{ fontSize: "13px", opacity: 0.9, fontWeight: "bold" }}>
    //             Add ₹{MIN_ORDER_TOTAL - total} more to reach Minimum Order
    //           </span>
    //         )}
    //       </div>
    //     </div>
    //     <button
    //       type="button"
    //       style={{
    //         fontSize: "12px",
    //         cursor: total < MIN_ORDER_TOTAL ? "not-allowed" : "pointer",
    //         background: "transparent",
    //         border: "none",
    //         color: "white",
    //         fontWeight: "bold",
    //         opacity: total < MIN_ORDER_TOTAL ? 0.7 : 1,
    //       }}
    //       onClick={() => {
    //         if (total < MIN_ORDER_TOTAL) return;
    //         navigate(`/groceryCart/${userType}/${userId}`, { state: { mobileNumber } });
    //       }}
    //     >
    //       View Cart →
    //     </button>
    //   </div>
    // );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        fontFamily: "Roboto",
        paddingBottom: 90,
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "green",
          color: "white",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <ArrowBackIcon
          style={{ cursor: "pointer" }}
          onClick={() => navigate(-1)}
        />
        <span style={{ fontWeight: 700, fontSize: 16 }}>Product Details</span>
      </div>

      {/* Main product card */}
      <div
        style={{
          background: "#fff",
          margin: "16px 12px 0",
          borderRadius: 16,
          padding: 16,
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            position: "relative",
            textAlign: "center",
            marginBottom: 12,
          }}
        >
          {discountPct > 0 && !isOutOfStock && (
            <span
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                background: "#dc2626",
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
                borderRadius: "8px 0 8px 0",
                padding: "3px 8px",
              }}
            >
              {discountPct}% OFF
            </span>
          )}
          {mainImg ? (
            <img
              src={mainImg}
              alt={mainProduct?.name || ""}
              style={{
                maxHeight: 160,
                maxWidth: "100%",
                objectFit: "contain",
                borderRadius: 12,
              }}
            />
          ) : (
            <div
              style={{
                height: 180,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#9ca3af",
                fontSize: 14,
              }}
            >
              Loading image…
            </div>
          )}
        </div>

        <h5 style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
          {mainProduct?.name}
        </h5>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 8,
          }}
        >
          <span style={{ color: "#16a34a", fontWeight: 700, fontSize: 18 }}>
            ₹{afterDiscount}
          </span>
          {mrp > 0 && <s style={{ color: "#9ca3af", fontSize: 14 }}>₹{mrp}</s>}
          {mainProduct?.units && (
            <span
              style={{
                background: "#dcfce7",
                color: "#15803d",
                fontSize: 11,
                borderRadius: 6,
                padding: "2px 6px",
                fontWeight: 600,
              }}
            >
              {mainProduct.units}
            </span>
          )}
        </div>

        {isOutOfStock && (
          <div
            style={{
              background: "#fee2e2",
              color: "#dc2626",
              borderRadius: 8,
              padding: "6px 10px",
              fontWeight: 600,
              fontSize: 13,
              marginBottom: 8,
            }}
          >
            Out of Stock
          </div>
        )}
      </div>

      {/* Combo items */}
      {Object.keys(groups).length > 0 && (
        <div style={{ margin: "12px" }}>
          <h6
            style={{
              fontWeight: 700,
              fontSize: 14,
              color: "#374151",
              marginBottom: 5,
            }}
          >
            📦 Combo Includes — Choose Your Preference
          </h6>
          {Object.entries(groups).map(([cat, names]) => (
            <div
              key={cat}
              style={{
                background: "#fff",
                borderRadius: 14,
                padding: 10,
                marginBottom: 10,
                boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    background: "#ffffff",
                    color: "#16a34a",
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: 20,
                    padding: "3px 10px",
                  }}
                >
                  {cat}
                </span>
                {names.length > 1 && (
                  <span style={{ fontSize: 12, color: "#dc2626" }}>
                    Select any one
                  </span>
                )}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {names.map((name) => (
                  <SubProductCard
                    key={name}
                    name={name}
                    selected={selections[cat] === name}
                    onSelect={() => handleSelect(cat, name)}
                    image={subProducts[name]?.image}
                    loading={subProducts[name]?.loading}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom bar — ADD / counter + Proceed */}
      {!isOutOfStock && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100%",
            background: "#fff",
            borderTop: "1px solid #e5e7eb",
            padding: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 200,
            boxShadow: "0 -2px 12px rgba(0,0,0,0.08)",
            gap: 12,
            marginBottom: "30px",
          }}
        >
          {/* Qty selector — mirrors page 1 ADD / counter */}
          <div>
            {currentQty === 0 ? (
              <button
                onClick={handleAddClick}
                style={{
                  border: "2px solid green",
                  background: "#f0fdf4",
                  color: "green",
                  borderRadius: 10,
                  padding: "8px 24px",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: "pointer",
                }}
              >
                ADD
              </button>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "green",
                  borderRadius: 10,
                  padding: "4px 6px",
                  gap: 12,
                }}
              >
                <button
                  onClick={handleDecrementClick}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 20,
                    cursor: "pointer",
                    lineHeight: 1,
                    width: 28,
                  }}
                >
                  –
                </button>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>
                  {currentQty}
                </span>
                <button
                  onClick={() =>
                    canAddMore(mainProduct?.id) && handleIncrement()
                  }
                  disabled={!canAddMore(mainProduct?.id)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: canAddMore(mainProduct?.id)
                      ? "#fff"
                      : "rgba(255,255,255,0.4)",
                    fontWeight: 700,
                    fontSize: 20,
                    cursor: canAddMore(mainProduct?.id)
                      ? "pointer"
                      : "not-allowed",
                    lineHeight: 1,
                    width: 28,
                  }}
                  title={
                    !canAddMore(mainProduct?.id)
                      ? stockLeft <= currentQty
                        ? "No more stock"
                        : `Limit ${getLimit(mainProduct)} per customer`
                      : "Add one"
                  }
                >
                  +
                </button>
              </div>
            )}
          </div>

          {/* Proceed button */}
          <button
            onClick={handleProceed}
            disabled={!canProceed}
            style={{
              flex: 1,
              background: canProceed ? "green" : "#d1d5db",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "12px 0",
              fontWeight: 700,
              fontSize: 15,
              cursor: canProceed ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {currentQty === 0
              ? "Add to proceed"
              : !allSelected
                ? "Select all items"
                : `Proceed → ₹${afterDiscount * currentQty}`}
          </button>
        </div>
      )}
      <CartBar />
    </div>
  );
};

export default GroceryComboOffer;
