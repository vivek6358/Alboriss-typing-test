import React, { useRef, useEffect, useMemo } from 'react';

/**
 * Renders the reference passage with Monkeytype-style word grouping.
 * Words NEVER break across lines (fixes 'fo-cus' and 'inclu-ding' issues).
 * Smooth character-by-character highlighting with active caret cursor.
 */
export default function PassageDisplay({ passage = '', typedText = '', isActual = false }) {
  const currentRef = useRef(null);
  const containerRef = useRef(null);

  // Tokenize passage into words with their absolute indices
  const words = useMemo(() => {
    const tokens = [];
    let currentChars = [];
    let startIndex = 0;

    for (let i = 0; i < passage.length; i++) {
      const char = passage[i];
      currentChars.push({ char, globalIndex: i });

      if (char === ' ' || i === passage.length - 1) {
        tokens.push({
          chars: currentChars,
          startIndex
        });
        startIndex = i + 1;
        currentChars = [];
      }
    }
    return tokens;
  }, [passage]);

  // Smooth scroll passage to keep active word in view without jumping
  useEffect(() => {
    if (currentRef.current && containerRef.current) {
      const container = containerRef.current;
      const el = currentRef.current;
      
      const containerTop = container.scrollTop;
      const containerBottom = containerTop + container.clientHeight;
      const elTop = el.offsetTop;
      const elBottom = elTop + el.clientHeight;

      if (elBottom > containerBottom - 25) {
        container.scrollTo({ top: elTop - 35, behavior: 'smooth' });
      } else if (elTop < containerTop + 20) {
        container.scrollTo({ top: Math.max(0, elTop - 35), behavior: 'smooth' });
      }
    }
  }, [typedText]);

  const typedLength = typedText.length;

  return (
    <div
      ref={containerRef}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
      className={`no-select relative bg-white border-2 rounded-2xl p-5 sm:p-7 shadow-sm max-h-52 sm:max-h-64 lg:max-h-72 overflow-y-auto font-mono text-base sm:text-lg lg:text-xl leading-loose tracking-wide select-none transition-all ${
        isActual ? 'border-sky-400 ring-2 ring-sky-100 bg-sky-50/10' : 'border-slate-200'
      }`}
      style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
    >
      <div className="flex flex-wrap items-baseline content-start gap-y-1">
        {words.map((wordObj, wIdx) => {
          return (
            <span
              key={wIdx}
              className="inline-block whitespace-nowrap"
            >
              {wordObj.chars.map(({ char, globalIndex }) => {
                const isTyped = globalIndex < typedLength;
                const isCurrent = globalIndex === typedLength;
                const isCorrect = isTyped && typedText[globalIndex] === char;
                const isIncorrect = isTyped && typedText[globalIndex] !== char;

                return (
                  <span
                    key={globalIndex}
                    ref={isCurrent ? currentRef : null}
                    className={`relative inline-block transition-colors duration-75 ${
                      isCorrect
                        ? 'text-slate-900 font-bold bg-sky-100/70 rounded-xs'
                        : isIncorrect
                        ? 'text-rose-600 font-bold bg-rose-100 underline decoration-rose-500 decoration-2 rounded-xs'
                        : 'text-slate-400 font-medium'
                    }`}
                  >
                    {/* Smooth active caret cursor like monkeytype */}
                    {isCurrent && (
                      <span className="absolute -left-0.5 top-1 bottom-1 w-0.5 bg-sky-600 animate-pulse rounded-full z-10"></span>
                    )}

                    {/* Space handling */}
                    {char === ' ' ? (
                      <span className={`${isIncorrect ? 'text-rose-500 font-bold' : ''}`}>
                        &nbsp;
                      </span>
                    ) : (
                      char
                    )}
                  </span>
                );
              })}
            </span>
          );
        })}
      </div>
    </div>
  );
}
