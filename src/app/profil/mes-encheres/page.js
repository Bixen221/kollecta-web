'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trophy, TrendingDown, Clock } from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function MesEncheresPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [encheres, setEncheres] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [onglet,   setOnglet]   = useState('toutes');

  useEffect(() => {
    if (!authLoading && !user) router.push('/connexion');
  }, [authLoading, user]);

  useEffect(() => {
    const charger = async () => {
      try {
        const res = await api.get('/encheres/mes-encheres');
        setEncheres(res.encheres || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) charger();
  }, [user]);

  if (authLoading || !user) return null;

  const estTerminee = (e) => e.statut === 'termine' || new Date(e.fin_le) <= new Date();
  const estGagnee = (e) => estTerminee(e) && e.meilleur_offrant_id === user.id;
  const estPerdue = (e) => estTerminee(e) && e.meilleur_offrant_id !== user.id;
  const estEnCours = (e) => !estTerminee(e);

  const gagnees = encheres.filter(estGagnee);
  const perdues = encheres.filter(estPerdue);
  const enCours = encheres.filter(estEnCours);

  const listes = { toutes: encheres, gagnees, perdues, en_cours: enCours };
  const courante = listes[onglet] || [];

  const getBadge = (e) => {
    if (estEnCours(e)) return { label: '⏱ En cours', couleur: 'var(--or)', bg: 'var(--orl)' };
    if (estGagnee(e))  return { label: '🏆 Remportée', couleur: 'var(--gr)', bg: 'var(--grl)' };
    return { label: '❌ Perdue', couleur: '#CC2222', bg: '#FDE8EB' };
  };

  return (
    <main style={{ backgroundColor: 'var(--bg)', minHeight: 'calc(100vh - 73px)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <Link href="/profil" className="inline-flex items-center gap-2 text-sm font-semibold mb-6 hover:opacity-70" style={{ color: 'var(--txt2)' }}>
          <ArrowLeft size={16} /> Retour
        </Link>

        <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--txt)' }}>🔨 Mes enchères</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--txt2)' }}>
          {gagnees.length} remportées · {perdues.length} perdues · {enCours.length} en cours
        </p>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl border p-4 text-center" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}>
            <Trophy size={18} className="mx-auto mb-1" style={{ color: 'var(--gr)' }} />
            <p className="text-lg font-extrabold" style={{ color: 'var(--txt)' }}>{gagnees.length}</p>
            <p className="text-xs" style={{ color: 'var(--txt2)' }}>Remportées</p>
          </div>
          <div className="rounded-xl border p-4 text-center" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}>
            <TrendingDown size={18} className="mx-auto mb-1" style={{ color: '#CC2222' }} />
            <p className="text-lg font-extrabold" style={{ color: 'var(--txt)' }}>{perdues.length}</p>
            <p className="text-xs" style={{ color: 'var(--txt2)' }}>Perdues</p>
          </div>
          <div className="rounded-xl border p-4 text-center" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}>
            <Clock size={18} className="mx-auto mb-1" style={{ color: 'var(--or)' }} />
            <p className="text-lg font-extrabold" style={{ color: 'var(--txt)' }}>{enCours.length}</p>
            <p className="text-xs" style={{ color: 'var(--txt2)' }}>En cours</p>
          </div>
        </div>

        <div className="flex gap-6 border-b mb-6 flex-wrap" style={{ borderColor: 'var(--bd)' }}>
          {[
            ['toutes',   `Toutes (${encheres.length})`],
            ['en_cours', `En cours (${enCours.length})`],
            ['gagnees',  `Remportées (${gagnees.length})`],
            ['perdues',  `Perdues (${perdues.length})`],
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
          <p style={{ color: 'var(--txt2)' }}>Aucune enchère ici.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {courante.map((e) => {
              const badge = getBadge(e);
              return (
                <Link
                  key={e.id}
                  href={`/encheres/${e.id}`}
                  className="rounded-2xl overflow-hidden border hover:shadow-lg transition block"
                  style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}
                >
                  <div className="h-32 flex items-center justify-center relative" style={{ backgroundColor: 'var(--card2)' }}>
                    {e.photos?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={e.photos[0]} alt={e.titre} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">📦</span>
                    )}
                    <span
                      className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: badge.bg, color: badge.couleur }}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold mb-2" style={{ color: 'var(--txt)' }}>{e.titre}</h3>
                    <p className="text-xs mb-1" style={{ color: 'var(--txt2)' }}>Offre finale / actuelle</p>
                    <p className="font-extrabold" style={{ color: 'var(--bord)' }}>
                      {e.offre_actuelle?.toLocaleString()} FCFA
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
