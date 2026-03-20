import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  invoices: [], // Master list (All)
  pendingInvoices: [], // Filtered pending
  paidInvoices: [], // Filtered paid
  sessionBilledIds: [], // IDs of appointments billed in this session
  completedAppointments: [],
  selectedInvoice: null,
  loading: false,
  submitting: false,
  createSuccess: false,
  paymentSuccess: false,
  error: null,
  submitError: null,
  fetched: false,
};

const billingSlice = createSlice({
  name: "billing",
  initialState,
  reducers: {
    // Fetch Invoices (All)
    fetchInvoicesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchInvoicesSuccess: (state, action) => {
      state.loading = false;
      const data = Array.isArray(action.payload) ? action.payload : (action.payload?.data || []);
      state.invoices = data;
      state.fetched = true;
    },
    fetchInvoicesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Specific Fetch Successes (to avoid overwriting main list if filtered)
    fetchPendingInvoicesSuccess: (state, action) => {
      state.loading = false;
      const data = Array.isArray(action.payload) ? action.payload : (action.payload?.data || []);
      state.pendingInvoices = data;
    },
    fetchPaidInvoicesSuccess: (state, action) => {
      state.loading = false;
      const data = Array.isArray(action.payload) ? action.payload : (action.payload?.data || []);
      state.paidInvoices = data;
    },

    // Fetch Completed Appointments
    fetchCompletedAppointmentsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchCompletedAppointmentsSuccess: (state, action) => {
      state.loading = false;
      const data = Array.isArray(action.payload) ? action.payload : (action.payload?.data || []);
      state.completedAppointments = data;
    },
    fetchCompletedAppointmentsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create Invoice
    createInvoiceRequest: (state) => {
      state.submitting = true;
      state.submitError = null;
      state.createSuccess = false;
    },
    createInvoiceSuccess: (state, action) => {
      state.submitting = false;
      state.createSuccess = true;
      const newInvoice = action.payload;
      state.invoices = [newInvoice, ...state.invoices];
      
      // Track this appointment ID locally to hide it immediately and persistently
      const appId = newInvoice.appointment_id || newInvoice.appointmentId || newInvoice.APPOINTMENT_ID;
      if (appId && !state.sessionBilledIds.includes(String(appId))) {
        state.sessionBilledIds.push(String(appId));
      }
    },
    createInvoiceFailure: (state, action) => {
      state.submitting = false;
      state.submitError = action.payload;
    },

    // Process Payment
    processPaymentRequest: (state) => {
      state.submitting = true;
      state.submitError = null;
      state.paymentSuccess = false;
    },
    processPaymentSuccess: (state, action) => {
      state.submitting = false;
      state.paymentSuccess = true;
      const paidInvoice = action.payload;
      if (paidInvoice) {
        const id = paidInvoice.id || paidInvoice.Id;
        // Update local state to reflect 'paid' status immediately
        state.invoices = state.invoices.map(inv => {
          if ((inv.id || inv.Id) === id) {
            return { ...inv, STATUS: 'paid', status: 'paid' };
          }
          return inv;
        });
      }
    },
    processPaymentFailure: (state, action) => {
      state.submitting = false;
      state.submitError = action.payload;
    },

    clearBillingError: (state) => {
      state.error = null;
      state.submitError = null;
      state.createSuccess = false;
      state.paymentSuccess = false;
    },
    resetBilling: () => initialState,
  },
});

export const {
  fetchInvoicesRequest,
  fetchInvoicesSuccess,
  fetchInvoicesFailure,
  fetchPendingInvoicesSuccess,
  fetchPaidInvoicesSuccess,
  fetchCompletedAppointmentsRequest,
  fetchCompletedAppointmentsSuccess,
  fetchCompletedAppointmentsFailure,
  createInvoiceRequest,
  createInvoiceSuccess,
  createInvoiceFailure,
  processPaymentRequest,
  processPaymentSuccess,
  processPaymentFailure,
  clearBillingError,
  resetBilling,
} = billingSlice.actions;

export default billingSlice.reducer;
