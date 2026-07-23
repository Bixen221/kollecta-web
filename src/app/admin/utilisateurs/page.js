'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2, ShieldCheck } from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function AdminUtilisateursPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !user.est_admin)) router.push('/');
  }, [authLoading, user]);

  const charger = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user?.est_admin) charger(); }, [user]);

  const toggleVerifie = async (u) => {
    try {
      await api.put(`/admin/users/${u.id}/verifier`, { verifie: !u.verifie });
      charger();
    } catch (err) {
      alert(err.message);
    }
  };

  const supprimer = async (u) => {
    if (!confirm(`Supprimer ${u.prenom} ${u.nom} ? Cette action est irréversible.`)) return;
    try {
      await api.delete(`/admin/users/${u.id}`);
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

        <h1 className="text-2xl font-extrabold mb-6" style={{ color: 'var(--txt)' }}>👥 Utilisateurs ({users.length})</h1>

        {loading ? (
          <p style={{ color: 'var(--txt2)' }}>Chargement...</p>
        ) : (
          <div className="flex flex-col gap-3">
            {users.map((u) => (
              <div key={u.id} className="rounded-2xl border p-4 flex items-center gap-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}>
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" style={{ backgroundColor: 'var(--bord)' }}>
                  {u.prenom?.[0]}{u.nom?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm flex items-center gap-2" style={{ color: 'var(--txt)' }}>
                    {u.prenom} {u.nom}
                    {u.est_admin && <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: 'var(--orl)', color: 'var(--or)' }}>ADMIN</span>}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--txt2)' }}>{u.whatsapp} · {u.quartier}, {u.ville}</p>
                  <p className="text-xs" style={{ color: 'var(--txt3)' }}>{u.nb_dons} dons · ⭐ {u.note_moyenne}</p>
                </div>
                <button
                  onClick={() => toggleVerifie(u)}
                  className="hover-surface flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border"
                  style={{ borderColor: u.verifie ? 'var(--gr)' : 'var(--bd)', color: u.verifie ? 'var(--gr)' : 'var(--txt2)' }}
                >
                  <ShieldCheck size={14} /> {u.verifie ? 'Vérifié' : 'Vérifier'}
                </button>
                {!u.est_admin && (
                  <button
                    onClick={() => supprimer(u)}
                    className="hover-surface p-2 rounded-lg border"
                    style={{ borderColor: '#FFCDD2' }}
                  >
                    <Trash2 size={16} style={{ color: '#CC2222' }} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
