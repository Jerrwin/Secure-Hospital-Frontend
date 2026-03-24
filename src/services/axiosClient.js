import axios from "axios";
import { notification } from "antd";
import { addOfflineRequest } from "./dbService";
import { refreshQueueCount } from "./offlineManager";



// Helper to inject Redux store to avoid circular dependencies
let store;
export const injectStore = (_store) => {
  store = _store;
};

// Use current window location — preserves subdomain
// apollo.localhost:3000 → sends Host: apollo.localhost:3000
const axiosClient = axios.create({
  // Hit the backend directly on port 80/443 (omitting :3000)
  // The backend uses $_SERVER['HTTP_HOST'] to identify the tenant.
  // Using hostname ensures we send 'abc.localhost' instead of 'abc.localhost:3000'
  baseURL: `${window.location.protocol}//${window.location.hostname}${process.env.REACT_APP_API_SUFFIX || "/Secure-Hospital-RestAPI/public"}`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ─── Request Interceptor ─────────────────────────────────────────
axiosClient.interceptors.request.use(
  async (config) => {
    // 1. Check if we are offline and it's a mutation request
    const isMutation = ["post", "put", "delete", "patch"].includes(
      config.method?.toLowerCase(),
    );

    // Skip offline logic if we are explicitly syncing or if it's a GET request
    if (!navigator.onLine && isMutation && !config._isSyncing) {
      try {
        await addOfflineRequest(config);
        refreshQueueCount(); // Sync Redux state
        notification.info({

          message: "Request Queued",
          description: "System is offline. Your changes have been saved locally and will sync once back online.",
          placement: "topRight",
          duration: 3,
        });

        // Return a cancelled-like promise to stop the request from going to the network
        // We'll return a resolved promise with a special flag so the UI can handle it if needed.
        return Promise.reject({
          message: "Offline: Request Queued",
          isOfflineQueued: true,
          config,
        });
      } catch (error) {
        console.error("Failed to queue offline request:", error);
      }
    }

    // Read tokens SECURELY from Redux memory, never from localStorage.
    if (store) {
      const state = store.getState();

      const token = state.auth.accessToken;
      const isRefreshRequest = config.url?.includes("/api/auth/refresh");

      if (token && !isRefreshRequest) {
        // config.headers.set is the modern Axios 1.x way
        if (config.headers.set) {
          config.headers.set("Authorization", `Bearer ${token}`);
        } else {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
      }

      const csrfToken = state.auth.csrfToken;
      if (
        csrfToken &&
        ["post", "put", "delete", "patch"].includes(
          config.method?.toLowerCase(),
        )
      ) {
        if (config.headers.set) {
          config.headers.set("X-CSRF-TOKEN", csrfToken);
        } else {
          config.headers["X-CSRF-TOKEN"] = csrfToken;
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor ────────────────────────────────────────
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401) {
      const message = error.response?.data?.message || "";

      // 1. Is this the refresh endpoint itself failing?
      if (originalRequest.url?.includes("/api/auth/refresh")) {
        // The master refresh cookie is invalid/expired. Stop everything.
        // We dispatch logout so Redux/React Router can handle the redirect gracefully.
        // Do NOT use window.location.href here (causes infinite loops on checkAuth mount).
        if (store) store.dispatch({ type: "auth/logout" });
        return Promise.reject(error);
      }

      // 2. Is this an "Expired" token error?
      // Strict rule: Only refresh if the backend explicitly says "Expired" and we haven't retried yet.
      if (message.includes("Expired") && !originalRequest._retry) {
        originalRequest._retry = true;

        if (isRefreshing) {
          // If we are already refreshing, put this request in a queue to wait
          return new Promise(function (resolve, reject) {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              // The request interceptor will handle the new tokens automatically
              // as long as the store was updated in the 'initiator' block below.
              return axiosClient(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        isRefreshing = true;

        return new Promise(function (resolve, reject) {
          // Call the refresh endpoint (uses axiosClient so it gets CSRF)
          axiosClient
            .post("/api/auth/refresh")
            .then(({ data }) => {
              // Extract from ResponseHelper struct: { success: true, message: "...", data: { ... } }
              const newAccessToken = data.data?.access_token;
              const newCsrfToken = data.data?.csrf_token;

              // 1. Update Redux state with the new tokens
              if (store && newAccessToken) {
                const currentUser = store.getState().auth.user;
                store.dispatch({
                  type: "auth/loginSuccess",
                  payload: {
                    user: currentUser,
                    access_token: newAccessToken,
                    csrf_token: newCsrfToken,
                  },
                });
              }

              // 2. Process the queue (resolving the promises created in the 'isRefreshing' block)
              processQueue(null);

              // 3. Retry the original initiator request
              // Note: The Request Interceptor will automatically pick up the new tokens from Redux.
              resolve(axiosClient(originalRequest));
            })
            .catch((err) => {
              processQueue(err, null);
              if (store) store.dispatch({ type: "auth/logout" });
              reject(err);
            })
            .finally(() => {
              isRefreshing = false;
            });
        });
      }

      // 3. Other 401s (Invalid credentials, etc.)
      return Promise.reject(error);
    }

    // 403 Forbidden - Permission denied (Token is valid, but role is wrong)
    return Promise.reject(error);
  },
);

export default axiosClient;
