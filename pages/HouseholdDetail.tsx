
import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  User, Phone, MapPin, ClipboardList, Layers, Maximize, Droplets, History, FileText, 
  LayoutGrid, Hammer, RefreshCcw, Gift, Trash2, Milestone, Pencil, ChevronDown, Check, X, 
  AlertCircle, ShieldAlert, Calculator, Printer, IndianRupee, CreditCard, Home, 
  Smartphone, UserCheck, Map, Key, CalendarClock, Building2, Ruler, Compass, 
  FileBadge, Receipt, Wallet, CalendarDays, Lock, ScanLine, Eye, EyeOff,
  Coins, Banknote
} from 'lucide-react';
import { getHouseholdById, updateHousehold } from '../services/data';
import { AuthContext } from '../contexts/AuthContext';
import { Household, HistoryRecord, DemandDetail, AuditLog, PaymentRecord } from '../types';
import { PaymentModal } from '../components/PaymentModal';
import { ReceiptModal } from '../components/ReceiptModal';

// --- FIXED VALUE OPTIONS ---
const NATURE_PROPERTY_OPTIONS = ["Government", "Private", "Assigned", "Inam", "Endowment", "Wakf"];
const NATURE_LANDUSE_OPTIONS = ["Vacant Plot", "Stand Alone Structure", "Multi Storied Structure", "Apartment"];
const NATURE_USAGE_OPTIONS = ["Residential", "Commercial", "Industrial"];
const NATURE_OWNERSHIP_OPTIONS = ["Individual", "Joint Property"];
const RELATION_TYPE_OPTIONS = ["Father", "Mother", "Husband", "Others"];
const OCCUPANCY_OPTIONS = ["Owner", "Occupier"];
const BUILDING_TYPE_OPTIONS = ["Individual", "Apartment/High raise/Multi Storied Building", "Group Housing", "Row Housing", "Gated Community", "NA"];
const FLOOR_NO_OPTIONS = ["Parking", "Cellar", "Mezzanine", "1st Floor", "2nd Floor", "3rd Floor", "4th Floor", "5th Floor", "Ground Floor"];
const BUILDING_CATEGORY_OPTIONS = ["Hotels", "Restaurants", "Lodges", "Cinema Halls", "Business Buildings", "Commercial Buildings", "Kalyana Mandapams", "Offices", "Hospitals", "Institutional", "Industrial", "School", "College", "Others", "Residential"];
const CONSTRUCTION_TYPE_OPTIONS = ["RCC Building Residential", "RCC Building Commercial", "RCC Structure with ceiling height", "Non RCC Roofs", "Mud Roof [ChavitiMiddelu]", "Tatched Houses"];
const SUBTYPE_CONSTRUCTION_OPTIONS = ["Ground, 1st and 2nd", "Apartments without common walls atleast on 3 sides", "Cellar, Mezzanine Floor,stilt and Parking Place", "For every extra floor(from 3rd floor onwards) in addition to the rate mentioned at 1A(a)", "Ground Floor", "First Floor", "Structure from 2nd floor onwards(for each floor)", "Cellar, Mezzanine Floor,stilt and Parking Place", "ACC Sheet , Pantileshabad Stones, Zinc Sheets, Tiles, Mangalore Tiles, Cuddapah Slab, Jack Arch, Madras terrace roof and such other non RCC roofs Structers", "Cinema Halls, Mills, Factories and similar kind of structures with walls exceeding 10ft height", "Poultry Farms", "With walls", "Without walls", "-"];
const MODE_OF_ACQUISITION_OPTIONS = ["Legal Owner", "Legal Heir", "Mortgage", "Regd Sale Deed", "Un Regd Sale Deed", "Inheritance", "Purchase", "Gift"];

// --- HELPER COMPONENTS ---

