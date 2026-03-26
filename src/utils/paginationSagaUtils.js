import { call, put, select } from 'redux-saga/effects';

/**
 * Generic Saga for fetching a paged dataset and triggering prefetch.
 * 
 * @param {Object} params
 * @param {Function} params.apiMethod - The API function to call
 * @param {Object} params.actions - Redux actions (fetchPagedSuccess, fetchPagedFailure, prefetchRequest)
 * @param {Function} params.stateSelector - Redux selector for the module state
 * @param {Object} params.action - The current action
 */
export function* fetchPagedSagaGenerator({ apiMethod, actions, stateSelector, action }) {
  try {
    const state = yield select(stateSelector);
    const { perPage } = state.pagination;
    const { searchQuery, statusFilter, providerId } = state;

    // Use payload if provided (for explicit page jumps), otherwise use current state
    const page = action.payload || state.pagination.currentPage;

    const params = {
      page,
      per_page: perPage,
      search: searchQuery || undefined,
      status: statusFilter === "all" ? undefined : statusFilter,
      provider_id: providerId || undefined,
      sort: "id",
      order: "asc", 
    };

    const res = yield call(apiMethod, params);
    
    // Normalize response: some APIs return response.data directly, some are axios response objects
    const data = res.data && res.hasOwnProperty('status') ? res.data : res;

    if (data.success || (data.data && data.pagination)) {
      yield put(actions.fetchPagedSuccess(data));
      
      // Auto-trigger prefetch for next page if it exists
      if (data.pagination && data.pagination.current_page < data.pagination.last_page) {
        yield put(actions.prefetchRequest(data.pagination.current_page + 1));
      }
    } else {
      yield put(actions.fetchPagedFailure(data.message || "Fetch failed"));
    }
  } catch (e) {
    yield put(actions.fetchPagedFailure(e.message || "An unexpected error occurred"));
  }
}

/**
 * Generic Saga for prefetching the next page into the buffer.
 */
export function* prefetchSagaGenerator({ apiMethod, actions, stateSelector, action }) {
  try {
    const state = yield select(stateSelector);
    const { perPage } = state.pagination;
    const { searchQuery, statusFilter, providerId } = state;

    const params = {
      page: action.payload,
      per_page: perPage,
      search: searchQuery || undefined,
      status: statusFilter === "all" ? undefined : statusFilter,
      provider_id: providerId || undefined,
      sort: "id",
      order: "asc",
    };

    const res = yield call(apiMethod, params);
    const data = res.data && res.hasOwnProperty('status') ? res.data : res;

    if (data.success) {
      yield put(actions.prefetchSuccess(data));
    } else {
      yield put(actions.prefetchFailure());
    }
  } catch (e) {
    yield put(actions.prefetchFailure());
  }
}

/**
 * Generic Saga for handling page changes (Instant Swap logic).
 */
export function* handleSetPageSagaGenerator({ actions, stateSelector, action }) {
  const targetPage = action.payload;
  const state = yield select(stateSelector);
  const { currentPage } = state.pagination;

  // Instant Swap Logic: If moving forward by 1 and buffer exists
  if (targetPage === currentPage + 1 && state.buffer && state.buffer.length > 0) {
    yield put(actions.moveBufferToList(targetPage));
    // Now prefetch the next-next page
    yield put(actions.prefetchRequest(targetPage + 1));
  } else {
    // Standard fetch (backward jump or jump to non-buffered page)
    yield put(actions.fetchPagedRequest(targetPage));
  }
}
