import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import HospitalNotFound from "../pages/Auth/HospitalNotFound";
import LoadingScreen from "../components/common/LoadingScreen";

// ─── Normal Imports (Instant Loading) ───────────────────────────────────
import LoginPage from "../pages/Auth/LoginPage";
import LandingPage from "../pages/LandingPage";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import DashboardLayout from "../components/layout/DashboardLayout/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";
import RoleBasedRoute from "./RoleBasedRoute";

// ─── Lazy Imports (On-Demand Loading) ───────────────────────────────────
const AppointmentCalendar = lazy(
  () => import("../pages/Appointments/AppointmentCalendar"),
);
const PatientList = lazy(() => import("../pages/Patients/PatientList"));
const PrescriptionPage = lazy(
  () => import("../pages/Prescriptions/PrescriptionPage"),
);
const StaffManagement = lazy(() => import("../pages/Staff/StaffManagement"));
const InvoicePage = lazy(() => import("../pages/Billing/InvoicePage"));
const ProfilePage = lazy(() => import("../pages/Profile/ProfilePage"));
const SettingsPage = lazy(() => import("../pages/Settings/SecuritySettings"));

/**
 * Global Loading Fallback for Lazy Components
 */
const LoadingFallback = () => (
  <LoadingScreen fullPage label="Loading Module..." />
);

const AppRouter = ({ isSubdomain }) => {
  const { config, loading, error, fetched } = useSelector(
    (state) => state.tenant,
  );

  /**
   * 1. If currently loading tenant metadata from Master DB, show a spinner.
   */
  if (isSubdomain && loading) {
    return <LoadingFallback />;
  }

  /**
   * 2. If the Master DB says the hospital "does not exist" or returns an error,
   * block access and show the "Hospital Not Found" page.
   */
  if (isSubdomain && (error || (fetched && !config))) {
    return <HospitalNotFound />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* ─── Public Routes ────────────────────────────────────────── */}
        <Route
          path="/"
          element={isSubdomain ? <LoginPage /> : <LandingPage />}
        />
        <Route
          path="/login"
          element={isSubdomain ? <LoginPage /> : <Navigate to="/" replace />}
        />

        {/* ─── Protected Routes (Nested under DashboardLayout) ──────── */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route
            path="/appointments"
            element={
              <RoleBasedRoute
                allowedRoles={[
                  "RECEPTIONIST",
                  "PROVIDER",
                  "DOCTOR",
                  "NURSE",
                  "PATIENT",
                ]}
              >
                <AppointmentCalendar />
              </RoleBasedRoute>
            }
          />

          {/* Note: RoleBasedRoute still wraps the element inside the layout */}
          <Route
            path="/patients"
            element={
              <RoleBasedRoute allowedRoles={["DOCTOR", "PROVIDER", "NURSE"]}>
                <PatientList />
              </RoleBasedRoute>
            }
          />

          <Route
            path="/prescriptions"
            element={
              <RoleBasedRoute
                allowedRoles={["PHARMACIST", "DOCTOR", "PROVIDER", "PATIENT"]}
              >
                <PrescriptionPage />
              </RoleBasedRoute>
            }
          />

          <Route
            path="/staff"
            element={
              <RoleBasedRoute allowedRoles={["ADMIN"]}>
                <StaffManagement />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/billing"
            element={
              <RoleBasedRoute allowedRoles={["RECEPTIONIST", "PATIENT"]}>
                <InvoicePage />
              </RoleBasedRoute>
            }
          />

          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
