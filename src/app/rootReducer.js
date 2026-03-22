import authReducer from "../modules/auth/authSlice";
import dashboardReducer from "../modules/dashboard/dashboardSlice";
import uiReducer from "../modules/ui/uiSlice";
import appointmentReducer from "../modules/appointments/appointmentSlice";
import userReducer from "../modules/users/userSlice";
import calendarReducer from "../modules/calendar/calendarSlice";
import chatReducer from "../modules/chat/chatSlice";
import tenantReducer from "../modules/tenant/tenantSlice";
import prescriptionReducer from "../modules/prescription/prescriptionSlice";
import billingReducer from "../modules/billing/billingSlice";
import notificationReducer from "../modules/notifications/notificationSlice";
import patientReducer from "../modules/patients/patientSlice";

import { combineReducers } from "@reduxjs/toolkit";

const appReducer = combineReducers({
  auth: authReducer,
  dashboard: dashboardReducer,
  ui: uiReducer,
  appointments: appointmentReducer,
  users: userReducer,
  calendar: calendarReducer,
  chat: chatReducer,
  tenant: tenantReducer,
  prescription: prescriptionReducer,
  billing: billingReducer,
  notifications: notificationReducer,
  patients: patientReducer,
});

const rootReducer = (state, action) => {
  if (action.type === 'auth/logout') {
    // Purge all persistent client-side storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Purge cookies
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // Reset Redux state to undefined to return all slices to initial state
    state = undefined;
  }
  
  return appReducer(state, action);
};

export default rootReducer;
