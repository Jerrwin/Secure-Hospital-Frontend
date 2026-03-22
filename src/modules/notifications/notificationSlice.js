import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    fetchNotificationsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchNotificationsSuccess: (state, action) => {
      state.loading = false;
      state.items = action.payload.notifications || [];
      state.unreadCount = action.payload.unread_count || 0;
    },
    fetchNotificationsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    markAsReadRequest: () => {},
    markAsReadSuccess: (state, action) => {
      const id = action.payload;
      const item = state.items.find((n) => n.id === id);
      if (item && !item.is_read) {
        item.is_read = 1;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    markAllAsReadRequest: () => {},
    markAllAsReadSuccess: (state) => {
      state.items.forEach((n) => (n.is_read = 1));
      state.unreadCount = 0;
    },
  },
});

export const {
  fetchNotificationsRequest,
  fetchNotificationsSuccess,
  fetchNotificationsFailure,
  markAsReadRequest,
  markAsReadSuccess,
  markAllAsReadRequest,
  markAllAsReadSuccess,
} = notificationSlice.actions;

export default notificationSlice.reducer;
