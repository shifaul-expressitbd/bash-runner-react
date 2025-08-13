import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export const runCommand = (commandId: string, args: any) => {
  return axios.post(
    `${API_BASE_URL}/api/run/${commandId}`,
    { args },
    {
      withCredentials: true,
    }
  );
};

export const startRealtimeCommand = (commandId: string, args: any) => {
  const params = new URLSearchParams();
  if (args) {
    params.append("args", JSON.stringify(args));
  }
  return new EventSource(`${API_BASE_URL}/api/run-realtime/${commandId}?${params.toString()}`);
};

export const checkAuthStatus = () => {
  return axios.get(`${API_BASE_URL}/auth-status`, { withCredentials: true });
};

export const loginWithApiKey = (apiKey: string) => {
  return axios.post(
    `${API_BASE_URL}/login`,
    {},
    {
      headers: { "x-api-key": apiKey },
      withCredentials: true,
    }
  );
};

export const getAvailableCommands = () => {
  return axios.get(`${API_BASE_URL}/api`, { withCredentials: true });
};
