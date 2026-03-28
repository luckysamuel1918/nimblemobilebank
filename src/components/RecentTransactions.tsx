
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle } from 'lucide-react';
import TransactionLoadingSpinner from './TransactionLoadingSpinner';
import { formatCurrency } from '@/utils/currency';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
  createdAt: Date;
  reference: string;
  description?: string;
  purpose?: string;
  receiverAccount?: string;
  receiverName?: string;
  bankName?: string;
  senderName?: string;
  userId: string;
}

const RecentTransactions = () => {
  const { currentUser, userData } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    if (!currentUser) {
      console.log('RecentTransactions: No current user, clearing transactions');
      setTransactions([]);
      setLoading(false);
      return;
    }

    console.log('RecentTransactions: Fetching transactions for user:', currentUser.uid);
    setError(null);
    setLoading(true);
    
    try {
      // Simplified query to avoid index requirement - just filter by userId
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', currentUser.uid)
      );

      const querySnapshot = await getDocs(q);
      console.log('RecentTransactions: Query completed with', querySnapshot.docs.length, 'documents');
      
      if (querySnapshot.empty) {
        console.log('RecentTransactions: No transactions found');
        setTransactions([]);
        setLoading(false);
        return;
      }
      
      const transactionList = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('RecentTransactions: Processing transaction:', doc.id, data);
        
        return {
          id: doc.id,
          type: data.type || 'Transaction',
          amount: Number(data.amount) || 0,
          status: data.status || 'completed',
          timestamp: data.timestamp?.toDate() || data.createdAt?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          reference: data.reference || doc.id,
          description: data.description,
          purpose: data.purpose,
          receiverAccount: data.receiverAccount,
          receiverName: data.receiverName,
          bankName: data.bankName,
          senderName: data.senderName,
          userId: data.userId
        } as Transaction;
      });
      
      // Sort by timestamp descending and limit to 5 most recent
      const sortedTransactions = transactionList
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 5);
      
      console.log('RecentTransactions: Successfully processed', sortedTransactions.length, 'transactions');
      setTransactions(sortedTransactions);
      setLoading(false);
      setError(null);
      
    } catch (error: any) {
      console.error('RecentTransactions: Error fetching transactions:', error);
      setError('Failed to load transactions. Please try again.');
      setLoading(false);
      setTransactions([]);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentUser]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-700">Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary" className="bg-green-100 text-green-700">Completed</Badge>;
    }
  };

  const getTransactionIcon = (type: string) => {
    if (type.includes('Transfer') || type.includes('Withdrawal') || type.includes('Payment')) {
      return <ArrowUpRight className="h-4 w-4 text-red-500" />;
    }
    return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
  };

  const getDisplayText = (transaction: Transaction) => {
    if (transaction.purpose) {
      return transaction.purpose;
    }
    if (transaction.receiverName) {
      return `To ${transaction.receiverName}`;
    }
    if (transaction.senderName && transaction.type.includes('Deposit')) {
      return `From ${transaction.senderName}`;
    }
    return transaction.type || 'Transaction';
  };

  const getAccountInfo = (transaction: Transaction) => {
    if (transaction.receiverAccount) {
      return transaction.receiverAccount;
    }
    return transaction.reference;
  };

  const handleRetry = () => {
    console.log('RecentTransactions: Retrying to load transactions');
    fetchTransactions();
  };

  if (loading) {
    return <TransactionLoadingSpinner message="Loading Recent Transactions..." />;
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="text-red-500 mb-2">
              <XCircle className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm font-medium">{error}</p>
            </div>
            <button 
              onClick={handleRetry}
              className="text-sm text-primary hover:text-primary/80 hover:underline bg-primary/10 px-3 py-1 rounded transition-colors"
            >
              Try Again
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">No transactions yet</p>
            <p className="text-xs mt-1">Your transaction history will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">{getDisplayText(transaction)}</p>
                      {getStatusIcon(transaction.status)}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {transaction.timestamp.toLocaleDateString()} • {getAccountInfo(transaction)}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className={`text-sm font-medium ${
                    transaction.type.includes('Transfer') || transaction.type.includes('Withdrawal') || transaction.type.includes('Payment')
                      ? 'text-red-600' 
                      : 'text-green-600'
                   }`}>
                     {transaction.type.includes('Transfer') || transaction.type.includes('Withdrawal') || transaction.type.includes('Payment') ? '-' : '+'}
                     {formatCurrency(transaction.amount, userData)}
                   </p>
                  <div className="mt-1">
                    {getStatusBadge(transaction.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
