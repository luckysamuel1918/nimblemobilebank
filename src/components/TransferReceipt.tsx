import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, X, CheckCircle, Clock, AlertCircle, Share, Printer, Copy } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/utils/currency';

interface TransferReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  transactionData: {
    reference: string;
    amount: number;
    receiverName?: string;
    receiverAccount?: string;
    bankName?: string;
    purpose?: string;
    type: string;
    timestamp: Date;
    status: string;
    billType?: string;
    serviceProvider?: string;
    accountNumber?: string;
    senderName?: string;
    fee?: number;
    balance?: number;
  } | null;
}

const TransferReceipt = ({ isOpen, onClose, transactionData }: TransferReceiptProps) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const { userData } = useAuth();

  if (!transactionData) return null;

  const downloadAsImage = async () => {
    if (!receiptRef.current) return;

    try {
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: receiptRef.current.scrollWidth,
        height: receiptRef.current.scrollHeight,
        windowWidth: receiptRef.current.scrollWidth,
        windowHeight: receiptRef.current.scrollHeight
      });

      const link = document.createElement('a');
      link.download = `WESTCOAST_TRUST_BANK_Receipt_${transactionData.reference}_${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (error) {
      console.error('Error generating receipt image:', error);
    }
  };

  const copyReference = () => {
    navigator.clipboard.writeText(transactionData.reference);
  };

  const shareReceipt = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Bank Transaction Receipt',
        text: `Transaction Reference: ${transactionData.reference}`,
        url: window.location.href
      });
    }
  };

  const printReceipt = () => {
    window.print();
  };

  const getStatusIcon = () => {
    switch (transactionData.status.toLowerCase()) {
      case 'completed':
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500 flex-shrink-0" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />;
    }
  };

  const getStatusColor = () => {
    switch (transactionData.status.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-green-50 text-green-700 border-green-200';
    }
  };

  const getDisplayTitle = () => {
    if (transactionData.purpose) {
      return transactionData.purpose;
    }
    if (transactionData.receiverName) {
      return `Payment to ${transactionData.receiverName}`;
    }
    return 'Transaction';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl max-h-[95vh] overflow-y-auto p-0 mx-2 sm:mx-4">
        <div className="sticky top-0 bg-white z-10 border-b p-3 sm:p-4">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-sm sm:text-base">
              <span className="truncate mr-2">Transaction Receipt</span>
              <Button variant="ghost" size="sm" onClick={onClose} className="flex-shrink-0">
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div ref={receiptRef} className="bg-white relative overflow-hidden w-full min-w-0">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M20 20v-8h-4v8h-8v4h8v8h4v-8h8v-4h-8z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '40px 40px'
            }}>
            </div>
          </div>

          {/* Decorative Header Border */}
          <div className="h-2 sm:h-3 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800"></div>
          
          <div className="p-3 sm:p-4 md:p-6 relative min-w-0">
            {/* Bank Logo and Header */}
            <div className="text-center mb-3 sm:mb-4 md:mb-6">
              <div className="flex justify-center mb-2 sm:mb-3">
                <div className="relative">
                  <img 
                    src="/lovable-uploads/2e27bb90-5008-46cc-a672-281c0761c779.png" 
                    alt="Westcoast Trust Bank Logo" 
                    className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 object-contain"
                  />
                  <div className="absolute -top-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                    <CheckCircle className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-white" />
                  </div>
                </div>
              </div>
              <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text text-transparent mb-1 px-2">
                WESTCOAST TRUST BANK
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 font-semibold tracking-wider uppercase px-2">
                Official Transaction Receipt
              </p>
              <div className="flex justify-center mt-1 sm:mt-2">
                <div className="w-12 sm:w-16 md:w-20 h-0.5 bg-gradient-to-r from-blue-600 to-purple-700 rounded-full"></div>
              </div>
            </div>

            {/* Status Banner */}
            <div className={`rounded-lg p-2 sm:p-3 md:p-4 mb-2 sm:mb-3 md:mb-4 border ${getStatusColor()} relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 opacity-10 pointer-events-none">
                <div className="w-full h-full bg-current rounded-full transform translate-x-6 sm:translate-x-8 md:translate-x-10 -translate-y-6 sm:-translate-y-8 md:-translate-y-10"></div>
              </div>
              <div className="flex items-center justify-between relative z-10 min-w-0">
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0 overflow-hidden">
                  <div className="p-1 sm:p-1.5 md:p-2 bg-white/20 rounded-full flex-shrink-0">
                    {getStatusIcon()}
                  </div>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <p className="font-bold text-sm sm:text-base md:text-lg truncate">
                      Transaction {transactionData.status}
                    </p>
                    <p className="text-xs sm:text-sm font-mono truncate">
                      REF: {transactionData.reference}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={copyReference} 
                  className="opacity-70 hover:opacity-100 bg-white/20 ml-2 flex-shrink-0 p-1 sm:p-2"
                >
                  <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>

            {/* Amount Display */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-2 sm:p-3 md:p-4 border border-green-100 shadow-sm mb-2 sm:mb-3 md:mb-4">
              <div className="text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
                  <span className="text-white font-bold text-sm sm:text-base md:text-lg">$</span>
                </div>
                <p className="text-xs sm:text-sm text-green-600 font-semibold mb-1">AMOUNT TRANSFERRED</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-700 break-all">
                  {formatCurrency(transactionData.amount, userData)}
                </p>
                {transactionData.fee && (
                  <p className="text-xs sm:text-sm text-red-600 mt-1">
                    Fee: {formatCurrency(transactionData.fee, userData)}
                  </p>
                )}
              </div>
            </div>

            {/* Transaction Details Grid - All sections contained */}
            <div className="space-y-2 sm:space-y-3 md:space-y-4 mb-2 sm:mb-3 md:mb-4">
              {/* Purpose/Title */}
              <div className="bg-gray-50 rounded-lg p-2 sm:p-3 md:p-4 border border-gray-200 overflow-hidden">
                <div className="flex items-center mb-1 sm:mb-2 md:mb-3">
                  <div className="w-2 h-3 sm:h-4 md:h-6 bg-purple-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></div>
                  <h3 className="font-bold text-xs sm:text-sm text-gray-800">Purpose</h3>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <div className="flex justify-between items-start py-1 gap-2 min-w-0">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium flex-shrink-0">Purpose</span>
                    <span className="text-xs sm:text-sm font-bold text-gray-800 text-right break-words min-w-0 flex-1">
                      {getDisplayTitle()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sender Information */}
              {transactionData.senderName && (
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3 md:p-4 border border-gray-200 overflow-hidden">
                  <div className="flex items-center mb-1 sm:mb-2 md:mb-3">
                    <div className="w-2 h-3 sm:h-4 md:h-6 bg-blue-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></div>
                    <h3 className="font-bold text-xs sm:text-sm text-gray-800">Sender Information</h3>
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <div className="flex justify-between items-start py-1 border-b border-gray-200 gap-2 min-w-0">
                      <span className="text-xs sm:text-sm text-gray-600 font-medium flex-shrink-0">Name</span>
                      <span className="text-xs sm:text-sm font-bold text-gray-800 text-right break-words min-w-0 flex-1">
                        {transactionData.senderName}
                      </span>
                    </div>
                    {transactionData.accountNumber && (
                      <div className="flex justify-between items-start py-1 gap-2 min-w-0">
                        <span className="text-xs sm:text-sm text-gray-600 font-medium flex-shrink-0">Account</span>
                        <span className="text-xs sm:text-sm font-mono font-bold text-gray-800 break-all min-w-0 flex-1">
                          {transactionData.accountNumber}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Recipient Information */}
              {(transactionData.receiverName || transactionData.receiverAccount) && (
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3 md:p-4 border border-gray-200 overflow-hidden">
                  <div className="flex items-center mb-1 sm:mb-2 md:mb-3">
                    <div className="w-2 h-3 sm:h-4 md:h-6 bg-green-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></div>
                    <h3 className="font-bold text-xs sm:text-sm text-gray-800">Recipient Information</h3>
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    {transactionData.receiverName && (
                      <div className="flex justify-between items-start py-1 border-b border-gray-200 gap-2 min-w-0">
                        <span className="text-xs sm:text-sm text-gray-600 font-medium flex-shrink-0">Name</span>
                        <span className="text-xs sm:text-sm font-bold text-gray-800 text-right break-words min-w-0 flex-1">
                          {transactionData.receiverName}
                        </span>
                      </div>
                    )}
                    {transactionData.receiverAccount && (
                      <div className="flex justify-between items-start py-1 border-b border-gray-200 gap-2 min-w-0">
                        <span className="text-xs sm:text-sm text-gray-600 font-medium flex-shrink-0">Account</span>
                        <span className="text-xs sm:text-sm font-mono font-bold text-gray-800 break-all min-w-0 flex-1">
                          {transactionData.receiverAccount}
                        </span>
                      </div>
                    )}
                    {transactionData.bankName && (
                      <div className="flex justify-between items-start py-1 gap-2 min-w-0">
                        <span className="text-xs sm:text-sm text-gray-600 font-medium flex-shrink-0">Bank</span>
                        <span className="text-xs sm:text-sm font-bold text-gray-800 text-right break-words min-w-0 flex-1">
                          {transactionData.bankName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Transaction Details */}
              <div className="bg-gray-50 rounded-lg p-2 sm:p-3 md:p-4 border border-gray-200 overflow-hidden">
                <div className="flex items-center mb-1 sm:mb-2 md:mb-3">
                  <div className="w-2 h-3 sm:h-4 md:h-6 bg-orange-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></div>
                  <h3 className="font-bold text-xs sm:text-sm text-gray-800">Transaction Details</h3>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <div className="flex justify-between items-start py-1 border-b border-gray-200 gap-2 min-w-0">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium flex-shrink-0">Date</span>
                    <span className="text-xs sm:text-sm font-bold text-gray-800 text-right flex-1">
                      {transactionData.timestamp.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-start py-1 border-b border-gray-200 gap-2 min-w-0">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium flex-shrink-0">Time</span>
                    <span className="text-xs sm:text-sm font-bold text-gray-800 text-right flex-1">
                      {transactionData.timestamp.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-start py-1 gap-2 min-w-0">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium flex-shrink-0">Reference</span>
                    <span className="text-xs sm:text-sm font-mono font-bold text-gray-800 break-all min-w-0 flex-1">
                      {transactionData.reference}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="bg-gradient-to-r from-gray-100 to-slate-100 rounded-lg p-2 sm:p-3 md:p-4 mb-2 sm:mb-3 md:mb-4 border border-gray-200 overflow-hidden">
              <div className="text-center mb-1 sm:mb-2 md:mb-3">
                <h3 className="text-xs sm:text-sm font-bold text-gray-800 mb-1">Security & Verification</h3>
                <p className="text-xs text-gray-600 px-2">This transaction has been secured with bank-grade encryption</p>
              </div>
              <div className="grid grid-cols-4 gap-1 sm:gap-2 md:gap-3">
                <div className="text-center min-w-0">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-1 shadow-sm">
                    <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 text-white" />
                  </div>
                  <p className="text-xs font-bold text-gray-700 truncate">VERIFIED</p>
                </div>
                <div className="text-center min-w-0">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-1 shadow-sm">
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 bg-white rounded-full"></div>
                  </div>
                  <p className="text-xs font-bold text-gray-700 truncate">SSL</p>
                </div>
                <div className="text-center min-w-0">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-1 shadow-sm">
                    <span className="text-white font-bold text-xs">256</span>
                  </div>
                  <p className="text-xs font-bold text-gray-700 truncate">AES-256</p>
                </div>
                <div className="text-center min-w-0">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-1 shadow-sm">
                    <span className="text-white font-bold text-xs">PCI</span>
                  </div>
                  <p className="text-xs font-bold text-gray-700 truncate">COMPLIANT</p>
                </div>
              </div>
            </div>

            {/* Footer Section */}
            <div className="border-t border-dashed border-gray-400 pt-2 sm:pt-3 md:pt-4 overflow-hidden">
              {/* Transaction Reference */}
              <div className="bg-white rounded-lg p-2 sm:p-3 border border-gray-200 shadow-sm mb-2 sm:mb-3 overflow-hidden">
                <div className="text-center">
                  <p className="text-xs font-bold text-gray-700 mb-1">TRANSACTION ID</p>
                  <div className="bg-blue-50 rounded px-2 py-1 inline-block max-w-full overflow-hidden">
                    <p className="text-xs sm:text-sm font-mono font-bold text-blue-600 break-all">
                      {transactionData.reference}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Bank Information */}
              <div className="text-center space-y-2">
                <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-lg p-2 sm:p-3 overflow-hidden">
                  <p className="text-xs sm:text-sm font-bold mb-1 px-1">Thank you for banking with Westcoast Trust Bank</p>
                  <p className="text-xs opacity-90 px-1">
                    This is an official electronic receipt. No signature required.
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-2 overflow-hidden">
                  <p className="text-xs text-gray-600 mb-1 px-1 break-words">
                    For support, contact us at support@westcoasttrustbank.com
                  </p>
                  <p className="text-xs text-gray-400 px-1 break-words">
                    Westcoast Trust Bank • Licensed Financial Institution • Member FDIC
                  </p>
                </div>

                {/* Visual QR Code - Contained */}
                <div className="flex justify-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gray-800 rounded p-1 flex-shrink-0">
                    <div className="w-full h-full bg-white rounded grid grid-cols-6 gap-px p-1">
                      {Array.from({ length: 36 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`${Math.random() > 0.5 ? 'bg-gray-800' : 'bg-white'} rounded-sm min-w-0`}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Footer Border */}
          <div className="h-1 sm:h-1.5 md:h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800"></div>
        </div>

        {/* Action Buttons - Responsive */}
        <div className="sticky bottom-0 bg-white border-t p-2 sm:p-3">
          <div className="flex flex-wrap gap-1 sm:gap-2 justify-center">
            <Button onClick={downloadAsImage} size="sm" className="flex-1 min-w-[70px] max-w-[100px] text-xs sm:text-sm">
              <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">PNG</span>
              <span className="sm:hidden">PNG</span>
            </Button>
            <Button variant="outline" onClick={shareReceipt} size="sm" className="flex-1 min-w-[70px] max-w-[100px] text-xs sm:text-sm">
              <Share className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Share
            </Button>
            <Button variant="outline" onClick={printReceipt} size="sm" className="flex-1 min-w-[70px] max-w-[100px] text-xs sm:text-sm">
              <Printer className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Print
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransferReceipt;
