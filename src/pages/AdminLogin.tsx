
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const WestcoastLogo = () => (
    <div className="relative mx-auto mb-4">
      <img 
        src="/lovable-uploads/a7502ff1-fc92-4973-800b-bb259aae04df.png" 
        alt="Westcoast Trust Bank Logo" 
        className="w-12 h-12 object-contain mx-auto"
      />
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate admin email format
    if (!email.includes('@') || email.trim() === '') {
      setError('Please enter a valid admin email address');
      setLoading(false);
      return;
    }

    if (password.trim() === '') {
      setError('Please enter your password');
      setLoading(false);
      return;
    }

    try {
      await login(email, password);
      navigate('/admin-dashboard');
    } catch (error: any) {
      console.log('Login error:', error);
      setError('Invalid credentials - Please check your email and password');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-bank flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <WestcoastLogo />
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <p className="text-muted-foreground">Westcoast Trust Bank Administration</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Admin Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter admin email"
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter admin password"
                autoComplete="current-password"
              />
            </div>
            {error && (
              <p className="text-destructive text-sm">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              <Shield className="mr-2 h-4 w-4" />
              {loading ? 'Signing in...' : 'Admin Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
