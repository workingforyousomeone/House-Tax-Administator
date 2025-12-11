
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, ArrowLeft, Home, TrendingUp, IndianRupee, TrendingDown, User, ArrowRight, DoorOpen } from 'lucide-react';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Clusters } from './pages/Clusters';
import { HouseholdList } from './pages/HouseholdList';
import { HouseholdDetail } from './pages/HouseholdDetail';
import { SvamitvaForm } from './pages/SvamitvaForm';
import { User as UserType } from './types';
import { getHouseholdById } from './services/data';

// Context for Auth (Updated to include User object)
export const AuthContext = React.createContext<{
  user: UserType | null;
  login: (user: UserType) => void;
  logout: () => void;
}>({
  user: null,
  login: () => {},
  logout: () => {},
});

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = React.useContext(AuthContext);

  // Determine if we are on a detail page to hide bottom nav or change header
  const isDetailPage = location.pathname.includes('/household/');
  const isClusterDetail = location.pathname.includes('/cluster/');
  const isSvamitva = location.pathname === '/svamitva';
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

  return (
    <div className="min-h-screen flex flex-col relative max-w-md mx-auto overflow-hidden">
      {/* Dynamic Header */}
      {!location.pathname.includes('/login') && !isSvamitva && (
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
                <p className="text-xs text-slate-700 font-medium truncate max-w-[150px]">
                  {user.name}
                </p>
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
      {!location.pathname.includes('/login') && !isDetailPage && !isSvamitva && (
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

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <HashRouter>
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
          
          <Route path="/dashboard" element={isAuthenticated ? <Layout><Dashboard /></Layout> : <Navigate to="/login" />} />
          <Route path="/clusters" element={isAuthenticated ? <Layout><Clusters /></Layout> : <Navigate to="/login" />} />
          <Route path="/cluster/:id" element={isAuthenticated ? <Layout><HouseholdList /></Layout> : <Navigate to="/login" />} />
          <Route path="/household/:id" element={isAuthenticated ? <Layout><HouseholdDetail /></Layout> : <Navigate to="/login" />} />
          <Route path="/svamitva" element={isAuthenticated ? <Layout><SvamitvaForm /></Layout> : <Navigate to="/login" />} />
          
          <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
        </Routes>
      </HashRouter>
    </AuthContext.Provider>
  );
}
