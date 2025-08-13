import { useEffect, useState } from "react";
import { checkAuthStatus, loginWithApiKey } from "./api";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const checkAuth = async () => {
    try {
      const res = await checkAuthStatus();
      setIsAuthenticated(res.data.authenticated);
      setSessionId(res.data.sessionId);
      return res.data.authenticated;
    } catch (err) {
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    setIsLoading(true);
    try {
      const res = await loginWithApiKey(import.meta.env.VITE_API_KEY);
      setIsAuthenticated(true);
      setSessionId(res.data.sessionId);
      return true;
    } catch (err) {
      setIsAuthenticated(false);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return { isAuthenticated, isLoading, login, checkAuth, sessionId };
};