const InfoItem: React.FC<{ icon: React.ReactNode; label: string; value: string | number | React.ReactNode | undefined; color: string }> = ({ icon, label, value, color }) => (
  <div className="flex flex-col bg-white/40 p-2 rounded-xl border border-white/30 shadow-sm relative overflow-hidden group hover:bg-white/60 transition-colors h-full">
     <div className="flex items-center gap-2 mb-1">
         <div className={`p-1 rounded-md ${color} text-white shadow-sm shrink-0`}>
            {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'w-3 h-3' })}
         </div>
         <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide leading-tight">{label}</span>
     </div>
     <div className="text-xs font-bold text-slate-800 truncate pl-1" title={typeof value === 'string' ? value : ''}>
       {value || '-'}
     </div>
  </div>
);

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
    <div className="flex items-center gap-2 mb-2 mt-4 first:mt-0 pb-1 border-b border-white/20">
        {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'w-4 h-4 text-brand-700' })}
        <h3 className="text-xs font-bold text-brand-800 uppercase tracking-wider">{title}</h3>
    </div>
);

const EditRow: React.FC<{ label: string; value: string | number; onChange: (val: string) => void; type?: string }> = ({ label, value, onChange, type = "text" }) => (
  <div className="flex flex-col gap-1 py-2 border-b border-white/20 last:border-0">
    <label className="text-xs font-bold text-slate-500 uppercase">{label}</label>
    <input 
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white/50 border border-white/40 rounded-lg px-3 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/50"
    />
  </div>
);

const EditSelect: React.FC<{ label: string; value: string; onChange: (val: string) => void; options: string[] }> = ({ label, value, onChange, options }) => (
  <div className="flex flex-col gap-1 py-2 border-b border-white/20 last:border-0">
    <label className="text-xs font-bold text-slate-500 uppercase">{label}</label>
    <div className="relative">
        <select 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/50 border border-white/40 rounded-lg px-3 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/50 appearance-none"
        >
          <option value="">Select...</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
    </div>
  </div>
);

const DetailRow: React.FC<{ label: string; value: string | number | React.ReactNode; isLast?: boolean }> = ({ label, value, isLast }) => (
    <div className={`flex justify-between items-start py-2.5 ${!isLast ? 'border-b border-white/20' : ''}`}>
      <span className="text-slate-600 text-sm font-medium w-1/2 pr-2">{label}</span>
      <span className="text-sm font-bold text-right w-1/2 break-words text-slate-800">{value}</span>
    </div>
);

// --- DEMAND EDIT MODAL ---
interface DemandEditModalProps { demand: DemandDetail; onSave: (updatedDemand: DemandDetail) => void; onClose: () => void; }
const DemandEditModal: React.FC<DemandEditModalProps> = ({ demand, onSave, onClose }) => {
  const [data, setData] = useState<DemandDetail>({ ...demand });
  const handlePropertyTaxChange = (val: string) => {
    const pTax = Number(val) || 0;
    const updated: DemandDetail = { ...data, propertyTax: pTax, libraryCess: Math.round(pTax * 0.08), waterTax: Math.round(pTax * 0.08), drainageTax: Math.round(pTax * 0.10), lightingTax: Math.round(pTax * 0.10), sportsCess: Math.round(pTax * 0.03), fireTax: Math.round(pTax * 0.01), };
    updated.totalDemand = updated.propertyTax + updated.libraryCess + updated.waterTax + updated.drainageTax + updated.lightingTax + updated.sportsCess + updated.fireTax;
    setData(updated);
  };
  const handleFieldChange = (field: keyof DemandDetail, val: string) => {
    const numVal = Number(val) || 0;
    const updated = { ...data, [field]: numVal };
    updated.totalDemand = updated.propertyTax + updated.libraryCess + updated.waterTax + updated.drainageTax + updated.lightingTax + updated.sportsCess + updated.fireTax;
    setData(updated);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white/90 backdrop-blur-xl w-full max-w-sm rounded-3xl shadow-2xl border border-white/50 p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Calculator className="w-5 h-5 text-brand-600" /> Edit Demand ({data.demandYear})</h3><button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X className="w-5 h-5 text-slate-500" /></button></div>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
            <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100"><label className="text-xs font-bold text-brand-700 uppercase block mb-1">Property Tax (Base)</label><input type="number" value={data.propertyTax} onChange={(e) => handlePropertyTaxChange(e.target.value)} className="w-full text-xl font-bold text-slate-900 bg-transparent border-b border-brand-200 focus:outline-none focus:border-brand-500 py-1" /><p className="text-[10px] text-slate-500 mt-1">Changing this auto-calculates other fields.</p></div>
            <div className="grid grid-cols-2 gap-4"><EditRow label="Drainage Tax (10%)" value={data.drainageTax} onChange={(v) => handleFieldChange('drainageTax', v)} type="number" /><EditRow label="Lighting Tax (10%)" value={data.lightingTax} onChange={(v) => handleFieldChange('lightingTax', v)} type="number" /><EditRow label="Water Tax (8%)" value={data.waterTax} onChange={(v) => handleFieldChange('waterTax', v)} type="number" /><EditRow label="Library Cess (8%)" value={data.libraryCess} onChange={(v) => handleFieldChange('libraryCess', v)} type="number" /><EditRow label="Sports Cess (3%)" value={data.sportsCess} onChange={(v) => handleFieldChange('sportsCess', v)} type="number" /><EditRow label="Fire Tax (1%)" value={data.fireTax} onChange={(v) => handleFieldChange('fireTax', v)} type="number" /></div>
            <div className="pt-4 border-t border-slate-200 flex justify-between items-center"><span className="font-bold text-slate-600 uppercase text-xs">Total Demand</span><span className="text-2xl font-bold text-brand-700">₹{data.totalDemand}</span></div>
        </div>
        <button onClick={() => onSave(data)} className="w-full bg-brand-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-brand-700 active:scale-95 transition-all mt-6 flex justify-center items-center gap-2"><Check className="w-5 h-5" /> Update Row</button>
      </div>
    </div>
  );
};

