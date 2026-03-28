import { countries } from '@/data/countries';

export interface UserData {
  country?: string;
  [key: string]: any;
}

/**
 * Get currency symbol based on user's country
 */
export const getCurrencySymbol = (userData?: UserData | null): string => {
  if (!userData?.country) return '$';
  
  const userCountry = countries.find(c => c.code === userData.country);
  return userCountry?.currencySymbol || '$';
};

/**
 * Get currency code based on user's country
 */
export const getCurrencyCode = (userData?: UserData | null): string => {
  if (!userData?.country) return 'USD';
  
  const userCountry = countries.find(c => c.code === userData.country);
  return userCountry?.currency || 'USD';
};

/**
 * Format currency amount with proper symbol and formatting
 */
export const formatCurrency = (
  amount: number, 
  userData?: UserData | null,
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string => {
  const symbol = getCurrencySymbol(userData);
  const formattedAmount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: options?.minimumFractionDigits || 2,
    maximumFractionDigits: options?.maximumFractionDigits || 2
  }).format(amount || 0);
  
  return `${symbol}${formattedAmount}`;
};

/**
 * Format currency for display with symbol and currency code
 */
export const formatCurrencyWithCode = (
  amount: number,
  userData?: UserData | null
): { symbol: string; amount: string; code: string } => {
  return {
    symbol: getCurrencySymbol(userData),
    amount: new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0),
    code: getCurrencyCode(userData)
  };
};