'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, Gift, Hammer, ClipboardList, LogOut } from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function AdminPage() {
  const { user, loading: authLoading, deconnexion } = useAuth();
  const router = useRouter();
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [erreur,  setErreur]  = useState('');

  useEffect(() => {
    if (!authLoading && (!user || !user.est_admin)) {
      router.push('/');
    }
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

  return (
    <main style={{ backgroundColor: 'var(--bg)', minHeight: 'calc(100vh - 73px)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold" style={{ color: 'var(--txt)' }}>🛠 Interface Admin</h1>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
            {[
              ['Utilisateurs',    stats.total_users],
              ['Dons totaux',     stats.total_dons],
              ['Dons actifs',     stats.dons_actifs],
              ['Enchères totales', stats.total_encheres],
              ['Enchères en cours', stats.encheres_en_cours],
              ['Réservations',    stats.total_reservations],
            ].map(([label, val]) => (
              <div key={label} className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}>
                <p className="text-2xl font-extrabold" style={{ color: 'var(--bord)' }}>{val}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--txt2)' }}>{label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Link
            href="/admin/utilisateurs"
            className="hover-surface rounded-2xl border p-6 flex flex-col items-center gap-3"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}
          >
            <Users size={28} style={{ color: 'var(--or)' }} />
            <span className="font-bold" style={{ color: 'var(--txt)' }}>Utilisateurs</span>
          </Link>
          <Link
            href="/admin/dons"
            className="hover-surface rounded-2xl border p-6 flex flex-col items-center gap-3"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}
          >
            <Gift size={28} style={{ color: 'var(--or)' }} />
            <span className="font-bold" style={{ color: 'var(--txt)' }}>Dons</span>
          </Link>
          <Link
            href="/admin/encheres"
            className="hover-surface rounded-2xl border p-6 flex flex-col items-center gap-3"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}
          >
            <Hammer size={28} style={{ color: 'var(--or)' }} />
            <span className="font-bold" style={{ color: 'var(--txt)' }}>Enchères</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
