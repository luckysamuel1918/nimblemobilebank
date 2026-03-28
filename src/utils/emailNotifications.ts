
import { sendDebitAlert, sendCreditAlert } from '@/config/emailjs';

export const sendTransactionEmail = async (
  type: 'debit' | 'credit',
  userData: any,
  transactionData: {
    amount: number;
    recipientName?: string;
    senderName?: string;
    description: string;
    newBalance: number;
  }
) => {
  try {
    const dateTime = new Date().toLocaleString();
    
    const commonParams = {
      customer_name: `${userData.firstName} ${userData.lastName}`,
      amount: `$${transactionData.amount.toLocaleString()}`,
      date_time: dateTime,
      description: transactionData.description,
      balance: `$${transactionData.newBalance.toLocaleString()}`,
      to_email: userData.email,
      name: `${userData.firstName} ${userData.lastName}`,
      from_email: 'noreply@westcoasttrust.com',
      email: userData.email
    };

    if (type === 'debit') {
      const debitParams = {
        ...commonParams,
        recipient_name: transactionData.recipientName || 'N/A',
        subject: 'DEBIT ALERT - Westcoast Trust Bank'
      };
      
      return await sendDebitAlert(debitParams);
    } else {
      const creditParams = {
        ...commonParams,
        sender_name: transactionData.senderName || 'Westcoast Trust Bank',
        subject: 'CREDIT ALERT - Westcoast Trust Bank'
      };
      
      return await sendCreditAlert(creditParams);
    }
  } catch (error) {
    console.error('Error sending transaction email:', error);
    return { success: false, error };
  }
};
