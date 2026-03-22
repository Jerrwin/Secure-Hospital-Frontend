import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchInvoicesRequest,
  fetchCompletedAppointmentsRequest,
  createInvoiceRequest,
  processPaymentRequest,
  clearBillingError as clearBillingErrorAction,
  resetBilling,
} from "../billingSlice";

const useBilling = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.billing);

  const fetchInvoices = useCallback((params) => {
    dispatch(fetchInvoicesRequest(params));
  }, [dispatch]);

  const fetchCompletedAppointments = useCallback(() => {
    dispatch(fetchCompletedAppointmentsRequest());
  }, [dispatch]);

  const createInvoice = useCallback((data) => {
    dispatch(createInvoiceRequest(data));
  }, [dispatch]);

  const processPayment = useCallback((data) => {
    dispatch(processPaymentRequest(data));
  }, [dispatch]);

  const clearBillingError = useCallback(() => {
    dispatch(clearBillingErrorAction());
  }, [dispatch]);

  return {
    ...state,
    fetchInvoices,
    fetchCompletedAppointments,
    createInvoice,
    processPayment,
    clearBillingError,
    resetBilling: () => dispatch(resetBilling()),
  };
};

export default useBilling;
