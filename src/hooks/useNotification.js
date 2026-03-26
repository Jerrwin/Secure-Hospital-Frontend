import { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react";
import {
  fetchNotificationsRequest,
  markAsReadRequest,
  markAllAsReadRequest,
  deleteNotificationRequest,
} from "../modules/notifications/notificationSlice";

const useNotification = () => {
  const dispatch = useDispatch();
  const { items, unreadCount, loading } = useSelector(
    (state) => state.notifications
  );

  const fetchNotifications = useCallback(() => {
    dispatch(fetchNotificationsRequest());
  }, [dispatch]);

  const markAsRead = useCallback(
    (id) => {
      dispatch(markAsReadRequest(id));
    },
    [dispatch]
  );

  const markAllAsRead = useCallback(() => {
    dispatch(markAllAsReadRequest());
  }, [dispatch]);

  const deleteNotification = useCallback(
    (id) => {
      dispatch(deleteNotificationRequest(id));
    },
    [dispatch]
  );

  return {
    notifications: items,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};

export default useNotification;
