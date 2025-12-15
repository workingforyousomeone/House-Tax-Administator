
import React, { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { ArrowRight, User, Lock, KeyRound, X, Check, Smartphone } from 'lucide-react';
import { authenticateUser, getUser, updateUserPassword } from '../services/data';
import { User as UserType } from '../types';
import { RESOURCES } from '../resources';

export const Login: React.FC = () => {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Forgot Password State Machine
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<'input' | 'otp' | 'reset' | 'success'>('input');
  const [forgotUserId, setForgotUserId] = useState('');
  const [tempUser, setTempUser] = useState<UserType | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [resetError, setResetError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = authenticateUser(username, password);
    
    if (user) {
      login(user);
    } else {
      setError('Invalid username or password');
    }
  };

  // Step 1: Verify User ID
  const handleIdSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setResetError('');
      
      const user = getUser(forgotUserId);
      if (user) {
          setTempUser(user);
          setForgotStep('otp');
          // SIMULATE SENDING OTP
          setTimeout(() => {
             alert(`DEMO: The OTP for ${user.name} is 1234`);
          }, 500);
      } else {
          setResetError('User ID not found');
      }
  };

  // Step 2: Verify OTP
  const handleOtpSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setResetError('');
      if (otpInput === '1234') {
          setForgotStep('reset');
      } else {
          setResetError('Invalid OTP');
      }
  };

  // Step 3: Set New Password
  const handleResetSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setResetError('');
      if (newPass.length < 4) {
          setResetError('Password too short (min 4 chars)');
          return;
      }
      if (newPass !== confirmPass) {
          setResetError('Passwords do not match');
          return;
      }
      if (tempUser) {
          updateUserPassword(tempUser.id, newPass);
          setForgotStep('success');
      }
  };

  const closeForgotModal = () => {
      setShowForgotModal(false);
      setForgotUserId('');
      setForgotStep('input');
      setOtpInput('');
      setNewPass('');
      setConfirmPass('');
      setResetError('');
      setTempUser(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-10 relative overflow-hidden">
      
      {/* Forgot Password Modal */}
      {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-2xl w-full max-w-xs p-6 shadow-2xl relative">
                  <button onClick={closeForgotModal} className="absolute top-4 right-4 p-1 hover:bg-slate-100 rounded-full transition-colors">
                      <X className="w-5 h-5 text-slate-400" />
                  </button>

                  {forgotStep === 'input' && (
                      <div className="space-y-4">
                          <div className="flex items-center gap-3 mb-2">
                              <div className="bg-brand-100 p-2 rounded-lg text-brand-600">
                                  <KeyRound className="w-6 h-6" />
                              </div>
                              <h3 className="text-lg font-bold text-slate-800">Reset Password</h3>
                          </div>
                          <p className="text-xs text-slate-500 mb-4">
                              Enter your User ID to receive a verification code on your registered mobile.
                          </p>
                          <form onSubmit={handleIdSubmit}>
                              <div className="space-y-4">
                                  <div>
                                      <label className="text-xs font-bold text-slate-600 uppercase mb-1 block">User ID</label>
                                      <input 
                                          type="text" 
                                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all"
                                          value={forgotUserId}
                                          onChange={(e) => setForgotUserId(e.target.value)}
                                          placeholder="Enter your ID"
                                          autoFocus
                                      />
                                  </div>
                                  {resetError && <p className="text-xs text-red-600 font-bold">{resetError}</p>}
                                  <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl shadow-md transition-all active:scale-95">
                                      Send OTP
                                  </button>
                              </div>
                          </form>
                      </div>
                  )}

                  {forgotStep === 'otp' && (
                       <div className="space-y-4 animate-in slide-in-from-right-8">
                           <div className="flex items-center gap-3 mb-2">
                               <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                                   <Smartphone className="w-6 h-6" />
                               </div>
                               <h3 className="text-lg font-bold text-slate-800">Verify OTP</h3>
                           </div>
                           <p className="text-xs text-slate-500 mb-4">
                               Enter the 4-digit code sent to mobile ending in **{tempUser?.phone.slice(-4) || '****'}.
                           </p>
                           <form onSubmit={handleOtpSubmit}>
                               <div className="space-y-4">
                                   <div>
                                       <label className="text-xs font-bold text-slate-600 uppercase mb-1 block">One Time Password</label>
                                       <input 
                                           type="text" 
                                           className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all tracking-widest text-center text-lg font-bold"
                                           value={otpInput}
                                           onChange={(e) => setOtpInput(e.target.value)}
                                           placeholder="----"
                                           maxLength={4}
                                           autoFocus
                                       />
                                   </div>
                                   {resetError && <p className="text-xs text-red-600 font-bold">{resetError}</p>}
                                   <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-md transition-all active:scale-95">
                                       Verify Code
                                   </button>
                               </div>
                           </form>
                       </div>
                  )}

                  {forgotStep === 'reset' && (
                       <div className="space-y-4 animate-in slide-in-from-right-8">
                           <div className="flex items-center gap-3 mb-2">
                               <div className="bg-green-100 p-2 rounded-lg text-green-600">
                                   {/* Changed LockKeyhole to Lock to fix build error */}
                                   <Lock className="w-6 h-6" />
                               </div>
                               <h3 className="text-lg font-bold text-slate-800">New Password</h3>
                           </div>
                           <p className="text-xs text-slate-500 mb-4">
                               Create a new password for <strong>{tempUser?.name}</strong>.
                           </p>
                           <form onSubmit={handleResetSubmit}>
                               <div className="space-y-4">
                                   <div>
                                       <input 
                                           type="password" 
                                           className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all mb-2"
                                           value={newPass}
                                           onChange={(e) => setNewPass(e.target.value)}
                                           placeholder="New Password"
                                           autoFocus
                                       />
                                       <input 
                                           type="password" 
                                           className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all"
                                           value={confirmPass}
                                           onChange={(e) => setConfirmPass(e.target.value)}
                                           placeholder="Confirm Password"
                                       />
                                   </div>
                                   {resetError && <p className="text-xs text-red-600 font-bold">{resetError}</p>}
                                   <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-md transition-all active:scale-95">
                                       Set Password
                                   </button>
                               </div>
                           </form>
                       </div>
                  )}

                  {forgotStep === 'success' && (
                      <div className="text-center py-4 animate-in zoom-in-95">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                              <Check className="w-6 h-6 text-green-600" />
                          </div>
                          <h3 className="text-lg font-bold text-slate-800 mb-2">Password Reset!</h3>
                          <p className="text-xs text-slate-500 mb-6">
                              Your password has been successfully updated. You can now login with your new credentials.
                          </p>
                          <button onClick={closeForgotModal} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors">
                              Back to Login
                          </button>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-purple-500/30 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-blue-500/30 rounded-full blur-3xl" />

      {/* Main Card */}
      <div className="w-full max-w-sm bg-white/20 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl p-8 flex flex-col items-center animate-in fade-in zoom-in duration-500">
        
        {/* Logo Section - Centered at top */}
        <div className="mb-6 flex flex-col items-center">
            {/* Logos Container */}
            <div className="flex items-center justify-center gap-6 mb-5">
                <div className="bg-white p-3 rounded-2x1 shadow-lg shadow-black/10">
                    <img 
                        src={RESOURCES.AP_GOVT_LOGO}
                        alt="AP Govt Logo" 
                        className="w-14 h-14 object-contain"
                    />
                </div>
                <div className="bg-white p-3 rounded-2xl shadow-lg shadow-black/10">
                    <img 
                        src={RESOURCES.PR_DEPT_LOGO}
                        onError={(e) => {
                            e.currentTarget.src = RESOURCES.INDIA_EMBLEM;
                        }}
                        alt="Panchayat Raj Logo" 
                        className="w-14 h-14 object-contain"
                    />
                </div>
            </div>

            <h1 className="text-3xl font-bold text-white tracking-tight text-center drop-shadow-md leading-none">House Tax</h1>
            <h2 className="text-xl font-medium text-white/90 tracking-tight text-center drop-shadow-sm mt-1">Admin Portal</h2>
            <p className="text-brand-50 text-[10px] font-bold tracking-[0.4em] uppercase opacity-80 text-center mt-3 border-t border-white/20 pt-3 w-full">
                Panchayat Raj Dept
            </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white/80 uppercase tracking-wider ml-1">Username</label>
            <div className="relative group">
              <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center">
                 <User className="w-5 h-5 text-white/70 group-focus-within:text-white transition-colors" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter ID"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-white/20 bg-black/10 text-white placeholder-white/50 focus:bg-black/20 focus:border-white/50 focus:ring-0 outline-none transition-all font-medium"
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white/80 uppercase tracking-wider ml-1">Password</label>
            <div className="relative group">
               <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center">
                 <Lock className="w-5 h-5 text-white/70 group-focus-within:text-white transition-colors" />
               </div>
               <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-white/20 bg-black/10 text-white placeholder-white/50 focus:bg-black/20 focus:border-white/50 focus:ring-0 outline-none transition-all font-medium"
              />
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end">
              <button 
                type="button" 
                onClick={() => setShowForgotModal(true)}
                className="text-[10px] font-bold text-white/80 hover:text-white underline decoration-white/30 hover:decoration-white transition-all"
              >
                  Forgot Password?
              </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-50 text-xs font-bold bg-red-500/50 px-4 py-3 rounded-xl border border-red-200/20 backdrop-blur-md animate-in slide-in-from-top-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-200" />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-white hover:bg-brand-50 text-brand-700 font-bold py-4 rounded-xl shadow-lg shadow-black/10 hover:shadow-xl transition-all active:scale-[0.98] mt-2 flex items-center justify-center gap-2 group"
          >
            Sign In
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </form>
      </div>
      
      <p className="absolute bottom-4 text-white/40 text-[10px] font-medium">© 2025 Govt of Andhra Pradesh</p>
    </div>
  );
};
