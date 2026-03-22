import { call, put, takeLatest, all } from "redux-saga/effects";
import calendarAPI from "./calendarAPI";
import {
  fetchCalendarRangeRequest,
  fetchCalendarRangeSuccess,
  fetchCalendarRangeFailure,
  fetchCalendarByDateRequest,
  fetchCalendarByDateSuccess,
  fetchCalendarByDateFailure,
} from "./calendarSlice";

// ── FETCH RANGE SAGA ───────────────────────────────────────────────────────────
// payload: { start: "YYYY-MM-DD", end: "YYYY-MM-DD" }
function* fetchCalendarRangeSaga(action) {
  try {
    const { start, end } = action.payload;
    const res = yield call(calendarAPI.getRange, start, end);
    if (res.data.success) {
      yield put(fetchCalendarRangeSuccess(res.data.data));
    } else {
      yield put(fetchCalendarRangeFailure(res.data.message || "Failed to fetch calendar data"));
    }
  } catch (error) {
    yield put(
      fetchCalendarRangeFailure(
        error.response?.data?.message || "Failed to fetch calendar range"
      )
    );
  }
}

// ── FETCH BY DATE SAGA ─────────────────────────────────────────────────────────
// payload: { date: "YYYY-MM-DD" }
function* fetchCalendarByDateSaga(action) {
  try {
    const { date } = action.payload;
    const res = yield call(calendarAPI.getByDate, date);
    if (res.data.success) {
      yield put(fetchCalendarByDateSuccess(res.data.data));
    } else {
      yield put(fetchCalendarByDateFailure(res.data.message || "No appointments on this date"));
    }
  } catch (error) {
    yield put(
      fetchCalendarByDateFailure(
        error.response?.data?.message || "Failed to fetch date appointments"
      )
    );
  }
}

// ── ROOT CALENDAR SAGA ─────────────────────────────────────────────────────────
export default function* calendarSaga() {
  yield all([
    takeLatest(fetchCalendarRangeRequest.type, fetchCalendarRangeSaga),
    takeLatest(fetchCalendarByDateRequest.type, fetchCalendarByDateSaga),
  ]);
}
