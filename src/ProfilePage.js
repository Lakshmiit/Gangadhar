import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./App.css";
import { Modal, Button } from "react-bootstrap";
import ImageCache from "./utils/ImageCache";
import { getGroceryItems } from "./utils/groceryStore";
import axios from "axios";
import Footer from "./Footer.js";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import StorefrontIcon from "@mui/icons-material/Storefront";
import DeliveryDiningIcon from "@mui/icons-material/DeliveryDining";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import { playNotificationSound } from "./notificationSound";
import { speakAlert } from "./speechAlert";
import { useNavigate, useParams } from "react-router-dom";
import Logo from "./img/Hm_Logo 1.png";
import SearchIcon from "@mui/icons-material/Search";
import LogoutIcon from "@mui/icons-material/Logout";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import ApartmentIcon from "@mui/icons-material/Apartment";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import MenuIcon from "@mui/icons-material/Menu";
import Electrical from "./img/Electrical.jpeg";
import Electronics from "./img/Electronics.jpeg";
import Plumbing from "./img/Plumbing.jpeg";
import Hardware from "./img/Hardware.jpeg";
import HomeDecor from "./img/HomeDecor.jpeg";
import HomeAppliances from "./img/Kitchenware.jpeg";
import BabyKidsImg from "./img/BabyKids.jpeg";
import PoojaImg from "./img/Pooja.jpeg";
import HairImg from "./img/HairCare.jpeg";
import BathBodyImg from "./img/BathBody.jpeg";
import RavvaImg from "./img/RiceRavva.jpeg";
import AttaImg from "./img/AttaFlours.jpeg";
import OilsImg from "./img/OilDals.jpeg";
import SugarImg from "./img/SugarSalt.jpeg";
import MasalaImg from "./img/MasalaPickles.jpeg";
import MilkImg from "./img/MilkGhee.jpeg";
import BreadsImg from "./img/BreadEggs.jpeg";
import DrinkImg from "./img/DrinkJuice.jpeg";
import BakeryImg from "./img/BakerySweets.jpeg";
import VegetablesImg from "./img/Vegetables.jpeg";
import FruitsImg from "./img/Fruits.jpeg";
import DryfruitsImg from "./img/Bakery.jpeg";
import SoupsImg from "./img/SoupsSauces.jpeg";
import KitchenImg from "./img/Kitchenware.jpeg";
import BiscuitsImg from "./img/Biscuits.jpeg";
import HealthImg from "./img/HealthCare.jpeg";
import SkinImg from "./img/SkinFace.jpeg";
import TeaImg from "./img/teacoffee.jpeg";
import NamkeenImg from "./img/InstantFoodImg.jpeg";
import HouseHoldImg from "./img/HouseHold.jpeg";
import ChickenImg from "./img/Chicken.jpeg";
import StationaryImg from "./img/Stationary.jpeg";
import KidsImg from "./img/KidsZone.jpeg";
import setkurti from "./img/3pcsset.jpeg";
import kurti from "./img/2pcsset.jpeg";
import { CartStorage } from "./CartStorage";
import IcecreamImg from "./img/IceCreams.jpeg";
import DwakraProducts from "./img/DwakraLogo.jpeg";
import UnbeatableImg from "./img/MilkOffers.jpeg";
import ComboPackImg from "./img/ComboPack.jpeg";
import AddIcCallIcon from "@mui/icons-material/AddIcCall";
import RoyalImg from "./img/LMartLogo.jpeg";
import HomeElectricalImg from "./img/HomeElectrical.jpeg";
import HomePlumbingImg from "./img/HomePlumbing.jpeg";
import OffersBannerModal from "./OffersBannerModal.js";
import LiveChatWidget from "./components/LiveChatWidget";
import PushNotificationService from "./utils/PushNotificationService";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {
  getVendorProfileById,
  makePlaceholderImage,
  getVendorIcon,
} from "./utils/vendorStorage";
import { getVendorsByPincode } from "./utils/vendorListStore";
import PotRewardGame from "./PotRewardGame.js";
// import { appConfig } from "./config";

const getMenuList = (
  userType,
  userId,
  category,
  district,
  ZipCode,
  technicianFullName,
  isMobile,
) => {
  const iconSize = isMobile ? 20 : 40;
  const customer = [
    {
      MenuIcon: <SupportAgentIcon sx={{ fontSize: 40 }} />,
      MenuTitle: "Raise Ticket",
      TargetUrl: `/raiseTicket/${userType}/${userId}`,
    },
    {
      MenuIcon: <PersonOutlineIcon sx={{ fontSize: 40 }} />,
      MenuTitle: "Book Technician",
      TargetUrl: `/bookTechnician/${userType}/${userId}`,
    },
    // {
    //   MenuIcon: <StorefrontIcon sx={{ fontSize: 40 }} />,
    //   MenuTitle: "Buy Products",
    //   TargetUrl: `/buyProducts/${userType}/${userId}`,
    // },
    ...(!isMobile
      ? [
          {
            MenuIcon: <LocalOfferIcon sx={{ fontSize: iconSize }} />,
            MenuTitle: "Buy Product Offers",
            TargetUrl: `/offersIcons/${userType}/${userId}`,
          },
        ]
      : []),
    {
      MenuIcon: <ApartmentIcon sx={{ fontSize: 40 }} />,
      MenuTitle: isMobile
        ? "Apartment AMC"
        : "Apartment Common Area Maintenance",
      TargetUrl: `/aboutApartmentRaiseTicket/${userType}/${userId}`,
    },
    {
      MenuIcon: <StorefrontIcon sx={{ fontSize: 40 }} />,
      MenuTitle: "Vendor Portal",
      TargetUrl: "/vendor/login",
    },
    ...(!isMobile
      ? [
          {
            MenuIcon: <PermIdentityIcon sx={{ fontSize: iconSize }} />,
            MenuTitle: "Accounts",
          },
        ]
      : []),
    ...(!isMobile
      ? [
          {
            MenuIcon: <DeliveryDiningIcon sx={{ fontSize: iconSize }} />,
            MenuTitle: "Delivery Partner",
            TargetUrl: `/deliveryPartner/${userType}/${userId}`,
          },
        ]
      : []),
  ];
  switch (userType) {
    case "customer":
      return customer;
    default:
      return [];
  }
};
const categories = [
  { label: "Home Decors", value: "Home Decors", image: HomeDecor },
  { label: "Home Appliances", value: "Home Appliances", image: HomeAppliances },
  { label: "Electrical Items", value: "Electrical items", image: Electrical },
  {
    label: "Electronics Appliances",
    value: "Electronics appliances",
    image: Electronics,
  },
  { label: "Plumbing & Sanitary", value: "Sanitary items", image: Plumbing },
  { label: "Hardware Items", value: "Hardware items", image: Hardware },
];

const groceryCategories = [
  {
    label: "Grocery Value Combo Packs",
    value: "Grocery Value Combo Packs",
    image: ComboPackImg,
  },
  { label: "LMart Products", value: "LMart Special", image: RoyalImg },
  {
    label: "Unbeatable 10 Offers",
    value: "Unbeatable Offers",
    image: UnbeatableImg,
  },
  { label: "Rice & Ravva", value: "Rice & Ravva", image: RavvaImg },
  { label: "Atta & Flours", value: "Atta & Flours", image: AttaImg },
  { label: "Vegetables", value: "Vegetables", image: VegetablesImg },
  { label: "Fruits", value: "Fruits", image: FruitsImg },
  { label: "Oils & Dals", value: "Oils & Dals", image: OilsImg },
  {
    label: "Masala, Spices & Pickles",
    value: "Masala, Spices & Pickles",
    image: MasalaImg,
  },
  {
    label: "Instant Food, Chips & Namkeen",
    value: "Instant Food, Chips & Namkeen",
    image: NamkeenImg,
  },
  { label: "Skin & Face Care", value: "Skin & Face Care", image: SkinImg },
  { label: "Bath & Body Care", value: "Bath & Body Care", image: BathBodyImg },
  { label: "Hair Care", value: "Hair Care", image: HairImg },
  { label: "Soups & Sauces", value: "Soups & Sauces", image: SoupsImg },
  { label: "Tea & Coffee", value: "Tea & Coffee", image: TeaImg },
  {
    label: "Biscuits & Chocolates",
    value: "Biscuits & Chocolates",
    image: BiscuitsImg,
  },
  { label: "Milk, Curd & Ghee", value: "Milk, Curd & Ghee", image: MilkImg },
  {
    label: "Sugar, Salt & Jaggery",
    value: "Sugar, Salt & Jaggery",
    image: SugarImg,
  },
  {
    label: "Dry Fruits & Bakery",
    value: "Dry Fruits & Bakery",
    image: DryfruitsImg,
  },
  { label: "Pooja Essentials", value: "Puja Essentials", image: PoojaImg },
  { label: "Health Care", value: "Health Care", image: HealthImg },
  { label: "Drinks & Juices", value: "Drinks & Juices", image: DrinkImg },
  { label: "Bread & Eggs", value: "Bread & Eggs", image: BreadsImg },
  { label: "Home Needs", value: "Home Needs", image: HouseHoldImg },
  { label: "Ice Creams", value: "Ice Creams", image: IcecreamImg },
  { label: "Sweets & Snacks", value: "Sweets & Snacks", image: BakeryImg },
  { label: "Stationary", value: "Stationary", image: StationaryImg },
  { label: "Baby Products", value: "Baby Products", image: BabyKidsImg },
  { label: "Kids Zone", value: "Kids Zone", image: KidsImg },
  { label: "DWCRA Products", value: "DWCRA", image: DwakraProducts },
  { label: "Chicken", value: "Chicken", image: ChickenImg },
  {
    label: "Electrical",
    value: "Electrical Products",
    image: HomeElectricalImg,
  },
  { label: "Plumbing", value: "Plumbing Products", image: HomePlumbingImg },
  { label: "Kitchenware", value: "Kitchenware Appliances", image: KitchenImg },
  { label: "Home Decors", value: "Home Decors", image: HomeDecor },
  {
    label: "Electronics Appliances",
    value: "Electronics appliances",
    image: Electronics,
  },
  { label: "Hardware Items", value: "Hardware items", image: Hardware },
];
const collectionsCategories = [
  { label: "Dupatta Sets", value: "Dupatta Sets", image: setkurti },
  { label: "Kurta Sets", value: "Kurta Sets", image: kurti },
];

const IMAGE_API = `https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/FileUpload/download?generatedfilename=`;

const VENDOR_ORDERS_API_BASE =
  "https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api";
const GET_VENDOR_ORDERS_URL = `${VENDOR_ORDERS_API_BASE}/Mart/GetVendorOrdersByVendorId`;
const VENDOR_ORDERS_POLL_INTERVAL_MS = 25000;

const DEFAULT_PINCODE = "530048";

