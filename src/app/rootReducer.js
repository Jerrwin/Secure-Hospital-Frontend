import authReducer from "../modules/auth/authSlice";
import dashboardReducer from "../modules/dashboard/dashboardSlice";
import uiReducer from "../modules/ui/uiSlice";
import appointmentReducer from "../modules/appointments/appointmentSlice";
import userReducer from "../modules/users/userSlice";
import patientReducer from "../modules/patients/patientSlice";
import billingReducer from "../modules/billing/billingSlice";

const rootReducer = {
  auth: authReducer,
  dashboard: dashboardReducer,
  ui: uiReducer,
  appointments: appointmentReducer,
  users: userReducer,
  patients: patientReducer,
  billing: billingReducer,
};

export default rootReducer;