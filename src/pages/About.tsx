
import React from 'react';
import { ArrowLeft, Shield, Users, Globe, Award, Clock, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();

  const values = [
    {
      icon: Shield,
      title: 'Security First',
      description: 'Your financial security is our top priority with bank-grade encryption and protection.',
      color: 'text-blue-600'
    },
    {
      icon: Users,
      title: 'Customer Focused',
      description: 'We put our customers at the heart of everything we do, providing personalized banking solutions.',
      color: 'text-green-600'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Access your money anywhere in the world with our extensive international network.',
      color: 'text-purple-600'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'Committed to delivering exceptional banking services that exceed expectations.',
      color: 'text-yellow-600'
    }
  ];

  const stats = [
    { number: '500K+', label: 'Happy Customers' },
    { number: '$2.5B', label: 'Assets Under Management' },
    { number: '50+', label: 'Countries Served' },
    { number: '15+', label: 'Years of Excellence' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold">About Westcoast Trust Bank</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Mission Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="p-8">
            <CardContent className="text-center">
              <div className="w-16 h-16 mx-auto mb-6">
                <img 
                  src="/lovable-uploads/2e27bb90-5008-46cc-a672-281c0761c779.png" 
                  alt="Westcoast Trust Bank" 
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                At Westcoast Trust Bank, we're revolutionizing digital banking by combining cutting-edge technology 
                with traditional banking values. Our mission is to provide secure, innovative, and accessible 
                financial services that empower individuals and businesses to achieve their financial goals.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Founded with the vision of making banking simple, secure, and accessible to everyone, we've grown 
                to become a trusted financial partner for hundreds of thousands of customers worldwide.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <CardContent>
                  <div className={`w-12 h-12 mx-auto mb-4 ${value.color}`}>
                    <value.icon className="w-full h-full" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-12">
          <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8">
            <CardContent>
              <h2 className="text-3xl font-bold text-center mb-8">Our Impact</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <p className="text-3xl sm:text-4xl font-bold mb-2">{stat.number}</p>
                    <p className="text-blue-100 text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Story Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="p-8">
            <CardContent>
              <h2 className="text-3xl font-bold mb-6 text-center">Our Story</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Westcoast Trust Bank was born from a simple belief: banking should be accessible, secure, 
                  and tailored to the needs of modern consumers. Founded by a team of financial experts and 
                  technology innovators, we set out to bridge the gap between traditional banking and the 
                  digital age.
                </p>
                <p>
                  Since our inception, we've been committed to leveraging the latest technology to provide 
                  our customers with seamless banking experiences. From instant transfers to AI-powered 
                  financial insights, we're constantly innovating to stay ahead of our customers' needs.
                </p>
                <p>
                  Today, we're proud to serve customers across the globe, offering a comprehensive suite 
                  of digital banking services that make managing finances simple, secure, and efficient. 
                  Our journey is far from over – we're continuously evolving to meet the changing needs 
                  of the financial landscape.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact CTA */}
        <div className="text-center">
          <Card className="p-8 bg-gray-100">
            <CardContent>
              <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Ready to Join Our Family?</h2>
              <p className="text-gray-600 mb-6">
                Experience the future of banking with Westcoast Trust Bank. Join thousands of satisfied customers today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => navigate('/user')} size="lg">
                  Get Started
                </Button>
                <Button variant="outline" onClick={() => navigate('/contact')} size="lg">
                  Contact Us
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;
