import { useEffect, useState } from "react";
import { checkAuthStatus, loginWithApiKey } from "./api";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Check auth status
  const checkAuth = async (): Promise<boolean> => {
    console.log("[useAuth] Checking authentication status...");
    try {
      const res = await checkAuthStatus();
      const authenticated = res.data.authenticated;
      setIsAuthenticated(authenticated);
      setSessionId(res.data.sessionId || null);
      console.log("[useAuth] Auth check result:", authenticated, "Session ID:", res.data.sessionId);
      return authenticated;
    } catch (err) {
      console.error("[useAuth] Auth check failed:", err);
      setIsAuthenticated(false);
      setSessionId(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Login with API key
  const login = async (): Promise<boolean> => {
    console.log("[useAuth] Attempting login with API key...");
    setIsLoading(true);
    try {
      const apiKey = import.meta.env.VITE_API_KEY;
      if (!apiKey) {
        console.error("[useAuth] No API key found in environment variables!");
        setIsAuthenticated(false);
        return false;
      }

      await loginWithApiKey(apiKey);
      console.log("[useAuth] Login API call successful. Checking session...");
      const authenticated = await checkAuth();
      console.log("[useAuth] Login result:", authenticated);
      return authenticated;
    } catch (err) {
      console.error("[useAuth] Login failed:", err);
      setIsAuthenticated(false);
      setSessionId(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Initial check and periodic refresh
  useEffect(() => {
    console.log("[useAuth] Initial auth check on mount...");
    const init = async () => {
      const authenticated = await checkAuth();
      console.log("[useAuth] Initial auth result:", authenticated);
    };
    init();

    const interval = setInterval(async () => {
      console.log("[useAuth] Periodic auth check...");
      await checkAuth();
    }, 30_000); // Every 30 seconds

    return () => {
      console.log("[useAuth] Cleaning up auth interval...");
      clearInterval(interval);
    };
  }, []);

  return { isAuthenticated, isLoading, login, checkAuth, sessionId };
};
