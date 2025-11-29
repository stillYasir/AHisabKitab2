import { InvoiceItem } from '../types';

export const calculateTP = (rate: number): number => {
  // TP = Rate - 14.5%
  return rate - (rate * 0.145);
};

export const calculateItemTotalPerPiece = (item: InvoiceItem): number => {
  const rate = Number(item.rate) || 0;
  if (rate === 0) return 0;

  const tp = calculateTP(rate);
  const discount = Number(item.discountPercent);

  // If no discount is input (empty or 0 explicitly treated as neutral if needed, but requirements say 0 until input),
  // However, mathematically if discount is 0, we usually just take the TP.
  // The requirement says: "Discount column must remain 0 until user inputs a value. No calculations should run until user enters a discount value."
  // Interpreting this: if discount is empty/0, use standard TP.
  
  if (!item.discountPercent && item.discountPercent !== 0) {
    return tp;
  }

  if (discount === 0) return tp;

  // If discount exists (Positive or Negative):
  // First convert TP to: TP - 15% (fixed)
  const baseForDiscount = tp - (tp * 0.15);

  if (discount < 0) {
    // Case A: Negative value (-X%) = Extra Discount
    // Subtract user's additional negative % from this new TP.
    // E.g. -10 means remove 10% from base.
    return baseForDiscount * (1 - Math.abs(discount) / 100);
  } else {
    // Case B: Positive value (+X%) = Extra Charges
    // Add user's positive % to this new TP.
    return baseForDiscount * (1 + discount / 100);
  }
};

export const calculateRowTotal = (item: InvoiceItem): number => {
  const qty = Number(item.qty) || 0;
  const pricePerPiece = calculateItemTotalPerPiece(item);
  return qty * pricePerPiece;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};