import React from 'react';
import { Invoice } from '../types';
import { Button } from './Button';
import { Plus, Search, FileText, CheckCircle, Clock } from 'lucide-react';
import { formatCurrency, calculateRowTotal } from '../utils/calculations';

interface Props {
  invoices: Invoice[];
  onCreate: () => void;
  onSelect: (invoice: Invoice) => void;
  onLogout: () => void;
  username: string;
}

export const InvoiceList: React.FC<Props> = ({ invoices, onCreate, onSelect, onLogout, username }) => {
  const [search, setSearch] = React.useState('');

  const filtered = invoices.filter(inv => 
    inv.name.toLowerCase().includes(search.toLowerCase()) || 
    inv.date.includes(search)
  ).sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="h-full flex flex-col bg-slate-900">
      <nav className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center shrink-0">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">
              H
            </div>
            <h1 className="text-xl font-bold text-slate-100 hidden sm:block">Hisaab Kitaab</h1>
         </div>
         <div className="flex items-center gap-4">
           <span className="text-slate-400 text-sm hidden sm:block">Welcome, <span className="text-white">{username}</span></span>
           <Button variant="secondary" onClick={onLogout} className="text-xs">Logout</Button>
         </div>
      </nav>

      <div className="flex-1 overflow-auto p-4 sm:p-8">
        <div className="max-w-5xl mx-auto">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
             <div>
                <h2 className="text-2xl font-bold text-white">Invoices</h2>
                <p className="text-slate-400 text-sm">Manage your medical billing history</p>
             </div>
             <Button onClick={onCreate}>
               <Plus size={18} /> Create Invoice
             </Button>
           </div>

           <div className="mb-6 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Search invoices by name or date..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-slate-200"
              />
           </div>

           {filtered.length === 0 ? (
             <div className="text-center py-20 text-slate-500 bg-slate-800/50 rounded-lg border border-slate-700 border-dashed">
               <FileText className="mx-auto mb-4 opacity-50" size={48} />
               <p>No invoices found. Create one to get started.</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
               {filtered.map(inv => {
                 // Quick Calc for card display
                 const total = inv.items.reduce((sum, i) => sum + calculateRowTotal(i), 0);
                 const paid = inv.payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
                 const balance = total - paid;

                 return (
                   <div 
                    key={inv.id} 
                    onClick={() => onSelect(inv)}
                    className="bg-slate-800 p-5 rounded-lg border border-slate-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all cursor-pointer group"
                   >
                     <div className="flex justify-between items-start mb-3">
                        <div className="font-bold text-lg text-white group-hover:text-blue-400 truncate pr-2">{inv.name}</div>
                        <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${inv.status === 'Paid' ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'}`}>
                           {inv.status === 'Paid' ? <CheckCircle size={10} /> : <Clock size={10} />}
                           {inv.status}
                        </span>
                     </div>
                     <div className="text-slate-400 text-sm mb-4">{inv.date}</div>
                     <div className="flex justify-between items-end border-t border-slate-700 pt-3">
                        <div className="text-xs text-slate-500">
                          Total: {formatCurrency(total)}
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-400">Balance</div>
                          <div className={`font-mono font-bold ${balance > 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {formatCurrency(balance)}
                          </div>
                        </div>
                     </div>
                   </div>
                 )
               })}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};