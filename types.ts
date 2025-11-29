export interface InvoiceItem {
  id: string;
  name: string;
  qty: number | '';
  rate: number | '';
  discountPercent: number | ''; // 0, negative, or positive
}

export interface Payment {
  id: string;
  narration: string;
  amount: number | '';
}

export interface Invoice {
  id: string;
  name: string;
  date: string;
  status: 'Pending' | 'Paid';
  items: InvoiceItem[];
  payments: Payment[];
  createdAt: number;
}

export interface User {
  username: string;
  password: string; // Stored in plaintext for this demo as requested (simulated auth)
  invoices: Invoice[];
}

export type ViewState = 'LOGIN' | 'DASHBOARD' | 'EDITOR';