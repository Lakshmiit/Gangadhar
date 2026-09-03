import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StorefrontIcon from "@mui/icons-material/Storefront";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import SearchIcon from "@mui/icons-material/Search";
import {
  getVendorProfileById,
  updateVendorProfile,
} from "./utils/vendorStorage";
import ImageCache from "./utils/ImageCache";
import { getGroceryItems } from "./utils/groceryStore";

// Same backend the customer-facing Profile page (and Admin grocery pages) use.
const API_BASE =
  "https://lmartapiv1-fxcyd2b4btacgsav.westus2-01.azurewebsites.net/api";
const ADD_GROCERY_ITEM = `${API_BASE}/UploadGrocery/UploadGrocery`;
const IMAGE_DOWNLOAD = `${API_BASE}/FileUpload/download?generatedfilename=`;
const IMAGE_UPLOAD = `${API_BASE}/FileUpload/upload?filename=`;
// Called directly here (bypassing utils/vendorListStore.js's cached
// normalizeVendor) so the limit-binding logic below is guaranteed to be
// the code actually running, regardless of any stale build/cache
// upstream. Same endpoint vendorListStore.js points at.
const GET_VENDOR_PRODUCTS_BY_VENDOR_ID = `${API_BASE}/VendorUploadProducts/GetVendorProductsvalues`;

// Same key VendorPreviewPage reads to show the "ready to submit" list —
// keep this string identical in both files.
const pendingCartKey = (vendorId) => `vendorPendingProducts_${vendorId}`;

const BARCODE_FORMATS = [
  "ean_13",
  "ean_8",
  "upc_a",
  "upc_e",
  "code_128",
  "code_39",
  "qr_code",
];

// Earthy, market-ledger palette used to color-code category ribbons —
// deterministic per category name so the same category always gets the same tone.
const CATEGORY_PALETTE = [
  "#2F6B4F",
  "#C08A2E",
  "#7C6A46",
  "#4C7A8C",
  "#8C5B4C",
  "#6B7C4C",
  "#A24B4B",
  "#3E5C76",
];
const colorForCategory = (name) => {
  const str = String(name || "");
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  return CATEGORY_PALETTE[hash % CATEGORY_PALETTE.length];
};

