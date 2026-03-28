
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { doc, updateDoc, addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import TransactionConfirmModal from './TransactionConfirmModal';
import TransactionPinModal from './TransactionPinModal';
import TransferReceiptModal from './TransferReceiptModal';
import { sendTransactionEmail } from '@/utils/emailNotifications';
import { formatCurrency, getCurrencySymbol } from '@/utils/currency';

interface PayBillsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PayBillsModal = ({ isOpen, onClose }: PayBillsModalProps) => {
  const { currentUser, userData } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [formData, setFormData] = useState({
    billType: '',
    serviceProvider: '',
    accountNumber: '',
    amount: ''
  });

  const billTypes = [
    'Electricity',
    'Water',
    'Gas',
    'Internet',
    'Cable TV',
    'Mobile Phone',
    'Insurance',
    'Credit Card'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !userData) return;

    const amount = parseFloat(formData.amount);
    if (amount <= 0 || amount > userData.balance) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount within your balance.",
        variant: "destructive"
      });
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmTransaction = () => {
    setShowConfirmModal(false);
    setShowPinModal(true);
  };

  const handlePinVerified = async () => {
    setShowPinModal(false);
    setLoading(true);
    setShowLoadingScreen(true);

    // Enhanced loading with multiple stages
    setTimeout(async () => {
      try {
        const amount = parseFloat(formData.amount);
        const reference = `BILL${Date.now()}${Math.floor(Math.random() * 1000)}`;
        const newBalance = userData.balance - amount;

        // Create transaction
        await addDoc(collection(db, 'transactions'), {
          userId: currentUser.uid,
          type: 'Bill Payment',
          billType: formData.billType,
          serviceProvider: formData.serviceProvider,
          accountNumber: formData.accountNumber,
          amount,
          reference,
          status: 'completed',
          timestamp: Timestamp.now(),
          createdAt: Timestamp.now()
        });

        // Update balance
        await updateDoc(doc(db, 'users', currentUser.uid), {
          balance: newBalance
        });

        // Send debit alert email
        await sendTransactionEmail('debit', userData, {
          amount,
          recipientName: formData.serviceProvider,
          description: `Bill Payment - ${formData.billType}`,
          newBalance
        });

        const receipt = {
          reference,
          type: 'Bill Payment',
          receiverName: formData.serviceProvider,
          receiverAccount: formData.accountNumber,
          bankName: formData.billType,
          amount,
          timestamp: new Date().toLocaleString(),
          status: 'Completed'
        };

        setReceiptData(receipt);
        setShowLoadingScreen(false);
        setShowReceiptModal(true);

        toast({
          title: "Bill Payment Successful",
          description: `Your ${formData.billType} bill of ${formatCurrency(amount, userData)} has been paid.`
        });

        setFormData({
          billType: '',
          serviceProvider: '',
          accountNumber: '',
          amount: ''
        });
      } catch (error) {
        console.error('Bill payment error:', error);
        setShowLoadingScreen(false);
        toast({
          title: "Payment Failed",
          description: "There was an error processing your payment.",
          variant: "destructive"
        });
      }

      setLoading(false);
    }, 3000); // 3 seconds loading
  };

  const handleCloseAll = () => {
    setShowReceiptModal(false);
    onClose();
  };

  const transactionDetails = {
    type: 'Bill Payment',
    receiverName: formData.serviceProvider,
    receiverAccount: formData.accountNumber,
    bankName: formData.billType,
    amount: parseFloat(formData.amount) || 0
  };

  return (
    <>
      {showLoadingScreen && <LoadingSpinner message="Processing Bill Payment..." />}
      
      <Dialog open={isOpen && !showLoadingScreen && !showConfirmModal && !showPinModal && !showReceiptModal} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Pay Bills
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="billType">Bill Type</Label>
              <Select value={formData.billType} onValueChange={(value) => setFormData({...formData, billType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select bill type" />
                </SelectTrigger>
                <SelectContent>
                  {billTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="serviceProvider">Service Provider</Label>
              <Input
                id="serviceProvider"
                value={formData.serviceProvider}
                onChange={(e) => setFormData({...formData, serviceProvider: e.target.value})}
                placeholder="e.g., ConEd, Verizon, etc."
                required
              />
            </div>

            <div>
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                value={formData.accountNumber}
                onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                required
              />
            </div>

            <div>
              <Label htmlFor="amount">Amount ({getCurrencySymbol(userData)})</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Available Balance: {formatCurrency(userData?.balance || 0, userData)}
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                Continue
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <TransactionConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmTransaction}
        transactionDetails={transactionDetails}
      />

      <TransactionPinModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={handlePinVerified}
        title="Authorize Payment"
      />

      {receiptData && (
        <TransferReceiptModal
          isOpen={showReceiptModal}
          onClose={handleCloseAll}
          receiptData={receiptData}
        />
      )}
    </>
  );
};

export default PayBillsModal;
