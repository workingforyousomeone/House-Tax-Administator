
import React, { useContext, useState } from 'react';
import { AuthContext } from '../App';
import { ArrowRight, User, Lock, Home, IndianRupee } from 'lucide-react';
import { authenticateUser } from '../services/data';

export const Login: React.FC = () => {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = authenticateUser(username, password);
    
    if (user) {
      login(user);
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-10 relative overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-purple-500/30 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-blue-500/30 rounded-full blur-3xl" />

      {/* Main Card */}
      <div className="w-full max-w-sm bg-white/20 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl p-8 flex flex-col items-center animate-in fade-in zoom-in duration-500">
        
        {/* Logo Section - Centered at top */}
        <div className="mb-6 flex flex-col items-center">
            <div className="relative mb-4">
                <div className="bg-white p-4 rounded-2xl shadow-xl shadow-brand-900/10 transform rotate-3">
                    <Home className="w-10 h-10 text-brand-600" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1.5 border-4 border-white/20 shadow-lg">
                    <IndianRupee className="w-4 h-4 text-white" />
                </div>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight text-center drop-shadow-md">House Tax</h1>
            <p className="text-brand-100 text-xs font-bold tracking-[0.3em] uppercase opacity-90 text-center mt-1">Admin Portal</p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white/80 uppercase tracking-wider ml-1">Username</label>
            <div className="relative group">
              <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center">
                 <User className="w-5 h-5 text-white/70 group-focus-within:text-white transition-colors" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter ID"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-white/20 bg-black/10 text-white placeholder-white/50 focus:bg-black/20 focus:border-white/50 focus:ring-0 outline-none transition-all font-medium"
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white/80 uppercase tracking-wider ml-1">Password</label>
            <div className="relative group">
               <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center">
                 <Lock className="w-5 h-5 text-white/70 group-focus-within:text-white transition-colors" />
               </div>
               <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-white/20 bg-black/10 text-white placeholder-white/50 focus:bg-black/20 focus:border-white/50 focus:ring-0 outline-none transition-all font-medium"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-50 text-xs font-bold bg-red-500/50 px-4 py-3 rounded-xl border border-red-200/20 backdrop-blur-md animate-in slide-in-from-top-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-200" />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-white hover:bg-brand-50 text-brand-700 font-bold py-4 rounded-xl shadow-lg shadow-black/10 hover:shadow-xl transition-all active:scale-[0.98] mt-2 flex items-center justify-center gap-2 group"
          >
            Sign In
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="w-full mt-8 border-t border-white/10 pt-4">
            <p className="text-center text-white/50 text-[10px] font-bold mb-3 uppercase tracking-widest">
              Demo Access
            </p>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-white/70 font-mono">
              <div className="bg-black/10 p-2 rounded-lg text-center border border-white/5">
                 <div className="opacity-50 mb-1">Super Admin</div>
                 <div className="text-white font-bold">admin</div>
              </div>
              <div className="bg-black/10 p-2 rounded-lg text-center border border-white/5">
                 <div className="opacity-50 mb-1">User</div>
                 <div className="text-white font-bold">10190758-WEA</div>
              </div>
            </div>
        </div>
      </div>
      
      <p className="absolute bottom-4 text-white/40 text-[10px] font-medium">© 2025 Panchayat Raj Dept</p>
    </div>
  );
};
