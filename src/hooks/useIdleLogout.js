import { useEffect, useCallback, useRef } from "react";
import useAuth from "../modules/auth/hooks/useAuth";

const IDLE_TIMEOUT = 50 * 60 * 1000; // 5 Minutes in milliseconds

/**
 * Custom hook to monitor user inactivity and automatically logout.
 * Listens for mouse, keyboard, and touch events on the main window.
 */
const useIdleLogout = () => {
  const { logout, isAuthenticated } = useAuth();
  const timeoutRef = useRef(null);

  const resetTimer = useCallback(() => {
    // Clear the existing timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only start a new timer if the user is authenticated
    if (isAuthenticated) {
      timeoutRef.current = setTimeout(() => {
        console.warn("User idle for 5 minutes. Logging out automatically...");
        logout();
      }, IDLE_TIMEOUT);
    }
  }, [logout, isAuthenticated]);

  useEffect(() => {
    // Standard user activity events
    const events = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    // Initialize the timer on mount
    resetTimer();

    // Set up global listeners
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Cleanup listeners and timers on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [resetTimer]);
};

export default useIdleLogout;
