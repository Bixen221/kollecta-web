'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2 } from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function MesDonsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [dons,    setDons]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [onglet,  setOnglet]  = useState('actifs');

  useEffect(() => {
    if (!authLoading && !user) router.push('/connexion');
  }, [authLoading, user]);

  const charger = async () => {
    try {
      const res = await api.get('/dons/mes-dons');
      setDons(res.dons || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) charger(); }, [user]);

  const handleSupprimer = async (donId) => {
    if (!confirm('Supprimer ce don ? Les réservants seront notifiés.')) return;
    try {
      await api.delete(`/dons/${donId}`);
      charger();
    } catch (err) {
      alert(err.message);
    }
  };

  const actifs   = dons.filter(d => d.statut === 'actif');
  const clotures = dons.filter(d => d.statut === 'cloture');
  const courante = onglet === 'actifs' ? actifs : clotures;

  if (authLoading || !user) return null;

  return (
    <main style={{ backgroundColor: 'var(--bg)', minHeight: 'calc(100vh - 73px)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <Link href="/profil" className="inline-flex items-center gap-2 text-sm font-semibold mb-6 hover:opacity-70" style={{ color: 'var(--txt2)' }}>
          <ArrowLeft size={16} /> Retour
        </Link>

        <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--txt)' }}>🎁 Mes dons publiés</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--txt2)' }}>{actifs.length} actifs · {clotures.length} complétés</p>

        <div className="flex gap-6 border-b mb-6" style={{ borderColor: 'var(--bd)' }}>
          {[['actifs', `Actifs (${actifs.length})`], ['clotures', `Complétés (${clotures.length})`]].map(([key, label]) => (
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
          <p style={{ color: 'var(--txt2)' }}>{onglet === 'actifs' ? 'Aucun don actif.' : 'Aucun don complété.'}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {courante.map((don) => {
              const pourcent = don.quantite_total > 0 ? Math.round((1 - don.quantite_dispo / don.quantite_total) * 100) : 0;
              return (
                <div
                  key={don.id}
                  className="rounded-2xl border overflow-hidden"
                  style={{ backgroundColor: 'var(--card)', borderColor: don.statut === 'cloture' ? 'var(--gr)' : 'var(--or)' }}
                >
                  <Link href={`/dons/${don.id}`} className="block">
                    <div
                      className="h-32 flex items-center justify-center"
                      style={{ backgroundColor: don.type === 'nourriture' ? '#FFF8E8' : '#EAF5EE' }}
                    >
                      {don.photos?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={don.photos[0]} alt={don.titre} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl">{don.type === 'nourriture' ? '🍱' : '📦'}</span>
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold" style={{ color: 'var(--txt)' }}>{don.titre}</h3>
                      {don.nb_reservations > 0 && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bordl)', color: 'var(--bord)' }}>
                          {don.nb_reservations} résa
                        </span>
                      )}
                    </div>
                    <p className="text-xs mb-3" style={{ color: 'var(--txt2)' }}>{don.quartier}, {don.ville}</p>

                    {don.statut === 'actif' ? (
                      <>
                        <div className="h-1.5 rounded-full overflow-hidden mb-1" style={{ backgroundColor: 'var(--bd)' }}>
                          <div className="h-full rounded-full" style={{ width: `${pourcent}%`, backgroundColor: 'var(--gr)' }} />
                        </div>
                        <p className="text-xs mb-3" style={{ color: 'var(--txt2)' }}>{don.quantite_dispo}/{don.quantite_total} disponibles</p>
                        <button
                          onClick={() => handleSupprimer(don.id)}
                          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold border"
                          style={{ backgroundColor: '#FDE8EB', borderColor: '#FF6B6B', color: '#CC2222' }}
                        >
                          <Trash2 size={13} /> Supprimer
                        </button>
                      </>
                    ) : (
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: 'var(--grl)', color: 'var(--gr)' }}>
                        ✅ Don complété
                      </span>
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
