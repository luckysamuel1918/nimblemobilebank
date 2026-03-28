import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot, query, collection, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';

interface AuthContextType {
  currentUser: User | null;
  userData: any;
  login: (emailOrAccount: string, password: string) => Promise<void>;
  loginWithAccountNumber: (accountNumber: string, password: string) => Promise<void>;
  signup: (email: string, password: string, userData: any) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  isAdmin: boolean;
  refreshUserData: () => Promise<void>;
  isSuspended: boolean;
  needsPinVerification: boolean;
  setNeedsPinVerification: (needs: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  const [needsPinVerification, setNeedsPinVerification] = useState(false);

  // Enhanced Safari localStorage compatibility check with detailed logging
  const safeLSAccess = (operation: string, key: string, value?: string) => {
    try {
      console.log(`AuthContext: Attempting localStorage ${operation} for key: ${key}`);
      
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || !window.localStorage) {
        console.warn('AuthContext: localStorage not available - SSR or unsupported browser');
        return null;
      }
      
      // Safari private browsing check with detailed logging
      try {
        localStorage.setItem('__safari_test__', 'test');
        const testResult = localStorage.getItem('__safari_test__');
        localStorage.removeItem('__safari_test__');
        
        if (testResult !== 'test') {
          console.warn('AuthContext: localStorage test failed - private browsing mode?');
          return null;
        }
        console.log('AuthContext: localStorage test passed');
      } catch (e) {
        console.warn('AuthContext: localStorage appears to be disabled (Safari private browsing?)', e);
        return null;
      }
      
      switch (operation) {
        case 'get':
          const getValue = localStorage.getItem(key);
          console.log(`AuthContext: localStorage get ${key}:`, getValue);
          return getValue;
        case 'set':
          if (value !== undefined) {
            localStorage.setItem(key, value);
            console.log(`AuthContext: localStorage set ${key}:`, value);
          }
          return null;
        case 'remove':
          localStorage.removeItem(key);
          console.log(`AuthContext: localStorage removed ${key}`);
          return null;
        default:
          console.warn(`AuthContext: Unknown localStorage operation: ${operation}`);
          return null;
      }
    } catch (error) {
      console.error('AuthContext: Safari localStorage error:', error);
      return null;
    }
  };

  const login = async (emailOrAccount: string, password: string) => {
    try {
      console.log('AuthContext: Starting login process for:', emailOrAccount);
      
      // Check if it's an email (contains @) or account number
      if (emailOrAccount.includes('@')) {
        console.log('AuthContext: Logging in with email');
        await signInWithEmailAndPassword(auth, emailOrAccount, password);
      } else {
        console.log('AuthContext: Logging in with account number');
        await loginWithAccountNumber(emailOrAccount, password);
      }
      
      // PIN verification will be handled by the component
      if (emailOrAccount !== 'info@apexiumbank.com') {
        console.log('AuthContext: Setting PIN verification needed for non-admin user');
        setNeedsPinVerification(true);
      } else {
        console.log('AuthContext: Admin login, no PIN verification needed');
        setNeedsPinVerification(false);
      }
      
      console.log('AuthContext: Login successful');
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      throw error;
    }
  };

  const loginWithAccountNumber = async (accountNumber: string, password: string) => {
    try {
      console.log('AuthContext: Finding user by account number:', accountNumber);
      
      // Find user by account number with better error handling
      const usersQuery = query(
        collection(db, 'users'),
        where('accountNumber', '==', accountNumber)
      );
      
      const querySnapshot = await getDocs(usersQuery);
      
      if (querySnapshot.empty) {
        console.error('AuthContext: Account number not found');
        throw new Error('Account number not found');
      }
      
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      console.log('AuthContext: Found user data, logging in with email:', userData.email);
      
      // Login with the found email
      await signInWithEmailAndPassword(auth, userData.email, password);
    } catch (error) {
      console.error('AuthContext: Account number login error:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, userData: any) => {
    try {
      console.log('AuthContext: Starting signup process');
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Generate unique NB account number
      const accountNumber = generateNBAccountNumber();
      
      // Randomly assign account type
      const accountTypes = ['savings', 'checking'];
      const randomAccountType = accountTypes[Math.floor(Math.random() * accountTypes.length)];
      
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid, // Firebase UID as unique identifier
        uniqueId: `WTB-${user.uid.substring(0, 8).toUpperCase()}`, // Westcoast Trust Bank unique ID
        ...userData,
        email,
        accountNumber, // Numeric only
        accountType: randomAccountType,
        balance: 0,
        status: 'active',
        createdAt: new Date(),
        loginPin: null // PIN will be set separately and cannot be changed
      });
      
      console.log('AuthContext: Signup successful');
    } catch (error) {
      console.error('AuthContext: Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('AuthContext: Logging out');
      await signOut(auth);
      setNeedsPinVerification(false);
      
      // Clear any Safari-specific storage
      safeLSAccess('remove', 'authToken');
    } catch (error) {
      console.error('AuthContext: Logout error:', error);
      throw error;
    }
  };

  const refreshUserData = async () => {
    if (currentUser && currentUser.email !== 'info@apexiumbank.com') {
      try {
        console.log('AuthContext: Refreshing user data for:', currentUser.uid);
        console.log('AuthContext: Current user details:', {
          uid: currentUser.uid,
          email: currentUser.email,
          emailVerified: currentUser.emailVerified
        });
        
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          console.log('AuthContext: User data refreshed successfully:', {
            accountNumber: data.accountNumber,
            firstName: data.firstName,
            lastName: data.lastName,
            status: data.status,
            balance: data.balance
          });
          setUserData(data);
          setIsSuspended(data.status === 'suspended');
        } else {
          console.error('AuthContext: User document not found for UID:', currentUser.uid);
          // Don't throw error, just log it
        }
      } catch (error) {
        console.error('AuthContext: Error refreshing user data:', error);
        console.error('AuthContext: Error details:', {
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : 'No stack trace'
        });
      }
    } else {
      console.log('AuthContext: Skipping user data refresh - admin user or no current user');
    }
  };

