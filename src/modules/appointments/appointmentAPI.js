import axiosClient from "../../services/axiosClient";

// ─── Appointment API ──────────────────────────────────────────────────────────
// All routes match the backend exactly:
//   POST   /api/appointments
//   GET    /api/appointments
//   GET    /api/appointments/upcoming
//   GET    /api/appointments/show/{id}
//   PUT    /api/appointments/update/{id}
//   PUT    /api/appointments/cancel/{id}
//   PUT    /api/appointments/complete/{id}

const appointmentAPI = {
  // Fetch appointments with pagination, search, and status filters
  getAll: (params) => axiosClient.get("/api/appointments", { params }),

  // Fetch only upcoming scheduled appointments
  getUpcoming: () => axiosClient.get("/api/appointments/upcoming"),

  // Fetch a single appointment by ID
  getById: (id) => axiosClient.get(`/api/appointments/show/${id}`),

  // Create a new appointment
  create: (data) => axiosClient.post("/api/appointments", data),

  // Update appointment date/time/provider
  update: (id, data) => axiosClient.put(`/api/appointments/update/${id}`, data),

  // Cancel an appointment
  cancel: (id) => axiosClient.put(`/api/appointments/cancel/${id}`),

  // Mark appointment as completed (Provider/Admin only)
  complete: (id) => axiosClient.put(`/api/appointments/complete/${id}`),

  // Dropdown Data Helpers (Isolated from Patient/Staff modules)
  getPatients: () => axiosClient.get("/api/patients/lookup"),
  getStaff: () => axiosClient.get("/api/staff/lookup"),
};

export default appointmentAPI;
