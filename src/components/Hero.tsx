
import { ArrowRight, Shield, Smartphone, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Main Hero Section */}
      <section id="home" className="min-h-screen bg-gradient-bank text-white relative overflow-hidden pt-16">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-20 h-20 bg-white rounded-full blur-xl"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-bank-teal rounded-full blur-2xl"></div>
          <div className="absolute bottom-40 left-20 w-24 h-24 bg-bank-blue rounded-full blur-xl"></div>
        </div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                  Your Money.
                  <span className="block text-bank-teal">Safe. Simple. Secure.</span>
                </h1>
                <p className="text-lg text-gray-300 max-w-lg">
                  Experience the future of digital banking with instant transfers, 
                  smart insights, and complete financial control at your fingertips.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="sm" className="bg-white text-bank-dark hover:bg-gray-100 group no-zoom" onClick={() => navigate('/user')}>
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" size="sm" className="border-white text-white hover:bg-white hover:text-bank-dark no-zoom">
                  Watch Demo
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 pt-6">
                <div className="text-center space-y-2">
                  <Shield className="h-6 w-6 text-bank-teal mx-auto" />
                  <p className="text-xs text-gray-300">Bank-grade Security</p>
                </div>
                <div className="text-center space-y-2">
                  <Smartphone className="h-6 w-6 text-bank-teal mx-auto" />
                  <p className="text-xs text-gray-300">Mobile First</p>
                </div>
                <div className="text-center space-y-2">
                  <Zap className="h-6 w-6 text-bank-teal mx-auto" />
                  <p className="text-xs text-gray-300">Instant Transfers</p>
                </div>
              </div>
            </div>

            {/* Right Content - Bank Building Image */}
            <div className="relative animate-slide-up">
              <div className="relative mx-auto">
                <img 
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Modern Bank Building" 
                  className="w-full h-[480px] object-cover rounded-[2rem] shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bank-blue/30 to-transparent rounded-[2rem]"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bank Hero Pictures Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Experience Modern Banking</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover the future of financial services with our state-of-the-art facilities and cutting-edge technology.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Digital Banking */}
            <div 
              className="relative group overflow-hidden rounded-xl shadow-lg animate-fade-in cursor-pointer"
              onClick={() => navigate('/about-bank')}
            >
              <img 
                src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Digital Banking Interface" 
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-lg font-bold mb-1">Digital Innovation</h3>
                <p className="text-sm opacity-90">Experience banking with the latest technology</p>
                <p className="text-xs text-blue-300 mt-1">Click to learn more →</p>
              </div>
            </div>

            {/* Professional Service */}
            <div 
              className="relative group overflow-hidden rounded-xl shadow-lg animate-fade-in cursor-pointer" 
              style={{ animationDelay: '0.1s' }}
              onClick={() => navigate('/about-bank')}
            >
              <img 
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Professional Banking Service" 
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-lg font-bold mb-1">Expert Guidance</h3>
                <p className="text-sm opacity-90">Professional financial advisors ready to help</p>
                <p className="text-xs text-blue-300 mt-1">Click to learn more →</p>
              </div>
            </div>

            {/* Mobile Banking */}
            <div 
              className="relative group overflow-hidden rounded-xl shadow-lg animate-fade-in cursor-pointer" 
              style={{ animationDelay: '0.2s' }}
              onClick={() => navigate('/about-bank')}
            >
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Mobile Banking Convenience" 
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-lg font-bold mb-1">Anywhere Access</h3>
                <p className="text-sm opacity-90">Bank from anywhere, anytime</p>
                <p className="text-xs text-blue-300 mt-1">Click to learn more →</p>
              </div>
            </div>

            {/* Secure Banking */}
            <div 
              className="relative group overflow-hidden rounded-xl shadow-lg animate-fade-in md:col-span-2 lg:col-span-1 cursor-pointer" 
              style={{ animationDelay: '0.3s' }}
              onClick={() => navigate('/about-bank')}
            >
              <img 
                src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Secure Banking Vault" 
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-lg font-bold mb-1">Secure Environment</h3>
                <p className="text-sm opacity-90">Your financial data is protected</p>
                <p className="text-xs text-blue-300 mt-1">Click to learn more →</p>
              </div>
            </div>

            {/* Modern Branch */}
            <div 
              className="relative group overflow-hidden rounded-xl shadow-lg animate-fade-in md:col-span-2 cursor-pointer" 
              style={{ animationDelay: '0.4s' }}
              onClick={() => navigate('/about-bank')}
            >
              <div className="w-full h-64 bg-gradient-to-br from-bank-blue to-bank-teal flex items-center justify-center">
                <div className="text-center text-white p-6">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Visit Our Branch</h3>
                  <p className="text-sm opacity-90 mb-4">Experience personalized service at our modern banking centers</p>
                  <p className="text-xs text-blue-200">Click to learn more about our locations →</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
