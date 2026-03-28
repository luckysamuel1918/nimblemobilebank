
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Globe, Receipt, History } from 'lucide-react';

interface ActionButtonsProps {
  onDomesticTransfer: () => void;
  onInternationalTransfer: () => void;
  onCheckDeposit: () => void;
  onTransactionHistory: () => void;
  disabled?: boolean;
}

const ActionButtons = ({ 
  onDomesticTransfer, 
  onInternationalTransfer, 
  onCheckDeposit,
  onTransactionHistory,
  disabled = false 
}: ActionButtonsProps) => {
  return (
    <Card>
      <CardContent className="p-3 sm:p-4 lg:p-6">
        <h2 className="text-sm sm:text-base lg:text-lg font-semibold mb-4 sm:mb-6 text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
          {/* Domestic Transfer Card */}
          <Card className={`transition-all duration-200 hover:shadow-lg ${disabled ? 'opacity-60' : 'hover:scale-105 cursor-pointer'}`}>
            <CardContent className="p-2 sm:p-3 lg:p-4">
              <Button
                onClick={onDomesticTransfer}
                disabled={disabled}
                className="w-full h-auto bg-transparent hover:bg-transparent text-foreground p-0 flex flex-col items-center gap-1 sm:gap-2 lg:gap-3"
                variant="ghost"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Send className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-primary" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-[10px] sm:text-xs lg:text-sm leading-tight">
                    <span className="block">Domestic</span>
                    <span className="block">Transfer</span>
                  </h3>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* International Transfer Card */}
          <Card className={`transition-all duration-200 hover:shadow-lg ${disabled ? 'opacity-60' : 'hover:scale-105 cursor-pointer'}`}>
            <CardContent className="p-2 sm:p-3 lg:p-4">
              <Button
                onClick={onInternationalTransfer}
                disabled={disabled}
                className="w-full h-auto bg-transparent hover:bg-transparent text-foreground p-0 flex flex-col items-center gap-1 sm:gap-2 lg:gap-3"
                variant="ghost"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Globe className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-accent" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-[10px] sm:text-xs lg:text-sm leading-tight">
                    <span className="block">International</span>
                    <span className="block">Transfer</span>
                  </h3>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Check Deposit Card */}
          <Card className={`transition-all duration-200 hover:shadow-lg ${disabled ? 'opacity-60' : 'hover:scale-105 cursor-pointer'}`}>
            <CardContent className="p-2 sm:p-3 lg:p-4">
              <Button
                onClick={onCheckDeposit}
                disabled={disabled}
                className="w-full h-auto bg-transparent hover:bg-transparent text-foreground p-0 flex flex-col items-center gap-1 sm:gap-2 lg:gap-3"
                variant="ghost"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full bg-secondary/50 flex items-center justify-center">
                  <Receipt className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-secondary-foreground" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-[10px] sm:text-xs lg:text-sm leading-tight">
                    <span className="block">Check</span>
                    <span className="block">Deposit</span>
                  </h3>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Transaction History Card */}
          <Card className="transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer">
            <CardContent className="p-2 sm:p-3 lg:p-4">
              <Button
                onClick={onTransactionHistory}
                className="w-full h-auto bg-transparent hover:bg-transparent text-foreground p-0 flex flex-col items-center gap-1 sm:gap-2 lg:gap-3"
                variant="ghost"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <History className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-blue-600" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-[10px] sm:text-xs lg:text-sm leading-tight">
                    <span className="block">Transaction</span>
                    <span className="block">History</span>
                  </h3>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {disabled && (
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-destructive/10 rounded-lg border border-destructive/20">
            <p className="text-xs sm:text-sm text-destructive text-center font-medium">
              Account suspended - All transactions are disabled
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActionButtons;
