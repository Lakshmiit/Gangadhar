import React, { useEffect, useState } from "react";
import { messaging, getToken } from "./FirebaseMainConfig.js";

const DeviceApp = () => {
  const [deviceToken, setDeviceToken] = useState("");

  useEffect(() => {
    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
 
        if (permission === "granted") {
          const deviceToken = await getToken(messaging, { vapidKey: "BPX1QO7yGm3XMZLOrn_cGswUBoUxL8NHtSzL1mqMJsogLfdL5qprcgutEDXDuXHipVKgd1MFpGpAg22jsISxgR8" });
          setDeviceToken(deviceToken);
          // Send the token to your backend to store
        } else {
          console.log("Permission denied");
        }
      } catch (error) {
        console.error("Error getting permission:", error);
      }
    };

    requestPermission();
  }, []);

  return (
    <div>
      <h1>React Firebase Push Notification</h1>
      <p>Device Token:</p>
      <textarea value={deviceToken} readOnly rows="6" cols="50"></textarea>
    </div>
  );
};

export default DeviceApp;