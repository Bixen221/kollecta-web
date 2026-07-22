'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function MesReservationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [onglet,       setOnglet]       = useState('en_cours');

  useEffect(() => {
    if (!authLoading && !user) router.push('/connexion');
  }, [authLoading, user]);

  const charger = async () => {
    try {
      const res = await api.get('/dons/reservations/mes-reservations');
      setReservations(res.reservations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) charger(); }, [user]);

  const getStatutLabel = (statut) => {
    const map = {
      en_attente:          { label: '⏳ En attente',          color: 'var(--or)' },
      contacte:            { label: '📱 Contacté',            color: '#22C55E' },
      confirme_proprio:    { label: '✅ Proprio a confirmé',  color: '#22C55E' },
      confirme_demandeur:  { label: '✅ Vous avez confirmé',  color: '#22C55E' },
      cloture:             { label: '🎉 Don reçu',            color: 'var(--gr)' },
      annule:              { label: '❌ Annulé',               color: '#FF6B6B' },
    };
    return map[statut] || { label: statut, color: 'var(--txt2)' };
  };

  const handleAnnuler = async (resa) => {
    if (!confirm('Voulez-vous vraiment annuler cette réservation ?')) return;
    try {
      await api.post(`/dons/reservations/${resa.id}/confirmer`, { role: 'annuler' });
      charger();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleConfirmer = async (resa) => {
    try {
      await api.post(`/dons/reservations/${resa.id}/confirmer`, { role: 'demandeur' });
      charger();
    } catch (err) {
      alert(err.message);
    }
  };

  const enCours  = reservations.filter(r => !['cloture', 'annule'].includes(r.statut));
  const termines = reservations.filter(r => r.statut === 'cloture');
  const annules  = reservations.filter(r => r.statut === 'annule');
  const listes   = { en_cours: enCours, termines, annules };
  const courante = listes[onglet] || [];

  if (authLoading || !user) return null;

  return (
    <main style={{ backgroundColor: 'var(--bg)', minHeight: 'calc(100vh - 73px)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <Link href="/profil" className="inline-flex items-center gap-2 text-sm font-semibold mb-6 hover:opacity-70" style={{ color: 'var(--txt2)' }}>
          <ArrowLeft size={16} /> Retour
        </Link>

        <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--txt)' }}>📋 Mes réservations</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--txt2)' }}>{enCours.length} en cours · {termines.length} complétées</p>

        <div className="flex gap-6 border-b mb-6 flex-wrap" style={{ borderColor: 'var(--bd)' }}>
          {[
            ['en_cours', `En cours (${enCours.length})`],
            ['termines', `Complétées (${termines.length})`],
            ['annules',  `Annulées (${annules.length})`],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setOnglet(key)}
              className="pb-3 text-sm font-bold border-b-2 transition"
              style={{ borderColor: onglet === key ? 'var(--or)' : 'transparent', color: onglet === key ? 'var(--or)' : 'var(--txt2)' }}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: 'var(--txt2)' }}>Chargement...</p>
        ) : courante.length === 0 ? (
          <p style={{ color: 'var(--txt2)' }}>Aucune réservation ici.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {courante.map((resa) => {
              const statut = getStatutLabel(resa.statut);
              const besoinConfirmation = resa.statut === 'confirme_proprio';
              return (
                <div key={resa.id} className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}>
                  <Link href={`/dons/${resa.don_id}`} className="block">
                    <div className="h-28 flex items-center justify-center" style={{ backgroundColor: 'var(--card2)' }}>
                      {resa.photos?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={resa.photos[0]} alt={resa.titre} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">{resa.type === 'nourriture' ? '🍱' : '📦'}</span>
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <h3 className="font-bold mb-1" style={{ color: 'var(--txt)' }}>{resa.titre}</h3>
                    <p className="text-xs mb-2" style={{ color: 'var(--txt2)' }}>{resa.quartier}, {resa.ville} · {resa.nom} {resa.prenom}</p>
                    <p className="text-xs font-bold mb-3" style={{ color: statut.color }}>{statut.label}</p>

                    {besoinConfirmation && (
                      <div className="rounded-lg p-3 mb-3" style={{ backgroundColor: 'var(--grl)' }}>
                        <p className="text-xs font-semibold mb-2" style={{ color: 'var(--gr)' }}>✅ Avez-vous reçu ce don ?</p>
                        <button
                          onClick={() => handleConfirmer(resa)}
                          className="w-full py-2 rounded-lg text-xs font-bold text-white"
                          style={{ backgroundColor: 'var(--gr)' }}
                        >
                          ✓ Oui, reçu
                        </button>
                      </div>
                    )}

                    {!['cloture', 'annule'].includes(resa.statut) && (
                      <button
                        onClick={() => handleAnnuler(resa)}
                        className="w-full py-2 rounded-lg text-xs font-bold border"
                        style={{ backgroundColor: '#FDE8EB', borderColor: '#FF6B6B', color: '#CC2222' }}
                      >
                        Annuler la réservation
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
