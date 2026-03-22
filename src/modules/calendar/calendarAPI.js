import axiosClient from "../../services/axiosClient";

// ─── Calendar API ─────────────────────────────────────────────────────────────
// Backend routes:
//   GET /api/calendar        → current month (alias for range)
//   GET /api/calendar/range  → ?start=YYYY-MM-DD&end=YYYY-MM-DD
//   GET /api/calendar/date   → ?date=YYYY-MM-DD (tooltip)

const calendarAPI = {
  // Fetch month range data: returns [{ date, total_appointments, appointments[] }]
  getRange: (start, end) =>
    axiosClient.get("/api/calendar/range", { params: { start, end } }),

  // Fetch single date tooltip data: returns [{ date, time, status, patient, doctor }]
  getByDate: (date) =>
    axiosClient.get("/api/calendar/date", { params: { date } }),
};

export default calendarAPI;
