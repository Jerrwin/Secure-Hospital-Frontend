import { call, put, takeLatest, takeEvery } from "redux-saga/effects";
import { prescriptionAPI } from "./prescriptionAPI";
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

// ─── Fetch Prescriptions ──────────────────────────────────────────
function* fetchPrescriptionsSaga() {
  try {
    const response = yield call(prescriptionAPI.fetchAll);
    const data = response.data?.data || response.data || [];

    // Also fetch completed appointments for doctor dropdown
    try {
      const apptResponse = yield call(
        prescriptionAPI.fetchCompletedAppointments
      );
      const appointments =
        apptResponse.data?.data || apptResponse.data || [];
      yield put(fetchAppointmentsSuccess(appointments));
    } catch {
      // Appointments fetch failure is non-critical
      yield put(fetchAppointmentsSuccess([]));
    }

    yield put(fetchSuccess(data));
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Failed to load prescriptions. Please try again.";
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

// ─── Status Change (verify / dispense / cancel) ───────────────────
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