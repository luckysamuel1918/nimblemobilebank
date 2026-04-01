
import emailjs from '@emailjs/browser';

const EMAILJS_CONFIG = {
  serviceId: 'service_ygumefc',
  publicKey: 'l-F4pyiQMAgEGjwoa',
  privateKey: 'jfcfnkmbtsPdUZGJqEYbC',
  templates: {
    debit: 'template_y8higl5',
    credit: 'template_y8higl5',
    otp: 'template_ryueuy5'
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

export const sendOtpEmail = async (templateParams: {
  subject: string;
  customer_name: string;
  otp_code: string;
  expiry_minutes: string;
  verification_link: string;
  year: string;
  to_email: string;
  from_name: string;
  reply_to: string;
}) => {
  try {
    console.log('Sending OTP email...');
    
    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templates.otp,
      templateParams,
      {
        publicKey: EMAILJS_CONFIG.publicKey
      }
    );
    
    console.log('OTP email sent successfully:', response);
    return { success: true, response };
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
