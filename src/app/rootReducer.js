import authReducer from "../modules/auth/authSlice";
import dashboardReducer from "../modules/dashboard/dashboardSlice";
import uiReducer from "../modules/ui/uiSlice";

const rootReducer = {
  auth: authReducer,
  dashboard: dashboardReducer,
  ui: uiReducer,
};

export default rootReducer;