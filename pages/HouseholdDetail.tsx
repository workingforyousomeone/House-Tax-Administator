
import React, { useState, useContext, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { User, Phone, MapPin, ClipboardList, Layers, Maximize, Droplets, History, FileText, LayoutGrid, Hammer, RefreshCcw, Gift, Trash2, Milestone, Pencil, ChevronDown, Check, X, AlertCircle, ShieldAlert, Calculator, Printer, QrCode, IndianRupee } from 'lucide-react';
import { getHouseholdById, getClusterById, updateHousehold } from '../services/data';
import { AuthContext } from '../App';
import { Household, HistoryRecord, DemandDetail, AuditLog, PaymentRecord } from '../types';
import { PaymentModal } from '../components/PaymentModal';

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

const DetailRow: React.FC<{ label: string; value: string | number | React.ReactNode; isLast?: boolean; highlight?: boolean }> = ({ label, value, isLast, highlight }) => (
  <div className={`flex justify-between items-start py-2.5 ${!isLast ? 'border-b border-white/20' : ''}`}>
    <span className="text-slate-600 text-sm font-medium w-1/2 pr-2">{label}</span>
    <span className={`text-sm font-bold text-right w-1/2 break-words ${highlight ? 'text-brand-700' : 'text-slate-800'}`}>{value}</span>
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

const getEventIcon = (type: string) => {
  switch(type) {
    case 'Construction': return <Hammer className="w-4 h-4 text-blue-600" />;
    case 'Sale': return <RefreshCcw className="w-4 h-4 text-green-600" />;
    case 'Gift': return <Gift className="w-4 h-4 text-purple-600" />;
    case 'Demolition': return <Trash2 className="w-4 h-4 text-red-600" />;
    case 'Mutation': return <FileText className="w-4 h-4 text-orange-600" />;
    default: return <Milestone className="w-4 h-4 text-slate-600" />;
  }
};

// --- RECEIPT MODAL COMPONENT ---

interface ReceiptModalProps {
  receiptNo: string;
  records: PaymentRecord[];
  household: Household;
  onClose: () => void;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ receiptNo, records, household, onClose }) => {
    const totalAmount = records.reduce((sum, r) => sum + r.amount, 0);
    const date = records[0]?.dateOfPayment || '';
    
    // Generate QR Code URL
    const qrData = `https://swarnapanchayat.apcfss.in/HouseTaxPaymentTeluguView/House/${household.assessmentNumber}/${receiptNo}`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-telugu">
            {/* Modal Container */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-[350px] overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Screen Header (Hidden in Print) */}
                <div className="p-4 border-b flex justify-between items-center bg-slate-50 no-print">
                    <h3 className="font-bold text-slate-800">Print Preview</h3>
                    <div className="flex gap-2">
                        <button type="button" onClick={handlePrint} className="p-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 flex items-center gap-1 text-xs font-bold shadow-sm">
                            <Printer className="w-4 h-4" /> Print
                        </button>
                        <button onClick={onClose} className="p-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Printable Content Area */}
                <div id="printable-receipt" className="p-2 text-black text-[10px] leading-tight overflow-y-auto bg-white">
                    
                    {/* Header */}
                    <div className="text-center mb-2">
                         <div className="flex justify-center items-center gap-1 mb-1">
                             <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" className="w-6 h-6" />
                             <div className="text-red-600 font-bold">
                                 <p className="text-[10px]">పంచాయతి రాజ్ శాఖ</p>
                                 <p className="text-[8px] text-black">Panchayat Raj Dept</p>
                             </div>
                         </div>
                         <h2 className="font-bold text-[12px]">Pogiri గ్రామ పంచాయతీ</h2>
                         <p className="text-[9px]">Rajam మండలం ,Vizianagaram జిల్లా</p>
                         <p className="text-[10px] font-bold mt-1">2025-26 ఆర్థిక సంవత్సరం</p>
                         <h1 className="text-[14px] font-bold underline mt-1">House Tax రసీదు</h1>
                    </div>

                    <div className="border-t border-black my-2"></div>

                    {/* Owner Details */}
                    <div className="mb-2 relative min-h-[100px]">
                        <p className="font-bold text-[9px] text-green-700 mb-1">అసెస్మెంట్ యజమాని వివరాలు:</p>
                        <div className="pr-28">
                            <p><strong>అసెస్మెంట్ నెం:</strong> {household.assessmentNumber}</p>
                            <p><strong>పాత అసెస్మెంట్ నెం:</strong> {household.oldAssessmentNumber}</p>
                            <p><strong>యజమాని పేరు:</strong> {household.ownerName}</p>
                            <p><strong>తండ్రి/భర్త:</strong> {household.guardianName}</p>
                            <p><strong>ఇంటి సంఖ్య:</strong> {household.doorNumber}</p>
                            <p><strong>మొబైల్ నంబర్:</strong> {household.mobileNumber}</p>
                        </div>
                        {/* QR Code absolute positioned right */}
                        <div className="absolute top-2 right-0">
                            <img src={qrImageUrl} alt="QR Code" className="w-24 h-24" />
                        </div>
                    </div>

                    <div className="border-t border-black my-2"></div>

                    {/* Receipt Details */}
                    <div className="mb-2">
                        <p className="font-bold text-[9px] text-green-700 mb-1">రసీదు వివరాలు:</p>
                        <div className="grid grid-cols-2 gap-1">
                            <div>
                                <p className="text-[10px] text-slate-600">లావాదేవీ సంఖ్య:</p>
                                <p className="font-bold break-all">{receiptNo}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-600">లావాదేవీ తేదీ:</p>
                                <p className="font-bold">{date}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-600">చెల్లింపు విధానం:</p>
                                <p className="font-bold">{records[0]?.paymentMode}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-600">చెల్లింపు స్థితి:</p>
                                <p className="font-bold text-green-700">Success</p>
                            </div>
                        </div>
                    </div>

                    {/* Table - Font size reduced to text-[8px] */}
                    <table className="w-full border-collapse border border-slate-400 mb-2 text-[8px]">
                        <thead>
                            <tr className="bg-slate-100">
                                <th className="border border-slate-400 p-1">S.No</th>
                                <th className="border border-slate-400 p-1">Year</th>
                                <th className="border border-slate-400 p-1">Category</th>
                                <th className="border border-slate-400 p-1 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((r, i) => (
                                <tr key={i}>
                                    <td className="border border-slate-400 p-1 text-center">{i+1}</td>
                                    <td className="border border-slate-400 p-1 text-center">{r.dueYear}</td>
                                    <td className="border border-slate-400 p-1 text-center">{r.demandCategory}</td>
                                    <td className="border border-slate-400 p-1 text-right">{r.amount}</td>
                                </tr>
                            ))}
                            <tr className="font-bold bg-slate-50">
                                <td className="border border-slate-400 p-1 text-center" colSpan={3}>Total</td>
                                <td className="border border-slate-400 p-1 text-right">{totalAmount}</td>
                            </tr>
                        </tbody>
                    </table>

                    <p className="font-bold mb-2">
                        In Words: <span className="text-[9px] font-normal">Seven Hundred Ninety Five Rupees Only/- (Mock)</span>
                    </p>

                    <p className="text-[8px] text-center mt-4 text-slate-500">
                        గమనిక: ఇది కంప్యూటర్‌లో రూపొందించిన రసీదు, భౌతిక సంతకం అవసరం లేదు
                    </p>

                </div>
            </div>
            {/* Styles for print to hide everything else and ensure receipt is visible */}
            <style>{`
                @media print {
                    /* Reset global container styles to allow full page print */
                    html, body, #root, .min-h-screen, .max-w-md, .overflow-hidden {
                        height: auto !important;
                        overflow: visible !important;
                        position: static !important;
                        display: block !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        width: 100% !important;
                        max-width: none !important;
                    }

                    /* Hide all regular content */
                    body > * {
                        display: none !important;
                    }
                    
                    /* Make the modal container visible and absolute */
                    .fixed.z-50 {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        height: auto !important;
                        display: block !important;
                        background: white !important;
                        z-index: 9999 !important;
                    }

                    /* Hide screen-only controls inside the modal */
                    .no-print {
                        display: none !important;
                    }

                    /* Receipt Container Targeting */
                    #printable-receipt {
                        display: block !important;
                        visibility: visible !important;
                        width: 100% !important;
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                    }

                    #printable-receipt * {
                        visibility: visible !important;
                    }
                    
                    @page {
                        size: auto;
                        margin: 0mm;
                    }
                }
            `}</style>
        </div>
    );
};

