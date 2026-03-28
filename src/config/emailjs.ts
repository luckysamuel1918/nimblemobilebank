
import emailjs from '@emailjs/browser';

const EMAILJS_CONFIG = {
  serviceId: 'service_27dimqt',
  publicKey: 'XiKkaXx4HIwQb00-G',
  templates: {
    debit: 'template_ms0phzn',
    credit: 'template_kozdmyg'
  }
};

// Initialize EmailJS
export const initEmailJS = () => {
  try {
    emailjs.init({
      publicKey: EMAILJS_CONFIG.publicKey,
      blockHeadless: true,
      limitRate: {
        id: 'app',
        throttle: 10000,
      },
    });
    console.log('EmailJS initialized successfully with public key:', EMAILJS_CONFIG.publicKey);
    return true;
  } catch (error) {
    console.error('Failed to initialize EmailJS:', error);
    return false;
  }
};

export const sendDebitAlert = async (templateParams: {
  customer_name: string;
  amount: string;
  recipient_name: string;
  date_time: string;
  description: string;
  balance: string;
  to_email: string;
  name: string;
  from_email: string;
  email: string;
  subject: string;
}) => {
  try {
    console.log('Sending debit alert email...');
    
    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templates.debit,
      templateParams,
      {
        publicKey: EMAILJS_CONFIG.publicKey
      }
    );
    
    console.log('Debit alert sent successfully:', response);
    return { success: true, response };
  } catch (error) {
    console.error('Failed to send debit alert:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const sendCreditAlert = async (templateParams: {
  customer_name: string;
  amount: string;
  sender_name: string;
  date_time: string;
  description: string;
  balance: string;
  to_email: string;
  name: string;
  from_email: string;
  email: string;
  subject: string;
}) => {
  try {
    console.log('Sending credit alert email...');
    
    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templates.credit,
      templateParams,
      {
        publicKey: EMAILJS_CONFIG.publicKey
      }
    );
    
    console.log('Credit alert sent successfully:', response);
    return { success: true, response };
  } catch (error) {
    console.error('Failed to send credit alert:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
