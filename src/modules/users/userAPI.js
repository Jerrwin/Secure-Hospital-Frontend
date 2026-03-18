import axiosClient from "../../services/axiosClient";

export const fetchStaffAPI = async () => {
  const response = await axiosClient.get("/api/staff");
  return response.data;
};

export const addStaffAPI = async (staffData) => {
  const response = await axiosClient.post("/api/staff/register", staffData);
  return response.data;
};

export const updateStaffAPI = async ({ id, data }) => {
  const response = await axiosClient.put(`/api/staff/${id}`, data);
  return response.data;
};

export const deleteStaffAPI = async (id) => {
  const response = await axiosClient.delete(`/api/staff/${id}`);
  return response.data;
};
