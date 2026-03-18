import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/Auth/LoginPage";
import LandingPage from "../pages/LandingPage";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import AppointmentList from "../pages/Appointments/AppointmentList";
import PatientList from "../pages/Patients/PatientList";
import PrescriptionList from "../pages/Prescriptions/PrescriptionList";
import StaffManagement from "../pages/Staff/StaffManagement";
import ProtectedRoute from "./ProtectedRoute";
import RoleBasedRoute from "./RoleBasedRoute";

const AppRouter = ({ isSubdomain }) => {
  return (
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
          <RoleBasedRoute allowedRoles={["PROVIDER", "NURSE"]}>
            <PatientList />
          </RoleBasedRoute>
        }
      />

      <Route
        path="/prescriptions"
        element={
          <RoleBasedRoute allowedRoles={["PHARMACIST", "PROVIDER"]}>
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

      {/* Fallback to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
