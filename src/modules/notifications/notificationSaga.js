import { call, put, takeLatest } from "redux-saga/effects";
import notificationAPI from "./notificationAPI";
import {
  fetchNotificationsRequest,
  fetchNotificationsSuccess,
  fetchNotificationsFailure,
  markAsReadRequest,
  markAsReadSuccess,
  markAllAsReadRequest,
  markAllAsReadSuccess,
  deleteNotificationRequest,
  deleteNotificationSuccess,
} from "./notificationSlice";

function* fetchNotificationsSaga() {
  try {
    const response = yield call(notificationAPI.getNotifications);
    const data = response.data;
    if (data.success) {
      yield put(fetchNotificationsSuccess(data.data));
    } else {
      yield put(fetchNotificationsFailure(data.message || "Failed to fetch notifications."));
    }
  } catch (error) {
    yield put(fetchNotificationsFailure(error.message || "Network error."));
  }
}

function* markAsReadSaga(action) {
  try {
    yield call(notificationAPI.markAsRead, action.payload);
    yield put(markAsReadSuccess(action.payload));
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
  }
}

function* markAllAsReadSaga() {
  try {
    yield call(notificationAPI.markAllAsRead);
    yield put(markAllAsReadSuccess());
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
  }
}

function* deleteNotificationSaga(action) {
  try {
    yield call(notificationAPI.delete, action.payload);
    yield put(deleteNotificationSuccess(action.payload));
  } catch (error) {
    console.error("Failed to delete notification:", error);
  }
}

export default function* notificationSaga() {
  yield takeLatest(fetchNotificationsRequest.type, fetchNotificationsSaga);
  yield takeLatest(markAsReadRequest.type, markAsReadSaga);
  yield takeLatest(markAllAsReadRequest.type, markAllAsReadSaga);
  yield takeLatest(deleteNotificationRequest.type, deleteNotificationSaga);
}
