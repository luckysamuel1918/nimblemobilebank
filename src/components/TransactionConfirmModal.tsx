
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/utils/currency';

interface TransactionDetails {
  type: string;
  receiverName?: string;
  receiverAccount?: string;
  bankName?: string;
  amount: number;
  purpose?: string;
  iban?: string;
  swift?: string;
  routingNumber?: string;
  country?: string;
}

interface TransactionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  transactionDetails: TransactionDetails;
}

const TransactionConfirmModal = ({ isOpen, onClose, onConfirm, transactionDetails }: TransactionConfirmModalProps) => {
  const { userData } = useAuth();
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Confirm Transaction
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-muted-foreground text-center">
            Please review and confirm the transaction details below:
          </p>

          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Transaction Type:</span>
                <span className="text-sm">{transactionDetails.type}</span>
              </div>
              
              {transactionDetails.receiverName && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Receiver Name:</span>
                  <span className="text-sm">{transactionDetails.receiverName}</span>
                </div>
              )}
              
              {transactionDetails.receiverAccount && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Account Number:</span>
                  <span className="text-sm">{transactionDetails.receiverAccount}</span>
                </div>
              )}
              
              {transactionDetails.bankName && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Bank Name:</span>
                  <span className="text-sm">{transactionDetails.bankName}</span>
                </div>
              )}
              
              {transactionDetails.routingNumber && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Routing Number:</span>
                  <span className="text-sm">{transactionDetails.routingNumber}</span>
                </div>
              )}
              
              {transactionDetails.iban && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">IBAN:</span>
                  <span className="text-sm">{transactionDetails.iban}</span>
                </div>
              )}
              
              {transactionDetails.swift && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">SWIFT Code:</span>
                  <span className="text-sm">{transactionDetails.swift}</span>
                </div>
              )}
              
              {transactionDetails.country && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Country:</span>
                  <span className="text-sm">{transactionDetails.country}</span>
                </div>
              )}
              
              <div className="flex justify-between border-t pt-2">
                <span className="text-sm font-medium">Amount:</span>
                <span className="text-sm font-bold text-primary">
                  {formatCurrency(transactionDetails.amount, userData)}
                </span>
              </div>
              
              {transactionDetails.purpose && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Purpose:</span>
                  <span className="text-sm">{transactionDetails.purpose}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1"
            >
              Confirm & Proceed
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionConfirmModal;
