import { call, put, takeLatest, takeEvery, select } from "redux-saga/effects";
import { prescriptionAPI } from "./prescriptionAPI";
import dashboardAPI from "../dashboard/dashboardAPI";
import {
  fetchRequest,
  fetchSuccess,
  fetchFailure,
  fetchAppointmentsSuccess,
  createRequest,
  createSuccess,
  createFailure,
  updateRequest,
  updateSuccess,
  updateFailure,
  statusChangeRequest,
  statusChangeSuccess,
  statusChangeFailure,
  deleteRequest,
  deleteSuccess,
  deleteFailure,
} from "./prescriptionSlice";

// ─── Selector ─────────────────────────────────────────────────────
const selectAuth = (state) => state.auth;

// ─── Fetch Prescriptions ──────────────────────────────────────────
function* fetchPrescriptionsSaga() {
  try {
    const auth = yield select(selectAuth);
    const userRole = (auth.user?.role || "").toUpperCase();
    const userId = auth.user?.user_id || auth.user?.id;

    let data = [];
    let appointments = [];

    if (userRole === "PATIENT") {
      // A. Try dashboard stats first (safe, no 403 risk)
      try {
        const statsRes = yield call(dashboardAPI.getStats);
        if (statsRes.data?.success) {
          const payload = statsRes.data.data;
          appointments = payload.appointments || [];
          data =
            payload.prescriptions ||
            payload.medications ||
            payload.active_prescriptions_list ||
            payload.medications_list ||
            [];
        }
      } catch (e) {
        console.warn("Dashboard summary fallback failed:", e);
      }

      // B. Fallback to direct fetch if dashboard returned nothing
      if (data.length === 0) {
        try {
          const listRes = yield call(prescriptionAPI.fetchAll, { patient_id: userId });
          if (listRes.data?.success) {
            data = listRes.data.data || [];
          }
        } catch (e) {
          console.warn("Direct patient fetch restricted — relying on dashboard fallback.");
        }
      }
    } else {
      // Medical staff
      const response = yield call(prescriptionAPI.fetchAll);
      data = response.data?.data || response.data || [];

      try {
        const apptResponse = yield call(prescriptionAPI.fetchCompletedAppointments);
        appointments = apptResponse.data?.data || apptResponse.data || [];
      } catch {
        // Non-critical
      }
    }

    yield put(fetchAppointmentsSuccess(appointments));
    yield put(fetchSuccess(data));
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Failed to load medications. Please try again.";
    yield put(fetchFailure(message));
  }
}

// ─── Create Prescription ─────────────────────────────────────────
function* createPrescriptionSaga(action) {
  try {
    const response = yield call(prescriptionAPI.create, action.payload);
    const created = response.data?.data || response.data;
    yield put(createSuccess(created));
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Failed to create prescription. Please try again.";
    yield put(createFailure(message));
  }
}

// ─── Update Prescription ─────────────────────────────────────────
function* updatePrescriptionSaga(action) {
  try {
    const { id, data } = action.payload;
    const response = yield call(prescriptionAPI.update, id, data);
    const updated = response.data?.data || response.data;
    yield put(updateSuccess(updated));
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Failed to update prescription. Please try again.";
    yield put(updateFailure(message));
  }
}

// ─── Status Change (verify / dispense) ───────────────────────────
function* statusChangeSaga(action) {
  try {
    const { id, type } = action.payload;

    let response;
    if (type === "verify") {
      response = yield call(prescriptionAPI.verify, id);
    } else if (type === "dispense") {
      response = yield call(prescriptionAPI.dispense, id);
    }

    const updated = response.data?.data || response.data;
    yield put(statusChangeSuccess(updated));
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Status update failed. Please try again.";
    yield put(statusChangeFailure(message));
  }
}

// ─── Delete Prescription ─────────────────────────────────────────
function* deletePrescriptionSaga(action) {
  try {
    const id = action.payload;
    yield call(prescriptionAPI.delete, id);
    yield put(deleteSuccess(id));
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Failed to delete prescription. Please try again.";
    yield put(deleteFailure(message));
  }
}

// ─── Root Watcher ────────────────────────────────────────────────
export default function* prescriptionSaga() {
  yield takeLatest(fetchRequest.type, fetchPrescriptionsSaga);
  yield takeEvery(createRequest.type, createPrescriptionSaga);
  yield takeEvery(updateRequest.type, updatePrescriptionSaga);
  yield takeEvery(statusChangeRequest.type, statusChangeSaga);
  yield takeEvery(deleteRequest.type, deletePrescriptionSaga);
}