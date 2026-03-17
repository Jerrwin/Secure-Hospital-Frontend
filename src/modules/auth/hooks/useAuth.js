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

  return useMemo(
    () => ({
      user,
      accessToken,
      status,
      error,
      isAuthenticated,
      isLoading,
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
      login,
      logoutUser,
      clearAuthError,
    ],
  );
};

export default useAuth;