// Locally-generated fallback image (inline SVG data URI) — used only until
// the real photo loads, or if a product has no image at all. No external
// network call, so it never shows up broken.
const makePlaceholder = (text, bg = "adb5bd", fg = "ffffff") => {
  const safeText = String(text || "?").slice(0, 22);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='220'>
    <rect width='100%' height='100%' fill='#${bg}'/>
    <text x='50%' y='50%' font-family='Arial, sans-serif' font-size='26' font-weight='bold'
      fill='#${fg}' text-anchor='middle' dominant-baseline='middle'>${safeText}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const normalizeItem = (p) => ({
  ...p,
  stockLeft: Number(p.stockLeft || 0),
  limit: Number(p.limit || 0),
  mrp: Number(p.mrp || 0),
  discount: Number(p.discount || 0),
  afterDiscount: Number(p.afterDiscount || 0),
});

// Reads the RAW response from GetVendorProductsvalues directly — this page
// now fetches that endpoint itself (see fetchVendorProductsDirect below)
// instead of going through utils/vendorListStore.js's normalizeVendor, so
// there's no intermediate caching/normalization layer that could still be
// running stale code. Handles both a bare vendor object and an array
// containing one (some backends wrap a single result in an array).
// Field names match the confirmed live response exactly:
// { categorie: [{ categoryName, products: [{ productIds, quantity, limit, discount }] }] }
// but also tolerates the capitalized variants (Categorie/Products/
// ProductIds/Quantity/Limit/Discount) just in case the API casing ever
// changes. This is what feeds `pendingLimit`, which the "Per-customer
// limit" input below reads via getPendingLimit().
const extractSelectionFromVendorProducts = (vendorProductsRaw) => {
  const map = {};
  const qtyMap = {};
  const limitMap = {};
  const mrpMap = {};
  const priceMap = {};
  const vendorProducts = Array.isArray(vendorProductsRaw)
    ? vendorProductsRaw[0]
    : vendorProductsRaw;

  if (!vendorProducts) return { map, qtyMap, limitMap };

  const categories =
    vendorProducts.categorie ||
    vendorProducts.categories ||
    vendorProducts.Categorie ||
    [];

  categories.forEach((cat) => {
    const products = cat.products || cat.Products || [];
    products.forEach((p) => {
      const productId = p.productIds ?? p.productId ?? p.ProductIds;
      const qty = p.quantity ?? p.qty ?? p.Quantity;
      const discount = p.discount ?? p.Discount;
      const limit = p.limit ?? p.Limit;
      const mrp = p.mrp ?? p.Mrp;
      const price = p.price ?? p.Price ?? p.afterDiscount ?? p.AfterDiscount;
      if (!productId || !(Number(qty) > 0)) return;
      if (mrp !== undefined) mrpMap[productId] = Number(mrp);
      if (price !== undefined) priceMap[productId] = Number(price);
      map[productId] = { checked: true, discount: String(discount ?? "0") };
      qtyMap[productId] = Number(qty);
      limitMap[productId] = Number(limit ?? 0);
    });
  });

  return { map, qtyMap, limitMap, mrpMap, priceMap };
};

// Direct fetch, bypassing utils/vendorListStore.js's cache/normalizeVendor
// layer entirely — this guarantees the code above is what actually runs
// against the real response, independent of any stale cached bundle,
// sessionStorage entry, or service worker elsewhere in the app.
const fetchVendorProductsDirect = async (vendorId) => {
  const res = await fetch(
    `${GET_VENDOR_PRODUCTS_BY_VENDOR_ID}?vendorId=${encodeURIComponent(vendorId)}`,
  );
  if (res.status === 404) return null; // no submission yet — not an error
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  const data = await res.json();
  return data;
};

const EMPTY_ADD_FORM = {
  name: "",
  category: "",
  newCategory: "",
  code: "",
  mrp: "",
  discount: "0",
  units: "",
  deliveryIn: "30",
  stockLeft: "0",
  limit: "",
};

const VendorStockUpdatePage = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();

  const [vendor, setVendor] = useState(null);
  const [items, setItems] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pendingLimit, setPendingLimit] = useState({});

  // null = show categories only. Set to a category name (or "All") to view products.
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Locally tracked submission quantities — start at 0. As soon as a
  // product's quantity goes above 0 it's automatically added to the
  // submit-for-approval payload; dropping it back to 0 automatically
  // removes it again. No separate "save" step needed.
  const [pendingQty, setPendingQty] = useState({});
  const [showVendorMenu, setShowVendorMenu] = useState(false);

  // ---- Edit vendor info modal state ----
  const [showEditVendorModal, setShowEditVendorModal] = useState(false);
  const [editVendorForm, setEditVendorForm] = useState(null);
  const [editVendorSaving, setEditVendorSaving] = useState(false);
  const [editVendorError, setEditVendorError] = useState("");

  // ---- Add New Product modal state ----
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_ADD_FORM);
  const [addPhoto, setAddPhoto] = useState(null);
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState("");
  const [codeMode, setCodeMode] = useState("manual"); // "manual" | "scan"
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanFrameRef = useRef(null);
  const [pendingMrp, setPendingMrp] = useState({});
  const [pendingPrice, setPendingPrice] = useState({});
  const [mrpInputText, setMrpInputText] = useState({});
  const [priceInputText, setPriceInputText] = useState({});
  const [selection, setSelection] = useState({});
  const hydratedSelectionRef = useRef(false);
  const hydratedBackendRef = useRef(false);
  const [qtyInputText, setQtyInputText] = useState({});
  const originalValuesRef = useRef({});
  const getPendingMrp = (item) => Number(pendingMrp[item.id] ?? item.mrp ?? 0);

  const getPendingPrice = (item) =>
    Number(pendingPrice[item.id] ?? item.afterDiscount ?? item.mrp ?? 0);

  const handleMrpInputChange = (itemId, rawValue) => {
    setMrpInputText((prev) => ({ ...prev, [itemId]: rawValue }));
    const next = Math.max(0, Number(rawValue) || 0);
    setPendingMrp((prev) => ({ ...prev, [itemId]: next }));
  };

  const handlePriceInputChange = (itemId, rawValue) => {
    setPriceInputText((prev) => ({ ...prev, [itemId]: rawValue }));
    const next = Math.max(0, Number(rawValue) || 0);
    setPendingPrice((prev) => ({ ...prev, [itemId]: next }));
  };

  const getMrpDisplayValue = (item) => {
    if (mrpInputText[item.id] !== undefined) return mrpInputText[item.id];
    const mrp = getPendingMrp(item);
    return mrp === 0 ? "" : mrp;
  };

  const getPriceDisplayValue = (item) => {
    if (priceInputText[item.id] !== undefined) return priceInputText[item.id];
    const price = getPendingPrice(item);
    return price === 0 ? "" : price;
  };

  // Vendor session check.
  useEffect(() => {
    const sessionId = localStorage.getItem("vendorSession");
    if (!sessionId || sessionId !== vendorId) {
      navigate("/vendor/login");
      return;
    }
    const vendorProfile = getVendorProfileById(vendorId);
    if (!vendorProfile) {
      navigate("/vendor/login");
      return;
    }
    setVendor(vendorProfile);
  }, [vendorId, navigate]);

  const openEditVendorModal = () => {
    if (!vendor) return;
    setEditVendorForm({
      name: vendor.name || "",
      storeName: vendor.storeName || "",
      phone: vendor.phone || "",
      email: vendor.email || "",
      address: vendor.address || "",
    });
    setEditVendorError("");
    setShowEditVendorModal(true);
  };

  const handleEditVendorFieldChange = (field, value) => {
    setEditVendorForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveVendorInfo = (event) => {
    event.preventDefault();
    if (!editVendorForm) return;
    if (!editVendorForm.name.trim() || !editVendorForm.phone.trim()) {
      setEditVendorError("Name and phone are required.");
      return;
    }
    setEditVendorSaving(true);
    setEditVendorError("");
    try {
      const updated = updateVendorProfile(vendorId, {
        name: editVendorForm.name.trim(),
        storeName: editVendorForm.storeName.trim(),
        phone: editVendorForm.phone.trim(),
        email: editVendorForm.email.trim(),
        address: editVendorForm.address.trim(),
      });
      if (updated) {
        setVendor(updated);
        setShowEditVendorModal(false);
        setMessage("Vendor information updated.");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setEditVendorError("Unable to save changes. Please try again.");
      }
    } catch (err) {
      console.error("Failed to update vendor info", err);
      setEditVendorError("Unable to save changes. Please try again.");
    } finally {
      setEditVendorSaving(false);
    }
  };

  const fetchItems = async (showLoader = false, force = false) => {
    if (showLoader) setLoading(true);
    setError("");
    try {
      // Shared cache with Profile/Vendor-preview pages. Pass force=true
      // after a mutation (add/update stock) so this page — and every page
      // that reads the catalog afterward — gets the fresh data.
      const data = await getGroceryItems({ force });
      const normalized = (Array.isArray(data) ? data : []).map(normalizeItem);
      setItems(normalized);
      // Submission quantities/limits are a standing selection, not a delta
      // against live stock, so they deliberately survive a catalog refresh.
    } catch (err) {
      console.error("Failed to fetch grocery items", err);
      setError("Unable to load products right now. Please try again.");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    if (!vendor) return;
    fetchItems(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendor]);

  // ---- Hydrate from the backend's already-submitted record (if any) ----
  useEffect(() => {
    if (!vendor || hydratedBackendRef.current) return;
    hydratedBackendRef.current = true;
    (async () => {
      try {
        const vendorProducts = await fetchVendorProductsDirect(vendorId);

        console.log(
          "RAW response from GetVendorProductsvalues:",
          JSON.stringify(vendorProducts, null, 2),
        );

        const { map, qtyMap, limitMap, mrpMap, priceMap } =
          extractSelectionFromVendorProducts(vendorProducts);
        const baseline = {};
        Object.keys(map).forEach((productId) => {
          baseline[productId] = {
            quantity: String(qtyMap[productId] ?? 0),
            discount: String(map[productId]?.discount ?? "0"),
            limit: String(limitMap[productId] ?? 0),
            mrp: String(mrpMap[productId] ?? ""),
            price: String(priceMap[productId] ?? ""),
          };
        });
        originalValuesRef.current = baseline;

        if (Object.keys(map).length)
          setSelection((prev) => ({ ...map, ...prev }));
        if (Object.keys(qtyMap).length)
          setPendingQty((prev) => ({ ...qtyMap, ...prev }));
        if (Object.keys(limitMap).length)
          setPendingLimit((prev) => ({ ...limitMap, ...prev }));
        if (Object.keys(mrpMap).length)
          setPendingMrp((prev) => ({ ...mrpMap, ...prev }));
        if (Object.keys(priceMap).length)
          setPendingPrice((prev) => ({ ...priceMap, ...prev }));
      } catch (err) {
        // No submission yet (404) or a network hiccup — fine, just start
        // from whatever the localStorage draft below provides (or blank).
        console.error(
          "Failed to load vendor's existing submitted products",
          err,
        );
      }
    })();
  }, [vendor, vendorId]);

  // A product is "updated" if either:
  //  (a) it's a brand-new selection not present in the backend's last
  //      submitted record, OR
  //  (b) it IS in the backend record but at least one editable field
  //      (quantity/discount/limit/mrp/price) differs from that baseline.
  const isProductUpdated = (item) => {
    const baseline = originalValuesRef.current[item.id];

    const current = {
      quantity: String(pendingQty[item.id] || 0),
      discount: String(selection[item.id]?.discount ?? item.discount ?? 0),
      limit: String(pendingLimit[item.id] ?? item.limit ?? 0),
      mrp: String(pendingMrp[item.id] ?? item.mrp ?? 0),
      price: String(
        pendingPrice[item.id] ?? item.afterDiscount ?? item.mrp ?? 0,
      ),
    };

    if (!baseline) return true; // never submitted before -> it's new/updated

    return (
      current.quantity !== baseline.quantity ||
      current.discount !== baseline.discount ||
      current.limit !== baseline.limit ||
      current.mrp !== baseline.mrp ||
      current.price !== baseline.price
    );
  };

  // Restore any products the vendor already checked/discounted/limited last
  // time they were on this page, so the cart survives navigation/reloads.
  // This is the OVERLAY layer: it merges on top of (and, for shared product
  // ids, overrides) whatever the backend hydration above already set.
  useEffect(() => {
    if (hydratedSelectionRef.current || !items.length) return;
    hydratedSelectionRef.current = true;
    try {
      const raw = localStorage.getItem(pendingCartKey(vendorId));
      if (!raw) return;
      const saved = JSON.parse(raw);
      const map = {};
      const qtyMap = {};
      const limitMap = {};
      const mrpMap = {};
      const priceMap = {};
      (saved.categorie || []).forEach((cat) => {
        (cat.products || []).forEach((p) => {
          if (p?.productIds) {
            map[p.productIds] = {
              checked: true,
              discount: String(p.discount ?? "0"),
            };
            qtyMap[p.productIds] = Number(p.quantity || 0);
            limitMap[p.productIds] = Number(p.limit ?? 0);
            if (p.mrp !== undefined) mrpMap[p.productIds] = Number(p.mrp);
            if (p.price !== undefined) priceMap[p.productIds] = Number(p.price);
          }
        });
      });
      if (Object.keys(map).length)
        setSelection((prev) => ({ ...prev, ...map }));
      if (Object.keys(qtyMap).length)
        setPendingQty((prev) => ({ ...prev, ...qtyMap }));
      if (Object.keys(limitMap).length)
        setPendingLimit((prev) => ({ ...prev, ...limitMap }));
      if (Object.keys(mrpMap).length)
        setPendingMrp((prev) => ({ ...mrpMap, ...prev }));
      if (Object.keys(priceMap).length)
        setPendingPrice((prev) => ({ ...priceMap, ...prev }));
    } catch (err) {
      // ignore malformed/old local cart
    }
  }, [items, vendorId]);

  // Auto-construct the submission payload from whichever products currently
  // have a quantity greater than 0, and auto-save it to localStorage in the
  // exact shape vendorUploadProducts expects — every time quantity,
  // discount, or limit changes, no separate "save" step. Dropping a
  // product's quantity back to 0 drops it out of this payload automatically.
  useEffect(() => {
    if (!vendor) return;
    const selectedItems = items.filter(
      (it) => !!selection[it.id]?.checked && isProductUpdated(it),
    );
    const categorieMap = {};
    selectedItems.forEach((item) => {
      const categoryName = item.category || "Unspecified";
      if (!categorieMap[categoryName]) categorieMap[categoryName] = [];
      categorieMap[categoryName].push({
        productIds: String(item.id || ""),
        quantity: String(pendingQty[item.id] || 0),
        discount: String(selection[item.id]?.discount ?? item.discount ?? 0),
        limit: String(pendingLimit[item.id] ?? item.limit ?? 0),
        mrp: String(pendingMrp[item.id] ?? item.mrp ?? 0),
        price: String(
          pendingPrice[item.id] ?? item.afterDiscount ?? item.mrp ?? 0,
        ),
      });
    });
    const payload = {
      id: "",
      vendorId: String(vendorId || ""),
      storeName: vendor.storeName || vendor.name || "",
      status: "Pending",
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      pincodes: Array.isArray(vendor.pincodes) ? vendor.pincodes : [],
      categorie: Object.keys(categorieMap).map((categoryName) => ({
        categoryName,
        products: categorieMap[categoryName],
      })),
    };
    try {
      localStorage.setItem(pendingCartKey(vendorId), JSON.stringify(payload));
    } catch (err) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selection,
    pendingQty,
    pendingLimit,
    pendingMrp,
    pendingPrice,
    items,
    vendor,
    vendorId,
  ]);

  // Same image-loading pattern as GroceryItems.js / ProfilePage.js:
  // check IndexedDB cache first, otherwise download + cache.
  useEffect(() => {
    if (!items.length) return;
    const controller = new AbortController();
    let cancelled = false;

    (async () => {
      for (const item of items) {
        const filename = Array.isArray(item.images) ? item.images[0] : null;
        if (!filename || imageUrls[item.id]) continue;
        try {
          const cached = await ImageCache.getBase64(filename);
          if (cancelled) return;
          if (cached) {
            setImageUrls((prev) => ({
              ...prev,
              [item.id]: `data:image/jpeg;base64,${cached}`,
            }));
            continue;
          }
          const res = await fetch(
            `${IMAGE_DOWNLOAD}${encodeURIComponent(filename)}`,
            {
              signal: controller.signal,
            },
          );
          const json = await res.json();
          const b64 = json?.imageData || "";
          if (!b64 || cancelled) continue;
          await ImageCache.setBase64(filename, b64);
          if (!cancelled) {
            setImageUrls((prev) => ({
              ...prev,
              [item.id]: `data:image/jpeg;base64,${b64}`,
            }));
          }
        } catch (e) {
          // ignore aborted/failed image fetch — card falls back to a placeholder
        }
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(items.map((i) => i.category || "Unspecified")),
    ).sort();
    return unique;
  }, [items]);

  const displayedItems = useMemo(() => {
    if (!selectedCategory) return [];
    let list =
      selectedCategory === "All"
        ? items
        : items.filter(
            (i) => (i.category || "Unspecified") === selectedCategory,
          );
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((i) => i.name?.toLowerCase().includes(q));
    }
    return list;
  }, [items, selectedCategory, searchQuery]);

  const totalProducts = items.length;
  const totalStock = items.reduce(
    (sum, item) => sum + Number(item.stockLeft || 0),
    0,
  );
  const dirtyIds = useMemo(
    () => Object.keys(pendingQty).filter((id) => Number(pendingQty[id]) > 0),
    [pendingQty],
  );

  const getCategoryImage = (category) => {
    if (category === "All") return makePlaceholder("All", "6c757d", "ffffff");
    const match = items.find(
      (i) => (i.category || "Unspecified") === category && imageUrls[i.id],
    );
    return match
      ? imageUrls[match.id]
      : makePlaceholder(category, "adb5bd", "ffffff");
  };

  const getProductImage = (item) =>
    imageUrls[item.id] || makePlaceholder(item.name, "adb5bd", "ffffff");

  const getPendingQty = (itemId) => Number(pendingQty[itemId] || 0);

  const isSelectedForSubmission = (itemId) => !!selection[itemId]?.checked;
  const getSelectionDiscount = (item) =>
    selection[item.id]?.discount ?? String(item.discount ?? 0);

  const getPendingLimit = (item) =>
    Number(pendingLimit[item.id] ?? item.limit ?? 0);

  const toggleSelectForSubmission = (item) => {
    const currentlyChecked = !!selection[item.id]?.checked;

    if (currentlyChecked) {
      setSelection((prev) => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
      setPendingQty((prev) => ({ ...prev, [item.id]: 0 }));
      setQtyInputText((prev) => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
    } else {
      // Check: mark it selected for submission — do NOT force quantity to 1.
      // Quantity stays whatever it currently is (0 if untouched).
      setSelection((prev) => ({
        ...prev,
        [item.id]: {
          checked: true,
          discount: prev[item.id]?.discount ?? String(item.discount ?? 0),
        },
      }));
    }
  };

  const getCategoryItems = (category) => {
    return items.filter(
      (item) => (item.category || "Unspecified") === category,
    );
  };

  const isCategorySelected = (category) => {
    const categoryItems = getCategoryItems(category);
    if (categoryItems.length === 0) return false;
    return categoryItems.every((item) => !!selection[item.id]?.checked);
  };

  const toggleCategorySelection = (category) => {
    const categoryItems = getCategoryItems(category);
    const shouldSelect = !isCategorySelected(category);

    setSelection((prevSelection) => {
      const nextSelection = { ...prevSelection };
      categoryItems.forEach((item) => {
        if (shouldSelect) {
          nextSelection[item.id] = {
            checked: true,
            discount: String(
              prevSelection[item.id]?.discount ?? item.discount ?? 0,
            ),
          };
        } else {
          delete nextSelection[item.id];
        }
      });
      return nextSelection;
    });

    if (!shouldSelect) {
      // Unselecting the category also resets those items' restock qty to 0.
      setPendingQty((prevQty) => {
        const nextQty = { ...prevQty };
        categoryItems.forEach((item) => {
          nextQty[item.id] = 0;
        });
        return nextQty;
      });
    }
    // Selecting the category leaves quantities as-is (default 0).
  };

  // ---- Direct-typing handlers for the plain number inputs ----
  const handleQtyInputChange = (itemId, rawValue, item) => {
    // Keep exactly what the user typed for display (allows "0", "", "05" while typing)
    setQtyInputText((prev) => ({ ...prev, [itemId]: rawValue }));

    const next = Math.max(0, Number(rawValue) || 0);
    setPendingQty((prev) => ({ ...prev, [itemId]: next }));
    setSelection((prevSel) => {
      if (next > 0) {
        const current = prevSel[itemId];
        return {
          ...prevSel,
          [itemId]: {
            checked: true,
            discount: current?.discount ?? String(item?.discount ?? 0),
          },
        };
      }
      if (!prevSel[itemId]) return prevSel;
      const nextSel = { ...prevSel };
      delete nextSel[itemId];
      return nextSel;
    });
  };

  const getQtyDisplayValue = (itemId) => {
    // If the user has typed something (even "0"), show exactly that.
    if (qtyInputText[itemId] !== undefined) return qtyInputText[itemId];
    // Otherwise fall back to the numeric state (blank if 0/untouched).
    const qty = getPendingQty(itemId);
    return qty === 0 ? "" : qty;
  };

  const handleLimitInputChange = (itemId, rawValue, item) => {
    const liveStock = Number(item.stockLeft || 0);
    const next = Math.max(0, Math.min(Number(rawValue) || 0, liveStock));
    setPendingLimit((prev) => ({ ...prev, [itemId]: next }));
  };

  const updateSelectionDiscount = (item, value) => {
    setSelection((prev) => ({
      ...prev,
      [item.id]: {
        checked: !!prev[item.id]?.checked, // <-- was: getPendingQty(item.id) > 0
        discount: value,
      },
    }));
  };

  const selectedForSubmissionCount = useMemo(
    () => Object.values(selection).filter((s) => s?.checked).length,
    [selection],
  );

  const handleRefresh = () => {
    fetchItems(true, true); // explicit user refresh — bypass the shared cache
    setShowVendorMenu(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("vendorSession");
    navigate("/vendor/login");
  };

  const handlePreview = () => {
    // Preview the vendor's own profile, not the customer-facing profile.
    navigate(`/vendor/preview/${vendorId}`);
  };

  const handleBackToProfile = () => {
    navigate(`/profilePage/customer/${vendorId}`);
  };

  const handleCategorySelect = (category) => {
    if (category !== "All") {
      const key = `vendorSelectedCategories-${vendorId}`;
      const previous = JSON.parse(localStorage.getItem(key) || "[]");
      if (!previous.includes(category))
        localStorage.setItem(key, JSON.stringify([...previous, category]));
    }
    setSelectedCategory(category);
  };

  // ---- Barcode scanning ----
  const stopScan = () => {
    if (scanFrameRef.current) {
      cancelAnimationFrame(scanFrameRef.current);
      scanFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  const startScan = async () => {
    setScanError("");
    if (!("BarcodeDetector" in window)) {
      setScanError(
        "Live barcode scanning isn't supported in this browser. Try Chrome on Android or desktop Chrome, or enter the code manually.",
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);

      // eslint-disable-next-line no-undef
      const detector = new BarcodeDetector({ formats: BARCODE_FORMATS });

      const tick = async () => {
        if (!videoRef.current || !streamRef.current) return;
        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes.length > 0) {
            const value = barcodes[0].rawValue;
            setAddForm((prev) => ({ ...prev, code: value }));
            stopScan();
            return;
          }
        } catch (e) {
          // detection hiccup — keep trying on next frame
        }
        scanFrameRef.current = requestAnimationFrame(tick);
      };
      scanFrameRef.current = requestAnimationFrame(tick);
    } catch (err) {
      console.error("Camera access failed", err);
      setScanError(
        "Couldn't access the camera. Check permissions, or enter the code manually.",
      );
    }
  };

  useEffect(() => {
    // Stop the camera whenever the modal closes or the mode switches away from scanning.
    if (!showAddModal || codeMode !== "scan") {
      stopScan();
    }
    return () => stopScan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAddModal, codeMode]);

  // ---- Add New Product ----
  const openAddModal = () => {
    setAddForm(EMPTY_ADD_FORM);
    setAddPhoto(null);
    setAddError("");
    setCodeMode("manual");
    setShowAddModal(true);
    setShowVendorMenu(false);
  };

  const closeAddModal = () => {
    stopScan();
    setShowAddModal(false);
  };

  const updateAddForm = (field, value) => {
    setAddForm((prev) => ({ ...prev, [field]: value }));
  };

  const getFileByteArray = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(new Uint8Array(reader.result));
      reader.readAsArrayBuffer(file);
    });

  const uploadAddPhoto = async (file) => {
    try {
      const byteArray = await getFileByteArray(file);
      const formData = new FormData();
      formData.append(
        "file",
        new Blob([byteArray], { type: file.type }),
        file.name,
      );
      formData.append("fileName", file.name);
      const response = await fetch(`${IMAGE_UPLOAD}${file.name}`, {
        method: "POST",
        headers: { Accept: "text/plain" },
        body: formData,
      });
      const responseData = await response.text();
      return responseData || "";
    } catch (err) {
      console.error("Photo upload failed", err);
      return "";
    }
  };

  const validateAddForm = () => {
    const finalCategory =
      addForm.category === "__new__"
        ? addForm.newCategory.trim()
        : addForm.category;
    if (!addForm.name.trim()) return "Product name is required.";
    if (!finalCategory) return "Category is required.";
    if (!addForm.units.trim()) return "Units are required (e.g. 1kg, 500ml).";
    if (!addForm.code.trim())
      return "Product code is required — scan a barcode or enter one manually.";
    if (!addForm.mrp || isNaN(addForm.mrp))
      return "A valid price (MRP) is required.";
    if (addForm.discount === "" || isNaN(addForm.discount))
      return "A valid discount is required (0 if none).";
    if (!addForm.deliveryIn.toString().trim())
      return "Delivery time (minutes) is required.";
    if (addForm.stockLeft === "" || isNaN(addForm.stockLeft))
      return "A valid starting stock quantity is required.";
    return null;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateAddForm();
    if (validationError) {
      setAddError(validationError);
      return;
    }
    setAddError("");
    setAddSaving(true);
    try {
      let images = [];
      if (addPhoto) {
        const src = await uploadAddPhoto(addPhoto);
        if (src) images = [src];
      }
      const finalCategory =
        addForm.category === "__new__"
          ? addForm.newCategory.trim()
          : addForm.category;
      const mrp = parseFloat(addForm.mrp);
      const discount = parseFloat(addForm.discount || 0);
      const payload = {
        id: "unique-id",
        date: new Date().toISOString(),
        GroceryItemId: "string",
        name: addForm.name.trim(),
        category: finalCategory,
        images,
        mrp: mrp.toString(),
        discount: discount.toString(),
        afterDiscount: (mrp - (mrp * discount) / 100).toString(),
        stockLeft: addForm.stockLeft,
        deliveryIn: addForm.deliveryIn,
        status: "Pending Approval",
        requestedBy: vendor?.name || "Vendor",
        Code: addForm.code.trim(),
        Units: addForm.units.trim(),
        ManufactureDate: "",
        ExpireDate: "",
        Limit: addForm.limit ? addForm.limit.toString() : "",
      };
      const response = await fetch(ADD_GROCERY_ITEM, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Add product request failed");

      setMessage(`"${addForm.name}" submitted (pending approval).`);
      setTimeout(() => setMessage(""), 4000);
      setShowAddModal(false);
      fetchItems(true, true); // just mutated the catalog — force past the cache
    } catch (err) {
      console.error("Failed to add product", err);
      setAddError("Unable to add this product right now. Please try again.");
    } finally {
      setAddSaving(false);
    }
  };

  if (!vendor) {
    return null;
  }

  return (
    <div className="vsu-page" style={{ position: "relative" }}>
      <div className="container py-4">
        {/* Back to Preview */}
        <button
          type="button"
          className="vsu-back-btn mb-3"
          onClick={handlePreview}
        >
          <ArrowBackIcon fontSize="small" /> Back to Preview
        </button>

        {/* Header */}
        <div className="vsu-header p-4 p-md-5 mb-4">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="vsu-avatar">
                {vendor.name?.charAt(0)?.toUpperCase() || "V"}
              </div>
              <div>
                <h2 className="vsu-title mb-1" style={{ fontSize: "28px" }}>
                  {vendor.name}
                </h2>
                {vendor.storeName && (
                  <p
                    className="mb-1"
                    style={{ opacity: 0.85, fontSize: "14px" }}
                  >
                    {vendor.storeName}
                  </p>
                )}
                <p className="mb-2" style={{ opacity: 0.85, fontSize: "14px" }}>
                  {vendor.email} · {vendor.phone}
                </p>
                {vendor.address && (
                  <p
                    className="mb-2"
                    style={{ opacity: 0.75, fontSize: "13px" }}
                  >
                    {vendor.address}
                  </p>
                )}
                <span className="vsu-pill">
                  <StorefrontIcon style={{ fontSize: "14px" }} /> Vendor stock
                  manager
                </span>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-sm vsu-btn-gold-outline"
              onClick={openEditVendorModal}
            >
              Edit
            </button>
          </div>
        </div>

        {showEditVendorModal && editVendorForm && (
          <div
            className="vsu-modal-backdrop"
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 1050,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
            }}
            onClick={() => !editVendorSaving && setShowEditVendorModal(false)}
          >
            <div
              className="bg-white rounded-4 shadow-lg p-4"
              style={{ width: "100%", maxWidth: "480px" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Edit vendor information</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => setShowEditVendorModal(false)}
                  disabled={editVendorSaving}
                />
              </div>

              <form onSubmit={handleSaveVendorInfo}>
                <div className="mb-3">
                  <label className="form-label">Owner name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editVendorForm.name}
                    onChange={(e) =>
                      handleEditVendorFieldChange("name", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Store name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editVendorForm.storeName}
                    onChange={(e) =>
                      handleEditVendorFieldChange("storeName", e.target.value)
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={editVendorForm.phone}
                    onChange={(e) =>
                      handleEditVendorFieldChange("phone", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={editVendorForm.email}
                    onChange={(e) =>
                      handleEditVendorFieldChange("email", e.target.value)
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Address</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={editVendorForm.address}
                    onChange={(e) =>
                      handleEditVendorFieldChange("address", e.target.value)
                    }
                  />
                </div>

                {editVendorError && (
                  <div className="alert alert-danger py-2">
                    {editVendorError}
                  </div>
                )}

                <div className="d-flex gap-2 justify-content-end">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowEditVendorModal(false)}
                    disabled={editVendorSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn vsu-btn-primary"
                    disabled={editVendorSaving}
                  >
                    {editVendorSaving ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4">
            <div className="vsu-stat-card">
              <div
                className="vsu-stat-icon"
                style={{
                  background: "linear-gradient(135deg,#1B4332,#2F6B4F)",
                }}
              >
                <Inventory2Icon fontSize="small" />
              </div>
              <div>
                <div className="vsu-stat-value">{totalProducts}</div>
                <div className="vsu-stat-label">Total products</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="vsu-stat-card">
              <div
                className="vsu-stat-icon"
                style={{
                  background: "linear-gradient(135deg,#3E5C76,#4C7A8C)",
                }}
              >
                <LocalShippingIcon fontSize="small" />
              </div>
              <div>
                <div className="vsu-stat-value">{totalStock}</div>
                <div className="vsu-stat-label">Total live stock</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="vsu-stat-card">
              <div
                className="vsu-stat-icon"
                style={{
                  background: "linear-gradient(135deg,#C08A2E,#E0AE52)",
                }}
              >
                <PendingActionsIcon fontSize="small" />
              </div>
              <div>
                <div className="vsu-stat-value">{dirtyIds.length}</div>
                <div className="vsu-stat-label">Pending restock entries</div>
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div className="alert alert-success rounded-4 border-0 shadow-sm">
            {message}
          </div>
        )}
        {error && (
          <div className="alert alert-danger rounded-4 border-0 shadow-sm">
            {error}
          </div>
        )}

        {/* ---- Categories-only landing view ---- */}
        {!selectedCategory ? (
          <div className="mb-4">
            <h3 className="vsu-section-heading mb-1">Choose a category</h3>
            <p className="text-muted mb-3">
              Select a category to view and restock its products.
            </p>

            {loading ? (
              <div className="vsu-empty">
                <div
                  className="spinner-border text-success mb-2"
                  role="status"
                  style={{ width: "2rem", height: "2rem" }}
                />
                <p className="mb-0">Gathering today's stock...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="vsu-empty">
                <p className="mb-1 fw-bold">No categories yet</p>
                <p className="mb-0">
                  Add your first product to start building out your catalog.
                </p>
              </div>
            ) : (
              <div className="d-flex flex-wrap gap-3">
                <div
                  className="vsu-cat-tile"
                  onClick={() => handleCategorySelect("All")}
                >
                  <div
                    className="vsu-cat-ribbon"
                    style={{ background: "#16311F" }}
                  />
                  <div className="vsu-cat-body">
                    <img
                      loading="lazy"
                      decoding="async"
                      src={getCategoryImage("All")}
                      alt="All"
                      className="vsu-cat-img"
                    />
                    <span className="vsu-cat-label">All Products</span>
                  </div>
                </div>
                {categories.map((category) => (
                  <div
                    key={category}
                    className="vsu-cat-tile position-relative"
                    onClick={() => handleCategorySelect(category)}
                  >
                    <label
                      className="position-absolute d-flex align-items-center justify-content-center"
                      style={{
                        top: "8px",
                        left: "8px",
                        zIndex: 10,
                        background: "#fff",
                        borderRadius: "6px",
                        width: "28px",
                        height: "28px",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                        cursor: "pointer",
                      }}
                      onClick={(e) => e.stopPropagation()}
                      title={`Select all ${category} products`}
                    >
                      <input
                        type="checkbox"
                        className="form-check-input m-0"
                        style={{
                          width: "18px",
                          height: "18px",
                          cursor: "pointer",
                        }}
                        checked={isCategorySelected(category)}
                        onChange={() => toggleCategorySelection(category)}
                      />
                    </label>
                    <div
                      className="vsu-cat-ribbon"
                      style={{ background: colorForCategory(category) }}
                    />
                    <div className="vsu-cat-body">
                      <img
                        loading="lazy"
                        decoding="async"
                        src={getCategoryImage(category)}
                        alt={category}
                        className="vsu-cat-img"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = makePlaceholder(
                            category,
                            "adb5bd",
                            "ffffff",
                          );
                        }}
                      />
                      <span className="vsu-cat-label">{category}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ---- Product view for the selected category ---- */
          <div>
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
              <button
                className="vsu-back-btn"
                onClick={() => setSelectedCategory(null)}
              >
                <ArrowBackIcon fontSize="small" /> All Categories
              </button>
              <h5 className="vsu-section-heading mb-0">
                {selectedCategory === "All" ? "All Products" : selectedCategory}
              </h5>
              <div className="d-flex align-items-center gap-2">
                {selectedForSubmissionCount > 0 && (
                  <span className="badge bg-success">
                    {selectedForSubmissionCount} selected for submission
                  </span>
                )}
                <div className="vsu-search-wrap">
                  <SearchIcon className="vsu-search-icon" />
                  <input
                    type="text"
                    className="form-control form-control-sm vsu-search"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ maxWidth: "220px" }}
                  />
                </div>
              </div>
            </div>

            {displayedItems.length === 0 ? (
              <div className="vsu-empty">
                <p className="mb-1 fw-bold">Nothing here yet</p>
                <p className="mb-0">
                  Try a different category, clear your search, or add a new
                  product.
                </p>
              </div>
            ) : (
              <div className="d-flex flex-wrap gap-3 mb-4">
                {displayedItems.map((item) => {
                  const liveStock = Number(item.stockLeft || 0);
                  // const restockQty = getPendingQty(item.id);
                  const restockLimit = getPendingLimit(item);
                  const isOutOfStock = liveStock <= 0;
                  return (
                    <div
                      key={item.id}
                      className={`vsu-product-card position-relative ${isSelectedForSubmission(item.id) ? "border-success border-2" : ""}`}
                      style={{ opacity: isOutOfStock ? 0.85 : 1 }}
                    >
                      <label
                        className="position-absolute d-flex align-items-center justify-content-center"
                        style={{
                          top: 6,
                          left: 6,
                          zIndex: 3,
                          background: "#fff",
                          borderRadius: "50%",
                          width: "22px",
                          height: "22px",
                          border: "1px solid rgba(0,0,0,0.08)",
                          cursor: "pointer",
                        }}
                        title="Select for submission"
                      >
                        <input
                          type="checkbox"
                          className="form-check-input m-0"
                          style={{ width: "14px", height: "14px" }}
                          checked={isSelectedForSubmission(item.id)}
                          onChange={() => toggleSelectForSubmission(item)}
                        />
                      </label>

                      <div
                        className="d-flex justify-content-center align-items-center position-relative"
                        style={{ height: "90px" }}
                      >
                        <img
                          src={getProductImage(item)}
                          alt={item.name}
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = makePlaceholder(
                              item.name,
                              "adb5bd",
                              "ffffff",
                            );
                          }}
                          style={{
                            maxHeight: "80px",
                            maxWidth: "100%",
                            objectFit: "contain",
                            borderRadius: "6px",
                            backgroundColor: "#f5f5f5",
                          }}
                        />
                      </div>

                      <h6
                        className="text-start fw-bold m-0 mt-1"
                        style={{
                          fontSize: "11px",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          lineHeight: "1.2em",
                          maxHeight: "2.4em",
                        }}
                      >
                        {item.name}
                      </h6>
                      <small
                        className="text-muted"
                        style={{ fontSize: "10px" }}
                      >
                        {item.code}
                      </small>

                      <div
                        className="text-start"
                        style={{ fontSize: "12px", marginTop: "2px" }}
                      >
                        {item.afterDiscount != null && (
                          <b className="text-success me-2">
                            ₹{Math.round(Number(item.afterDiscount))}
                          </b>
                        )}
                        {item.mrp != null && (
                          <s className="text-muted">₹{item.mrp}</s>
                        )}
                      </div>

                      {/* ---- Submit quantity ---- */}
                      <div className="mt-2">
                        <div
                          className="d-flex justify-content-between align-items-center mb-1"
                          style={{ fontSize: "10px", color: "#6B7A70" }}
                        >
                          <span>Live: {liveStock}</span>
                          <span
                            className="fw-bold"
                            style={{ color: "#8a611c" }}
                          >
                            Restock
                          </span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          className="form-control form-control-sm"
                          style={{ fontSize: "12px" }}
                          value={getQtyDisplayValue(item.id)}
                          onChange={(e) =>
                            handleQtyInputChange(item.id, e.target.value, item)
                          }
                        />
                      </div>

                      {/* ---- Per-customer limit ---- */}
                      <div className="mt-2">
                        <div
                          className="d-flex justify-content-between align-items-center mb-1"
                          style={{ fontSize: "10px", color: "#6B7A70" }}
                        >
                          <span>Per-customer limit</span>
                          <span
                            className="fw-bold"
                            style={{ color: "#8a611c" }}
                          >
                            Submit Limit
                          </span>
                        </div>

                        <input
                          type="number"
                          min="0"
                          max={liveStock}
                          className="form-control form-control-sm"
                          style={{ fontSize: "12px" }}
                          value={restockLimit === 0 ? "" : restockLimit}
                          onChange={(e) =>
                            handleLimitInputChange(
                              item.id,
                              e.target.value,
                              item,
                            )
                          }
                        />

                        {liveStock > 0 &&
                          Number(restockLimit) >= liveStock &&
                          restockLimit !== "" && (
                            <div
                              style={{
                                fontSize: "9px",
                                color: "#dc3545",
                                fontWeight: 600,
                                textAlign: "center",
                                marginTop: 3,
                              }}
                            >
                              Maximum limit reached
                            </div>
                          )}
                      </div>

                      {/* ---- Submit discount ---- */}
                      <div className="mt-2">
                        <div
                          className="d-flex justify-content-between align-items-center mb-1"
                          style={{ fontSize: "10px", color: "#6B7A70" }}
                        >
                          <span>Submit discount</span>
                          {isSelectedForSubmission(item.id) && (
                            <span
                              className="fw-bold"
                              style={{ color: "#2F6B4F" }}
                            >
                              Selected
                            </span>
                          )}
                        </div>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            className="form-control form-control-sm"
                            style={{ fontSize: "11px" }}
                            placeholder="Discount %"
                            value={getSelectionDiscount(item)}
                            onChange={(e) =>
                              updateSelectionDiscount(item, e.target.value)
                            }
                          />
                          <span
                            className="input-group-text"
                            style={{ fontSize: "11px" }}
                          >
                            %
                          </span>
                        </div>
                      </div>
                      {/* ---- Submit MRP ---- */}
                      <div className="mt-2">
                        <div
                          className="d-flex justify-content-between align-items-center mb-1"
                          style={{ fontSize: "10px", color: "#6B7A70" }}
                        >
                          <span>MRP (₹)</span>
                          <span
                            className="fw-bold"
                            style={{ color: "#8a611c" }}
                          >
                            Edit MRP
                          </span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="form-control form-control-sm"
                          style={{ fontSize: "12px" }}
                          value={getMrpDisplayValue(item)}
                          onChange={(e) =>
                            handleMrpInputChange(item.id, e.target.value)
                          }
                        />
                      </div>

                      {/* ---- Submit Price (after discount) ---- */}
                      <div className="mt-2">
                        <div
                          className="d-flex justify-content-between align-items-center mb-1"
                          style={{ fontSize: "10px", color: "#6B7A70" }}
                        >
                          <span>Selling price (₹)</span>
                          <span
                            className="fw-bold"
                            style={{ color: "#8a611c" }}
                          >
                            Edit Price
                          </span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="form-control form-control-sm"
                          style={{ fontSize: "12px" }}
                          value={getPriceDisplayValue(item)}
                          onChange={(e) =>
                            handlePriceInputChange(item.id, e.target.value)
                          }
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ---- Floating vendor icon navigation ---- */}
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 1500,
        }}
      >
        {showVendorMenu && (
          <div
            className="bg-white vsu-fab-menu p-2 mb-2"
            style={{ minWidth: "210px" }}
          >
            <button
              className="vsu-fab-menu-item w-100 mb-1"
              onClick={openAddModal}
            >
              <AddIcon fontSize="small" /> Add New Product
            </button>
            <button
              className="vsu-fab-menu-item w-100 mb-1"
              onClick={handleRefresh}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh from server"}
            </button>
            <button
              className="vsu-fab-menu-item w-100 mb-1"
              onClick={() => {
                setShowVendorMenu(false);
                handlePreview();
              }}
            >
              Preview Products
            </button>
            <button
              className="vsu-fab-menu-item w-100 mb-1"
              onClick={() => {
                setShowVendorMenu(false);
                handleBackToProfile();
              }}
            >
              Back to Profile
            </button>
            <button
              className="vsu-fab-menu-item w-100"
              style={{ color: "#A24B4B" }}
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
        <button
          className="btn vsu-fab rounded-circle shadow-lg d-flex align-items-center justify-content-center"
          style={{ width: "58px", height: "58px" }}
          onClick={() => setShowVendorMenu((prev) => !prev)}
          title="Vendor menu"
        >
          <StorefrontIcon />
        </button>
      </div>

      {/* ---- Add New Product modal ---- */}
      {showAddModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: "rgba(16,48,31,0.55)", zIndex: 2000 }}
          onClick={closeAddModal}
        >
          <div
            className="bg-white vsu-modal-card"
            style={{
              width: "min(520px, 92vw)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="vsu-modal-header d-flex justify-content-between align-items-center">
              <h5 className="vsu-title mb-0">Add New Product</h5>
              <button
                className="btn btn-sm"
                style={{ color: "#fff" }}
                onClick={closeAddModal}
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>

            <div className="p-4">
              {addError && (
                <div className="alert alert-danger py-2 rounded-3">
                  {addError}
                </div>
              )}

              <form onSubmit={handleAddSubmit}>
                <div className="mb-2">
                  <label
                    className="form-label mb-1"
                    style={{ fontSize: "13px" }}
                  >
                    Product Name
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={addForm.name}
                    onChange={(e) => updateAddForm("name", e.target.value)}
                  />
                </div>

                <div className="mb-2">
                  <label
                    className="form-label mb-1"
                    style={{ fontSize: "13px" }}
                  >
                    Category
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={addForm.category}
                    onChange={(e) => updateAddForm("category", e.target.value)}
                  >
                    <option value="">Choose Category</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="__new__">+ Add new category</option>
                  </select>
                  {addForm.category === "__new__" && (
                    <input
                      type="text"
                      className="form-control form-control-sm mt-2"
                      placeholder="New category name"
                      value={addForm.newCategory}
                      onChange={(e) =>
                        updateAddForm("newCategory", e.target.value)
                      }
                    />
                  )}
                </div>

                {/* Product Code: scan or manual */}
                <div className="mb-2">
                  <label
                    className="form-label mb-1"
                    style={{ fontSize: "13px" }}
                  >
                    Product Code / Barcode
                  </label>
                  <div className="btn-group btn-group-sm mb-2 w-100">
                    <button
                      type="button"
                      className={`btn ${codeMode === "manual" ? "vsu-btn-primary" : "btn-outline-secondary"}`}
                      onClick={() => setCodeMode("manual")}
                    >
                      Enter Manually
                    </button>
                    <button
                      type="button"
                      className={`btn ${codeMode === "scan" ? "vsu-btn-primary" : "btn-outline-secondary"}`}
                      onClick={() => setCodeMode("scan")}
                    >
                      <CameraAltIcon fontSize="small" /> Scan Barcode
                    </button>
                  </div>

                  {codeMode === "manual" ? (
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. RICE-001"
                      value={addForm.code}
                      onChange={(e) => updateAddForm("code", e.target.value)}
                    />
                  ) : (
                    <div>
                      {scanError && (
                        <div
                          className="alert alert-warning py-2 rounded-3"
                          style={{ fontSize: "12px" }}
                        >
                          {scanError}
                        </div>
                      )}
                      {!scanning ? (
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm w-100"
                          onClick={startScan}
                        >
                          Start Camera Scan
                        </button>
                      ) : (
                        <div>
                          <video
                            ref={videoRef}
                            muted
                            playsInline
                            style={{
                              width: "100%",
                              borderRadius: "10px",
                              backgroundColor: "#000",
                            }}
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm w-100 mt-2"
                            onClick={stopScan}
                          >
                            Stop Scanning
                          </button>
                        </div>
                      )}
                      <input
                        type="text"
                        className="form-control form-control-sm mt-2"
                        placeholder="Detected code appears here (or type it in)"
                        value={addForm.code}
                        onChange={(e) => updateAddForm("code", e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <label
                      className="form-label mb-1"
                      style={{ fontSize: "13px" }}
                    >
                      Units
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. 1kg"
                      value={addForm.units}
                      onChange={(e) => updateAddForm("units", e.target.value)}
                    />
                  </div>
                  <div className="col-6">
                    <label
                      className="form-label mb-1"
                      style={{ fontSize: "13px" }}
                    >
                      Starting Stock
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="form-control form-control-sm"
                      value={addForm.stockLeft}
                      onChange={(e) =>
                        updateAddForm("stockLeft", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <label
                      className="form-label mb-1"
                      style={{ fontSize: "13px" }}
                    >
                      MRP (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="form-control form-control-sm"
                      value={addForm.mrp}
                      onChange={(e) => updateAddForm("mrp", e.target.value)}
                    />
                  </div>
                  <div className="col-6">
                    <label
                      className="form-label mb-1"
                      style={{ fontSize: "13px" }}
                    >
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="form-control form-control-sm"
                      value={addForm.discount}
                      onChange={(e) =>
                        updateAddForm("discount", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <label
                      className="form-label mb-1"
                      style={{ fontSize: "13px" }}
                    >
                      Delivery In (mins)
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={addForm.deliveryIn}
                      onChange={(e) =>
                        updateAddForm("deliveryIn", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-6">
                    <label
                      className="form-label mb-1"
                      style={{ fontSize: "13px" }}
                    >
                      Per-customer limit
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="form-control form-control-sm"
                      placeholder="Optional"
                      value={addForm.limit}
                      onChange={(e) => updateAddForm("limit", e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label
                    className="form-label mb-1"
                    style={{ fontSize: "13px" }}
                  >
                    Product Photo (optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control form-control-sm"
                    onChange={(e) => setAddPhoto(e.target.files?.[0] || null)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn vsu-btn-primary w-100 py-2"
                  disabled={addSaving}
                >
                  {addSaving ? "Submitting..." : "Submit for Approval"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorStockUpdatePage;
