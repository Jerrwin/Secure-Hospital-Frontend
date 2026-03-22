import axiosClient from "../../services/axiosClient";

const chatAPI = {
  getNotes: (appointmentId) =>
    axiosClient.get(`/api/communications`, {
      params: { appointment_id: appointmentId },
    }),

  addNote: (data) => axiosClient.post("/api/communications", data),
};

export default chatAPI;
