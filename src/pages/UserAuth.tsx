import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import AddressDetailsStep from '@/components/signup/AddressDetailsStep';
import PersonalInfoStep from '@/components/signup/PersonalInfoStep';
import VerificationStep from '@/components/signup/VerificationStep';

const UserAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Address details
    address: '',
    city: '',
    state: '',
    zipCode: '',
    dateOfBirth: '',
    
    // Personal info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    maritalStatus: '',
    occupation: '',
    country: '',
    currency: 'USD',
    currencySymbol: '$',
    
    // Verification
    ssnOrTin: '',
    productKey: '',
    
    // Login
    emailOrAccount: ''
  });
  const [loading, setLoading] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [error, setError] = useState('');
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', formData.emailOrAccount);
      await login(formData.emailOrAccount, formData.password);
      
      // Show loading screen for 3 seconds before redirecting
      setShowLoadingScreen(true);
      setTimeout(() => {
        setShowLoadingScreen(false);
        
        // Check if admin or regular user
        if (formData.emailOrAccount === 'info@apexiumbank.com') {
          navigate('/admin-dashboard');
        } else {
          navigate('/pin-verification');
        }
      }, 3000);
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Invalid credentials. Please check your email/account number and password.');
    }
    setLoading(false);
  };

  const handleSignupSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      if (formData.productKey !== '08164800435Al@') {
        setError('Invalid product key');
        setLoading(false);
        return;
      }

      await signup(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        dateOfBirth: formData.dateOfBirth,
        maritalStatus: formData.maritalStatus,
        occupation: formData.occupation,
        country: formData.country,
        currency: formData.currency,
        currencySymbol: formData.currencySymbol,
        ssnOrTin: formData.ssnOrTin
      });
      navigate('/set-pin');
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'An error occurred during signup');
    }
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const WestcoastLogo = () => (
    <div className="logo-container w-12 h-12 rounded-full overflow-hidden flex items-center justify-center mb-4 mx-auto">
      <img 
        src="/lovable-uploads/2e27bb90-5008-46cc-a672-281c0761c779.png" 
        alt="Westcoast Trust Bank Logo" 
        className="w-12 h-12 object-cover rounded-full"
      />
    </div>
  );

  if (showLoadingScreen) {
    return <LoadingSpinner message="Processing Login..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-bank flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {!isLogin && (
          <div className="text-center mb-6">
            <WestcoastLogo />
            <h1 className="text-2xl font-bold text-white">Westcoast Trust Bank</h1>
            <p className="text-bank-light">Create Your Account</p>
          </div>
        )}

        {isLogin ? (
          <Card>
            <CardHeader className="text-center">
              <WestcoastLogo />
              <CardTitle className="text-2xl">Westcoast Trust Bank</CardTitle>
              <p className="text-muted-foreground">Secure Banking Access</p>
            </CardHeader>
            <CardContent>
              <Tabs value="login">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup" onClick={() => setIsLogin(false)}>Sign Up</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="emailOrAccount">Email or Account Number</Label>
                      <Input
                        id="emailOrAccount"
                        name="emailOrAccount"
                        type="text"
                        value={formData.emailOrAccount}
                        onChange={handleInputChange}
                        placeholder="Enter email or account number"
                        required
                        disabled={loading}
                        className="no-zoom"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                        className="no-zoom"
                      />
                    </div>
                    {error && <p className="text-destructive text-sm">{error}</p>}
                    <Button type="submit" className="w-full no-zoom" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <>
            {currentStep === 1 && (
              <AddressDetailsStep
                formData={formData}
                setFormData={setFormData}
                onNext={nextStep}
                loading={loading}
              />
            )}
            {currentStep === 2 && (
              <PersonalInfoStep
                formData={formData}
                setFormData={setFormData}
                onNext={nextStep}
                onBack={prevStep}
                loading={loading}
              />
            )}
            {currentStep === 3 && (
              <VerificationStep
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSignupSubmit}
                onBack={prevStep}
                loading={loading}
              />
            )}
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            
            <div className="mt-6 text-center">
              <Button 
                variant="ghost" 
                className="text-white hover:text-bank-light no-zoom" 
                onClick={() => {
                  setIsLogin(true);
                  setCurrentStep(1);
                  setError('');
                }}
              >
                Already have an account? Sign In
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserAuth;
