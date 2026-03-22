import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Spin } from "antd";
import { useSelector } from "react-redux";
import HospitalNotFound from "../pages/Auth/HospitalNotFound";

// ─── Normal Imports (Instant Loading) ───────────────────────────────────
import LoginPage from "../pages/Auth/LoginPage";
import LandingPage from "../pages/LandingPage";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import DashboardLayout from "../components/layout/DashboardLayout/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";
import RoleBasedRoute from "./RoleBasedRoute";

// ─── Lazy Imports (On-Demand Loading) ───────────────────────────────────
const AppointmentList = lazy(() => import("../pages/Appointments/AppointmentList"));
const PatientList = lazy(() => import("../pages/Patients/PatientList"));
const PrescriptionPage = lazy(() => import("../pages/Prescriptions/PrescriptionPage"));
const StaffManagement = lazy(() => import("../pages/Staff/StaffManagement"));

/**
 * Global Loading Fallback for Lazy Components
 */
const LoadingFallback = () => (
  <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#eff6ff" }}>
    <Spin size="large" description="Loading Module..." />
  </div>
);

const AppRouter = ({ isSubdomain }) => {
  const { config, loading, error, fetched } = useSelector((state) => state.tenant);

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

          <Route path="/appointments" element={<AppointmentList />} />

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
              <RoleBasedRoute allowedRoles={["PHARMACIST", "DOCTOR", "PROVIDER"]}>
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
        </Route>

        {/* Fallback to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
