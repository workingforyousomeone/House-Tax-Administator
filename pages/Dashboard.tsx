
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

  // Reusable Card Component for uniform look
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
  }> = ({ label, value, subLabel, icon, iconBg, iconColor, onClick, rightElement, children }) => (
    <div 
      onClick={onClick}
      className={`bg-white/60 backdrop-blur-md p-2.5 rounded-2xl shadow-lg border border-white/50 flex flex-col justify-center gap-1 hover:bg-white/70 transition-all h-full min-h-[75px] relative overflow-hidden ${onClick ? 'cursor-pointer active:scale-95' : ''}`}
    >
      <div className="flex justify-between items-start">
         <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${iconBg} ${iconColor} shadow-sm shrink-0`}>
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

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <Card 
          label="Households" 
          value={stats.totalHouseholds.toLocaleString()} 
          icon={<Home />} 
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <Card 
          label="Total Demand" 
          value={`₹${(stats.totalDemand / 100000).toFixed(2)}L`} // Formatted for space
          subLabel={`₹${stats.totalDemand.toLocaleString()}`}
          icon={<TrendingUp />}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <Card 
          label="Collected" 
          value={`₹${(stats.totalCollection / 100000).toFixed(2)}L`}
          subLabel={`₹${stats.totalCollection.toLocaleString()}`}
          icon={<IndianRupee />}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />
        <Card 
          label="Pending" 
          value={`₹${(stats.pendingAmount / 100000).toFixed(2)}L`}
          subLabel={`₹${stats.pendingAmount.toLocaleString()}`}
          icon={<TrendingDown />}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
        />
      </div>

      {/* Actions & Secondary Stats Grid - Consistent Height & Style */}
      <div className="grid grid-cols-2 gap-2.5">
        
        {/* Clusters */}
        <Card
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
            label="Pay Tax"
            subLabel="Record Payment"
            icon={<CreditCard />}
            iconBg="bg-brand-100"
            iconColor="text-brand-600"
            onClick={() => { setSearchQuery(''); setSearchResults([]); setShowSearchModal(true); }}
            rightElement={<div className="bg-brand-50 rounded-full p-0.5"><ChevronRight className="w-3.5 h-3.5 text-brand-400" /></div>}
        />

        {/* Collection Rate */}
        <Card
            label="Collection Rate"
            subLabel="Progress"
            icon={<TrendingUp />}
            iconBg="bg-teal-100"
            iconColor="text-teal-600"
        >
            <div className="mt-1.5 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${stats.collectionRate}%` }}></div>
                </div>
                <span className="text-xs font-bold text-slate-700">{stats.collectionRate}%</span>
            </div>
        </Card>

        {/* Svamitva */}
        <Card
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