  const generateNBAccountNumber = () => {
    // Generate a 10-digit numeric account number
    const randomDigits = Math.floor(Math.random() * 9000000000) + 1000000000;
    return randomDigits.toString();
  };

  useEffect(() => {
    console.log('AuthContext: Setting up auth state listener');
    console.log('AuthContext: Browser info:', {
      userAgent: navigator.userAgent,
      isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
      cookieEnabled: navigator.cookieEnabled
    });
    
    let unsubscribeUserData: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        console.log('AuthContext: Auth state changed:', {
          userEmail: user?.email,
          userUID: user?.uid,
          emailVerified: user?.emailVerified,
          timestamp: new Date().toISOString()
        });
        
        if (user) {
          console.log('AuthContext: User authenticated, setting up user state');
          setCurrentUser(user);
          const userIsAdmin = user.email === 'info@apexiumbank.com';
          setIsAdmin(userIsAdmin);
          console.log('AuthContext: Is admin user:', userIsAdmin);
          
          if (!userIsAdmin) {
            console.log('AuthContext: Setting up user data listener for regular user');
            // Set up real-time listener for user data with enhanced error handling
            const userDocRef = doc(db, 'users', user.uid);
            
            // Enhanced listener setup with Safari-specific retry logic
            const setupListener = () => {
              console.log('AuthContext: Attempting to setup Firestore listener');
              
              unsubscribeUserData = onSnapshot(userDocRef, 
                (userDoc) => {
                  console.log('AuthContext: Firestore snapshot received');
                  if (userDoc.exists()) {
                    const data = userDoc.data();
                    console.log('AuthContext: User data updated in real-time:', {
                      accountNumber: data.accountNumber,
                      firstName: data.firstName,
                      status: data.status,
                      hasBalance: typeof data.balance !== 'undefined'
                    });
                    setUserData(data);
                    setIsSuspended(data.status === 'suspended');
                  } else {
                    console.warn('AuthContext: User document does not exist for UID:', user.uid);
                    setUserData(null);
                    setIsSuspended(false);
                  }
                }, 
                (error) => {
                  console.error('AuthContext: Error listening to user data:', error);
                  console.error('AuthContext: Firestore error details:', {
                    code: error.code,
                    message: error.message,
                    name: error.name
                  });
                  
                  // On error, try to get data once as fallback
                  console.log('AuthContext: Attempting fallback data fetch');
                  getDoc(userDocRef).then(doc => {
                    if (doc.exists()) {
                      const data = doc.data();
                      console.log('AuthContext: Fallback data fetch successful');
                      setUserData(data);
                      setIsSuspended(data.status === 'suspended');
                    } else {
                      console.warn('AuthContext: Fallback data fetch - document not found');
                    }
                  }).catch(err => {
                    console.error('AuthContext: Fallback data fetch failed:', err);
                    
                    // For Safari, retry after delay
                    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
                    if (isSafari) {
                      console.log('AuthContext: Safari detected - retrying listener setup in 3 seconds');
                      setTimeout(() => {
                        console.log('AuthContext: Retrying listener setup for Safari');
                        setupListener();
                      }, 3000);
                    }
                  });
                }
              );
            };
            
            setupListener();
          } else {
            console.log('AuthContext: Admin user - clearing user data');
            // For admin user, clear user data
            setUserData(null);
            setIsSuspended(false);
            setNeedsPinVerification(false);
          }
        } else {
          console.log('AuthContext: User logged out or not authenticated');
          setCurrentUser(null);
          setUserData(null);
          setIsAdmin(false);
          setIsSuspended(false);
          setNeedsPinVerification(false);
          
          // Clean up user data listener
          if (unsubscribeUserData) {
            console.log('AuthContext: Cleaning up user data listener');
            unsubscribeUserData();
            unsubscribeUserData = null;
          }
        }
      } catch (error) {
        console.error('AuthContext: Auth state change error:', error);
        console.error('AuthContext: Detailed error info:', {
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : 'No stack trace'
        });
      } finally {
        // Enhanced Safari loading state management
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        if (isSafari) {
          console.log('AuthContext: Safari detected - adding delay before setting loading to false');
          setTimeout(() => {
            console.log('AuthContext: Safari delay complete - setting loading to false');
            setLoading(false);
          }, 800); // Increased delay for Safari
        } else {
          console.log('AuthContext: Non-Safari browser - setting loading to false immediately');
          setLoading(false);
        }
      }
    });

    return () => {
      console.log('AuthContext: Cleaning up auth listeners');
      unsubscribe();
      if (unsubscribeUserData) {
        unsubscribeUserData();
      }
    };
  }, []);

  const value = {
    currentUser,
    userData,
    login,
    loginWithAccountNumber,
    signup,
    logout,
    loading,
    isAdmin,
    refreshUserData,
    isSuspended,
    needsPinVerification,
    setNeedsPinVerification
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
