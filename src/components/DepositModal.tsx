
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { doc, updateDoc, getDoc, addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, getCurrencySymbol } from '@/utils/currency';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: () => void;
}

const DepositModal = ({ isOpen, onClose, userId, onSuccess }: DepositModalProps) => {
  const [amount, setAmount] = useState('');
  const [senderName, setSenderName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const { toast } = useToast();

  // Fetch user data to get currency symbol
  React.useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        try {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };
    fetchUserData();
  }, [userId]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const depositAmount = parseFloat(amount);
      if (depositAmount <= 0) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid amount.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (!senderName.trim()) {
        toast({
          title: "Sender Name Required",
          description: "Please enter the sender's name.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (!purpose.trim()) {
        toast({
          title: "Purpose Required",
          description: "Please enter the purpose of the deposit.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Get current user data
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const newBalance = (userData.balance || 0) + depositAmount;

      // Update user balance
      await updateDoc(doc(db, 'users', userId), {
        balance: newBalance
      });

      // Determine transaction timestamp
      let transactionTimestamp;
      if (customDate && customTime) {
        // Create custom timestamp from admin input
        const dateTimeString = `${customDate}T${customTime}:00`;
        const customDateTime = new Date(dateTimeString);
        transactionTimestamp = Timestamp.fromDate(customDateTime);
      } else {
        // Use current timestamp
        transactionTimestamp = serverTimestamp();
      }

      // Create transaction record with sender name, purpose, and custom/current timestamp
      await addDoc(collection(db, 'transactions'), {
        userId: userId,
        type: 'Deposit',
        amount: depositAmount,
        status: 'completed',
        reference: 'DEP' + Date.now().toString(),
        senderName: senderName.trim(),
        purpose: purpose.trim(),
        timestamp: transactionTimestamp,
        createdAt: transactionTimestamp
      });

      const dateTimeInfo = customDate && customTime 
        ? ` with date/time set to ${customDate} ${customTime}`
        : '';

      toast({
        title: "Deposit Successful",
        description: `${formatCurrency(depositAmount, userData)} has been deposited from ${senderName}${dateTimeInfo}.`
      });

      onSuccess();
      onClose();
      setAmount('');
      setSenderName('');
      setPurpose('');
      setCustomDate('');
      setCustomTime('');
    } catch (error) {
      console.error('Deposit error:', error);
      toast({
        title: "Deposit Failed",
        description: "An error occurred while processing the deposit.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handleClose = () => {
    setAmount('');
    setSenderName('');
    setPurpose('');
    setCustomDate('');
    setCustomTime('');
    onClose();
  };

  // Get current date and time for default values
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Make Deposit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleDeposit} className="space-y-4">
          <div>
            <Label htmlFor="senderName">Sender Name *</Label>
            <Input
              id="senderName"
              type="text"
              placeholder="Enter sender's full name"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="purpose">Purpose of Deposit *</Label>
            <Textarea
              id="purpose"
              placeholder="Enter the purpose/reason for this deposit"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              required
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="amount">Deposit Amount ({getCurrencySymbol(userData)}) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="border-t pt-4">
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              Transaction Date & Time (Optional)
            </Label>
            <p className="text-xs text-gray-500 mb-3">
              Leave blank to use current date/time, or specify custom date/time for the transaction.
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="customDate" className="text-xs">Date</Label>
                <Input
                  id="customDate"
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  max={currentDate}
                />
              </div>
              
              <div>
                <Label htmlFor="customTime" className="text-xs">Time</Label>
                <Input
                  id="customTime"
                  type="time"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Processing...' : 'Deposit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DepositModal;
