import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { X, User, CreditCard, Building2, Hash, Globe, DollarSign, FileText } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import TransferReceiptModal from './TransferReceiptModal';
import TransactionConfirmModal from './TransactionConfirmModal';
import TransactionPinModal from './TransactionPinModal';
import OtpVerificationModal from './OtpVerificationModal';
import TransactionLoadingSpinner from './TransactionLoadingSpinner';
import { countries } from '@/data/countries';
import { sendTransactionEmail } from '@/utils/emailNotifications';
import { initEmailJS } from '@/config/emailjs';
import { formatCurrency, getCurrencySymbol } from '@/utils/currency';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'domestic' | 'international';
}

// Popular US banks for domestic transfers
const domesticBanks = [
  'Chase Bank',
  'Bank of America',
  'Wells Fargo',
  'Citibank',
  'U.S. Bank',
  'PNC Bank',
  'Capital One',
  'TD Bank',
  'Bank of New York Mellon',
  'State Street Corporation',
  'American Express',
  'Ally Bank',
  'USAA',
  'Charles Schwab Bank',
  'Goldman Sachs Bank',
  'HSBC Holdings',
  'Lloyds Bank Plc',
  'Standard Chartered Bank',
  'Other'
];

const TransferModal = ({ isOpen, onClose, type }: TransferModalProps) => {
  const { currentUser, userData } = useAuth();
  const [formData, setFormData] = useState({
    receiverName: '',
    receiverAccount: '',
    bankName: '',
    routingNumber: '',
    iban: '',
    swift: '',
    country: '',
    amount: '',
    purpose: '',
  });
  const [loading, setLoading] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  React.useEffect(() => {
    initEmailJS();
  }, []);

  const generateReference = () => {
    const timestamp = Date.now().toString(36);
    const randomId = Math.random().toString(36).substring(2, 7);
    return `TXN-${timestamp}-${randomId}`.toUpperCase();
  };

  const handleReceiptClose = () => {
    setShowReceipt(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid amount.',
        variant: 'destructive',
      });
      return;
    }

    if (!currentUser || !userData) {
      toast({
        title: 'Error',
        description: 'User not authenticated.',
        variant: 'destructive',
      });
      return;
    }

    if (amount > userData.balance) {
      toast({
        title: 'Insufficient Funds',
        description: 'Amount exceeds your available balance.',
        variant: 'destructive',
      });
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmTransaction = () => {
    setShowConfirmModal(false);
    setShowOtpModal(true);
  };

  const handleOtpVerified = async () => {
    setShowOtpModal(false);
    setLoading(true);
    setShowLoadingScreen(true);

    setTimeout(async () => {
      try {
        const amount = parseFloat(formData.amount);
        const reference = generateReference();
        const timestamp = new Date().toLocaleString();
        const newBalance = userData.balance - amount;

        const transactionData = {
          userId: currentUser.uid,
          type: type === 'domestic' ? 'Domestic Transfer' : 'International Transfer',
          amount: amount,
          receiverName: formData.receiverName,
          receiverAccount: formData.receiverAccount,
          bankName: formData.bankName,
          routingNumber: formData.routingNumber,
          iban: formData.iban,
          swift: formData.swift,
          country: formData.country,
          purpose: formData.purpose,
          reference: reference,
          timestamp: serverTimestamp(),
          status: 'completed',
        };

        await addDoc(collection(db, 'transactions'), transactionData);

        // Update user's balance
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          balance: newBalance,
        });

        // Send debit alert email
        await sendTransactionEmail('debit', userData, {
          amount,
          recipientName: formData.receiverName,
          description: `${type === 'domestic' ? 'Domestic' : 'International'} Transfer to ${formData.receiverName}`,
          newBalance
        });

        toast({
          title: 'Success',
          description: 'Transfer completed successfully!',
        });

        setReceiptData({
          reference: reference,
          type: type === 'domestic' ? 'Domestic Transfer' : 'International Transfer',
          receiverName: formData.receiverName,
          receiverAccount: formData.receiverAccount,
          bankName: formData.bankName,
          amount: amount,
          timestamp: timestamp,
          status: 'completed',
          purpose: formData.purpose,
        });

        setShowLoadingScreen(false);
        setShowReceipt(true);

        // Reset form
        setFormData({
          receiverName: '',
          receiverAccount: '',
          bankName: '',
          routingNumber: '',
          iban: '',
          swift: '',
          country: '',
          amount: '',
          purpose: '',
        });
      } catch (error: any) {
        console.error('Error during transfer:', error);
        setShowLoadingScreen(false);
        toast({
          title: 'Error',
          description: error.message || 'Failed to process transfer.',
          variant: 'destructive',
        });
      }

      setLoading(false);
    }, 3000);
  };

  const transactionDetails = {
    type: type === 'domestic' ? 'Domestic Transfer' : 'International Transfer',
    receiverName: formData.receiverName,
    receiverAccount: formData.receiverAccount,
    bankName: formData.bankName,
    routingNumber: formData.routingNumber,
    iban: formData.iban,
    swift: formData.swift,
    country: formData.country,
    amount: parseFloat(formData.amount) || 0,
    purpose: formData.purpose
  };

  return (
    <>
      {showLoadingScreen && <TransactionLoadingSpinner message="Processing Transfer..." />}
      
      <Dialog open={isOpen && !showLoadingScreen && !showConfirmModal && !showOtpModal && !showReceipt} onOpenChange={onClose}>
        <DialogContent className="w-[95%] max-w-md mx-auto max-h-[90vh] flex flex-col overflow-hidden p-0">
          <DialogHeader className="flex-shrink-0 p-4 pb-2 border-b">
            <DialogTitle className="flex items-center justify-between text-lg">
              {type === 'domestic' ? 'Domestic Transfer' : 'International Transfer'}
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Recipient Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-base">Recipient Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="receiverName" className="text-sm">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="receiverName"
                      value={formData.receiverName}
                      onChange={(e) => setFormData({...formData, receiverName: e.target.value})}
                      className="pl-10 h-10 no-zoom"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receiverAccount" className="text-sm">Account Number *</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="receiverAccount"
                      value={formData.receiverAccount}
                      onChange={(e) => setFormData({...formData, receiverAccount: e.target.value})}
                      className="pl-10 h-10 no-zoom"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankName" className="text-sm">Bank Name *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    {type === 'domestic' ? (
                      <Select
                        value={formData.bankName}
                        onValueChange={(value) => setFormData({...formData, bankName: value})}
                      >
                        <SelectTrigger className="pl-10 h-10">
                          <SelectValue placeholder="Select bank" />
                        </SelectTrigger>
                        <SelectContent>
                          {domesticBanks.map((bank) => (
                            <SelectItem key={bank} value={bank}>
                              {bank}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="bankName"
                        value={formData.bankName}
                        onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                        className="pl-10 h-10 no-zoom"
                        placeholder="Enter bank name"
                        required
                      />
                    )}
                  </div>
                </div>

                 {type === 'domestic' && (
                   <div className="space-y-2">
                     <Label htmlFor="routingNumber" className="text-sm">Routing Number</Label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="routingNumber"
                        value={formData.routingNumber}
                        onChange={(e) => setFormData({...formData, routingNumber: e.target.value})}
                        className="pl-10 h-10 no-zoom"
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                )}

                {type === 'international' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="country" className="text-sm">Country *</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                        <Select
                          value={formData.country}
                          onValueChange={(value) => setFormData({...formData, country: value})}
                        >
                          <SelectTrigger className="pl-10 h-10">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country.code} value={country.name}>
                                {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="iban" className="text-sm">IBAN/SWIFT Code *</Label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="iban"
                          value={formData.iban}
                          onChange={(e) => setFormData({...formData, iban: e.target.value})}
                          className="pl-10 h-10 no-zoom"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Transfer Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-base">Transfer Details</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm">Amount ({getCurrencySymbol(userData)}) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="1"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="pl-10 h-10 no-zoom"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                     Available Balance: {formatCurrency(userData?.balance || 0, userData)}
                   </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose" className="text-sm">Purpose/Description</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="purpose"
                      value={formData.purpose}
                      onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                      placeholder="Optional - Purpose of transfer"
                      className="pl-10 min-h-[80px] no-zoom"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="flex-shrink-0 p-4 border-t bg-background">
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-10">
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={loading} className="flex-1 h-10">
                Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <TransactionConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmTransaction}
        transactionDetails={transactionDetails}
      />

      <OtpVerificationModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onSuccess={handleOtpVerified}
        title="Authorize Transfer"
      />

      <TransferReceiptModal
        isOpen={showReceipt}
        onClose={handleReceiptClose}
        receiptData={receiptData}
      />
    </>
  );
};

export default TransferModal;
