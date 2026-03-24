import { notification } from "antd";
import { getQueuedRequests, removeQueuedRequest } from "./dbService";
import axiosClient from "./axiosClient";
import { setOnlineStatus, updateQueueInfo } from "../modules/offline/offlineSlice";

let store;
export const injectOfflineStore = (_store) => {
  store = _store;
};

let isSyncing = false;


/**
 * Initializes listeners for online/offline status.
 */
export const initOfflineManager = () => {
  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  // Initial sync of Redux state with IndexedDB
  refreshQueueCount();

  // Check initial status
  if (navigator.onLine) {
    syncOfflineRequests();
  }
};

/**
 * Updates the Redux store with latest information from IndexedDB.
 */
export const refreshQueueCount = async () => {
  if (!store) return;
  const requests = await getQueuedRequests();
  store.dispatch(updateQueueInfo({
    count: requests.length,
    items: requests.map(r => ({ 
      id: r.id, 
      url: r.url, 
      method: r.method, 
      timestamp: r.timestamp 
    }))
  }));
};


/**
 * Handles the browser going online.
 */
const handleOnline = () => {
  if (store) store.dispatch(setOnlineStatus(true));
  // Clear the persistent offline notification
  notification.destroy("offline-status");


  notification.success({
    message: "Back Online",
    description: "System is back online. Syncing queued requests...",
    placement: "topRight",
    duration: 3,
  });
  syncOfflineRequests();
};

/**
 * Handles the browser going offline.
 */
const handleOffline = () => {
  if (store) store.dispatch(setOnlineStatus(false));
  notification.warning({

    key: "offline-status",
    message: "System Offline",
    description: "You are currently offline. New changes will be saved locally and synced when connection is restored.",
    placement: "topRight",
    duration: 3, // Persistent until system is back online
  });
};

/**
 * Synchronizes all queued requests with the server.
 */
export const syncOfflineRequests = async () => {
  if (isSyncing) return;

  const queuedRequests = await getQueuedRequests();
  if (queuedRequests.length === 0) return;

  isSyncing = true;

  notification.info({
    key: "sync-notification",
    message: "Syncing Data",
    description: `Syncing ${queuedRequests.length} offline requests...`,
    placement: "topRight",
    duration: 0,
  });

  let successCount = 0;
  let failCount = 0;

  for (const request of queuedRequests) {
    try {
      // Remove stale auth headers so the axiosClient interceptor can inject fresh ones
      const headers = { ...request.headers };
      delete headers["Authorization"];
      delete headers["X-CSRF-TOKEN"];

      // Re-send the request using axiosClient
      const response = await axiosClient({
        url: request.url,
        method: request.method,
        data: request.data,
        params: request.params,
        headers: headers,
        _isSyncing: true, // Internal flag to avoid re-queuing
      });

      // Check if the backend actually succeeded (some backends return 200 with success: false)
      if (response.data && response.data.success === false) {
        throw new Error(response.data.message || "Server-side processing failed");
      }

      await removeQueuedRequest(request.id);

      successCount++;
      // Sync Redux after each success
      refreshQueueCount();
    } catch (error) {

      console.error(`Sync failed for request ${request.id}:`, error);
      failCount++;
      // If it fails with a validation error or something permanent, we might keep it 
      // or move it to a "failed" table. For now, we keep it in the queue to retry.
    }
  }

  notification.destroy("sync-notification");

  if (successCount > 0) {
    notification.success({
      message: "Sync Complete",
      description: `Successfully synced ${successCount} requests.${failCount > 0 ? ` ${failCount} failed and will be retried.` : ""}`,
      placement: "topRight",
    });
  }

  isSyncing = false;
};
