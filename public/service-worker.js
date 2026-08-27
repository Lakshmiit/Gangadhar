// This is where you handle push events for the notifications

self.addEventListener('push', function (event) {
  const options = {
    body: event.data.text(), // This is the body of the push message
    icon: '/icons/notification-icon.png', // Path to the icon you want to show
    badge: '/icons/badge-icon.png', // Path to the badge icon (small icon for the app)
    data: {
      url: event.data.json().url, // You can add additional data here, like a URL to open on click
    },
  };

  event.waitUntil(
    self.registration.showNotification('New Notification', options) // Show the notification
  );
});

// Optional: Handle notification click events
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const url = event.notification.data.url; // Get the URL from the notification data
  event.waitUntil(
    clients.openWindow(url) // Open the URL when the user clicks the notification
  );
});
