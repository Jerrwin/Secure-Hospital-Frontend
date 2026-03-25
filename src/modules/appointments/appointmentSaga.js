import { call, put, takeLatest, all, select } from "redux-saga/effects";
import appointmentAPI from "./appointmentAPI";
import {
  fetchPagedRequest,
  fetchPagedSuccess,
  fetchPagedFailure,
  prefetchRequest,
  prefetchSuccess,
  prefetchFailure,
  setPage,
  moveBufferToList,
  setSearch,
  setStatus,
  fetchAppointmentsRequest,
  fetchUpcomingRequest,
  fetchUpcomingSuccess,
  fetchUpcomingFailure,
  fetchAppointmentByIdRequest,
  fetchAppointmentByIdSuccess,
  fetchAppointmentByIdFailure,
  createAppointmentRequest,
  createAppointmentSuccess,
  createAppointmentFailure,
  updateAppointmentRequest,
  updateAppointmentSuccess,
  updateAppointmentFailure,
  cancelAppointmentRequest,
  cancelAppointmentSuccess,
  cancelAppointmentFailure,
  completeAppointmentRequest,
  completeAppointmentSuccess,
  completeAppointmentFailure,
  fetchDropdownDataRequest,
  fetchDropdownDataSuccess,
  fetchDropdownDataFailure,
} from "./appointmentSlice";
import { 
  fetchPagedSagaGenerator, 
  prefetchSagaGenerator, 
  handleSetPageSagaGenerator 
} from "../../utils/paginationSagaUtils";

// ── PAGINATION SAGAS (Centralized) ──────────────────────────────────────────
const stateSelector = (state) => state.appointments;
const paginationActions = {
  fetchPagedRequest, fetchPagedSuccess, fetchPagedFailure,
  prefetchRequest, prefetchSuccess, prefetchFailure,
  setPage, moveBufferToList, setSearch, setStatus
};

function* fetchPagedAppointmentsSaga(action) {
  yield fetchPagedSagaGenerator({
    apiMethod: appointmentAPI.getAll,
    actions: paginationActions,
    stateSelector,
    action
  });
}

function* prefetchSaga(action) {
  yield prefetchSagaGenerator({
    apiMethod: appointmentAPI.getAll,
    actions: paginationActions,
    stateSelector,
    action
  });
}

function* handleSetPageSaga(action) {
  yield handleSetPageSagaGenerator({
    actions: paginationActions,
    stateSelector,
    action
  });
}

// ── FETCH UPCOMING ─────────────────────────────────────────────────────────────
function* fetchUpcomingSaga() {
  try {
    const res = yield call(appointmentAPI.getUpcoming);
    if (res.data.success) {
      yield put(fetchUpcomingSuccess(res.data.data));
    } else {
      yield put(fetchUpcomingFailure(res.data.message || "No upcoming found"));
    }
  } catch (error) {
    yield put(
      fetchUpcomingFailure(
        error.response?.data?.message || "Failed to fetch upcoming",
      ),
    );
  }
}

// ── FETCH ALL (Legacy/Fallback) ────────────────────────────────────────────────
function* fetchAppointmentsSaga() {
  // Fallback to paged fetch for page 1
  yield put(fetchPagedRequest(1));
}

// ── FETCH SINGLE ───────────────────────────────────────────────────────────────
function* fetchAppointmentByIdSaga(action) {
  try {
    const res = yield call(appointmentAPI.getById, action.payload);
    if (res.data.success) {
      yield put(fetchAppointmentByIdSuccess(res.data.data));
    } else {
      yield put(fetchAppointmentByIdFailure(res.data.message || "Not found"));
    }
  } catch (error) {
    if (!navigator.onLine || !error.response) {
      yield put(fetchAppointmentByIdFailure(null));
    } else {
      yield put(
        fetchAppointmentByIdFailure(
          error.response?.data?.message || "Failed to fetch appointment",
        ),
      );
    }
  }
}

// ── CREATE ─────────────────────────────────────────────────────────────────────
function* createAppointmentSaga(action) {
  try {
    const res = yield call(appointmentAPI.create, action.payload);
    if (res.data.success) {
      yield put(createAppointmentSuccess(res.data.data));
    } else {
      yield put(
        createAppointmentFailure(res.data.message || "Failed to create"),
      );
    }
  } catch (error) {
    if (error.isOfflineQueued) {
      yield put(createAppointmentFailure("OFFLINE_QUEUED"));
    } else {
      yield put(
        createAppointmentFailure(
          error.response?.data?.message || "Failed to create appointment",
        ),
      );
    }
  }
}

