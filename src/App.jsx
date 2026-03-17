import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/Auth/LoginPage";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import AppointmentList from "./pages/Appointments/AppointmentList";
import PatientList from "./pages/Patients/PatientList";
import PrescriptionList from "./pages/Prescriptions/PrescriptionList";
import useAuth from "./modules/auth/hooks/useAuth";

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  // Detect subdomain
  const hostname = window.location.hostname;
  const subdomain = hostname.split(".")[0];
  const isSubdomain =
    subdomain !== "localhost" && subdomain !== "www" && hostname.includes(".");

  return (
    <BrowserRouter>
      <Routes>
        {/* If subdomain like abc.localhost, show Login. If just localhost, show Landing. */}
        <Route
          path="/"
          element={isSubdomain ? <LoginPage /> : <LandingPage />}
        />
        <Route
          path="/login"
          element={isSubdomain ? <LoginPage /> : <Navigate to="/" replace />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/appointments"
          element={
            <ProtectedRoute>
              <AppointmentList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patients"
          element={
            <ProtectedRoute>
              <PatientList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/prescriptions"
          element={
            <ProtectedRoute>
              <PrescriptionList />
            </ProtectedRoute>
          }
        />

        {/* Fallback to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
