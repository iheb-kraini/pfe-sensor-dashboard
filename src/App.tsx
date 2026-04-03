import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { DevicesPage } from "src/pages/devices/DevicesPage";
// import { SensorWindowsPage } from "src/pages/sensor-windows/SensorWindowsPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { ProtectedRoute } from "./components/shared/ProtectedRoute";
import { AppShell } from "./components/layout/AppShell";
import { DevicesPage } from "./pages/devices/DevicesPage";
import { ProfilePage } from "./pages/profile/ProfilePage";
import { SensorWindowsPage } from "./pages/sensor-windows/SensorWindowsPage";
import { AdminPage } from "./pages/stat/adminPage";
import { NotificationsPage } from "./pages/notification/Notificationspage";
import { SensorWindowDetailPage } from "./pages/sensor-windows/Sensorwindowdetailpage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<Navigate to="/devices" replace />} />
            <Route path="/devices" element={<DevicesPage />} />
            <Route
              path="/devices/:deviceId/sensor-windows"
              element={<SensorWindowsPage />}
            />
            <Route
              path="/sensor-windows/:id"
              element={<SensorWindowDetailPage />}
            />
            <Route path="/" element={<Navigate to="/devices" replace />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />

            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
