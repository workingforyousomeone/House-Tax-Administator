
import React, { useState, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Filter, Calendar, User, QrCode, Banknote, CreditCard, Tag, Clock } from 'lucide-react';
import { getAllPayments, getHouseholdById } from '../services/data';
import { AuthContext } from '../App';
import { PaymentRecord, Household } from '../types';
import { ReceiptModal } from '../components/ReceiptModal';
import { RESOURCES } from '../resources';

export const CollectionRegister: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  // Calculate payments on every render to ensure fresh data after sync
  const payments = getAllPayments(user || undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [receiptToPrint, setReceiptToPrint] = useState<{ receiptNo: string, records: PaymentRecord[], household: Household } | null>(null);

  // Grouping Logic: Consolidate split records (by Year/Category) into single Receipt Cards
  const { groupedPayments, totalAmount } = useMemo(() => {
    // 1. Filter first based on search
    const filtered = payments.filter(p => 
        p.receiptNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.assessmentNumber.includes(searchQuery)
    );

    // 2. Group by Receipt Number
    const groups: any[] = [];
    const map = new Map();

    filtered.forEach(p => {
        if (!map.has(p.receiptNo)) {
            const entry = {
                ...p,
                totalAmount: 0,
                breakdowns: [] as { year: string, category: string }[]
            };
            map.set(p.receiptNo, entry);
            groups.push(entry);
        }
        const entry = map.get(p.receiptNo);
        entry.totalAmount += p.amount;
        entry.breakdowns.push({ year: p.dueYear, category: p.demandCategory });
    });

    // 3. Calculate Grand Total of displayed records
    const total = filtered.reduce((sum, p) => sum + p.amount, 0);

    return { groupedPayments: groups, totalAmount: total };
  }, [payments, searchQuery]);

  const getPaymentModeIcon = (mode: string) => {
    if (mode.toLowerCase().includes('upi') || mode.toLowerCase().includes('qr')) return <QrCode className="w-3 h-3" />;
    if (mode.toLowerCase().includes('cash')) return <Banknote className="w-3 h-3" />;
    return <CreditCard className="w-3 h-3" />;
  };

  const formatCompactDate = (dateStr: string) => {
    // Converts DD-MM-YYYY HH:MM to YYYY-MM-DD t HH:MM
    // Handles optional time part
    const parts = dateStr.trim().split(' ');
    const datePart = parts[0];
    let timePart = parts.slice(1).join(' ');

    // Strip seconds if present
    if (timePart.split(':').length > 2) {
       timePart = timePart.split(':').slice(0, 2).join(':');
    }

    const [d, m, y] = datePart.split('-');
    if (d && m && y && y.length === 4) {
        const formatted = `${y}-${m}-${d}`;
        return timePart ? `${formatted} • ${timePart}` : formatted;
    }
    return dateStr;
  };

  const handleCardClick = (receiptNo: string, householdId: string) => {
      const household = getHouseholdById(householdId);
      if (household) {
          const records = household.paymentHistory.filter(p => p.receiptNo === receiptNo);
          setReceiptToPrint({ receiptNo, records, household });
      }
  };

  return (
    <div className="flex flex-col h-full">
        {receiptToPrint && ( 
            <ReceiptModal 
                receiptNo={receiptToPrint.receiptNo} 
                records={receiptToPrint.records} 
                household={receiptToPrint.household} 
                onClose={() => setReceiptToPrint(null)} 
            /> 
        )}

        {/* Header */}
        <div className="px-4 py-3 bg-white/30 backdrop-blur-md border-b border-white/20 shadow-sm sticky top-0 z-20 flex justify-between items-center shrink-0">
             <div className="flex items-center gap-3">
                 <button onClick={() => navigate(-1)} className="p-1 hover:bg-white/40 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-slate-800" />
                 </button>
                 {/* Branding in Header */}
                 <div className="bg-white/80 p-1 rounded-full shadow-sm border border-white/50">
                    <img 
                        src={RESOURCES.AP_GOVT_LOGO} 
                        className="w-8 h-8 object-contain" 
                        alt="Logo"
                        onError={(e) => {
                             e.currentTarget.src = RESOURCES.INDIA_EMBLEM;
                        }} 
                    />
                 </div>
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
                 <span className="text-xs font-bold text-slate-700 uppercase">Transactions: {groupedPayments.length}</span>
                 <div className="text-right">
                     <p className="text-[10px] font-bold text-slate-600 uppercase">Total Collected</p>
                     <p className="text-lg font-bold text-green-800 leading-none">₹{totalAmount.toLocaleString()}</p>
                 </div>
             </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2.5">
            {groupedPayments.length > 0 ? (
                groupedPayments.map((p) => (
                    <div 
                        key={p.receiptNo}
                        onClick={() => handleCardClick(p.receiptNo, p.householdId)}
                        className="bg-white/40 backdrop-blur-md p-3 rounded-xl border border-white/40 shadow-sm hover:bg-white/60 transition-colors cursor-pointer"
                    >
                        <div className="flex justify-between items-start mb-2">
                             <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-white/50 px-2 py-0.5 rounded-md border border-white/30">
                                 <Clock className="w-3 h-3" />
                                 {formatCompactDate(p.dateOfPayment)}
                             </div>
                             <div className="text-[10px] font-mono font-bold text-slate-400">
                                 {p.receiptNo}
                             </div>
                        </div>

                        <div className="flex justify-between items-start gap-2">
                             <div className="flex-1 min-w-0">
                                 <h3 className="text-sm font-bold text-slate-900 leading-tight truncate">{p.ownerName}</h3>
                                 
                                 {/* ID & Mode */}
                                 <div className="flex flex-wrap items-center gap-2 mt-1 mb-1.5">
                                     <div className="flex items-center gap-1 text-xs text-slate-600">
                                         <User className="w-3 h-3" />
                                         <span>#{p.assessmentNumber}</span>
                                     </div>
                                     <div className="flex items-center gap-1 text-[9px] font-bold text-slate-700 bg-white/50 px-1.5 py-0.5 rounded border border-white/30 uppercase">
                                        {getPaymentModeIcon(p.paymentMode)}
                                        <span>{p.paymentMode}</span>
                                     </div>
                                 </div>
                                 
                                 {/* Breakdown List (Horizontal Layout) */}
                                 <div className="flex flex-wrap items-center gap-2 mt-2">
                                     {p.breakdowns.map((b: any, idx: number) => (
                                         <div key={idx} className="flex items-center gap-1.5 text-[10px] text-slate-800 font-bold bg-white/40 px-2 py-0.5 rounded border border-white/20 shadow-sm">
                                             <span>FY: {b.year}</span>
                                             <span className={`px-1.5 rounded-[3px] text-[9px] uppercase tracking-wide border ${b.category === 'Arrear' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-green-100 text-green-700 border-green-200'}`}>
                                                 {b.category}
                                             </span>
                                         </div>
                                     ))}
                                 </div>
                             </div>

                             <div className="text-right shrink-0">
                                 <p className="text-xl font-bold text-green-700">₹{p.totalAmount}</p>
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
