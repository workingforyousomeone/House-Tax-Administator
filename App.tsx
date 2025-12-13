

import React, { useState, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, ArrowLeft, Home, TrendingUp, IndianRupee, TrendingDown, User, ArrowRight, DoorOpen, Settings, Key, X, CheckCircle, Shield } from 'lucide-react';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Clusters } from './pages/Clusters';
import { HouseholdList } from './pages/HouseholdList';
import { HouseholdDetail } from './pages/HouseholdDetail';
import { SvamitvaForm } from './pages/SvamitvaForm';
import { CollectionRegister } from './pages/CollectionRegister';
import { User as UserType } from './types';
import { getHouseholdById, updateUserPassword } from './services/data';

// Context for Auth (Updated to include User object)
export const AuthContext = React.createContext<{
  user: UserType | null;
  login: (user: UserType) => void;
  logout: () => void;
  changePassword: (newPass: string) => boolean;
}>({
  user: null,
  login: () => {},
  logout: () => {},
  changePassword: () => false,
});

// --- CHANGE PASSWORD MODAL ---
const ChangePasswordModal: React.FC<{ onClose: () => void; onSave: (p: string) => void }> = ({ onClose, onSave }) => {
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [error, setError] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPass.length < 4) {
            setError("Password must be at least 4 characters.");
            return;
        }
        if (newPass !== confirmPass) {
            setError("Passwords do not match.");
            return;
        }
        onSave(newPass);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-xs p-6 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-slate-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                </button>
                
                <div className="flex items-center gap-2 mb-4">
                    <div className="bg-brand-100 p-2 rounded-lg text-brand-600">
                        <Shield className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Change Password</h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-600 uppercase mb-1 block">New Password</label>
                        <input 
                            type="password" 
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all"
                            value={newPass}
                            onChange={(e) => setNewPass(e.target.value)}
                            placeholder="Min 4 chars"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-600 uppercase mb-1 block">Confirm Password</label>
                        <input 
                            type="password" 
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all"
                            value={confirmPass}
                            onChange={(e) => setConfirmPass(e.target.value)}
                            placeholder="Re-enter password"
                        />
                    </div>
                    
                    {error && <p className="text-xs text-red-600 font-bold bg-red-50 p-2 rounded border border-red-100">{error}</p>}

                    <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl shadow-md transition-all active:scale-95">
                        Update Password
                    </button>
                </form>
            </div>
        </div>
    );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, changePassword } = React.useContext(AuthContext);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Determine if we are on a detail page to hide bottom nav or change header
  const isDetailPage = location.pathname.includes('/household/');
  const isClusterDetail = location.pathname.includes('/cluster/');
  const isSvamitva = location.pathname === '/svamitva';
  const isRegister = location.pathname === '/register';
  const isDashboard = location.pathname === '/dashboard';
  const isClusters = location.pathname === '/clusters';

  // Show User Info and Logout on Dashboard, Clusters List, and Cluster View
  const showHeaderActions = isDashboard || isClusters || isClusterDetail;

  const handleBack = () => {
    // Hierarchical Navigation Logic
    if (isDetailPage) {
      const id = location.pathname.split('/').pop();
      const household = getHouseholdById(id || '');
      if (household) {
        navigate(`/cluster/${household.clusterId}`);
        return;
      }
    } else if (isClusterDetail) {
      navigate('/clusters');
      return;
    }
    
    // Default fallback
    navigate(-1);
  };

  const handlePasswordUpdate = (newPass: string) => {
      const success = changePassword(newPass);
      if (success) {
          setShowPasswordModal(false);
          setShowSuccessToast(true);
          setTimeout(() => setShowSuccessToast(false), 3000);
      } else {
          alert("Failed to update password.");
      }
  };

  return (
    <div className="min-h-screen flex flex-col relative max-w-md mx-auto overflow-hidden">
      
      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} onSave={handlePasswordUpdate} />}
      
      {showSuccessToast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] bg-green-600 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 font-bold animate-in fade-in slide-in-from-top-4">
              <CheckCircle className="w-5 h-5" /> Password Updated!
          </div>
      )}

      {/* Dynamic Header */}
      {!location.pathname.includes('/login') && !isSvamitva && !isRegister && (
        <header className="px-4 py-3 flex justify-between items-center z-10 sticky top-0 bg-white/30 backdrop-blur-md border-b border-white/20 shadow-sm">
          <div className="flex items-center gap-3">
            {(isDetailPage || isClusterDetail) ? (
              <button onClick={handleBack} className="p-2 bg-white/40 hover:bg-white/60 rounded-full transition-colors border border-white/30 shadow-sm">
                <ArrowLeft className="w-5 h-5 text-slate-800" />
              </button>
            ) : (
               // App Icon for main pages
               <div className="bg-brand-600 p-1.5 rounded-lg shadow-sm border border-brand-500">
                  <Home className="w-5 h-5 text-white" />
               </div>
            )}
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">
                {isDashboard ? 'Dashboard' : 
                 isClusters ? 'Clusters' :
                 isClusterDetail ? 'Cluster View' :
                 isDetailPage ? 'Details' : 'House Tax Admin'}
              </h1>
              {showHeaderActions && user && (
                <button 
                    onClick={() => setShowPasswordModal(true)}
                    className="text-xs text-slate-700 font-medium truncate max-w-[150px] flex items-center gap-1 hover:text-brand-700 transition-colors"
                >
                  <User className="w-3 h-3" /> {user.name} <Settings className="w-3 h-3 ml-0.5 opacity-50" />
                </button>
              )}
            </div>
          </div>
          {showHeaderActions && (
             <button onClick={logout} className="p-2 bg-white/40 text-red-600 rounded-full hover:bg-red-500 hover:text-white transition-colors border border-white/20 shadow-sm">
               <LogOut className="w-5 h-5" />
             </button>
          )}
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-20 scroll-smooth">
        {children}
      </main>

      {/* Bottom Navigation */}
      {!location.pathname.includes('/login') && !isDetailPage && !isSvamitva && !isRegister && (
        <nav className="absolute bottom-0 w-full bg-white/30 backdrop-blur-md border-t border-white/20 flex justify-around py-3 z-20 pb-safe shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
          <button 
            onClick={() => navigate('/dashboard')}
            className={`flex flex-col items-center gap-1 transition-transform active:scale-95 ${location.pathname === '/dashboard' ? 'text-brand-700 font-bold' : 'text-slate-600'}`}
          >
            <LayoutDashboard className="w-6 h-6" />
            <span className="text-xs">Dashboard</span>
          </button>
          <button 
            onClick={() => navigate('/clusters')}
            className={`flex flex-col items-center gap-1 transition-transform active:scale-95 ${location.pathname.includes('/clusters') || location.pathname.includes('/cluster') ? 'text-brand-700 font-bold' : 'text-slate-600'}`}
          >
            <Users className="w-6 h-6" />
            <span className="text-xs">Clusters</span>
          </button>
        </nav>
      )}
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<UserType | null>(null);

  const login = (userData: UserType) => setUser(userData);
  const logout = () => setUser(null);
  
  const changePassword = (newPass: string) => {
      if (!user) return false;
      // Update local state
      const updated = { ...user, password: newPass };
      setUser(updated);
      // Update data source (for current session persistence)
      return updateUserPassword(user.id, newPass);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, changePassword }}>
      <HashRouter>
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
          
          <Route path="/dashboard" element={isAuthenticated ? <Layout><Dashboard /></Layout> : <Navigate to="/login" />} />
          <Route path="/clusters" element={isAuthenticated ? <Layout><Clusters /></Layout> : <Navigate to="/login" />} />
          <Route path="/cluster/:id" element={isAuthenticated ? <Layout><HouseholdList /></Layout> : <Navigate to="/login" />} />
          <Route path="/household/:id" element={isAuthenticated ? <Layout><HouseholdDetail /></Layout> : <Navigate to="/login" />} />
          <Route path="/svamitva" element={isAuthenticated ? <Layout><SvamitvaForm /></Layout> : <Navigate to="/login" />} />
          <Route path="/register" element={isAuthenticated ? <Layout><CollectionRegister /></Layout> : <Navigate to="/login" />} />
          
          <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
        </Routes>
      </HashRouter>
    </AuthContext.Provider>
  );
}