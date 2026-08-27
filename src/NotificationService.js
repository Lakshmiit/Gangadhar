// import { PushNotifications } from "@capacitor/push-notifications";
// import { Capacitor } from "@capacitor/core";

// export const initPushNotifications = async () => {
//   if (!Capacitor.isNativePlatform()) return;

//   // Request permission
//   const permission = await PushNotifications.requestPermissions();
//   if (permission.receive !== "granted") {
//     console.log("Push permission not granted");
//     return;
//   }

//   // Register with FCM
//   await PushNotifications.register();

//   // On successful registration
//   PushNotifications.addListener("registration", (token) => {
//     console.log("FCM Token:", token.value);
//   });

//   // On registration error
//   PushNotifications.addListener("registrationError", (err) => {
//     console.error("Registration error:", err);
//   });

//   // Foreground notification
//   PushNotifications.addListener("pushNotificationReceived", (notification) => {
//     console.log("Notification received:", notification);
//     alert(notification.title + "\n" + notification.body);
//   });

//   // Notification click action
//   PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
//     console.log("Notification action:", action);
//   });
// }; 
