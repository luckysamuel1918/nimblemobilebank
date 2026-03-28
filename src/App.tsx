import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from './pages/Index';
import About from './pages/About';
import Contact from './pages/Contact';
import UserAuth from './pages/UserAuth';
import AdminLogin from './pages/AdminLogin';
import Cards from './pages/Cards';
import Payments from './pages/Payments';
import Loan from './pages/Loan';
import SetPin from './pages/SetPin';
import PinVerification from './pages/PinVerification';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Toaster } from "@/components/ui/toaster"
import AboutBank from './pages/AboutBank';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/about-bank" element={<AboutBank />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/user" element={<UserAuth />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/cards" element={<Cards />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/loan" element={<Loan />} />
            <Route path="/set-pin" element={<ProtectedRoute><SetPin /></ProtectedRoute>} />
            <Route path="/pin-verification" element={<ProtectedRoute><PinVerification /></ProtectedRoute>} />
            <Route path="/user-dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
            <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
