import React, { useState } from 'react';
import { registerOrLogin } from '../services/db';
import { Button } from './Button';
import { User } from '../types';

interface Props {
  onLogin: (user: User) => void;
}

export const Auth: React.FC<Props> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const user = registerOrLogin(username, password);
      onLogin(user);
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    }
  };

  return (
    <div className="h-full flex items-center justify-center p-4 bg-slate-900 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-20">
         <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[100px]" />
         <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Hisaab Kitaab</h1>
          <p className="text-slate-400">Medical Invoice Manager</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full py-3 text-lg shadow-lg shadow-blue-900/50">
            Login / Register
          </Button>

          <p className="text-xs text-center text-slate-500 mt-4">
            If the username doesn't exist, a new account will be created automatically.
          </p>
        </form>
      </div>
    </div>
  );
};