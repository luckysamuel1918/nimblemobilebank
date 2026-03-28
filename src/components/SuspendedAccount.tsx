import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const SuspendedAccount = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 1️⃣ Clear authentication tokens
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');

    // 2️⃣ Optional: notify backend
    fetch('/api/logout', { method: 'POST', credentials: 'include' })
      .catch(err => console.error('Logout API error:', err));

    // 3️⃣ Redirect to login panel (/user)
    navigate('/user');
  };

  return (
    <div className="min-h-screen bg-blue-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white rounded-2xl shadow-xl">
        <CardContent className="p-8 text-center space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              We locked your account due to unusual activity.
            </h2>
            
            <p className="text-gray-700 leading-relaxed">
              Email us to unlock it. If you're a commercial client, reach out to your servicing team.
            </p>
            
            <p className="text-gray-700 text-sm leading-relaxed">
              Please note that you will not be able to access your account information, documents or statements online or on the mobile app until we unlock your account.
            </p>
          </div>
          
          <div className="flex space-x-4 pt-6">
            <Button
              variant="outline"
              className="flex-1 bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
              onClick={() => window.location.href = 'mailto:support@westcoasttrusts.com'}
            >
              Email us
            </Button>
            
            <Button
              variant="outline"
              className="flex-1 bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
              onClick={handleLogout}
            >
              Logout 
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuspendedAccount;
