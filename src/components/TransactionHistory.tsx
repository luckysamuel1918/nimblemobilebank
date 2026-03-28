
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, orderBy, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { X, Download, RefreshCw, Receipt } from 'lucide-react';
import TransferReceiptModal from './TransferReceiptModal';
import { formatCurrency } from '@/utils/currency';

interface TransactionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

const TransactionHistory = ({ isOpen, onClose }: TransactionHistoryProps) => {
  const { currentUser, userData } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchTransactions();
      // Set up real-time listener for transactions
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', currentUser.uid)
      );
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const transactionsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.() || new Date(doc.data().timestamp) || new Date()
        }));
        
        // Sort by timestamp descending (newest first)
        const sortedTransactions = transactionsData.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        setTransactions(sortedTransactions);
        console.log('Real-time transactions updated:', sortedTransactions.length);
      });

      return () => unsubscribe();
    }
  }, [isOpen, currentUser]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', currentUser!.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const transactionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || new Date(doc.data().timestamp) || new Date()
      }));
      
      // Sort by timestamp descending (newest first)
      const sortedTransactions = transactionsData.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      setTransactions(sortedTransactions);
      console.log('Transactions fetched:', sortedTransactions.length);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
    setLoading(false);
  };

  const handleViewReceipt = (transaction: any) => {
    // Create consistent receipt data that matches the main receipt format
    const receiptData = {
      reference: transaction.reference,
      amount: transaction.amount,
      receiverName: transaction.receiverName,
      receiverAccount: transaction.receiverAccount,
      bankName: transaction.bankName,
      purpose: transaction.purpose,
      type: transaction.type,
      timestamp: transaction.timestamp.toLocaleString(),
      status: transaction.status || 'Completed',
      senderName: userData ? `${userData.firstName} ${userData.lastName}` : 'N/A',
      senderAccount: userData?.accountNumber || 'N/A',
      iban: transaction.iban,
      swift: transaction.swift,
      country: transaction.country,
      routingNumber: transaction.routingNumber
    };

    setSelectedTransaction(receiptData);
    setShowReceipt(true);
  };

  const generateTextReceipt = (transaction: any) => {
    const receiptContent = `
WEST COAST TRUST BANK
Transaction Receipt
===================

Transaction ID: ${transaction.reference}
Date: ${transaction.timestamp.toLocaleDateString()}
Time: ${transaction.timestamp.toLocaleTimeString()}

Transfer Type: ${transaction.type}
Amount: ${formatCurrency(transaction.amount, userData)}
Status: ${transaction.status || 'Completed'}

${transaction.purpose ? `Purpose: ${transaction.purpose}` : ''}
${transaction.receiverName ? `Receiver: ${transaction.receiverName}` : ''}
${transaction.receiverAccount ? `Account: ${transaction.receiverAccount}` : ''}
${transaction.bankName ? `Bank: ${transaction.bankName}` : ''}
${transaction.iban ? `IBAN/SWIFT: ${transaction.iban}` : ''}
${transaction.country ? `Country: ${transaction.country}` : ''}

Thank you for banking with West Coast Trust Bank
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt_${transaction.reference}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReceiptClose = () => {
    setShowReceipt(false);
    setSelectedTransaction(null);
  };

  const getDisplayTitle = (transaction: any) => {
    if (transaction.purpose) {
      return transaction.purpose;
    }
    if (transaction.receiverName) {
      return `Payment to ${transaction.receiverName}`;
    }
    return 'Transaction';
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Transaction History
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={fetchTransactions} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">Loading transactions...</div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No transactions found
              </div>
            ) : (
              transactions.map((transaction) => (
                <Card key={transaction.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium">{getDisplayTitle(transaction)}</h3>
                          <Badge variant={transaction.status === 'completed' ? 'default' : 'destructive'}>
                            {transaction.status || 'completed'}
                          </Badge>
                        </div>
                        
                         <div className="space-y-1 text-sm text-gray-600">
                           <p><strong>Amount:</strong> {formatCurrency(transaction.amount, userData)}</p>
                           <p><strong>Reference:</strong> {transaction.reference}</p>
                          <p><strong>Date:</strong> {transaction.timestamp.toLocaleDateString()} {transaction.timestamp.toLocaleTimeString()}</p>
                          
                          {transaction.receiverName && (
                            <p><strong>Receiver:</strong> {transaction.receiverName}</p>
                          )}
                          {transaction.receiverAccount && (
                            <p><strong>Account:</strong> {transaction.receiverAccount}</p>
                          )}
                          {transaction.bankName && (
                            <p><strong>Bank:</strong> {transaction.bankName}</p>
                          )}
                          {transaction.purpose && (
                            <p><strong>Purpose:</strong> {transaction.purpose}</p>
                          )}
                          {transaction.billType && (
                            <p><strong>Bill Type:</strong> {transaction.billType}</p>
                          )}
                          {transaction.serviceProvider && (
                            <p><strong>Service Provider:</strong> {transaction.serviceProvider}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {transaction.type?.includes('Transfer') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewReceipt(transaction)}
                          >
                            <Receipt className="h-4 w-4 mr-1" />
                            Receipt
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateTextReceipt(transaction)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Text
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <TransferReceiptModal
        isOpen={showReceipt}
        onClose={handleReceiptClose}
        receiptData={selectedTransaction}
      />
    </>
  );
};

export default TransactionHistory;
