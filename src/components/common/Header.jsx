import React from 'react';
import logoImg from '../../assets/alboriss-logo.png';
import { ShieldCheck, Wifi, WifiOff } from 'lucide-react';

export default function Header({ batchName, isOnline = true }) {
  return (
    <header className="w-full bg-slate-900 border-b border-slate-800 px-4 py-2.5 sticky top-0 z-40 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo & Platform Info */}
        <div className="flex items-center gap-3">
          <img
            src={logoImg}
            alt="Alboriss Logo"
            className="h-10 w-auto object-contain bg-white rounded-lg p-1 shadow-xs"
            onError={(e) => {
              // Fallback to text if PNG fails
              e.currentTarget.style.display = 'none';
            }}
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-base tracking-wide leading-tight">
                ALBORISS
              </span>
              <span className="text-[10px] font-semibold bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded uppercase tracking-wider">
                Official
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-none mt-0.5">
              Non-IT Hiring Drive
            </p>
          </div>
        </div>

        {/* Batch & Online Status */}
        <div className="flex items-center gap-2">
          {batchName && (
            <div className="text-right">
              <span className="inline-block text-[11px] font-bold bg-slate-800 text-sky-400 border border-slate-700 px-2.5 py-1 rounded-full">
                {batchName}
              </span>
            </div>
          )}
          
          <div className="flex items-center text-xs" title={isOnline ? "Network Connection Active" : "Network Interrupted"}>
            {isOnline ? (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Online
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] text-amber-300 bg-amber-950/60 border border-amber-700/50 px-2 py-0.5 rounded-full">
                <WifiOff className="w-3 h-3 text-amber-300 animate-bounce" />
                Reconnecting
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