// --- COLLAPSIBLE EDIT SECTION ---
interface CollapsibleSectionProps { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean; noPadding?: boolean; onSave?: () => void; onCancel?: () => void; }
const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, icon, children, defaultOpen = false, noPadding = false, onSave, onCancel }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 overflow-hidden ring-1 ring-white/60">
      <div className="px-5 py-3 border-b border-white/20 flex justify-between items-center cursor-pointer hover:bg-white/40 transition-colors select-none" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-brand-600 text-white shadow-sm">{icon}</div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">{title}</h3>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className={noPadding ? '' : 'p-5 pt-2'}>{children}</div>
        {onSave && onCancel && (
             <div className="p-3 bg-white/30 border-t border-white/20 flex gap-3">
                 <button onClick={onSave} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold text-xs shadow hover:bg-green-700">Save Changes</button>
                 <button onClick={onCancel} className="flex-1 bg-red-500 text-white py-2 rounded-lg font-bold text-xs shadow hover:bg-red-600">Cancel</button>
             </div>
        )}
      </div>
    </div>
  );
};

// --- HELPER FUNCTIONS ---
const compareValues = (v1: any, v2: any): boolean => String(v1) === String(v2);
const generateChanges = (original: any, modified: any): string[] => {
  const changes: string[] = [];
  const ignoreKeys = ['history', 'auditLogs', 'demandDetails', 'tapDemands', 'paymentHistory', 'boundaries'];
  for (const key in original) {
    if (ignoreKeys.includes(key)) continue;
    if (typeof original[key] !== 'object' && !compareValues(original[key], modified[key])) { changes.push(`${key}: "${original[key]}" -> "${modified[key]}"`); }
  }
  if (original.boundaries && modified.boundaries) {
    for (const key in original.boundaries) { if (!compareValues(original.boundaries[key as keyof typeof original.boundaries], modified.boundaries[key as keyof typeof modified.boundaries])) { changes.push(`Boundaries.${key}: "${original.boundaries[key as keyof typeof original.boundaries]}" -> "${modified.boundaries[key as keyof typeof modified.boundaries]}"`); } }
  }
  if (original.demandDetails && modified.demandDetails) {
     modified.demandDetails.forEach((newItem: DemandDetail, idx: number) => {
        const origItem = original.demandDetails[idx];
        if (!origItem) return;
        ['propertyTax', 'drainageTax', 'waterTax', 'lightingTax', 'libraryCess'].forEach((field) => { const k = field as keyof DemandDetail; if (!compareValues(origItem[k], newItem[k])) { changes.push(`Demand[${newItem.demandYear}].${field}: ${origItem[k]} -> ${newItem[k]}`); } });
     });
  }
  return changes;
};

// Helper for currency formatting
const formatFullCurrency = (val: number) => {
  return `₹${val.toLocaleString()}`;
};

