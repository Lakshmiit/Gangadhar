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
import DownloadIcon from "@mui/icons-material/Download";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import * as XLSX from "xlsx";
import {
  getVendorProfileById,
  updateVendorProfile,
} from "./utils/vendorStorage";
import ImageCache from "./utils/ImageCache";
import { getGroceryItems, getLiveGroceryStock } from "./utils/groceryStore";
import { getVendorProductsByVendorId } from "./utils/vendorListStore";
// Same backend the customer-facing Profile page (and Admin grocery pages) use.
const API_BASE = "https://localhost:7091/api";
const ADD_GROCERY_ITEM = `${API_BASE}/UploadGrocery/UploadGrocery`;
const IMAGE_DOWNLOAD = `${API_BASE}/FileUpload/download?generatedfilename=`;
const IMAGE_UPLOAD = `${API_BASE}/FileUpload/upload?filename=`;

// Same key VendorPreviewPage reads to show the "ready to submit" list —
// keep this string identical in both files.
const pendingCartKey = (vendorId) => `vendorPendingProducts_${vendorId}`;

// Category display-order key — same key VendorPreviewPage reads to seed
// its #1/#2/... rank order. Writing to it here means the order categories
// were SELECTED in on this page carries straight over as the initial
// preview order — check "Unbeatable Offers" first and it lands as #1.
const categoryOrderKey = (vendorId) => `vendorCategoryOrder_${vendorId}`;

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

