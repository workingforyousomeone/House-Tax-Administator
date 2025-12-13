
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Filter, IndianRupee, Calendar, User } from 'lucide-react';
import { getAllPayments } from '../services/data';

export const CollectionRegister: React.FC = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState(getAllPayments());
  const [searchQuery, setSearchQuery] = useState('');

  // Derived state for filtering
  const filteredPayments = payments.filter(p => 
    p.receiptNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.assessmentNumber.includes(searchQuery)
  );

  const totalCollectedToday = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-4 py-3 bg-white/30 backdrop-blur-md border-b border-white/20 shadow-sm sticky top-0 z-20 flex justify-between items-center shrink-0">
             <div className="flex items-center gap-3">
                 <button onClick={() => navigate(-1)} className="p-1 hover:bg-white/40 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-slate-800" />
                 </button>
                 <h1 className="text-lg font-bold text-slate-900">Collection Register</h1>
             </div>
        </div>

        {/* Search & Stats Bar */}
        <div className="p-4 bg-white/20 backdrop-blur-sm space-y-3">
             <div className="flex items-center gap-2 bg-white/60 p-2.5 rounded-xl border border-white/40 shadow-sm">
                 <Search className="w-4 h-4 text-slate-500" />
                 <input 
                    type="text" 
                    placeholder="Search Receipt, Name, or ID..." 
                    className="bg-transparent w-full text-sm outline-none text-slate-900 font-medium placeholder-slate-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                 />
             </div>
             
             <div className="flex justify-between items-center px-2">
                 <span className="text-xs font-bold text-slate-700 uppercase">Total Records: {filteredPayments.length}</span>
                 <div className="text-right">
                     <p className="text-[10px] font-bold text-slate-600 uppercase">Total Amount</p>
                     <p className="text-lg font-bold text-green-800 leading-none">₹{totalCollectedToday.toLocaleString()}</p>
                 </div>
             </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2.5">
            {filteredPayments.length > 0 ? (
                filteredPayments.map((p) => (
                    <div 
                        key={p.receiptNo}
                        onClick={() => navigate(`/household/${p.householdId}`)}
                        className="bg-white/40 backdrop-blur-md p-3 rounded-xl border border-white/40 shadow-sm hover:bg-white/60 transition-colors cursor-pointer"
                    >
                        <div className="flex justify-between items-start mb-2">
                             <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-white/50 px-2 py-0.5 rounded-md border border-white/30">
                                 <Calendar className="w-3 h-3" />
                                 {p.dateOfPayment}
                             </div>
                             <div className="text-xs font-mono font-bold text-slate-400">
                                 {p.receiptNo}
                             </div>
                        </div>

                        <div className="flex justify-between items-start">
                             <div className="flex-1 pr-2">
                                 <h3 className="text-sm font-bold text-slate-900 leading-tight">{p.ownerName}</h3>
                                 <div className="flex items-center gap-1 text-xs text-slate-600 mt-0.5">
                                     <User className="w-3 h-3" />
                                     <span>#{p.assessmentNumber}</span>
                                 </div>
                             </div>
                             <div className="text-right shrink-0">
                                 <p className="text-lg font-bold text-green-700">₹{p.amount}</p>
                                 <p className="text-[9px] font-medium text-slate-500 uppercase tracking-wide bg-slate-100 rounded px-1 inline-block">{p.paymentMode}</p>
                             </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-10">
                    <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Filter className="w-8 h-8 text-white/50" />
                    </div>
                    <p className="text-white font-medium text-sm">No payment records found.</p>
                </div>
            )}
        </div>
    </div>
  );
};
