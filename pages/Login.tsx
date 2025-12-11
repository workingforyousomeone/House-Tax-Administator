
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
    <div className="flex flex-col items-center justify-center min-h-screen px-4 max-w-md mx-auto py-10">
      <div className="w-full bg-white/20 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl overflow-hidden ring-1 ring-white/20">
        
        {/* Header Image Section */}
        <div className="relative h-56 w-full group">
          <img 
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            alt="Real Estate" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-900/90 via-brand-900/40 to-transparent flex flex-col justify-end p-6">
             {/* App Icon / Logo */}
             <div className="flex items-center gap-3.5 translate-y-2">
                <div className="relative">
                  <div className="bg-white p-2.5 rounded-2xl shadow-lg shadow-black/20">
                     <Home className="w-8 h-8 text-brand-600" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-brand-800">
                    <IndianRupee className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white leading-none tracking-tight drop-shadow-md">House Tax</h1>
                  <p className="text-brand-100 text-[10px] font-bold tracking-[0.2em] uppercase mt-1.5 opacity-90">Admin Portal</p>
                </div>
             </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="w-full p-8 pt-10 space-y-6 bg-gradient-to-b from-white/10 to-transparent">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white/80 block ml-1 uppercase tracking-wider">Username</label>
            <div className="relative group">
              <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center">
                 <User className="w-5 h-5 text-white/60 group-focus-within:text-white transition-colors" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter ID"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-white/20 bg-black/20 text-white placeholder-white/40 focus:bg-black/30 focus:border-white/40 focus:ring-0 outline-none transition-all font-medium"
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white/80 block ml-1 uppercase tracking-wider">Password</label>
            <div className="relative group">
               <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center">
                 <Lock className="w-5 h-5 text-white/60 group-focus-within:text-white transition-colors" />
               </div>
               <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-white/20 bg-black/20 text-white placeholder-white/40 focus:bg-black/30 focus:border-white/40 focus:ring-0 outline-none transition-all font-medium"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-100 text-xs font-bold bg-red-500/30 px-4 py-3 rounded-xl border border-red-400/20 backdrop-blur-md animate-in slide-in-from-top-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-white hover:bg-brand-50 text-brand-700 font-bold py-4 rounded-xl shadow-lg shadow-black/10 hover:shadow-xl transition-all active:scale-[0.98] mt-2 flex items-center justify-center gap-2 group"
          >
            Sign In Account
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          <div className="bg-black/20 p-4 rounded-xl mt-6 border border-white/5 backdrop-blur-sm">
            <p className="text-center text-white/50 text-[10px] font-bold mb-3 uppercase tracking-widest border-b border-white/10 pb-2">
              Demo Credentials
            </p>
            <div className="flex flex-col gap-1.5 text-[11px] text-white/80 font-mono">
              <div className="flex justify-between"><span>Super Admin:</span> <span className="text-white">admin / admin</span></div>
              <div className="flex justify-between"><span>View Admin:</span> <span className="text-white">manager / manager</span></div>
              <div className="flex justify-between"><span>User:</span> <span className="text-white">10190758-WEA / 7671066475</span></div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
