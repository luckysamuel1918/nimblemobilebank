
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/contexts/AuthContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useToast } from '@/hooks/use-toast';
import { Shield } from 'lucide-react';

const SetPin = () => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'set' | 'confirm'>('set');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/user');
      return;
    }

    // Check if PIN is already set
    const checkExistingPin = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.loginPin) {
            // PIN already set, redirect to dashboard
            navigate('/user-dashboard');
            return;
          }
        }
      } catch (error) {
        console.error('Error checking existing PIN:', error);
      }
    };

    checkExistingPin();
  }, [currentUser, navigate]);

  const handlePinSubmit = async () => {
    if (step === 'set') {
      if (pin.length !== 4) {
        setError('Please enter a 4-digit PIN');
        return;
      }
      setError('');
      setStep('confirm');
      return;
    }

    if (step === 'confirm') {
      if (confirmPin.length !== 4) {
        setError('Please confirm your 4-digit PIN');
        return;
      }

      if (pin !== confirmPin) {
        setError('PINs do not match. Please try again.');
        setPin('');
        setConfirmPin('');
        setStep('set');
        return;
      }

      setLoading(true);
      setError('');

      try {
        if (!currentUser) {
          throw new Error('No authenticated user');
        }

        await updateDoc(doc(db, 'users', currentUser.uid), {
          loginPin: pin
        });

        toast({
          title: "PIN set successfully",
          description: "Your login PIN has been created and cannot be changed",
        });

        navigate('/user-dashboard');
      } catch (error) {
        console.error('PIN setup error:', error);
        setError('Failed to set PIN. Please try again.');
      }

      setLoading(false);
    }
  };

  const currentPinValue = step === 'set' ? pin : confirmPin;
  const setCurrentPin = step === 'set' ? setPin : setConfirmPin;

  return (
    <div className="min-h-screen bg-gradient-bank flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">
            {step === 'set' ? 'Set Your PIN' : 'Confirm Your PIN'}
          </CardTitle>
          <p className="text-muted-foreground">
            {step === 'set' 
              ? 'Create a 4-digit PIN for secure access' 
              : 'Enter your PIN again to confirm'
            }
          </p>
          <p className="text-xs text-red-600 mt-2">
            Warning: PIN cannot be changed once set!
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <InputOTP
              value={currentPinValue}
              onChange={setCurrentPin}
              maxLength={4}
              autoFocus
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {error && (
            <p className="text-destructive text-sm text-center">{error}</p>
          )}

          <Button
            onClick={handlePinSubmit}
            className="w-full"
            disabled={loading || currentPinValue.length !== 4}
          >
            {loading ? 'Setting PIN...' : step === 'set' ? 'Continue' : 'Set PIN (Permanent)'}
          </Button>

          {step === 'confirm' && (
            <Button
              variant="outline"
              onClick={() => {
                setStep('set');
                setConfirmPin('');
                setError('');
              }}
              className="w-full"
            >
              Back
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SetPin;
