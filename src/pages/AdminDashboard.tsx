
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  DollarSign, 
  CreditCard, 
  MessageCircle, 
  LogOut,
  Eye,
  Ban,
  CheckCircle,
  PlusCircle,
  Bell,
  AlertTriangle,
  RefreshCw,
  CheckIcon
} from 'lucide-react';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { toast } from '@/hooks/use-toast';
import UserManagement from '@/components/UserManagement';
import ChatModal from '@/components/ChatModal';
import LoanApproval from '@/components/LoanApproval';
import DepositModal from '@/components/DepositModal';
import TransactionEditModal from '@/components/TransactionEditModal';
import UserEditModal from '@/components/UserEditModal';

interface UserData {
  id: string;
  uid?: string;
  uniqueId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  accountNumber?: string;
  balance?: number;
  status?: string;
  createdAt?: any;
}

interface TransactionData {
  id: string;
  type?: string;
  amount?: number;
  status?: string;
  reference?: string;
  receiverName?: string;
  timestamp?: any;
}

interface LoanData {
  id: string;
  status?: string;
  amount?: number;
  purpose?: string;
  userId?: string;
}

const AdminDashboard = () => {
  console.log('AdminDashboard: Starting render - Safari Compatible Mode');
  
  const { logout, currentUser } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loans, setLoans] = useState<LoanData[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [showChat, setShowChat] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showTransactionEdit, setShowTransactionEdit] = useState(false);
  const [showUserEdit, setShowUserEdit] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<string>('');
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [safariCompatible, setSafariCompatible] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBalance: 0,
    totalTransactions: 0,
    pendingLoans: 0
  });

  // Safari Detection and Compatibility Check
  useEffect(() => {
    console.log('AdminDashboard: Safari compatibility check starting');
    
    const userAgent = navigator.userAgent || '';
    const isSafari = /Safari/.test(userAgent) && /Apple Computer/.test(navigator.vendor || '');
    
    console.log('Browser detection:', {
      userAgent,
      isSafari,
      vendor: navigator.vendor,
      cookieEnabled: navigator.cookieEnabled
    });

    // Test Safari features
    const testSafariFeatures = () => {
      try {
        // Test localStorage in Safari (can fail in private browsing)
        if (typeof Storage !== 'undefined') {
          localStorage.setItem('__safari_test__', 'test');
          const testValue = localStorage.getItem('__safari_test__');
          localStorage.removeItem('__safari_test__');
          
          if (testValue !== 'test') {
            console.warn('Safari: localStorage test failed');
            return false;
          }
        } else {
          console.warn('Safari: Storage not available');
        }

        // Test Promise support
        if (typeof Promise === 'undefined') {
          console.error('Safari: Promise not supported');
          return false;
        }

        // Test fetch API
        if (typeof fetch === 'undefined') {
          console.error('Safari: fetch API not available');
          return false;
        }

        console.log('Safari: All compatibility tests passed');
        return true;
      } catch (error) {
        console.error('Safari: Compatibility test failed:', error);
        return false;
      }
    };

    const isCompatible = testSafariFeatures();
    setSafariCompatible(isCompatible);
    
    if (!isCompatible) {
      setError('Safari compatibility issue detected. Please try refreshing the page or using a different browser.');
    }
  }, []);

  // Simplified data loading without problematic Firebase listeners
  useEffect(() => {
    if (!safariCompatible) return;

    console.log('AdminDashboard: Loading data (Safari compatible mode)');
    
    const loadAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load data sequentially to avoid Safari timing issues
        console.log('Loading users...');
        await fetchBankUsers();
        
        console.log('Loading transactions...');
        await fetchTransactions();
        
        console.log('Loading loans...');
        await fetchLoans();
        
        // Load messages count without real-time listener (Safari compatible)
        console.log('Loading message count...');
        await fetchMessageCount();
        
        console.log('All data loaded successfully');
        
      } catch (error) {
        console.error('AdminDashboard: Error loading data:', error);
        setError(`Failed to load dashboard data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    // Add delay for Safari to ensure proper initialization
    const loadTimeout = setTimeout(loadAllData, 100);
    
    return () => clearTimeout(loadTimeout);
  }, [safariCompatible]);

  // Safari-compatible message count fetching (no real-time listener)
  const fetchMessageCount = async () => {
    try {
      console.log('Fetching message count (Safari compatible)');
      
      // Simple query without composite index requirement
      const messagesSnapshot = await getDocs(collection(db, 'supportChats'));
      const messages = messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Filter unread user messages locally
      const unreadUserMessages = messages.filter((msg: any) => 
        msg.sender === 'user' && !msg.read
      );
      
      console.log('Unread messages found:', unreadUserMessages.length);
      setUnreadMessages(unreadUserMessages.length);
      
    } catch (error) {
      console.warn('AdminDashboard: Could not load messages:', error);
      // Don't set error state for messages, just log and continue
      setUnreadMessages(0);
    }
  };

  const fetchBankUsers = async () => {
    try {
      console.log('AdminDashboard: Fetching bank users');
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData: UserData[] = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Filter for bank users - users with our system's unique ID
      const bankUsers = usersData.filter(user => 
        user.uid && (
          user.uniqueId?.startsWith('WTB-') || // New unique ID system
          user.accountNumber // Legacy account number system
        )
      );
      
      console.log('AdminDashboard: Bank users loaded:', bankUsers.length);
      setUsers(bankUsers);
      
      const totalBalance = bankUsers.reduce((sum, user) => sum + (user.balance || 0), 0);
      setStats(prev => ({
        ...prev,
        totalUsers: bankUsers.length,
        totalBalance
      }));
    } catch (error) {
      console.error('AdminDashboard: Error fetching bank users:', error);
      throw error;
    }
  };

  const fetchTransactions = async () => {
    try {
      console.log('AdminDashboard: Fetching transactions');
      const transactionsSnapshot = await getDocs(collection(db, 'transactions'));
      const transactionsData: TransactionData[] = transactionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('AdminDashboard: Transactions loaded:', transactionsData.length);
      setTransactions(transactionsData);
      setStats(prev => ({
        ...prev,
        totalTransactions: transactionsData.filter(t => t.status === 'completed').length
      }));
    } catch (error) {
      console.error('AdminDashboard: Error fetching transactions:', error);
      throw error;
    }
  };

  const fetchLoans = async () => {
    try {
      console.log('AdminDashboard: Fetching loans');
      const loansSnapshot = await getDocs(collection(db, 'loanApplications'));
      const loansData: LoanData[] = loansSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('AdminDashboard: Loans loaded:', loansData.length);
      setLoans(loansData);
      setStats(prev => ({
        ...prev,
        pendingLoans: loansData.filter(l => l.status === 'pending').length
      }));
    } catch (error) {
      console.error('AdminDashboard: Error fetching loans:', error);
      throw error;
    }
  };

  const handleUserAction = async (userId: string, action: 'suspend' | 'activate') => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        status: action === 'suspend' ? 'suspended' : 'active'
      });
      await fetchBankUsers();
      toast({
        title: "User updated",
        description: `User has been ${action}d successfully.`,
      });
    } catch (error) {
      console.error('AdminDashboard: Error updating user status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status.",
        variant: "destructive"
      });
    }
  };

  const openChat = (userId: string) => {
    setSelectedUser(userId);
    setShowChat(true);
  };

  const openDeposit = (userId: string) => {
    setSelectedUser(userId);
    setShowDeposit(true);
  };

  const openTransactionEdit = (transactionId: string) => {
    setSelectedTransaction(transactionId);
    setShowTransactionEdit(true);
  };

  const openUserEdit = (userId: string) => {
    setSelectedUser(userId);
    setShowUserEdit(true);
  };

  // Safari compatibility check loading
  if (!safariCompatible && !error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking Safari Compatibility...</p>
          <p className="text-xs text-gray-500 mt-2">Verifying browser features...</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Admin Dashboard...</p>
          <p className="text-xs text-gray-500 mt-2">
            Browser: {navigator.userAgent.includes('Safari') ? 'Safari' : 'Other'} | 
            User: {currentUser?.email}
          </p>
        </div>
      </div>
    );
  }

  // Error state with Safari-specific information
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Admin Dashboard Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="text-xs text-gray-500 mb-4 p-2 bg-gray-100 rounded">
              <strong>Browser:</strong> {navigator.userAgent}<br/>
              <strong>User:</strong> {currentUser?.email || 'Not logged in'}<br/>
              <strong>Safari:</strong> {/Safari/.test(navigator.userAgent) ? 'Yes' : 'No'}<br/>
              <strong>Time:</strong> {new Date().toLocaleString()}
            </div>
            <Button 
              onClick={() => {
                setError(null);
                setLoading(true);
                setSafariCompatible(false);
                window.location.reload();
              }}
              className="w-full mb-2"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Dashboard
            </Button>
            <Button 
              onClick={() => {
                try {
                  localStorage.clear();
                  sessionStorage.clear();
                } catch (e) {
                  console.error('Failed to clear storage:', e);
                }
                window.location.href = '/admin';
              }}
              variant="outline"
              className="w-full"
            >
              Clear Data & Login Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('AdminDashboard: Rendering main dashboard interface (Safari Compatible)');

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Welcome Header with Safari Status */}
        <div className="mb-4 sm:mb-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckIcon className="h-6 w-6 text-green-300" />
                    <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard Active!</h1>
                  </div>
                  <p className="text-sm sm:text-base text-blue-100 mb-1">
                    Successfully logged in to Nimble Bank Administration
                  </p>
                  <p className="text-xs text-blue-200">
                    Admin: {currentUser?.email || 'admin@bank.com'} | 
                    Browser: {navigator.userAgent.includes('Safari') ? 'Safari (Compatible)' : 'Other'} | 
                    Status: ✓ Online
                  </p>
                  <div className="text-xs text-blue-200 mt-1">
                    Last Updated: {new Date().toLocaleTimeString()} | 
                    Data: {users.length} Users, {transactions.length} Transactions | 
                    Messages: {unreadMessages} Unread
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Message Notification Bell */}
                  {unreadMessages > 0 && (
                    <div className="relative">
                      <Bell className="h-5 w-5 text-white" />
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        {unreadMessages > 9 ? '9+' : unreadMessages}
                      </Badge>
                    </div>
                  )}
                  <Button onClick={logout} variant="secondary" size="sm" className="text-xs sm:text-sm">
                    <LogOut className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    Logout
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards - Mobile Responsive */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Users</p>
                  <p className="text-lg sm:text-2xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Balance</p>
                  <p className="text-lg sm:text-2xl font-bold">${stats.totalBalance.toLocaleString()}</p>
                </div>
                <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Transactions</p>
                  <p className="text-lg sm:text-2xl font-bold">{stats.totalTransactions}</p>
                </div>
                <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Unread Messages</p>
                  <p className="text-lg sm:text-2xl font-bold">{unreadMessages}</p>
                </div>
                <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Mobile Responsive */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 text-xs sm:text-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="loans">Loans</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Recent Bank Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 sm:space-y-3">
                    {users.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm sm:text-base font-medium">{user.firstName || 'N/A'} {user.lastName || ''}</p>
                          <p className="text-xs sm:text-sm text-gray-600">{user.email || 'N/A'}</p>
                          <p className="text-xs text-gray-600">ID: {user.accountNumber}</p>
                        </div>
                        <Badge variant={user.status === 'active' ? 'default' : 'destructive'} className="text-xs">
                          {user.status || 'unknown'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 sm:space-y-3">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm sm:text-base font-medium">{transaction.type || 'N/A'}</p>
                          <p className="text-xs sm:text-sm text-gray-600">${transaction.amount?.toLocaleString() || '0.00'}</p>
                        </div>
                        <Badge variant="default" className="text-xs">
                          {transaction.status || 'unknown'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <UserManagement 
              users={users}
              onUserAction={handleUserAction}
              onChat={openChat}
              onDeposit={openDeposit}
              onEdit={openUserEdit}
            />
          </TabsContent>

          <TabsContent value="loans">
            <LoanApproval loans={loans} onLoanUpdate={fetchLoans} />
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">All Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="p-4 border rounded-lg bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                         onClick={() => openTransactionEdit(transaction.id)}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">{transaction.type}</p>
                          <p className="text-sm text-gray-600">{transaction.reference}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">${transaction.amount?.toLocaleString()}</p>
                          <Badge variant={
                            transaction.status === 'completed' ? 'default' : 
                            transaction.status === 'pending' ? 'secondary' : 
                            transaction.status === 'processing' ? 'outline' :
                            transaction.status === 'cancelled' ? 'destructive' : 'default'
                          }>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>To: {transaction.receiverName}</p>
                        {transaction.timestamp && (
                          <p>Date: {new Date(transaction.timestamp.seconds * 1000).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <ChatModal 
        isOpen={showChat} 
        onClose={() => setShowChat(false)} 
        targetUserId={selectedUser}
      />
      <DepositModal 
        isOpen={showDeposit} 
        onClose={() => setShowDeposit(false)} 
        userId={selectedUser}
        onSuccess={fetchBankUsers}
      />
      <TransactionEditModal 
        isOpen={showTransactionEdit} 
        onClose={() => setShowTransactionEdit(false)} 
        transactionId={selectedTransaction}
        onSuccess={() => {
          fetchTransactions();
          fetchBankUsers();
        }}
      />
      <UserEditModal 
        isOpen={showUserEdit} 
        onClose={() => setShowUserEdit(false)} 
        userId={selectedUser}
        onUserUpdated={fetchBankUsers}
      />
    </div>
  );
};

export default AdminDashboard;
