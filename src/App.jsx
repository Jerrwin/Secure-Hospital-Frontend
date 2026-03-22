import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { useDispatch } from "react-redux";
import AppRouter from "./routes/AppRouter";
import { checkAuth } from "./modules/auth/authSaga";
import { fetchTenantInfoRequest } from "./modules/tenant/tenantSlice";
import ErrorBoundary from "./components/common/ErrorBoundary";

const App = () => {
  const dispatch = useDispatch();

  // Detect subdomain
  const hostname = window.location.hostname;
  const subdomain = hostname.split(".")[0];
  const isSubdomain =
    subdomain !== "localhost" && subdomain !== "www" && hostname.includes(".");

  // On app mount, call refresh API once to restore session from HttpOnly cookie.
  // We only do this if a valid 'user' profile exists in localStorage as a hint that a session was active.
  useEffect(() => {
    // 1. Resolve Tenant Metadata (Hospital Name, ID, etc.)
    if (isSubdomain) {
      dispatch(fetchTenantInfoRequest());
    }

    // 2. Check Authentication (Silent refresh)
    const user = localStorage.getItem("user");
    if (user && user !== "undefined") {
      checkAuth(dispatch);
    }
  }, [dispatch, isSubdomain]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppRouter isSubdomain={isSubdomain} />
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
