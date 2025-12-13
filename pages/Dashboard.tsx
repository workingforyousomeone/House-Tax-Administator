
import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, TrendingUp, IndianRupee, TrendingDown, Users, LayoutGrid, FileText, CreditCard, Search, X, ChevronRight, ClipboardList } from 'lucide-react';
import { getDashboardStats, getClustersForUser, searchHouseholds } from '../services/data';
import { AuthContext } from '../App';
import { PaymentModal } from '../components/PaymentModal';
import { Household } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  // Pass the current user to filter stats accordingly
  const stats = getDashboardStats(user || undefined);
  
  // State for Payment Flow
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Household[]>([]);
  const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null);

  // Time-based Background Gradient Effect
  useEffect(() => {
    const updateGradient = () => {
        const hour = new Date().getHours();
        let gradient = 'linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)'; // Default (Afternoon: 12-17)

        if (hour >= 5 && hour < 12) {
           // Morning: Fresh & Bright (Soft Blue -> Lavender)
           gradient = 'linear-gradient(62deg, #8EC5FC 0%, #E0C3FC 100%)';
        } else if (hour >= 17 || hour < 5) {
           // Evening/Night: Deep & Rich (Midnight Blue -> Purple)
           gradient = 'linear-gradient(to top, #30cfd0 0%, #330867 100%)'; 
        }

        document.body.style.backgroundImage = gradient;
        document.body.style.transition = 'background-image 1s ease-in-out';
    };

    updateGradient();
    
    // Cleanup to default CSS style when leaving dashboard
    return () => {
        document.body.style.backgroundImage = 'linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)';
    };
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    // Pass user to searchHouseholds to restrict results
    setSearchResults(searchHouseholds(q, user || undefined));
  };

  const openPaymentFor = (h: Household) => {
    setSelectedHousehold(h);
    setShowSearchModal(false); 
  };

  // Reusable Card Component with Animation
  const Card: React.FC<{ 
    label: string; 
    value?: string; 
    subLabel?: string;
    icon: React.ReactNode; 
    iconBg: string; 
    iconColor: string;
    onClick?: () => void;
    rightElement?: React.ReactNode;
    children?: React.ReactNode;
    index: number; // For animation delay
  }> = ({ label, value, subLabel, icon, iconBg, iconColor, onClick, rightElement, children, index }) => (
    <div 
      onClick={onClick}
      style={{ animationDelay: `${index * 100}ms` }}
      className={`bg-white/60 backdrop-blur-md p-2.5 rounded-2xl shadow-lg border border-white/50 flex flex-col justify-center gap-1 hover:bg-white/70 transition-all h-full min-h-[75px] relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards ${onClick ? 'cursor-pointer active:scale-95' : ''}`}
    >
      <div className="flex justify-between items-start">
         <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${iconBg} ${iconColor} shadow-sm shrink-0 transition-transform duration-500 hover:scale-110`}>
              {React.isValidElement(icon) 
                ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'w-4 h-4' })
                : icon}
            </div>
            {value && <h3 className="text-lg font-bold text-slate-900 drop-shadow-sm leading-none tracking-tight">{value}</h3>}
         </div>
         {rightElement}
      </div>
      
      <div className="flex flex-col">
        <p className="text-[10px] uppercase font-bold text-slate-600 ml-0.5 tracking-wide truncate">{label}</p>
        {subLabel && <p className="text-[9px] text-slate-500 ml-0.5 font-medium leading-none">{subLabel}</p>}
      </div>
      
      {children}
    </div>
  );

  return (
    <div className="p-3 space-y-3">
      
      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-in fade-in duration-200">
             <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh] animate-in zoom-in-95 duration-200">
                 <div className="p-4 border-b flex items-center gap-3">
                     <Search className="w-5 h-5 text-slate-400" />
                     <input 
                        type="text" 
                        autoFocus
                        placeholder="Search by Assessment ID or Name..." 
                        className="flex-1 outline-none text-slate-900 font-medium placeholder-slate-400"
                        value={searchQuery}
                        onChange={handleSearch}
                     />
                     <button onClick={() => setShowSearchModal(false)} className="p-1 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                         <X className="w-4 h-4 text-slate-600" />
                     </button>
                 </div>
                 <div className="overflow-y-auto p-2 space-y-2 flex-1">
                     {searchResults.length > 0 ? (
                         searchResults.map(h => (
                             <div 
                                key={h.id} 
                                onClick={() => openPaymentFor(h)}
                                className="p-3 hover:bg-slate-50 rounded-xl cursor-pointer border border-transparent hover:border-slate-100 transition-colors group"
                             >
                                 <div className="flex justify-between items-start">
                                     <div>
                                         <p className="font-bold text-slate-900 text-sm">{h.ownerName}</p>
                                         <p className="text-xs text-slate-500">#{h.assessmentNumber}</p>
                                     </div>
                                     <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500" />
                                 </div>
                                 <div className="mt-2 flex gap-4 text-xs">
                                     <span className="text-slate-500">Pending: <span className="font-bold text-red-600">₹{h.totalDemand - h.totalCollected}</span></span>
                                     <span className="text-slate-500">Cluster: <span className="font-bold text-slate-700">{h.clusterId}</span></span>
                                 </div>
                             </div>
                         ))
                     ) : (
                         <div className="text-center py-8 text-slate-400 text-sm">
                             {searchQuery ? 'No results found' : 'Start typing to search...'}
                         </div>
                     )}
                 </div>
             </div>
        </div>
      )}

      {/* Payment Modal */}
      {selectedHousehold && (
          <PaymentModal 
              household={selectedHousehold}
              onClose={() => setSelectedHousehold(null)}
              onPaymentSuccess={(receipt) => {
                  // Optional: Navigate to household details or just show success
                  // For now, modal handles success view internally
              }}
          />
      )}

      {/* Page Title Section */}
      <div className="px-1 animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-2xl font-bold text-slate-900 leading-tight">Dashboard</h1>
        <p className="text-slate-700 text-[10px] font-bold opacity-70">
            {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening'}, {user?.name.split(' ')[0]}
        </p>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <Card 
          index={0}
          label="Households" 
          value={stats.totalHouseholds.toLocaleString()} 
          icon={<Home />} 
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <Card 
          index={1}
          label="Total Demand" 
          value={`₹${stats.totalDemand.toLocaleString()}`}
          icon={<IndianRupee />}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />
        <Card 
          index={2}
          label="Collected" 
          value={`₹${stats.totalCollection.toLocaleString()}`}
          icon={<TrendingUp />}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <Card 
          index={3}
          label="Pending" 
          value={`₹${stats.pendingAmount.toLocaleString()}`}
          icon={<TrendingDown />}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
        />
      </div>

      {/* Actions & Secondary Stats Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        
        {/* Clusters */}
        <Card
            index={4}
            label="Clusters"
            subLabel="View Zones"
            icon={<LayoutGrid />}
            iconBg="bg-violet-100"
            iconColor="text-violet-600"
            onClick={() => navigate('/clusters')}
            rightElement={<ChevronRight className="w-4 h-4 text-slate-300" />}
        />

        {/* Make Payment */}
        <Card
            index={5}
            label="Pay Tax"
            subLabel="Record Payment"
            icon={<CreditCard />}
            iconBg="bg-brand-100"
            iconColor="text-brand-600"
            onClick={() => { setSearchQuery(''); setSearchResults([]); setShowSearchModal(true); }}
            rightElement={<div className="bg-brand-50 rounded-full p-0.5"><ChevronRight className="w-3.5 h-3.5 text-brand-400" /></div>}
        />

        {/* Register (New) */}
        <Card
            index={6}
            label="Register"
            subLabel="All Payments"
            icon={<ClipboardList />}
            iconBg="bg-amber-100"
            iconColor="text-amber-600"
            onClick={() => navigate('/register')}
            rightElement={<ChevronRight className="w-4 h-4 text-slate-300" />}
        />

        {/* Svamitva */}
        <Card
            index={7}
            label="Svamitva"
            subLabel="Register"
            icon={<FileText />}
            iconBg="bg-pink-100"
            iconColor="text-pink-600"
            onClick={() => navigate('/svamitva')}
            rightElement={<ChevronRight className="w-4 h-4 text-slate-300" />}
        />

      </div>

    </div>
  );
};
