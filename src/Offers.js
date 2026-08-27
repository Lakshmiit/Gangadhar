import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useLayoutEffect,
  useCallback,
} from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "./App.css";
import Sidebar from "./Sidebar.js";
import Footer from "./Footer.js";
import Header from "./Header.js";
import "bootstrap/dist/css/bootstrap.min.css";
import { Dashboard as MoreVertIcon } from "@mui/icons-material";
import { Button, Carousel, Modal } from "react-bootstrap";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ImageCache from "./utils/ImageCache";
// import { appConfig } from "./config";

function createLimiter(max = 8) {
  let active = 0;
  const queue = [];
  const next = () => {
    if (active >= max || queue.length === 0) return;
    active++;
    const fn = queue.shift();
    fn().finally(() => {
      active--;
      next();
    });
  };
  return (task) =>
    new Promise((resolve, reject) => {
      queue.push(() => task().then(resolve, reject));
      next();
    });
}

const OffersProductCard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const encodedCategory =
    location.state?.encodedCategory || localStorage.getItem("encodedCategory");
  const { userType, userId, selectedUserType } = useParams();
  const [isMobile, setIsMobile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [productData, setProductData] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [imageUrls, setImageUrls] = useState({});
  const [imageLoading, setImageLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showGallery, setShowGallery] = useState(false);
  const [galleryProduct, setGalleryProduct] = useState(null);
  const observerRef = useRef(null);
  const observedMapRef = useRef(new Map());
  const visibleSetRef = useRef(new Set());
  const limiterRef = useRef(createLimiter(8));
  const imageUrlsRef = useRef({});
  useEffect(() => {
    imageUrlsRef.current = imageUrls;
  }, [imageUrls]);
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.crossOrigin = "";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    return () => {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "auto";
      }
    };
  }, []);

  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        const res = await fetch(
          `https://localhost:7091/api/Product/GetAllProductList`,
        );
        const list = await res.json();
        if (canceled) return;
        setProductData(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error("Load products failed", e);
        if (!canceled) setProductData([]);
      } finally {
        if (!canceled) setImageLoading(false);
      }
    })();
    return () => {
      canceled = true;
    };
  }, []);

  useEffect(() => {
    (async () => {
      if (!encodedCategory) {
        setSelectedCategory(null);
        setProducts([]);
        return;
      }
      try {
        const decoded = decodeURIComponent(encodedCategory);
        setSelectedCategory(decoded);
        setProducts([]);
        const { data } = await axios.get(
          `https://localhost:7091/api/Product/GetProductsByCategory?Category=${encodeURIComponent(decoded)}`,
        );
        setProducts(Array.isArray(data) ? data : []);
      } catch {
        setProducts([]);
      }
    })();
  }, [encodedCategory]);

  const list = useMemo(
    () => (selectedCategory ? products : productData) || [],
    [selectedCategory, products, productData],
  );

  const filtered = useMemo(() => {
    const q = (searchQuery || "").toLowerCase().trim();
    const normalize = (s) =>
      s?.toLowerCase().trim().endsWith("s")
        ? s.toLowerCase().trim().slice(0, -1)
        : s?.toLowerCase().trim();
    return list
      .filter((p) => {
        const nm = p.productName?.toLowerCase().trim() || "";
        return nm.includes(q) || normalize(nm)?.includes(normalize(q));
      })
      .slice()
      .reverse();
  }, [list, searchQuery]);

  const observeCard = (el, productId) => {
    if (!el) return;
    observedMapRef.current.set(String(productId), el);
    observerRef.current?.observe(el);
  };

  const maybeFetchFirstImages = useCallback(async () => {
    const list = Array.isArray(filtered) ? filtered : [];
    const visibleIds = Array.from(visibleSetRef.current);
    const firstTwelveIds = list.slice(0, 12).map((p) => String(p.id));
    const targetIds = Array.from(new Set([...firstTwelveIds, ...visibleIds]));

    for (const pid of targetIds) {
      // use the ref to avoid depending on imageUrls
      if (imageUrlsRef.current[pid]?.length) continue;

      const product = list.find((p) => String(p.id) === pid);
      const first = (product?.productPhotos || [])[0];

      if (!first) {
        setImageUrls((prev) => ({ ...prev, [pid]: [] }));
        continue;
      }

      const cached = await ImageCache.getBase64(first);
      if (cached) {
        const url = `data:image/jpeg;base64,${cached}`;
        setImageUrls((prev) => ({
          ...prev,
          [pid]: prev[pid]?.length ? prev[pid] : [url],
        }));
        continue;
      }

      limiterRef.current(async () => {
        try {
          const res = await fetch(
            `https://localhost:7091/api/FileUpload/download?generatedfilename=${encodeURIComponent(first)}`,
          );
          const data = await res.json();
          const b64 = data?.imageData || "";
          if (!b64) return;

          await ImageCache.setBase64(first, b64);
          const url = `data:image/jpeg;base64,${b64}`;

          setImageUrls((prev) => ({
            ...prev,
            [pid]: prev[pid]?.length ? prev[pid] : [url],
          }));
        } catch {}
      });
    }
  }, [filtered]);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const pid = e.target.getAttribute("data-pid");
          if (!pid) continue;
          if (e.isIntersecting) {
            visibleSetRef.current.add(pid);
          } else {
          }
        }
        maybeFetchFirstImages();
      },
      {
        root: null,
        rootMargin: "400px 0px",
        threshold: 0.01,
      },
    );
    for (const [pid, el] of observedMapRef.current.entries()) {
      if (el) observerRef.current.observe(el);
      console.log(pid);
    }
    return () => observerRef.current?.disconnect();
  }, [filtered, maybeFetchFirstImages]);

  useEffect(() => {
    if ((filtered?.length || 0) <= 12) {
      filtered.forEach((p) => visibleSetRef.current.add(String(p.id)));
      maybeFetchFirstImages();
    }
  }, [filtered, maybeFetchFirstImages]);

  const openGallery = async (product) => {
    setGalleryProduct(product);
    setShowGallery(true);

    const photos = product?.productPhotos || [];
    if (!photos.length) {
      setImageUrls((prev) => ({
        ...prev,
        [product.id]: prev[product.id] || [],
      }));
      return;
    }

    const first = photos[0];
    let firstUrl = imageUrls[product.id]?.[0] || null;
    if (!firstUrl) {
      const cached = await ImageCache.getBase64(first);
      if (cached) {
        firstUrl = `data:image/jpeg;base64,${cached}`;
      } else {
        try {
          const res = await fetch(
            `https://localhost:7091/api/FileUpload/download?generatedfilename=${encodeURIComponent(first)}`,
          );
          const data = await res.json();
          if (data?.imageData) {
            ImageCache.setBase64(first, data.imageData);
            firstUrl = `data:image/jpeg;base64,${data.imageData}`;
          }
        } catch {}
      }
    }

    setImageUrls((prev) => ({
      ...prev,
      [product.id]: firstUrl
        ? prev[product.id]?.length
          ? prev[product.id]
          : [firstUrl]
        : prev[product.id] || [],
    }));

    await Promise.allSettled(
      (photos.slice(1) || []).map((photo) =>
        limiterRef.current(async () => {
          try {
            const c = await ImageCache.getBase64(photo);
            let url = null;
            if (c) {
              url = `data:image/jpeg;base64,${c}`;
            } else {
              const res = await fetch(
                `https://localhost:7091/api/FileUpload/download?generatedfilename=${encodeURIComponent(photo)}`,
              );
              const data = await res.json();
              if (!data?.imageData) return;
              await ImageCache.setBase64(photo, data.imageData);
              url = `data:image/jpeg;base64,${data.imageData}`;
            }
            if (url) {
              setImageUrls((prev) => {
                const arr = prev[product.id] || (firstUrl ? [firstUrl] : []);
                if (arr.includes(url)) return prev;
                return { ...prev, [product.id]: [...arr, url] };
              });
            }
          } catch {}
        }),
      ),
    );
  };

  const closeGallery = () => {
    setShowGallery(false);
    setGalleryProduct(null);
  };

  const getDiscounted = (p) => {
    if (p?.rate == null) return null;
    if (p?.discount == null) return Math.round(Number(p.rate));
    const price = Number(p.rate) - (Number(p.rate) * Number(p.discount)) / 100;
    return Math.round(price);
  };

  return (
    <>
      <Header />
      <div className="wrapper d-flex mt-100">
        {!isMobile && (
          <div className="ml-0 m-4 p-0 sde_mnu">
            <Sidebar userType={selectedUserType} />
          </div>
        )}

        {isMobile && (
          <div className="floating-menu">
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

        <div className={`container m-1 ${isMobile ? "w-100" : "w-75"}`}>
          <div className="d-flex justify-content-center">
            <div className="position-relative flex-grow-1 ms-4">
              <input
                type="text"
                className="form-control w-60 m-2 ps-5"
                placeholder="Search Products"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.trimStart())}
              />
              <SearchIcon
                className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                style={{ pointerEvents: "none" }}
              />
            </div>

            {selectedCategory && (
              <div
                className="d-flex align-items-center position-relative"
                style={{ gap: "5px" }}
              >
                <Button
                  style={{
                    background: "linear-gradient(45deg, #ff9800, #ff5722)",
                  }}
                  size="sm"
                  className="ms-2"
                  onClick={() => setSelectedCategory(null)}
                >
                  Show All Products
                </Button>
              </div>
            )}
          </div>

          {selectedCategory && (
            <div className="d-flex align-items-center">
              <ArrowBackIcon
                className="me-2"
                style={{ color: "#ff9800", cursor: "pointer" }}
                onClick={() => navigate(`/profilePage/${userType}/${userId}`)}
              />
              <h5 className="fw-bold mb-0">{selectedCategory}</h5>
            </div>
          )}

          <div className="row row-cols-3 g-3">
            {filtered.map((product, idx) => {
              const imgs = imageUrls[product.id] || [];
              const firstImg = imgs[0];
              const discounted = getDiscounted(product);
              const discountPct = Math.round(Number(product.discount) || 0);

              return (
                <div key={product.id} className="col-6 col-md-3">
                  <div
                    className="w-100 d-flex flex-column p-2 rounded shadow-sm border position-relative"
                    style={{ minHeight: 200 }}
                    ref={(el) => observeCard(el, product.id)}
                    data-pid={String(product.id)}
                  >
                    <div
                      className="d-flex justify-content-center align-items-center bg-white position-relative"
                      style={{ height: 90 }}
                    >
                      {discountPct > 0 && (
                        <div
                          className="discount-badge-offers"
                          aria-label={`${discountPct}% off`}
                        >
                          <div className="discount-badge-offers__value">
                            {discountPct}%
                          </div>
                        </div>
                      )}

                      {imageLoading ? (
                        <div
                          style={{
                            position: "relative",
                            width: "54px",
                            height: "54px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <div className="img-outer-ring" />
                          <div className="img-inner-ring" />
                          <div className="img-center-dot" />
                        </div>
                      ) : (
                        <img
                          src={firstImg}
                          alt={""}
                          // decoding="async"
                          // loading={idx < 12 ? 'eager' : 'lazy'}
                          // fetchpriority={idx < 12 ? 'high' : 'low'}
                          style={{
                            maxHeight: 80,
                            maxWidth: "100%",
                            objectFit: "contain",
                            cursor: "pointer",
                            borderRadius: 6,
                          }}
                          onClick={() => openGallery(product)}
                        />
                      )}
                    </div>

                    <h6
                      className="text-start fw-bold m-0"
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
                      {product.productName}
                    </h6>

                    <div
                      className="text-start m-0"
                      style={{ fontSize: "11px" }}
                    >
                      {discounted != null && (
                        <b className="text-success me-2">₹{discounted}</b>
                      )}
                      {product.rate != null && (
                        <s className="text-muted">₹{product.rate}</s>
                      )}
                    </div>

                    <div style={{ position: "absolute", bottom: 8, right: 8 }}>
                      <button
                        className="btn fw-bold"
                        style={{
                          border: "none",
                          color: "black",
                          background:
                            "linear-gradient(45deg, #ff9800, #ff5722)",
                          borderRadius: 8,
                          padding: "2px 12px",
                          fontSize: 13,
                        }}
                        onClick={() => {
                          if (userId === "guest") {
                            window.location.href =
                              "https://handymanserviceproviders.com/";
                          } else {
                            navigate(
                              `/offersBuyProduct/${userType}/${userId}/${product.id}`,
                            );
                          }
                        }}
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Modal show={showGallery} onHide={closeGallery} centered>
            <button
              className="close-button text-end mt-0"
              onClick={closeGallery}
            >
              &times;
            </button>
            <Modal.Body className="text-center">
              {galleryProduct && (
                <>
                  <div className="zoom-container">
                    <Carousel>
                      {(imageUrls[galleryProduct.id] || []).map((img, idx) => (
                        <Carousel.Item key={idx}>
                          <img
                            src={img}
                            alt={`img-${idx}`}
                            className="zoom-image"
                            style={{
                              maxWidth: "100%",
                              height: "auto",
                              borderRadius: 5,
                            }}
                          />
                        </Carousel.Item>
                      ))}
                    </Carousel>
                  </div>

                  <h6
                    className="text-start fw-bold mt-3 mb-1"
                    style={{ fontSize: 12 }}
                  >
                    {galleryProduct.productName}
                  </h6>
                  <p className="text-start m-0" style={{ fontSize: 12 }}>
                    {galleryProduct.rate != null && (
                      <span className="text-muted me-2">
                        MRP: <s>₹{galleryProduct.rate}</s>
                      </span>
                    )}
                    {getDiscounted(galleryProduct) != null && (
                      <span className="text-success fw-bold me-2">
                        After Discount: ₹{getDiscounted(galleryProduct)}
                      </span>
                    )}

                    {galleryProduct.discount != null && (
                      <span className="text-danger me-2">
                        Discount: {galleryProduct.discount}%
                      </span>
                    )}
                  </p>

                  <div className="text-start">
                    <Button
                      className="btn fw-bold mt-2"
                      style={{
                        background: "linear-gradient(45deg, #ff9800, #ff5722)",
                      }}
                      onClick={() => {
                        closeGallery();
                        navigate(
                          `/offersBuyProduct/${userType}/${userId}/${galleryProduct.id}`,
                        );
                      }}
                    >
                      Buy Now
                    </Button>
                  </div>
                </>
              )}
            </Modal.Body>
          </Modal>
        </div>
      </div>

      <style jsx>{`
        .zoomable-image {
          transition: transform 0.3s ease-in-out;
        }
        .zoomable-image:hover {
          transform: scale(1.05);
        }
        .zoom-container {
          position: relative;
          display: inline-block;
          width: 100%;
        }
        .close-button {
          position: absolute;
          top: 8px;
          right: 10px;
          background: red;
          border: none;
          font-size: 24px;
          color: white;
          padding: 5px 10px;
          border-radius: 50%;
          cursor: pointer;
          transition: 0.3s;
          z-index: 2;
        }
        .close-button:hover {
          background: darkred;
        }
      `}</style>

      <Footer />
    </>
  );
};

export default OffersProductCard;
