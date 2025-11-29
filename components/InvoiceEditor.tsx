import React, { useState, useEffect, useRef } from 'react';
import { Invoice, InvoiceItem, Payment } from '../types';
import { calculateTP, calculateItemTotalPerPiece, calculateRowTotal, formatCurrency } from '../utils/calculations';
import { Button } from './Button';
import { Trash2, Plus, ArrowLeft, Save, Printer, Copy } from 'lucide-react';
import { saveInvoice } from '../services/db';

interface Props {
  currentUser: string;
  initialInvoice?: Invoice | null;
  onBack: () => void;
}

const emptyItem = (): InvoiceItem => ({
  id: Math.random().toString(36).substr(2, 9),
  name: '',
  qty: '',
  rate: '',
  discountPercent: ''
});

const emptyPayment = (): Payment => ({
  id: Math.random().toString(36).substr(2, 9),
  narration: '',
  amount: ''
});

export const InvoiceEditor: React.FC<Props> = ({ currentUser, initialInvoice, onBack }) => {
  // Metadata
  const [invName, setInvName] = useState(initialInvoice?.name || '');
  const [invDate, setInvDate] = useState(initialInvoice?.date || new Date().toISOString().split('T')[0]);
  const [invStatus, setInvStatus] = useState<'Pending'|'Paid'>(initialInvoice?.status || 'Pending');
  
  // Data
  const [items, setItems] = useState<InvoiceItem[]>(initialInvoice?.items || [emptyItem()]);
  const [payments, setPayments] = useState<Payment[]>(initialInvoice?.payments || []);

  const tableRef = useRef<HTMLTableElement>(null);

  // Totals
  const totalAmount = items.reduce((sum, item) => sum + calculateRowTotal(item), 0);
  const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const balance = totalAmount - totalPaid;

  // Handlers
  const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      return { ...item, [field]: value };
    }));
  };

  const addItem = () => setItems(prev => [...prev, emptyItem()]);
  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const addPayment = () => setPayments(prev => [...prev, emptyPayment()]);
  const handlePaymentChange = (id: string, field: keyof Payment, value: string | number) => {
    setPayments(prev => prev.map(p => {
      if (p.id !== id) return p;
      return { ...p, [field]: value };
    }));
  };
  const removePayment = (id: string) => setPayments(prev => prev.filter(p => p.id !== id));

  const handleSave = () => {
    if (!invName) {
      alert("Please enter an Invoice Name");
      return;
    }

    const newInvoice: Invoice = {
      id: initialInvoice?.id || Math.random().toString(36).substr(2, 9),
      name: invName,
      date: invDate,
      status: invStatus,
      items,
      payments,
      createdAt: initialInvoice?.createdAt || Date.now()
    };
    
    saveInvoice(currentUser, newInvoice);
    alert("Invoice Saved Successfully!");
  };

  // Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + D: Duplicate last row
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        const lastItem = items[items.length - 1];
        if (lastItem) {
          setItems(prev => [...prev, { ...lastItem, id: Math.random().toString(36).substr(2, 9) }]);
        }
      }
      
      // Arrow navigation could be implemented here via explicit focus management
      // Simple implementation: standard tab/shift+tab works. 
      // For detailed arrow nav, we'd need a grid of refs.
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 overflow-hidden">
      {/* Header - No Print */}
      <div className="no-print p-4 border-b border-slate-700 bg-slate-800 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-xl font-bold text-blue-400">
            {initialInvoice ? 'Edit Invoice' : 'New Invoice'}
          </h2>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handlePrint}>
            <Printer size={18} /> Print
          </Button>
          <Button onClick={handleSave}>
            <Save size={18} /> Save
          </Button>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-auto p-2 sm:p-6 print:p-0 print:overflow-visible">
        <div className="max-w-7xl mx-auto bg-slate-800 p-6 rounded-lg shadow-xl print:shadow-none print:bg-white print:text-black">
          
          {/* Print Header */}
          <div className="hidden print:flex justify-between items-center mb-8 border-b pb-4">
            <div>
              <h1 className="text-3xl font-bold">Hisaab Kitaab</h1>
              <p className="text-sm text-gray-500">Medical Invoice Management</p>
            </div>
            <div className="text-right">
              <h3 className="text-xl font-bold">{invName}</h3>
              <p>{invDate}</p>
            </div>
          </div>

          {/* Metadata Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 print:hidden">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Invoice Name</label>
              <input 
                type="text" 
                value={invName} 
                onChange={e => setInvName(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Batch 101"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Date</label>
              <input 
                type="date" 
                value={invDate} 
                onChange={e => setInvDate(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Status</label>
              <select 
                value={invStatus} 
                onChange={e => setInvStatus(e.target.value as any)}
                className="w-full bg-slate-700 border border-slate-600 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-left border-collapse" ref={tableRef}>
              <thead>
                <tr className="bg-slate-700 print:bg-gray-200 print:text-black text-slate-200 text-xs uppercase tracking-wider">
                  <th className="p-3 rounded-tl">Item Name</th>
                  <th className="p-3 w-20">QTY</th>
                  <th className="p-3 w-24">Rate</th>
                  <th className="p-3 w-24">T.P (-14.5%)</th>
                  <th className="p-3 w-24">Disc %</th>
                  <th className="p-3 w-28">Total/Pc</th>
                  <th className="p-3 w-32 text-right rounded-tr">Amount</th>
                  <th className="p-3 w-10 no-print"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700 print:divide-gray-300">
                {items.map((item, idx) => {
                  const tp = item.rate ? calculateTP(Number(item.rate)) : 0;
                  const perPiece = calculateItemTotalPerPiece(item);
                  const rowTotal = calculateRowTotal(item);

                  return (
                    <tr key={item.id} className="hover:bg-slate-700/50 print:hover:bg-white group transition-colors">
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={e => handleItemChange(item.id, 'name', e.target.value)}
                          className="w-full bg-transparent border-none focus:ring-0 p-1 print:text-black placeholder-slate-600"
                          placeholder="Item Name"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={item.qty}
                          onChange={e => handleItemChange(item.id, 'qty', e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full bg-transparent border-b border-slate-600 focus:border-blue-500 focus:outline-none p-1 text-center print:text-black print:border-none"
                          placeholder="0"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={item.rate}
                          onChange={e => handleItemChange(item.id, 'rate', e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full bg-transparent border-b border-slate-600 focus:border-blue-500 focus:outline-none p-1 text-center print:text-black print:border-none"
                          placeholder="0"
                        />
                      </td>
                      <td className="p-2 text-slate-400 print:text-black text-center font-mono text-sm">
                        {item.rate ? tp.toFixed(2) : '-'}
                      </td>
                      <td className="p-2">
                         <input
                          type="number"
                          value={item.discountPercent}
                          onChange={e => handleItemChange(item.id, 'discountPercent', e.target.value === '' ? '' : Number(e.target.value))}
                          className={`w-full bg-transparent border-b border-slate-600 focus:border-blue-500 focus:outline-none p-1 text-center font-bold print:border-none ${
                             Number(item.discountPercent) < 0 ? 'text-green-400 print:text-green-700' : Number(item.discountPercent) > 0 ? 'text-red-400 print:text-red-700' : 'text-slate-500'
                          }`}
                          placeholder="0"
                        />
                      </td>
                      <td className="p-2 text-slate-300 print:text-black text-center font-mono text-sm">
                        {perPiece ? perPiece.toFixed(2) : '-'}
                      </td>
                      <td className="p-2 text-right font-bold text-blue-300 print:text-black">
                        {formatCurrency(rowTotal)}
                      </td>
                      <td className="p-2 text-center no-print">
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          tabIndex={-1}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                 <tr className="bg-slate-700/50 print:bg-gray-100 font-bold border-t border-slate-600 print:border-gray-400">
                   <td colSpan={6} className="p-3 text-right text-slate-300 print:text-black uppercase text-sm">Total Amount</td>
                   <td className="p-3 text-right text-xl text-blue-400 print:text-black">{formatCurrency(totalAmount)}</td>
                   <td className="no-print"></td>
                 </tr>
              </tfoot>
            </table>
          </div>

          <div className="mb-8 no-print">
            <Button variant="secondary" onClick={addItem} className="w-full sm:w-auto text-sm">
              <Plus size={16} /> Add Item (Ctrl+D to duplicate)
            </Button>
          </div>

          {/* Payments Section */}
          <div className="mb-8 break-inside-avoid">
            <h3 className="text-lg font-semibold mb-4 text-slate-300 print:text-black border-b border-slate-700 pb-2">Payments & Balance</h3>
            
            <div className="space-y-2">
               {payments.map(pay => (
                 <div key={pay.id} className="grid grid-cols-12 gap-2 items-center bg-slate-700/30 p-2 rounded print:bg-transparent print:border-b print:border-gray-200">
                    <div className="col-span-7 sm:col-span-8">
                       <input 
                          type="text"
                          value={pay.narration}
                          onChange={e => handlePaymentChange(pay.id, 'narration', e.target.value)}
                          placeholder="Payment Narration (e.g. Cash Advance)"
                          className="w-full bg-transparent border-none focus:ring-0 text-sm print:text-black"
                       />
                    </div>
                    <div className="col-span-4 sm:col-span-3 text-right">
                       <input 
                          type="number"
                          value={pay.amount}
                          onChange={e => handlePaymentChange(pay.id, 'amount', e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="Amount"
                          className="w-full bg-transparent border-b border-slate-600 focus:border-blue-500 text-right font-mono text-green-400 print:text-black print:border-none"
                       />
                    </div>
                    <div className="col-span-1 text-center no-print">
                      <button onClick={() => removePayment(pay.id)} className="text-slate-500 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                 </div>
               ))}
            </div>

            <div className="mt-4 flex justify-between items-center no-print">
               <Button variant="secondary" onClick={addPayment} className="text-sm">
                  <Plus size={14} /> Add Paid Amount
               </Button>
            </div>

            <div className="mt-6 border-t-2 border-slate-600 pt-4 flex flex-col gap-2 items-end">
               <div className="flex justify-between w-full max-w-xs text-slate-400 print:text-gray-600">
                  <span>Gross Total:</span>
                  <span>{formatCurrency(totalAmount)}</span>
               </div>
               <div className="flex justify-between w-full max-w-xs text-green-400 print:text-black">
                  <span>Total Paid:</span>
                  <span>- {formatCurrency(totalPaid)}</span>
               </div>
               <div className="flex justify-between w-full max-w-xs text-2xl font-bold text-white print:text-black border-t border-slate-600 pt-2 mt-2">
                  <span>Balance:</span>
                  <span>{formatCurrency(balance)}</span>
               </div>
            </div>
          </div>
          
          {/* Footer Branding */}
          <div className="mt-12 text-center text-xs text-slate-600 print:text-gray-500 border-t border-slate-800 print:border-gray-200 pt-4">
            All Rights Reserved 2025 — Yasir
          </div>
        </div>
      </div>
    </div>
  );
};