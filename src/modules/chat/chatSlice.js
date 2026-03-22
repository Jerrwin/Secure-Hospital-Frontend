import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notes: [],
  loading: false,
  submitting: false,
  error: null,
  submitError: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    // Fetch Notes
    fetchNotesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchNotesSuccess: (state, action) => {
      state.loading = false;
      state.notes = action.payload;
    },
    fetchNotesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Add Note
    addNoteRequest: (state) => {
      state.submitting = true;
      state.submitError = null;
    },
    addNoteSuccess: (state) => {
      state.submitting = false;
      // Note: We don't push to state.notes here because the Saga will refetch
    },
    addNoteFailure: (state, action) => {
      state.submitting = false;
      state.submitError = action.payload;
    },

    // Reset
    clearNotes: () => initialState,
  },
});

export const {
  fetchNotesRequest,
  fetchNotesSuccess,
  fetchNotesFailure,
  addNoteRequest,
  addNoteSuccess,
  addNoteFailure,
  clearNotes,
} = chatSlice.actions;

export default chatSlice.reducer;
