import authReducer from "../modules/auth/authSlice";
import dashboardReducer from "../modules/dashboard/dashboardSlice";

const rootReducer = {
  auth: authReducer,
  dashboard: dashboardReducer,
};

export default rootReducer;