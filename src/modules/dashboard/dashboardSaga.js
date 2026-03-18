import { call, put, takeLatest, all } from "redux-saga/effects";
import dashboardAPI from "./dashboardAPI";
import {
  fetchDashboardDataRequest,
  fetchDashboardDataSuccess,
  fetchDashboardDataFailure,
} from "./dashboardSlice";

function* fetchDashboardDataSaga(action) {
  try {
    const rawRole = action.payload?.role || "";
    const role = rawRole.toUpperCase();

    // If it's a Patient or Nurse, we use mock data in the frontend for now.
    // We skip the API calls to avoid 403/Forbidden errors from staff-only endpoints.
    if (role === "PATIENT" || role === "NURSE") {
      yield put(
        fetchDashboardDataSuccess({
          stats: null,
          appointments: [],
        })
      );
      return;
    }

    // We can run these in parallel
    const [statsRes, appointmentsRes] = yield all([
      call(dashboardAPI.getStats),
      call(dashboardAPI.getUpcomingAppointments),
    ]);

    let extraData = {};
    
    // Role-specific secondary fetches (Normalized)
    if (role === "ADMIN") {
      const staffRes = yield call(dashboardAPI.getStaff);
      extraData.staff = staffRes.data.data;
    } else if (role === "PROVIDER") {
      const patientsRes = yield call(dashboardAPI.getPatients);
      extraData.patients = patientsRes.data.data;
    } else if (role === "PHARMACIST") {
      const prescriptionsRes = yield call(dashboardAPI.getPrescriptions);
      extraData.prescriptions = prescriptionsRes.data.data;
    }

    yield put(
      fetchDashboardDataSuccess({
        stats: statsRes.data.data,
        appointments: appointmentsRes.data.data,
        ...extraData,
      })
    );
  } catch (error) {
    yield put(
      fetchDashboardDataFailure(
        error.response?.data?.message || "Failed to fetch dashboard data"
      )
    );
  }
}

export default function* dashboardSaga() {
  yield takeLatest(fetchDashboardDataRequest.type, fetchDashboardDataSaga);
}
