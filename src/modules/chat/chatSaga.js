import { call, put, takeLatest, all } from "redux-saga/effects";
import chatAPI from "./chatAPI";
import {
  fetchNotesRequest,
  fetchNotesSuccess,
  fetchNotesFailure,
  addNoteRequest,
  addNoteSuccess,
  addNoteFailure,
} from "./chatSlice";

function* fetchNotesSaga(action) {
  try {
    const res = yield call(chatAPI.getNotes, action.payload); // action.payload is appointmentId
    if (res.data.success) {
      yield put(fetchNotesSuccess(res.data.data));
    } else {
      yield put(fetchNotesFailure(res.data.message || "Failed to fetch notes"));
    }
  } catch (error) {
    yield put(
      fetchNotesFailure(
        error.response?.data?.message || "Failed to fetch notes"
      )
    );
  }
}

function* addNoteSaga(action) {
  try {
    const res = yield call(chatAPI.addNote, action.payload);
    if (res.data.success) {
      yield put(addNoteSuccess(res.data.data));
      // Re-fetch notes to refresh the list automatically
      yield put(fetchNotesRequest(action.payload.appointment_id));
    } else {
      yield put(addNoteFailure(res.data.message || "Failed to add note"));
    }
  } catch (error) {
    yield put(
      addNoteFailure(
        error.response?.data?.message || "Failed to add note"
      )
    );
  }
}

export default function* chatSaga() {
  yield all([
    takeLatest(fetchNotesRequest.type, fetchNotesSaga),
    takeLatest(addNoteRequest.type, addNoteSaga),
  ]);
}
