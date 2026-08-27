import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "./App.css";
import Sidebar from "./Sidebar.js";
import "bootstrap/dist/css/bootstrap.min.css";
import { Dashboard as MoreVertIcon } from "@mui/icons-material";
import { Button, Modal } from "react-bootstrap";
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from "@mui/icons-material/Favorite"; 
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder"; 
import { CartStorage } from "./CartStorage.js";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ImageCache from "./utils/ImageCache.js";
import Footer from "./Footer.js";
// import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
// import ArrowRightIcon from '@mui/icons-material/ArrowRight';
const GroceryChristmasOffers = () => {
  const navigate = useNavigate();
  // const location = useLocation();
  const { userType, userId, selectedUserType } = useParams();
  const location = useLocation();
const encodedCategory = location.state?.encodedCategory || localStorage.getItem("encodedCategory");
// const [selectedCategory, setSelectedCategory] = useState("");
const [selectedCategory, setSelectedCategory] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [products, setProducts] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [imageLoading, setImageLoading] = useState(true);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [zoomImage, setZoomImage] = useState("");
  const [cart, setCart] = useState({});
 const [checked, setChecked] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
const [likedProducts, setLikedProducts] = useState({}); 
const [zoomProduct, setZoomProduct] = useState(null);
// const [totalItemsCount, setTotalItemsCount] = useState(0);
const [grandSummary, setGrandSummary] = useState({ items: 0, total: 0 });
// const [cartSummary, setCartSummary] = useState({
//   items: 0,
//   total: 0,
//   products: [],
// });

// const [groceryName, setGroceryName] = useState('');
 useEffect(() => {
console.log(checked, imageLoading, grandSummary);
}, [checked, imageLoading, grandSummary]);

const MIN_ORDER_AMOUNT = 1999;

useEffect(() => {
  const saved = CartStorage.getAll() || [];
  const categories = Array.isArray(saved) ? saved : [saved]; 

  const exist = categories.find(c => c.categoryName === selectedCategory);
  if (exist) {
    const restored = {};
    (exist.products || []).forEach(p => {
      restored[String(p.productId)] = Number(p.qty);
    });
    setCart(restored);
  }
}, [selectedCategory]);

useEffect(() => {
  if (!selectedCategory) return;

  // Convert cart state → product list
  const current = Object.entries(cart).map(([productId, qty]) => {
  const product = products.find(p => String(p.id) === String(productId));
  return {
    productId,
    productName: product?.name || "",
    qty: Number(qty),
    mrp: Number(product?.mrp || 0),
    discount: Number(product?.discount || 0),
    afterDiscountPrice: Number(product?.afterDiscount || 0),
    stockLeft: Number(product?.stockLeft || 0),
    image: product?.images?.[0] || "",
    code: product?.code || "",
    units: product?.units || "",
  };
});

  CartStorage.upsertCategory(selectedCategory, current);

  setGrandSummary(CartStorage.grandSummary());
}, [cart, selectedCategory, products]);

const handleAdd = (productId) => setCart(prev => ({ ...prev, [productId]: 1 }));
// const handleIncrement = (productId) =>
//   setCart(prev => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
const handleIncrement = (productId) =>
  setCart(prev => {
    const product = products.find(p => String(p.id) === String(productId));
    const stock = Number(product?.stockLeft || 0);
    const cur = Number(prev[productId] || 0);
    if (cur >= stock) return prev;
    return { ...prev, [productId]: cur + 1 };
  });

const handleDecrementClick = (productId) =>
  setCart(prev => {
    const next = (prev[productId] || 0) - 1;
    const copy = { ...prev };
    if (next <= 0) delete copy[productId];
    else copy[productId] = next;
    return copy;
  });

useEffect(() => {
  localStorage.setItem("cartData", JSON.stringify(cart));
}, [cart]);

const toggleLike = (productId) => {
  setLikedProducts((prev) => ({
    ...prev,
    [productId]: !prev[productId],
  }));
};

   const handleImageClick = (imageSrc, product) => {
  setZoomImage(imageSrc);
  setZoomProduct(product);       
  setShowZoomModal(true);
};
  
// const handleAddClick = (id) => {
//     handleAdd(id);
//     setChecked(true);
//   };        

const getQty = (id) => Number(cart?.[id] || 0);

const canAddMore = (id) => {
  const product = products.find(p => String(p.id) === String(id));
  const stock = Number(product?.stockLeft || 0);
  return getQty(id) < stock;
};

const handleAddClick = (id) => {
  const product = products.find(p => String(p.id) === String(id));
  const stock = Number(product?.stockLeft || 0);
  if (stock <= 0) return; 
  handleAdd(id);
  setChecked(true);
};

function getItemTime(p) {
  if (p?.date) {
    const t = Date.parse(p.date); 
    if (!Number.isNaN(t)) return t;
  }

  const candidates = [
    p.createdAt, p.created_on, p.createdDate, p.createDate,
    p.updatedAt, p.updated_on, p.modifiedAt, p.modified_on,
    p.addedDate, p.added_at, p.timestamp, p.timeStamp,
  ];
  for (const c of candidates) {
    const t = Date.parse(c);
    if (!Number.isNaN(t)) return t;
  }

  if (typeof p.id === "number") return p.id;
  const idNum = Number(String(p.id || "").replace(/\D/g, "")) || 0;
  return idNum;
}

// useEffect(() => {
//   if (!encodedCategory) return;
//   const decodedCat = decodeURIComponent(encodedCategory);
//   setSelectedCategory(decodedCat);
//   const controller = new AbortController();
//   let cancelled = false;
//   async function fetchProductsAndFirstImages() {
//     try {
//       setImageLoading(true);
//       const url = `https://handymanapiv4-d4baa3hhdcftgabe.centralindia-01.azurewebsites.net/api/UploadGrocery/GetGroceryItemsBycategory?Category=${encodeURIComponent(decodedCat)}`;
//       const { data: items } = await axios.get(url, { signal: controller.signal });
//       const safeItems = Array.isArray(items) ? items : [];
//       if (cancelled) return;
//       const sorted = [...safeItems].sort((a, b) => {
//         const tb = getItemTime(b);
//         const ta = getItemTime(a);
//         if (tb !== ta) return tb - ta;   
//         return String(b.id).localeCompare(String(a.id));
//       }); 
//       const firstImages = safeItems
//         .map(p => ({ productId: p.id, photo: Array.isArray(p.images) ? p.images[0] : null }))
//         .filter(x => !!x.photo);
//       const cachedMap = {};
//       const misses = [];
//       for (const { productId, photo } of firstImages) {
//         const cached = ImageCache.getBase64(photo);
//         if (cached) {
//           cachedMap[productId] = [`data:image/jpeg;base64,${cached}`];
//         } else {
//           misses.push({ productId, photo });
//         }
//       }
//       setProducts(sorted);
//       if (Object.keys(cachedMap).length) setImageUrls(prev => ({ ...prev, ...cachedMap }));
//       if (cancelled) return;
//       const fetchOne = async ({ productId, photo }) => {
//         try {
//           const res = await fetch(
//             `https://handymanapiv4-d4baa3hhdcftgabe.centralindia-01.azurewebsites.net/api/FileUpload/download?generatedfilename=${encodeURIComponent(photo)}`,
//             { signal: controller.signal }
//           );
//           const json = await res.json();
//           const b64 = json?.imageData || "";
//           if (!b64) return;
//           ImageCache.setBase64(photo, b64);
//           const dataUrl = `data:image/jpeg;base64,${b64}`;
//           if (!cancelled) {
//             setImageUrls(prev => {
//               if (prev[productId]?.[0] === dataUrl) return prev;
//               return { ...prev, [productId]: [dataUrl] };
//             });
//           }
//         } catch (e) {
//         }
//       };

//       await Promise.allSettled(misses.map(fetchOne));
//     } catch (err) {
//       if (err?.name !== "CanceledError" && err?.name !== "AbortError") {
//         console.error("Error fetching grocery products:", err);
//         setProducts([]);
//         setImageUrls({});
//       }
//     } finally {
//       if (!cancelled) setImageLoading(false);
//     }
//   }
//   fetchProductsAndFirstImages();
//   return () => {
//     cancelled = true;
//     controller.abort();
//   };
// }, [encodedCategory]);

 useEffect(() => {
    if (!encodedCategory) return;
    const decodedCat = decodeURIComponent(encodedCategory);
    setSelectedCategory(decodedCat);
    let cancelled = false;
    const controller = new AbortController();
    const POLL_MS = 2000; 
    let pollId = null;
    async function fetchProductsAndFirstImages(warm = false, signal) {
      try {
        if (!warm) setImageLoading(true);
        const url = `https://handymanapiv4-d4baa3hhdcftgabe.centralindia-01.azurewebsites.net/api/UploadGrocery/GetGroceryItemsBycategory?Category=${encodeURIComponent(decodedCat)}`;
        const { data: items } = await axios.get(url, { signal });
        const safeItems = Array.isArray(items) ? items : [];
        if (cancelled) return;
        const sorted = [...safeItems].sort((a, b) => {
        const stockA = Number(a.stockLeft || 0);
        const stockB = Number(b.stockLeft || 0);
        if (stockA <= 0 && stockB > 0) return 1;
        if (stockA > 0 && stockB <= 0) return -1;
        const timeA = getItemTime(a);
        const timeB = getItemTime(b);
        if (timeA !== timeB) return timeB - timeA;
        return String(b.id).localeCompare(String(a.id));
      });
        setProducts(sorted);
        if (warm) return;
        const firstImages = safeItems
          .map(p => ({ productId: p.id, photo: Array.isArray(p.images) ? p.images[0] : null }))
          .filter(x => !!x.photo);

        const cachedMap = {};
        const misses = [];
        for (const { productId, photo } of firstImages) {
          const cached = ImageCache.getBase64(photo);
          if (cached) {
            cachedMap[productId] = [`data:image/jpeg;base64,${cached}`];
          } else {
            misses.push({ productId, photo });
          }
        }

        if (Object.keys(cachedMap).length) {
          setImageUrls(prev => ({ ...prev, ...cachedMap }));
        }
        if (cancelled) return;
        const fetchOne = async ({ productId, photo }) => {
          try {
            const res = await fetch(
              `https://handymanapiv4-d4baa3hhdcftgabe.centralindia-01.azurewebsites.net/api/FileUpload/download?generatedfilename=${encodeURIComponent(photo)}`,
              { signal }
            );
            const json = await res.json();
            const b64 = json?.imageData || "";
            if (!b64) return;
            ImageCache.setBase64(photo, b64);
            const dataUrl = `data:image/jpeg;base64,${b64}`;
            if (!cancelled) {
              setImageUrls(prev => {
                if (prev[productId]?.[0] === dataUrl) return prev;
                return { ...prev, [productId]: [dataUrl] };
              });
            }
          } catch {}
        };
        await Promise.allSettled(misses.map(fetchOne));
      } catch (err) {
        if (err?.name !== "CanceledError" && err?.name !== "AbortError") {
          console.error("Error fetching grocery products:", err);
          if (!warm) {
            setProducts([]);
            setImageUrls({});
          }
        }
      } finally {
        if (!cancelled && !warm) setImageLoading(false);
      }
    }
    fetchProductsAndFirstImages(false, controller.signal);
    pollId = setInterval(() => {
      const pollController = new AbortController();
      fetchProductsAndFirstImages(true, pollController.signal);
    }, POLL_MS);

    return () => {
      cancelled = true;
      controller.abort();
      if (pollId) clearInterval(pollId);
    };
  }, [encodedCategory]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
  let savedCategories = [];

  try {
    const raw = localStorage.getItem("allCategories");
    if (raw) {
      const parsed = JSON.parse(raw);
      savedCategories = Array.isArray(parsed) ? parsed : [parsed];
    }
  } catch (e) {
    console.error("Invalid JSON in localStorage for allCategories:", e);
  }

  const currentCategory = decodeURIComponent(encodedCategory);
  const existingCategory = savedCategories.find(
    (c) => c.categoryName === currentCategory
  );
  if (existingCategory) {
    const restoredCart = {};
    (existingCategory.products || []).forEach((p) => {
      restoredCart[p.productId] = p.qty;
    });
    setCart(restoredCart);
  }
}, [encodedCategory]);

  return (
    <>
      <div>
        <div>
          <h1
            style={{
              background: "green",
              color: "white", 
              fontFamily: "'Baloo 2'",
              fontSize: "25px",
              padding: "2px",
              fontWeight: "bold",
              textAlign: "center",
              width: "100%",
              boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
              letterSpacing: "1px",
              marginBottom: "3px",
              position: "fixed",
              top: 0,
              left: 0,
              zIndex: 1000,  
            }}
          >
            Lakshmi Mart
            <br />
            <span
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                display: "block",
                marginTop: "2px",
                textAlign: "center",
                fontFamily: "Roboto",
              }}
            >
              FSSAI LIC Number - 20125051001066
            </span>
             <span
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                display: "block",
                marginTop: "2px",
                textAlign: "center",
                fontFamily: "Roboto",
              }}
            >
                Delivery Timings : 06:00 AM -09:00 PM
            </span>
          </h1>
        </div>

        <div className="wrapper d-flex" style={{ marginTop: isMobile ? "65px" : "170px" }}>
          {/* Sidebar */}
          {!isMobile ? (
            <div className="ml-0 p-0 sde_mnu">
              <Sidebar userType={selectedUserType} />
            </div>
          ) : (
            <div className="groceryfloating-menu">
              <Button 
                variant="primary"
                className="rounded-circle shadow"
                onClick={() => setShowMenu(!showMenu)}
              >
                <MoreVertIcon />
              </Button>

              {showMenu && (
                <div className="sidebar-container">
                  <Sidebar userType={selectedUserType} />
                </div>
              )}
            </div>
          )}

         <div className={`container ${isMobile ? "w-100" : "w-75"} `}>
          <div
                  style={{
                    position: "fixed",
                    top: "65px",     left: 0,
                    width: "100%",
                    background: "white",
                    zIndex: 999,
                    padding: "8px 12px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                  }}
                >
                  <div className="position-relative flex-grow-1 ms-5">
                    <input
                      type="text"
                      className="form-control w-60 mt-2 ps-5 "
                      placeholder="Search Products"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value.trimStart())}
                      />
                      <SearchIcon
                        className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                        style={{ pointerEvents: 'none' }}
                      />
                    </div>

          {selectedCategory && (
            <>
            <div className="d-flex align-items-center">
              <ArrowBackIcon
                className="me-2"
                style={{ color: "green", cursor: "pointer" }}
                onClick={() => navigate(`/profilePage/${userType}/${userId}`)}
              />
              <h4 className="fw-bold mb-0">{selectedCategory}</h4>
            </div>
             {(selectedCategory === "Vegetables" ||
                selectedCategory === "Fruits" ||
                selectedCategory === "Chicken") && (
                <div
                  className="mt-2 rounded-3"
                  style={{
                    backgroundColor: "#fff3e0",
                    color: "red",
                    fontSize: "13px",
                    fontWeight: "600",
                    border: "1px solid #ffd180",
                  }}
                >
                  📝 Delivery is only for Yendada and Madhurawada.
                </div>
              )}
            </>
          )}
        </div>

          {/* <div className="position-relative flex-grow-1 ms-5">
                    <input
                      type="text"
                      className="form-control w-60 mt-2 ps-5 "
                      placeholder="Search Products"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value.trimStart())}
                      />
                      <SearchIcon
                        className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                        style={{ pointerEvents: 'none' }}
                      />
                    </div> */}
  {selectedCategory && (
    <>
    {/* <div className="d-flex align-items-center">
    <ArrowBackIcon className="me-2" style={{ color: "green", cursor: "pointer" }}
        onClick={() => navigate(`/profilePage/${userType}/${userId}`)}/>      
        <h4 className="font-bold ">{selectedCategory}</h4>
      </div> */}
  <div className="d-flex justify-content-end" style={{marginTop: "90px"}}>
  <span className="text-success text-xs">
    Selected Qty:{" "}
    <span className="text-danger fw-bold">
      {Object.values(cart).reduce((sum, qty) => sum + qty, 0)}
    </span>
  </span>

 <span className="text-success text-xs ms-2">
  Total Price: Rs{" "}
  <span className="text-danger fw-bold">
    {Math.round(
      Object.entries(cart).reduce((sum, [productId, qty]) => {
        const product = products.find(
          (p) => String(p.id) === String(productId)
        );
        return (
          sum + (product ? Number(product.afterDiscount) * qty : 0)
        );
      }, 0)
    )}
  </span>
  /-
</span>
</div>

      <div className="grocery-row flex flex-wrap gap-1" style={{marginBottom: "60px"}}>
        {products
  .filter(
    (p) =>
      p.category?.toLowerCase() === selectedCategory.toLowerCase() &&
      p.status === "Approved" &&
      (searchQuery === "" ||
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()))
  )
  .map((product) => {
    const stock = Number(product.stockLeft || 0);
    const isOutOfStock = stock <= 0;

    return (
      <div
  key={product.id}
  className="w-[200px] flex flex-col p-2 bg-white rounded shadow-sm border position-relative"
  style={{ minHeight: "230px", opacity: isOutOfStock ? 0.6 : 1 }}
>
  <div className="d-flex flex-row justify-content-between absolute top-0 left-0 w-full">
    {Number(product.discount) > 0 && !isOutOfStock && (
      <span className="discount-badge">
        {Math.round(Number(product.discount))}%
      </span>
    )}

    {!isOutOfStock && (
      <span
        style={{ cursor: "pointer", marginRight: "6px", marginTop: "2px", zIndex: 3 }}
        onClick={() => toggleLike(product.id)}
      >
        {likedProducts[product.id] ? (
          <FavoriteIcon style={{ color: "red" }} />
        ) : (
          <FavoriteBorderIcon style={{ color: "grey" }} />
        )}
      </span>
    )}
  </div>

  {/* Product Image */}
  <div
    className="d-flex justify-content-center align-items-center position-relative"
    style={{ height: "90px" }}
  >
    {imageUrls[product.id]?.[0] ? (
      <img
        src={imageUrls[product.id]?.[0]}
        alt={product.name}
        decoding="async"
        loading="eager"
        fetchpriority="high"
        style={{
          maxHeight: "80px",
          maxWidth: "100%",
          objectFit: "contain",
          cursor: isOutOfStock ? "not-allowed" : "pointer",
          borderRadius: "6px",
        }}
        onClick={() => !isOutOfStock && handleImageClick(imageUrls[product.id][0], product)}
      />
    ) : (
      <span className="text-muted small">Loading Image</span>
    )}

    {isOutOfStock && (
      <div
        className="position-absolute d-flex justify-content-center align-items-center"
        style={{
          top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(255,255,255,0.75)", borderRadius: "6px", zIndex: 2,
        }}
      >
        <span
          style={{
            fontWeight: 500, backgroundColor: "grey", color: "white",
            fontSize: "10px", borderRadius: "6px", margin: "1px", padding: "2px",
          }}
        >
          Out of Stock
        </span>
      </div>
    )}
  </div>

  {/* Product Name */}
  <h6
    className="text-start fw-bold m-0"
    style={{
      fontSize: "11px",
      display: "-webkit-box",
      WebkitLineClamp: 3,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
      textOverflow: "ellipsis",
      lineHeight: "1.2em",
      maxHeight: "3.6em",
    }}
  >
    {product.name}
  </h6>

  {/* Price/MRP/Units — ONLY when in stock */}
  {!isOutOfStock && (
    <div className="text-start m-0" style={{ fontSize: "11px" }}>
      {product.afterDiscount != null && (
        <b className="text-success me-2">
          ₹{Math.round(Number(product.afterDiscount))}
        </b>
      )}
      {product.mrp != null && <s className="text-muted">₹{product.mrp}</s>}
      {product.units && (
        <b className="text-success" style={{ marginLeft: "5px" }}>
          {product.units}
        </b>
      )}
    </div>
  )}

  {/* Checkbox */}
  {!isOutOfStock && (
    <div style={{ position: "absolute", bottom: "8px", left: "8px" }}>
      <input
        type="checkbox"
        className="border-dark"
        checked={cart[product.id] > 0}
        readOnly
      />
    </div>
  )}

  {/* Add/Counter — ONLY when in stock */}
  {!isOutOfStock && (
    <div style={{ position: "absolute", bottom: "8px", right: "8px" }}>
      {cart[product.id] ? (
        <div
          className="d-flex align-items-center justify-content-between"
          style={{
            backgroundColor: "green",
            color: "white",
            borderRadius: "8px",
            padding: "2px",
            minWidth: "60px",
            // position: "relative",
          }}
        >
          <button
            className="btn btn-sm p-0 text-white"
            style={{ fontWeight: "bold", width: "25px", height: "25px" }}
            onClick={() => handleDecrementClick(product.id)}
          >
            –
          </button>
          <span className="fw-bold">{cart[product.id]}</span>
          <button
            className="btn btn-sm p-0 text-white"
            style={{ fontWeight: "bold", width: "25px", height: "25px",  opacity: canAddMore(product.id) ? 1 : 0.5,
            cursor: canAddMore(product.id) ? "pointer" : "not-allowed" }}
            onClick={() => canAddMore(product.id) && handleIncrement(product.id)}
            disabled={!canAddMore(product.id)} 
            title={!canAddMore(product.id) ? "No more stock" : "Add one"}
                >
            +
          </button>
        </div>
      ) : (
        <button
          className="btn fw-bold"
          style={{
            border: "1px solid green",
            color: "green",
            backgroundColor: "#f6fff6",
            borderRadius: "8px",
            padding: "2px 12px",
            fontSize: "13px",
          }}
          onClick={() => handleAddClick(product.id)}
          >
          ADD
        </button>
      )}
    </div>
  )}
</div>
    );
  })}
{/* Cart Bar */}
{(() => {
  const readAllCategories = () => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("allCategories");
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      const arr = Array.isArray(parsed) ? parsed : [parsed];

      return arr
        .filter(Boolean)
        .map((cat) => ({
          ...cat,
          products: Array.isArray(cat?.products) ? cat.products : [],
        }));
    } catch (e) {
      console.error("Invalid JSON in allCategories:", e);
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
          Number(p?.afterDiscountPrice ?? p?.price ?? p?.finalPrice ?? 0) || 0;
        acc.items += qty;
        acc.total += price * qty;
      }
      return acc;
    },
    { items: 0, total: 0 }
  );
  const items = summary.items;
  const total = Math.round(summary.total);
  const remaining = Math.max(0, MIN_ORDER_AMOUNT - total);
  const meetsMinimum = total >= MIN_ORDER_AMOUNT;
  return items > 0 ? (
    <div
      style={{
        position: "fixed",
        bottom: "0px",
        left: 0,
        width: "100%",
        backgroundColor: "green",
        color: "white",
        padding: "12px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontWeight: "bold",
        zIndex: 2000,
        borderRadius: "20px",
        marginTop: "10px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        🛒
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            lineHeight: "1.2",
          }}
        >
          <span style={{ fontSize: "12px" }}>{items} items</span>
          <span style={{ fontSize: "12px" }}>₹{total}</span>

          {!meetsMinimum && (
            <span style={{ fontSize: "10px", color: "#ffe6e6" }}>
              Add ₹{remaining} more (Min order ₹{MIN_ORDER_AMOUNT})
            </span>
          )}
        </div>
      </div>
      <button
        type="button"
        className="text-white fw-bold d-flex align-items-center gap-1"
        style={{
          fontSize: "12px",
          cursor: meetsMinimum ? "pointer" : "not-allowed",
          background: "transparent",
          border: "none",
          opacity: meetsMinimum ? 1 : 0.6,
        }}
        disabled={!meetsMinimum}
        onClick={() => {
          if (!meetsMinimum) return;          
          navigate(`/groceryChristmasCart/${userType}/${userId}`); 
        }}
      >
        {meetsMinimum ? "View Cart →" : `Min ₹${MIN_ORDER_AMOUNT}`}
      </button>
    </div>
  ) : null;
})()}
      </div>
      </>
  )}  