// ── UPDATE ─────────────────────────────────────────────────────────────────────
function* updateAppointmentSaga(action) {
  try {
    // action.payload = { id, data }
    const res = yield call(
      appointmentAPI.update,
      action.payload.id,
      action.payload.data,
    );
    if (res.data.success) {
      yield put(updateAppointmentSuccess(action.payload.id));
      // Re-fetch the current page to ensure list accuracy
      yield put(fetchPagedRequest());
    } else {
      yield put(updateAppointmentFailure(res.data.message || "Update failed"));
    }
  } catch (error) {
    if (error.isOfflineQueued) {
      yield put(updateAppointmentFailure("OFFLINE_QUEUED"));
    } else {
      yield put(
        updateAppointmentFailure(
          error.response?.data?.message || "Failed to update appointment",
        ),
      );
    }
  }
}

// ── CANCEL ─────────────────────────────────────────────────────────────────────
function* cancelAppointmentSaga(action) {
  try {
    // action.payload = id
    const res = yield call(appointmentAPI.cancel, action.payload);
    if (res.data.success) {
      yield put(cancelAppointmentSuccess(action.payload));
    } else {
      yield put(cancelAppointmentFailure(res.data.message || "Cancel failed"));
    }
  } catch (error) {
    if (error.isOfflineQueued) {
      yield put(cancelAppointmentFailure("OFFLINE_QUEUED"));
    } else {
      yield put(
        cancelAppointmentFailure(
          error.response?.data?.message || "Failed to cancel appointment",
        ),
      );
    }
  }
}

// ── COMPLETE ───────────────────────────────────────────────────────────────────
function* completeAppointmentSaga(action) {
  try {
    // action.payload = id
    const res = yield call(appointmentAPI.complete, action.payload);
    if (res.data.success) {
      yield put(completeAppointmentSuccess(action.payload));
    } else {
      yield put(
        completeAppointmentFailure(res.data.message || "Complete failed"),
      );
    }
  } catch (error) {
    if (error.isOfflineQueued) {
      yield put(completeAppointmentFailure("OFFLINE_QUEUED"));
    } else {
      yield put(
        completeAppointmentFailure(
          error.response?.data?.message || "Failed to complete appointment",
        ),
      );
    }
  }
}

// ── FETCH DROPDOWN DATA ────────────────────────────────────────────────────────
function* fetchDropdownDataSaga() {
  try {
    let patients = [];
    let staff = [];

    // 1. Get current user from auth state
    const auth = yield select((state) => state.auth);
    const userRole = (auth.user?.role || "").toUpperCase();

    // 2. Try patients — may 403 for Nurse role (everyone needs this for scheduling)
    try {
      const patientsRes = yield call(appointmentAPI.getPatients);
      if (patientsRes.data.success) {
        patients = patientsRes.data.data;
      }
    } catch (e) {
      console.warn(
        "patients endpoint blocked (role restricted) — will use appointment list fallback",
      );
    }

    // 3. ONLY Try staff — may 403 for Nurse role if the user is NOT a doctor/provider
    // Doctors only schedule for themselves, so they don't need to select from a list.
    if (userRole !== "DOCTOR" && userRole !== "PROVIDER") {
      try {
        const staffRes = yield call(appointmentAPI.getStaff);
        if (staffRes.data.success) {
          staff = staffRes.data.data;
        }
      } catch (e) {
        console.warn(
          "staff endpoint blocked (role restricted) — will use appointment list fallback",
        );
      }
    }

    yield put(fetchDropdownDataSuccess({ patients, staff }));
  } catch (error) {
    if (!navigator.onLine || !error.response) {
      yield put(fetchDropdownDataFailure(null));
    } else {
      yield put(
        fetchDropdownDataFailure(
          error.response?.data?.message || "Failed to fetch dropdown data",
        ),
      );
    }
  }
}
// ── ROOT APPOINTMENT SAGA ──────────────────────────────────────────────────────
export default function* appointmentSaga() {
  yield all([
    takeLatest(fetchPagedRequest.type, fetchPagedAppointmentsSaga),
    takeLatest(prefetchRequest.type, prefetchSaga),
    takeLatest(setPage.type, handleSetPageSaga),
    takeLatest(fetchAppointmentsRequest.type, fetchAppointmentsSaga),
    takeLatest(fetchUpcomingRequest.type, fetchUpcomingSaga),
    takeLatest(fetchAppointmentByIdRequest.type, fetchAppointmentByIdSaga),
    takeLatest(createAppointmentRequest.type, createAppointmentSaga),
    takeLatest(updateAppointmentRequest.type, updateAppointmentSaga),
    takeLatest(cancelAppointmentRequest.type, cancelAppointmentSaga),
    takeLatest(completeAppointmentRequest.type, completeAppointmentSaga),
    takeLatest(fetchDropdownDataRequest.type, fetchDropdownDataSaga),
  ]);
}
