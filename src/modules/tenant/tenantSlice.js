import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  config: null,      // { hospital_name, id, status, etc }
  loading: false,
  fetched: false,
  error: null,
};

const tenantSlice = createSlice({
  name: "tenant",
  initialState,
  reducers: {
    fetchTenantInfoRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchTenantInfoSuccess: (state, action) => {
      state.loading = false;
      state.fetched = true;
      state.config = action.payload;
    },
    fetchTenantInfoFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    resetTenantInfo: () => initialState,
  },
});

export const {
  fetchTenantInfoRequest,
  fetchTenantInfoSuccess,
  fetchTenantInfoFailure,
  resetTenantInfo,
} = tenantSlice.actions;

export default tenantSlice.reducer;
