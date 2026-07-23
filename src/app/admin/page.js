'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, TrendingUp, Users, Gift, Hammer, Star, ShieldAlert } from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function AdminPage() {
  const { user, loading: authLoading, deconnexion } = useAuth();
  const router = useRouter();
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [erreur,  setErreur]  = useState('');

  useEffect(() => {
    if (!authLoading && (!user || !user.est_admin)) router.push('/');
  }, [authLoading, user]);

  useEffect(() => {
    const charger = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.stats);
      } catch (err) {
        setErreur(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (user?.est_admin) charger();
  }, [user]);

  if (authLoading || !user || !user.est_admin) return null;

  const KpiCard = ({ icon: Icon, label, value, sous, couleur }) => (
    <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} style={{ color: couleur || 'var(--or)' }} />
        <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--txt2)' }}>{label}</p>
      </div>
      <p className="text-2xl font-extrabold" style={{ color: couleur || 'var(--txt)' }}>{value}</p>
      {sous && <p className="text-xs mt-1" style={{ color: 'var(--txt3)' }}>{sous}</p>}
    </div>
  );

  return (
    <main style={{ backgroundColor: 'var(--bg)', minHeight: 'calc(100vh - 73px)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold" style={{ color: 'var(--txt)' }}>🛠 Tableau de bord</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--txt2)' }}>Bienvenue, {user.prenom}</p>
          </div>
          <button
            onClick={deconnexion}
            className="hover-surface flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border"
            style={{ borderColor: '#FFCDD2', color: '#CC2222' }}
          >
            <LogOut size={16} /> Déconnexion
          </button>
        </div>

        {erreur && (
          <div className="mb-4 px-4 py-3 rounded-lg text-sm font-medium" style={{ backgroundColor: '#FDE8EB', color: '#8B1A2A' }}>
            {erreur}
          </div>
        )}

        {loading ? (
          <p style={{ color: 'var(--txt2)' }}>Chargement...</p>
        ) : stats && (
          <>
            {/* CROISSANCE */}
            <p className="text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-2" style={{ color: 'var(--txt3)' }}>
              <TrendingUp size={13} /> Croissance (7 derniers jours)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <KpiCard icon={Users}  label="Nouveaux membres" value={stats.nouveaux_users_7j} />
              <KpiCard icon={Gift}   label="Nouveaux dons"    value={stats.nouveaux_dons_7j} />
              <KpiCard icon={Hammer} label="Nouvelles enchères" value={stats.nouvelles_encheres_7j} />
            </div>

            {/* VUE D'ENSEMBLE */}
            <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--txt3)' }}>Vue d'ensemble</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              <KpiCard icon={Users}  label="Utilisateurs"     value={stats.total_users} />
              <KpiCard icon={Gift}   label="Dons actifs"      value={stats.dons_actifs} sous={`${stats.total_dons} au total`} />
              <KpiCard icon={Hammer} label="Enchères en cours" value={stats.encheres_en_cours} sous={`${stats.total_encheres} au total`} />
            </div>

            {/* SANTE DE LA PLATEFORME */}
            <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--txt3)' }}>Santé de la plateforme</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <KpiCard
                icon={Gift}
                label="Taux de dons complétés"
                value={`${stats.taux_completion_dons}%`}
                couleur={stats.taux_completion_dons >= 50 ? 'var(--gr)' : 'var(--or)'}
              />
              <KpiCard
                icon={Gift}
                label="Réservations"
                value={`${stats.resa_confirmees} ✓ / ${stats.resa_annulees} ✗`}
                sous="Confirmées vs annulées"
              />
              <KpiCard icon={Star} label="Note moyenne globale" value={`⭐ ${stats.note_moyenne_globale}`} />
            </div>

            {/* ENCHERES */}
            <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--txt3)' }}>Enchères</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <KpiCard
                icon={Hammer}
                label="Volume en cours"
                value={`${stats.volume_encheres_cours?.toLocaleString()} FCFA`}
                sous="Somme des offres actuelles sur enchères actives"
              />
              <KpiCard icon={Hammer} label="Réservations totales" value={stats.total_reservations} />
            </div>

            {/* MODERATION */}
            <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--txt3)' }}>Modération</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <KpiCard
                icon={ShieldAlert}
                label="Utilisateurs non vérifiés"
                value={stats.users_non_verifies}
                couleur={stats.users_non_verifies > 0 ? 'var(--bord)' : 'var(--gr)'}
                sous="À examiner en priorité"
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