</div>
    </div>    
    <Footer/>
      </div>
      <Modal show={showZoomModal} onHide={() => { setShowZoomModal(false); setZoomProduct(null); }} centered>
  <button
    className="close-button text-end mt-0"
    onClick={() => { setShowZoomModal(false); setZoomProduct(null); }}
  >
    &times;
  </button>
  <Modal.Body className="text-center">
    <div className="zoom-container">
      <img src={zoomImage} alt={zoomProduct?.name || "Zoomed Product"} className="zoom-image" />
    </div>
    <h6 className="text-start fw-bold m-0" style={{ fontSize: "12px" }}>
      {zoomProduct?.name || ""}
    </h6>
    {/* <p className="text-start text-muted m-0" style={{ fontSize: "12px" }}>
      MRP: ₹{zoomProduct?.mrp ?? ""}
    </p> */}
    {zoomProduct?.afterDiscount != null && (
      <p className="text-start m-0" style={{ fontSize: "12px" }}>
        <b className="text-success me-2">₹{Math.round(Number(zoomProduct.afterDiscount))}</b>
        {zoomProduct?.mrp ? <s className="text-muted">₹{zoomProduct.mrp}</s> : null}
      </p>
    )}
  </Modal.Body>
</Modal>
    </>
  );
};
<style jsx>{`
       .zoomable-image {
          transition: transform 0.3s ease-in-out;
        }
        .zoomable-image:hover {
          transform: scale(1.1);
        }
        .zoom-container {
          position: relative;
          display: inline-block;
        }
    .close-button {
      position: absolute;
      top: 4px;  
      right: 5px;  
      background: red;
      border: none;
      font-size: 24px;
      color: white;
      padding: 5px;
      border-radius: 50%;
      cursor: pointer;
      transition: 0.3s;
    }
    .close-button:hover {
      background: darkred;
    }
         .zoom-image {
        max-width: 70%;
        height: 50%;
        border-radius: 5px;
        }
      `}</style>

export default GroceryChristmasOffers;