const ProfilePage = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleVendorPortal = () => {
    const vendorId = localStorage.getItem("vendorSession");
    if (vendorId) {
      navigate(`/vendor/preview/${vendorId}`);
      return;
    }

    const customerMobile = profile?.mobileNumber?.trim();

    if (userId) {
      localStorage.setItem("vendorRegistrationUserId", userId);
      console.log("Vendor registration userId saved:", userId);
    }
    if (userType && userId) {
      localStorage.setItem("vendorReturnUserId", userId);
      localStorage.setItem("vendorReturnUserType", userType);
    }
    if (customerMobile) {
      localStorage.setItem("vendorRegistrationMobileNumber", customerMobile);

      console.log("Vendor registration mobile saved:", customerMobile);
    }

    if (userType && userId) {
      localStorage.setItem(
        "vendorReturnProfile",
        `/profilePage/${userType}/${userId}`,
      );
    }

    navigate("/vendor/login");
  };

  const [vendorSessionId, setVendorSessionId] = useState(
    () => localStorage.getItem("vendorSession") || "",
  );
  const [vendorProfile, setVendorProfile] = useState(null);
  const [vendorSelectedCategories, setVendorSelectedCategories] = useState([]);
  const [activeVendorCategoryTab, setActiveVendorCategoryTab] = useState("");

  const [vendorOrderCount, setVendorOrderCount] = useState(0);
  const [vendorHasNewOrder, setVendorHasNewOrder] = useState(false);
  const vendorKnownOrderIdsRef = useRef(null);
  const vendorKnownOrderStatusRef = useRef(null);
  const { userId } = useParams();
  const { userType } = useParams();
  const [category, setCategory] = useState("");
  const [fullName, setFullName] = useState("");
  const [menuList, setMenuList] = useState([]);
  const [profile, setProfile] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [allTickets, setAllTickets] = useState([]);
  const menuRef = useRef(null);
  const ticketScrollRef = useRef(null);
  const [products] = useState([]);
  const [cartSummary, setCartSummary] = useState({
    items: 0,
    total: 0,
    products: [],
  });
  const [deliveryProfile, setDeliveryProfile] = useState(null);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [groceryData, setGroceryData] = useState([]);
  const [state, setState] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [zipCode, setZipCode] = useState(DEFAULT_PINCODE);
  const [approvedVendorListJson, setApprovedVendorListJson] = useState([]);
  const [mobileNumber, setMobileNumber] = useState("");
  const [status, setStatus] = useState("");
  const [id, setId] = useState("");
  const [pinCode, setPinCode] = useState(DEFAULT_PINCODE);
  const [martId, setMartId] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const clickLock = useRef(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [partnerStatus, setPartnerStatus] = useState("");
  const [deliveryOrderCount, setDeliveryOrderCount] = useState(0);
  const [deliveryHasNewOrder, setDeliveryHasNewOrder] = useState(false);
  const deliveryKnownOrderIdsRef = useRef(null);
  const [paidAmount] = useState("");
  const [items] = useState("");
  const HEADER_H = 0;
  const MOBILE_ICONS_H = 0;
  const MOBILE_EXTRA = 0;
  const MOBILE_PADDING_TOP = HEADER_H + MOBILE_ICONS_H + MOBILE_EXTRA;
  const [cartImages, setCartImages] = useState({});
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [cashbackAmount, setCashbackAmount] = useState(0);
  const [cart, setCart] = useState({});
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [zoomImage, setZoomImage] = useState("");
  const [zoomProduct, setZoomProduct] = useState(null);
  const displayProducts =
    searchQuery.trim().length > 0 ? filteredProducts : products;
  const [imageLoading] = useState(true);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [showOffersModal, setShowOffersModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [searchOrderId, setSearchOrderId] = useState("");
  const [walletAmount, setWalletAmount] = useState("0");
  const [walletLoading, setWalletLoading] = useState(true);
  const [showWalletMessage, setShowWalletMessage] = useState(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(
    () => localStorage.getItem(`hm_push_enabled_${userId}`) === "true",
  );
  const [pushDismissed, setPushDismissed] = useState(
    () => sessionStorage.getItem("hm_push_dismissed") === "true",
  );
  const [pushLoading, setPushLoading] = useState(false);
  const pushSupported = PushNotificationService.isSupported();
  const [deliveryTicketsLoading, setDeliveryTicketsLoading] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState("");
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [autoOrderPrompt, setAutoOrderPrompt] = useState(null);
  const martTicketSyncRef = useRef(false);
  const [selectedMartTab, setSelectedMartTab] = useState("Lakshmi Mart");
  const [selectedVendorJsonCategory, setSelectedVendorJsonCategory] =
    useState("");
  const [preferLMartDefault, setPreferLMartDefault] = useState(false);
  const vendorTabsRef = useRef(null);

  useEffect(() => {
    if (!selectedMartTab || !vendorTabsRef.current) return;

    const activeTab = vendorTabsRef.current.querySelector(
      `[data-vendor-id="${selectedMartTab}"]`,
    );

    if (activeTab) {
      activeTab.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [selectedMartTab]);
  useEffect(() => {
    const vendor = approvedVendorListJson.find(
      (v) => v.vendorId === selectedMartTab,
    );
    setSelectedVendorJsonCategory(vendor?.categories?.[0]?.category || "");
  }, [selectedMartTab, approvedVendorListJson]);

  const scrollVendorTabs = (direction) => {
    if (!vendorTabsRef.current) return;
    vendorTabsRef.current.scrollBy({
      left: direction * 180,
      behavior: "smooth",
    });
  };

  const LMART_FALLBACK_PINCODE = DEFAULT_PINCODE;
  useEffect(() => {
    const effectivePincode =
      String(zipCode || pinCode || DEFAULT_PINCODE).trim() || DEFAULT_PINCODE;

    let cancelled = false;

    (async () => {
      try {
        const vendors = await getVendorsByPincode(effectivePincode);

        if (cancelled) return;

        let approvedVendors = vendors.filter((v) => v.status === "Approved");

        const isDistrictVisakhapatnam =
          (district || "").trim().toLowerCase() === "visakhapatnam";

        let usedFallback = false;

        if (approvedVendors.length === 0 && isDistrictVisakhapatnam) {
          try {
            const fallbackVendors = await getVendorsByPincode(
              LMART_FALLBACK_PINCODE,
            );
            const fallbackApproved = (fallbackVendors || []).filter(
              (v) => v.status === "Approved",
            );
            const lmartVendor = fallbackApproved.find(
              (v) =>
                String(v.storeName || "")
                  .trim()
                  .toLowerCase()
                  .replace(/\s+/g, "") === "lmart",
            );
            if (lmartVendor) {
              approvedVendors = [lmartVendor];
              usedFallback = true;
            }
          } catch (fallbackErr) {
            console.error("LMart fallback fetch failed:", fallbackErr);
          }
        }
        setApprovedVendorListJson(approvedVendors);

        if (approvedVendors.length > 0) {
          setSelectedMartTab((current) => {
            const currentExists = approvedVendors.some(
              (v) => v.vendorId === current,
            );

            let nextVendorId;
            if (currentExists && !usedFallback) {
              nextVendorId = current;
            } else if (usedFallback) {
              nextVendorId = approvedVendors[0].vendorId;
            } else if (preferLMartDefault) {
              const lmartVendor = approvedVendors.find(
                (v) =>
                  String(v.storeName || "")
                    .trim()
                    .toLowerCase()
                    .replace(/\s+/g, "") === "lmart",
              );
              nextVendorId = lmartVendor
                ? lmartVendor.vendorId
                : approvedVendors[0].vendorId;
            } else {
              nextVendorId = approvedVendors[0].vendorId;
            }

            if (nextVendorId) {
              localStorage.setItem("selectedVendorId", nextVendorId);
            }

            return nextVendorId || "";
          });
        } else {
          setSelectedMartTab("");
          localStorage.removeItem("selectedVendorId");
        }
      } catch (error) {
        console.error("Error fetching vendors for pincode:", error);
        if (!cancelled) {
          setApprovedVendorListJson([]);
          setSelectedMartTab("");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zipCode, pinCode, preferLMartDefault, district]);

  const getVendorFromJson = (vendorId) =>
    approvedVendorListJson.find((v) => v.vendorId === vendorId);

  const getVendorCategoriesFromJson = (vendorId) =>
    (getVendorFromJson(vendorId)?.categories || []).map((c) => c.category);

  useEffect(() => {
    const loadVendorSession = () => {
      const currentVendorId = localStorage.getItem("vendorSession") || "";
      setVendorSessionId(currentVendorId);
      if (!currentVendorId) {
        setVendorProfile(null);
        setVendorSelectedCategories([]);
        return;
      }
      const storedProfile = getVendorProfileById(currentVendorId);
      const jsonVendor = getVendorFromJson(currentVendorId);
      setVendorProfile(
        storedProfile || (jsonVendor && { name: jsonVendor.storeName }) || null,
      );

      try {
        const storedCategories = JSON.parse(
          localStorage.getItem(`vendorSelectedCategories-${currentVendorId}`) ||
            "[]",
        );
        const safeCategories =
          Array.isArray(storedCategories) && storedCategories.length
            ? storedCategories
            : getVendorCategoriesFromJson(currentVendorId);
        setVendorSelectedCategories(safeCategories);
        setActiveVendorCategoryTab((prev) =>
          safeCategories.includes(prev) ? prev : safeCategories[0] || "",
        );
      } catch {
        setVendorSelectedCategories(
          getVendorCategoriesFromJson(currentVendorId),
        );
        setActiveVendorCategoryTab("");
      }
    };
    loadVendorSession();
    window.addEventListener("storage", loadVendorSession);
    return () => window.removeEventListener("storage", loadVendorSession);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const speakNewOrderAlert = useCallback((order) => {
    const customerName = order?.customerName?.trim() || "a customer";
    const zip = order?.zipCode?.toString().trim();
    const message = zip
      ? `New order received from ${customerName}, zip code ${zip}.`
      : `New order received from ${customerName}.`;
    speakAlert(message);
  }, []);

  const speakOrderDeliveredAlert = useCallback((order) => {
    const orderLabel = order?.martId || "your order";
    const message = `Order ${orderLabel} has been delivered.`;
    speakAlert(message);
  }, []);

  useEffect(() => {
    if (!vendorSessionId) {
      setVendorOrderCount(0);
      vendorKnownOrderIdsRef.current = null;
      vendorKnownOrderStatusRef.current = null;
      return;
    }
    let cancelled = false;

    const pollVendorOrders = async () => {
      try {
        const response = await fetch(
          `${GET_VENDOR_ORDERS_URL}?vendorId=${encodeURIComponent(vendorSessionId)}`,
        );
        if (!response.ok || cancelled) return;
        const data = await response.json();
        const list = Array.isArray(data) ? data : [];
        setVendorOrderCount(list.length);

        const ids = new Set(list.map((o) => o.id));
        const previousStatusById = vendorKnownOrderStatusRef.current;
        if (vendorKnownOrderIdsRef.current) {
          const arrivedOrders = list.filter(
            (o) => !vendorKnownOrderIdsRef.current.has(o.id),
          );
          if (arrivedOrders.length) {
            setVendorHasNewOrder(true);
            try {
              playNotificationSound();
            } catch {}
            setTimeout(() => {
              arrivedOrders.forEach((order) => speakNewOrderAlert(order));
            }, 600);
          }

          if (previousStatusById) {
            const justDelivered = list.filter((o) => {
              const prevStatus = previousStatusById.get(o.id);
              const nowDelivered =
                String(o.status).toLowerCase() === "delivered";
              const wasDelivered =
                String(prevStatus || "").toLowerCase() === "delivered";
              return prevStatus !== undefined && nowDelivered && !wasDelivered;
            });
            if (justDelivered.length) {
              setTimeout(() => {
                justDelivered.forEach((order) =>
                  speakOrderDeliveredAlert(order),
                );
              }, 600);
            }
          }
        }
        vendorKnownOrderIdsRef.current = ids;
        vendorKnownOrderStatusRef.current = new Map(
          list.map((o) => [o.id, o.status]),
        );
      } catch (err) {
        console.error("Failed to poll vendor orders:", err);
      }
    };

    pollVendorOrders();
    const interval = setInterval(
      pollVendorOrders,
      VENDOR_ORDERS_POLL_INTERVAL_MS,
    );
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [vendorSessionId, speakNewOrderAlert, speakOrderDeliveredAlert]);

  const handleVendorOrdersBellClick = (e) => {
    e.stopPropagation();
    setVendorHasNewOrder(false);
    if (vendorSessionId) {
      navigate(`/vendor/orders/${vendorSessionId}`);
    } else {
      navigate("/vendor/login");
    }
  };

  const renderVendorOrderBell = () =>
    vendorSessionId ? (
      <>
        <span
          onClick={handleVendorOrdersBellClick}
          title="View vendor orders"
          className={`d-inline-flex align-items-center justify-content-center rounded-circle bg-white position-absolute${
            vendorHasNewOrder ? " vendor-bell-ring" : ""
          }`}
          style={{
            width: 20,
            height: 20,
            top: -4,
            right: -4,
            color: "#10301F",
            boxShadow: "0 1px 4px rgba(0,0,0,.35)",
            cursor: "pointer",
            zIndex: 2,
          }}
        >
          <NotificationsActiveIcon style={{ fontSize: 12 }} />
          {vendorOrderCount > 0 && (
            <span
              className="badge rounded-pill bg-danger position-absolute"
              style={{ top: -6, right: -6, fontSize: 9, padding: "2px 4px" }}
            >
              {vendorOrderCount}
            </span>
          )}
        </span>
        <style>{`
          @keyframes vendorBellRing {
            0%, 100% { transform: rotate(0deg); }
            10% { transform: rotate(-18deg); }
            20% { transform: rotate(16deg); }
            30% { transform: rotate(-14deg); }
            40% { transform: rotate(12deg); }
            50% { transform: rotate(-8deg); }
            60% { transform: rotate(6deg); }
            70%, 100% { transform: rotate(0deg); }
          }
          .vendor-bell-ring {
            animation: vendorBellRing 1s ease-in-out infinite;
            transform-origin: 50% 0%;
          }
        `}</style>
      </>
    ) : null;

  const speakNewDeliveryAssignmentAlert = useCallback((order) => {
    const orderLabel = order?.martId || "a new order";
    const message = `New order assigned to you, order ${orderLabel}.`;
    speakAlert(message);
  }, []);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get(
          `https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/DeliveryPartner/GetDeliveryPartnerDetailsByUserId?userId=${userId}`,
        );
        if (cancelled) return;
        const raw = res?.data ?? null;
        const profile = Array.isArray(raw)
          ? raw.length > 0
            ? raw[0]
            : null
          : raw && typeof raw === "object" && Object.keys(raw).length > 0
            ? raw
            : null;
        setDeliveryProfile(profile);
        setIsRegistered(profile?.isRegistered === true);
        setPartnerStatus((profile?.status || "").toLowerCase());
      } catch (err) {}
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!(isRegistered && partnerStatus === "open")) {
      setDeliveryOrderCount(0);
      deliveryKnownOrderIdsRef.current = null;
      return;
    }
    let cancelled = false;

    const pollDeliveryOrders = async () => {
      try {
        const response = await fetch(
          `https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/Mart/GetMartTicketsByUserId?userId=${userId}`,
        );
        if (!response.ok || cancelled) return;
        const data = await response.json();
        const tickets = Array.isArray(data)
          ? data
          : data && typeof data === "object"
            ? [data]
            : [];
        const assigned = tickets.filter(
          (item) => String(item?.status || "").toLowerCase() === "in progress",
        );
        setDeliveryOrderCount(assigned.length);

        const ids = new Set(assigned.map((o) => o.id));
        if (deliveryKnownOrderIdsRef.current) {
          const arrivedOrders = assigned.filter(
            (o) => !deliveryKnownOrderIdsRef.current.has(o.id),
          );
          if (arrivedOrders.length) {
            setDeliveryHasNewOrder(true);
            try {
              playNotificationSound();
            } catch {}
            setTimeout(() => {
              arrivedOrders.forEach((order) =>
                speakNewDeliveryAssignmentAlert(order),
              );
            }, 600);
          }
        }
        deliveryKnownOrderIdsRef.current = ids;
      } catch (err) {
        console.error("Failed to poll delivery partner orders:", err);
      }
    };

    pollDeliveryOrders();
    const interval = setInterval(
      pollDeliveryOrders,
      VENDOR_ORDERS_POLL_INTERVAL_MS,
    );
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isRegistered, partnerStatus, userId, speakNewDeliveryAssignmentAlert]);

  const handleDeliveryOrdersBellClick = (e) => {
    e.stopPropagation();
    setDeliveryHasNewOrder(false);
    navigate(`/deliveryPartnerDashboard/${userType}/${userId}`);
  };

  const renderDeliveryOrderBell = () =>
    isRegistered && partnerStatus === "open" ? (
      <>
        <span
          onClick={handleDeliveryOrdersBellClick}
          title="View assigned orders"
          className={`d-inline-flex align-items-center justify-content-center rounded-circle bg-white position-absolute${
            deliveryHasNewOrder ? " vendor-bell-ring" : ""
          }`}
          style={{
            width: 20,
            height: 20,
            top: -4,
            right: -4,
            color: "#10301F",
            boxShadow: "0 1px 4px rgba(0,0,0,.35)",
            cursor: "pointer",
            zIndex: 2,
          }}
        >
          <NotificationsActiveIcon style={{ fontSize: 12 }} />
          {deliveryOrderCount > 0 && (
            <span
              className="badge rounded-pill bg-danger position-absolute"
              style={{ top: -6, right: -6, fontSize: 9, padding: "2px 4px" }}
            >
              {deliveryOrderCount}
            </span>
          )}
        </span>
      </>
    ) : null;

  const handleEnablePush = async () => {
    setPushLoading(true);
    try {
      const result = await PushNotificationService.initialize(userId);
      if (result.granted) {
        setPushEnabled(true);
        localStorage.setItem(`hm_push_enabled_${userId}`, "true");
        PushNotificationService.show(
          "Notifications Enabled!",
          "You will now receive order updates and offers from Handyman.",
        );
      } else {
        alert(
          result.reason ||
            "Could not enable notifications. Please allow notifications in your browser settings.",
        );
      }
    } catch (err) {
      console.error("Push notification error:", err);
    } finally {
      setPushLoading(false);
    }
  };

  const handleDismissPush = () => {
    setPushDismissed(true);
    sessionStorage.setItem("hm_push_dismissed", "true");
  };

  /* ── Smart cache refresh: clear stale cache once per day ── */
  useEffect(() => {
    const CACHE_KEY = "hm_cache_last_cleared";
    const ONE_DAY = 24 * 60 * 60 * 1000;
    const last = Number(localStorage.getItem(CACHE_KEY) || 0);
    if (Date.now() - last > ONE_DAY) {
      ImageCache.clearAll().then(() => {
        localStorage.setItem(CACHE_KEY, String(Date.now()));
      });
    }
  }, []);

  useEffect(() => {
    console.log(
      activeVendorCategoryTab,
      vendorProfile,
      windowSize,
      state,
      address,
      mobileNumber,
      id,
      pinCode,
      paidAmount,
      paymentMode,
      martId,
      status,
      imageLoading,
      zoomProduct,
      zoomImage,
      showZoomModal,
      cartSummary,
      items,
      showMenu,
    );
  }, [
    activeVendorCategoryTab,
    vendorProfile,
    windowSize,
    state,
    address,
    mobileNumber,
    id,
    pinCode,
    paidAmount,
    paymentMode,
    martId,
    status,
    imageLoading,
    zoomProduct,
    zoomImage,
    showZoomModal,
    cartSummary,
    items,
    showMenu,
  ]);

  /* ── Vendor session: load vendor profile + their locally-saved selected categories ── */
  useEffect(() => {
    const loadVendorSession = () => {
      const currentVendorId = localStorage.getItem("vendorSession") || "";
      setVendorSessionId(currentVendorId);
      if (!currentVendorId) {
        setVendorProfile(null);
        setVendorSelectedCategories([]);
        return;
      }
      const storedProfile = getVendorProfileById(currentVendorId);
      setVendorProfile(storedProfile || null);
      try {
        const storedCategories = JSON.parse(
          localStorage.getItem(`vendorSelectedCategories-${currentVendorId}`) ||
            "[]",
        );
        const safeCategories = Array.isArray(storedCategories)
          ? storedCategories
          : [];
        setVendorSelectedCategories(safeCategories);
        setActiveVendorCategoryTab((prev) =>
          safeCategories.includes(prev) ? prev : safeCategories[0] || "",
        );
      } catch {
        setVendorSelectedCategories([]);
        setActiveVendorCategoryTab("");
      }
    };
    loadVendorSession();
    window.addEventListener("storage", loadVendorSession);
    return () => window.removeEventListener("storage", loadVendorSession);
  }, []);

  const vendorSelectedProducts = useMemo(() => {
    if (!vendorSessionId || vendorSelectedCategories.length === 0) return {};
    return vendorSelectedCategories.reduce((acc, cat) => {
      acc[cat] = allProducts.filter(
        (p) => (p.category || "Unspecified") === cat,
      );
      return acc;
    }, {});
  }, [vendorSessionId, vendorSelectedCategories, allProducts]);

  const getVendorCategoryImage = (cat) => {
    const match =
      groceryCategories.find((c) => c.value === cat) ||
      categories.find((c) => c.value === cat) ||
      collectionsCategories.find((c) => c.value === cat);
    if (match) return match.image;
    return makePlaceholderImage(cat, "ff5722", "ffffff");
  };

  useEffect(() => {
    const allVendorProducts = Object.values(vendorSelectedProducts).flat();
    if (!allVendorProducts.length) return;
    let cancelled = false;
    const controller = new AbortController();

    const targets = allVendorProducts
      .map((p) => ({
        productId: p.id,
        photo: Array.isArray(p.images) ? p.images[0] : null,
      }))
      .filter((x) => x.photo && !imageUrls[x.productId]);

    const cachedMap = {};
    const misses = [];
    for (const { productId, photo } of targets) {
      const cached = ImageCache.getBase64(photo);
      if (cached) {
        cachedMap[productId] = `data:image/jpeg;base64,${cached}`;
      } else {
        misses.push({ productId, photo });
      }
    }
    if (Object.keys(cachedMap).length) {
      setImageUrls((prev) => ({ ...prev, ...cachedMap }));
    }

    const fetchOne = async ({ productId, photo }) => {
      try {
        const res = await fetch(`${IMAGE_API}${encodeURIComponent(photo)}`, {
          signal: controller.signal,
        });
        const json = await res.json();
        const b64 = json?.imageData || "";
        if (!b64 || cancelled) return;
        ImageCache.setBase64(photo, b64);
        setImageUrls((prev) =>
          prev[productId]
            ? prev
            : { ...prev, [productId]: `data:image/jpeg;base64,${b64}` },
        );
      } catch {}
    };

    Promise.allSettled(misses.map(fetchOne));

    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorSelectedProducts]);

  const placeholderSuggestions = [
    'Search "Milk"',
    'Search "Freedom Refined Sunflower Oil"',
    'Search "Sona Masoori Rice"',
    'Search "Paneer"',
    'Search "Red Label"',
    'Search "Coffee"',
    'Search "Aashirvaad"',
    'Search "Surf Excel"',
    'Search "Toothpaste"',
    'Search "Lizol"',
    'Search "Maggi"',
    'Search "Horlicks"',
    'Search "Eggs"',
    'Search "Chocolate"',
    'Search "Butter"',
    'Search "Bread"',
    'Search "Chicken"',
    'Search "Shampoo"',
    'Search "Soap"',
  ];

  useEffect(() => {
    if (!profile.fullName) return;
    const name = profile.fullName.trim().toLowerCase();
    if (name === "guest") {
      setShowWelcomeMessage(true);
      const timer = setTimeout(() => setShowWelcomeMessage(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [profile.fullName]);

  useEffect(() => {
    const onResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholderSuggestions.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [placeholderSuggestions.length]);

  const fetchWalletAmount = useCallback(async () => {
    try {
      setWalletLoading(true);
      const response = await fetch(
        `https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/OffersTransactions/GetOfferTransactionByUserId?userId=${userId}`,
      );
      const data = await response.json();
      if (data && data.length > 0) {
        setWalletAmount(data[0].remainingAmount || "0");
      } else {
        setWalletAmount("0");
      }
    } catch (error) {
      console.error("Error fetching wallet amount:", error);
      setWalletAmount("0");
    } finally {
      setWalletLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchWalletAmount();
    }
  }, [userId, fetchWalletAmount]);

  const getMaxAllowedQty = (product) => {
    if (!product) return 0;
    return Math.min(
      product.stockLeft,
      product.limit > 0 ? product.limit : Infinity,
    );
  };

  useEffect(() => {
    const categories = JSON.parse(
      localStorage.getItem("allCategories") || "[]",
    );
    categories.forEach((cat) => {
      cat.products.forEach(async (p) => {
        // Skip if already cached or if fetch is in progress
        if (cartImages[p.id]) return;
        if (cartImages[p.id]) return;
        if (!p.imageFile || cartImages[p.id]) return;
        try {
          const res = await fetch(
            `${IMAGE_API}${encodeURIComponent(p.imageFile)}`,
          );
          const json = await res.json();
          if (json?.imageData) {
            setCartImages((prev) => ({
              ...prev,
              [p.id]: `data:image/jpeg;base64,${json.imageData}`,
            }));
          }
        } catch (err) {
          console.error("Cart image load failed", err);
        }
      });
    });
  }, [cartImages]);

  useEffect(() => {
    const raw = localStorage.getItem("allCategories");
    if (!raw) return;
    const categories = JSON.parse(raw);
    categories.forEach((cat) => {
      cat.products.forEach(async (item) => {
        if (!item.imageFile || cartImages[item.id]) return;
        try {
          const res = await fetch(
            `${IMAGE_API}${encodeURIComponent(item.imageFile)}`,
          );
          const json = await res.json();
          if (json?.imageData) {
            setCartImages((prev) => ({
              ...prev,
              [item.id]: `data:image/jpeg;base64,${json.imageData}`,
            }));
          }
        } catch (e) {
          console.error("Cart image fetch failed", e);
        }
      });
    });
  }, [cartImages]);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleImageClick = (imageSrc, product) => {
    setZoomImage(imageSrc);
    setZoomProduct(product);
    setShowZoomModal(true);
  };
  /* ================ VOICE SEARCH ================= */
  const startVoiceSearch = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice search not supported in this browser");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    setListening(true);
    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      setSearchQuery(spokenText);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  const normalizeProduct = (p) => ({
    ...p,
    stockLeft: Number(p.stockLeft || 0),
    limit: Number(p.limit || 0),
    afterDiscount: Number(p.afterDiscount || 0),
    mrp: Number(p.mrp || 0),
  });

  useEffect(() => {
    // let cancelled = false;
    // const sendLog = async () => {
    //   try {
    //     const payload = {
    //       id: "1",
    //       date: "string",
    //       mobileNumber: profile.mobileNumber,
    //       message: "User fetching grocery items in profile page"
    //     };
    //     await axios.post(
    //       `https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/LmartLogs/UploadlogsDetails`,
    //       payload
    //     );
    //   } catch (err) {
    //     console.error("Log API failed", err);
    //   }
    // };
    const fetchProducts = async (showLoader = false) => {
      // sendLog();
      if (showLoader) setLoading(true);
      try {
        // Shared across pages: first caller (Profile, Vendor preview, Vendor
        // stock update...) hits the API, everyone else reuses the cached copy.
        const items = await getGroceryItems();
        const normalized = items
          .map(normalizeProduct)
          .filter((p) => p.status === "Approved");
        setAllProducts((prev) => {
          if (
            prev.length === normalized.length &&
            prev.every(
              (p, i) =>
                p.id === normalized[i].id &&
                p.stockLeft === normalized[i].stockLeft &&
                p.limit === normalized[i].limit,
            )
          ) {
            return prev;
          }
          return normalized;
        });
      } catch (err) {
        console.error("Fetching grocery items failed", err);
      } finally {
        if (showLoader) setLoading(false);
      }
    };
    fetchProducts(true);
  }, [profile.mobileNumber]);

  /* ================= FILTER ================= */
  useEffect(() => {
    let result = allProducts.filter((p) => p.status === "Approved");
    if (searchQuery.trim()) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    } else {
      result = [];
    }
    setFilteredProducts(result);
  }, [searchQuery, allProducts]);

  /* ================= FETCH IMAGES ================= */
  useEffect(() => {
    if (!filteredProducts.length) return;
    const controller = new AbortController();
    filteredProducts.forEach(async (p) => {
      if (!p.images?.[0] || imageUrls[p.id]) return;
      try {
        const res = await fetch(
          `${IMAGE_API}${encodeURIComponent(p.images[0])}`,
          { signal: controller.signal },
        );
        const json = await res.json();
        if (!json?.imageData) return;
        setImageUrls((prev) => ({
          ...prev,
          [p.id]: `data:image/jpeg;base64,${json.imageData}`,
        }));
      } catch {}
    });
    return () => controller.abort();
  }, [filteredProducts, imageUrls]);

  const handleAddClick = (product) => {
    const maxQty = getMaxAllowedQty(product);
    if (maxQty <= 0) return;
    updateLocalStorageCart(
      { ...product, imageFile: product.images?.[0] || "" },
      1,
    );
    setCart((prev) => ({ ...prev, [product.id]: 1 }));
  };

  const handleIncrement = (product) => {
    const maxQty = getMaxAllowedQty(product);

    setCart((prev) => {
      const current = prev[product.id] || 0;
      if (current >= maxQty) return prev;

      const next = current + 1;
      updateLocalStorageCart(product, next);
      return { ...prev, [product.id]: next };
    });
  };

  const handleDecrementClick = (product) => {
    setCart((prev) => {
      const qty = prev[product.id] || 0;
      const newQty = qty - 1;

      updateLocalStorageCart(product, newQty);

      if (newQty <= 0) {
        const copy = { ...prev };
        delete copy[product.id];
        return copy;
      }
      return { ...prev, [product.id]: newQty };
    });
  };

  const renderProductCard = (product) => {
    const maxQty = getMaxAllowedQty(product);
    const isOutOfStock = maxQty <= 0;
    return (
      <div
        key={product.id}
        className="w-[200px] flex flex-col p-2 bg-white rounded shadow-sm border position-relative"
        style={{ minHeight: "250px", opacity: isOutOfStock ? 0.6 : 1 }}
      >
        <div className="d-flex flex-row justify-content-between absolute top-0 left-0 w-full">
          {Number(product.discount) > 0 && !isOutOfStock && (
            <span className="discount-badge">
              {Math.round(Number(product.discount))}%
            </span>
          )}
        </div>
        {/* Product Image */}
        <div
          className="d-flex justify-content-center align-items-center position-relative"
          style={{ height: "90px" }}
        >
          {imageUrls[product.id] ? (
            <img
              src={cartImages[product.id] || imageUrls[product.id]}
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
              onClick={() =>
                !isOutOfStock &&
                handleImageClick(
                  cartImages[product.id] || imageUrls[product.id],
                  product,
                )
              }
            />
          ) : (
            <span className="text-muted small">Loading Image</span>
          )}

          {isOutOfStock && (
            <div
              className="position-absolute d-flex justify-content-center align-items-center"
              style={{
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(255,255,255,0.75)",
                borderRadius: "6px",
                zIndex: 2,
              }}
            >
              <span
                style={{
                  fontWeight: 500,
                  backgroundColor: "grey",
                  color: "white",
                  fontSize: "10px",
                  borderRadius: "6px",
                  margin: "1px",
                  padding: "2px",
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
            {product.mrp != null && (
              <s className="text-muted">₹{product.mrp}</s>
            )}
            {product.units && (
              <b className="text-success" style={{ marginLeft: "5px" }}>
                {product.units}
              </b>
            )}
          </div>
        )}

        {Number(product.limit) > 0 && (
          <div
            style={{
              fontSize: "10px",
              marginBottom: "5px",
              color: "#d32f2f",
            }}
          >
            Max {Number(product.limit)} Per User
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
                }}
              >
                {/* ➖ DECREMENT */}
                <button
                  className="btn btn-sm p-0 text-white"
                  onClick={() => handleDecrementClick(product)}
                >
                  –
                </button>
                <span className="fw-bold">{cart[product.id]}</span>
                {/* ➕ INCREMENT */}
                <button
                  className="btn btn-sm p-0 text-white"
                  disabled={(cart[product.id] || 0) >= maxQty}
                  onClick={() => handleIncrement(product)}
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
                onClick={() => handleAddClick(product)}
              >
                ADD
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // useEffect(() => {
  //   const fetchDeliveryData = async () => {
  //     try {
  //       const response = await fetch(
  //         `https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/Mart/GetProductDetails?id=${id}`
  //       );
  //       if (!response.ok) {
  //         throw new Error("Failed to fetch grocery product data");
  //       }
  //       const data = await response.json();
  //       console.log("Fetched Grocery Data:", data);
  //       setCartData(data);
  //       setId(data.id);
  //       setMartId(data.martId);
  //       setDate(data.date);
  //       setMobileNumber(data.customerPhoneNumber);
  //       setAddress(data.address);
  //       setState(data.state);
  //       setCity(data.district);
  //       setPinCode(data.zipCode);
  //       setPaymentMode(data.paymentMode);
  //       setTransactionDetails(data.utrTransactionNumber);
  //       setLongitude(data.longitude);
  //       setLatitude(data.latitude);
  //       setGrandTotal(data.grandTotal);
  //       setPaymentMode(data.paymentMode);
  //       setTotalItemsSelected(data.totalItemsSelected);
  //       setTransactionStatus(data.transactionStatus);
  //       setPaidAmount(data.paidAmount);
  //       setTransactionNumber(data.transactionNumber);
  //       setLatitude(data.latitude);
  //       setLongitude(data.longitude);
  //       setTotalItemsSelected(data.totalItemsSelected);
  //       setDeliveryPartnerUserId(data.deliveryPartnerUserId);
  //       setAssignedDateTime(data.deliveryAssignedTime);
  //       setAssignedTo(data.assignedTo);
  //       let allProducts = [];
  //       let totalAmountFromApi = 0;

  //       if (data.categories && Array.isArray(data.categories)) {
  //         data.categories.forEach((cat) => {
  //           totalAmountFromApi += Number(cat.totalAmount) || 0;
  //           cat.products.forEach((p, idx) => {
  //             allProducts.push({
  //               serial: allProducts.length + 1,
  //               name: p.productName,
  //               category: cat.categoryName,
  //               mrp: p.mrp,
  //               discount: p.discount,
  //               afterDiscountPrice: p.afterDiscountPrice,
  //               quantity: p.noOfQuantity,
  //               total: p.afterDiscountPrice * p.noOfQuantity,
  //             });
  //           });
  //         });
  //         setItems(allProducts);
  //       }
  //       const grandTotalNumeric = Number(data.grandTotal) || 0;
  //       const cashback = totalAmountFromApi - grandTotalNumeric;
  //       if ((cashback >= 49 && cashback <= 51) ||(cashback >= 99 && cashback <= 101) || (cashback >= 199 && cashback <= 201))
  //       {
  //         setCashbackAmount(cashback);
  //       } else {
  //         setCashbackAmount(0);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching grocery product data:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   if (id) {
  //     fetchDeliveryData();
  //   }
  // }, [id]);

  const loadDeliveryPartnerTickets = useCallback(async () => {
    try {
      setDeliveryTicketsLoading(true);
      const response = await fetch(
        `https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/Mart/GetMartTicketsByUserId?userId=${userId}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch ticket data");
      }
      const data = await response.json();
      const tickets = Array.isArray(data)
        ? data
        : data && typeof data === "object"
          ? [data]
          : [];
      const inProgressTickets = tickets.filter(
        (item) => item.status && item.status.toLowerCase() === "in progress",
      );
      setGroceryData(inProgressTickets);
      const first = inProgressTickets[0] || {};
      setMartId(first.martId || "");
      setState(first.state || "");
      setDistrict(first.district || "");
      setPinCode(first.zipCode || first.pinCode || "");
      setAddress(first.address || "");
      setId(first.id || "");
      setPaymentMode(first.paymentMode || "");
      setStatus(first.status || "");
      setFullName(first.customerName || "");
      setMobileNumber(first.customerPhoneNumber || "");
    } catch (error) {
      console.error("Error fetching ticket data:", error);
      setGroceryData([]);
    } finally {
      setDeliveryTicketsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    console.log(deliveryProfile);
  }, [deliveryProfile]);

  const handleDeliveryPartnerClick = async () => {
    if (clickLock.current) return;
    clickLock.current = true;
    try {
      const res = await axios.get(
        `https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/DeliveryPartner/GetDeliveryPartnerDetailsByUserId?userId=${userId}`,
      );
      const raw = res?.data ?? null;
      const profile = Array.isArray(raw)
        ? raw.length > 0
          ? raw[0]
          : null
        : raw && typeof raw === "object" && Object.keys(raw).length > 0
          ? raw
          : null;
      setDeliveryProfile(profile);
      const reg = profile?.isRegistered === true;
      const st = (profile?.status || "").toLowerCase();
      setIsRegistered(reg);
      setPartnerStatus(st);
      if (reg && st === "open") {
        // Approved delivery partner — go straight to their dashboard
        // (name + bell + voice alerts) instead of the old ticket-list
        // modal.
        navigate(`/deliveryPartnerDashboard/${userType}/${userId}`);
      } else if (reg) {
        await loadDeliveryPartnerTickets();
        setShowNotificationModal(true);
      } else {
        setShowInterestModal(true);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setShowInterestModal(true);
    } finally {
      setTimeout(() => {
        clickLock.current = false;
      }, 200);
    }
  };

  const handleConfirmInterest = () => {
    if (selectedOption === "yes") {
      setShowInterestModal(false);
      navigate(`/deliveryPartner/${userType}/${userId}`);
    } else {
      setShowInterestModal(false);
    }
  };

  useEffect(() => {
    const summary = CartStorage.grandSummary();
    setCartSummary(summary);
  }, []);

  const isActionLocked =
    selectedOrder?.status === "Open" || selectedOrder?.status === "Return";

  const handleStatusUpdate = async (ticket, newStatus) => {
    try {
      const detailsResponse = await fetch(
        `https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/Mart/GetProductDetails?id=${ticket.id}`,
      );

      if (!detailsResponse.ok) {
        throw new Error("Failed to fetch order details");
      }
      const currentOrderData = await detailsResponse.json();
      const payload = {
        ...currentOrderData,
        id: ticket.id,
        userId: userId,
        martId: ticket.martId,
        date: ticket.date,
        status: newStatus,
        PaymentMode:
          newStatus === "Open" || newStatus === "Return"
            ? ""
            : ticket.paymentType,
        utrTransactionNumber: currentOrderData.utrTransactionNumber || "",
        transactionNumber: currentOrderData.transactionNumber || "",
        transactionStatus: currentOrderData.transactionStatus || "",
        PaidAmount:
          newStatus === "Open" || newStatus === "Return"
            ? ""
            : String(ticket.receivedAmount || 0),
        AssignedTo:
          newStatus === "Open"
            ? ` ${currentOrderData.assignedTo} has Declined`
            : newStatus === "Return"
              ? `${currentOrderData.assignedTo} Return`
              : currentOrderData.assignedTo,
        DeliveryPartnerUserId:
          newStatus === "Open" || newStatus === "Return"
            ? ""
            : currentOrderData.deliveryPartnerUserId,
        deliveryAssignedTime:
          newStatus === "Open" || newStatus === "Return"
            ? ""
            : currentOrderData.deliveryAssignedTime,
        deliverySubmitTime: new Date().toISOString(),
        latitude: currentOrderData.latitude,
        longitude: currentOrderData.longitude,
        isDelivered: true,
      };
      console.log("FINAL PAYLOAD:", payload);
      const response = await fetch(
        `https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/Mart/UpdateProductDetails/${ticket.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok) {
        throw new Error("Failed to update order");
      }
      if (newStatus === "Open") {
        alert("You declined the order.");
        setShowNotificationModal(false);
      } else if (newStatus === "Return") {
        alert("Order returned.");
        setShowNotificationModal(false);
      }
    } catch (error) {
      console.error("Status update error:", error);
    }
  };

  const handleUpdatePaymentMethod = async (ticket) => {
    try {
      const detailsResponse = await fetch(
        `https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/Mart/GetProductDetails?id=${ticket.id}`,
      );

      if (!detailsResponse.ok) {
        throw new Error("Failed to fetch order details");
      }
      const currentOrderData = await detailsResponse.json();
      const payload = {
        ...currentOrderData,
        id: ticket.id,
        userId: userId,
        martId: ticket.martId,
        date: ticket.date,
        status: "Delivered",
        utrTransactionNumber: currentOrderData.utrTransactionNumber || "",
        transactionNumber: currentOrderData.transactionNumber || "",
        transactionStatus: currentOrderData.transactionStatus || "",
        PaymentMode: ticket.paymentType,
        PaidAmount:
          ticket.paymentType?.toLowerCase() === "cash&online"
            ? `cash=${ticket.cashAmount || 0}, online=${ticket.onlineAmount || 0}`
            : String(ticket.receivedAmount || 0),
        AssignedTo: currentOrderData.assignedTo,
        DeliveryPartnerUserId: currentOrderData.deliveryPartnerUserId,
        deliveryAssignedTime: currentOrderData.deliveryAssignedTime,
        deliverySubmitTime: new Date().toISOString(),
        latitude: currentOrderData.latitude,
        longitude: currentOrderData.longitude,
        isDelivered: true,
      };
      console.log("FINAL PAYLOAD:", payload);
      const response = await fetch(
        `https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/Mart/UpdateProductDetails/${ticket.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok) {
        throw new Error("Failed to update order");
      }
      setGroceryData((prev) =>
        prev.map((g) =>
          g.id === ticket.id ? { ...g, status: "Delivered" } : g,
        ),
      );

      setSelectedTicket(null);
      alert("Order Delivered Successfully");
      setShowNotificationModal(false);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to update. Please try again.");
    }
  };
  // useEffect(() => {
  //   const autoOpenForNewUser = async () => {
  //     if (!userId) return;
  //     try {
  //       const rec = await getReferralRecord(userId);
  //       const REFERRAL_LOCK_KEY = `hm_referral_lock_${userId}`;
  //       const lock = localStorage.getItem(REFERRAL_LOCK_KEY);
  //       const hasNumbers = Boolean((rec?.referralNumbers || "").trim());
  //       // ✅ FINAL CONDITION
  //       if (!lock && !hasNumbers) {
  //         setRedeemOpen(true);
  //       } else {
  //         setRedeemOpen(false);
  //       }
  //     } catch (e) {
  //       console.error(e);
  //       setRedeemOpen(true);
  //     }
  //   };
  //   autoOpenForNewUser();
  // }, [userId]);

  // const handleCategoryClick = async (category) => {
  //   const { value } = category;
  //   try {
  //     setSelectedCategory(category);
  //     setProducts([]);
  //     setError("");
  //     const encodedCategory = encodeURIComponent(value);
  //     localStorage.setItem("encodedCategory", encodedCategory);
  //     navigate(`/offers/${userType}/${userId}`, {
  //       state: { encodedCategory },
  //     });
  //   } catch (error) {
  //     console.error("Error fetching products:", error);
  //     setProducts([]);
  //     setError(`Oops! No products found for ${value} category.`);
  //   }
  // };

  const handleVendorCategoryClick = (vendor, category) => {
    const mobileNumber = profile?.mobileNumber || "";

    const encodedCategory = encodeURIComponent(category.category);

    // vendorlist.json only carries productId + discount + qty per vendor
    // product — resolve each one against the grocery catalog this page has
    // already fetched (allProducts), so the grocery listing page doesn't
    // need to make any API call of its own for a vendor's products.
    const resolvedProducts = (category.products || [])
      .map((entry) => {
        const base = allProducts.find(
          (p) => String(p.id) === String(entry.productId),
        );
        if (!base) return null;
        const mrp = Number(base.mrp || 0);
        const discount = Number(entry.discount ?? base.discount ?? 0);
        const afterDiscount =
          discount > 0
            ? Math.round(mrp - (mrp * discount) / 100)
            : Number(base.afterDiscount || mrp);
        return {
          ...base,
          discount,
          afterDiscount,
          stockLeft: Number(entry.qty ?? base.stockLeft ?? 0),
        };
      })
      .filter(Boolean);

    // Save exact vendor + category
    localStorage.setItem(
      "vendorGrocerySelection",
      JSON.stringify({
        isVendorGrocery: true,
        vendorId: vendor.vendorId,
        storeName: vendor.storeName,
        category: category.category,
        products: resolvedProducts,
      }),
    );

    // Also save the EXACT category
    localStorage.setItem("encodedCategory", encodedCategory);

    navigate(`/grocery/${userType}/${userId}`, {
      state: {
        mobileNumber,
        isVendorGrocery: true,
        vendorId: vendor.vendorId,
        storeName: vendor.storeName,
        category: category.category,
        products: resolvedProducts,
        encodedCategory,
      },
    });
  };

  const handleGroceryCategoryClick = (category) => {
    const { value } = category;
    const mobileNumber = profile?.mobileNumber || "";
    const encodedCategory = encodeURIComponent(value);
    localStorage.setItem("encodedCategory", encodedCategory);
    // This is a normal (non-vendor) grocery category. If the user previously
    // opened a vendor's category tab, "vendorGrocerySelection" is still
    // sitting in localStorage from that visit — GroceryItems.js falls back to
    // it whenever the current navigation state doesn't say otherwise, which
    // skips the real GetGroceryItemsBycategory fetch entirely and shows stale/
    // empty results. Clear it so this click goes through the live API.
    localStorage.removeItem("vendorGrocerySelection");
    if (value === "Kitchenware Appliances") {
      navigate(`/grocery/${userType}/${userId}`, {
        state: { mobileNumber },
      });
      return;
    }
    if (
      value === "Electrical Products" ||
      value === "Plumbing Products" ||
      value === "Home Decors" ||
      value === "Electronics appliances" ||
      value === "Hardware items"
    ) {
      navigate(`/martHomeAppliances/${userType}/${userId}`, {
        state: { applianceType: value },
      });
      return;
    }

    if (value === "Grocery Value Combo Packs") {
      navigate(`/groceryOffers/${userType}/${userId}`, {
        state: { mobileNumber },
      });
    } else {
      navigate(`/grocery/${userType}/${userId}`, {
        state: { mobileNumber },
      });
    }
    //   navigate(`/grocery/${userType}/${userId}`, {
    //   state: { mobileNumber },
    // });
  };

  // const handleDressCategoryClick = async (category) => {
  //   const { value } = category;
  //   try {
  //     setSelectedCategory(category);
  //     setDress([]);
  //     setError("");
  //     const encodedCategory = encodeURIComponent(value);
  //     localStorage.setItem("encodedCategory", encodedCategory);
  //     navigate(`/lakshmiCollections/${userType}/${userId}`, {
  //       state: { encodedCategory },
  //     });
  //   } catch (error) {
  //     console.error("Error fetching collections:", error);
  //     setGrocery([]);
  //     setError(`Oops! No collections found for ${value} category.`);
  //   }
  // };
  const buildMartUpdateSignature = (ticket) =>
    [
      ticket?.status || "",
      ticket?.slotTime || "",
      ticket?.assignedTo || "",
      ticket?.deliveryAssignedTime || "",
      ticket?.deliverySubmitTime || "",
    ].join("|");

  const formatMartUpdateMessage = (ticket) => {
    const orderId = ticket?.martId || ticket?.id || "your order";
    if (ticket?.slotTime) {
      return `Order ${orderId} is scheduled for ${ticket.slotTime}.`;
    }
    if (ticket?.assignedTo) {
      return `Order ${orderId} is assigned to ${ticket.assignedTo}.`;
    }
    if (ticket?.status) {
      return `Order ${orderId} status updated to ${ticket.status}.`;
    }
    return `Order ${orderId} has a new update.`;
  };

  const notifyMartOrderUpdates = useCallback(
    (martTickets) => {
      const storageKey = `hm_seen_mart_updates_${userId}`;
      let seenMap = {};
      try {
        seenMap = JSON.parse(localStorage.getItem(storageKey) || "{}");
      } catch {
        seenMap = {};
      }

      const nextSeenMap = { ...seenMap };
      const updatedTickets = [];

      (Array.isArray(martTickets) ? martTickets : []).forEach((ticket) => {
        const ticketKey = String(ticket?.id || ticket?.martId || "").trim();
        if (!ticketKey) return;

        const signature = buildMartUpdateSignature(ticket);
        if (!signature) return;

        if (!martTicketSyncRef.current) {
          nextSeenMap[ticketKey] = signature;
          return;
        }

        if (seenMap[ticketKey] !== signature) {
          nextSeenMap[ticketKey] = signature;
          updatedTickets.push(ticket);
        }
      });

      localStorage.setItem(storageKey, JSON.stringify(nextSeenMap));

      if (updatedTickets.length > 0) {
        const latestTicket = updatedTickets[updatedTickets.length - 1];
        const message = formatMartUpdateMessage(latestTicket);
        setAutoOrderPrompt({
          title: "Order Update",
          message,
          ticket: latestTicket,
        });
        if (PushNotificationService.isEnabled()) {
          PushNotificationService.show("Handyman Order Update", message);
        }
      }

      martTicketSyncRef.current = true;
    },
    [userId],
  );

  const fetchAllTickets = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (!silent) {
          setLoading(true);
        }
        const [
          ticketResponse,
          productResponse,
          technicianResponse,
          groceriesResponse,
          lakshmiResponse,
        ] = await Promise.all([
          fetch(
            `https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/RaiseTicket/GetAllTicketsList?userId=${userId}&type=raiseTicket`,
          ),
          fetch(
            `https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/RaiseTicket/GetAllTicketsList?userId=${userId}&type=buyProduct`,
          ),
          fetch(
            `https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/RaiseTicket/GetAllTicketsList?userId=${userId}&type=bookTechnician`,
          ),
          fetch(
            `https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/RaiseTicket/GetAllTicketsList?userId=${userId}&type=mart`,
          ),
          fetch(
            `https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/RaiseTicket/GetAllTicketsList?userId=${userId}&type=collections`,
          ),
        ]);
        if (
          !ticketResponse.ok ||
          !productResponse.ok ||
          !technicianResponse ||
          !groceriesResponse ||
          !lakshmiResponse
        ) {
          throw new Error(
            "Failed to fetch ticket, product and technician data",
          );
        }
        const ticketData = await ticketResponse.json();
        const productData = await productResponse.json();
        const technicianData = await technicianResponse.json();
        const groceryData = await groceriesResponse.json();
        const collectionsData = await lakshmiResponse.json();
        const groceryOpenTickets = Array.isArray(groceryData)
          ? groceryData.filter((item) =>
              ["open", "in progress", "delivered"].includes(
                String(item?.status).toLowerCase(),
              ),
            )
          : [];
        const collectionOpenTickets = Array.isArray(collectionsData)
          ? collectionsData.filter(
              (item) => String(item?.status).toLowerCase() === "open",
            )
          : [];
        const nextTickets = [
          ...ticketData,
          ...productData,
          ...technicianData,
          ...groceryOpenTickets,
          ...collectionOpenTickets,
        ];
        setAllTickets(nextTickets);
        notifyMartOrderUpdates(groceryOpenTickets);
      } catch (error) {
        console.error("Error fetching ticket, product data:", error);
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [notifyMartOrderUpdates, userId],
  );

  useEffect(() => {
    fetchAllTickets();
  }, [fetchAllTickets]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      fetchAllTickets({ silent: true });
    }, 60000);
    return () => window.clearInterval(intervalId);
  }, [fetchAllTickets]);

  const calculateCashback = (ticket) => {
    if (!ticket || !ticket.categories) return 0;

    let totalAmountFromApi = 0;

    ticket.categories.forEach((cat) => {
      if (cat.totalAmount != null) {
        totalAmountFromApi += Number(cat.totalAmount) || 0;
      } else if (Array.isArray(cat.products)) {
        cat.products.forEach((p) => {
          const price = Number(p.afterDiscountPrice || 0);
          const qty = Number(p.noOfQuantity || 0);
          totalAmountFromApi += price * qty;
        });
      }
    });

    const grandTotalNumeric = Number(ticket.grandTotal) || 0;
    const cashback = totalAmountFromApi - grandTotalNumeric;
    if (
      (cashback >= 49 && cashback <= 51) ||
      (cashback >= 79 && cashback <= 81) ||
      (cashback >= 99 && cashback <= 101) ||
      (cashback >= 199 && cashback <= 201)
    ) {
      return cashback;
    }
    return 0;
  };

  const handleCustomerCareCall = () => {
    window.location.href = "tel:6281198953";
  };

  const handleTrackOrder = async (ticket) => {
    try {
      setShowTrackModal(true);
      setTrackLoading(true);
      setTrackError("");
      setTrackedOrder(null);
      const response = await fetch(
        `https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/Mart/GetProductDetails?id=${ticket.id}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch live order status");
      }
      const liveOrder = await response.json();
      setTrackedOrder(liveOrder);
    } catch (error) {
      console.error("Error fetching tracked order:", error);
      setTrackError(
        "Unable to load the latest order status right now. Please try again.",
      );
    } finally {
      setTrackLoading(false);
    }
  };

  const handleViewDetails = (ticket) => {
    setSelectedTicket(ticket);
    const cb = calculateCashback(ticket);
    setCashbackAmount(cb);
    setShowModal(true);
  };

  useEffect(() => {
    if (profile?.mobileNumber) {
      localStorage.setItem("customerMobileNumber", profile.mobileNumber);
    }
  }, [profile]);

  const handleMoreIconClick = () => {
    setShowProfile(!showProfile);
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !document.getElementById("dropdown-container")?.contains(event.target)
      ) {
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleCloseMenuOnClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleCloseMenuOnClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleCloseMenuOnClickOutside);
  }, []);

  useEffect(() => {
    if (!userId || !userType) return;
    const fetchProfileData = async () => {
      try {
        let apiUrl = "";
        if (userType === "customer") {
          apiUrl = `https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/customer/customerProfileData?profileType=${userType}&UserId=${userId}`;
        }
        if (!apiUrl) return;
        const response = await axios.get(apiUrl);
        setProfile(response.data);
        setCategory(response.data.category);
        const apiDistrict = (response.data.district || "").trim();
        const apiPincode = (
          response.data.zipCode ||
          response.data.pinCode ||
          ""
        )
          .toString()
          .trim();

        setDistrict(apiDistrict);

        // If the API gave us no pincode, but the customer's district is
        // Visakhapatnam, default the vendor tabs to the "LMart" store instead
        // of just falling back to DEFAULT_PINCODE's first vendor.
        const isVisakhapatnamNoPincode =
          !apiPincode && apiDistrict.toLowerCase() === "visakhapatnam";
        setPreferLMartDefault(isVisakhapatnamNoPincode);

        const resolvedZip = apiPincode || DEFAULT_PINCODE;
        setZipCode(resolvedZip);
        setFullName(response.data.fullName);
        if (response.data.photoAttachmentId) {
          fetchImageUrl(response.data.photoAttachmentId);
        }
        setMenuList(
          getMenuList(
            userType,
            userId,
            response.data.category,
            apiDistrict,
            resolvedZip,
            response.data.fullName,
            isMobile,
          ),
        );
      } catch (error) {
        console.log("Error Fetching Data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [userType, userId, isMobile]);

  useEffect(() => {
    if (category && district) {
      setMenuList(
        getMenuList(
          userType,
          userId,
          category,
          district,
          zipCode,
          fullName,
          isMobile,
        ),
      );
    }
  }, [category, district, userType, userId, zipCode, fullName, isMobile]);

  useEffect(() => {
    window.addEventListener("storage", () => {
      setCartImages({});
    });
    return () => window.removeEventListener("storage", () => {});
  }, []);

  const fetchImageUrl = async (photoId) => {
    try {
      if (!photoId) return;
      const response = await axios.get(
        `https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/FileUpload/download?generatedfilename=${photoId}`,
      );
      if (response.status === 200 && response.data.imageData) {
        const imageUrl = `data:image/jpeg;base64,${response.data.imageData}`;
        setProfileImage(imageUrl);
      }
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  if (loading) {
    return <div></div>;
  }

  const updateLocalStorageCart = (product, qty) => {
    const stored = JSON.parse(localStorage.getItem("allCategories")) || [];
    const categoryName = product.category || "Search Items";
    let category = stored.find((c) => c.categoryName === categoryName);
    if (!category) {
      category = { categoryName, products: [] };
      stored.push(category);
    }

    const index = category.products.findIndex(
      (p) => (p.productId || p.id) === product.id,
    );

    if (qty <= 0) {
      if (index !== -1) category.products.splice(index, 1);
    } else {
      const item = {
        productId: product.id,
        productName: product.name || product.productName,
        qty,
        mrp: product.mrp,
        discount: product.discount,
        afterDiscountPrice: product.afterDiscount,
        stockLeft: product.stockLeft,
        units: product.units,
        code: product.code,
        image: product.imageFile || product.images?.[0] || "",
      };

      if (index === -1) {
        category.products.push(item);
      } else {
        category.products[index] = item;
      }
    }
    localStorage.setItem("allCategories", JSON.stringify(stored));
  };

  const filteredGroceryData = groceryData.filter((t) =>
    t.martId?.toString().toLowerCase().includes(searchOrderId.toLowerCase()),
  );
  // const sortedCategories = [...(categories ?? [])].sort((a, b) =>
  //   String(b?.category || b?.categoryName || "").localeCompare(
  //     String(a?.category || a?.categoryName || ""),
  //     undefined,
  //     { sensitivity: "base" }
  //   )
  // );

  return (
    <>
      <OffersBannerModal />
      {showWelcomeMessage && (
        <div
          style={{
            position: "fixed",
            top: isMobile ? "175px" : "80px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#fff8e1",
            border: "2px solid #ffca28",
            borderRadius: "12px",
            padding: "16px 20px",
            zIndex: 9999,
            maxWidth: "340px",
            width: "90%",
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            textAlign: "center",
          }}
        >
          <button
            onClick={() => setShowWelcomeMessage(false)}
            style={{
              position: "absolute",
              top: "8px",
              right: "12px",
              background: "none",
              border: "none",
              fontSize: "18px",
              cursor: "pointer",
              color: "#555",
            }}
          >
            &times;
          </button>
          <p
            style={{
              margin: 0,
              fontSize: "15px",
              fontWeight: "600",
              color: "#333",
            }}
          >
            🎉 Welcome to Handyman App! Place your first order and get{" "}
            <span style={{ color: "green", fontWeight: "bold" }}>
              ₹50 bonus
            </span>{" "}
            added to your wallet.
          </p>
        </div>
      )}
      <header
        className="header d-flex align-items-center justify-content-between p-2 bg-white shadow-sm"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          width: "100%",
          zIndex: 1000,
        }}
      >
        {isMobile ? (
          <div onClick={handleMoreIconClick} style={{ cursor: "pointer" }}>
            <MenuIcon className="floating-menuIcon" fontSize="medium" />
          </div>
        ) : null}
        <img
          loading="lazy"
          decoding="async"
          src={Logo}
          alt="Handy Man Logo"
          className="logo-img"
        />
        <div className="spacer"></div>
        <div className="d-flex align-items-center w-100"></div>
        <div className="hdr_icns d-flex align-items-center ">
          <div
            id="dropdown-container"
            className="dropdown-container"
            style={{ position: "relative" }}
          >
            <div className="d-flex align-items-center">
              {/* Customer Care Number */}
              <div
                className="d-flex align-items-start"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={handleCustomerCareCall}
              >
                <AddIcCallIcon style={{ color: "green", fontSize: "30px" }} />
                <small
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                ></small>
              </div>
              <div className="d-flex align-items-center">
                {/* Coins (Clickable) */}
                {/* <div 
              className="coin-wrap"
              style={{ marginLeft: 10, cursor: "pointer" }}
              onClick={() => setShowCoinsModal(true)}
            >
              <span className="coin-value">
                {pointsLoading ? "0" : userPoints}
              </span>
            </div> */}
              </div>

              {/* Wallet Amount */}
              <div
                className="coin-wrap"
                style={{ marginLeft: 10, cursor: "pointer" }}
                onMouseEnter={() => setShowWalletMessage(true)}
                onMouseLeave={() => setShowWalletMessage(false)}
                onClick={() => setShowWalletMessage(true)}
              >
                <span className="coin-value" style={{ color: "blue" }}>
                  ₹ {walletLoading ? "0" : walletAmount}
                </span>
              </div>
              {/* Profile Image */}
              <div className="profile-img-wrapper">
                <img
                  loading="lazy"
                  decoding="async"
                  src={profileImage}
                  alt="Profile"
                  className="profile-img"
                />
              </div>
            </div>
          </div>
        </div>
      </header>
      {showWalletMessage && (
        <div
          className="alert alert-danger"
          style={{
            position: "fixed",
            top: "80px",
            right: "20px",
            zIndex: 9999,
            maxWidth: "320px",
            cursor: "default",
          }}
          onTouchEnd={() => setTimeout(() => setShowWalletMessage(false), 2500)}
        >
          <div className="d-flex justify-content-between align-items-start">
            <span className="blinking-icon" style={{ fontSize: "15px" }}>
              Wallet Balance: <strong>₹{walletAmount}.</strong> Enjoy
              <strong> ₹10 </strong>
              off from your wallet for every<strong> ₹100 </strong> spent.
            </span>
            <button
              type="button"
              className="btn-close"
              onClick={() => setShowWalletMessage(false)}
            ></button>
          </div>
        </div>
      )}
      {/* <Modal
  show={showCoinsModal}
  onHide={() => setShowCoinsModal(false)}
  centered
>
  <Modal.Header closeButton>
    <Modal.Title>🎁 Redeem Coins</Modal.Title>
  </Modal.Header>
  <Modal.Body> */}
      {/* Coins Display */}
      {/* <div className="text-center mb-3"> */}
      {/* <h5 className="gold-shine-text">{pointsLoading ? "0" : userPoints} Coins</h5> */}
      {/* </div> */}
      {/* Get Coins Button */}
      {/* {shouldShowGetCoins && !isReferralUsed && (
      <button
        onClick={handleGetCoins}
        disabled={pointsLoading || userPoints >= 100 || !claimAvailable}
        className="bg-primary w-100"
        style={{
          fontSize: 14,
          borderRadius: 6,
          color: "white",
          padding: "8px",
          border: "none",
        }}
      >
        {pointsLoading ? "Checking..." : "Get Coins"}
      </button>
    )} */}
      {/* Confetti overlay */}
      {/* {showConfetti && (
                      <Confetti width={windowSize.width} height={windowSize.height} />
                    )} */}
      {/* Toast-like “Congrats” message */}
      {/* {showMessage && (
                      <div
                        style={{
                          position: "fixed",
                          top: "40%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          backgroundColor: "#fff",
                          color: "#000",
                          padding: "20px 40px",
                          borderRadius: "12px",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                          fontSize: 18,
                          fontWeight: "bold",
                          zIndex: 9999,
                          animation: "fadeInUp 0.5s ease",
                        }}
                      >
                        🎉 Congrats! You got <span style={{ color: "#007bff" }}>100</span> points!
                      </div>
                    )} */}
      {/* Referral Numbers */}
      {/* <div style={{ fontSize: "12px" }}>
          {refLoading ? (
            "Loading..."
          ) : (
            displayNumbers.split(",").map((item, index) => (
              <div key={index}>
                {item.trim()}
              </div>
            ))
          )}
      </div> */}
      {/* </Modal.Body>
</Modal> */}

      <div className="pt-1 mt-100">
        <div
          className={`container m-1`}
          style={{
            padding: isMobile ? "8px" : "0px",
            borderRadius: "5px",
            minHeight: "100vh",
            paddingTop: isMobile ? "70px" : "0px",
          }}
        >
          <div className="row">
            <div className="col-md-3">
              <div>
                {/* Desktop Profile Details */}
                {!isMobile ? (
                  <div className="profile-card">
                    <div className="profile-img-container ">
                      <div className="profile-container">
                        <div className="profile-info">
                          <div className="webprofile-section">
                            <div className="text-primary fw-bold cust-name">
                              Welcome{" "}
                              <small
                                className="text-dark"
                                style={{ fontFamily: "Poppins, sans-serif" }}
                              >
                                {profile.fullName}{" "}
                              </small>
                            </div>
                            {/* {renderVendorPanel()} */}
                            <div className="fw-bold fs-4">
                              Lakshmi Sai Service Providers
                            </div>
                            <div className="webprofile-img-wrapper">
                              <img
                                loading="lazy"
                                decoding="async"
                                src={profileImage}
                                alt="Profile"
                                className="webprofile-img"
                              />
                              <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: "none" }}
                                accept="image/*"
                              />
                            </div>
                            <div className="label fw-bold fs-5">Name</div>
                            <p className="value">{profile.fullName}</p>
                            <hr />
                            <div className="label fw-bold mt-0 fs-5">
                              Mobile
                            </div>
                            <p className="value">{profile.mobileNumber}</p>
                            <hr />
                            <div className="label fw-bold mt-0 fs-5">
                              Address
                            </div>
                            <p className="value">{profile.address}</p>
                            <hr />
                            <p
                              className="logout-btn m-1"
                              onClick={() =>
                                (window.location.href = "/loginnew")
                              }
                            >
                              <LogoutIcon />
                              <span className="fs-5">Logout</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
              {/* Mobile Profile Details */}
              {showProfile && !showInterestModal && !showNotificationModal && (
                <div
                  className="floating-profile-menu"
                  style={{
                    position: "fixed",
                    top: "60px",
                    left: "10px",
                    backgroundColor: "#fff",
                    zIndex: 1200,
                    borderRadius: "8px",
                    boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
                    padding: "10px",
                    width: "180px",
                  }}
                >
                  <div className="profile-info">
                    <div className="fw-bold">Name</div>
                    <p className="mb-2">{profile.fullName}</p>
                    <hr style={{ margin: "4px 0" }} />
                    <div className="fw-bold">Mobile</div>
                    <p className="mb-2">{profile.mobileNumber}</p>
                    <hr style={{ margin: "4px 0" }} />
                    <div className="fw-bold">Address</div>
                    <p className="mb-2">{profile.address}</p>
                    <hr style={{ margin: "4px 0" }} />
                    <div
                      className="d-flex align-items-start"
                      style={{ cursor: "pointer" }}
                      onClick={handleDeliveryPartnerClick}
                    >
                      <DeliveryDiningIcon
                        sx={{ fontSize: 24, marginRight: "4px" }}
                      />
                      <small
                        style={{
                          fontSize: "12px",
                          fontFamily: "Poppins",
                          lineHeight: "28px",
                        }}
                      >
                        Delivery Partner
                      </small>
                    </div>
                    <hr style={{ margin: "4px 0" }} />
                    <div
                      className="d-flex align-items-start"
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        document
                          .getElementById("myTicketsSection")
                          ?.scrollIntoView({ behavior: "smooth" })
                      }
                    >
                      <ConfirmationNumberIcon
                        sx={{ fontSize: 24, marginRight: "8px" }}
                      />
                      <small
                        style={{
                          fontSize: "12px",
                          fontFamily: "Poppins",
                          lineHeight: "28px",
                        }}
                      >
                        My Tickets
                      </small>
                    </div>
                    <hr style={{ margin: "4px 0" }} />
                    <div
                      className="d-flex align-items-center logout-btn"
                      style={{ cursor: "pointer" }}
                      onClick={() => (window.location.href = "/loginnew")}
                    >
                      <LogoutIcon className="me-2" />
                      <span>Logout</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Interest Modal */}
            <Modal
              show={showInterestModal}
              onHide={() => setShowInterestModal(false)}
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title>
                  Are you interested in joining as a delivery partner?
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <div className="d-flex flex-column">
                  <label>
                    <input
                      type="radio"
                      name="interest"
                      value="yes"
                      checked={selectedOption === "yes"}
                      onChange={(e) => setSelectedOption(e.target.value)}
                    />{" "}
                    Yes
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="interest"
                      value="no"
                      checked={selectedOption === "no"}
                      onChange={(e) => setSelectedOption(e.target.value)}
                    />{" "}
                    No
                  </label>
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => setShowInterestModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleConfirmInterest}
                  disabled={!selectedOption}
                >
                  Continue
                </Button>
              </Modal.Footer>
            </Modal>

            <Modal
              show={!!autoOrderPrompt}
              onHide={() => setAutoOrderPrompt(null)}
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title>
                  {autoOrderPrompt?.title || "Order Update"}
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <p className="mb-2">{autoOrderPrompt?.message}</p>
                <div className="small text-muted">
                  Tap Track Now to view the latest delivery slot and order
                  assignment details.
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => setAutoOrderPrompt(null)}
                >
                  Dismiss
                </Button>
                <Button
                  variant="success"
                  onClick={() => {
                    const ticket = autoOrderPrompt?.ticket;
                    setAutoOrderPrompt(null);
                    if (ticket) {
                      handleTrackOrder(ticket);
                    }
                  }}
                >
                  Track Now
                </Button>
              </Modal.Footer>
            </Modal>

            {/* Notification Modal */}
            <Modal
              show={showNotificationModal}
              onHide={() => setShowNotificationModal(false)}
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title>Notification</Modal.Title>
              </Modal.Header>

              <Modal.Body>
                {isRegistered && partnerStatus === "open" ? (
                  deliveryTicketsLoading ? (
                    <p>Loading tickets…</p>
                  ) : (
                    <>
                      {/* Search */}
                      <input
                        type="text"
                        className="form-control mb-3"
                        placeholder="Search by Order ID..."
                        value={searchOrderId}
                        onChange={(e) => setSearchOrderId(e.target.value)}
                      />
                      {filteredGroceryData.length === 0 ? (
                        <p>No Tickets Found.</p>
                      ) : (
                        <div className="notification-list">
                          {filteredGroceryData.map((t) => (
                            <div
                              key={t.id || t.martId}
                              className="notification-item mb-3 p-2 border rounded"
                            >
                              <div>
                                <strong>Order Id:</strong>{" "}
                                <span
                                  style={{ color: "blue", cursor: "pointer" }}
                                  onClick={() => {
                                    setSelectedTicket(t);
                                    setSelectedOrder({
                                      ...t,
                                      paymentType: t.paymentType || "",
                                      receivedAmount: t.receivedAmount || "",
                                      cashAmount: t.cashAmount || "",
                                      onlineAmount: t.onlineAmount || "",
                                    });
                                    setShowOrderModal(true);
                                  }}
                                >
                                  {t.martId}
                                </span>
                                <br />
                                <strong>Name:</strong>{" "}
                                <span
                                  style={{ color: "blue", cursor: "pointer" }}
                                >
                                  {t.customerName}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )
                ) : (
                  <p>You are already registered, pending for admin approval.</p>
                )}
              </Modal.Body>
            </Modal>
            <Modal
              show={showOrderModal}
              onHide={() => setShowOrderModal(false)}
              centered
            >
              <Modal.Header
                closeButton
                style={{ backgroundColor: "green", color: "white" }}
              >
                <Modal.Title>Order Details</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {selectedOrder && (
                  <>
                    {/* Customer Info */}
                    <div className="mb-1">
                      <strong>Order Id:</strong> {selectedOrder.martId} <br />
                      <strong>Customer Name:</strong>{" "}
                      {selectedOrder.customerName}
                    </div>
                    <div className="mb-1">
                      <strong>Address:</strong>{" "}
                      {[
                        selectedOrder.address,
                        selectedOrder.district,
                        selectedOrder.state,
                        selectedOrder.zipCode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                    {/* View Details Link */}
                    <div className="mb-1">
                      <span
                        onClick={() => setShowDetails(!showDetails)}
                        style={{
                          color: "blue",
                          cursor: "pointer",
                          textDecoration: "underline",
                          fontWeight: "500",
                        }}
                      >
                        {showDetails ? "Hide Details" : "View Details"}
                      </span>
                    </div>

                    {/* Table - Show only when clicked */}
                    {showDetails && (
                      <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                        <table className="table table-bordered text-center">
                          <thead
                            style={{
                              backgroundColor: "#cfe2d9",
                              position: "sticky",
                              top: 0,
                              zIndex: 1,
                            }}
                          >
                            <tr>
                              <th>S.No</th>
                              <th>Product Name</th>
                              <th>Quantity</th>
                              <th>Price (₹)</th>
                            </tr>
                          </thead>

                          <tbody>
                            {selectedOrder.categories
                              ?.flatMap((cat) => cat.products)
                              ?.map((p, index) => (
                                <tr key={index}>
                                  <td>{index + 1}</td>
                                  <td>{p.productName}</td>
                                  <td>{p.noOfQuantity}</td>
                                  <td>{p.afterDiscountPrice.toFixed(0)}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {/* Totals */}
                    <div className="text-center text-danger mt-1">
                      <h6>
                        <strong>Total Amount:</strong> ₹
                        {selectedOrder.categories?.reduce(
                          (sum, cat) => sum + (cat.totalAmount || 0),
                          0,
                        )}
                      </h6>
                      <h6>
                        <strong>Grand Total:</strong> ₹
                        {selectedOrder.grandTotal}
                      </h6>
                    </div>
                    {/* EXPANDED DETAILS */}
                    {selectedOrder.status !== "Delivered" && (
                      <div className="mt-2 p-2 border-top">
                        {/* Payment Type */}
                        <div className="mt-2">
                          <input
                            type="radio"
                            name="paymentType"
                            disabled={isActionLocked}
                            checked={selectedOrder.paymentType === "cash"}
                            onChange={() =>
                              setSelectedOrder((prev) => ({
                                ...prev,
                                paymentType: "cash",
                                receivedAmount: "",
                                cashAmount: "",
                                onlineAmount: "",
                              }))
                            }
                          />{" "}
                          Cash
                          <input
                            type="radio"
                            name="paymentType"
                            className="ms-3"
                            disabled={isActionLocked}
                            checked={selectedOrder.paymentType === "online"}
                            onChange={() =>
                              setSelectedOrder((prev) => ({
                                ...prev,
                                paymentType: "online",
                                receivedAmount: "",
                                cashAmount: "",
                                onlineAmount: "",
                              }))
                            }
                          />{" "}
                          Online
                          <input
                            type="radio"
                            name="paymentType"
                            className="ms-3"
                            disabled={isActionLocked}
                            checked={
                              selectedOrder.paymentType === "Cash&Online"
                            }
                            onChange={() =>
                              setSelectedOrder((prev) => ({
                                ...prev,
                                paymentType: "Cash&Online",
                                receivedAmount: "",
                                cashAmount: "",
                                onlineAmount: "",
                              }))
                            }
                          />{" "}
                          Cash & Online
                        </div>

                        {/* Payment Inputs */}
                        {selectedOrder.paymentType === "Cash&Online" ? (
                          <div className="mt-2 d-flex gap-3 flex-wrap align-items-end">
                            <div>
                              <label>Cash:</label>
                              <input
                                type="number"
                                className="form-control"
                                style={{ width: "120px" }}
                                disabled={isActionLocked}
                                value={selectedOrder.cashAmount || ""}
                                onChange={(e) => {
                                  const cash = Number(e.target.value);
                                  const online = Number(
                                    selectedOrder.onlineAmount || 0,
                                  );

                                  setSelectedOrder((prev) => ({
                                    ...prev,
                                    cashAmount: cash,
                                    receivedAmount: cash + online,
                                  }));
                                }}
                              />
                            </div>

                            <div>
                              <label>Online:</label>
                              <input
                                type="number"
                                className="form-control"
                                style={{ width: "120px" }}
                                disabled={isActionLocked}
                                value={selectedOrder.onlineAmount || ""}
                                onChange={(e) => {
                                  const online = Number(e.target.value);
                                  const cash = Number(
                                    selectedOrder.cashAmount || 0,
                                  );

                                  setSelectedOrder((prev) => ({
                                    ...prev,
                                    onlineAmount: online,
                                    receivedAmount: cash + online,
                                  }));
                                }}
                              />
                            </div>

                            <div className="mb-1">
                              <strong>
                                Total: ₹ {selectedOrder.receivedAmount || 0}
                              </strong>
                            </div>
                            <button
                              className="btn btn-success"
                              onClick={() => {
                                handleUpdatePaymentMethod(selectedOrder);
                                setGroceryData((prev) =>
                                  prev.map((item) =>
                                    item.id === selectedOrder.id
                                      ? selectedOrder
                                      : item,
                                  ),
                                );
                                setShowOrderModal(false);
                              }}
                              disabled={
                                isActionLocked ||
                                !selectedOrder.cashAmount ||
                                Number(selectedOrder.cashAmount) <= 0 ||
                                !selectedOrder.onlineAmount ||
                                Number(selectedOrder.onlineAmount) <= 0
                              }
                            >
                              Submit
                            </button>
                            {/* Decline */}
                            <div className="mb-1">
                              <button
                                className="btn btn-danger"
                                onClick={() => {
                                  handleStatusUpdate(selectedOrder, "Open");
                                  setGroceryData((prev) =>
                                    prev.map((item) =>
                                      item.id === selectedOrder.id
                                        ? { ...item, status: "Open" }
                                        : item,
                                    ),
                                  );

                                  setShowOrderModal(false);
                                }}
                              >
                                Decline
                              </button>
                              <button
                                className="btn btn-warning ms-2"
                                onClick={() => {
                                  handleStatusUpdate(selectedOrder, "Return");

                                  setGroceryData((prev) =>
                                    prev.map((item) =>
                                      item.id === selectedOrder.id
                                        ? { ...item, status: "Return" }
                                        : item,
                                    ),
                                  );
                                }}
                              >
                                Return
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-1 d-flex align-items-center gap-2 flex-wrap">
                            <label className="mb-0">Amount:</label>
                            <input
                              type="number"
                              className="form-control"
                              style={{ width: "110px" }}
                              placeholder="Enter Amount"
                              value={selectedOrder.receivedAmount || ""}
                              onChange={(e) =>
                                setSelectedOrder((prev) => ({
                                  ...prev,
                                  receivedAmount: Number(e.target.value),
                                }))
                              }
                            />
                            <button
                              className="btn btn-success"
                              onClick={() => {
                                handleUpdatePaymentMethod(selectedOrder);

                                setGroceryData((prev) =>
                                  prev.map((item) =>
                                    item.id === selectedOrder.id
                                      ? selectedOrder
                                      : item,
                                  ),
                                );

                                setShowOrderModal(false);
                              }}
                              disabled={
                                !selectedOrder.paymentType ||
                                !selectedOrder.receivedAmount ||
                                Number(selectedOrder.receivedAmount) <= 0
                              }
                            >
                              Submit
                            </button>
                            {/* Decline */}
                            <div className="mb-2">
                              <button
                                className="btn btn-danger"
                                onClick={() => {
                                  handleStatusUpdate(selectedOrder, "Open");

                                  setGroceryData((prev) =>
                                    prev.map((item) =>
                                      item.id === selectedOrder.id
                                        ? { ...item, status: "Open" }
                                        : item,
                                    ),
                                  );

                                  setShowOrderModal(false);
                                }}
                              >
                                Decline
                              </button>
                              <button
                                className="btn btn-warning ms-2"
                                onClick={() => {
                                  handleStatusUpdate(selectedOrder, "Return");
                                  setGroceryData((prev) =>
                                    prev.map((item) =>
                                      item.id === selectedOrder.id
                                        ? { ...item, status: "Return" }
                                        : item,
                                    ),
                                  );
                                }}
                              >
                                Return
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </Modal.Body>
            </Modal>
            {/* {showRedeem && (
            <ReedemCode
              openOverride={true}     
              showTrigger={false} 
              initialOpen={true}
              userPoints={userPoints}
              onSendRef={handleSendRef}
              onRedeem={handleRedeemCoins}
              referrerId={userId}
              customerName={profile.fullName}
             onInviteSuccess={(data) => {
              setShowCoinsModal(true);
              setRefRecord(data.refRecord);
              setUserPoints(data.points || 0);
            }}
            />
        )} */}

            {isMobile && (
              <div>
                <div
                  style={{
                    padding: "12px",
                    maxWidth: "1100px",
                    margin: "auto",
                  }}
                >
                  {/* 🔍 SEARCH + 🎤 MIC */}
                  <div style={{ position: "relative", marginBottom: "12px" }}>
                    <input
                      className="form-control ps-5 pe-5"
                      placeholder={placeholderSuggestions[placeholderIndex]}
                      style={{ border: "2px solid #000", borderRadius: "6px" }}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    <SearchIcon
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#000",
                      }}
                    />

                    {/* 🎤 Better Mic Button */}
                    <button
                      onClick={startVoiceSearch}
                      title="Speak product name"
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        border: listening
                          ? "2px solid red"
                          : "2px solid transparent",
                        background: listening
                          ? "rgba(255,0,0,0.1)"
                          : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "0.2s ease-in-out",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="22"
                        viewBox="0 0 24 24"
                        width="22"
                        fill={listening ? "red" : "#000"}
                      >
                        <path d="M12 14a2 2 0 0 0 2-2V6a2 2 0 1 0-4 0v6a2 2 0 0 0 2 2zm5-2a5 5 0 0 1-10 0H5a7 7 0 0 0 14 0h-2zm-5 9c-1.1 0-2-.9-2-2h4a2 2 0 0 1-2 2z" />
                      </svg>
                    </button>
                  </div>
                  {/* 📦 PRODUCTS */}
                  {loading && <p>Loading products...</p>}
                  <div
                    className="grocery-row flex flex-wrap gap-1"
                    style={{ marginBottom: "5px" }}
                  >
                    {displayProducts.map((product) =>
                      renderProductCard(product),
                    )}
                    {/* Cart Bar */}
                    {(() => {
                      const readAllCategories = () => {
                        if (typeof window === "undefined") return [];
                        try {
                          const raw = localStorage.getItem("allCategories");
                          if (!raw) return [];
                          const parsed = JSON.parse(raw);
                          const arr = Array.isArray(parsed) ? parsed : [parsed];
                          return arr.filter(Boolean).map((cat) => ({
                            ...cat,
                            products: Array.isArray(cat?.products)
                              ? cat.products
                              : [],
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
                              Number(
                                p?.afterDiscountPrice ??
                                  p?.price ??
                                  p?.finalPrice ??
                                  0,
                              ) || 0;
                            acc.items += qty;
                            acc.total += price * qty;
                          }
                          return acc;
                        },
                        { items: 0, total: 0 },
                      );
                      const items = summary.items;
                      const total = Math.round(summary.total);
                      return items > 0 ? (
                        <div
                          style={{
                            position: "fixed",
                            bottom: "40px",
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
                            marginTop: "0px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            🛒
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                lineHeight: "1.2",
                              }}
                            >
                              <span style={{ fontSize: "12px" }}>
                                {items} items
                              </span>
                              <span style={{ fontSize: "12px" }}>₹{total}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="text-white fw-bold d-flex align-items-center gap-1"
                            style={{
                              fontSize: "12px",
                              cursor: "pointer",
                              background: "transparent",
                              border: "none",
                            }}
                            onClick={() =>
                              navigate(`/groceryCart/${userType}/${userId}`)
                            }
                          >
                            View Cart →
                          </button>
                        </div>
                      ) : null;
                    })()}
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
                      className="close-button text-end"
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
                          loading="lazy"
                          decoding="async"
                          src={zoomImage}
                          alt={zoomProduct?.name || "Zoomed Product"}
                          className="zoom-image"
                        />
                      </div>
                      <h6
                        className="text-start fw-bold"
                        style={{ fontSize: "12px" }}
                      >
                        {zoomProduct?.name || ""}
                      </h6>
                      {zoomProduct?.afterDiscount != null && (
                        <p className="text-start" style={{ fontSize: "12px" }}>
                          <b className="text-success me-2">
                            ₹{Math.round(Number(zoomProduct.afterDiscount))}
                          </b>
                          {zoomProduct?.mrp ? (
                            <s className="text-muted">₹{zoomProduct.mrp}</s>
                          ) : null}
                        </p>
                      )}
                    </Modal.Body>
                  </Modal>
                  <div className="text-primary fw-bold fs-5">
                    Welcome{" "}
                    <small className="text-dark">{profile.fullName}</small>
                  </div>
                  {/* {renderVendorPanel()} */}
                </div>
              </div>
            )}

            {/* Mobile Dashboard Icons */}
            {isMobile && (
              <div
                className="mobile-top-icons position-fixed start-0 end-0 bg-white border-bottom shadow-sm"
                style={{
                  top: "80px",
                  zIndex: 1050,
                  height: "90px",
                  padding: "8px",
                  overflowY: "hidden",
                }}
              >
                <div className="d-flex flex-wrap justify-content-around align-items-center">
                  {menuList.map((menu, index) =>
                    menu.MenuTitle === "Vendor Portal" ? (
                      <button
                        key={index}
                        type="button"
                        onClick={handleVendorPortal}
                        className="btn p-0 border-0 bg-transparent d-flex flex-column align-items-center justify-content-center text-decoration-none text-dark ms-1"
                        style={{ minWidth: "10px", flex: "0 0 auto" }}
                      >
                        <div
                          style={{
                            backgroundColor: "#ffc107",
                            borderRadius: "50%",
                            padding: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "40px",
                            height: "40px",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                            position: "relative",
                          }}
                        >
                          {vendorSessionId ? (
                            <span
                              style={{
                                fontSize: 14,
                                fontWeight: "bold",
                                color: "#000",
                              }}
                            >
                              {getVendorIcon(vendorProfile?.name)}
                            </span>
                          ) : (
                            React.cloneElement(menu.MenuIcon, {
                              sx: { fontSize: 22, color: "#000" },
                            })
                          )}
                          {renderVendorOrderBell()}
                        </div>
                        <small
                          style={{
                            fontSize: "12px",
                            fontFamily: "Roboto",
                            fontWeight: "bold",
                            textAlign: "center",
                            lineHeight: "14px",
                            marginTop: "4px",
                            color: "#333",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {(vendorSessionId
                            ? vendorProfile?.name || menu.MenuTitle
                            : menu.MenuTitle
                          )
                            .split(" ")
                            .map((word, idx, arr) => (
                              <React.Fragment key={idx}>
                                {word}
                                {idx !== arr.length - 1 && <br />}
                              </React.Fragment>
                            ))}
                        </small>
                      </button>
                    ) : (
                      <a
                        key={index}
                        href={menu.TargetUrl}
                        className="d-flex flex-column align-items-center justify-content-center text-decoration-none text-dark ms-1"
                        style={{ minWidth: "10px", flex: "0 0 auto" }}
                      >
                        <div
                          style={{
                            backgroundColor: "#ffc107",
                            borderRadius: "50%",
                            padding: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "40px",
                            height: "40px",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                          }}
                        >
                          {React.cloneElement(menu.MenuIcon, {
                            sx: { fontSize: 22, color: "#000" },
                          })}
                        </div>
                        <small
                          style={{
                            fontSize: "12px",
                            fontFamily: "Roboto",
                            fontWeight: "bold",
                            textAlign: "center",
                            lineHeight: "14px",
                            marginTop: "4px",
                            color: "#333",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {menu.MenuTitle.split(" ").map((word, idx) => (
                            <React.Fragment key={idx}>
                              {word}
                              {idx !== menu.MenuTitle.split(" ").length - 1 && (
                                <br />
                              )}
                            </React.Fragment>
                          ))}
                        </small>
                      </a>
                    ),
                  )}
                </div>
              </div>
            )}

            <div className="col-md-9">
              {/* 🥚 DAILY POT REWARD GAME */}
              <PotRewardGame
                userId={userId}
                onWalletCredited={(newAmount) =>
                  setWalletAmount(String(newAmount))
                }
              />

              <div
                className="container"
                style={{
                  minHeight: "60vh",
                  paddingTop: isMobile ? `${MOBILE_PADDING_TOP}px` : "0px",
                }}
              >
                <div className="shadow-lg p-2 rounded-5 text-center bg-transparent border-0">
                  {/* Vendor Tabs */}
                  <div
                    className="d-flex align-items-center mb-3"
                    style={{ gap: "6px", marginBottom: "12px" }}
                  >
                    <button
                      type="button"
                      onClick={() => scrollVendorTabs(-1)}
                      aria-label="Scroll stores left"
                      style={{
                        flex: "0 0 auto",
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        border: "1px solid #ffddcc",
                        background: "#fff3ed",
                        color: "#ff5722",
                        fontWeight: "bold",
                        fontSize: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        lineHeight: 1,
                        cursor: "pointer",
                      }}
                    >
                      <ArrowBackIcon style={{ fontSize: 16 }} />
                    </button>
                    <div
                      ref={vendorTabsRef}
                      className="vendor-tabs-wrapper mb-3"
                      style={{
                        width: "100%",
                        overflowX: "auto",
                        overflowY: "hidden",
                        WebkitOverflowScrolling: "touch",
                        scrollbarWidth: "none",
                        padding: "5px 8px 8px",
                      }}
                    >
                      <div
                        className="d-flex align-items-center gap-2"
                        style={{
                          width: "max-content",
                        }}
                      >
                        {/* Lakshmi Mart */}
                        {/* <button
                        type="button"
                        onClick={() => setSelectedMartTab("Lakshmi Mart")}
                        className="vendor-tab d-flex flex-column align-items-center bg-transparent border-0"
                        style={{
                          flex: "0 0 auto",
                          padding: "2px 4px",
                          width: "64px",
                        }}
                      >
                        <div
                          style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "16px",
                            fontWeight: "800",
                            border:
                              selectedMartTab === "Lakshmi Mart"
                                ? "2px solid #ff5722"
                                : "1px solid #ffddcc",
                            background:
                              selectedMartTab === "Lakshmi Mart"
                                ? "#ff5722"
                                : "#fff3ed",
                            color:
                              selectedMartTab === "Lakshmi Mart"
                                ? "#fff"
                                : "#ff5722",
                            transition: "all 0.2s ease",
                          }}
                        >
                          LM
                        </div>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight:
                              selectedMartTab === "Lakshmi Mart"
                                ? "700"
                                : "600",
                            color:
                              selectedMartTab === "Lakshmi Mart"
                                ? "#ff5722"
                                : "#555",
                            marginTop: "4px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "64px",
                          }}
                        >
                          Lakshmi Mart
                        </span>
                      </button> */}

                        {/* Vendors */}
                        {approvedVendorListJson.map((v) => {
                          const isActive = selectedMartTab === v.vendorId;

                          return (
                            <button
                              type="button"
                              key={v.vendorId}
                              data-vendor-id={v.vendorId}
                              onClick={() => {
                                setSelectedMartTab(v.vendorId);
                                localStorage.setItem(
                                  "selectedVendorId",
                                  v.vendorId,
                                );
                                console.log(
                                  "selectedVendorId (localStorage):",
                                  localStorage.getItem("selectedVendorId"),
                                );
                              }}
                              className="vendor-tab d-flex flex-column align-items-center bg-transparent border-0"
                              style={{
                                flex: "0 0 auto",
                                padding: "2px 4px",
                                width: "64px",
                              }}
                            >
                              <div
                                style={{
                                  width: "44px",
                                  height: "44px",
                                  borderRadius: "50%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "16px",
                                  fontWeight: "800",
                                  border: isActive
                                    ? "2px solid #ff5722"
                                    : "1px solid #ffddcc",
                                  background: isActive ? "#ff5722" : "#fff3ed",
                                  color: isActive ? "#fff" : "#ff5722",
                                  transition: "all 0.2s ease",
                                }}
                              >
                                {getVendorIcon(v.storeName)}
                              </div>
                              <span
                                style={{
                                  fontSize: "10px",
                                  fontWeight: isActive ? "700" : "600",
                                  color: isActive ? "#ff5722" : "#555",
                                  marginTop: "4px",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  maxWidth: "64px",
                                }}
                              >
                                {v.storeName}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => scrollVendorTabs(1)}
                      aria-label="Scroll stores right"
                      style={{
                        flex: "0 0 auto",
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        border: "1px solid #ffddcc",
                        background: "#fff3ed",
                        color: "#ff5722",
                        fontWeight: "bold",
                        fontSize: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        lineHeight: 1,
                        cursor: "pointer",
                      }}
                    >
                      <ArrowForwardIcon style={{ fontSize: 16 }} />
                    </button>
                  </div>
                  {/* ── Lakshmi Mart's own categories (unchanged) ── */}
                  {/* {selectedMartTab === "Lakshmi Mart" && (
                    <>
                      <div className="row row-cols-3 row-cols-md-6 g-1">
                        {firstCategories.map((cat) => (
                          <div
                            className="col"
                            key={cat.label}
                            onClick={() => handleGroceryCategoryClick(cat)}
                            style={{ cursor: "pointer" }}
                          >
                            <div
                              className="groceryIcon-card border-0 shadow-sm text-center d-flex flex-column align-items-center justify-content-between"
                              style={{
                                height: isMobile ? "130px" : "140px",
                                width: isMobile ? "90px" : "120px",
                                cursor: "pointer",
                                padding: "6px",
                                margin: "5px",
                              }}
                            >
                              <img
                                loading="lazy"
                                decoding="async"
                                src={cat.image}
                                alt={cat.label}
                                style={{
                                  height: "80px",
                                  width: "80px",
                                  borderRadius: "8px",
                                  marginTop: "2px",
                                  objectFit: "cover",
                                }}
                              />
                              <span
                                style={{
                                  fontSize: "12px",
                                  fontWeight: "bold",
                                  marginTop: "6px",
                                  minHeight: "24px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  textAlign: "center",
                                  lineHeight: "1.2",
                                }}
                              >
                                {cat.label}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="row row-cols-3 row-cols-md-5 g-1">
                        {secondCategories.map((cat) => (
                          <div
                            className="col"
                            key={cat.label}
                            onClick={() => handleGroceryCategoryClick(cat)}
                            style={{ cursor: "pointer" }}
                          >
                            <div
                              className="groceryIcon-card border-0 shadow-sm text-center d-flex flex-column align-items-center justify-content-between"
                              style={{
                                height: isMobile ? "120px" : "140px",
                                width: isMobile ? "90px" : "120px",
                                cursor: "pointer",
                                padding: "6px",
                                margin: "5px",
                              }}
                            >
                              <img
                                loading="lazy"
                                decoding="async"
                                src={cat.image}
                                alt={cat.label}
                                style={{
                                  height: "80px",
                                  width: "80px",
                                  borderRadius: "8px",
                                  marginTop: "2px",
                                  objectFit: "cover",
                                }}
                              />
                              <span
                                style={{
                                  fontSize: "12px",
                                  fontWeight: "bold",
                                  marginBottom: "3px",
                                  marginTop: "5px",
                                  minHeight: "24px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  textAlign: "center",
                                  lineHeight: "1.2",
                                }}
                              >
                                {cat.label}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )} */}

                  {/* ── Selected Vendor's categories + products (from vendorlist.json) ── */}
                  {selectedMartTab !== "Lakshmi Mart" &&
                    (() => {
                      const vendor = approvedVendorListJson.find(
                        (v) => v.vendorId === selectedMartTab,
                      );
                      if (!vendor) return null;
                      return (
                        <>
                          <div className="row row-cols-3 row-cols-md-6 g-1">
                            {vendor.categories.map((catObj) => {
                              const isActive =
                                selectedVendorJsonCategory === catObj.category;
                              return (
                                <div
                                  className="col"
                                  key={catObj.category}
                                  onClick={() =>
                                    handleVendorCategoryClick(vendor, catObj)
                                  }
                                  style={{ cursor: "pointer" }}
                                >
                                  <div
                                    className="groceryIcon-card border-0 shadow-sm text-center d-flex flex-column align-items-center justify-content-between"
                                    style={{
                                      height: isMobile ? "130px" : "140px",
                                      width: isMobile ? "90px" : "120px",
                                      padding: "6px",
                                      margin: "5px",
                                      boxShadow: isActive
                                        ? "0 0 0 2px #ff5722, 0 4px 10px rgba(0,0,0,0.15)"
                                        : undefined,
                                    }}
                                  >
                                    <img
                                      loading="lazy"
                                      decoding="async"
                                      src={getVendorCategoryImage(
                                        catObj.category,
                                      )}
                                      alt={catObj.category}
                                      style={{
                                        height: "80px",
                                        width: "80px",
                                        borderRadius: "8px",
                                        marginTop: "2px",
                                        objectFit: "cover",
                                      }}
                                    />
                                    <span
                                      style={{
                                        fontSize: "12px",
                                        fontWeight: "bold",
                                        marginTop: "6px",
                                        minHeight: "24px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        textAlign: "center",
                                        lineHeight: "1.2",
                                        color: isActive ? "#ff5722" : "#000",
                                      }}
                                    >
                                      {catObj.category}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* {selectedVendorJsonCategory && (
          <div className="grocery-row flex flex-wrap justify-content-center gap-1 mt-2" style={{ marginBottom: "5px" }}>
            {(vendor.categories.find((c) => c.category === selectedVendorJsonCategory)?.products || []).length === 0 ? (
              <small className="text-muted d-block my-2">
                No products found for "{selectedVendorJsonCategory}".
              </small>
            ) : (
              vendor.categories
                .find((c) => c.category === selectedVendorJsonCategory)
                .products.map((p) => renderVendorJsonProductCard(p))
            )}
          </div>
        )} */}
                        </>
                      );
                    })()}
                </div>

                <div
                  className="shadow-lg rounded-4 p-3 mb-2"
                  style={{
                    color: "#000",
                  }}
                >
                  <h6
                    className="fw-bold text-center mb-2"
                    style={{
                      letterSpacing: "1px",
                      color: "#ff5722",
                      fontSize: "20px",
                    }}
                  >
                    Home Appliances
                  </h6>
                  <div className="d-flex justify-content-around align-items-center row row-cols-3 row-cols-md-6">
                    {[
                      {
                        label: "Electrical",
                        value: "Electrical Products",
                        image: HomeElectricalImg,
                      },
                      {
                        label: "Plumbing",
                        value: "Plumbing Products",
                        image: HomePlumbingImg,
                      },
                      {
                        label: "Kitchenware",
                        value: "Kitchenware Appliances",
                        image: KitchenImg,
                      },
                      {
                        label: "Home Decors",
                        value: "Home Decors",
                        image: HomeDecor,
                      },
                      {
                        label: "Electronics Appliances",
                        value: "Electronics appliances",
                        image: Electronics,
                      },
                      {
                        label: "Hardware Items",
                        value: "Hardware items",
                        image: Hardware,
                      },
                    ].map((item) => (
                      <div
                        key={item.value}
                        onClick={() => handleGroceryCategoryClick(item)}
                        style={{
                          cursor: "pointer",
                          textAlign: "center",
                          width: "90px",
                        }}
                      >
                        <img
                          loading="lazy"
                          decoding="async"
                          src={item.image}
                          alt={item.label}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                        />
                        <small
                          className="d-block mt-2 fw-semibold"
                          style={{ fontSize: "12px" }}
                        >
                          {item.label}
                        </small>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Home Products Section */}
                {/* <div className="shadow-lg p-2 mb-1 rounded-5 bg-transparent border-0">
                  <h5
                    className="text-center fw-bold mb-3"
                    style={{ color: "#ff5722", fontSize: "20px" }}
                  >
                    Home Products
                  </h5>
                  <div className="row row-cols-3 row-cols-md-5 g-2 align-items-stretch">
                    {categories.map((cat) => (
                      <div
                        className="col"
                        key={cat.label}
                        onClick={() => handleCategoryClick(cat)}
                      >
                        <div
                          className="card border-0 shadow-sm text-center"
                          style={{
                            height: isMobile ? "120px" : "140px",
                            width: isMobile ? "90px" : "120px",
                            cursor: "pointer",
                            padding: "8px",
                            marginTop: "5px",
                          }}
                        >
                          <img
                            loading="lazy"
                            decoding="async"
                            src={cat.image}
                            alt={cat.label}
                            style={{
                              height: "70px",
                              width: "70px",
                              borderRadius: "8px",
                              objectFit: "cover",
                            }}
                          />
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: "bold",
                              marginTop: "5px",
                              minHeight: "24px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              textAlign: "center",
                              lineHeight: "1.2",
                            }}
                          >
                            {cat.label}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div> */}

                {/* Collections Section */}
                {/* <div className="shadow-lg p-2 rounded-5 text-center bg-transparent border-0">
                  <span
                    style={{
                      background:
                        "linear-gradient(45deg, #ff4081, #ff9800, #ff5722)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      color: "transparent",
                      WebkitTextFillColor: "transparent",
                      fontSize: "20px",
                      fontWeight: "bold",
                      fontFamily: "'Poppins', sans-serif",
                      display: "inline-block",
                    }}
                  >
                    Lakshmi Collections
                  </span>
                  <div className="row row-cols-3 row-cols-md-5 g-2">
                    {collectionsCategories.map((cat) => (
                      <div
                        className="col"
                        key={cat.label}
                        onClick={() => handleDressCategoryClick(cat)}
                      >
                        <div
                          className="groceryIcon-card border-0 shadow-sm text-center d-flex flex-column align-items-center justify-content-between"
                          style={{
                            height: isMobile ? "120px" : "140px",
                            width: isMobile ? "90px" : "120px",
                            cursor: "pointer",
                            padding: "8px",
                            margin: "5px",
                          }}
                        >
                          <img
                            loading="lazy"
                            decoding="async"
                            src={cat.image}
                            alt={cat.label}
                            style={{
                              height: "80px",
                              width: "80px",
                              borderRadius: "8px",
                              marginTop: "2px",
                              objectFit: "cover",
                            }}
                          />
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: "bold",
                              marginBottom: "3px",
                              marginTop: "5px",
                              minHeight: "24px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              textAlign: "center",
                              lineHeight: "1.2",
                            }}
                          >
                            {cat.label}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div> */}
              </div>

              {/* Dashboard Desktop */}
              {!isMobile ? (
                <>
                  <h5 className="mb-2 fs-4">Dashboard</h5>
                  <div className="row g-2">
                    {menuList.map((menu, index) => (
                      <div className="col-4" key={index}>
                        {menu.MenuTitle === "Delivery Partner" ||
                        menu.MenuTitle === "Vendor Portal" ? (
                          <div
                            className="text-decoration-none"
                            style={{ color: "inherit", cursor: "pointer" }}
                            onClick={
                              menu.MenuTitle === "Vendor Portal"
                                ? handleVendorPortal
                                : handleDeliveryPartnerClick
                            }
                          >
                            <div className="mnu_mn text-center d-flex flex-column justify-content-center align-items-center">
                              <span
                                className="material-symbols-outlined custom-icon position-relative d-inline-flex"
                                style={{ fontSize: "40px" }}
                              >
                                {menu.MenuTitle === "Vendor Portal" &&
                                vendorSessionId ? (
                                  <span
                                    className="d-inline-flex align-items-center justify-content-center rounded-circle"
                                    style={{
                                      width: 40,
                                      height: 40,
                                      backgroundColor: "#10301F",
                                      color: "#fff",
                                      fontSize: 16,
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {getVendorIcon(vendorProfile?.name)}
                                  </span>
                                ) : menu.MenuTitle === "Delivery Partner" &&
                                  isRegistered &&
                                  partnerStatus === "open" ? (
                                  <span
                                    className="d-inline-flex align-items-center justify-content-center rounded-circle"
                                    style={{
                                      width: 40,
                                      height: 40,
                                      backgroundColor: "#10301F",
                                      color: "#fff",
                                      fontSize: 16,
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {getVendorIcon(
                                      deliveryProfile?.deliveryPartnerName,
                                    )}
                                  </span>
                                ) : (
                                  menu.MenuIcon
                                )}
                                {menu.MenuTitle === "Vendor Portal" &&
                                  renderVendorOrderBell()}
                                {menu.MenuTitle === "Delivery Partner" &&
                                  renderDeliveryOrderBell()}
                              </span>
                              <span className="fs-6">
                                {menu.MenuTitle === "Vendor Portal" &&
                                vendorSessionId
                                  ? vendorProfile?.name || menu.MenuTitle
                                  : menu.MenuTitle === "Delivery Partner" &&
                                      isRegistered &&
                                      partnerStatus === "open"
                                    ? deliveryProfile?.deliveryPartnerName ||
                                      menu.MenuTitle
                                    : menu.MenuTitle}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <a
                            href={menu.TargetUrl}
                            className="text-decoration-none"
                            style={{ color: "inherit" }}
                          >
                            <div
                              className="mnu_mn text-center d-flex flex-column justify-content-center align-items-center"
                              style={{ cursor: "pointer" }}
                            >
                              <span
                                className="material-symbols-outlined custom-icon"
                                style={{ fontSize: "40px" }}
                              >
                                {menu.MenuIcon}
                              </span>
                              <span className="fs-6">{menu.MenuTitle}</span>
                            </div>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : null}

              {/* Tickets Section */}
              <div id="myTicketsSection" className="ticket-container">
                <div className="ticket-header">
                  <h4 className="ticket-title">My Tickets</h4>
                </div>
                <div className="ticket-scroll" ref={ticketScrollRef}>
                  {!loading && allTickets.length > 0
                    ? allTickets.map((ticket, index) => (
                        <div
                          key={index}
                          className={`ticket-card1 ${ticket.raiseTicketId ? "raise-ticket-bg" : ticket.martId ? "mart-ticket-bg" : ticket.lakshmiCollectionId ? "lakshmi-collection-bg" : ticket.buyProductId ? "buy-product-bg" : "book-technician-bg"}`}
                        >
                          <div className="ticket-content">
                            <p>
                              <strong>
                                {ticket.raiseTicketId
                                  ? "Raise TicketId"
                                  : ticket.martId
                                    ? "Order Id"
                                    : ticket.lakshmiCollectionId
                                      ? "Collection Id"
                                      : ticket.buyProductId
                                        ? "Buy ProductId"
                                        : "Book TechnicianId"}
                                :
                              </strong>{" "}
                              {ticket.raiseTicketId ||
                                ticket.martId ||
                                ticket.lakshmiCollectionId ||
                                ticket.buyProductId ||
                                ticket.bookTechnicianId}
                            </p>
                            {/* Show View Order only for Mart orders */}
                            {ticket.martId && (
                              <>
                                <p className="ticket-content fw-bold">
                                  Tracking:&nbsp;
                                  <button
                                    type="button"
                                    onClick={() => handleTrackOrder(ticket)}
                                    style={{
                                      background: "none",
                                      border: "none",
                                      padding: 0,
                                      color: "blue",
                                      textDecoration: "underline",
                                      cursor: "pointer",
                                    }}
                                  >
                                    Track Now
                                  </button>
                                </p>
                                <p className="fw-bold">
                                  Grand Total : {ticket.grandTotal} /-
                                </p>
                              </>
                            )}

                            <p>
                              <strong>
                                {ticket.subject
                                  ? "Subject:"
                                  : ticket.productName
                                    ? "Product Name"
                                    : ticket?.categoriess?.[0]?.productName
                                      ? "Collection Name"
                                      : ticket.productName
                                        ? "Job Description"
                                        : ""}
                              </strong>{" "}
                              {ticket.subject ||
                                ticket.productName ||
                                ticket?.categoriess?.[0]?.productName ||
                                ticket.jobDescription}
                            </p>
                            <p>
                              <strong>
                                {ticket.category || ticket.lakshmiCollectionId
                                  ? "Category:"
                                  : ""}{" "}
                              </strong>{" "}
                              {ticket.category ||
                                ticket?.categoriess?.[0]?.categoryName ||
                                ticket.category}
                            </p>
                            <p>
                              <strong>Status:</strong>
                              <span className={ticket.status.toLowerCase()}>
                                {" "}
                                {ticket.status}
                              </span>
                            </p>
                            <p>
                              <strong>
                                {ticket.assignedTo
                                  ? "Assigned To"
                                  : "Payment Mode"}
                                :{" "}
                              </strong>{" "}
                              {ticket.assignedTo ||
                                ticket.assignedTo ||
                                ticket.assignedTo ||
                                `${ticket.paymentMode} or UPI`}
                            </p>
                            <p>
                              <strong>Date:</strong>{" "}
                              {ticket.date
                                ? new Date(ticket.date).toLocaleDateString(
                                    "en-GB",
                                  )
                                : "N/A"}
                            </p>
                            {ticket?.martId && (
                              <p>
                                <strong>
                                  {ticket.slotTime
                                    ? `Scheduled Delivery: ${ticket.slotTime}`
                                    : "Delivery Time Intimated Shortly!"}
                                </strong>
                              </p>
                            )}
                            {/* View Details Button */}
                            {ticket.paidAmount && (
                              <>
                                {/* Only show these if payment is done */}
                                <p>
                                  <strong>Transaction Status:</strong>{" "}
                                  {ticket.transactionStatus}
                                </p>
                                <p>
                                  <strong>Paid Date:</strong> {ticket.orderDate}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    : !loading && <p>No tickets found for this {userType}.</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        show={showTrackModal}
        onHide={() => setShowTrackModal(false)}
        centered
      >
        <Modal.Header
          closeButton
          style={{ backgroundColor: "#198754", color: "white" }}
        >
          <Modal.Title style={{ color: "white" }}>Track Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {trackLoading ? (
            <p className="mb-0">Loading latest order status...</p>
          ) : trackError ? (
            <p className="text-danger mb-0">{trackError}</p>
          ) : trackedOrder ? (
            <>
              <div className="mb-2">
                <strong>Order Id:</strong>{" "}
                {trackedOrder.martId || trackedOrder.id}
              </div>
              <div className="mb-2">
                <strong>Status:</strong> {trackedOrder.status || "N/A"}
              </div>
              <div className="mb-2">
                <strong>Assigned To:</strong>{" "}
                {trackedOrder.assignedTo ||
                  "Delivery partner will be assigned shortly"}
              </div>
              <div
                className={`alert ${trackedOrder.slotTime ? "alert-success" : "alert-info"} mb-2`}
              >
                {trackedOrder.slotTime ? (
                  <>
                    <strong>Scheduled Delivery:</strong> {trackedOrder.slotTime}
                  </>
                ) : (
                  <>
                    <strong>Delivery Time Update:</strong> Delivery time will be
                    intimated shortly.
                  </>
                )}
              </div>
              <div className="small text-muted">
                {trackedOrder.deliveryAssignedTime
                  ? `Last assigned update: ${new Date(trackedOrder.deliveryAssignedTime).toLocaleString("en-GB")}`
                  : "We will update this screen as soon as the admin schedules the order."}
              </div>
            </>
          ) : (
            <p className="mb-0">No tracking details available.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          {trackedOrder?.categories?.length ? (
            <Button
              variant="outline-primary"
              onClick={() => {
                handleViewDetails(trackedOrder);
                setShowTrackModal(false);
              }}
            >
              View Items
            </Button>
          ) : null}
          <Button variant="secondary" onClick={() => setShowTrackModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for Mart Ticket Details */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="lg"
      >
        <Modal.Header
          closeButton
          style={{ backgroundColor: "green", color: "white" }}
        >
          <Modal.Title style={{ color: "white" }}>Order Details</Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ padding: 0 }}>
          {selectedTicket && (
            <div>
              {/* Table Header */}
              <table className="table table-bordered table-striped mb-0">
                <thead className="table-success" style={{ top: 0, zIndex: 2 }}>
                  <tr>
                    <th style={{ width: "10%" }}>S.No</th>
                    <th style={{ width: "40%" }}>Product Name</th>
                    <th style={{ width: "20%" }}>Quantity</th>
                    <th style={{ width: "30%" }}>Price (₹)</th>
                  </tr>
                </thead>
              </table>

              {/* Scrollable Table Body */}
              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                <table className="table table-bordered table-striped mb-0">
                  <tbody>
                    {selectedTicket.categories
                      ?.flatMap((cat) => cat.products)
                      .map((p, idx) => (
                        <tr key={idx}>
                          <td style={{ width: "10%" }}>{idx + 1}</td>
                          <td style={{ width: "40%" }}>{p.productName}</td>
                          <td style={{ width: "20%" }}>{p.noOfQuantity}</td>
                          <td style={{ width: "30%" }}>
                            {Math.round(p.afterDiscountPrice)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Modal.Body>
        {/* Fixed Footer */}
        <Modal.Footer
          style={{
            position: "sticky",
            bottom: 0,
            background: "white",
            zIndex: 2,
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              width: "100%",
              gap: "20px",
              flexWrap: "wrap",
              textAlign: "right",
            }}
          >
            <h5 className="mb-0">
              Total Amount: ₹
              {selectedTicket?.categories?.reduce(
                (sum, category) => sum + (category.totalAmount || 0),
                0,
              )}{" "}
              /-
            </h5>

            {cashbackAmount > 0 && (
              <div className="fw-bold mb-0">
                <span className="text-danger me-2">Cashback Applied:</span>
                <span className="text-success">
                  ₹{Math.round(cashbackAmount)} /-
                </span>
              </div>
            )}
            <h5 className="mb-0">
              Grand Total: ₹{selectedTicket?.grandTotal} /-
            </h5>
          </div>
        </Modal.Footer>
      </Modal>
      <Modal
        show={showOffersModal}
        onHide={() => setShowOffersModal(false)}
        centered
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "15px", fontWeight: "bold" }}>
            🎉Handyman Special Offer Sale!
          </Modal.Title>
        </Modal.Header>
        <Modal.Footer>
          <Button variant="success" onClick={() => setShowOffersModal(false)}>
            Shop Now 🛒
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Push Notification Opt-in Banner — only shown where the browser/WebView
          actually supports it. Plain Android WebView (used by webview-to-APK
          builders) never implements the Notification API, so this banner is
          hidden there; the in-app order-update popup and bell sound already
          work regardless of this permission. */}
      {pushSupported && !pushEnabled && !pushDismissed && userId && (
        <div className="push-notification-banner">
          <div className="push-notification-banner-content">
            <NotificationsActiveIcon
              style={{ fontSize: 24, color: "#ff9800" }}
            />
            <div style={{ flex: 1 }}>
              <strong>Stay Updated!</strong>
              <p style={{ margin: 0, fontSize: 13 }}>
                Get instant alerts on orders, offers & more
              </p>
            </div>
            <button
              className="btn btn-sm btn-warning"
              onClick={handleEnablePush}
              disabled={pushLoading}
              style={{ whiteSpace: "nowrap" }}
            >
              {pushLoading ? "Enabling..." : "Enable"}
            </button>
            <button
              className="btn btn-sm btn-light ms-1"
              onClick={handleDismissPush}
              style={{ padding: "2px 8px", fontSize: 16, lineHeight: 1 }}
              title="Dismiss"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Live Chat Widget */}
      <LiveChatWidget
        userId={userId}
        userName={profile.fullName || fullName || "Customer"}
        userType={userType}
      />
      <Footer />
    </>
  );
};
export default ProfilePage;
