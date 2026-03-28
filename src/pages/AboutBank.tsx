
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Calendar, Shield, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AboutBank = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Button 
          onClick={() => navigate('/')}
          variant="outline" 
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Westcoast Trust Bank</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your trusted financial partner for over two decades, serving customers with excellence and innovation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-blue-600" />
                Our History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Established in 2003, Westcoast Trust Bank has been serving customers for over 20 years with unwavering commitment to financial excellence.
              </p>
              <p className="text-gray-600">
                From our humble beginnings as a community bank, we've grown to become a trusted financial institution serving thousands of customers worldwide.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-green-600" />
                Our Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Customers</span>
                  <span className="font-bold text-2xl text-green-600">50,000+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Countries Served</span>
                  <span className="font-bold text-2xl text-blue-600">25+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Customer Satisfaction</span>
                  <span className="font-bold text-2xl text-purple-600">98%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5 text-blue-600" />
                Security First
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Bank-grade security with 256-bit encryption, multi-factor authentication, and 24/7 fraud monitoring to keep your money safe.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="mr-2 h-5 w-5 text-gold-600" />
                Award Winning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Recognized as "Best Digital Bank 2023" and "Customer Service Excellence Award" by leading financial publications.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-green-600" />
                Expert Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Our team of 500+ financial experts and customer service representatives are here to help you achieve your financial goals.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How We Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Digital First Approach</h3>
                <p className="text-gray-600">
                  We leverage cutting-edge technology to provide seamless banking experiences through our mobile app and web platform, available 24/7.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Personal Touch</h3>
                <p className="text-gray-600">
                  While we embrace technology, we never forget the human element. Our dedicated customer service team is always ready to assist you.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Global Reach</h3>
                <p className="text-gray-600">
                  With partnerships across 25+ countries, we enable seamless international transfers and global banking services.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Innovation</h3>
                <p className="text-gray-600">
                  We continuously invest in new technologies and services to stay ahead of the curve and meet evolving customer needs.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Card className="bg-blue-600 text-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Ready to Join Us?</h2>
              <p className="text-blue-100 mb-6">
                Experience the future of banking with Westcoast Trust Bank. Join thousands of satisfied customers today.
              </p>
              <Button 
                onClick={() => navigate('/user')}
                variant="secondary"
                size="lg"
              >
                Open an Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AboutBank;
