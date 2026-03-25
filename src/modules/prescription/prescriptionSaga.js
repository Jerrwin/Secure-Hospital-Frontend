import { call, put, takeLatest, takeEvery, select } from "redux-saga/effects";
import { prescriptionAPI } from "./prescriptionAPI";
import {
  fetchPagedRequest,
  fetchPagedSuccess,
  fetchPagedFailure,
  prefetchRequest,
  prefetchSuccess,
  prefetchFailure,
  setPage,
  moveBufferToList,
  fetchRequest,
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
import {
  fetchPagedSagaGenerator,
  prefetchSagaGenerator,
  handleSetPageSagaGenerator,
} from "../../utils/paginationSagaUtils";

const selectAuth = (state) => state.auth;
const selectPrescription = (state) => state.prescription;

// ─── Paged Fetch ──────────────────────────────────────────────────
function* fetchPagedSaga(action) {
  yield call(fetchPagedSagaGenerator, {
    apiMethod: prescriptionAPI.fetchAll,
    actions: { fetchPagedSuccess, fetchPagedFailure, prefetchRequest },
    stateSelector: selectPrescription,
    action,
  });
}

function* prefetchSaga(action) {
  yield call(prefetchSagaGenerator, {
    apiMethod: prescriptionAPI.fetchAll,
    actions: { prefetchSuccess, prefetchFailure },
    stateSelector: selectPrescription,
    action,
  });
}

function* handleSetPageSaga(action) {
  yield call(handleSetPageSagaGenerator, {
    actions: { moveBufferToList, prefetchRequest, fetchPagedRequest },
    stateSelector: selectPrescription,
    action,
  });
}

// ─── Fetch Prescriptions (Legacy/Initial) ──────────────────────────
function* fetchPrescriptionsSaga() {
  try {
    const auth = yield select(selectAuth);
    const userRole = (auth.user?.role || "").toUpperCase();

    let appointments = [];

    if (["DOCTOR", "ADMIN", "PROVIDER"].includes(userRole)) {
      try {
        const apptResponse = yield call(prescriptionAPI.fetchCompletedAppointments);
        appointments = apptResponse.data?.data || apptResponse.data || [];
      } catch {
        // Non-critical
      }
    }

    yield put(fetchAppointmentsSuccess(appointments));
  } catch (error) {
    yield put(fetchFailure("Initialization failed"));
  }
}

// ─── Create Prescription ─────────────────────────────────────────
function* createPrescriptionSaga(action) {
  try {
    const response = yield call(prescriptionAPI.create, action.payload);
    const created = response.data?.data || response.data;
    yield put(createSuccess(created));
  } catch (error) {
    if (error.isOfflineQueued) {
      yield put(createFailure("OFFLINE_QUEUED"));
    } else {
      const message =
        error.response?.data?.message ||
        "Failed to create prescription. Please try again.";
      yield put(createFailure(message));
    }
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
    if (error.isOfflineQueued) {
      yield put(updateFailure("OFFLINE_QUEUED"));
    } else {
      const message =
        error.response?.data?.message ||
        "Failed to update prescription. Please try again.";
      yield put(updateFailure(message));
    }
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
    if (error.isOfflineQueued) {
      yield put(statusChangeFailure("OFFLINE_QUEUED"));
    } else {
      const message =
        error.response?.data?.message ||
        "Status update failed. Please try again.";
      yield put(statusChangeFailure(message));
    }
  }
}

// ─── Delete Prescription ─────────────────────────────────────────
function* deletePrescriptionSaga(action) {
  try {
    const id = action.payload;
    yield call(prescriptionAPI.delete, id);
    yield put(deleteSuccess(id));
  } catch (error) {
    if (error.isOfflineQueued) {
      yield put(deleteFailure("OFFLINE_QUEUED"));
    } else {
      const message =
        error.response?.data?.message ||
        "Failed to delete prescription. Please try again.";
      yield put(deleteFailure(message));
    }
  }
}

// ─── Root Watcher ────────────────────────────────────────────────
export default function* prescriptionSaga() {
  yield takeLatest(fetchRequest.type, fetchPrescriptionsSaga);
  yield takeLatest(fetchPagedRequest.type, fetchPagedSaga);
  yield takeLatest(prefetchRequest.type, prefetchSaga);
  yield takeLatest(setPage.type, handleSetPageSaga);
  yield takeEvery(createRequest.type, createPrescriptionSaga);
  yield takeEvery(updateRequest.type, updatePrescriptionSaga);
  yield takeEvery(statusChangeRequest.type, statusChangeSaga);
  yield takeEvery(deleteRequest.type, deletePrescriptionSaga);
}
