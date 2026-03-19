import axios from "axios";

// Use current window location — preserves subdomain
// apollo.localhost:3000 → sends Host: apollo.localhost:3000
// backend reads $_SERVER['HTTP_HOST'] → identifies tenant
const axiosClient = axios.create({
  // Hit the backend directly on port 80/443 (omitting :3000)
  // The backend uses $_SERVER['HTTP_HOST'] to identify the tenant.
  // Using hostname ensures we send 'abc.localhost' instead of 'abc.localhost:3000'
  baseURL: `${window.location.protocol}//${window.location.hostname}${process.env.REACT_APP_API_SUFFIX || "/patient/Secure-Hospital-RestAPI/public/Secure-Hospital-RestAPI/public"}`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ─── Request Interceptor ─────────────────────────────────────────
// Attaches Bearer token + CSRF token to every outgoing request
axiosClient.interceptors.request.use(
  (config) => {
    // Attach JWT access token
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // Attach CSRF token for state-changing requests
    const csrfToken = localStorage.getItem("csrf_token");
    if (
      csrfToken &&
      ["post", "put", "delete", "patch"].includes(config.method?.toLowerCase())
    ) {
      config.headers["X-CSRF-TOKEN"] = csrfToken;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor ────────────────────────────────────────
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token expired — clear storage and redirect ONLY if it's not a login attempt
    const isLoginRequest = error.config?.url?.includes("/api/auth/login");

    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("csrf_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
