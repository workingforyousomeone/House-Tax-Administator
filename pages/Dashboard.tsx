
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, TrendingUp, IndianRupee, TrendingDown, Users, LayoutGrid, FileText, CreditCard, Search, X, ChevronRight } from 'lucide-react';
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    setSearchResults(searchHouseholds(q));
  };

  const openPaymentFor = (h: Household) => {
    setSelectedHousehold(h);
    // Don't close search modal immediately, or handle stacking. 
    // Here we can close search modal to show payment modal clearly.
    setShowSearchModal(false); 
  };

  const Card: React.FC<{ 
    label: string; 
    value: string; 
    icon: React.ReactNode; 
    iconBg: string; 
    iconColor: string; 
  }> = ({ label, value, icon, iconBg, iconColor }) => (
    <div className="bg-white/60 backdrop-blur-md p-2 rounded-2xl shadow-lg border border-white/50 flex flex-col justify-center gap-0.5 hover:bg-white/70 transition-colors h-full min-h-[60px]">
      <div className="flex items-center gap-2">
        <div className={`p-1 rounded-lg ${iconBg} ${iconColor} shadow-sm shrink-0`}>
          {/* Clone to force size */}
          {React.isValidElement(icon) 
            ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'w-3.5 h-3.5' })
            : icon}
        </div>
        <h3 className="text-base font-bold text-slate-900 drop-shadow-sm leading-none">{value}</h3>
      </div>
      <p className="text-[9px] uppercase font-bold text-slate-600 ml-0.5 tracking-wide truncate">{label}</p>
    </div>
  );

  return (
    <div className="p-3 space-y-3">
      
      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-in fade-in">
             <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
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
                     <button onClick={() => setShowSearchModal(false)} className="p-1 bg-slate-100 rounded-full">
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
      <div className="px-1">
        <h1 className="text-lg font-bold text-slate-900 leading-tight">House Tax Dashboard</h1>
        <p className="text-slate-600 text-[10px] font-medium">Overview of all tax collections</p>
      </div>

      {/* Stats Grid - Compact */}
      <div className="grid grid-cols-2 gap-2">
        <Card 
          label="Total Households" 
          value={stats.totalHouseholds.toLocaleString()} 
          icon={<Home />} 
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <Card 
          label="Total Demand" 
          value={`₹${stats.totalDemand.toLocaleString()}`} 
          icon={<TrendingUp />}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <Card 
          label="Total Collection" 
          value={`₹${stats.totalCollection.toLocaleString()}`} 
          icon={<IndianRupee />}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />
        <Card 
          label="Pending Amount" 
          value={`₹${stats.pendingAmount.toLocaleString()}`} 
          icon={<TrendingDown />}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
        />
      </div>

      {/* Clusters Card - Compact */}
      <div 
        onClick={() => navigate('/clusters')}
        className="bg-gradient-to-r from-violet-600 to-purple-600 p-2.5 rounded-2xl shadow-xl shadow-purple-500/20 text-white flex items-center gap-3 cursor-pointer hover:scale-[1.01] transition-transform active:scale-95"
      >
        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm shadow-sm">
             <LayoutGrid className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
             <h3 className="text-base font-bold leading-tight">Clusters</h3>
             <p className="text-purple-100 text-[10px] font-medium opacity-90">View analytics & zones</p>
        </div>
        <div className="bg-black/20 p-1 rounded-full">
             <ChevronRight className="w-4 h-4 text-white/80" />
        </div>
      </div>

      {/* Make Payment Action Card - Compact */}
      <div className="bg-gradient-to-r from-brand-600 to-blue-600 p-2.5 rounded-2xl shadow-xl shadow-blue-500/20 text-white flex items-center justify-between">
          <div>
              <h3 className="text-base font-bold leading-tight">Make Payment</h3>
              <p className="text-blue-100 text-[10px] font-medium opacity-90">Search & collect tax instantly</p>
          </div>
          <button 
             onClick={() => { setSearchQuery(''); setSearchResults([]); setShowSearchModal(true); }}
             className="bg-white text-brand-600 p-2 rounded-xl shadow-sm hover:scale-105 active:scale-95 transition-all"
          >
              <CreditCard className="w-5 h-5" />
          </button>
      </div>

      {/* Collection Rate Block - Compact */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-2.5 rounded-2xl shadow-xl shadow-emerald-500/20 text-white">
        <div className="flex items-center gap-3 mb-2">
             <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm shadow-sm">
                <TrendingUp className="w-5 h-5 text-white" />
             </div>
             <div className="flex-1">
                <h3 className="text-base font-bold leading-tight">Collection Rate</h3>
                <p className="text-emerald-100 text-[10px] font-medium opacity-90">Overall progress</p>
             </div>
             <span className="text-xl font-bold">{stats.collectionRate}%</span>
        </div>
        <div className="w-full bg-black/20 rounded-full h-1 overflow-hidden">
            <div 
                className="bg-white h-full rounded-full transition-all duration-1000 ease-out shadow-sm" 
                style={{ width: `${stats.collectionRate}%` }}
            />
        </div>
      </div>

      {/* Svamitva Card - Compact */}
      <div 
        onClick={() => navigate('/svamitva')}
        className="bg-gradient-to-r from-pink-600 to-rose-600 p-2.5 rounded-2xl shadow-xl shadow-pink-500/20 text-white flex items-center justify-between cursor-pointer hover:scale-[1.01] transition-transform active:scale-95"
      >
        <div>
             <h3 className="text-base font-bold leading-tight">Svamitva</h3>
             <p className="text-pink-100 text-[10px] font-medium opacity-90">Property holding register</p>
        </div>
        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm shadow-sm">
             <FileText className="w-5 h-5 text-white" />
        </div>
      </div>

    </div>
  );
};
