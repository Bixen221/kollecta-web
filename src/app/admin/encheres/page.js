'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2 } from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function AdminEncheresPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [encheres, setEncheres] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !user.est_admin)) router.push('/');
  }, [authLoading, user]);

  const charger = async () => {
    try {
      const res = await api.get('/admin/encheres');
      setEncheres(res.encheres || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user?.est_admin) charger(); }, [user]);

  const supprimer = async (e) => {
    if (!confirm(`Supprimer "${e.titre}" ? Cette action est irréversible.`)) return;
    try {
      await api.delete(`/admin/encheres/${e.id}`);
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

        <h1 className="text-2xl font-extrabold mb-6" style={{ color: 'var(--txt)' }}>🔨 Enchères ({encheres.length})</h1>

        {loading ? (
          <p style={{ color: 'var(--txt2)' }}>Chargement...</p>
        ) : (
          <div className="flex flex-col gap-3">
            {encheres.map((e) => (
              <div key={e.id} className="rounded-2xl border p-4 flex items-center gap-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--card2)' }}>
                  <span className="text-2xl">📦</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm" style={{ color: 'var(--txt)' }}>{e.titre}</p>
                  <p className="text-xs" style={{ color: 'var(--txt2)' }}>{e.prenom} {e.nom} · {e.quartier}, {e.ville}</p>
                  <p className="text-xs" style={{ color: 'var(--txt3)' }}>
                    {e.offre_actuelle?.toLocaleString()} FCFA · {e.nb_offres} offres · {e.statut}
                  </p>
                </div>
                <Link
                  href={`/encheres/${e.id}`}
                  className="hover-surface px-3 py-2 rounded-lg text-xs font-bold border"
                  style={{ borderColor: 'var(--bd)', color: 'var(--txt2)' }}
                >
                  Voir
                </Link>
                <button
                  onClick={() => supprimer(e)}
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
