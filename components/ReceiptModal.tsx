
import React, { useState } from 'react';
import { PaymentRecord, Household } from '../types';
import { X, Download, Printer, Loader2 } from 'lucide-react';
import { RESOURCES } from '../resources';

interface ReceiptModalProps {
  receiptNo: string;
  records: PaymentRecord[];
  household: Household;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receiptNo, records, household, onClose }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const totalAmount = records.reduce((sum, r) => sum + r.amount, 0);
    const date = records[0]?.dateOfPayment || '';
    // Ensure we use the correct base URL.
    const qrData = `https://swarnapanchayat.apcfss.in/HouseTaxPaymentTeluguView/House/${household.assessmentNumber}/${receiptNo}`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

    const handleDownload = async () => {
        const element = document.getElementById('printable-receipt');
        if (!element) return;
        
        setIsGenerating(true);

        // @ts-ignore
        if (typeof html2pdf === 'undefined') {
            window.print();
            setIsGenerating(false);
            return;
        }

        // 1. Clone the element
        const clone = element.cloneNode(true) as HTMLElement;
        
        // 2. Style Clone for PDF (A4/A5 optimized)
        clone.style.maxHeight = 'none';
        clone.style.overflow = 'visible';
        clone.style.height = 'auto';
        clone.style.width = '600px'; // Fixed width for consistent PDF layout
        clone.style.padding = '40px';
        clone.style.backgroundColor = 'white';
        clone.style.fontFamily = '"Anek Telugu", sans-serif';
        // CRITICAL: Letter spacing breaks Telugu ligatures (vottu). Must be normal.
        clone.style.letterSpacing = 'normal'; 
        clone.style.color = 'black';
        clone.style.border = 'none';
        clone.style.boxShadow = 'none';
        clone.style.borderRadius = '0';

        // 3. Create a Container to hold the clone
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.zIndex = '-9999';
        container.style.width = '600px'; 
        container.style.backgroundColor = 'white';
        
        container.appendChild(clone);
        document.body.appendChild(container);

        try {
            // 4. Wait for images to load
            const images = clone.querySelectorAll('img');
            const imagePromises = Array.from(images).map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise(resolve => {
                    img.onload = resolve;
                    img.onerror = resolve;
                });
            });
            await Promise.all(imagePromises);
            
            // Add a small delay to ensure fonts render (html2canvas issue with webfonts)
            await new Promise(resolve => setTimeout(resolve, 500));

            // 5. Generate PDF
            const opt = {
                margin:       10, // mm
                filename:     `Receipt-${receiptNo}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { 
                    scale: 2, 
                    useCORS: true, 
                    letterRendering: true, // Needed for English, might affect Telugu, but usually okay if letter-spacing is normal
                    scrollY: 0,
                },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            // @ts-ignore
            await window.html2pdf().set(opt).from(clone).save();

        } catch (err) {
            console.error("PDF Generation failed:", err);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            document.body.removeChild(container);
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-telugu">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-[350px] overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center bg-slate-50 no-print shrink-0">
                    <h3 className="font-bold text-slate-800">Receipt Preview</h3>
                    <div className="flex gap-2">
                        <button 
                            type="button" 
                            onClick={handleDownload} 
                            disabled={isGenerating}
                            className="p-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 flex items-center gap-1 text-xs font-bold shadow-sm transition-transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            {isGenerating ? 'Processing...' : 'Download PDF'}
                        </button>
                        <button onClick={onClose} className="p-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-transform active:scale-95">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                
                {/* Printable Content Area */}
                <div id="printable-receipt" className="p-4 text-black text-[10px] leading-tight overflow-y-auto bg-white flex-1">
                    <div className="mb-2">
                         {/* Header with Logos */}
                         <div className="flex justify-between items-start px-1 gap-2">
                             {/* AP Govt Logo (Left) */}
                             <img 
                                src={RESOURCES.AP_GOVT_LOGO}
                                alt="AP Govt" 
                                className="w-12 h-12 object-contain" 
                                crossOrigin="anonymous"
                             />
                             
                             {/* Center Details */}
                             <div className="text-center flex-1 pt-1">
                                 <div className="text-red-600 font-bold leading-none mb-0.5">
                                     <p className="text-[11px]">పంచాయతి రాజ్ శాఖ</p>
                                     <p className="text-[9px] text-black">Panchayat Raj Dept</p>
                                 </div>
                                 <h2 className="font-bold text-[14px] text-slate-900 leading-none mb-0.5">Pogiri గ్రామ పంచాయతీ</h2>
                                 <p className="text-[10px] text-slate-600 leading-none">Rajam మండలం ,Vizianagaram జిల్లా</p>
                             </div>

                             {/* Panchayat Raj Logo (Right) */}
                             <img 
                                src={RESOURCES.PR_DEPT_LOGO}
                                onError={(e) => {
                                    // Fallback to Emblem if PR logo fails
                                    e.currentTarget.src = RESOURCES.INDIA_EMBLEM;
                                }}
                                alt="PR Logo" 
                                className="w-12 h-12 object-contain" 
                                crossOrigin="anonymous"
                             />
                         </div>

                         {/* Receipt Title Section */}
                         <div className="text-center mt-1">
                             <div className="bg-slate-100 rounded px-3 py-0 border border-slate-200 inline-block mb-0.5">
                                <p className="text-[10px] font-bold text-slate-800 leading-tight">2025-26 ఆర్థిక సంవత్సరం</p>
                             </div>
                             <h1 className="text-[16px] font-bold underline decoration-dotted decoration-slate-400 underline-offset-4 leading-none">House Tax రసీదు</h1>
                        </div>
                    </div>
                    
                    <div className="border-t-2 border-dashed border-slate-300 my-2"></div>
                    
                    <div className="mb-4 relative min-h-[100px]">
                        <p className="font-bold text-[11px] text-brand-700 mb-2 uppercase tracking-wide">అసెస్మెంట్ యజమాని వివరాలు:</p>
                        
                        {/* Grid Layout for Details */}
                        <div className="grid grid-cols-[100px_1fr] gap-y-1.5 text-[11px] pr-24">
                            <span className="text-slate-500">అసెస్మెంట్ నెం:</span>
                            <strong className="text-slate-900">{household.assessmentNumber}</strong>
                            
                            <span className="text-slate-500">పాత అసెస్మెంట్:</span>
                            <strong className="text-slate-900">{household.oldAssessmentNumber}</strong>
                            
                            <span className="text-slate-500">యజమాని పేరు:</span>
                            <strong className="text-slate-900">{household.ownerName}</strong>
                            
                            <span className="text-slate-500">తండ్రి/భర్త:</span>
                            <strong className="text-slate-900">{household.guardianName}</strong>
                            
                            <span className="text-slate-500">ఇంటి సంఖ్య:</span>
                            <strong className="text-slate-900">{household.doorNumber}</strong>
                            
                            <span className="text-slate-500">మొబైల్ నంబర్:</span>
                            <strong className="text-slate-900">{household.mobileNumber}</strong>
                        </div>

                        <div className="absolute top-0 right-0 p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm">
                            <img src={qrImageUrl} alt="QR Code" className="w-20 h-20 object-contain" crossOrigin="anonymous" />
                        </div>
                    </div>

                    <div className="border-t-2 border-dashed border-slate-300 my-2"></div>

                    <div className="mb-4">
                        <p className="font-bold text-[11px] text-brand-700 mb-2 uppercase tracking-wide">రసీదు వివరాలు:</p>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-[11px]">
                            <div><p className="text-slate-500 text-[10px]">లావాదేవీ సంఖ్య</p><p className="font-bold text-slate-900 break-all">{receiptNo}</p></div>
                            <div className="text-right"><p className="text-slate-500 text-[10px]">లావాదేవీ తేదీ</p><p className="font-bold text-slate-900">{date}</p></div>
                            <div><p className="text-slate-500 text-[10px]">చెల్లింపు విధానం</p><p className="font-bold text-slate-900">{records[0]?.paymentMode}</p></div>
                            <div className="text-right"><p className="text-slate-500 text-[10px]">చెల్లింపు స్థితి</p><p className="font-bold text-green-700 uppercase bg-green-100 px-2 py-0.5 rounded inline-block border border-green-200">Success</p></div>
                        </div>
                    </div>

                    <table className="w-full border-collapse border border-slate-300 mb-4 text-[10px]">
                        <thead>
                            <tr className="bg-slate-100 text-slate-700">
                                <th className="border border-slate-300 p-2 w-10">S.No</th>
                                <th className="border border-slate-300 p-2">Year</th>
                                <th className="border border-slate-300 p-2">Category</th>
                                <th className="border border-slate-300 p-2 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((r, i) => (
                                <tr key={i}>
                                    <td className="border border-slate-300 p-2 text-center text-slate-600">{i+1}</td>
                                    <td className="border border-slate-300 p-2 text-center font-bold text-slate-800">{r.dueYear}</td>
                                    <td className="border border-slate-300 p-2 text-center text-slate-600">{r.demandCategory}</td>
                                    <td className="border border-slate-300 p-2 text-right font-bold text-slate-900">{r.amount}</td>
                                </tr>
                            ))}
                            <tr className="bg-slate-50">
                                <td className="border border-slate-300 p-2 text-center font-bold uppercase text-[9px]" colSpan={3}>Total Paid</td>
                                <td className="border border-slate-300 p-2 text-right font-bold text-green-700 text-[12px]">₹{totalAmount}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-6">
                        <p className="font-bold text-slate-700 mb-1 text-[10px] uppercase">Amount in Words:</p>
                        <p className="text-[11px] text-slate-800 italic font-medium">Rupees {totalAmount} Only/-</p>
                    </div>

                    <div className="text-center space-y-1">
                         <p className="text-[9px] text-slate-400">
                            *** This is a computer generated receipt, signature is not required ***
                        </p>
                        <p className="text-[9px] text-slate-300">
                            Generated by House Tax Admin Portal
                        </p>
                    </div>
                </div>
            </div>
            {/* Styles for print media fallback */}
            <style>{`@media print { body * { visibility: hidden; } #printable-receipt, #printable-receipt * { visibility: visible; } #printable-receipt { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px; background: white; } @page { size: auto; margin: 0mm; } .no-print { display: none !important; } }`}</style>
        </div>
    );
};
