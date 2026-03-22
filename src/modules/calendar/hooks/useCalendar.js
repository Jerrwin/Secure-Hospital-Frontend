import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCalendarRangeRequest,
  fetchCalendarByDateRequest,
  clearTooltipData,
} from "../calendarSlice";

const useCalendar = () => {
  const dispatch = useDispatch();

  const {
    rangeData,
    tooltipData,
    rangeLoading,
    tooltipLoading,
    error,
  } = useSelector((state) => state.calendar);

  const fetchRange = useCallback(
    (start, end) => dispatch(fetchCalendarRangeRequest({ start, end })),
    [dispatch]
  );

  const fetchByDate = useCallback(
    (date) => dispatch(fetchCalendarByDateRequest({ date })),
    [dispatch]
  );

  const clearTooltip = useCallback(
    () => dispatch(clearTooltipData()),
    [dispatch]
  );

  return {
    rangeData,
    tooltipData,
    rangeLoading,
    tooltipLoading,
    error,
    fetchRange,
    fetchByDate,
    clearTooltip,
  };
};

export default useCalendar;
