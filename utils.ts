import { Purchase, Sale } from "./types";

export const formatCurrency = (amount: number): string => {
  if (isNaN(amount)) return '£0.00';
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2
  }).format(amount);
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Check if a date string is within the configured tax year
export const isInTaxYear = (dateStr: string, start: string, end: string): boolean => {
  if (!dateStr) return false;
  
  const date = new Date(dateStr);
  const startDate = new Date(start);
  const endDate = new Date(end);

  // Check for invalid dates
  if (isNaN(date.getTime())) return false;

  return date >= startDate && date <= endDate;
};

// Calculate how many items from a purchase are remaining
export const getRemainingStock = (purchase: Purchase, allSales: Sale[]): number => {
  const soldCount = allSales
    .filter(s => s.purchaseId === purchase.id)
    .reduce((sum, sale) => sum + (Number(sale.quantitySold) || 0), 0);
  return purchase.quantity - soldCount;
};

// Helper to get today's date in local format YYYY-MM-DD
export const getTodayDate = (): string => {
  const d = new Date();
  // Adjust for timezone offset to ensure we get "today" locally, not UTC
  const offset = d.getTimezoneOffset();
  const localDate = new Date(d.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
};