// getVendorProductsByVendorId() (utils/vendorListStore.js) already
// normalizes the backend's vendor-submission record to
// { categories: [{ category, products: [{ productId, discount, qty, limit }] }] }.
// Turn that into the same { [productId]: {checked, discount} } / qty / limit
// maps shape the localStorage hydration effect below produces, so both
// sources can be merged the same way.
const extractSelectionFromVendorProducts = (vendorProducts) => {
  const map = {};
  const qtyMap = {};
  const limitMap = {};
  if (!vendorProducts) return { map, qtyMap, limitMap };
  (vendorProducts.categories || []).forEach((cat) => {
    (cat.products || []).forEach((p) => {
      if (!p?.productId || !(p.qty > 0)) return;
      map[p.productId] = { checked: true, discount: String(p.discount ?? "0") };
      qtyMap[p.productId] = p.qty;
      limitMap[p.productId] = Number(p.limit ?? 0);
    });
  });
  return { map, qtyMap, limitMap };
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

  // null = show categories only. Set to a category name (or "All") to view products.
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  // Search box on the categories-only landing view — filters the category
  // tiles themselves (not products), separate from `searchQuery` above
  // which filters products once a category has been opened.
  const [categorySearchQuery, setCategorySearchQuery] = useState("");

  // Locally tracked submission quantities — start at 0. As soon as a
  // product's quantity goes above 0 it's automatically added to the
  // submit-for-approval payload; dropping it back to 0 automatically
  // removes it again. No separate "save" step needed.
  const [pendingQty, setPendingQty] = useState({});

  // Locally tracked per-customer purchase limit for each product — same
  // "+/- stepper, defaults from the catalog value, capped by live stock"
  // pattern as pendingQty, but it doesn't gate selection on its own: a
  // product only goes into the payload once pendingQty > 0, and the limit
  // just rides along with it.
  const [pendingLimit, setPendingLimit] = useState({});

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
  const [checkingStockId, setCheckingStockId] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanFrameRef = useRef(null);
  // ---- Bulk Excel upload/download ----
  const excelInputRef = useRef(null);
  const [excelBusy, setExcelBusy] = useState(false);
  // ---- Fast selection for the vendor's own submission ----
  // itemId -> { checked: bool, discount: string }. `checked` always mirrors
  // whether pendingQty[itemId] > 0 — the +/- stepper (or its checkbox
  // shortcut) is what adds/removes a product here, never a separate action.
  // This auto-saves to localStorage in the vendorUploadProducts payload
  // shape; VendorPreviewPage reads that cart back for a final review + submit.
  const [selection, setSelection] = useState({});
  const hydratedSelectionRef = useRef(false);
  const hydratedBackendRef = useRef(false);

  // Order categories were SELECTED in on this page — a list of category
  // names, front = first category that got a product checked. Seeded from
  // whatever's already saved (a previous visit here, or arrows used on the
  // Preview page), then kept in sync below. VendorPreviewPage reads this
  // exact key to seed its own #1/#2/... rank order.
  const [categorySelectOrder, setCategorySelectOrder] = useState(() => {
    try {
      const raw = localStorage.getItem(categoryOrderKey(vendorId));
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

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

  useEffect(() => {
    if (!vendor || hydratedBackendRef.current) return;
    hydratedBackendRef.current = true;
    (async () => {
      try {
        const vendorProducts = await getVendorProductsByVendorId(vendorId);
        const { map, qtyMap, limitMap } =
          extractSelectionFromVendorProducts(vendorProducts);
        if (Object.keys(map).length)
          setSelection((prev) => ({ ...map, ...prev }));
        if (Object.keys(qtyMap).length)
          setPendingQty((prev) => ({ ...qtyMap, ...prev }));
        if (Object.keys(limitMap).length)
          setPendingLimit((prev) => ({ ...limitMap, ...prev }));
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
      (saved.categorie || []).forEach((cat) => {
        (cat.products || []).forEach((p) => {
          if (p?.productIds) {
            map[p.productIds] = {
              checked: true,
              discount: String(p.discount ?? "0"),
            };
            qtyMap[p.productIds] = Number(p.quantity || 0);
            limitMap[p.productIds] = Number(p.limit ?? 0);
          }
        });
      });
      if (Object.keys(map).length)
        setSelection((prev) => ({ ...prev, ...map }));
      if (Object.keys(qtyMap).length)
        setPendingQty((prev) => ({ ...prev, ...qtyMap }));
      if (Object.keys(limitMap).length)
        setPendingLimit((prev) => ({ ...prev, ...limitMap }));
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
      (it) => Number(pendingQty[it.id] || 0) > 0,
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
    } catch (err) {
      // storage full/unavailable — selection still works for this session
    }
  }, [selection, pendingQty, pendingLimit, items, vendor, vendorId]);

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

  // Categories filtered by the landing-view search box. "All Products" is
  // always shown unless the vendor is actively searching for something
  // that doesn't match "all" — that keeps the tile from disappearing on
  // an empty query while still letting a real search hide it if unrelated.
  const filteredCategories = useMemo(() => {
    const q = categorySearchQuery.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.toLowerCase().includes(q));
  }, [categories, categorySearchQuery]);

  const showAllProductsTile =
    !categorySearchQuery.trim() ||
    "all products".includes(categorySearchQuery.trim().toLowerCase());

  // Whenever the set of "categories with at least one selected product"
  // changes, keep categorySelectOrder in sync: categories that dropped to
  // zero selected products are removed, and any newly-active category is
  // appended at the end — so the FIRST category you check ends up first,
  // the next NEW one you check ends up second, etc. Persisted under the
  // exact key VendorPreviewPage reads its initial rank order from.
  useEffect(() => {
    if (!vendor) return;
    const activeCategories = new Set();
    items.forEach((it) => {
      if (Number(pendingQty[it.id] || 0) > 0) {
        activeCategories.add(it.category || "Unspecified");
      }
    });
    setCategorySelectOrder((prev) => {
      const kept = prev.filter((c) => activeCategories.has(c));
      const known = new Set(kept);
      const next = [...kept];
      categories.forEach((c) => {
        if (activeCategories.has(c) && !known.has(c)) {
          next.push(c);
          known.add(c);
        }
      });
      const changed =
        next.length !== prev.length || next.some((c, i) => c !== prev[i]);
      if (changed) {
        try {
          localStorage.setItem(
            categoryOrderKey(vendorId),
            JSON.stringify(next),
          );
        } catch (err) {
          // storage full/unavailable — order still works for this session
        }
        return next;
      }
      return prev;
    });
  }, [items, pendingQty, vendor, vendorId, categories]);

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

  // Quantity is the single source of truth for "is this product going into
  // the submission payload". Bumping it above 0 auto-selects the product;
  // dropping it back to 0 auto-removes it — no separate save step.
  const handlePendingChange = (itemId, delta, item) => {
    setPendingQty((prev) => {
      const next = Math.max(0, Number(prev[itemId] || 0) + delta);
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
      return { ...prev, [itemId]: next };
    });
  };

  const isSelectedForSubmission = (itemId) => getPendingQty(itemId) > 0;
  const getSelectionDiscount = (item) =>
    selection[item.id]?.discount ?? String(item.discount ?? 0);

  // Per-customer limit — same "+/- stepper" pattern as the quantity
  // stepper, capped by the item's own live stock (a limit above the
  // available stock doesn't mean anything). Defaults from the catalog's
  // own `limit` value the first time a product is touched.
  const getPendingLimit = (item) =>
    Number(pendingLimit[item.id] ?? item.limit ?? 0);

  const handleLimitChange = (itemId, delta, item) => {
    setPendingLimit((prev) => {
      const base = prev[itemId] ?? item.limit ?? 0;
      const liveStock = Number(item.stockLeft || 0);
      const next = Math.max(0, Math.min(Number(base) + delta, liveStock));
      return { ...prev, [itemId]: next };
    });
  };

  const refreshSingleProductStock = async (itemId) => {
    try {
      // Direct API request - NO CACHE
      const latest = await getLiveGroceryStock(itemId);

      // Update only this product in the UI
      setItems((prev) =>
        prev.map((p) =>
          String(p.id) === String(itemId)
            ? {
                ...p,
                ...latest,
                stockLeft: Number(latest.stockLeft || 0),
              }
            : p,
        ),
      );

      return latest;
    } catch (error) {
      console.error("Failed to get live stock for product:", itemId, error);

      return null;
    }
  };

  // Checkbox shortcut: checking a product jumps its quantity straight to 1
  // (adding it to the payload); unchecking zeroes the quantity back out
  // (removing it) — same rule the +/- stepper follows.
  const toggleSelectForSubmission = async (item) => {
    const current = getPendingQty(item.id);

    // If already selected → simply unselect
    if (current > 0) {
      handlePendingChange(item.id, -current, item);
      return;
    }

    // -------------------------------
    // NEW SELECTION
    // FIRST CHECK LIVE SERVER STOCK
    // -------------------------------

    setCheckingStockId(item.id);

    try {
      const latest = await refreshSingleProductStock(item.id);

      if (!latest) {
        alert("Unable to check live stock. Please try again.");
        return;
      }

      const liveStock = Number(latest.stockLeft || 0);

      console.log(`Product: ${latest.name} | Live Stock: ${liveStock}`);

      if (liveStock <= 0) {
        alert(`"${latest.name}" is currently out of stock.`);

        // Make sure selection remains removed
        setPendingQty((prev) => {
          const next = { ...prev };
          delete next[item.id];
          return next;
        });

        setSelection((prev) => {
          const next = { ...prev };
          delete next[item.id];
          return next;
        });

        return;
      }

      // -------------------------------
      // SERVER CONFIRMED STOCK > 0
      // NOW SELECT THE PRODUCT
      // -------------------------------

      handlePendingChange(item.id, liveStock, latest);

      // Seed a starting limit the first time this product is selected,
      // capped by the live stock we just confirmed. Leaves any value the
      // vendor already set (e.g. restored from localStorage) untouched.
      setPendingLimit((prev) =>
        prev[item.id] !== undefined
          ? prev
          : {
              ...prev,
              [item.id]: Math.min(
                Number(latest.limit ?? item.limit ?? 0),
                liveStock,
              ),
            },
      );
    } finally {
      setCheckingStockId(null);
    }
  };

  const getCategoryItems = (category) => {
    return items.filter(
      (item) => (item.category || "Unspecified") === category,
    );
  };

  const isCategorySelected = (category) => {
    const categoryItems = getCategoryItems(category);

    // Consider only products that have stock
    const availableItems = categoryItems.filter(
      (item) => Number(item.stockLeft || 0) > 0,
    );

    if (availableItems.length === 0) return false;

    return availableItems.every((item) => Number(pendingQty[item.id] || 0) > 0);
  };

  const toggleCategorySelection = (category) => {
    const categoryItems = getCategoryItems(category);

    const shouldSelect = !isCategorySelected(category);

    setPendingQty((prevQty) => {
      const nextQty = { ...prevQty };

      categoryItems.forEach((item) => {
        // Match the per-product flow (toggleSelectForSubmission): selecting
        // a product defaults its submit quantity to the item's own
        // available stock, not a hardcoded 1. An item with 0 stock stays
        // at 0 either way, so it never gets selected by accident.
        nextQty[item.id] = shouldSelect ? Number(item.stockLeft || 0) : 0;
      });

      return nextQty;
    });

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

    // Seed a starting limit (capped by live stock) for any product in the
    // category that doesn't already have one — same rule as the single-item
    // select flow. Left untouched on deselect.
    setPendingLimit((prevLimit) => {
      const nextLimit = { ...prevLimit };
      if (shouldSelect) {
        categoryItems.forEach((item) => {
          if (nextLimit[item.id] === undefined) {
            const liveStock = Number(item.stockLeft || 0);
            nextLimit[item.id] = Math.min(Number(item.limit || 0), liveStock);
          }
        });
      }
      return nextLimit;
    });
  };

  const updateSelectionDiscount = (item, value) => {
    // Editing the discount never selects a product on its own — only
    // quantity does that. This just updates the discount for whatever
    // selection state the quantity has already produced.
    setSelection((prev) => ({
      ...prev,
      [item.id]: { checked: getPendingQty(item.id) > 0, discount: value },
    }));
  };

  const selectedForSubmissionCount = useMemo(
    () =>
      Object.keys(pendingQty).filter((id) => Number(pendingQty[id]) > 0).length,
    [pendingQty],
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
    // Sent here from the customer ProfilePage (which stashes where to
    // return to). Falls back to the app root if that's missing.
    const returnTo = localStorage.getItem("vendorReturnProfile");
    navigate(returnTo || "/");
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

  // ---- Bulk Excel upload/download ----
  // Download: a spreadsheet of the vendor's full product catalog, with the
  // vendor's current "qty to sell / discount / limit" selections filled
  // in where set, so it doubles as an editable snapshot. Upload: read that
  // same file back (edited or not) and bulk-apply qty/discount/limit for
  // every row that matches a catalog product — same net effect as using
  // the +/- steppers and discount boxes one product at a time, just all
  // at once. Makes it easy for the vendor admin to manage a large catalog
  // outside the browser (in Excel) instead of product-by-product.
  const handleDownloadProductsExcel = () => {
    if (!items.length) {
      setError("No products loaded yet — refresh the catalog first.");
      return;
    }
    const rows = items.map((item) => ({
      "Product ID": item.id,
      "Product Code": item.code || "",
      "Product Name": item.name || "",
      Category: item.category || "Unspecified",
      MRP: Number(item.mrp || 0),
      "Live Stock": Number(item.stockLeft || 0),
      "Qty To Sell": getPendingQty(item.id) || "",
      "Discount %": getSelectionDiscount(item),
      "Limit Per Customer": getPendingLimit(item) || "",
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet["!cols"] = [
      { wch: 12 },
      { wch: 16 },
      { wch: 32 },
      { wch: 20 },
      { wch: 10 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 18 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    const safeStoreName = (vendor?.storeName || vendor?.name || "vendor")
      .toString()
      .replace(/[^a-z0-9]+/gi, "_");
    const fileName = `${safeStoreName}_products_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    setShowVendorMenu(false);
  };

  const handleUploadProductsExcelClick = () => {
    setShowVendorMenu(false);
    excelInputRef.current?.click();
  };

  const handleProductsExcelFileSelected = async (event) => {
    const file = event.target.files?.[0];
    // Allow re-selecting the same file again later.
    event.target.value = "";
    if (!file) return;

    setExcelBusy(true);
    setError("");
    setMessage("");
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });

      if (!rows.length) {
        setError("That Excel file doesn't have any product rows in it.");
        return;
      }

      const itemsById = new Map(items.map((it) => [String(it.id), it]));
      const itemsByCode = new Map(
        items
          .filter((it) => it.code)
          .map((it) => [String(it.code).trim().toLowerCase(), it]),
      );
      const itemsByName = new Map(
        items.map((it) => [
          String(it.name || "")
            .trim()
            .toLowerCase(),
          it,
        ]),
      );

      let updatedCount = 0;
      let skippedCount = 0;

      rows.forEach((row) => {
        const rawId = row["Product ID"] ?? row["ProductId"] ?? row["id"];
        const rawCode = row["Product Code"] ?? row["Code"];
        const rawName = row["Product Name"] ?? row["Name"];

        const item =
          (rawId !== undefined &&
            rawId !== "" &&
            itemsById.get(String(rawId))) ||
          (rawCode && itemsByCode.get(String(rawCode).trim().toLowerCase())) ||
          (rawName && itemsByName.get(String(rawName).trim().toLowerCase()));

        if (!item) {
          skippedCount += 1;
          return;
        }

        const qty =
          Math.max(
            0,
            Number(row["Qty To Sell"] ?? row["Qty"] ?? row["Quantity"] ?? 0),
          ) || 0;
        const discountRaw = row["Discount %"] ?? row["Discount"];
        const limitRaw = row["Limit Per Customer"] ?? row["Limit"];

        setPendingQty((prev) => ({ ...prev, [item.id]: qty }));

        setSelection((prev) => {
          if (qty <= 0) {
            if (!prev[item.id]) return prev;
            const next = { ...prev };
            delete next[item.id];
            return next;
          }
          return {
            ...prev,
            [item.id]: {
              checked: true,
              discount:
                discountRaw !== undefined && discountRaw !== ""
                  ? String(discountRaw)
                  : (prev[item.id]?.discount ?? String(item.discount ?? 0)),
            },
          };
        });

        if (limitRaw !== undefined && limitRaw !== "") {
          const liveStock = Number(item.stockLeft || 0);
          const limitVal = Math.max(
            0,
            Math.min(Number(limitRaw) || 0, liveStock),
          );
          setPendingLimit((prev) => ({ ...prev, [item.id]: limitVal }));
        }

        updatedCount += 1;
      });

      setMessage(
        `Excel import complete: ${updatedCount} product${updatedCount === 1 ? "" : "s"} updated` +
          (skippedCount
            ? `, ${skippedCount} row${skippedCount === 1 ? "" : "s"} skipped (no matching product).`
            : "."),
      );
    } catch (err) {
      console.error("Failed to read products Excel file:", err);
      setError(
        "Couldn't read that Excel file. Make sure it's a .xlsx or .xls file (ideally one downloaded from this page).",
      );
    } finally {
      setExcelBusy(false);
    }
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
        {/* Back to Profile */}
        <button
          type="button"
          className="vsu-back-btn mb-3"
          onClick={handleBackToProfile}
        >
          <ArrowBackIcon fontSize="small" /> Back to Profile
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
            <div className="d-flex flex-wrap align-items-end justify-content-between gap-2 mb-3">
              <div>
                <h3 className="vsu-section-heading mb-1">Choose a category</h3>
                <p className="text-muted mb-0">
                  Select a category to view and restock its products.
                </p>
              </div>
              <div className="vsu-search-wrap">
                <SearchIcon className="vsu-search-icon" />
                <input
                  type="text"
                  className="form-control form-control-sm vsu-search"
                  placeholder="Search categories..."
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  style={{ maxWidth: "220px" }}
                />
              </div>
            </div>

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
            ) : !showAllProductsTile && filteredCategories.length === 0 ? (
              <div className="vsu-empty">
                <p className="mb-1 fw-bold">
                  No categories match "{categorySearchQuery}"
                </p>
                <p className="mb-0">Try a different search term.</p>
              </div>
            ) : (
              <div className="d-flex flex-wrap gap-3">
                {showAllProductsTile && (
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
                )}
                {filteredCategories.map((category) => (
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
                  const restockQty = getPendingQty(item.id);
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
                          disabled={checkingStockId === item.id}
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

                      {/* ---- Submit quantity stepper (existing stock UI) ---- */}
                      <div className="mt-2">
                        <div
                          className="d-flex justify-content-between align-items-center mb-1"
                          style={{
                            fontSize: "10px",
                            color: "#6B7A70",
                          }}
                        >
                          <span>
                            {checkingStockId === item.id
                              ? "Checking live stock..."
                              : `Available Stock: ${liveStock}`}
                          </span>

                          <span
                            className="fw-bold"
                            style={{ color: "#8a611c" }}
                          >
                            Submit Qty
                          </span>
                        </div>

                        <div className="d-flex align-items-center justify-content-between vsu-restock-pill">
                          {/* MINUS */}
                          <button
                            type="button"
                            className="vsu-restock-btn"
                            style={{
                              opacity: restockQty > 0 ? 1 : 0.4,
                              cursor:
                                restockQty > 0 ? "pointer" : "not-allowed",
                            }}
                            onClick={() =>
                              restockQty > 0 &&
                              handlePendingChange(item.id, -1, item)
                            }
                            disabled={
                              restockQty <= 0 || checkingStockId === item.id
                            }
                            title="Decrease quantity"
                          >
                            –
                          </button>

                          {/* QUANTITY */}
                          <span
                            className="fw-bold"
                            style={{
                              fontSize: "13px",
                              minWidth: "30px",
                              textAlign: "center",
                            }}
                          >
                            {liveStock}
                          </span>

                          {/* PLUS */}
                          <button
                            type="button"
                            className="vsu-restock-btn"
                            onClick={() => {
                              if (restockQty < liveStock) {
                                handlePendingChange(item.id, liveStock, item);
                              }
                            }}
                            disabled={
                              checkingStockId === item.id ||
                              restockQty >= liveStock ||
                              liveStock <= 0
                            }
                            title={
                              restockQty >= liveStock
                                ? `Maximum quantity is ${liveStock}`
                                : "Increase quantity"
                            }
                            style={{
                              opacity:
                                checkingStockId === item.id ||
                                restockQty >= liveStock ||
                                liveStock <= 0
                                  ? 0.4
                                  : 1,
                              cursor:
                                checkingStockId === item.id ||
                                restockQty >= liveStock ||
                                liveStock <= 0
                                  ? "not-allowed"
                                  : "pointer",
                            }}
                          >
                            +
                          </button>
                        </div>

                        {/* MAXIMUM MESSAGE */}
                        {liveStock > 0 && restockQty >= liveStock && (
                          <div
                            style={{
                              fontSize: "9px",
                              color: "#dc3545",
                              fontWeight: "600",
                              textAlign: "center",
                              marginTop: "3px",
                            }}
                          >
                            Maximum quantity reached
                          </div>
                        )}
                      </div>

                      {/* ---- Per-customer limit stepper (same UI/logic as
                           the quantity stepper above, capped by live stock) ---- */}
                      <div className="mt-2">
                        <div
                          className="d-flex justify-content-between align-items-center mb-1"
                          style={{
                            fontSize: "10px",
                            color: "#6B7A70",
                          }}
                        >
                          <span>Per-customer limit</span>
                          <span
                            className="fw-bold"
                            style={{ color: "#8a611c" }}
                          >
                            Submit Limit
                          </span>
                        </div>

                        <div className="d-flex align-items-center justify-content-between vsu-restock-pill">
                          {/* MINUS */}
                          <button
                            type="button"
                            className="vsu-restock-btn"
                            style={{
                              opacity: restockLimit > 0 ? 1 : 0.4,
                              cursor:
                                restockLimit > 0 ? "pointer" : "not-allowed",
                            }}
                            onClick={() =>
                              restockLimit > 0 &&
                              handleLimitChange(item.id, -1, item)
                            }
                            disabled={restockLimit <= 0}
                            title="Decrease limit"
                          >
                            –
                          </button>

                          {/* LIMIT */}
                          <span
                            className="fw-bold"
                            style={{
                              fontSize: "13px",
                              minWidth: "30px",
                              textAlign: "center",
                            }}
                          >
                            {restockLimit}
                          </span>

                          {/* PLUS */}
                          <button
                            type="button"
                            className="vsu-restock-btn"
                            onClick={() =>
                              restockLimit < liveStock &&
                              handleLimitChange(item.id, 1, item)
                            }
                            disabled={
                              restockLimit >= liveStock || liveStock <= 0
                            }
                            title={
                              restockLimit >= liveStock
                                ? `Maximum limit is ${liveStock}`
                                : "Increase limit"
                            }
                            style={{
                              opacity:
                                restockLimit >= liveStock || liveStock <= 0
                                  ? 0.4
                                  : 1,
                              cursor:
                                restockLimit >= liveStock || liveStock <= 0
                                  ? "not-allowed"
                                  : "pointer",
                            }}
                          >
                            +
                          </button>
                        </div>

                        {liveStock > 0 && restockLimit >= liveStock && (
                          <div
                            style={{
                              fontSize: "9px",
                              color: "#dc3545",
                              fontWeight: "600",
                              textAlign: "center",
                              marginTop: "3px",
                            }}
                          >
                            Maximum limit reached
                          </div>
                        )}
                      </div>

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
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hidden input backing the "Upload Products Excel" menu item above */}
      <input
        ref={excelInputRef}
        type="file"
        accept=".xlsx,.xls"
        style={{ display: "none" }}
        onChange={handleProductsExcelFileSelected}
      />

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
              onClick={handleDownloadProductsExcel}
            >
              <DownloadIcon fontSize="small" /> Download Products Excel
            </button>
            <button
              className="vsu-fab-menu-item w-100 mb-1"
              onClick={handleUploadProductsExcelClick}
              disabled={excelBusy}
            >
              <UploadFileIcon fontSize="small" />{" "}
              {excelBusy ? "Importing..." : "Upload Products Excel"}
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
