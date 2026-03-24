import { call, put, takeLatest } from "redux-saga/effects";
import dashboardAPI from "./dashboardAPI";
import {
  fetchDashboardDataRequest,
  fetchDashboardDataSuccess,
  fetchDashboardDataFailure,
} from "./dashboardSlice";

function* fetchDashboardDataSaga(action) {
  try {
    const role = action.payload?.role?.toUpperCase();

    // 1. Fetch primary dashboard stats.
    // This endpoint handles the main stat counts automatically by token/role.
    const statsRes = yield call(dashboardAPI.getStats);
    let payload = statsRes.data.success ? statsRes.data.data : {};

    // 2. Fetch detailed lists (Appointments & Prescriptions).
    // Split by role: patients use the 'upcoming' endpoint (standard list is 403 for them).
    // Staff/admins use parallel fetching for speed.
    if (role === "PATIENT") {
      try {
        const aptRes = yield call(dashboardAPI.getUpcomingAppointments);
        if (aptRes.data?.success) payload.appointments = aptRes.data.data;
      } catch (e) {
        console.error("Could not fetch patient appointments:", e);
      }
    } else {
      // For staff/admin, we rely on the stats endpoint for strictly "Today's" appointment data.
      // We only fetch prescriptions separately.
      try {
        const presRes = yield call(dashboardAPI.getPrescriptions);
        if (presRes.data?.success) payload.prescriptions = presRes.data.data;
      } catch (e) {
        console.error("Error fetching staff dashboard prescriptions:", e);
      }
    }

    yield put(
      fetchDashboardDataSuccess({
        stats: payload.stats || null,         // ✅ never pollute stats with list data
        appointments: payload.appointments || [],
        prescriptions: payload.prescriptions || [],
        weekly_trend: payload.weekly_trend || [],
        patients: [],
        staff: [],
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