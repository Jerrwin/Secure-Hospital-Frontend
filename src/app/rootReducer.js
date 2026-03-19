import authReducer from "../modules/auth/authSlice";
import dashboardReducer from "../modules/dashboard/dashboardSlice";
import uiReducer from "../modules/ui/uiSlice";
import appointmentReducer from "../modules/appointments/appointmentSlice";
import userReducer from "../modules/users/userSlice";

const rootReducer = {
  auth: authReducer,
  dashboard: dashboardReducer,
  ui: uiReducer,
  appointments: appointmentReducer,
  users: userReducer,
};

export default rootReducer;