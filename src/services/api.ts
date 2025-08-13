import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://31.97.62.51:4000";

// Configure axios instance with credentials
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const runCommand = (commandId: string, args: any) => {
  return apiClient.post(`/api/run/${commandId}`, { args });
};

export const checkAuthStatus = () => {
  return apiClient.get("/auth-status");
};

export const loginWithApiKey = (apiKey: string) => {
  return apiClient.post(
    "/login",
    {},
    {
      headers: { "x-api-key": apiKey },
    }
  );
};

export const getAvailableCommands = () => {
  return apiClient.get("/api");
};
