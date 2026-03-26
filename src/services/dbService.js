import Dexie from "dexie";
import { encryptData, decryptData } from "../utils/cryptoUtils";

export const db = new Dexie("SecureHospitalOfflineQueue");

// Define schema: id is auto-incremented, other fields are indexed if needed.
db.version(1).stores({
  requestQueue: "++id, url, method, timestamp",
});

/**
 * Adds a request to the offline queue.
 * @param {object} request - The Axios request config object.
 */
export const addOfflineRequest = async (request) => {
  try {
    const { url, method, data, headers, params } = request;
    
    // Encrypt sensitive data
    const encryptedData = data ? encryptData(data) : null;
    const encryptedParams = params ? encryptData(params) : null;

    const offlineRecord = {
      url,
      method,
      data: encryptedData,
      params: encryptedParams,
      headers: JSON.parse(JSON.stringify(headers)), // Clone headers to avoid proxy issues
      timestamp: Date.now(),
    };

    const id = await db.requestQueue.add(offlineRecord);
    return id;
  } catch (error) {
    console.error("Error adding to offline queue:", error);
    throw error;
  }
};

/**
 * Retrieves all queued requests, decrypting data.
 * @returns {Array} - Array of decrypted request objects.
 */
export const getQueuedRequests = async () => {
  try {
    const records = await db.requestQueue.toArray();
    return records.map(record => ({
      ...record,
      data: record.data ? decryptData(record.data) : null,
      params: record.params ? decryptData(record.params) : null,
    }));
  } catch (error) {
    console.error("Error fetching from offline queue:", error);
    return [];
  }
};

/**
 * Removes a request from the queue by ID.
 * @param {number} id - The ID of the record to delete.
 */
export const removeQueuedRequest = async (id) => {
  try {
    await db.requestQueue.delete(id);
  } catch (error) {
    console.error(`Error deleting queued request ${id}:`, error);
  }
};

/**
 * Clears the entire offline queue.
 */
export const clearQueue = async () => {
  try {
    await db.requestQueue.clear();
  } catch (error) {
    console.error("Error clearing offline queue:", error);
  }
};
