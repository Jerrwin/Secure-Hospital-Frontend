import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isOffline: !navigator.onLine,
  queueCount: 0,
  queue: [], 
};

const offlineSlice = createSlice({
  name: "offline",
  initialState,
  reducers: {
    setOnlineStatus: (state, action) => {
      state.isOffline = !action.payload;
    },
    updateQueueInfo: (state, action) => {
      state.queueCount = action.payload.count;
      state.queue = action.payload.items || [];
    },
    removeFromQueue: (state, action) => {
      state.queue = state.queue.filter(item => item.id !== action.payload);
      state.queueCount = state.queue.length;
    },
    clearOfflineQueue: (state) => {
      state.queueCount = 0;
      state.queue = [];
    }
  },
});

export const { setOnlineStatus, updateQueueInfo, removeFromQueue, clearOfflineQueue } = offlineSlice.actions;
export default offlineSlice.reducer;
