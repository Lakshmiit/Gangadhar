// firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/9.17.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.17.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDBOuHRSIbuy2mGofAwK0eG1MK9VxG6wzs",
  authDomain: "handyman-234.firebaseapp.com",
  projectId: "handyman-234",
  storageBucket: "handyman-234.firebasestorage.app",
  messagingSenderId: "705529707864",
  appId: "1:705529707864:web:1317a8a5bbec95a2ea792d",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log("[firebase-messaging-sw.js] Received background message", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/logo192.png"
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
