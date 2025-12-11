
import React, { useState } from 'react';
import { Household, PaymentRecord } from '../types';
import { Check, X, CreditCard, Banknote, IndianRupee, Printer } from 'lucide-react';
import { addPayment } from '../services/data';

interface PaymentModalProps {
  household: Household;
  onClose: () => void;
  onPaymentSuccess: (receipt: PaymentRecord) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ household, onClose, onPaymentSuccess }) => {
  const pendingAmount = Math.max(0, household.totalDemand - household.totalCollected);
  const isFullyPaid = pendingAmount === 0;

  const [amount, setAmount] = useState<string>(pendingAmount.toString());
  const [mode, setMode] = useState<string>('Cash');
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState<PaymentRecord | null>(null);

  const handlePayment = () => {
    setProcessing(true);
    // Simulate API delay
    setTimeout(() => {
      const payAmount = Number(amount);
      if (payAmount <= 0) {
        alert("Amount must be greater than 0");
        setProcessing(false);
        return;
      }
      const newReceipt = addPayment(household.id, payAmount, mode);
      if (newReceipt) {
        setReceipt(newReceipt);
        onPaymentSuccess(newReceipt);
      }
      setProcessing(false);
    }, 1000);
  };

  if (receipt) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Payment Successful!</h2>
            <p className="text-slate-500 text-sm mb-6">Transaction ID: {receipt.receiptNo}</p>
            
            <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">Amount Paid</span>
                    <span className="font-bold text-slate-900">₹{receipt.amount}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">Date</span>
                    <span className="font-bold text-slate-900">{receipt.dateOfPayment}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Mode</span>
                    <span className="font-bold text-slate-900">{receipt.paymentMode}</span>
                </div>
            </div>

            <div className="flex gap-3">
                 <button onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200">
                    Close
                 </button>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
            <div>
                <h3 className="font-bold text-slate-900 text-lg">Make Payment</h3>
                <p className="text-xs text-slate-500">#{household.assessmentNumber}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
            </button>
        </div>

        <div className="p-5 overflow-y-auto">
            {/* Owner Info */}
            <div className="mb-6">
                <p className="text-sm font-bold text-slate-800">{household.ownerName}</p>
                <p className="text-xs text-slate-500 truncate">{household.address}</p>
            </div>

            {/* Financial Year Wise Breakdown */}
            <div className="mb-6">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Demand Breakdown</h4>
                <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-100 text-slate-600">
                            <tr>
                                <th className="px-3 py-2 text-left font-semibold text-xs">Year</th>
                                <th className="px-3 py-2 text-right font-semibold text-xs">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {household.demandDetails.map((d, i) => (
                                <tr key={i}>
                                    <td className="px-3 py-2 text-slate-700">{d.demandYear}</td>
                                    <td className="px-3 py-2 text-right font-medium text-slate-900">₹{d.totalDemand}</td>
                                </tr>
                            ))}
                             <tr className="bg-slate-100/50 font-bold">
                                <td className="px-3 py-2 text-slate-800">Total Demand</td>
                                <td className="px-3 py-2 text-right text-slate-900">₹{household.totalDemand}</td>
                            </tr>
                            <tr className="text-green-700 font-bold">
                                <td className="px-3 py-2">Total Collected</td>
                                <td className="px-3 py-2 text-right">- ₹{household.totalCollected}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Total Due */}
            <div className={`flex justify-between items-center mb-6 p-4 rounded-2xl border ${isFullyPaid ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'}`}>
                <span className={`${isFullyPaid ? 'text-green-800' : 'text-orange-800'} font-bold text-sm uppercase`}>
                    {isFullyPaid ? 'Fully Paid' : 'Total Pending'}
                </span>
                <span className={`text-2xl font-bold ${isFullyPaid ? 'text-green-700' : 'text-orange-700'}`}>₹{pendingAmount}</span>
            </div>

            {/* Payment Input */}
            <div className={`space-y-4 ${isFullyPaid ? 'opacity-50 pointer-events-none' : ''}`}>
                <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Amount to Pay</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                        <input 
                            type="number" 
                            value={amount}
                            disabled={isFullyPaid}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full pl-8 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-lg font-bold text-slate-900 focus:border-brand-500 focus:outline-none transition-colors disabled:bg-slate-100"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Payment Mode</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['Cash', 'UPI', 'Cheque'].map((m) => (
                            <button
                                key={m}
                                disabled={isFullyPaid}
                                onClick={() => setMode(m)}
                                className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1 ${mode === m ? 'bg-brand-600 text-white border-brand-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                            >
                                {m === 'Cash' && <Banknote className="w-4 h-4" />}
                                {m === 'UPI' && <IndianRupee className="w-4 h-4" />}
                                {m === 'Cheque' && <CreditCard className="w-4 h-4" />}
                                {m}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 bg-white">
            <button 
                onClick={handlePayment}
                disabled={processing || Number(amount) <= 0 || isFullyPaid}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
                {processing ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        Confirm Payment
                        <IndianRupee className="w-4 h-4" />
                    </>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};
