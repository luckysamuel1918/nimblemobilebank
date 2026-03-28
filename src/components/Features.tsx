
import React from 'react';
import { Shield, Smartphone, CreditCard, Headphones, Globe, TrendingUp } from 'lucide-react';

const Features = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose Our Banking Services
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience banking like never before with our cutting-edge technology and personalized service
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
              <Shield className="h-6 w-6 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Bank-Level Security</h3>
            <p className="text-gray-600">
              Your money is protected with enterprise-grade security and 256-bit encryption
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
              <Smartphone className="h-6 w-6 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Mobile First</h3>
            <p className="text-gray-600">
              Manage your finances on-the-go with our intuitive mobile banking app
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
              <CreditCard className="h-6 w-6 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Cards</h3>
            <p className="text-gray-600">
              Contactless payments and real-time notifications for every transaction
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
              <Headphones className="h-6 w-6 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">24/7 Support</h3>
            <p className="text-gray-600">
              Get help whenever you need it with our round-the-clock customer support
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
              <Globe className="h-6 w-6 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Global Access</h3>
            <p className="text-gray-600">
              Access your accounts from anywhere in the world with no foreign transaction fees
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
              <TrendingUp className="h-6 w-6 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Investment Tools</h3>
            <p className="text-gray-600">
              Grow your wealth with our comprehensive investment and savings products
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
