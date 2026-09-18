import React, { useState, useEffect } from 'react';

export default function CountdownOverlay({ title = "Get Ready...", onComplete }) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => {
        setCount(prev => prev - 1);
      }, 950);
      return () => clearTimeout(timer);
    } else {
      const finalTimer = setTimeout(() => {
        onComplete();
      }, 600);
      return () => clearTimeout(finalTimer);
    }
  }, [count, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div className="text-center p-6 max-w-sm w-full animate-in zoom-in-90 duration-200">
        <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-sky-400 block mb-4">
          {title}
        </span>

        <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-sky-600/20 border-4 border-sky-500 flex items-center justify-center mx-auto shadow-2xl shadow-sky-500/30">
          <span
            key={count}
            className="text-6xl sm:text-7xl font-mono font-black text-white animate-in zoom-in-75 duration-200"
          >
            {count > 0 ? count : 'GO!'}
          </span>
        </div>

        <p className="text-slate-300 text-sm mt-5 font-semibold">
          {count > 0 ? 'Place hands on the keyboard...' : 'Start typing now!'}
        </p>
      </div>
    </div>
  );
}
