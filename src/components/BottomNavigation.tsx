
import React from 'react';
import { 
  Home, 
  CreditCard, 
  Send, 
  DollarSign, 
  User 
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/user-dashboard' },
    { id: 'cards', label: 'Cards', icon: CreditCard, path: '/cards' },
    { id: 'payments', label: 'Payments', icon: Send, path: '/payments' },
    { id: 'loan', label: 'Loan', icon: DollarSign, path: '/loan' },
    { id: 'me', label: 'Me', icon: User, path: '/profile' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-2xl mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                active 
                  ? 'text-primary bg-primary/10' 
                  : 'text-gray-500 hover:text-primary'
              }`}
            >
              <Icon className={`h-5 w-5 mb-1 ${active ? 'text-primary' : 'text-gray-500'}`} />
              <span className={`text-xs font-medium ${active ? 'text-primary' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
