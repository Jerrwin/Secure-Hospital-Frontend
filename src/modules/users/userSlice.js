import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  staffList: [],
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    fetchStaffRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchStaffSuccess(state, action) {
      state.loading = false;
      state.staffList = action.payload;
    },
    fetchStaffFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    addStaffRequest(state, action) {
      state.loading = true;
      state.error = null;
    },
    addStaffSuccess(state, action) {
      state.loading = false;
      state.staffList.push(action.payload);
    },
    addStaffFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    updateStaffRequest(state, action) {
      state.loading = true;
      state.error = null;
      // Optimistic update: instantly update the local state for a smoother UI
      const { id, data } = action.payload;
      const index = state.staffList.findIndex(staff => staff.id == id);
      if (index !== -1) {
        state.staffList[index] = { ...state.staffList[index], ...data };
      }
    },
    updateStaffSuccess(state, action) {
      state.loading = false;
      const index = state.staffList.findIndex(staff => staff.id == action.payload.id);
      if (index !== -1) {
        state.staffList[index] = action.payload;
      }
    },
    updateStaffFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    deleteStaffRequest(state, action) {
      state.loading = true;
      state.error = null;
    },
    deleteStaffSuccess(state, action) {
      state.loading = false;
      state.staffList = state.staffList.filter(staff => staff.id != action.payload);
    },
    deleteStaffFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    clearError(state) {
      state.error = null;
    }
  }
});

export const {
  fetchStaffRequest,
  fetchStaffSuccess,
  fetchStaffFailure,
  addStaffRequest,
  addStaffSuccess,
  addStaffFailure,
  updateStaffRequest,
  updateStaffSuccess,
  updateStaffFailure,
  deleteStaffRequest,
  deleteStaffSuccess,
  deleteStaffFailure,
  clearError
} = userSlice.actions;

export default userSlice.reducer;
