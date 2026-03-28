
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { addDoc, collection, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useToast } from '@/hooks/use-toast';
import { Zap, Wifi, Phone, Car, Home, CreditCard, Gamepad2 } from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';

const Payments = () => {
  const { currentUser, userData, refreshUserData } = useAuth();
  const { toast } = useToast();
  const [selectedBillType, setSelectedBillType] = useState('');
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const billTypes = [
    { id: 'electricity', name: 'Electricity', icon: Zap },
    { id: 'internet', name: 'Internet', icon: Wifi },
    { id: 'phone', name: 'Phone', icon: Phone },
    { id: 'gas', name: 'Gas', icon: Home },
    { id: 'water', name: 'Water', icon: Home },
    { id: 'insurance', name: 'Insurance', icon: Car },
    { id: 'credit_card', name: 'Credit Card', icon: CreditCard },
    { id: 'subscription', name: 'Subscription', icon: Gamepad2 },
  ];

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !userData) return;
    
    const paymentAmount = parseFloat(amount);
    if (paymentAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount.",
        variant: "destructive",
      });
      return;
    }

    if (paymentAmount > userData.balance) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough balance for this payment.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Create transaction record
      await addDoc(collection(db, 'transactions'), {
        userId: currentUser.uid,
        type: 'bill_payment',
        amount: paymentAmount,
        description: `${billTypes.find(b => b.id === selectedBillType)?.name} Bill Payment`,
        billType: selectedBillType,
        accountNumber: accountNumber,
        status: 'completed',
        timestamp: Timestamp.now()
      });

      // Update user balance
      const newBalance = userData.balance - paymentAmount;
      await updateDoc(doc(db, 'users', currentUser.uid), {
        balance: newBalance
      });

      await refreshUserData();

      toast({
        title: "Payment Successful",
        description: `Your ${billTypes.find(b => b.id === selectedBillType)?.name} bill payment has been processed.`,
      });

      // Reset form
      setSelectedBillType('');
      setAmount('');
      setAccountNumber('');
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  const selectedBill = billTypes.find(b => b.id === selectedBillType);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Bill Payments</h1>
        </div>

        {/* Quick Bill Types */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {billTypes.map((bill) => {
            const Icon = bill.icon;
            return (
              <button
                key={bill.id}
                onClick={() => setSelectedBillType(bill.id)}
                className={`p-3 rounded-lg border text-center transition-colors ${
                  selectedBillType === bill.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className="h-6 w-6 mx-auto mb-1" />
                <p className="text-xs">{bill.name}</p>
              </button>
            );
          })}
        </div>

        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {selectedBill && <selectedBill.icon className="h-5 w-5" />}
              {selectedBill ? `Pay ${selectedBill.name} Bill` : 'Select Bill Type'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <Label htmlFor="billType">Bill Type</Label>
                <Select value={selectedBillType} onValueChange={setSelectedBillType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bill type" />
                  </SelectTrigger>
                  <SelectContent>
                    {billTypes.map((bill) => (
                      <SelectItem key={bill.id} value={bill.id}>
                        {bill.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="accountNumber">Account/Reference Number</Label>
                <Input
                  id="accountNumber"
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Enter account or reference number"
                  required
                />
              </div>

              <div>
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              {userData && (
                <div className="text-sm text-gray-600">
                  Available Balance: ${userData.balance?.toFixed(2) || '0.00'}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full"
                disabled={loading || !selectedBillType || !amount || !accountNumber}
              >
                {loading ? 'Processing...' : 'Pay Bill'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Payments;
