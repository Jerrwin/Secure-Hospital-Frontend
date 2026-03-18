import authReducer from "../modules/auth/authSlice";
import dashboardReducer from "../modules/dashboard/dashboardSlice";
import uiReducer from "../modules/ui/uiSlice";
import userReducer from "../modules/users/userSlice";

const rootReducer = {
  auth: authReducer,
  dashboard: dashboardReducer,
  ui: uiReducer,
  users: userReducer,
};

export default rootReducer;