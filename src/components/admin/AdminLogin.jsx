import React, { useState } from 'react';
import logoImg from '../../assets/alboriss-logo.png';
import { Lock, KeyRound, AlertCircle, ShieldCheck } from 'lucide-react';

export default function AdminLogin({ onLoginSuccess }) {
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const expectedPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'anon123@';

    if (!password) {
      setErrorMsg('Please enter the recruiter passcode.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      if (password === expectedPassword) {
        sessionStorage.setItem('alboriss_admin_auth', 'true');
        onLoginSuccess();
      } else {
        setErrorMsg('Invalid passcode. Please check with the lead recruiter.');
      }
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-700">
        {/* Header */}
        <div className="bg-slate-950 p-6 text-center border-b border-slate-800">
          <div className="flex justify-center mb-3">
            <img
              src={logoImg}
              alt="Alboriss"
              className="h-16 w-auto object-contain bg-white rounded-xl p-1 shadow-md mx-auto"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
          <h1 className="text-xl font-black text-white uppercase tracking-wide">
            ALBORISS ADMIN PORTAL
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Typing Assessment Management System
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2 p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-900 font-medium">
            <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
            <span>Authorized recruiter and invigilator access only.</span>
          </div>

          <div>
            <label htmlFor="adminPassword" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Recruiter Passcode
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <input
                id="adminPassword"
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Enter admin passcode"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-base focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 min-h-[48px]"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[48px] py-3 px-5 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm uppercase tracking-wider"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>SIGN IN TO DASHBOARD</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
