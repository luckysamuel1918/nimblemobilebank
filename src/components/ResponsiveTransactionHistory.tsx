
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, Monitor, Smartphone } from 'lucide-react';
import TransactionLoadingSpinner from './TransactionLoadingSpinner';
import { formatCurrency } from '@/utils/currency';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
  reference: string;
  purpose?: string;
  receiverName?: string;
  receiverAccount?: string;
  bankName?: string;
}

const ResponsiveTransactionHistory = () => {
  const { currentUser, userData } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deviceType, setDeviceType] = useState<'mobile' | 'desktop'>('desktop');
  const [forceDesktopMode, setForceDesktopMode] = useState(false);

  // Detect device type
  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isSmallScreen = window.innerWidth < 768;
      
      setDeviceType(isMobile || isSmallScreen ? 'mobile' : 'desktop');
      console.log('Device detected:', { isMobile, isSmallScreen, userAgent });
    };

    detectDevice();
    window.addEventListener('resize', detectDevice);
    return () => window.removeEventListener('resize', detectDevice);
  }, []);

  const fetchTransactions = async () => {
    if (!currentUser) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    console.log('Fetching all transactions for user:', currentUser.uid);
    setError(null);
    setLoading(true);
    
    try {
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', currentUser.uid),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      console.log('Query completed with', querySnapshot.docs.length, 'documents');
      
      const transactionList = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          type: data.type || 'Transaction',
          amount: Number(data.amount) || 0,
          status: data.status || 'completed',
          timestamp: data.timestamp?.toDate() || data.createdAt?.toDate() || new Date(),
          reference: data.reference || doc.id,
          purpose: data.purpose,
          receiverName: data.receiverName,
          receiverAccount: data.receiverAccount,
          bankName: data.bankName,
        } as Transaction;
      });
      
      setTransactions(transactionList);
      setLoading(false);
      setError(null);
      
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      setError('Failed to load transactions. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentUser]);

  const handleRetry = () => {
    fetchTransactions();
  };

  const toggleDesktopMode = () => {
    setForceDesktopMode(!forceDesktopMode);
  };

  const isDesktopView = deviceType === 'desktop' || forceDesktopMode;

  if (loading) {
    return <TransactionLoadingSpinner message="Loading Transaction History..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="text-center py-6">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Transactions</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={handleRetry}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Device Detection and Mode Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          {deviceType === 'mobile' ? (
            <Smartphone className="h-4 w-4" />
          ) : (
            <Monitor className="h-4 w-4" />
          )}
          <span>
            Detected: {deviceType === 'mobile' ? 'Mobile Device' : 'Desktop'}
            {forceDesktopMode && ' (Desktop Mode)'}
          </span>
        </div>
        
        {deviceType === 'mobile' && (
          <Button
            variant={forceDesktopMode ? "default" : "outline"}
            size="sm"
            onClick={toggleDesktopMode}
          >
            {forceDesktopMode ? 'Mobile View' : 'Desktop View'}
          </Button>
        )}
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No transactions found</p>
              <p className="text-sm mt-1">Your transaction history will appear here</p>
            </div>
          ) : isDesktopView ? (
            // Desktop Table View
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Date</th>
                    <th className="text-left py-3 px-2">Description</th>
                    <th className="text-left py-3 px-2">Reference</th>
                    <th className="text-left py-3 px-2">Status</th>
                    <th className="text-right py-3 px-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 text-sm">
                        {transaction.timestamp.toLocaleDateString()}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          {transaction.type.includes('Transfer') || transaction.type.includes('Withdrawal') ? (
                            <ArrowUpRight className="h-4 w-4 text-red-500" />
                          ) : (
                            <ArrowDownLeft className="h-4 w-4 text-green-500" />
                          )}
                          <div>
                            <p className="text-sm font-medium">
                              {transaction.purpose || transaction.receiverName || transaction.type}
                            </p>
                            {transaction.bankName && (
                              <p className="text-xs text-gray-500">{transaction.bankName}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-600">
                        {transaction.reference}
                      </td>
                      <td className="py-3 px-2">
                        <Badge
                          variant={transaction.status === 'completed' ? 'secondary' : 
                                   transaction.status === 'pending' ? 'outline' : 'destructive'}
                          className={
                            transaction.status === 'completed' ? 'bg-green-100 text-green-700' :
                            transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''
                          }
                        >
                          {transaction.status}
                        </Badge>
                      </td>
                      <td className={`py-3 px-2 text-right font-medium ${
                        transaction.type.includes('Transfer') || transaction.type.includes('Withdrawal') || transaction.type.includes('Payment')
                          ? 'text-red-600' 
                          : 'text-green-600'
                       }`}>
                         {transaction.type.includes('Transfer') || transaction.type.includes('Withdrawal') || transaction.type.includes('Payment') ? '-' : '+'}
                         {formatCurrency(transaction.amount, userData)}
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // Mobile Card View
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex-shrink-0">
                        {transaction.type.includes('Transfer') || transaction.type.includes('Withdrawal') ? (
                          <ArrowUpRight className="h-5 w-5 text-red-500" />
                        ) : (
                          <ArrowDownLeft className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          {transaction.purpose || transaction.receiverName || transaction.type}
                        </p>
                        <p className="text-xs text-gray-500">
                          {transaction.timestamp.toLocaleDateString()} • {transaction.reference}
                        </p>
                        {transaction.bankName && (
                          <p className="text-xs text-gray-500">{transaction.bankName}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`font-medium ${
                        transaction.type.includes('Transfer') || transaction.type.includes('Withdrawal') || transaction.type.includes('Payment')
                          ? 'text-red-600' 
                          : 'text-green-600'
                       }`}>
                         {transaction.type.includes('Transfer') || transaction.type.includes('Withdrawal') || transaction.type.includes('Payment') ? '-' : '+'}
                         {formatCurrency(transaction.amount, userData)}
                       </p>
                      <div className="mt-1">
                        <Badge
                          variant={transaction.status === 'completed' ? 'secondary' : 
                                   transaction.status === 'pending' ? 'outline' : 'destructive'}
                          className={
                            transaction.status === 'completed' ? 'bg-green-100 text-green-700' :
                            transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''
                          }
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResponsiveTransactionHistory;
