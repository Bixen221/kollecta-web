'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Star } from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function DetailDonPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [don,     setDon]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [photoActive, setPhotoActive] = useState(0);
  const [reservation, setReservation] = useState(null);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    const charger = async () => {
      try {
        const res = await api.get(`/dons/${id}`);
        setDon(res.don);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    charger();
  }, [id]);

  const handleReserver = async () => {
    if (!user) return router.push('/connexion');
    setErreur('');
    try {
      const res = await api.post(`/dons/${id}/reserver`);
      setReservation(res.reservation);
    } catch (err) {
      setErreur(err.message);
    }
  };

  if (loading) {
    return (
      <main className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 73px)', backgroundColor: 'var(--bg)' }}>
        <p style={{ color: 'var(--txt2)' }}>Chargement...</p>
      </main>
    );
  }

  if (!don) {
    return (
      <main className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 73px)', backgroundColor: 'var(--bg)' }}>
        <p style={{ color: 'var(--txt2)' }}>Ce don n'existe pas ou a été supprimé.</p>
      </main>
    );
  }

  const photos = don.photos?.filter(Boolean) || [];
  const estProprio = user?.id === don.proprietaire_id;
  const plusDispo = don.quantite_dispo <= 0;
  const pourcent = Math.round((1 - don.quantite_dispo / don.quantite_total) * 100);

  return (
    <main style={{ backgroundColor: 'var(--bg)', minHeight: 'calc(100vh - 73px)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/dons" className="inline-flex items-center gap-2 text-sm font-semibold mb-6 hover:opacity-70" style={{ color: 'var(--txt2)' }}>
          <ArrowLeft size={16} /> Retour aux dons
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div
              className="h-80 rounded-2xl overflow-hidden flex items-center justify-center border"
              style={{ backgroundColor: don.type === 'nourriture' ? '#FFF8E8' : '#EAF5EE', borderColor: 'var(--bd)' }}
            >
              {photos.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photos[photoActive]} alt={don.titre} className="w-full h-full object-cover" />
              ) : (
                <span className="text-7xl">{don.type === 'nourriture' ? '🍱' : '📦'}</span>
              )}
            </div>
            {photos.length > 1 && (
              <div className="flex gap-2 mt-3">
                {photos.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setPhotoActive(i)}
                    className="w-16 h-16 rounded-lg overflow-hidden border-2"
                    style={{ borderColor: i === photoActive ? 'var(--or)' : 'var(--bd)' }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex gap-2 mb-3 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: 'var(--orl)', color: 'var(--or)' }}>
                {don.categorie || don.type}
              </span>
              {don.urgent && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">🚨 Urgent</span>
              )}
            </div>

            <h1 className="text-2xl font-extrabold mb-2" style={{ color: 'var(--txt)' }}>{don.titre}</h1>
            <p className="flex items-center gap-1.5 text-sm mb-6" style={{ color: 'var(--txt2)' }}>
              <MapPin size={15} /> {don.quartier}, {don.ville}
            </p>

            {don.description && (
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--txt2)' }}>Description</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--txt)' }}>{don.description}</p>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--txt2)' }}>Disponibilité</h3>
              <div className="h-2 rounded-full overflow-hidden mb-2" style={{ backgroundColor: 'var(--bd)' }}>
                <div className="h-full rounded-full" style={{ width: `${pourcent}%`, backgroundColor: 'var(--gr)' }} />
              </div>
              <p className="text-sm" style={{ color: 'var(--txt2)' }}>{don.quantite_dispo}/{don.quantite_total} disponibles</p>
            </div>

            <div className="mb-6 flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: 'var(--bord)' }}
              >
                {don.prenom?.[0]}{don.nom?.[0]}
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: 'var(--txt)' }}>{don.prenom} {don.nom}</p>
                <p className="flex items-center gap-1 text-xs" style={{ color: 'var(--txt2)' }}>
                  <Star size={12} /> {don.note_moyenne} · {don.nb_dons} dons
                </p>
              </div>
            </div>

            {erreur && (
              <div className="mb-4 px-4 py-3 rounded-lg text-sm font-medium" style={{ backgroundColor: '#FDE8EB', color: '#8B1A2A' }}>
                {erreur}
              </div>
            )}

            {reservation ? (
              <div className="px-4 py-4 rounded-xl text-sm font-semibold" style={{ backgroundColor: 'var(--grl)', color: 'var(--gr)' }}>
                ✓ Réservation confirmée ! Le propriétaire vous contactera sur WhatsApp dans les 48h.
              </div>
            ) : estProprio ? (
              <div className="px-4 py-4 rounded-xl text-sm font-semibold text-center" style={{ backgroundColor: 'var(--card2)', color: 'var(--txt2)' }}>
                Ceci est votre annonce
              </div>
            ) : (
              <button
                onClick={handleReserver}
                disabled={plusDispo}
                className="w-full py-3.5 rounded-xl font-bold text-white hover:opacity-90 transition disabled:opacity-50"
                style={{ backgroundColor: plusDispo ? 'var(--txt3)' : 'var(--bord)' }}
              >
                {plusDispo ? 'Plus disponible' : 'Réserver ce don'}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
