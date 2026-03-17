import axiosClient from "../../services/axiosClient";

export const loginAPI = async (credentials) => {
  const response = await axiosClient.post("/api/auth/login", credentials);
  return response.data;
};