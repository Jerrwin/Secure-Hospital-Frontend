import axiosClient from "../../services/axiosClient";

const billingAPI = {
  // Create an invoice for a completed appointment
  createInvoice: (data) => axiosClient.post("/api/invoices", data),

  // Get invoices (can filter by appointment_id or other params)
  getInvoices: (params) => axiosClient.get("/api/invoices", { params }),

  // Get a single invoice by ID
  getInvoiceById: (id) => axiosClient.get(`/api/invoices/${id}`),

  // Process a payment for an invoice
  processPayment: (data) => axiosClient.post("/api/payments", data),

  // Update an invoice (e.g., amount or status)
  updateInvoice: (id, data) => axiosClient.put(`/api/invoices/${id}`, data),

  // Fetch completed appointments to show in "Create Invoice" tab
  // (Assuming backend supports STATUS filter on appointments)
  getCompletedAppointments: () => axiosClient.get("/api/appointments", { params: { STATUS: 'completed' } }),
};

export default billingAPI;
