import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  patients: [],
  selectedPatient: null,
  loading: false,
  error: null,
};

const patientSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    fetchPatientsRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchPatientsSuccess(state, action) {
      state.loading = false;
      state.patients = action.payload;
    },
    fetchPatientsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    
    fetchPatientByIdRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchPatientByIdSuccess(state, action) {
      state.loading = false;
      state.selectedPatient = action.payload;
    },
    fetchPatientByIdFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    createPatientRequest(state) {
      state.loading = true;
      state.error = null;
    },
    createPatientSuccess(state, action) {
      state.loading = false;
      state.patients.push(action.payload);
    },
    createPatientFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    updatePatientRequest(state, action) {
      state.loading = true;
      state.error = null;
      // Optimistic update
      const { id, data } = action.payload;
      const index = state.patients.findIndex(p => p.id == id);
      if (index !== -1) {
        state.patients[index] = { ...state.patients[index], ...data };
      }
    },
    updatePatientSuccess(state, action) {
      state.loading = false;
      const index = state.patients.findIndex(p => p.id == action.payload.id);
      if (index !== -1) {
        state.patients[index] = action.payload;
      }
    },
    updatePatientFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    deletePatientRequest(state) {
      state.loading = true;
      state.error = null;
    },
    deletePatientSuccess(state, action) {
      state.loading = false;
      state.patients = state.patients.filter(p => p.id != action.payload);
    },
    deletePatientFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    clearPatientError(state) {
      state.error = null;
    },
    setSelectedPatient(state, action) {
      state.selectedPatient = action.payload;
    }
  }
});

export const {
  fetchPatientsRequest, fetchPatientsSuccess, fetchPatientsFailure,
  fetchPatientByIdRequest, fetchPatientByIdSuccess, fetchPatientByIdFailure,
  createPatientRequest, createPatientSuccess, createPatientFailure,
  updatePatientRequest, updatePatientSuccess, updatePatientFailure,
  deletePatientRequest, deletePatientSuccess, deletePatientFailure,
  clearPatientError, setSelectedPatient
} = patientSlice.actions;

export default patientSlice.reducer;
