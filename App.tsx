import React, { useState, useEffect } from 'react';
import { User, Invoice, ViewState } from './types';
import { Auth } from './components/Auth';
import { InvoiceList } from './components/InvoiceList';
import { InvoiceEditor } from './components/InvoiceEditor';
import { getUserInvoices } from './services/db';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>('LOGIN');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [userInvoices, setUserInvoices] = useState<Invoice[]>([]);

  // Refresh invoices whenever switching to Dashboard
  useEffect(() => {
    if (user && view === 'DASHBOARD') {
      const invs = getUserInvoices(user.username);
      setUserInvoices(invs);
    }
  }, [user, view]);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setView('DASHBOARD');
  };

  const handleLogout = () => {
    setUser(null);
    setView('LOGIN');
    setSelectedInvoice(null);
  };

  const handleCreate = () => {
    setSelectedInvoice(null);
    setView('EDITOR');
  };

  const handleSelectInvoice = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setView('EDITOR');
  };

  const handleBackToDashboard = () => {
    setView('DASHBOARD');
    setSelectedInvoice(null);
  };

  if (!user || view === 'LOGIN') {
    return <Auth onLogin={handleLogin} />;
  }

  if (view === 'EDITOR') {
    return (
      <InvoiceEditor 
        currentUser={user.username}
        initialInvoice={selectedInvoice}
        onBack={handleBackToDashboard}
      />
    );
  }

  return (
    <InvoiceList 
      invoices={userInvoices}
      username={user.username}
      onCreate={handleCreate}
      onSelect={handleSelectInvoice}
      onLogout={handleLogout}
    />
  );
};

export default App;