'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Bell } from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const TYPES_NOTIF = {
  reservation:          { ico: '🎁', bg: '#FFF3D0' },
  contact:              { ico: '📱', bg: '#E8F9EE' },
  confirmation_requise: { ico: '✅', bg: '#E8F5EE' },
  don_cloture:          { ico: '🎉', bg: '#E8F5EE' },
  don_supprime:         { ico: '❌', bg: '#FDE8EB' },
  enchere_offre:        { ico: '🔨', bg: '#FFF3D0' },
  enchere_gagnant:      { ico: '🏆', bg: '#FFF3D0' },
  enchere_termine:      { ico: '🔔', bg: '#F0F0F0' },
};

const formaterTemps = (date) => {
  const diff = new Date() - new Date(date);
  const min = Math.floor(diff / 60000);
  const h   = Math.floor(diff / 3600000);
  const j   = Math.floor(diff / 86400000);
  if (min < 1)  return "À l'instant";
  if (min < 60) return `Il y a ${min} min`;
  if (h < 24)   return `Il y a ${h}h`;
  if (j < 7)    return `Il y a ${j} jour${j > 1 ? 's' : ''}`;
  return new Date(date).toLocaleDateString('fr-SN');
};

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [notifs,  setNotifs]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push('/connexion');
  }, [authLoading, user]);

  const charger = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifs(res.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) charger(); }, [user]);

  const marquerLu = async (id) => {
    try {
      await api.put(`/notifications/${id}/lire`);
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const marquerTousLus = async () => {
    try {
      await api.put('/notifications/lire-tout');
      setNotifs(prev => prev.map(n => ({ ...n, lu: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const nonLues = notifs.filter(n => !n.lu);
  const lues    = notifs.filter(n => n.lu);

  if (authLoading || !user) return null;

  const NotifCard = ({ notif, onClick }) => {
    const type = TYPES_NOTIF[notif.type] || { ico: '🔔', bg: '#F0F0F0' };
    return (
      <button
        onClick={onClick}
        className="w-full flex gap-3 p-4 rounded-xl border text-left transition"
        style={{
          backgroundColor: notif.lu ? 'var(--card)' : type.bg,
          borderColor: 'var(--bd)',
        }}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: type.bg }}>
          <span className="text-lg">{type.ico}</span>
        </div>
        <div className="flex-1">
          <p className="text-sm mb-0.5" style={{ fontWeight: notif.lu ? 600 : 700, color: 'var(--txt)' }}>{notif.titre}</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--txt2)' }}>{notif.message}</p>
          <p className="text-xs mt-1.5" style={{ color: 'var(--txt3)' }}>{formaterTemps(notif.cree_le)}</p>
        </div>
        {!notif.lu && <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: 'var(--or)' }} />}
      </button>
    );
  };

  return (
    <main style={{ backgroundColor: 'var(--bg)', minHeight: 'calc(100vh - 73px)' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <Link href="/profil" className="inline-flex items-center gap-2 text-sm font-semibold mb-6 hover:opacity-70" style={{ color: 'var(--txt2)' }}>
          <ArrowLeft size={16} /> Retour
        </Link>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-extrabold" style={{ color: 'var(--txt)' }}>🔔 Notifications</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--txt2)' }}>
              {nonLues.length > 0 ? `${nonLues.length} non lue${nonLues.length > 1 ? 's' : ''}` : 'Tout lu'}
            </p>
          </div>
          {nonLues.length > 0 && (
            <button
              onClick={marquerTousLus}
              className="px-4 py-2 rounded-full text-sm font-bold border"
              style={{ backgroundColor: 'var(--orl)', borderColor: 'var(--or)', color: 'var(--or)' }}
            >
              Tout lire
            </button>
          )}
        </div>

        {loading ? (
          <p style={{ color: 'var(--txt2)' }}>Chargement...</p>
        ) : notifs.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Bell size={40} style={{ color: 'var(--txt3)' }} className="mb-4" />
            <p className="font-bold mb-2" style={{ color: 'var(--txt)' }}>Aucune notification</p>
            <p className="text-sm" style={{ color: 'var(--txt2)' }}>Vos notifications apparaîtront ici.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {nonLues.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--txt3)' }}>Nouvelles</p>
                <div className="flex flex-col gap-2">
                  {nonLues.map(n => <NotifCard key={n.id} notif={n} onClick={() => marquerLu(n.id)} />)}
                </div>
              </div>
            )}
            {lues.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--txt3)' }}>Précédentes</p>
                <div className="flex flex-col gap-2">
                  {lues.map(n => <NotifCard key={n.id} notif={n} onClick={() => {}} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
