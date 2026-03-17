import axiosClient from "../../services/axiosClient";

const dashboardAPI = {
  getStats: () => axiosClient.get("/api/dashboard/stats"),
  getUpcomingAppointments: (params) =>
    axiosClient.get("/api/appointments/upcoming", { params }),
  getPatients: (params) => axiosClient.get("/api/patients", { params }),
  getPrescriptions: (params) => axiosClient.get("/api/prescriptions", { params }),
  getStaff: (params) => axiosClient.get("/api/staff", { params }),
};

export default dashboardAPI;
