import React, { useEffect } from "react";
import "./App.css";
import DialogHost from "./DialogSystem";
import {
  useNavigate,
  useLocation,
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import RaiseTicket from "./RaiseTicket";
import BuyProducts from "./BuyProducts";
import Sidebar from "./Sidebar";
import BuyProductView from "./BuyProductView";
import AdminProductApproval from "./AdminProductApproval.js";
import AdminProductList from "./AdminProductList.js";
import AdminUpdateProduct from "./AdminUpdateProduct.js";
import AdminUploadForm from "./AdminUploadForm.js";
import AdminSidebar from "./AdminSidebar";
import AdminNotifications from "./AdminNotifications.js";
import RaiseTicketActionView from "./RaiseTicketActionView.js";
import AdminRaiseaQuote from "./AdminRaiseaQuote.js";
import RaiseTicketNotifications from "./RaiseTicketNotifications.js";
import TechnicianQuoteNotifications from "./TechnicianQuoteNotifications.js";
import ViewRaiseQuoteTech from "./ViewRaiseQuoteTech.js";
import ViewDetailsRaiseQuote from "./ViewDetailsRaiseQuote.js";
import RaiseTicketQuotation from "./RaiseTicketQuotation";
import RaiseTicketBuyProducts from "./RaiseTicketBuyProducts.js";
import QuoteNotifications from "./QuoteNotifications";
import NotificationTechnician from "./NotificationTechnician.js";
import CustomerNotification from "./CustomerNotification.js";
import ViewCustomerGrid from "./ViewCustomerGrid.js";
import ViewDealerRaiseTicket from "./ViewDealerRaiseTicket.js";
import ViewDealerDetailsRaiseTicket from "./ViewDealerDetailsRaiseTicket.js";
import CustomerRaiseTicketQuotation from "./CustomerRaiseTicketQuotation.js";
import DealerNotifications from "./DealerNotifications.js";
import DealerNotificationsGrid from "./DealerNotificationsGrid.js";
import DealerGrid from "./DealerGrid.js";
import BidderTicketQuotation from "./BidderTicketQuotation.js";
import TimeSlotBooking from "./TimeSlotBooking.js";
import BookingConfirmation from "./BookingConfirmation.js";
import PaymentConfirmation from "./PaymentConfirmation.js";
import TicketConfirmation from "./TicketConfirmation.js";
import TraderConfirmation from "./TraderConfirmation.js";
import RaiseOrdersGrid from "./RaiseOrdersGrid.js";
import CustomerCareConfirmation from "./CustomerCareConfirmation.js";
import CustomerRaiseTicketTrack from "./CustomerRaiseTicketTrack.js";
import TrackStatusNotifications from "./TrackStatusNotifications.js";
import TicketConfirmationGrid from "./TicketConfirmationGrid.js";
import TraderConfirmationGrid from "./TraderConfirmationGrid.js";
import CustomerCareGrid from "./CustomerCareGrid.js";
import BookTechnician from "./BookTechnician.js";
import BookTechnicianActionView from "./BookTechnicianActionView.js";
import UploadBookTechnician from "./UploadBookTechnician.js";
import BookTechnicianList from "./BookTechnicianList.js";
import BookTechnicianPaymentPage from "./BookTechnicianPaymentPage.js";
import UpdateBookTechnician from "./UpdateBookTechnician.js";
import BookTechnicianNotificationGrid from "./BookTechnicianNotificationGrid.js";
import BookTechnicianCustomerGrid from "./BookTechnicianCustomerGrid.js";
import CustomerBookTechnicianQuotation from "./CustomerBookTechnicianQuotation.js";
import BooKTechnicianAdminGridView from "./BooKTechnicianAdminGridView.js";
import CustomerBookTechnicianQuotationView from "./CustomerBookTechnicianQuotationView.js";
import BuyProductPaymentPage from "./BuyProductPaymentPage.js";
import AdminBuyProductOrders from "./AdminBuyProductOrders.js";
import AdminBuyProductOrderGridView from "./AdminBuyProductOrderGridView.js";
import BuyProductNotificationGrid from "./BuyProductNotificationGrid.js";
import CustomerOrdersNotifications from "./CustomerOrdersNotifications.js";
import ViewCustomerBuyProductOrders from "./ViewCustomerBuyProductsOrders.js";
import CustomerBuyProductOrdersGrid from "./CustomerBuyproductsOrdersGrid.js";
import ViewCustomerBuyProductOrdersGrid from "./ViewCustomerBuyProductOrdersGrid.js";
import AdminClosedBuyProductOrders from "./AdminClosedBuyProductsOrders.js";
import BuyProductClosedOrdersGrid from "./BuyProductClosedOrdersGrid.js";
import AdminClosedOrdersFinalGridView from "./AdminClosedOrdersFinalGridView.js";
import ProfilePage from "./ProfilePage.js";
import PaymentPage from "./PaymentPage";
import NotificationsBell from "./NotificationsBell.js";
import OrdersNotificationBell from "./OrdersBellNotifications.js";
import TrackStatusNotificationBell from "./TrackStatusBellNotifications.js";
import Device from "./Device.js";
import IconsOffersProducts from "./IconsOffersProducts.js";
import Offers from "./Offers.js";
import OffersBuyProductPage from "./OffersBuyProductPage.js";
import ViewOffersBuyProductPage from "./ViewOffersBuyProductPage.js";
import TechnicianViewBookTechnician from "./TechnicianViewBookTechnician.js";
import BookTechnicianDetailsNotifications from "./BookTechnicianDetailsNotifications.js";
import BookTechnicianDetailsGrid from "./BookTechnicianDetailsGrid.js";
import RaiseTicketConfirmation from "./RaiseTicketConfirmation.js";
import HandyManLogo from "./HandyManLogo.js";
import LoginPage from "./LoginPage.js";
import VendorLoginPage from "./VendorLoginPage.js";
import VendorRegisterPage from "./VendorRegisterPage.js";
import VendorStockUpdatePage from "./VendorStockUpdatePage.js";
import VendorPreviewPage from "./VendorPreviewPage.js";
import VendorOrdersPage from "./VendorOrdersPage.js";
import SuperAdminVendorsPage from "./SuperAdminVendorsPage.js";
import SuperAdminVendorProductsPage from "./SuperAdminVendorProductsPage.js";
import SuperAdminGuard from "./SuperAdminGuard.js";
import UserIdLogin from "./UserIdLogin.js";
import CustomerRaiseTicketGridView from "./CustomerRaiseTicketGridView.js";
import OTPVerificationPage from "./OTPVerificationPage.js";
import ApartmentRaiseTicket from "./ApartmentRaiseTicket.js";
import ApartmentRaiseActionView from "./ApartmentRaiseActionView.js";
import ApartmentNotificationGrid from "./ApartmentNotificationGrid.js";
import AboutApartmentRaiseTicket from "./AboutApartmentRaiseTicket.js";
import ChatPage from "./ChatPage.js";
// import BuyProductOnlinePaymentPage from './BuyProductOnlinePaymentPage.js';
// import BuyProductPaymentSuccess from './BuyProductPaymentSuccess.js';
// import BookTechnicianOnlinePayment from './BookTechnicianOnlinePayment.js'
// import BookTechnicianPaymentSuccess from './BookTechnicianPaymentSuccess.js';
import GroceryOfferItems from "./GroceryOfferItems.js";
import GroceryOffersCartPage from "./GroceryOffersCartPage.js";
import GroceryItems from "./GroceryItems.js";
import AdminUploadGrocery from "./AdminUploadGrocery.js";
import AdminUpdateGrocery from "./AdminUpdateGrocery.js";
import AdminGroceryList from "./AdminGroceryList.js";
import AdminGroceryApproval from "./AdminGroceryApproval.js";
import GroceryCartPage from "./GroceryCartPage.js";
import LakshmiCollections from "./LakshmiCollections.js";
import AdminLakshmiCollectionsUpload from "./AdminLakshmiCollectionsUpload.js";
import AdminGroceryOrderPage from "./AdminGroceryOrderPage.js";
import AdminGroceryItemNotificationGrid from "./AdminGroceryItemNotificationGrid.js";
import GroceryPaymentmethod from "./GroceryPaymentMethod.js";
import GroceryOnlinePayment from "./GroceryOnlinePayment.js";
import GroceryPaymentSuccess from "./GroceryPaymentSuccess.js";
import AdminCollectionsList from "./AdminCollectionsList.js";
import AdminLakshmiCollectionsUpdate from "./AdminLakshmiCollectionsUpdate.js";
import AdminLakshmiCollectionsApproval from "./AdminLakshmiCollectionsApproval.js";
import LakshmiCollectionDesigns from "./LakshmiCollectionDesigns.js";
import LakshmiCollectionCartPage from "./LakshmiCollectionCartPage.js";
import LakshmiCollectionPaymentmethod from "./LakshmiCollectionPaymentMethod.js";
// import LakshmiCollectionOnlinePayment from './LakshmiCollectionOnlinePayment.js';
// import LakshmiCollectionPaymentSuccess from './LakshmiCollectionPaymentSuccess.js';
import AdminLakshmiCollectionsPage from "./AdminLakshmiCollectionsPage.js";
import DeliveryTracking from "./DeliveryTracking.js";
import DeliveryPartner from "./DeliveryPartner.js";
import AdminCollectionNotificationGrid from "./AdminCollectionNotificationGrid.js";
// import DeliveryPartnerDirectory from './DeliveryPartnerDirectory.js';
import TermsAndConditions from "./TermsandConditions.js";
import PrivacyPolicy from "./PrivacyPolicy.js";
import { getLoginData } from "./utils/auth";
import RoyalUpmaMix250g from "./RoyalUpmaMix250g.js";
import MartHomeAppliances from "./MartHomeAppliances.js";
import AdminOfferForm from "./AdminOfferForm.js";
import AdminBannerList from "./AdminBannerList.js";
import AdminCashbackOffersList from "./AdminCashbackOffersList.js";
import AdminGroceryZoneDashboard from "./AdminGroceryZoneDashboard.js";
import AdminGroceryClosedOrders from "./AdminGroceryClosedOrders.js";
import AdminGroceryDashboard from "./AdminGroceryDashboard.js";
import DeliveryPartnerPaymentMethod from "./DeliveryPartnerPaymentMethod.js";
import AdminRegistrationNumbers from "./AdminRegisterationNumbers.js";
import GroceryComboOffer from "./GroceryComboOffer.js";
import AdminPushNotifications from "./AdminPushNotifications.js";
import AdminLiveChat from "./AdminLiveChat.js";
import MilkSubscriptionPreview from "./MilkSubscriptionPreview.js";
import DeliveryPartnerDashboard from "./DeliveryPartnerDashboard.js";
import DeliveryOrderDetailsPage from "./DeliveryOrderDetailsPage.js";
import AddressPage from "./AddressPage.js";

import SuperAdminDeliveryPartnersPage from "./SuperAdminDeliveryPartnersPage.js";

import SuperAdminOrdersPage from "./SuperAdminOrdersPage.js";

import AdminOrderCloseDashboard from "./AdminOrderCloseDashboard.js";

import AdminOrderClose from "./AdminOrderClose.js";

// import OneRupeeGroceryItems from './OneRupeeGroceryItems.js';
// import CustomerLocation from "./CustomerLocation.js";
const PreventBackNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/") {
      const newUserId = getLoginData();
      if (newUserId) {
        navigate(`/profilePage/customer/${newUserId}`, { replace: true });
      } else {
        navigate("/loginnew", { replace: true });
      }
    }
  }, [navigate, location]);

  useEffect(() => {
    const handlePopState = (event) => {
      event.preventDefault();
      window.location.reload();
    };

    window.history.pushState(null, null, window.location.href);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);
  return null;
};

