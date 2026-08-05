'use client';

import { useState, useRef, useEffect } from 'react';
import { Share2, Check, MessageCircle, Link2, Globe } from 'lucide-react';

export default function BoutonPartager({ titre, texte }) {
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [copie, setCopie] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setMenuOuvert(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getUrl = () => (typeof window !== 'undefined' ? window.location.href : '');

  const partagerWhatsApp = () => {
    const message = encodeURIComponent(`${texte} — ${getUrl()}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
    setMenuOuvert(false);
  };

  const partagerFacebook = () => {
    const url = encodeURIComponent(getUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    setMenuOuvert(false);
  };

  const copierLien = async () => {
    try {
      await navigator.clipboard.writeText(getUrl());
      setCopie(true);
      setTimeout(() => { setCopie(false); setMenuOuvert(false); }, 1200);
    } catch (err) {
      alert('Impossible de copier le lien.');
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setMenuOuvert(!menuOuvert)}
        className="btn-action flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition"
      >
        <Share2 size={16} />
        Partager
      </button>

      {menuOuvert && (
        <div
          className="absolute right-0 top-full mt-2 w-52 rounded-xl border shadow-lg overflow-hidden z-20"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}
        >
          <button
            onClick={partagerWhatsApp}
            className="hover-surface w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition"
            style={{ color: 'var(--txt)' }}
          >
            <MessageCircle size={16} style={{ color: '#25D366' }} /> WhatsApp
          </button>
          <button
            onClick={partagerFacebook}
            className="hover-surface w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition"
            style={{ color: 'var(--txt)' }}
          >
            <Globe size={16} style={{ color: '#1877F2' }} /> Facebook
          </button>
          <button
            onClick={copierLien}
            className="hover-surface w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition"
            style={{ color: 'var(--txt)' }}
          >
            {copie ? <Check size={16} style={{ color: 'var(--gr)' }} /> : <Link2 size={16} />}
            {copie ? 'Lien copié !' : 'Copier le lien'}
          </button>
        </div>
      )}
    </div>
  );
}
