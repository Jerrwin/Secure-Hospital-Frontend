import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sidebarCollapsed: false,
  mobileDrawerOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },
    setMobileDrawerOpen: (state, action) => {
      state.mobileDrawerOpen = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarCollapsed, setMobileDrawerOpen } = uiSlice.actions;
export default uiSlice.reducer;
