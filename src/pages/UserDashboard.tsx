import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAutoLogout } from '@/hooks/useAutoLogout';
import TransferModal from '@/components/TransferModal';
import DashboardHeader from '@/components/DashboardHeader';
import BalanceCard from '@/components/BalanceCard';
import ActionButtons from '@/components/ActionButtons';
import BottomNavigation from '@/components/BottomNavigation';
import RecentTransactions from '@/components/RecentTransactions';
import CheckDepositModal from '@/components/CheckDepositModal';
import TransactionHistory from '@/components/TransactionHistory';
import SuspendedAccount from '@/components/SuspendedAccount';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

// Enhanced Safari Error Boundary Component with detailed logging
interface SafariErrorBoundaryProps {
  children: React.ReactNode;
}

interface SafariErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

class SafariErrorBoundary extends React.Component<SafariErrorBoundaryProps, SafariErrorBoundaryState> {
  constructor(props: SafariErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<SafariErrorBoundaryState> {
    console.error('Safari Error Boundary caught error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Log Safari-specific information
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    console.log('Is Safari:', isSafari);
    console.log('User Agent:', navigator.userAgent);
    console.log('Browser Info:', {
      cookieEnabled: navigator.cookieEnabled,
      localStorage: typeof localStorage !== 'undefined',
      sessionStorage: typeof sessionStorage !== 'undefined'
    });
    
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Safari Error Details:', { error, errorInfo });
    console.error('Component Stack:', errorInfo.componentStack);
    
    // Log detailed error information for Safari debugging
    this.setState({
      errorInfo: errorInfo.componentStack
    });
    
    // Try to identify the specific component that failed
    const failedComponent = errorInfo.componentStack.split('\n')[1]?.trim();
    console.error('Failed component:', failedComponent);
    
    // Safari-specific error logging
    if (typeof window !== 'undefined') {
      try {
        // Test localStorage access
        localStorage.setItem('__safari_test__', 'test');
        localStorage.removeItem('__safari_test__');
        console.log('localStorage: Working');
      } catch (e) {
        console.error('localStorage: Failed', e);
      }
      
      // Log window properties that might cause issues
      console.log('Window properties:', {
        location: window.location.href,
        origin: window.location.origin,
        protocol: window.location.protocol
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Dashboard Error</h2>
              <p className="text-gray-600 mb-4">
                Sorry, there was an issue loading your dashboard.
              </p>
              <div className="text-left text-xs text-gray-500 mb-4 p-2 bg-gray-100 rounded">
                <strong>Error:</strong> {this.state.error?.message}<br/>
                <strong>Browser:</strong> {navigator.userAgent.includes('Safari') ? 'Safari' : 'Other'}<br/>
                <strong>Time:</strong> {new Date().toISOString()}
              </div>
              <button 
                onClick={() => {
                  console.log('Refreshing page due to error');
                  window.location.reload();
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-2 w-full"
              >
                Refresh Page
              </button>
              <button 
                onClick={() => {
                  console.log('Clearing storage and redirecting to login');
                  try {
                    localStorage.clear();
                    sessionStorage.clear();
                  } catch (e) {
                    console.error('Failed to clear storage:', e);
                  }
                  window.location.href = '/user';
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 w-full"
              >
                Clear Data & Login Again
              </button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

const UserDashboard = () => {
  console.log('UserDashboard: Component rendering started');
  
  // All useState hooks must be at the top before any conditional logic
  const [showTransfer, setShowTransfer] = useState(false);
  const [showCheckDeposit, setShowCheckDeposit] = useState(false);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [transferType, setTransferType] = useState<'domestic' | 'international'>('domestic');
  const [safariReady, setSafariReady] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  
  // Add auto-logout functionality
  useAutoLogout();
  
  const { refreshUserData, isSuspended, loading, currentUser, userData } = useAuth();

  // Enhanced Safari compatibility check with detailed logging
  useEffect(() => {
    console.log('UserDashboard: useEffect running');
    console.log('UserDashboard: Auth state:', {
      currentUser: currentUser ? {
        uid: currentUser.uid,
        email: currentUser.email,
        emailVerified: currentUser.emailVerified
      } : null,
      userData: userData ? {
        firstName: userData.firstName,
        lastName: userData.lastName,
        accountNumber: userData.accountNumber,
        status: userData.status
      } : null,
      loading,
      isSuspended
    });
    
    // Detect Safari and add compatibility measures
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    console.log('UserDashboard: Safari detection:', isSafari);
    
    if (isSafari) {
      console.log('Safari browser detected - applying compatibility fixes');
      
      // Test Safari-specific features
      try {
        // Test localStorage
        localStorage.setItem('__safari_dashboard_test__', 'test');
        const testValue = localStorage.getItem('__safari_dashboard_test__');
        localStorage.removeItem('__safari_dashboard_test__');
        console.log('Safari localStorage test:', testValue === 'test' ? 'PASS' : 'FAIL');
        
        // Test fetch API
        if (typeof fetch === 'undefined') {
          throw new Error('Fetch API not available');
        }
        console.log('Safari fetch API test: PASS');
        
        // Test Promise support
        if (typeof Promise === 'undefined') {
          throw new Error('Promise not available');
        }
        console.log('Safari Promise test: PASS');
        
        // Add delay for Safari to ensure proper initialization
        setTimeout(() => {
          console.log('Safari initialization complete');
          setSafariReady(true);
        }, 200);
        
      } catch (error) {
        console.error('Safari compatibility test failed:', error);
        setInitializationError(`Safari compatibility issue: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setSafariReady(true); // Still try to render
      }
    } else {
      console.log('Non-Safari browser detected');
      setSafariReady(true);
    }
  }, [currentUser, loading, isSuspended, userData]);

  // Enhanced error handling for Safari
  if (initializationError) {
    console.error('UserDashboard: Initialization error:', initializationError);
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Browser Compatibility Issue</h3>
            <p className="text-sm text-gray-600 mb-4">{initializationError}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Safari-specific loading state
  if (!safariReady) {
    console.log('UserDashboard: Safari not ready, showing loading');
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing Dashboard...</p>
          <p className="text-xs text-gray-500 mt-2">Safari compatibility mode</p>
        </div>
      </div>
    );
  }

  if (loading) {
    console.log('UserDashboard: Loading state');
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    console.log('UserDashboard: No current user');
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  // Show suspended account screen if user is suspended
  if (isSuspended) {
    console.log('UserDashboard: User is suspended, showing suspended account screen');
    return <SuspendedAccount />;
  }

  const handleDomesticTransfer = () => {
    if (isSuspended) return;
    console.log('UserDashboard: Domestic transfer clicked');
    setTransferType('domestic');
    setShowTransfer(true);
  };

  const handleInternationalTransfer = () => {
    if (isSuspended) return;
    console.log('UserDashboard: International transfer clicked');
    setTransferType('international');
    setShowTransfer(true);
  };

  const handleCheckDeposit = () => {
    if (isSuspended) return;
    console.log('UserDashboard: Check deposit clicked');
    setShowCheckDeposit(true);
  };

  const handleTransactionHistory = () => {
    console.log('UserDashboard: Transaction history clicked');
    setShowTransactionHistory(true);
  };

  const handleModalClose = async () => {
    console.log('UserDashboard: Modal closing, refreshing user data');
    try {
      await refreshUserData();
    } catch (error) {
      console.error('UserDashboard: Error refreshing user data:', error);
    }
  };

  console.log('UserDashboard: Rendering main dashboard');

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY;
    const distance = currentY - startY;
    
    if (distance > 0 && window.scrollY === 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance * 0.5, 80));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > 60) {
      setIsRefreshing(true);
      try {
        await refreshUserData();
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 1000);
      } catch (error) {
        console.error('Refresh error:', error);
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  return (
    <SafariErrorBoundary>
      <div 
        className="min-h-screen bg-gray-50 pb-20"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transform: `translateY(${pullDistance * 0.3}px)` }}
      >
        {/* Pull to refresh indicator */}
        {pullDistance > 0 && (
          <div 
            className="fixed top-0 left-0 right-0 flex items-center justify-center bg-blue-500 text-white transition-all duration-200 z-50"
            style={{ height: `${pullDistance}px`, opacity: pullDistance / 80 }}
          >
            <div className="text-sm">
              {isRefreshing ? '🔄 Refreshing...' : pullDistance > 60 ? '↓ Release to refresh' : '↓ Pull to refresh'}
            </div>
          </div>
        )}
        <div className="max-w-6xl mx-auto p-4 lg:p-6">
          <DashboardHeader />
          
          <div className="space-y-6">
            <BalanceCard />
            <ActionButtons
              onDomesticTransfer={handleDomesticTransfer}
              onInternationalTransfer={handleInternationalTransfer}
              onCheckDeposit={handleCheckDeposit}
              onTransactionHistory={handleTransactionHistory}
              disabled={false}
            />
            <RecentTransactions />
          </div>
        </div>

        <BottomNavigation />

        <React.Fragment>
          <TransferModal 
            isOpen={showTransfer} 
            onClose={() => {
              console.log('UserDashboard: Transfer modal closing');
              setShowTransfer(false);
              handleModalClose();
            }} 
            type={transferType}
          />
          <CheckDepositModal
            isOpen={showCheckDeposit}
            onClose={() => {
              console.log('UserDashboard: Check deposit modal closing');
              setShowCheckDeposit(false);
              handleModalClose();
            }}
          />
        </React.Fragment>

        <TransactionHistory
          isOpen={showTransactionHistory}
          onClose={() => {
            console.log('UserDashboard: Transaction history closing');
            setShowTransactionHistory(false);
          }}
        />
      </div>
    </SafariErrorBoundary>
  );
};

export default UserDashboard;
