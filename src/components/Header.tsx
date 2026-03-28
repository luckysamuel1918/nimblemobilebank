
import React from 'react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img 
                src="/lovable-uploads/2e27bb90-5008-46cc-a672-281c0761c779.png" 
                alt="Westcoast Trust Bank" 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">
              Westcoast Trust Bank
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-primary transition-colors"
            >
              Home
            </button>
            <button 
              onClick={() => navigate('/about')}
              className="text-gray-600 hover:text-primary transition-colors"
            >
              About
            </button>
            <button 
              onClick={() => navigate('/contact')}
              className="text-gray-600 hover:text-primary transition-colors"
            >
              Contact
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/user')}
              className="hidden sm:flex"
            >
              Login
            </Button>
            <Button onClick={() => navigate('/user')}>
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
