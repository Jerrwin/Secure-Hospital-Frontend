import axiosClient from "../../services/axiosClient";

const BASE = "/api/prescriptions";

export const prescriptionAPI = {
  // Fetch all prescriptions (backend filters by role automatically)
  fetchAll: (params) => axiosClient.get(BASE, { params }),

  // Fetch completed appointments for doctor create modal dropdown
  fetchCompletedAppointments: () =>
    axiosClient.get("/api/appointments?status=completed"),

  // Doctor creates new prescription
  create: (data) => axiosClient.post(BASE, data),

  // Doctor edits prescription (only if status = created)
  update: (id, data) => axiosClient.patch(`${BASE}/${id}`, data),

  // Pharmacist verifies prescription
  verify: (id) =>
    axiosClient.put(`${BASE}/${id}/status`, { status: "verified" }),

  // Pharmacist dispenses prescription
  dispense: (id) =>
    axiosClient.put(`${BASE}/${id}/status`, { status: "dispensed" }),

  // Delete prescription (only if status = created)
  delete: (id) => axiosClient.delete(`${BASE}/${id}`),
};
