
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useToast } from '@/hooks/use-toast';
import { Shield, ArrowLeft } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const PinVerification = () => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const { currentUser, logout, setNeedsPinVerification } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!currentUser) {
      navigate('/user');
      return;
    }
    
    // Load user data to get profile picture
    const loadUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    
    loadUserData();
  }, [currentUser, navigate]);

  const getProfilePicture = () => {
    if (userData?.profilePicture) {
      return userData.profilePicture;
    }
    
    if (currentUser) {
      try {
        const stored = localStorage.getItem(`profilePicture_${currentUser.uid}`);
        return stored;
      } catch (error) {
        console.error('Error getting profile picture from localStorage:', error);
      }
    }
    
    return null;
  };

  const getInitials = () => {
    if (userData?.firstName && userData?.lastName) {
      return `${userData.firstName[0]}${userData.lastName[0]}`.toUpperCase();
    }
    
    if (currentUser?.email) {
      return currentUser.email.substring(0, 2).toUpperCase();
    }
    
    return 'U';
  };

  const handlePinSubmit = async () => {
    if (pin.length !== 4) {
      setError('Please enter a 4-digit PIN');
      return;
    }

    if (isVerifying) {
      return; // Prevent multiple simultaneous verifications
    }

    setLoading(true);
    setIsVerifying(true);
    setError('');

    try {
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      console.log('Starting PIN verification for user:', currentUser.uid);
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User data not found');
      }

      const userData = userDoc.data();
      const storedPin = userData.loginPin;

      if (!storedPin) {
        // If no PIN is set, redirect to set PIN
        navigate('/set-pin');
        return;
      }

      if (pin === storedPin) {
        console.log('PIN verified successfully, clearing PIN verification state');
        
        // Clear the PIN verification requirement BEFORE showing loading screen
        setNeedsPinVerification(false);
        
        // Show loading screen for 5 seconds before redirecting
        setShowLoadingScreen(true);
        
        setTimeout(() => {
          setShowLoadingScreen(false);
          setIsVerifying(false);
          
          toast({
            title: "Access granted",
            description: "PIN verified successfully",
          });
          
          // Get the intended destination or default to dashboard
          const from = location.state?.from?.pathname || '/user-dashboard';
          console.log('Redirecting to:', from);
          navigate(from, { replace: true });
        }, 5000); // Changed to 5 seconds
      } else {
        setError('Invalid PIN. Please try again.');
        setPin('');
        setIsVerifying(false);
      }
    } catch (error) {
      console.error('PIN verification error:', error);
      setError('Verification failed. Please try again.');
      setPin('');
      setIsVerifying(false);
    }

    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/user');
  };

  if (showLoadingScreen) {
    return <LoadingSpinner message="Processing Login..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-bank flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Avatar className="h-16 w-16 mx-auto border-4 border-primary/20">
              <AvatarImage src={getProfilePicture() || undefined} />
              <AvatarFallback className="text-xl bg-primary text-white">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-2xl">Security Verification</CardTitle>
          <p className="text-muted-foreground">Enter your 4-digit PIN to continue</p>
          <p className="text-xs text-yellow-600 mt-2">Note: PIN cannot be changed once set</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <InputOTP
              value={pin}
              onChange={setPin}
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
            disabled={loading || pin.length !== 4 || isVerifying}
          >
            {loading || isVerifying ? 'Verifying...' : 'Verify PIN'}
          </Button>

          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full"
            disabled={isVerifying}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PinVerification;
