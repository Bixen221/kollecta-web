'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { PAYS } from '@/data/pays';

export default function SelecteurPays({ paysSelectionne, onChange }) {
  const [ouvert, setOuvert] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOuvert(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOuvert(!ouvert)}
        className="flex items-center gap-2 px-3 py-3 rounded-lg border h-full"
        style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--bd)', color: 'var(--txt)' }}
      >
        <span className="text-lg">{paysSelectionne.drapeau}</span>
        <span className="text-sm font-semibold">{paysSelectionne.indicatif}</span>
        <ChevronDown size={14} style={{ color: 'var(--txt2)' }} />
      </button>

      {ouvert && (
        <div
          className="absolute z-20 top-full mt-1 left-0 w-64 max-h-72 overflow-y-auto rounded-lg border shadow-lg"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}
        >
          {PAYS.map((p) => (
            <button
              key={p.code}
              type="button"
              onClick={() => { onChange(p); setOuvert(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:opacity-70 transition"
              style={{ color: 'var(--txt)' }}
            >
              <span className="text-lg">{p.drapeau}</span>
              <span className="text-sm flex-1">{p.nom}</span>
              <span className="text-xs font-semibold" style={{ color: 'var(--txt2)' }}>{p.indicatif}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
