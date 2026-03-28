
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrencyWithCode } from '@/utils/currency';

const BalanceCard = () => {
  const { userData } = useAuth();

  const currencyData = formatCurrencyWithCode(userData?.balance || 0, userData);

  return (
    <Card className="bg-gradient-card text-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm mb-1">Available Balance</p>
            <div className="flex items-baseline gap-1">
              <span className="text-white/60 text-lg font-medium">{currencyData.symbol}</span>
              <p className="text-4xl font-bold tracking-tight">
                {currencyData.amount}
              </p>
              <span className="text-white/60 text-sm font-medium">{currencyData.code}</span>
            </div>
            <div className="mt-3">
              <Badge variant="secondary" className="text-xs font-medium w-fit">
                Active Account
              </Badge>
            </div>
          </div>
          <CreditCard className="h-14 w-14 text-white/60" />
        </div>
      </CardContent>
    </Card>
  );
};

export default BalanceCard;
