import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useAutoLogout = () => {
  const { logout, currentUser, isAdmin } = useAuth();

  useEffect(() => {
    // Only apply auto-logout for regular users, not admins
    if (!currentUser) {
      return; // Wait until user is loaded
    }
    if (isAdmin) {
      return; // Don’t auto-logout admins
    }

    let logoutTimer: ReturnType<typeof setTimeout> | null = null;

    const scheduleLogout = () => {
      // Clear any existing timer
      if (logoutTimer) {
        clearTimeout(logoutTimer);
      }

      // Set a 5-minute (300,000 ms) timer for logout  
      logoutTimer = setTimeout(async () => {
        console.log('Auto-logout triggered after 5 minutes of inactivity');
        try {
          await logout();
        } catch (error) {
          console.error('Auto-logout error:', error);
        }
      }, 300000); // 5 minutes = 300,000 milliseconds
    };

    const resetTimer = () => {
      console.log('User activity detected - resetting logout timer');
      scheduleLogout();
    };

    const handleVisibilityChange = () => {
      console.log('Visibility changed:', document.hidden);
      
      if (document.hidden) {
        console.log('Page hidden - starting 5-minute logout timer');
        scheduleLogout();
      } else {
        console.log('Page visible - resetting logout timer');
        resetTimer();
      }
    };

    const handleWindowBlur = () => {
      console.log('Window blur detected - starting 5-minute logout timer');
      scheduleLogout();
    };

    const handleWindowFocus = () => {
      console.log('Window focus detected - resetting logout timer');
      resetTimer();
    };

    // Listen for page visibility changes (minimize/tab switch/etc)
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Listen for window blur and focus events
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    // Also listen for user activity to reset the timer
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      if (!document.hidden) {
        resetTimer();
      }
    };

    // Add activity listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Start the initial timer
    scheduleLogout();

    // Cleanup listeners and timer
    return () => {
      if (logoutTimer) {
        clearTimeout(logoutTimer);
      }
      
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [currentUser, isAdmin, logout]);
};
