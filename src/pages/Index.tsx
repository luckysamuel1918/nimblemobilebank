
import React, { useEffect } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Footer from '@/components/Footer';

const Index = () => {
  useEffect(() => {
    // Update document title
    document.title = 'Westcoast Trust Bank - Your Trusted Banking Partner';
    
    // Load JivoChat only on homepage
    const script = document.createElement('script');
    script.src = '';
    script.async = true;
    document.head.appendChild(script);

    // Cleanup function to remove the script when component unmounts
    return () => {
      const existingScript = document.querySelector('script[src=""]');
      if (existingScript) {
        existingScript.remove();
      }
      // Clear JivoChat if it exists
      if ((window as any).jivo_api) {
        try {
          (window as any).jivo_api.clearHistory();
        } catch (error) {
          console.log('Error clearing JivoChat:', error);
        }
      }
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <Footer />
    </div>
  );
};

export default Index;
