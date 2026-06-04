self.addEventListener("push", (event) => {
  console.log("SW push event received", event.data?.text());

  const data = event.data?.json();
  if (!data) {
    console.warn("SW push: no data or invalid JSON");
    return;
  }

  console.log("SW push data:", data);

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/favicon.svg",
      data: data.data,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(clients.openWindow(url));
});
