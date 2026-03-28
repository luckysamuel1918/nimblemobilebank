import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X, Save, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { formatCurrency, getCurrencySymbol } from '@/utils/currency';

interface TransactionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  onSuccess: () => void;
}

interface TransactionData {
  id: string;
  userId: string;
  type: string;
  amount: number;
  receiverName: string;
  senderName?: string;
  status: string;
  timestamp: any;
  reference: string;
  purpose?: string;
  bankName?: string;
  receiverAccount?: string;
}

const TransactionEditModal = ({ isOpen, onClose, transactionId, onSuccess }: TransactionEditModalProps) => {
  const [transaction, setTransaction] = useState<TransactionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [originalTransaction, setOriginalTransaction] = useState<TransactionData | null>(null);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (isOpen && transactionId) {
      fetchTransaction();
    }
  }, [isOpen, transactionId]);

  const fetchTransaction = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'transactions', transactionId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() } as TransactionData;
        setTransaction(data);
        setOriginalTransaction(data);
        
        // Fetch user data for currency formatting
        if (data.userId) {
          const userDoc = await getDoc(doc(db, 'users', data.userId));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        }
      } else {
        toast({
          title: 'Error',
          description: 'Transaction not found.',
          variant: 'destructive',
        });
        onClose();
      }
    } catch (error) {
      console.error('Error fetching transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to load transaction details.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const adjustUserBalance = async (userId: string, oldAmount: number, newAmount: number, oldStatus: string, newStatus: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        throw new Error('User not found');
      }

      const userData = userSnap.data();
      let currentBalance = userData.balance || 0;

      // If old transaction was completed, add the amount back
      if (oldStatus === 'completed') {
        currentBalance += oldAmount;
      }

      // If new transaction is completed, subtract the amount
      if (newStatus === 'completed') {
        currentBalance -= newAmount;
      }

      await updateDoc(userRef, { balance: currentBalance });
      
      console.log(`Balance adjusted for user ${userId}: ${userData.balance} -> ${currentBalance}`);
    } catch (error) {
      console.error('Error adjusting user balance:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!transaction || !originalTransaction) return;

    setSaving(true);
    try {
      const updates: any = {
        type: transaction.type,
        amount: transaction.amount,
        receiverName: transaction.receiverName,
        senderName: transaction.senderName || '',
        status: transaction.status,
        purpose: transaction.purpose || '',
        bankName: transaction.bankName || '',
        receiverAccount: transaction.receiverAccount || '',
        timestamp: transaction.timestamp
      };

      // Update the transaction
      await updateDoc(doc(db, 'transactions', transactionId), updates);

      // Adjust user balance if amount or status changed
      if (originalTransaction.amount !== transaction.amount || originalTransaction.status !== transaction.status) {
        await adjustUserBalance(
          transaction.userId,
          originalTransaction.amount,
          transaction.amount,
          originalTransaction.status,
          transaction.status
        );
      }

      toast({
        title: 'Success',
        description: 'Transaction updated successfully.',
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to update transaction.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toISOString().slice(0, 16);
    }
    
    if (timestamp.toDate) {
      return timestamp.toDate().toISOString().slice(0, 16);
    }
    
    return new Date(timestamp).toISOString().slice(0, 16);
  };

  const handleTimestampChange = (value: string) => {
    if (!transaction) return;
    
    const newDate = new Date(value);
    setTransaction({
      ...transaction,
      timestamp: {
        seconds: Math.floor(newDate.getTime() / 1000),
        nanoseconds: 0
      }
    });
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95%] max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Edit Transaction
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading transaction...
          </div>
        ) : transaction ? (
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reference">Reference</Label>
                <Input
                  id="reference"
                  value={transaction.reference}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Transaction Type</Label>
                <Input
                  id="type"
                  value={transaction.type}
                  onChange={(e) => setTransaction({...transaction, type: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ({getCurrencySymbol(userData)})</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={transaction.amount}
                  onChange={(e) => setTransaction({...transaction, amount: parseFloat(e.target.value) || 0})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={transaction.status}
                  onValueChange={(value) => setTransaction({...transaction, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="senderName">Sender Name</Label>
                <Input
                  id="senderName"
                  value={transaction.senderName || ''}
                  onChange={(e) => setTransaction({...transaction, senderName: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="receiverName">Receiver Name</Label>
                <Input
                  id="receiverName"
                  value={transaction.receiverName}
                  onChange={(e) => setTransaction({...transaction, receiverName: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  value={transaction.bankName || ''}
                  onChange={(e) => setTransaction({...transaction, bankName: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="receiverAccount">Receiver Account</Label>
                <Input
                  id="receiverAccount"
                  value={transaction.receiverAccount || ''}
                  onChange={(e) => setTransaction({...transaction, receiverAccount: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timestamp">Date & Time</Label>
              <Input
                id="timestamp"
                type="datetime-local"
                value={formatTimestamp(transaction.timestamp)}
                onChange={(e) => handleTimestampChange(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose/Description</Label>
              <Textarea
                id="purpose"
                value={transaction.purpose || ''}
                onChange={(e) => setTransaction({...transaction, purpose: e.target.value})}
                rows={3}
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">Balance Adjustment Notice</h4>
              <p className="text-sm text-yellow-700">
                Changing the amount or status will automatically adjust the user's account balance:
              </p>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                <li>• Original: {formatCurrency(originalTransaction?.amount || 0, userData)} ({originalTransaction?.status})</li>
                <li>• New: {formatCurrency(transaction.amount, userData)} ({transaction.status})</li>
                <li>• Only "completed" transactions affect account balance</li>
              </ul>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Transaction not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TransactionEditModal;