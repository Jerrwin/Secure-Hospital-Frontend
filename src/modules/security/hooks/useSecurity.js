import { useSelector } from "react-redux";

/**
 * Custom hook to provide quick access to security tokens and current user role.
 * Useful for any component needing to check session status or access tokens.
 */
export const useSecurity = () => {
  const { accessToken, csrfToken, user } = useSelector((state) => state.auth);

  return {
    accessToken,
    csrfToken,
    userRole: user?.role,
    isSecure: !!accessToken,
  };
};

export default useSecurity;
