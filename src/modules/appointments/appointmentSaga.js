import { call, put, takeLatest, all } from "redux-saga/effects";
import appointmentAPI from "./appointmentAPI";
import {
  fetchAppointmentsRequest,
  fetchAppointmentsSuccess,
  fetchAppointmentsFailure,
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

// ── FETCH ALL ──────────────────────────────────────────────────────────────────
function* fetchAppointmentsSaga(action) {
  try {
    const res = yield call(appointmentAPI.getAll, action.payload);
    if (res.data.success) {
      yield put(fetchAppointmentsSuccess(res.data.data));
    } else {
      yield put(fetchAppointmentsFailure(res.data.message || "Failed to fetch appointments"));
    }
  } catch (error) {
    yield put(
      fetchAppointmentsFailure(
        error.response?.data?.message || "Failed to fetch appointments"
      )
    );
  }
}

// ── FETCH UPCOMING ─────────────────────────────────────────────────────────────
function* fetchUpcomingSaga() {
  try {
    const res = yield call(appointmentAPI.getUpcoming);
    if (res.data.success) {
      yield put(fetchUpcomingSuccess(res.data.data));
    } else {
      yield put(fetchUpcomingFailure(res.data.message || "Failed to fetch upcoming"));
    }
  } catch (error) {
    yield put(
      fetchUpcomingFailure(
        error.response?.data?.message || "Failed to fetch upcoming appointments"
      )
    );
  }
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
    yield put(
      fetchAppointmentByIdFailure(
        error.response?.data?.message || "Failed to fetch appointment"
      )
    );
  }
}

// ── CREATE ─────────────────────────────────────────────────────────────────────
function* createAppointmentSaga(action) {
  try {
    const res = yield call(appointmentAPI.create, action.payload);
    if (res.data.success) {
      yield put(createAppointmentSuccess(res.data.data));
    } else {
      yield put(createAppointmentFailure(res.data.message || "Failed to create"));
    }
  } catch (error) {
    yield put(
      createAppointmentFailure(
        error.response?.data?.message || "Failed to create appointment"
      )
    );
  }
}

// ── UPDATE ─────────────────────────────────────────────────────────────────────
function* updateAppointmentSaga(action) {
  try {
    // action.payload = { id, data }
    const res = yield call(appointmentAPI.update, action.payload.id, action.payload.data);
    if (res.data.success) {
      yield put(updateAppointmentSuccess(action.payload.id));
      // Re-fetch the full list after update
      yield put(fetchAppointmentsRequest());
    } else {
      yield put(updateAppointmentFailure(res.data.message || "Update failed"));
    }
  } catch (error) {
    yield put(
      updateAppointmentFailure(
        error.response?.data?.message || "Failed to update appointment"
      )
    );
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
    yield put(
      cancelAppointmentFailure(
        error.response?.data?.message || "Failed to cancel appointment"
      )
    );
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
      yield put(completeAppointmentFailure(res.data.message || "Complete failed"));
    }
  } catch (error) {
    yield put(
      completeAppointmentFailure(
        error.response?.data?.message || "Failed to complete appointment"
      )
    );
  }
}

// ── FETCH DROPDOWN DATA ────────────────────────────────────────────────────────
function* fetchDropdownDataSaga() {
  try {
    let patients = [];
    let staff = [];

    // Fetch patients
    try {
      const patientsRes = yield call(appointmentAPI.getPatients);
      if (patientsRes.data.success) {
        patients = patientsRes.data.data;
      }
    } catch (e) {
      console.error("Failed to fetch patients:", e);
    }

    // Fetch staff
    try {
      const staffRes = yield call(appointmentAPI.getStaff);
      if (staffRes.data.success) {
        staff = staffRes.data.data;
      }
    } catch (e) {
      console.error("Failed to fetch staff:", e);
    }

    yield put(
      fetchDropdownDataSuccess({
        patients,
        staff,
      })
    );
  } catch (error) {
    yield put(
      fetchDropdownDataFailure(
        error.response?.data?.message || "Failed to fetch dropdown data"
      )
    );
  }
}

// ── ROOT APPOINTMENT SAGA ──────────────────────────────────────────────────────
export default function* appointmentSaga() {
  yield all([
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