function App() {
  return (
    <Router>
      <PreventBackNavigation />
      <DialogHost />
      <div className="App">
        <main>
          {/* className="mt-100" */}
          <Routes>
            <Route
              path="/addressPage/:userType/:userId"
              element={<AddressPage />}
            />
            <Route
              path="/groceryComboOffer/:userType/:userId/:id"
              element={<GroceryComboOffer />}
            />
            <Route
              path="/adminPushNotifications/Admin"
              element={<AdminPushNotifications />}
            />
            <Route path="/adminLiveChat/Admin" element={<AdminLiveChat />} />
            <Route
              path="/adminRegistrations/Admin"
              element={<AdminRegistrationNumbers />}
            />
            <Route
              path="/deliverypartnerPaymentMethod"
              element={<DeliveryPartnerPaymentMethod />}
            />
            <Route
              path="/deliveryPartnerDashboard/:userType/:userId"
              element={<DeliveryPartnerDashboard />}
            />
            <Route
              path="/deliveryOrderDetails/:userType/:userId/:orderId"
              element={<DeliveryOrderDetailsPage />}
            />
            <Route
              path="/adminGroceryZoneDashboard"
              element={<AdminGroceryZoneDashboard />}
            />
            <Route
              path="/adminGroceryClosedOrders/:groceryItemId"
              element={<AdminGroceryClosedOrders />}
            />
            <Route
              path="/adminGroceryDashboard"
              element={<AdminGroceryDashboard />}
            />
            <Route
              path="/martHomeAppliances/:userType/:userId"
              element={<MartHomeAppliances />}
            />
            <Route path="/RoyalUpmaMix" element={<RoyalUpmaMix250g />} />
            <Route
              path="/termsandConditions"
              element={<TermsAndConditions />}
            />
            <Route path="/privacyPolicy" element={<PrivacyPolicy />} />
            <Route path="/device" element={<Device />} />
            <Route path="/chatPage/:userType/:userId" element={<ChatPage />} />
            <Route
              path="/groceryOffers/:userType/:userId"
              element={<GroceryOfferItems />}
            />
            <Route
              path="/groceryOffersCart/:userType/:userId"
              element={<GroceryOffersCartPage />}
            />
            <Route
              path="/deliveryPartner/:userType/:userId"
              element={<DeliveryPartner />}
            />
            <Route
              path="/deliveryTracking/:id"
              element={<DeliveryTracking />}
            />
            {/* <Route path="/deliveryPartnerDirectory" element={<DeliveryPartnerDirectory />} /> */}
            {/* <Route path="/groceryOneRupee/:userType/:userId" element={<OneRupeeGroceryItems />} /> */}

            <Route
              path="/grocery/:userType/:userId"
              element={<GroceryItems />}
            />
            <Route
              path="/groceryCart/:userType/:userId"
              element={<GroceryCartPage />}
            />
            <Route
              path="/milkSubscriptionPreview"
              element={<MilkSubscriptionPreview />}
            />
            {/* <Route path="/groceryIcons/:userType/:userId" element={<GroceryCategoryIcons />} /> */}
            <Route path="/adminOfferModal/Admin" element={<AdminOfferForm />} />
            <Route
              path="/adminCashbackOfferCreate/Admin"
              element={<AdminOfferForm />}
            />
            <Route
              path="/adminBannerList/Admin"
              element={<AdminBannerList />}
            />
            <Route
              path="/adminCashbackOffers/Admin"
              element={<AdminCashbackOffersList />}
            />
            <Route
              path="/adminUploadGrocery/Admin"
              element={<AdminUploadGrocery />}
            />
            <Route
              path="/adminUpdateGrocery/:id/Admin"
              element={<AdminUpdateGrocery />}
            />
            <Route
              path="/adminGroceryApproval/:id/Admin"
              element={<AdminGroceryApproval />}
            />
            <Route
              path="/adminGroceryList/Admin"
              element={<AdminGroceryList />}
            />
            <Route
              path="/groceryItemsNotificationGrid"
              element={<AdminGroceryItemNotificationGrid />}
            />
            <Route
              path="/adminGroceryOrderPage/:groceryItemId"
              element={<AdminGroceryOrderPage />}
            />
            <Route
              path="/groceryPaymentMethod/:userType/:userId/:groceryItemId"
              element={<GroceryPaymentmethod />}
            />
            {/* <Route path="/buyProductOnlinePaymentPage/:id" element={<BuyProductOnlinePaymentPage />} />
            <Route path="/BuyProductPaymentSuccess" element={<BuyProductPaymentSuccess />} />
            <Route path="/bookTechnicianOnlinePayment/:id" element={<BookTechnicianOnlinePayment />} />
            <Route path="/BookTechnicianPaymentSuccess" element={<BookTechnicianPaymentSuccess />} /> */}
            <Route
              path="/groceryOnlinePayment/:groceryItemId"
              element={<GroceryOnlinePayment />}
            />
            <Route
              path="/groceryPaymentSuccess"
              element={<GroceryPaymentSuccess />}
            />
            <Route
              path="/adminCollectionsList/Admin"
              element={<AdminCollectionsList />}
            />
            <Route
              path="/adminCollectionsUpload/Admin"
              element={<AdminLakshmiCollectionsUpload />}
            />
            <Route
              path="/adminCollectionsUpdate/:id/Admin"
              element={<AdminLakshmiCollectionsUpdate />}
            />
            <Route
              path="/adminCollectionsApproval/:id/Admin"
              element={<AdminLakshmiCollectionsApproval />}
            />
            <Route
              path="/lakshmiCollections/:userType/:userId"
              element={<LakshmiCollections />}
            />
            <Route
              path="/lakshmiCollectionDesigns/:userType/:userId/:id"
              element={<LakshmiCollectionDesigns />}
            />
            <Route
              path="/lakshmiCollectionCart/:userType/:userId"
              element={<LakshmiCollectionCartPage />}
            />
            <Route
              path="/lakshmiCollectionPaymentMethod/:userType/:userId/:collectionId"
              element={<LakshmiCollectionPaymentmethod />}
            />
            {/* <Route path="/lakshmiCollectionsOnlinePayment/:collectionId" element={<LakshmiCollectionOnlinePayment />} /> */}
            {/* <Route path="/lakshmiCollectionPaymentSuccess" element={<LakshmiCollectionPaymentSuccess />} /> */}
            <Route
              path="/adminLakshmiCollectionsOrders/:collectionId"
              element={<AdminLakshmiCollectionsPage />}
            />
            <Route
              path="/lakshmiCollectionsNotificationGrid"
              element={<AdminCollectionNotificationGrid />}
            />
            {/* <Route path="/customerRegistration" element={<CustomerRegistration />} /> */}
            {/* <Route path="/technicianRegistration" element={<TechnicianRegistration />} /> */}
            <Route
              path="/profilePage/:userType/:userId"
              element={<ProfilePage />}
            />
            <Route path="/vendor/login" element={<VendorLoginPage />} />
            <Route path="/vendor/register" element={<VendorRegisterPage />} />
            <Route
              path="/vendor/stock-update/:vendorId"
              element={<VendorStockUpdatePage />}
            />
            <Route
              path="/vendor/preview/:vendorId"
              element={<VendorPreviewPage />}
            />
            <Route
              path="/vendor/orders/:vendorId"
              element={<VendorOrdersPage />}
            />
            <Route
              path="/superadmin/vendors"
              element={
                <SuperAdminGuard>
                  <SuperAdminVendorsPage />
                </SuperAdminGuard>
              }
            />
            <Route
              path="/superadmin/vendor/:vendorId/products"
              element={
                <SuperAdminGuard>
                  <SuperAdminVendorProductsPage />
                </SuperAdminGuard>
              }
            />
            <Route path="/" element={<HandyManLogo />} />
            <Route path="/loginnew" element={<LoginPage />} />
            <Route path="/otpVerification" element={<OTPVerificationPage />} />
            <Route path="/userIdLogin" element={<UserIdLogin />} />
            <Route
              path="/raiseTicket/:userType/:userId"
              element={<RaiseTicket />}
            />
            <Route
              path="/raiseTicketConfirmation/:userType/:userId"
              element={<RaiseTicketConfirmation />}
            />
            <Route
              path="/buyProducts/:userType/:userId"
              element={<BuyProducts />}
            />
            <Route path="/sidebar/:userType" element={<Sidebar />} />
            <Route
              path="/buyproduct-view/:userType/:userId/:id"
              element={<BuyProductView />}
            />
            <Route
              path="/adminUploadForm/Admin"
              element={<AdminUploadForm />}
            />
            <Route
              path="/adminProductApproval/:id/Admin"
              element={<AdminProductApproval />}
            />
            <Route
              path="/adminProductList/Admin"
              element={<AdminProductList />}
            />
            <Route
              path="/adminUpdateProduct/:id/Admin"
              element={<AdminUpdateProduct />}
            />
            <Route path="/adminSidebar" element={<AdminSidebar />} />
            <Route
              path="/adminNotifications"
              element={<AdminNotifications />}
            />
            <Route
              path="/raiseTicketActionView/:raiseTicketId"
              element={<RaiseTicketActionView />}
            />
            <Route path="/adminRaiseQuote" element={<AdminRaiseaQuote />} />
            <Route
              path="/raiseTicketNotification"
              element={<RaiseTicketNotifications />}
            />
            <Route
              path="/technicianQuoteNotification/:userType/:userId/:category/:district"
              element={<TechnicianQuoteNotifications />}
            />
            <Route
              path="/viewRaiseQuote/:userType/:userId/:category/:raiseTicketId"
              element={<ViewRaiseQuoteTech />}
            />
            <Route
              path="/viewDetailsRaiseQuote/:userType/:userId/:category/:raiseTicketId"
              element={<ViewDetailsRaiseQuote />}
            />
            <Route
              path="/raiseTicketQuotation/:raiseTicketId"
              element={<RaiseTicketQuotation />}
            />
            <Route
              path="/raiseTicketBuyProducts/:raiseTicketId"
              element={<RaiseTicketBuyProducts />}
            />
            <Route path="/quoteNotification" element={<QuoteNotifications />} />
            <Route
              path="/notificationTechnician/:userType/:userId/:category/:district"
              element={<NotificationTechnician />}
            />
            <Route
              path="/customerNotification/:userType/:userId"
              element={<CustomerNotification />}
            />
            <Route
              path="/viewCustomer/:userType/:userId"
              element={<ViewCustomerGrid />}
            />
            <Route
              path="/customerRaiseTicketQuotation/:userType/:userId/:raiseTicketId"
              element={<CustomerRaiseTicketQuotation />}
            />
            <Route
              path="/customerRaiseTicketGridView/:userType/:userId/:raiseTicketId"
              element={<CustomerRaiseTicketGridView />}
            />
            <Route
              path="/dealerNotifications/:userType/:userId/:category/:district"
              element={<DealerNotifications />}
            />
            <Route
              path="/dealerNotificationsGrid/:userType/:userId/:category/:district"
              element={<DealerNotificationsGrid />}
            />
            <Route
              path="/viewDealerRaiseTicket/:userType/:userId/:category/:raiseTicketId"
              element={<ViewDealerRaiseTicket />}
            />
            <Route
              path="/viewDealerDetailsRaiseTicket/:userType/:userId/:category/:raiseTicketId"
              element={<ViewDealerDetailsRaiseTicket />}
            />
            <Route path="/dealerGrid" element={<DealerGrid />} />
            <Route
              path="/bidderTicketQuotation/:raiseTicketId"
              element={<BidderTicketQuotation />}
            />
            <Route
              path="/timeSlotBooking/:userType/:userId/:raiseTicketId"
              element={<TimeSlotBooking />}
            />
            <Route
              path="/bookingConfirmation/:userType/:userId/:raiseTicketId"
              element={<BookingConfirmation />}
            />
            <Route
              path="/paymentConfirmation/:userType/:userId/:raiseTicketId"
              element={<PaymentConfirmation />}
            />
            <Route
              path="/ticketConfirmation/:userType/:userId/:category/:district/:raiseTicketId"
              element={<TicketConfirmation />}
            />
            <Route
              path="/traderConfirmation/:userType/:userId/:category/:district/:raiseTicketId"
              element={<TraderConfirmation />}
            />
            <Route
              path="/raiseOrders/:userType"
              element={<RaiseOrdersGrid />}
            />
            <Route
              path="/customerCareConfirmation/:raiseTicketId"
              element={<CustomerCareConfirmation />}
            />
            <Route
              path="/customerTrackConfirmation/:userType/:userId/:raiseTicketId"
              element={<CustomerRaiseTicketTrack />}
            />
            <Route
              path="/trackStatusNotifications/:userType/:userId"
              element={<TrackStatusNotifications />}
            />
            <Route
              path="/ticketConfirmationGrid/:userType/:userId/:category/:district"
              element={<TicketConfirmationGrid />}
            />
            <Route
              path="/traderConfirmationGrid/:userType/:userId/:category/:district"
              element={<TraderConfirmationGrid />}
            />
            <Route path="/customerCareGrid" element={<CustomerCareGrid />} />
            {/* <Route path="/trackStatusGrid/:userType/:userId" element={<TrackStatusGrid />} /> */}
            <Route
              path="/bookTechnician/:userType/:userId"
              element={<BookTechnician />}
            />
            <Route
              path="/bookTechnicianActionView/:raiseTicketId"
              element={<BookTechnicianActionView />}
            />
            <Route
              path="/uploadBookTechnician"
              element={<UploadBookTechnician />}
            />
            <Route
              path="/bookTechnicianList"
              element={<BookTechnicianList />}
            />
            <Route
              path="/bookTechnicianPaymentPage/:userType/:userId/:raiseTicketId"
              element={<BookTechnicianPaymentPage />}
            />
            <Route
              path="/updateBookTechnician/:id"
              element={<UpdateBookTechnician />}
            />
            <Route
              path="/bookTechnicianNotificationGrid"
              element={<BookTechnicianNotificationGrid />}
            />
            <Route
              path="/bookTechnicianCustomerGrid/:userType/:userId"
              element={<BookTechnicianCustomerGrid />}
            />
            <Route
              path="/customerBookTechnicianQuotation/:userType/:userId/:raiseTicketId"
              element={<CustomerBookTechnicianQuotation />}
            />
            <Route
              path="/bookTechnicianAdminView/:raiseTicketId"
              element={<BooKTechnicianAdminGridView />}
            />
            <Route
              path="/customerBookTechnicianQuotationView/:userType/:userId/:raiseTicketId"
              element={<CustomerBookTechnicianQuotationView />}
            />
            <Route
              path="/buyProductPaymentPage/:userType/:userId/:buyProductId"
              element={<BuyProductPaymentPage />}
            />
            <Route
              path="/adminBuyProductOrders/:buyProductId"
              element={<AdminBuyProductOrders />}
            />
            <Route
              path="/adminBuyProductOrderGridView/:buyProductId"
              element={<AdminBuyProductOrderGridView />}
            />
            <Route
              path="/buyProductNotificationGrid"
              element={<BuyProductNotificationGrid />}
            />
            <Route
              path="/customerOrders/:userType/:userId"
              element={<CustomerOrdersNotifications />}
            />
            <Route
              path="/viewCustomerBuyProductOrders/:userType/:userId/:buyProductId"
              element={<ViewCustomerBuyProductOrders />}
            />
            <Route
              path="/viewCustomerBuyProductOrdersGrid/:userType/:userId/:buyProductId"
              element={<ViewCustomerBuyProductOrdersGrid />}
            />
            <Route
              path="/adminClosedBuyProductOrders/:buyProductId"
              element={<AdminClosedBuyProductOrders />}
            />
            <Route
              path="/buyProductClosedOrdersGrid"
              element={<BuyProductClosedOrdersGrid />}
            />
            <Route
              path="/adminClosedOrdersFinalGridView/:buyProductId"
              element={<AdminClosedOrdersFinalGridView />}
            />
            <Route
              path="/technicianViewBookTechnician/:userType/:userId/:technicianName/:raiseTicketId"
              element={<TechnicianViewBookTechnician />}
            />
            <Route
              path="/customerBuyProductOrdersGrid/:userType/:userId"
              element={<CustomerBuyProductOrdersGrid />}
            />
            <Route
              path="/payment-selection/:raiseTicketId"
              element={<PaymentPage />}
            />
            <Route
              path="/notificationsbell/:userId"
              element={<NotificationsBell />}
            />
            <Route
              path="/ordersNotificationsbell/:userId"
              element={<OrdersNotificationBell />}
            />
            <Route
              path="/trackStatusNotificationsbell/:userId"
              element={<TrackStatusNotificationBell />}
            />
            <Route
              path="/offersIcons/:userType/:userId"
              element={<IconsOffersProducts />}
            />
            <Route path="/offers/:userType/:userId" element={<Offers />} />
            <Route
              path="/offersBuyProduct/:userType/:userId/:id"
              element={<OffersBuyProductPage />}
            />
            <Route
              path="/viewOffersBuyProduct/:userType/:userId/:id"
              element={<ViewOffersBuyProductPage />}
            />
            <Route
              path="/technicianDetailsNotifications/:userType/:userId/:category/:pincode/:technicianName"
              element={<BookTechnicianDetailsNotifications />}
            />
            <Route
              path="/technicianGridDetails/:userType/:userId/:category/:pincode/:technicianName"
              element={<BookTechnicianDetailsGrid />}
            />
            <Route
              path="/apartmentRaiseTicket/:userType/:userId"
              element={<ApartmentRaiseTicket />}
            />
            <Route
              path="/apartmentRaiseTicketActionView/:apartmentRaiseTicketId"
              element={<ApartmentRaiseActionView />}
            />
            <Route
              path="/apartmentNotificationGrid"
              element={<ApartmentNotificationGrid />}
            />

            <Route
              path="/superadmin/orders"
              element={
                <SuperAdminGuard>
                  <SuperAdminOrdersPage />
                </SuperAdminGuard>
              }
            />

            <Route
              path="/superadmin/delivery-partners"
              element={
                <SuperAdminGuard>
                  {" "}
                  <SuperAdminDeliveryPartnersPage />
                </SuperAdminGuard>
              }
            />

            <Route
              path="/adminOrderCloseDashboard"
              element={<AdminOrderCloseDashboard />}
            />

            <Route
              path="/aboutApartmentRaiseTicket/:userType/:userId"
              element={<AboutApartmentRaiseTicket />}
            />

            <Route
              path="/adminOrderClose/:groceryItemId"
              element={<AdminOrderClose />}
            />

            {/* <Route path="/customerLocation/:fullName/:martId/:userType/:userId/:groceryItemId" element={<CustomerLocation />} /> */}
          </Routes>
        </main>
        {/* <Footer /> */}
      </div>
    </Router>
  );
}

export default App;
