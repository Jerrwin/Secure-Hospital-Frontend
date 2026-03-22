import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/Auth/LoginPage";
import LandingPage from "../pages/LandingPage";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import AppointmentCalendar from "../pages/Appointments/AppointmentCalendar";
import PatientList from "../pages/Patients/PatientList";
import PrescriptionList from "../pages/Prescriptions/PrescriptionList";
import StaffManagement from "../pages/Staff/StaffManagement";
import InvoicePage from "../pages/Billing/InvoicePage";
import DashboardLayout from "../components/layout/DashboardLayout/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";
import RoleBasedRoute from "./RoleBasedRoute";

const AppRouter = ({ isSubdomain }) => {
  return (
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
        
        <Route path="/appointments" element={<AppointmentCalendar />} />

        <Route path="/appointments" element={<AppointmentList />} />

        {/* Note: RoleBasedRoute still wraps the element inside the layout */}
        <Route
          path="/patients"
          element={
            <RoleBasedRoute allowedRoles={["ADMIN", "DOCTOR", "PROVIDER"]}>
              <PatientList />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/prescriptions"
          element={
            <RoleBasedRoute allowedRoles={["PHARMACIST", "DOCTOR", "PROVIDER"]}>
              <PrescriptionList />
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
            <RoleBasedRoute allowedRoles={["ADMIN", "RECEPTIONIST", "PROVIDER"]}>
              <InvoicePage />
            </RoleBasedRoute>
          }
        />
      </Route>

      {/* Fallback to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
