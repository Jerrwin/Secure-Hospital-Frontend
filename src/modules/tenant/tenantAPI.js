import axiosClient from "../../services/axiosClient";

const tenantAPI = {
  /**
   * Fetches tenant configuration from the Master DB.
   * Note: The host/subdomain is automatically sent by the axiosClient interceptor.
   */
  getConfig: () => axiosClient.get("/api/tenant/config"),
};

export default tenantAPI;
