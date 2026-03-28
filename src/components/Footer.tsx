
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  const WestCoastLogo = () => (
    <div className="flex items-center space-x-2">
      <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
        <img 
          src="/lovable-uploads/2e27bb90-5008-46cc-a672-281c0761c779.png" 
          alt="West Coast Trust Bank Logo" 
          className="w-8 h-8 object-cover rounded-full"
        />
      </div>
      <span className="text-xl font-bold">Westcoast Trust Bank</span>
    </div>
  );

  return (
    <footer className="bg-bank-dark text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <WestCoastLogo />
            <p className="text-gray-300 text-sm">
              Experience the future of digital banking with secure, innovative financial solutions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigate('/user')} className="text-gray-300 hover:text-white transition-colors">Personal Banking</button></li>
              <li><button onClick={() => navigate('/user')} className="text-gray-300 hover:text-white transition-colors">Business Banking</button></li>
              <li><button onClick={() => navigate('/user')} className="text-gray-300 hover:text-white transition-colors">Loans</button></li>
              <li><button onClick={() => navigate('/user')} className="text-gray-300 hover:text-white transition-colors">Investment</button></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigate('/user')} className="text-gray-300 hover:text-white transition-colors">Mobile Banking</button></li>
              <li><button onClick={() => navigate('/user')} className="text-gray-300 hover:text-white transition-colors">Online Transfers</button></li>
              <li><button onClick={() => navigate('/user')} className="text-gray-300 hover:text-white transition-colors">Bill Payments</button></li>
              <li><button onClick={() => navigate('/user')} className="text-gray-300 hover:text-white transition-colors">Customer Support</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-bank-teal" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-bank-teal" />
                <span className="text-gray-300">support@westcoasttrusts.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-bank-teal" />
                <span className="text-gray-300">123 Financial District, CA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 Westcoast Trust Bank. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Facebook className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
            <Twitter className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
            <Instagram className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