// --- MAIN COMPONENT ---
export const HouseholdDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useContext(AuthContext);
  
  const [data, setData] = useState<Household | null>(null);
  const [tempData, setTempData] = useState<Household | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [modificationReason, setModificationReason] = useState<string>('');
  
  const [editingDemandIndex, setEditingDemandIndex] = useState<number | null>(null);
  const [receiptToPrint, setReceiptToPrint] = useState<{ receiptNo: string, records: PaymentRecord[] } | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => { const h = getHouseholdById(id || ''); if (h) setData(h); }, [id]);

  if (!data) return <div className="p-8 text-center text-white font-bold">Household not found</div>;

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isAdminView = user?.role === 'ADMIN' || isSuperAdmin;
  const pendingAmount = data ? data.totalDemand - data.totalCollected : 0;
  const isPaid = pendingAmount <= 0;

  const toggleEditMode = () => {
      if (isEditMode) { setIsEditMode(false); setTempData(null); } 
      else { setTempData(JSON.parse(JSON.stringify(data))); setIsEditMode(true); }
  };

  const saveEdit = (section: string) => {
    if (tempData) {
      if (section === 'Owner Details') {
        if (!modificationReason.trim()) { alert("Please select a Mode of Acquisition for this change."); return; }
        const newHistory: HistoryRecord = { date: new Date().toISOString().split('T')[0], eventType: 'Mutation', description: `Ownership change via ${modificationReason}`, fromOwner: data?.ownerName, toOwner: tempData.ownerName };
        if (!tempData.history) tempData.history = [];
        tempData.history.unshift(newHistory);
      }
      if (section === 'Demand Details') { const newTotal = tempData.demandDetails.reduce((sum, d) => sum + d.totalDemand, 0); tempData.totalDemand = newTotal; }
      const changes = generateChanges(data, tempData);
      if (changes.length > 0) {
        const logEntry: AuditLog = { timestamp: new Date().toISOString(), userId: user?.id || 'unknown', userName: user?.name || 'Unknown User', section: section, changes: changes };
        if (!tempData.auditLogs) tempData.auditLogs = [];
        tempData.auditLogs.unshift(logEntry);
      }
      setData(tempData);
      updateHousehold(tempData);
      setModificationReason('');
      alert("Changes saved successfully!");
    }
  };

  const handleChange = (field: keyof Household, value: any) => { if (tempData) setTempData({ ...tempData, [field]: value }); };
  const handleNestedChange = (parent: keyof Household, key: string, value: any) => { if (tempData && typeof tempData[parent] === 'object') { setTempData({ ...tempData, [parent]: { ...tempData[parent] as any, [key]: value } }); } };
  const handleDemandRowClick = (index: number) => { if (isEditMode) setEditingDemandIndex(index); };
  const saveDemandFromModal = (updatedDemand: DemandDetail) => { if (tempData && editingDemandIndex !== null) { const newDemands = [...tempData.demandDetails]; newDemands[editingDemandIndex] = updatedDemand; setTempData({ ...tempData, demandDetails: newDemands }); setEditingDemandIndex(null); } };
  const openReceipt = (receiptNo: string) => { const records = data.paymentHistory.filter(p => p.receiptNo === receiptNo); setReceiptToPrint({ receiptNo, records }); };

  const uniqueReceipts = Array.from(new Set(data.paymentHistory.map(p => p.receiptNo)));
  const groupedPayments = uniqueReceipts.map(rNo => { const records = data.paymentHistory.filter(p => p.receiptNo === rNo); return { ...records[0], totalAmount: records.reduce((sum, r) => sum + r.amount, 0), records: records }; });
  const currentData = isEditMode ? tempData! : data;

  const siteArea = data.siteLength * data.siteBreadth;

  const getDemandBreakdown = (d: DemandDetail) => {
    const parts = [];
    if (d.propertyTax) parts.push(`${d.propertyTax}(PT)`);
    if (d.libraryCess) parts.push(`${d.libraryCess}(LC)`);
    if (d.waterTax) parts.push(`${d.waterTax}(WT)`);
    if (d.lightingTax) parts.push(`${d.lightingTax}(LT)`);
    if (d.drainageTax) parts.push(`${d.drainageTax}(DT)`);
    if (d.sportsCess) parts.push(`${d.sportsCess}(SC)`);
    if (d.fireTax) parts.push(`${d.fireTax}(FT)`);
    return parts.join(', ');
  };

  return (
    <div className="pb-6">
      {editingDemandIndex !== null && tempData && ( <DemandEditModal demand={tempData.demandDetails[editingDemandIndex]} onSave={saveDemandFromModal} onClose={() => setEditingDemandIndex(null)} /> )}
      {receiptToPrint && ( <ReceiptModal receiptNo={receiptToPrint.receiptNo} records={receiptToPrint.records} household={data} onClose={() => setReceiptToPrint(null)} /> )}
      {showPaymentModal && ( <PaymentModal household={data} onClose={() => setShowPaymentModal(false)} onPaymentSuccess={() => { const h = getHouseholdById(id || ''); if(h) setData({...h}); }} /> )}

      <div className="bg-white/30 backdrop-blur-md px-5 pt-5 pb-4 border-b border-white/20 shadow-lg relative overflow-hidden">
        {/* Header Name & Actions */}
        <div className="flex items-start gap-3 mb-4">
            <div className="bg-white/50 p-2.5 rounded-xl shadow-sm border border-white/40 shrink-0">
               <User className="w-6 h-6 text-brand-700" />
            </div>
            
            <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-slate-900 leading-tight truncate">{data.ownerName}</h2>
                
                <div className="flex items-center justify-between mt-1">
                   <p className="text-xs text-slate-600 font-medium truncate pr-2">
                      {data.relationType}: <span className="text-slate-800">{data.guardianName}</span>
                   </p>
                   
                   <div className="flex gap-2 shrink-0">
                        {isAdminView && (
                            <button 
                                onClick={toggleEditMode}
                                className={`p-1.5 rounded-lg transition-all shadow-sm ${isEditMode ? 'bg-slate-800 text-white ring-1 ring-slate-600' : 'bg-white/50 text-slate-700 hover:bg-white'} border border-white/30`}
                                title="Toggle Edit Mode"
                            >
                                {isEditMode ? <Eye className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                            </button>
                        )}
                        <button 
                            onClick={() => setShowPaymentModal(true)}
                            disabled={isPaid}
                            className={`${isPaid ? 'bg-green-100 text-green-800 border-green-200 cursor-default' : 'bg-red-600 text-white hover:bg-red-700 cursor-pointer shadow-md'} text-[10px] font-bold px-2 py-1.5 rounded-lg flex items-center gap-1 transition-all active:scale-95 border border-transparent`}
                        >
                            {isPaid ? 'Paid' : 'Pay Tax'}
                        </button>
                   </div>
                </div>
            </div>
        </div>
        
        {/* Identity & Location Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
             <InfoItem icon={<FileBadge />} label="Assessment" value={data.assessmentNumber} color="bg-blue-600" />
             <InfoItem icon={<History />} label="Old Assmt" value={data.oldAssessmentNumber} color="bg-slate-500" />
             <InfoItem icon={<Smartphone />} label="Mobile" value={data.mobileNumber} color="bg-green-600" />
             <InfoItem icon={<CreditCard />} label="Aadhar" value={data.aadharNumber} color="bg-purple-600" />
             <InfoItem icon={<MapPin />} label="Address" value={`${data.address}, ${data.doorNumber}`} color="bg-red-500" />
             <InfoItem icon={<Map />} label="Survey No" value={data.surveyNumber} color="bg-amber-600" />
        </div>

        {/* Property Specifics Grid */}
        <SectionHeader icon={<Home />} title="Property Details" />
        <div className="grid grid-cols-3 gap-2 mb-3">
             <InfoItem icon={<Building2 />} label="Type" value={data.natureOfProperty} color="bg-indigo-500" />
              <InfoItem icon={<LayoutGrid />} label="Usage" value={data.natureOfUsage} color="bg-teal-600" /> 
             <InfoItem icon={<Key />} label="Ownership" value={data.natureOfOwnership} color="bg-orange-500" />
             <InfoItem icon={<CalendarClock />} label="Age" value={data.buildingAge} color="bg-pink-600" />
             <InfoItem icon={<Layers />} label="Floors" value={data.floorDescription} color="bg-cyan-600" />
             <InfoItem icon={<UserCheck />} label="Occupancy" value={data.occupancyDescription} color="bg-violet-600" />
        </div>

        {/* Measurements & Boundaries Grid */}
        <SectionHeader icon={<Maximize />} title="Measurements & Boundaries" />
        <div className="grid grid-cols-3 gap-2 mb-3">
             {/* New Dimensions Cards */}
             <InfoItem icon={<Ruler />} label="Site (L x B) SqYd" value={`${data.siteLength} x ${data.siteBreadth}`} color="bg-cyan-600" />
             <InfoItem icon={<Ruler />} label="Build (L x B) SqFt" value={`${data.floorLength} x ${data.floorBreadth}`} color="bg-cyan-700" />
             {/* Combined Area Card */}
             <InfoItem 
                icon={<Maximize />} 
                label="Area" 
                value={
                    <span>
                        {Math.round(siteArea)} <span className="text-[8px] opacity-70">SqYd</span> / {data.totalFloorArea} <span className="text-[8px] opacity-70">SqFt</span>
                    </span>
                }
                color="bg-emerald-600" 
             />
             
             {/* Split Capital Value Cards - UPDATED LABELS & ICONS & FULL VALUES */}
             <InfoItem icon={<Coins />} label="Site Cap Val" value={formatFullCurrency(data.siteCapitalValue)} color="bg-lime-600" />
             <InfoItem icon={<Banknote />} label="Build Cap Val" value={formatFullCurrency(data.buildingCapitalValue)} color="bg-green-600" />
             
             <InfoItem icon={<Compass />} label="North" value={data.boundaries.north} color="bg-slate-400" />
             <InfoItem icon={<Compass />} label="South" value={data.boundaries.south} color="bg-slate-400" />
             <InfoItem icon={<Compass />} label="East" value={data.boundaries.east} color="bg-slate-400" />
             <InfoItem icon={<Compass />} label="West" value={data.boundaries.west} color="bg-slate-400" />
        </div>

        {/* Financials Summary */}
        <SectionHeader icon={<Wallet />} title="Financial Summary" />
        <div className="flex bg-white/40 rounded-xl overflow-hidden border border-white/30 shadow-sm mb-3">
            <div className="flex-1 p-2 text-center border-r border-white/30">
                <p className="text-[9px] uppercase font-bold text-slate-500">Total Demand</p>
                <p className="text-sm font-bold text-slate-900">₹{data.totalDemand}</p>
            </div>
            <div className="flex-1 p-2 text-center border-r border-white/30 bg-green-50/50">
                <p className="text-[9px] uppercase font-bold text-green-700">Collected</p>
                <p className="text-sm font-bold text-green-700">₹{data.totalCollected}</p>
            </div>
            <div className="flex-1 p-2 text-center bg-red-50/50">
                <p className="text-[9px] uppercase font-bold text-red-600">Pending</p>
                <p className="text-sm font-bold text-red-600">₹{pendingAmount}</p>
            </div>
        </div>

        {/* Timelines (Compact) */}
        <div className="space-y-4">
            
            {/* DEMAND HISTORY TIMELINE */}
            <div>
                 <p className="text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1">Demand History</p>
                 <div className="pl-2 border-l-2 border-white/30 ml-2 space-y-3 py-1">
                    {data.demandDetails.map((d, i) => (
                        <div key={i} className="relative pl-4 group" onClick={() => handleDemandRowClick(i)}>
                             {/* Dot */}
                            <div className="absolute -left-[5px] top-1.5 w-2 h-2 bg-white rounded-full ring-2 ring-red-400 group-hover:bg-red-500 transition-colors" />
                            
                            {/* Layout matching Lifecycle History */}
                            <div className={`flex justify-between items-start ${isEditMode ? 'cursor-pointer' : ''}`}>
                                <div className="pr-2 flex-1">
                                    <p className="text-[10px] font-bold text-slate-800 leading-tight">{d.demandYear}</p>
                                    <p className="text-[9px] text-slate-600 leading-tight mt-0.5 break-all">{getDemandBreakdown(d)}</p>
                                </div>
                                <span className="text-[9px] font-mono font-bold text-slate-700 bg-white/40 px-1.5 py-0.5 rounded border border-white/30 whitespace-nowrap ml-2">
                                    ₹{d.totalDemand}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* LIFECYCLE TIMELINE */}
            {data.history && data.history.length > 0 && (
                <div>
                     <p className="text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1">Property Lifecycle History</p>
                     <div className="pl-2 border-l-2 border-white/30 ml-2 space-y-3 py-1">
                        {data.history.map((event, idx) => (
                            <div key={idx} className="relative pl-4 group">
                                <div className="absolute -left-[5px] top-1.5 w-2 h-2 bg-white rounded-full ring-2 ring-blue-400 group-hover:bg-brand-500 transition-colors" />
                                <div className="flex justify-between items-start">
                                    <div className="pr-2">
                                        <p className="text-[10px] font-bold text-slate-800 leading-tight">{event.eventType}</p>
                                        <p className="text-[9px] text-slate-600 leading-tight mt-0.5">{event.description}</p>
                                    </div>
                                    <span className="text-[9px] font-mono text-slate-500 bg-white/40 px-1.5 py-0.5 rounded border border-white/30 whitespace-nowrap">{event.date}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* PAYMENT HISTORY TIMELINE */}
            {groupedPayments.length > 0 && (
                <div>
                     <p className="text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1">Payment History</p>
                     <div className="pl-2 border-l-2 border-white/30 ml-2 space-y-3 py-1">
                        {groupedPayments.map((p, i) => (
                           <div key={i} className="relative pl-4 group">
                               <div className="absolute -left-[5px] top-1.5 w-2 h-2 bg-white rounded-full ring-2 ring-green-500 group-hover:bg-green-600 transition-colors" />
                               
                               <div 
                                 onClick={() => openReceipt(p.receiptNo)}
                                 className="flex justify-between items-start cursor-pointer -m-1 p-1 rounded hover:bg-white/30 transition-colors"
                               >
                                   <div className="pr-2 flex-1">
                                       <p className="text-[10px] font-bold text-slate-800 leading-tight">{p.receiptNo}</p>
                                       <p className="text-[9px] text-slate-600 leading-tight mt-0.5">Paid via {p.paymentMode}</p>
                                   </div>
                                   <div className="text-right whitespace-nowrap pl-2">
                                       <p className="text-[10px] font-bold text-green-700 leading-tight">₹{p.totalAmount}</p>
                                       <p className="text-[9px] font-mono text-slate-500 mt-0.5">{p.dateOfPayment}</p>
                                   </div>
                               </div>
                           </div>
                        ))}
                     </div>
                </div>
            )}
        </div>
      </div>

      {/* --- EDIT FORMS (Only visible in Edit Mode) --- */}
      {isEditMode && (
          <div className="p-4 space-y-4 animate-in slide-in-from-bottom-10 fade-in">
              <div className="flex items-center gap-2 p-3 bg-brand-100/80 text-brand-800 rounded-xl mb-4 border border-brand-200">
                  <Pencil className="w-5 h-5 shrink-0" />
                  <p className="text-xs font-bold">Edit Mode Active. Expand sections below to modify data.</p>
              </div>

              <CollapsibleSection title="Edit Owner Details" icon={<User className="w-4 h-4" />} onSave={() => saveEdit('Owner Details')} onCancel={toggleEditMode}>
                  <EditRow label="Name" value={currentData.ownerName} onChange={(v) => handleChange('ownerName', v)} />
                  <EditRow label="Mobile" value={currentData.mobileNumber} onChange={(v) => handleChange('mobileNumber', v)} />
                  <EditRow label="Aadhar" value={currentData.aadharNumber} onChange={(v) => handleChange('aadharNumber', v)} />
                  <EditSelect label="Relation" value={currentData.relationType} onChange={(v) => handleChange('relationType', v)} options={RELATION_TYPE_OPTIONS} />
                  <EditRow label="Guardian" value={currentData.guardianName} onChange={(v) => handleChange('guardianName', v)} />
                  <EditRow label="Door No" value={currentData.doorNumber} onChange={(v) => handleChange('doorNumber', v)} />
                  <div className="mt-4 pt-4 border-t border-white/30">
                      <div className="flex items-center gap-2 mb-2"><AlertCircle className="w-4 h-4 text-orange-600" /><label className="text-xs font-bold text-slate-700 uppercase">Mode of Acquisition</label></div>
                      <select value={modificationReason} onChange={(e) => setModificationReason(e.target.value)} className="w-full bg-white/50 border border-white/40 rounded-lg px-3 py-2 text-sm text-slate-900 font-medium"><option value="">Select Mode...</option>{MODE_OF_ACQUISITION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>
                  </div>
              </CollapsibleSection>

              <CollapsibleSection title="Edit Property Info" icon={<Home className="w-4 h-4" />} onSave={() => saveEdit('Property Details')} onCancel={toggleEditMode}>
                   <EditRow label="Age/Date" value={currentData.buildingAge} onChange={(v) => handleChange('buildingAge', v)} />
                   <EditSelect label="Type" value={currentData.natureOfProperty} onChange={(v) => handleChange('natureOfProperty', v)} options={NATURE_PROPERTY_OPTIONS} />
                   <EditSelect label="Usage" value={currentData.natureOfUsage} onChange={(v) => handleChange('natureOfUsage', v)} options={NATURE_USAGE_OPTIONS} />
                   <EditSelect label="Ownership" value={currentData.natureOfOwnership} onChange={(v) => handleChange('natureOfOwnership', v)} options={NATURE_OWNERSHIP_OPTIONS} />
              </CollapsibleSection>

              <CollapsibleSection title="Edit Boundaries" icon={<Compass className="w-4 h-4" />} onSave={() => saveEdit('Neighbouring Details')} onCancel={toggleEditMode}>
                   <div className="grid grid-cols-2 gap-3">
                       <EditRow label="East" value={currentData.boundaries.east} onChange={(v) => handleNestedChange('boundaries', 'east', v)} />
                       <EditRow label="West" value={currentData.boundaries.west} onChange={(v) => handleNestedChange('boundaries', 'west', v)} />
                       <EditRow label="North" value={currentData.boundaries.north} onChange={(v) => handleNestedChange('boundaries', 'north', v)} />
                       <EditRow label="South" value={currentData.boundaries.south} onChange={(v) => handleNestedChange('boundaries', 'south', v)} />
                   </div>
              </CollapsibleSection>

              <CollapsibleSection title="Edit Measurements" icon={<Ruler className="w-4 h-4" />} onSave={() => saveEdit('Site Details')} onCancel={toggleEditMode}>
                   <div className="grid grid-cols-2 gap-3">
                       <EditRow label="Site Len" value={currentData.siteLength} onChange={(v) => handleChange('siteLength', v)} type="number" />
                       <EditRow label="Site Brd" value={currentData.siteBreadth} onChange={(v) => handleChange('siteBreadth', v)} type="number" />
                       <EditRow label="Floor Area" value={currentData.totalFloorArea} onChange={(v) => handleChange('totalFloorArea', v)} type="number" />
                       <EditSelect label="Floors" value={currentData.floorDescription} onChange={(v) => handleChange('floorDescription', v)} options={FLOOR_NO_OPTIONS} />
                   </div>
              </CollapsibleSection>

              <CollapsibleSection title="Edit Demands" icon={<IndianRupee className="w-4 h-4" />} noPadding onSave={() => saveEdit('Demand Details')} onCancel={toggleEditMode}>
                   <div className="p-3 text-xs bg-brand-50 text-brand-700 font-bold mb-1">Click a row to edit tax values</div>
                   <div className="overflow-x-auto"><table className="w-full text-xs text-left"><thead className="text-slate-600 bg-white/20 uppercase border-b border-white/20"><tr><th className="px-4 py-2">Year</th><th className="px-2 py-2 text-right">Tax</th><th className="px-4 py-2 text-right">Total</th></tr></thead><tbody>{currentData.demandDetails.map((d, idx) => <tr key={idx} onClick={() => handleDemandRowClick(idx)} className="border-b border-white/20 hover:bg-brand-100 cursor-pointer"><td className="px-4 py-2 font-medium">{d.demandYear}</td><td className="px-2 py-2 text-right">₹{d.propertyTax}</td><td className="px-4 py-2 text-right font-bold">₹{d.totalDemand}</td></tr>)}</tbody></table></div>
              </CollapsibleSection>
          </div>
      )}
    </div>
  );
};
