import axiosClient from "../../services/axiosClient";

const notificationAPI = {
  getNotifications: () => axiosClient.get("/api/notifications"),
  markAsRead: (id) => axiosClient.put(`/api/notifications/${id}/read`),
  markAllAsRead: () => axiosClient.put("/api/notifications/read-all"),
  delete: (id) => axiosClient.delete(`/api/notifications/${id}`),
};

export default notificationAPI;
