import { useSelector, useDispatch } from "react-redux";
import { useCallback, useMemo } from "react";
import { loginRequest, logout, clearError } from "../authSlice";

const useAuth = () => {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const status = useSelector((state) => state.auth.status);
  const error = useSelector((state) => state.auth.error);

  const isAuthenticated = !!accessToken;
  const isLoading = status === "loading";

  const login = useCallback(
    (credentials) => {
      dispatch(loginRequest(credentials));
    },
    [dispatch],
  );

  const logoutUser = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const userRole = useMemo(() => {
    if (!user) return "";
    // If user.role is already a string, use it.
    if (typeof user.role === 'string') return user.role.toUpperCase();
    
    // Otherwise, map from role_id.
    const roleMap = {
      1: "ADMIN",
      2: "PROVIDER", // Changed from DR/DOCTOR to PROVIDER
      3: "NURSE",
      4: "PHARMACIST",
      5: "RECEPTIONIST",
      6: "PATIENT"
    };
    return (roleMap[user.role_id] || "").toUpperCase();
  }, [user]);

  return useMemo(
    () => ({
      user,
      accessToken,
      status,
      error,
      isAuthenticated,
      isLoading,
      userRole,
      login,
      logout: logoutUser,
      clearAuthError,
    }),
    [
      user,
      accessToken,
      status,
      error,
      isAuthenticated,
      isLoading,
      userRole,
      login,
      logoutUser,
      clearAuthError,
    ],
  );
};

export default useAuth;
