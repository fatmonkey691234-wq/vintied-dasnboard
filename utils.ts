import { Purchase, Sale } from "./types";

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2
  }).format(amount);
};

// Generate a random ID for records
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Check if a date string is within the configured tax year
export const isInTaxYear = (dateStr: string, start: string, end: string): boolean => {
  const date = new Date(dateStr);
  const startDate = new Date(start);
  const endDate = new Date(end);
  return date >= startDate && date <= endDate;
};

// Calculate how many items from a purchase are remaining
export const getRemainingStock = (purchase: Purchase, allSales: Sale[]): number => {
  const soldCount = allSales
    .filter(s => s.purchaseId === purchase.id)
    .reduce((sum, sale) => sum + sale.quantitySold, 0);
  return purchase.quantity - soldCount;
};
