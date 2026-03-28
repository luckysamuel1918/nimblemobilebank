
import { CreditCard, TrendingUp, PiggyBank, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AccountOverview = () => {
  const accounts = [
    {
      name: 'Main Checking',
      balance: '24,582.50',
      change: '+2.5%',
      icon: Wallet,
      color: 'bg-gradient-to-r from-blue-500 to-teal-500'
    },
    {
      name: 'Savings',
      balance: '12,450.00',
      change: '+1.8%',
      icon: PiggyBank,
      color: 'bg-gradient-to-r from-green-500 to-emerald-500'
    },
    {
      name: 'Credit Card',
      balance: '-1,234.56',
      change: '23% utilization',
      icon: CreditCard,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500'
    },
    {
      name: 'Investment',
      balance: '45,678.90',
      change: '+12.3%',
      icon: TrendingUp,
      color: 'bg-gradient-to-r from-orange-500 to-red-500'
    }
  ];

  return (
    <section id="accounts" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Your Financial Overview</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get a complete view of all your accounts in one place with real-time updates and insights.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {accounts.map((account, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">{account.name}</CardTitle>
                  <div className={`p-2 rounded-lg ${account.color}`}>
                    <account.icon className="h-4 w-4 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <p className="text-2xl font-bold">${account.balance}</p>
                  <p className="text-sm text-green-600">{account.change}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold mb-6">Quick Actions</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-b from-blue-50 to-blue-100 rounded-xl hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <h4 className="font-semibold mb-2">Send Money</h4>
              <p className="text-sm text-gray-600">Transfer to friends and family instantly</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-b from-green-50 to-green-100 rounded-xl hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <h4 className="font-semibold mb-2">Request Payment</h4>
              <p className="text-sm text-gray-600">Get paid quickly with payment requests</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-b from-purple-50 to-purple-100 rounded-xl hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="font-semibold mb-2">View Analytics</h4>
              <p className="text-sm text-gray-600">Track spending and financial insights</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AccountOverview;
