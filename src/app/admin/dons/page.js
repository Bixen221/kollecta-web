'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2 } from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function AdminDonsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [dons,    setDons]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !user.est_admin)) router.push('/');
  }, [authLoading, user]);

  const charger = async () => {
    try {
      const res = await api.get('/admin/dons');
      setDons(res.dons || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user?.est_admin) charger(); }, [user]);

  const supprimer = async (don) => {
    if (!confirm(`Supprimer "${don.titre}" ? Cette action est irréversible.`)) return;
    try {
      await api.delete(`/admin/dons/${don.id}`);
      charger();
    } catch (err) {
      alert(err.message);
    }
  };

  if (authLoading || !user || !user.est_admin) return null;

  return (
    <main style={{ backgroundColor: 'var(--bg)', minHeight: 'calc(100vh - 73px)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-semibold mb-6 hover:opacity-70" style={{ color: 'var(--txt2)' }}>
          <ArrowLeft size={16} /> Retour
        </Link>

        <h1 className="text-2xl font-extrabold mb-6" style={{ color: 'var(--txt)' }}>🎁 Dons ({dons.length})</h1>

        {loading ? (
          <p style={{ color: 'var(--txt2)' }}>Chargement...</p>
        ) : (
          <div className="flex flex-col gap-3">
            {dons.map((don) => (
              <div key={don.id} className="rounded-2xl border p-4 flex items-center gap-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}>
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: don.type === 'nourriture' ? '#FFF8E8' : '#EAF5EE' }}
                >
                  <span className="text-2xl">{don.type === 'nourriture' ? '🍱' : '📦'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm" style={{ color: 'var(--txt)' }}>{don.titre}</p>
                  <p className="text-xs" style={{ color: 'var(--txt2)' }}>{don.prenom} {don.nom} · {don.quartier}, {don.ville}</p>
                  <p className="text-xs" style={{ color: 'var(--txt3)' }}>
                    {don.statut === 'actif' ? '🟢 Actif' : '⚪ Clôturé'} · {don.quantite_dispo}/{don.quantite_total} disponibles
                  </p>
                </div>
                <Link
                  href={`/dons/${don.id}`}
                  className="hover-surface px-3 py-2 rounded-lg text-xs font-bold border"
                  style={{ borderColor: 'var(--bd)', color: 'var(--txt2)' }}
                >
                  Voir
                </Link>
                <button
                  onClick={() => supprimer(don)}
                  className="hover-surface p-2 rounded-lg border"
                  style={{ borderColor: '#FFCDD2' }}
                >
                  <Trash2 size={16} style={{ color: '#CC2222' }} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
