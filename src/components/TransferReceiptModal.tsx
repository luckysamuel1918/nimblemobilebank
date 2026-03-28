
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/utils/currency';

interface TransferReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData: any;
}

const TransferReceiptModal = ({ isOpen, onClose, receiptData }: TransferReceiptModalProps) => {
  const { userData } = useAuth();
  
  // Add null check to prevent crashes
  if (!receiptData) {
    console.warn('TransferReceiptModal: receiptData is null or undefined');
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Receipt
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-gray-600">No receipt data available</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const downloadReceipt = async () => {
    try {
      const receiptElement = document.getElementById('receipt-content');
      if (!receiptElement) {
        console.error('Receipt element not found');
        return;
      }

      // Configure html2canvas for better quality
      const canvas = await html2canvas(receiptElement, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher resolution
        logging: false,
        useCORS: true,
        allowTaint: true,
        height: receiptElement.scrollHeight,
        width: receiptElement.scrollWidth
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Failed to create blob');
          return;
        }
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `WestCoastTrust_Receipt_${receiptData.reference || 'transaction'}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 'image/png', 1.0);

    } catch (error) {
      console.error('Error downloading receipt:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Transaction Receipt
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={downloadReceipt}>
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div id="receipt-content" className="bg-white p-6 space-y-6">
          {/* Bank Header */}
          <div className="text-center border-b pb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
                <img 
                  src="/lovable-uploads/2e27bb90-5008-46cc-a672-281c0761c779.png" 
                  alt="Westcoast Trust Bank" 
                  className="w-12 h-12 object-cover rounded-full"
                />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900">WESTCOAST TRUST BANK</h2>
            <p className="text-sm text-gray-600">Your Trusted Banking Partner</p>
          </div>

          {/* Receipt Title */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">TRANSFER  RECEIPT</h3>
            <p className="text-sm text-gray-600">Transaction Confirmation</p>
          </div>

          {/* Transaction Details */}
          <Card className="border-2 border-blue-100">
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Reference No:</p>
                  <p className="text-gray-900 font-mono">{receiptData.reference || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Date & Time:</p>
                  <p className="text-gray-900">{receiptData.timestamp || new Date().toLocaleString()}</p>
                </div>
              </div>
              
              <div className="border-t pt-3">
                <div className="text-center bg-green-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">Amount Transferred</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(typeof receiptData.amount === 'number' ? receiptData.amount : parseFloat(receiptData.amount) || 0, userData)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transfer Details */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h4 className="font-semibold text-gray-900 border-b pb-2">Transfer Information</h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Transfer Type:</span>
                  <span className="text-gray-900">{receiptData.type || 'Bank Transfer'}</span>
                </div>
                
                {receiptData.receiverName && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Recipient:</span>
                    <span className="text-gray-900">{receiptData.receiverName}</span>
                  </div>
                )}
                
                {receiptData.receiverAccount && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Account:</span>
                    <span className="text-gray-900 font-mono">{receiptData.receiverAccount}</span>
                  </div>
                )}
                
                {receiptData.bankName && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Bank:</span>
                    <span className="text-gray-900">{receiptData.bankName}</span>
                  </div>
                )}
                
                {receiptData.purpose && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Purpose:</span>
                    <span className="text-gray-900">{receiptData.purpose}</span>
                  </div>
                )}

                {receiptData.iban && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">IBAN/SWIFT:</span>
                    <span className="text-gray-900 font-mono text-xs break-all">{receiptData.iban}</span>
                  </div>
                )}

                {receiptData.country && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Country:</span>
                    <span className="text-gray-900">{receiptData.country}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                {receiptData.status || 'Completed Successfully'}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t pt-4 text-center text-xs text-gray-500 space-y-1">
            <p>This is an official receipt from Westcoast Trust Bank</p>
            <p>Generated on {new Date().toLocaleString()}</p>
            <p className="font-medium">Thank you for banking with us!</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransferReceiptModal;
