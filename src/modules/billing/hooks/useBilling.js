import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPagedRequest,
  setPage,
  setSearch as setSearchAction,
  setStatus as setStatusAction,
  fetchInvoicesRequest,
  createInvoiceRequest,
  processPaymentRequest,
  clearBillingError as clearBillingErrorAction,
  resetBilling,
} from "../billingSlice";

const useBilling = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.billing);

  const fetchPaged = useCallback((page) => dispatch(fetchPagedRequest(page)), [dispatch]);
  const setPageNum = useCallback((page) => dispatch(setPage(page)), [dispatch]);
  const setSearch = useCallback((q) => dispatch(setSearchAction(q)), [dispatch]);
  const setStatus = useCallback((s) => dispatch(setStatusAction(s)), [dispatch]);

  const fetchInvoices = useCallback((params) => {
    dispatch(fetchInvoicesRequest(params));
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
    fetchPaged,
    setPageNum,
    setSearch,
    setStatus,
    fetchInvoices,
    createInvoice,
    processPayment,
    clearBillingError,
    resetBilling: () => dispatch(resetBilling()),
  };
};

export default useBilling;
