import { call, put, takeLatest, all } from "redux-saga/effects";
import billingAPI from "./billingAPI";
import {
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
} from "./billingSlice";

function* fetchInvoicesSaga(action) {
  try {
    const res = yield call(billingAPI.getInvoices, action.payload);
    
    // Handle both wrapped {success, data} and raw [...] formats
    const data = res.data.success ? res.data.data : (Array.isArray(res.data) ? res.data : []);
    
    if (res.data.success || Array.isArray(res.data)) {
      let finalData = data;
      
      // If we only have invoice_id, fetch complete details for each invoice
      if (data.length > 0 && data[0].invoice_id && !data[0].amount) {
        const completeInvoices = [];
        
        for (const invoice of data) {
          try {
            const detailRes = yield call(billingAPI.getInvoiceById, invoice.invoice_id);
            
            const invoiceDetail = detailRes.data.success ? detailRes.data.data : detailRes.data;
            completeInvoices.push(invoiceDetail);
          } catch (error) {
            console.error("Failed to fetch invoice details for", invoice.invoice_id, error);
            console.error("Error response:", error.response?.data);
            completeInvoices.push(invoice); // Keep the partial data
          }
        }
        
        finalData = completeInvoices;
        yield put(fetchInvoicesSuccess(finalData));
      } else {
        yield put(fetchInvoicesSuccess(finalData));
      }

      const status = action.payload?.STATUS?.toLowerCase();
      if (status === 'pending') {
        yield put(fetchPendingInvoicesSuccess(finalData));
      } else if (status === 'paid') {
        yield put(fetchPaidInvoicesSuccess(finalData));
      }
    } else {
      yield put(fetchInvoicesFailure("Invalid response format"));
    }
  } catch (error) {
    yield put(fetchInvoicesFailure(error.response?.data?.message || "Error fetching invoices"));
  }
}

function* fetchCompletedAppointmentsSaga() {
  try {
    const res = yield call(billingAPI.getCompletedAppointments);
    const data = res.data.success ? res.data.data : (Array.isArray(res.data) ? res.data : []);
    
    if (res.data.success || Array.isArray(res.data)) {
      yield put(fetchCompletedAppointmentsSuccess(data));
    } else {
      yield put(fetchCompletedAppointmentsFailure("Invalid response format"));
    }
  } catch (error) {
    yield put(fetchCompletedAppointmentsFailure(error.response?.data?.message || "Error fetching appointments"));
  }
}

function* createInvoiceSaga(action) {
  try {
    const res = yield call(billingAPI.createInvoice, action.payload);
    const data = res.data.success ? res.data.data : res.data;
    
    if (res.data.success || data) {
      yield put(createInvoiceSuccess(data));
      // Re-fetch to ensure all tabs are in sync with server data
      yield put(fetchInvoicesRequest());
    } else {
      yield put(createInvoiceFailure("Failed to create invoice"));
    }
  } catch (error) {
    yield put(createInvoiceFailure(error.response?.data?.message || "Error creating invoice"));
  }
}

function* processPaymentSaga(action) {
  try {
    const res = yield call(billingAPI.processPayment, action.payload);
    const data = res.data.success ? res.data.data : res.data;
    
    if (res.data.success || data) {
      yield put(processPaymentSuccess(data));
      // Re-fetch to ensure the "Completed Payments" tab is updated immediately
      yield put(fetchInvoicesRequest());
    } else {
      yield put(processPaymentFailure("Failed to process payment"));
    }
  } catch (error) {
    yield put(processPaymentFailure(error.response?.data?.message || "Error processing payment"));
  }
}

export default function* billingSaga() {
  yield all([
    takeLatest(fetchInvoicesRequest.type, fetchInvoicesSaga),
    takeLatest(fetchCompletedAppointmentsRequest.type, fetchCompletedAppointmentsSaga),
    takeLatest(createInvoiceRequest.type, createInvoiceSaga),
    takeLatest(processPaymentRequest.type, processPaymentSaga),
  ]);
}
