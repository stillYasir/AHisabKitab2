import { User, Invoice } from '../types';

const DB_KEY = 'hisaab_kitaab_data_v1';

interface DB {
  users: Record<string, User>;
}

const getDB = (): DB => {
  const data = localStorage.getItem(DB_KEY);
  return data ? JSON.parse(data) : { users: {} };
};

const saveDB = (db: DB) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

export const authenticate = (username: string, password: string): User | null => {
  const db = getDB();
  const user = db.users[username];
  if (user && user.password === password) {
    return user;
  }
  return null;
};

export const registerOrLogin = (username: string, password: string): User => {
  const db = getDB();
  if (db.users[username]) {
    if (db.users[username].password === password) {
      return db.users[username];
    } else {
      throw new Error("Invalid password for existing user.");
    }
  }
  
  // Create new user
  const newUser: User = {
    username,
    password,
    invoices: []
  };
  
  db.users[username] = newUser;
  saveDB(db);
  return newUser;
};

export const saveInvoice = (username: string, invoice: Invoice): void => {
  const db = getDB();
  const user = db.users[username];
  if (!user) return;

  const existingIndex = user.invoices.findIndex(inv => inv.id === invoice.id);
  if (existingIndex >= 0) {
    user.invoices[existingIndex] = invoice;
  } else {
    user.invoices.push(invoice);
  }
  
  db.users[username] = user;
  saveDB(db);
};

export const getUserInvoices = (username: string): Invoice[] => {
  const db = getDB();
  return db.users[username]?.invoices || [];
};