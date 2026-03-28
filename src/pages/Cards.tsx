
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { CreditCard, Copy, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BottomNavigation from '@/components/BottomNavigation';

interface VirtualCard {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  cardType: string;
  issuedDate: Date;
}

const Cards = () => {
  const { currentUser, userData } = useAuth();
  const { toast } = useToast();
  const [virtualCard, setVirtualCard] = useState<VirtualCard | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCardDetails, setShowCardDetails] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadVirtualCard();
    }
  }, [currentUser]);

  const loadVirtualCard = async () => {
    if (!currentUser) return;
    
    try {
      const cardDoc = await getDoc(doc(db, 'virtualCards', currentUser.uid));
      if (cardDoc.exists()) {
        setVirtualCard(cardDoc.data() as VirtualCard);
      }
    } catch (error) {
      console.error('Error loading virtual card:', error);
    }
  };

  const generateCardNumber = () => {
    const prefix = '4532'; // Visa prefix
    let cardNumber = prefix;
    for (let i = 0; i < 12; i++) {
      cardNumber += Math.floor(Math.random() * 10);
    }
    return cardNumber.match(/.{1,4}/g)?.join(' ') || '';
  };

  const generateExpiryDate = () => {
    const now = new Date();
    const expiryYear = now.getFullYear() + 3;
    const expiryMonth = String(now.getMonth() + 1).padStart(2, '0');
    return `${expiryMonth}/${expiryYear.toString().slice(-2)}`;
  };

  const generateCVV = () => {
    return Math.floor(100 + Math.random() * 900).toString();
  };

  const applyForVirtualCard = async () => {
    if (!currentUser || !userData) return;

    setLoading(true);
    try {
      const newCard: VirtualCard = {
        cardNumber: generateCardNumber(),
        expiryDate: generateExpiryDate(),
        cvv: generateCVV(),
        cardholderName: `${userData.firstName} ${userData.lastName}`.toUpperCase(),
        cardType: 'VISA',
        issuedDate: new Date()
      };

      await setDoc(doc(db, 'virtualCards', currentUser.uid), newCard);
      setVirtualCard(newCard);
      
      toast({
        title: "Virtual Card Issued",
        description: "Your virtual card has been successfully created!",
      });
    } catch (error) {
      console.error('Error creating virtual card:', error);
      toast({
        title: "Error",
        description: "Failed to create virtual card. Please try again.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    });
  };

  const maskCardNumber = (cardNumber: string) => {
    const parts = cardNumber.split(' ');
    return `${parts[0]} **** **** ${parts[3]}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Cards</h1>
        </div>

        {!virtualCard ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Apply for Virtual Card
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Get instant access to a virtual card for online payments and shopping.
              </p>
              <Button 
                onClick={applyForVirtualCard} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Creating...' : 'Apply for Virtual Card'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Virtual Card Display */}
            <div className="relative">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-xs opacity-80">VIRTUAL CARD</p>
                    <p className="text-sm font-medium">{virtualCard.cardType}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCardDetails(!showCardDetails)}
                      className="text-white hover:bg-white/20"
                    >
                      {showCardDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-lg font-mono tracking-wider">
                    {showCardDetails ? virtualCard.cardNumber : maskCardNumber(virtualCard.cardNumber)}
                  </p>
                </div>
                
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs opacity-80">CARDHOLDER</p>
                    <p className="text-sm font-medium">{virtualCard.cardholderName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs opacity-80">EXPIRES</p>
                    <p className="text-sm font-medium">{virtualCard.expiryDate}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Details */}
            {showCardDetails && (
              <Card>
                <CardHeader>
                  <CardTitle>Card Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Card Number</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{virtualCard.cardNumber}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(virtualCard.cardNumber.replace(/\s/g, ''), 'Card number')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">CVV</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{virtualCard.cvv}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(virtualCard.cvv, 'CVV')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Expiry Date</span>
                    <span className="font-mono">{virtualCard.expiryDate}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Cards;
