import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { DevicesPage } from "src/pages/devices/DevicesPage";
// import { SensorWindowsPage } from "src/pages/sensor-windows/SensorWindowsPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { ProtectedRoute } from "./components/shared/ProtectedRoute";
import { AppShell } from "./components/layout/AppShell";
import { DevicesPage } from "./pages/devices/DevicesPage";
import { ProfilePage } from "./pages/profile/ProfilePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<Navigate to="/devices" replace />} />
            <Route path="/devices" element={<DevicesPage />} />
            {/* <Route path="/sensor-windows" element={<SensorWindowsPage />} /> */}
            <Route path="/" element={<Navigate to="/devices" replace />} />

            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<div>Admin page coming soon</div>} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