interface DemandEditModalProps {
  demand: DemandDetail;
  onSave: (updatedDemand: DemandDetail) => void;
  onClose: () => void;
}

const DemandEditModal: React.FC<DemandEditModalProps> = ({ demand, onSave, onClose }) => {
  const [data, setData] = useState<DemandDetail>({ ...demand });

  // Handle Property Tax Change with Auto-Calculation logic
  const handlePropertyTaxChange = (val: string) => {
    const pTax = Number(val) || 0;
    
    // Formulae:
    // Library Cess: 8%, Water Tax: 8%, Drainage Tax: 10%, Lighting Tax: 10%, Sports Cess: 3%, Fire Tax: 1%
    const updated: DemandDetail = {
        ...data,
        propertyTax: pTax,
        libraryCess: Math.round(pTax * 0.08),
        waterTax: Math.round(pTax * 0.08),
        drainageTax: Math.round(pTax * 0.10),
        lightingTax: Math.round(pTax * 0.10),
        sportsCess: Math.round(pTax * 0.03),
        fireTax: Math.round(pTax * 0.01),
    };

    // Calculate Total
    updated.totalDemand = 
        updated.propertyTax + updated.libraryCess + updated.waterTax + 
        updated.drainageTax + updated.lightingTax + updated.sportsCess + updated.fireTax;

    setData(updated);
  };

  const handleFieldChange = (field: keyof DemandDetail, val: string) => {
    const numVal = Number(val) || 0;
    const updated = { ...data, [field]: numVal };
    
    // Recalculate total if manual edits happen
    updated.totalDemand = 
        updated.propertyTax + updated.libraryCess + updated.waterTax + 
        updated.drainageTax + updated.lightingTax + updated.sportsCess + updated.fireTax;
        
    setData(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white/90 backdrop-blur-xl w-full max-w-sm rounded-3xl shadow-2xl border border-white/50 p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-brand-600" />
                Edit Demand ({data.demandYear})
            </h3>
            <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
                <X className="w-5 h-5 text-slate-500" />
            </button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
            <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                <label className="text-xs font-bold text-brand-700 uppercase block mb-1">Property Tax (Base)</label>
                <input 
                    type="number" 
                    value={data.propertyTax} 
                    onChange={(e) => handlePropertyTaxChange(e.target.value)}
                    className="w-full text-xl font-bold text-slate-900 bg-transparent border-b border-brand-200 focus:outline-none focus:border-brand-500 py-1"
                />
                <p className="text-[10px] text-slate-500 mt-1">Changing this auto-calculates other fields.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <EditRow label="Drainage Tax (10%)" value={data.drainageTax} onChange={(v) => handleFieldChange('drainageTax', v)} type="number" />
                 <EditRow label="Lighting Tax (10%)" value={data.lightingTax} onChange={(v) => handleFieldChange('lightingTax', v)} type="number" />
                 <EditRow label="Water Tax (8%)" value={data.waterTax} onChange={(v) => handleFieldChange('waterTax', v)} type="number" />
                 <EditRow label="Library Cess (8%)" value={data.libraryCess} onChange={(v) => handleFieldChange('libraryCess', v)} type="number" />
                 <EditRow label="Sports Cess (3%)" value={data.sportsCess} onChange={(v) => handleFieldChange('sportsCess', v)} type="number" />
                 <EditRow label="Fire Tax (1%)" value={data.fireTax} onChange={(v) => handleFieldChange('fireTax', v)} type="number" />
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-600 uppercase text-xs">Total Demand</span>
                <span className="text-2xl font-bold text-brand-700">₹{data.totalDemand}</span>
            </div>
        </div>

        <button 
            onClick={() => onSave(data)}
            className="w-full bg-brand-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-brand-700 active:scale-95 transition-all mt-6 flex justify-center items-center gap-2"
        >
            <Check className="w-5 h-5" />
            Update Row
        </button>
      </div>
    </div>
  );
};

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  noPadding?: boolean;
  isEditing?: boolean;
  canEdit?: boolean;
  onStartEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
  title, icon, children, defaultOpen = false, noPadding = false, isEditing = false, canEdit = false, onStartEdit, onSave, onCancel 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  useEffect(() => {
      if (isEditing) setIsOpen(true);
  }, [isEditing]);

  return (
    <div className={`bg-white/40 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 overflow-hidden transition-all duration-300 ${isEditing ? 'ring-2 ring-brand-500 bg-white/60' : ''}`}>
      <div 
        className="px-5 py-3 border-b border-white/20 flex justify-between items-center cursor-pointer hover:bg-white/10 transition-colors select-none"
        onClick={() => !isEditing && setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-lg transition-colors shadow-sm ${isOpen || isEditing ? 'bg-brand-600 text-white' : 'bg-white/50 text-brand-700'}`}>
              {icon}
            </div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">{title}</h3>
        </div>
        
        <div className="flex items-center gap-3">
            {isEditing ? (
                <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onSave?.(); }}
                      className="p-1.5 bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 transition-transform active:scale-90"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onCancel?.(); }}
                      className="p-1.5 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-transform active:scale-90"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            ) : (
              <>
                  {canEdit && onStartEdit && (
                      <button 
                          onClick={(e) => { e.stopPropagation(); onStartEdit(); }}
                          className="p-1.5 bg-white/50 hover:bg-white hover:text-brand-700 text-slate-500 rounded-full transition-all shadow-sm border border-white/40 active:scale-90"
                          title="Edit"
                      >
                          <Pencil className="w-3.5 h-3.5" />
                      </button>
                  )}
                  <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
              </>
            )}
        </div>
      </div>
      
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className={noPadding ? '' : 'p-5 pt-2'}>
            {children}
        </div>
      </div>
    </div>
  );
};

// --- DIFF HELPER FUNCTIONS ---

const compareValues = (v1: any, v2: any): boolean => {
  return String(v1) === String(v2);
};

const generateChanges = (original: any, modified: any): string[] => {
  const changes: string[] = [];
  const ignoreKeys = ['history', 'auditLogs', 'demandDetails', 'tapDemands', 'paymentHistory', 'boundaries'];
  
  // 1. Check top-level primitive fields
  for (const key in original) {
    if (ignoreKeys.includes(key)) continue;
    if (typeof original[key] !== 'object' && !compareValues(original[key], modified[key])) {
       changes.push(`${key}: "${original[key]}" -> "${modified[key]}"`);
    }
  }

  // 2. Check Boundaries (Nested)
  if (original.boundaries && modified.boundaries) {
    for (const key in original.boundaries) {
       if (!compareValues(original.boundaries[key as keyof typeof original.boundaries], modified.boundaries[key as keyof typeof modified.boundaries])) {
         changes.push(`Boundaries.${key}: "${original.boundaries[key as keyof typeof original.boundaries]}" -> "${modified.boundaries[key as keyof typeof modified.boundaries]}"`);
       }
    }
  }

  // 3. Check Demand Details (Array)
  if (original.demandDetails && modified.demandDetails) {
     modified.demandDetails.forEach((newItem: DemandDetail, idx: number) => {
        const origItem = original.demandDetails[idx];
        if (!origItem) return;
        ['propertyTax', 'drainageTax', 'waterTax', 'lightingTax', 'libraryCess'].forEach((field) => {
            const k = field as keyof DemandDetail;
            if (!compareValues(origItem[k], newItem[k])) {
                changes.push(`Demand[${newItem.demandYear}].${field}: ${origItem[k]} -> ${newItem[k]}`);
            }
        });
     });
  }

  return changes;
};

// --- MAIN COMPONENT ---

export const HouseholdDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useContext(AuthContext);
  
  // Local state for data management
  const [data, setData] = useState<Household | null>(null);
  const [tempData, setTempData] = useState<Household | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [modificationReason, setModificationReason] = useState<string>('');
  
  // Demand Modal State
  const [editingDemandIndex, setEditingDemandIndex] = useState<number | null>(null);

  // Receipt Modal State
  const [receiptToPrint, setReceiptToPrint] = useState<{ receiptNo: string, records: PaymentRecord[] } | null>(null);

  // Payment Flow State
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Load initial data
  useEffect(() => {
    const h = getHouseholdById(id || '');
    if (h) {
      setData(h);
    }
  }, [id]);

  if (!data) return <div className="p-8 text-center text-white font-bold">Household not found</div>;

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isAdminView = user?.role === 'ADMIN' || isSuperAdmin;
  
  // Calculate if payment is fully paid
  const pendingAmount = data ? data.totalDemand - data.totalCollected : 0;
  const isPaid = pendingAmount <= 0;

  // --- EDITING HANDLERS ---

  const startEdit = (section: string) => {
    setTempData(JSON.parse(JSON.stringify(data))); // Deep copy
    setEditingSection(section);
    setModificationReason('');
  };

  const cancelEdit = () => {
    setTempData(null);
    setEditingSection(null);
    setModificationReason('');
    setEditingDemandIndex(null);
  };

  const saveEdit = () => {
    if (tempData) {
      // 1. Validate Owner Details Modification Reason
      if (editingSection === 'Owner Details') {
        if (!modificationReason.trim()) {
          alert("Please select a Mode of Acquisition for this change.");
          return;
        }
        const newHistory: HistoryRecord = {
          date: new Date().toISOString().split('T')[0],
          eventType: 'Mutation',
          description: `Ownership change via ${modificationReason}`,
          fromOwner: data?.ownerName, // Original name
          toOwner: tempData.ownerName // New name
        };
        if (!tempData.history) tempData.history = [];
        tempData.history.unshift(newHistory);
      }

      // 2. Recalculate Totals if Demand Details changed
      if (editingSection === 'Demand Details') {
        const newTotal = tempData.demandDetails.reduce((sum, d) => sum + d.totalDemand, 0);
        tempData.totalDemand = newTotal;
      }

      // 3. Generate Audit Log
      const changes = generateChanges(data, tempData);
      if (changes.length > 0) {
        const logEntry: AuditLog = {
          timestamp: new Date().toISOString(),
          userId: user?.id || 'unknown',
          userName: user?.name || 'Unknown User',
          section: editingSection || 'General',
          changes: changes
        };
        if (!tempData.auditLogs) tempData.auditLogs = [];
        tempData.auditLogs.unshift(logEntry);
      }

      // 4. Persist
      setData(tempData);
      updateHousehold(tempData); // Persist to global store
    }
    setEditingSection(null);
    setTempData(null);
    setModificationReason('');
  };

  const handleChange = (field: keyof Household, value: any) => {
    if (tempData) {
      setTempData({ ...tempData, [field]: value });
    }
  };

  const handleNestedChange = (parent: keyof Household, key: string, value: any) => {
    if (tempData && typeof tempData[parent] === 'object') {
      setTempData({
        ...tempData,
        [parent]: {
          ...tempData[parent] as any,
          [key]: value
        }
      });
    }
  };

  // --- MODAL HANDLERS FOR DEMAND ---

  const handleDemandRowClick = (index: number) => {
    if (editingSection === 'Demand Details') {
        setEditingDemandIndex(index);
    }
  };

  const saveDemandFromModal = (updatedDemand: DemandDetail) => {
    if (tempData && editingDemandIndex !== null) {
        const newDemands = [...tempData.demandDetails];
        newDemands[editingDemandIndex] = updatedDemand;
        setTempData({ ...tempData, demandDetails: newDemands });
        setEditingDemandIndex(null);
    }
  };

  // --- RECEIPT HANDLERS ---
  const openReceipt = (receiptNo: string) => {
      // Find all records matching this receipt number
      const records = data.paymentHistory.filter(p => p.receiptNo === receiptNo);
      setReceiptToPrint({ receiptNo, records });
  };

  // Grouped Payment History for Display
  const uniqueReceipts = Array.from(new Set(data.paymentHistory.map(p => p.receiptNo)));
  const groupedPayments = uniqueReceipts.map(rNo => {
      const records = data.paymentHistory.filter(p => p.receiptNo === rNo);
      return {
          ...records[0],
          totalAmount: records.reduce((sum, r) => sum + r.amount, 0),
          records: records
      };
  });


  const currentData = editingSection ? tempData! : data;
  const isEditing = (section: string) => editingSection === section;

  return (
    <div className="pb-6">
      
      {/* DEMAND EDIT MODAL */}
      {editingDemandIndex !== null && tempData && (
        <DemandEditModal 
            demand={tempData.demandDetails[editingDemandIndex]} 
            onSave={saveDemandFromModal}
            onClose={() => setEditingDemandIndex(null)}
        />
      )}

      {/* RECEIPT MODAL */}
      {receiptToPrint && (
          <ReceiptModal 
            receiptNo={receiptToPrint.receiptNo}
            records={receiptToPrint.records}
            household={data}
            onClose={() => setReceiptToPrint(null)}
          />
      )}

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
          <PaymentModal 
              household={data}
              onClose={() => setShowPaymentModal(false)}
              onPaymentSuccess={() => {
                  // Re-fetch data or force re-render via state update is handled by the data reference update and react state
                  // Since 'data' is a state, we need to update it to reflect the new payment
                  // For this mock, we just reload the data object from the store which has been mutated
                  const h = getHouseholdById(id || '');
                  if(h) setData({...h}); 
                  // Close modal handles internally if receipt shown, but here we can ensure consistent state
              }}
          />
      )}

      {/* Header Profile */}
      <div className="bg-white/30 backdrop-blur-md px-6 pt-6 pb-4 border-b border-white/20 shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-2">
              <h2 className="text-2xl font-bold text-slate-900 leading-tight drop-shadow-sm flex-1 mr-2">{data.ownerName}</h2>
              <button 
                onClick={() => setShowPaymentModal(true)}
                disabled={isPaid}
                className={`${isPaid ? 'bg-green-600 cursor-default' : 'bg-red-600 hover:bg-red-700 cursor-pointer'} text-white text-xs font-bold px-3 py-2 rounded-xl shadow-lg flex items-center gap-1 transition-all active:scale-95 shrink-0`}
              >
                 {isPaid ? <Check className="w-3.5 h-3.5" /> : <IndianRupee className="w-3.5 h-3.5" />}
                 {isPaid ? 'Tax Paid' : 'Pay Tax'}
              </button>
          </div>
          
          <div className="space-y-2">
              {/* Address */}
              <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                 <MapPin className="w-4 h-4 text-brand-700 shrink-0" />
                 <span className="truncate">{data.address}, {data.doorNumber}</span>
              </div>
              
              {/* Guardian + Old Assessment Row */}
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-700 font-medium text-sm overflow-hidden">
                     <User className="w-4 h-4 text-brand-700 shrink-0" />
                     <span className="truncate">{data.guardianName || 'N/A'}</span>
                  </div>
                  
                  {data.oldAssessmentNumber && (
                    <div className="flex items-center gap-2 text-slate-600 font-medium text-sm shrink-0 ml-4">
                        <History className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>{data.oldAssessmentNumber}</span>
                    </div>
                  )}
              </div>

              {/* Assessment + Mobile Row */}
              <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                       <FileText className="w-4 h-4 text-brand-700 shrink-0" />
                       <span>{data.assessmentNumber}</span>
                   </div>

                   <div className="flex items-center gap-2 text-slate-700 font-medium text-sm ml-4">
                       <Phone className="w-4 h-4 text-brand-700 shrink-0" />
                       <span>{data.mobileNumber || 'N/A'}</span>
                   </div>
              </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        
        {/* 1) Owner Details */}
        <CollapsibleSection
          title="Owner Details"
          icon={<User className="w-4 h-4" />}
          defaultOpen={false}
          isEditing={isEditing('Owner Details')}
          canEdit={isSuperAdmin}
          onStartEdit={() => startEdit('Owner Details')}
          onSave={saveEdit}
          onCancel={cancelEdit}
        >
            {isEditing('Owner Details') ? (
                <>
                   <EditRow label="Name" value={currentData.ownerName} onChange={(v) => handleChange('ownerName', v)} />
                   <EditRow label="Mobile" value={currentData.mobileNumber} onChange={(v) => handleChange('mobileNumber', v)} />
                   <EditRow label="Aadhar Number" value={currentData.aadharNumber} onChange={(v) => handleChange('aadharNumber', v)} />
                   <EditRow label="Gender" value={currentData.gender} onChange={(v) => handleChange('gender', v)} />
                   <EditSelect label="Relation Type" value={currentData.relationType || 'Father'} onChange={(v) => handleChange('relationType', v)} options={RELATION_TYPE_OPTIONS} />
                   <EditRow label="Guardian" value={currentData.guardianName} onChange={(v) => handleChange('guardianName', v)} />
                   <EditRow label="Survey No" value={currentData.surveyNumber} onChange={(v) => handleChange('surveyNumber', v)} />
                   <EditRow label="Door No" value={currentData.doorNumber} onChange={(v) => handleChange('doorNumber', v)} />
                   <EditRow label="Address" value={currentData.address} onChange={(v) => handleChange('address', v)} />
                   
                   <div className="mt-4 pt-4 border-t border-white/30">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-orange-600" />
                        <label className="text-xs font-bold text-slate-700 uppercase">Mode of Acquisition (Required)</label>
                      </div>
                      <div className="relative">
                        <select 
                            value={modificationReason}
                            onChange={(e) => setModificationReason(e.target.value)}
                            className="w-full bg-white/50 border border-white/40 rounded-lg px-3 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/50 appearance-none"
                        >
                            <option value="">Select Mode...</option>
                            {MODE_OF_ACQUISITION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                             <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                   </div>
                </>
            ) : (
                <>
                    <DetailRow label="Aadhar Number" value={currentData.aadharNumber} />
                    <DetailRow label="Gender" value={currentData.gender} />
                    <DetailRow label="Survey No" value={currentData.surveyNumber} />
                    <DetailRow label="Door No" value={currentData.doorNumber} />
                    <DetailRow label="Address" value={currentData.address} isLast />
                </>
            )}
        </CollapsibleSection>

        {/* 2) Property Details */}
        <CollapsibleSection
            title="Property Details"
            icon={<ClipboardList className="w-4 h-4" />}
            defaultOpen={false}
            isEditing={isEditing('Property Details')}
            canEdit={isSuperAdmin}
            onStartEdit={() => startEdit('Property Details')}
            onSave={saveEdit}
            onCancel={cancelEdit}
        >
            {isEditing('Property Details') ? (
                <>
                   <EditRow label="Building Age/Date" value={currentData.buildingAge} onChange={(v) => handleChange('buildingAge', v)} />
                   <EditSelect label="Nature of Property" value={currentData.natureOfProperty} onChange={(v) => handleChange('natureOfProperty', v)} options={NATURE_PROPERTY_OPTIONS} />
                   <EditSelect label="Nature of Land Use" value={currentData.natureOfLandUse} onChange={(v) => handleChange('natureOfLandUse', v)} options={NATURE_LANDUSE_OPTIONS} />
                   <EditSelect label="Nature of Usage" value={currentData.natureOfUsage} onChange={(v) => handleChange('natureOfUsage', v)} options={NATURE_USAGE_OPTIONS} />
                   <EditSelect label="Ownership" value={currentData.natureOfOwnership} onChange={(v) => handleChange('natureOfOwnership', v)} options={NATURE_OWNERSHIP_OPTIONS} />
                   <EditSelect label="Mode of Acquisition" value={currentData.modeOfAcquisition} onChange={(v) => handleChange('modeOfAcquisition', v)} options={MODE_OF_ACQUISITION_OPTIONS} />
                </>
            ) : (
                <>
                    <DetailRow label="Building Age/Date" value={currentData.buildingAge} />
                    <DetailRow label="Nature of Property" value={currentData.natureOfProperty} />
                    <DetailRow label="Nature of Land Use" value={currentData.natureOfLandUse} />
                    <DetailRow label="Nature of Usage" value={currentData.natureOfUsage} />
                    <DetailRow label="Ownership" value={currentData.natureOfOwnership} />
                    <DetailRow label="Mode of Acquisition" value={currentData.modeOfAcquisition} isLast />
                </>
            )}
        </CollapsibleSection>

        {/* 3) Neighbouring Details */}
        <CollapsibleSection
            title="Neighbouring Details"
            icon={<LayoutGrid className="w-4 h-4" />}
            isEditing={isEditing('Neighbouring Details')}
            canEdit={isSuperAdmin}
            onStartEdit={() => startEdit('Neighbouring Details')}
            onSave={saveEdit}
            onCancel={cancelEdit}
        >
            {isEditing('Neighbouring Details') ? (
                 <div className="space-y-3">
                     <EditRow label="East" value={currentData.boundaries.east} onChange={(v) => handleNestedChange('boundaries', 'east', v)} />
                     <EditRow label="West" value={currentData.boundaries.west} onChange={(v) => handleNestedChange('boundaries', 'west', v)} />
                     <EditRow label="North" value={currentData.boundaries.north} onChange={(v) => handleNestedChange('boundaries', 'north', v)} />
                     <EditRow label="South" value={currentData.boundaries.south} onChange={(v) => handleNestedChange('boundaries', 'south', v)} />
                 </div>
            ) : (
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-white/40 p-3 rounded-xl border border-white/30">
                        <span className="block text-[10px] font-bold text-slate-600 uppercase mb-1">East</span>
                        <span className="font-bold text-slate-800 break-words">{currentData.boundaries.east}</span>
                    </div>
                    <div className="bg-white/40 p-3 rounded-xl border border-white/30">
                        <span className="block text-[10px] font-bold text-slate-600 uppercase mb-1">West</span>
                        <span className="font-bold text-slate-800 break-words">{currentData.boundaries.west}</span>
                    </div>
                    <div className="bg-white/40 p-3 rounded-xl border border-white/30">
                        <span className="block text-[10px] font-bold text-slate-600 uppercase mb-1">North</span>
                        <span className="font-bold text-slate-800 break-words">{currentData.boundaries.north}</span>
                    </div>
                    <div className="bg-white/40 p-3 rounded-xl border border-white/30">
                        <span className="block text-[10px] font-bold text-slate-600 uppercase mb-1">South</span>
                        <span className="font-bold text-slate-800 break-words">{currentData.boundaries.south}</span>
                    </div>
                </div>
            )}
        </CollapsibleSection>

        {/* 4) Site Details */}
        <CollapsibleSection
            title="Site Details"
            icon={<Maximize className="w-4 h-4" />}
            isEditing={isEditing('Site Details')}
            canEdit={isSuperAdmin}
            onStartEdit={() => startEdit('Site Details')}
            onSave={saveEdit}
            onCancel={cancelEdit}
        >
             {isEditing('Site Details') ? (
                 <>
                   <EditRow label="Site Length" value={currentData.siteLength} onChange={(v) => handleChange('siteLength', v)} type="number" />
                   <EditRow label="Site Breadth" value={currentData.siteBreadth} onChange={(v) => handleChange('siteBreadth', v)} type="number" />
                   <EditRow label="Site Capital Value" value={currentData.siteCapitalValue} onChange={(v) => handleChange('siteCapitalValue', v)} type="number" />
                   <EditSelect label="Building Type" value={currentData.buildingTypeDescription} onChange={(v) => handleChange('buildingTypeDescription', v)} options={BUILDING_TYPE_OPTIONS} />
                   <EditRow label="Building Value" value={currentData.buildingCapitalValue} onChange={(v) => handleChange('buildingCapitalValue', v)} type="number" />
                 </>
             ) : (
                <>
                    <DetailRow label="Site Dimensions (LxB)" value={`${currentData.siteLength} x ${currentData.siteBreadth}`} />
                    <DetailRow label="Site Capital Value" value={`₹${currentData.siteCapitalValue.toLocaleString()}`} />
                    <DetailRow label="Site Rate" value={`₹${currentData.siteRatePerSqYard}/Sq Yd`} />
                    <div className="my-2 border-t border-white/20"></div>
                    <DetailRow label="Building Type" value={currentData.buildingTypeDescription} />
                    <DetailRow label="Building Value" value={`₹${currentData.buildingCapitalValue.toLocaleString()}`} />
                    <DetailRow label="Building Rate" value={`₹${currentData.buildingRatePerSqFeet}/Sq Ft`} isLast />
                </>
             )}
        </CollapsibleSection>

        {/* 5) Floor Details */}
        <CollapsibleSection
            title="Floor Details"
            icon={<Layers className="w-4 h-4" />}
            isEditing={isEditing('Floor Details')}
            canEdit={isSuperAdmin}
            onStartEdit={() => startEdit('Floor Details')}
            onSave={saveEdit}
            onCancel={cancelEdit}
        >
            {isEditing('Floor Details') ? (
                 <>
                   <EditSelect label="Floor Description" value={currentData.floorDescription} onChange={(v) => handleChange('floorDescription', v)} options={FLOOR_NO_OPTIONS} />
                   <EditSelect label="Classification" value={currentData.classificationDescription} onChange={(v) => handleChange('classificationDescription', v)} options={CONSTRUCTION_TYPE_OPTIONS} />
                   <EditSelect label="Category" value={currentData.buildingCategoryDescription} onChange={(v) => handleChange('buildingCategoryDescription', v)} options={BUILDING_CATEGORY_OPTIONS} />
                   <EditSelect label="Occupancy" value={currentData.occupancyDescription} onChange={(v) => handleChange('occupancyDescription', v)} options={OCCUPANCY_OPTIONS} />
                   <EditRow label="Construction Date" value={currentData.constructionDate} onChange={(v) => handleChange('constructionDate', v)} />
                   <EditRow label="Total Floor Area (Sqft)" value={currentData.totalFloorArea} onChange={(v) => handleChange('totalFloorArea', v)} type="number" />
                   <EditSelect label="Subtype" value={currentData.subtypeConstructionDescription} onChange={(v) => handleChange('subtypeConstructionDescription', v)} options={SUBTYPE_CONSTRUCTION_OPTIONS} />
                 </>
            ) : (
                <>
                    <DetailRow label="Floor Description" value={currentData.floorDescription} />
                    <DetailRow label="Classification" value={currentData.classificationDescription} />
                    <DetailRow label="Category" value={currentData.buildingCategoryDescription} />
                    <DetailRow label="Occupancy" value={currentData.occupancyDescription} />
                    <DetailRow label="Construction Date" value={currentData.constructionDate} />
                    <DetailRow label="Effective From" value={currentData.effectiveFromDate} />
                    <DetailRow label="Dimensions (LxB)" value={`${currentData.floorLength} x ${currentData.floorBreadth}`} />
                    <DetailRow label="Total Floor Area" value={`${currentData.totalFloorArea} Sqft`} highlight />
                    <DetailRow label="Subtype" value={currentData.subtypeConstructionDescription} isLast />
                </>
             )}
        </CollapsibleSection>

        {/* 6) Demand Details */}
        <CollapsibleSection
          title="Demand Details"
          icon={<FileText className="w-4 h-4" />}
          defaultOpen={false}
          noPadding={true}
          isEditing={isEditing('Demand Details')}
          canEdit={isSuperAdmin}
          onStartEdit={() => startEdit('Demand Details')}
          onSave={saveEdit}
          onCancel={cancelEdit}
        >
           <div className="overflow-x-auto">
             <table className="w-full text-xs text-left">
               <thead className="text-slate-600 bg-white/20 uppercase border-b border-white/20">
                 <tr>
                   <th className="px-4 py-2 font-bold min-w-[60px]">Year</th>
                   <th className="px-2 py-2 font-bold text-right min-w-[60px]">Prop</th>
                   <th className="px-2 py-2 font-bold text-right min-w-[60px]">Drain</th>
                   <th className="px-2 py-2 font-bold text-right min-w-[60px]">Water</th>
                   <th className="px-4 py-2 font-bold text-right min-w-[70px]">Total</th>
                 </tr>
               </thead>
               <tbody>
                 {currentData.demandDetails.map((d, idx) => (
                   <tr 
                      key={idx} 
                      onClick={() => handleDemandRowClick(idx)}
                      className={`border-b border-white/20 last:border-0 hover:bg-white/10 ${isEditing('Demand Details') ? 'cursor-pointer hover:bg-brand-50/30' : ''}`}
                   >
                     <td className="px-4 py-2 font-medium text-slate-800 whitespace-nowrap">
                        {d.demandYear}
                        {isEditing('Demand Details') && <Pencil className="w-3 h-3 inline ml-1 text-brand-600 opacity-50" />}
                     </td>
                     <td className="px-2 py-2 text-right text-slate-700">₹{d.propertyTax}</td>
                     <td className="px-2 py-2 text-right text-slate-700">₹{d.drainageTax}</td>
                     <td className="px-2 py-2 text-right text-slate-700">₹{d.waterTax}</td>
                     <td className="px-4 py-2 font-bold text-slate-900 text-right bg-white/20">₹{d.totalDemand}</td>
                   </tr>
                 ))}
                 <tr className="bg-white/20 font-bold border-t border-white/30">
                    <td className="px-4 py-2 text-slate-800">Total</td>
                    <td colSpan={3}></td>
                    <td className="px-4 py-2 text-right text-brand-800">₹{currentData.totalDemand}</td>
                 </tr>
               </tbody>
             </table>
           </div>
           {isEditing('Demand Details') && (
             <p className="text-xs text-brand-700 font-bold p-3 text-center bg-brand-50/50">
                Tap a row to calculate & edit taxes
             </p>
           )}
        </CollapsibleSection>

        {/* 7) Tap Details */}
        {(currentData.tapDemands && currentData.tapDemands.length > 0) || isEditing('Tap Details') ? (
            <CollapsibleSection
              title="Tap Details"
              icon={<Droplets className="w-4 h-4" />}
              isEditing={isEditing('Tap Details')}
              canEdit={isSuperAdmin}
              onStartEdit={() => startEdit('Tap Details')}
              onSave={saveEdit}
              onCancel={cancelEdit}
            >
                {currentData.tapDemands.map((tap, i) => (
                    <div key={i} className={i > 0 ? "mt-4 pt-4 border-t border-white/20" : ""}>
                         <DetailRow label="Demand Year" value={tap.demandYear} />
                         <DetailRow label="Tap Fee Demand" value={`₹${tap.tapFeeDemand}`} />
                         <DetailRow label="Remarks" value={tap.remarks} isLast />
                    </div>
                ))}
                {currentData.tapDemands.length === 0 && (
                     <p className="text-sm text-slate-500 italic">No tap demands.</p>
                )}
            </CollapsibleSection>
        ) : null}

        {/* 8) Property Lifecycle Timeline */}
        {(currentData.history && currentData.history.length > 0) || isEditing('Property Lifecycle Timeline') ? (
          <CollapsibleSection
            title="Property Lifecycle Timeline"
            icon={<History className="w-4 h-4" />}
          >
             <div className="relative pl-2 space-y-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/40 pt-2">
                {currentData.history.map((event, idx) => (
                  <div key={idx} className="relative pl-6">
                    <div className="absolute left-0 top-1 w-6 h-6 bg-white rounded-full border-2 border-white shadow-sm flex items-center justify-center z-10">
                       {getEventIcon(event.eventType)}
                    </div>
                    <div className="bg-white/40 p-3 rounded-xl border border-white/30 shadow-sm">
                       <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold bg-white/50 px-2 py-0.5 rounded text-slate-800 border border-white/40">{event.eventType}</span>
                          <span className="text-xs text-slate-600 font-mono">{event.date}</span>
                       </div>
                       <p className="text-sm font-bold text-slate-900 mb-1">{event.description}</p>
                       {(event.fromOwner || event.toOwner) && (
                         <div className="text-xs bg-white/30 p-2 rounded-lg mt-2 border border-white/20">
                            {event.fromOwner && <div className="text-slate-600">From: <span className="font-semibold text-slate-800">{event.fromOwner}</span></div>}
                            {event.toOwner && <div className="text-slate-600">To: <span className="font-semibold text-slate-800">{event.toOwner}</span></div>}
                         </div>
                       )}
                    </div>
                  </div>
                ))}
             </div>
             {isEditing('Property Lifecycle Timeline') && (
                 <p className="text-xs text-slate-500 italic mt-4 text-center">Timeline editing is limited in this view.</p>
             )}
          </CollapsibleSection>
        ) : null}

        {/* 9) Payment History (Moved Below Timeline) */}
        <CollapsibleSection
             title="Payment History"
             icon={<IndianRupee className="w-4 h-4" />}
             noPadding={true}
        >
            {groupedPayments.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-600 bg-white/20 uppercase border-b border-white/20">
                            <tr>
                                <th className="px-4 py-3 font-bold">Date/Receipt</th>
                                <th className="px-4 py-3 font-bold">Guardian</th>
                                <th className="px-4 py-3 font-bold text-right">Amount</th>
                                <th className="px-4 py-3 font-bold text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groupedPayments.map((pay, idx) => (
                                <tr key={idx} className="border-b border-white/20 last:border-0 hover:bg-white/10">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="font-bold text-slate-800">{pay.dateOfPayment}</div>
                                        <button 
                                            onClick={() => openReceipt(pay.receiptNo)}
                                            className="text-[10px] text-brand-600 font-mono font-bold hover:underline block"
                                        >
                                            {pay.receiptNo}
                                        </button>
                                        <div className="text-[10px] text-slate-500">{pay.paymentMode}</div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-700 font-medium align-top">
                                        {pay.guardianName || '-'}
                                    </td>
                                    <td className="px-4 py-3 font-bold text-green-700 text-right align-top">
                                        ₹{pay.totalAmount}
                                        <div className="text-[9px] text-slate-400 font-normal uppercase">{pay.status}</div>
                                    </td>
                                    <td className="px-4 py-3 text-center align-top">
                                        <button 
                                            onClick={() => openReceipt(pay.receiptNo)}
                                            className="p-2 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg transition-colors border border-brand-200 shadow-sm"
                                            title="Print Receipt"
                                        >
                                            <Printer className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="p-5 text-center text-slate-600 text-sm italic">
                    No payment history available.
                </div>
            )}
        </CollapsibleSection>

        {/* 10) Modification Logs (Admin & Super Admin) */}
        {isAdminView && currentData.auditLogs && currentData.auditLogs.length > 0 && (
          <CollapsibleSection
            title="Modification Audit Logs"
            icon={<ShieldAlert className="w-4 h-4 text-red-600" />}
            noPadding={true}
          >
             <div className="overflow-x-auto max-h-60">
                 <table className="w-full text-xs text-left">
                     <thead className="bg-white/20 text-slate-600 uppercase border-b border-white/20 sticky top-0 backdrop-blur-md">
                         <tr>
                             <th className="px-4 py-2">Date/User</th>
                             <th className="px-4 py-2">Section</th>
                             <th className="px-4 py-2">Changes</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-white/20">
                         {currentData.auditLogs.map((log, idx) => (
                             <tr key={idx} className="hover:bg-white/10">
                                 <td className="px-4 py-2 align-top">
                                     <div className="font-bold text-slate-800">{new Date(log.timestamp).toLocaleDateString()}</div>
                                     <div className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</div>
                                     <div className="text-brand-700 font-semibold mt-1">{log.userName}</div>
                                 </td>
                                 <td className="px-4 py-2 align-top text-slate-700 font-medium">
                                     {log.section}
                                 </td>
                                 <td className="px-4 py-2 align-top">
                                     <ul className="space-y-1">
                                         {log.changes.map((c, cIdx) => (
                                             <li key={cIdx} className="text-slate-600 break-words bg-white/30 rounded px-1.5 py-0.5 inline-block mr-1 mb-1 border border-white/20">
                                                 {c}
                                             </li>
                                         ))}
                                     </ul>
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
          </CollapsibleSection>
        )}

      </div>
    </div>
  );
};
