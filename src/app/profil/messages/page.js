'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, MessageCircle } from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [recherche,    setRecherche]    = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/connexion');
  }, [authLoading, user]);

  useEffect(() => {
    const charger = async () => {
      try {
        const res = await api.get('/dons/reservations/mes-reservations');
        const actives = (res.reservations || []).filter(r => !['annule'].includes(r.statut));
        setReservations(actives);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) charger();
  }, [user]);

  const ouvrirWhatsApp = (whatsapp, titre) => {
    const numero  = whatsapp?.replace(/\D/g, '');
    const message = encodeURIComponent(`Bonjour ! Je vous contacte via Kollecta concernant le don "${titre}".`);
    window.open(`https://wa.me/${numero}?text=${message}`, '_blank');
  };

  const filtres = reservations.filter(r =>
    r.titre?.toLowerCase().includes(recherche.toLowerCase()) ||
    r.nom?.toLowerCase().includes(recherche.toLowerCase()) ||
    r.prenom?.toLowerCase().includes(recherche.toLowerCase())
  );

  if (authLoading || !user) return null;

  return (
    <main style={{ backgroundColor: 'var(--bg)', minHeight: 'calc(100vh - 73px)' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <Link href="/profil" className="inline-flex items-center gap-2 text-sm font-semibold mb-6 hover:opacity-70" style={{ color: 'var(--txt2)' }}>
          <ArrowLeft size={16} /> Retour
        </Link>

        <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--txt)' }}>💬 Messages</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--txt2)' }}>
          {reservations.length} conversation{reservations.length > 1 ? 's' : ''} active{reservations.length > 1 ? 's' : ''}
        </p>

        <div
          className="flex items-center gap-2 px-4 py-3 rounded-xl border mb-6"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}
        >
          <Search size={16} style={{ color: 'var(--txt3)' }} />
          <input
            type="text"
            placeholder="Rechercher une conversation..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="flex-1 outline-none bg-transparent text-sm"
            style={{ color: 'var(--txt)' }}
          />
        </div>

        {loading ? (
          <p style={{ color: 'var(--txt2)' }}>Chargement...</p>
        ) : filtres.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <MessageCircle size={40} style={{ color: 'var(--txt3)' }} className="mb-4" />
            <p className="font-bold mb-2" style={{ color: 'var(--txt)' }}>Aucune conversation</p>
            <p className="text-sm" style={{ color: 'var(--txt2)' }}>
              Vos conversations avec les propriétaires de dons apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtres.map((resa) => (
              <button
                key={resa.id}
                onClick={() => resa.whatsapp && ouvrirWhatsApp(resa.whatsapp, resa.titre)}
                className="w-full flex items-center gap-3 p-4 rounded-xl border text-left hover:opacity-90 transition"
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{ backgroundColor: 'var(--bord)' }}
                >
                  {resa.prenom?.[0]}{resa.nom?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{ color: 'var(--txt)' }}>{resa.prenom} {resa.nom}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--txt2)' }}>Don : {resa.titre}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--txt3)' }}>{resa.quartier}, {resa.ville}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#25D366' }}>
                    WhatsApp →
                  </span>
                  <span className="text-[10px]" style={{ color: 'var(--txt3)' }}>
                    {new Date(resa.cree_le).toLocaleDateString('fr-SN')}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
