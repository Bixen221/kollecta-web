'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, MapPin, LogOut, Moon, Sun, Pencil, Gift, ClipboardList, Bell, MessageCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export default function ProfilPage() {
  const { user, loading, deconnexion } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/connexion');
  }, [loading, user]);

  if (loading || !user) {
    return (
      <main className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 73px)', backgroundColor: 'var(--bg)' }}>
        <p style={{ color: 'var(--txt2)' }}>Chargement...</p>
      </main>
    );
  }

  return (
    <main style={{ backgroundColor: 'var(--bg)', minHeight: 'calc(100vh - 73px)' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

        <div
          className="rounded-2xl border p-8 flex flex-col items-center text-center mb-6"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-extrabold border-2 mb-4 overflow-hidden"
            style={{ backgroundColor: 'var(--card2)', borderColor: 'var(--or)', color: 'var(--or)' }}
          >
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span>{user.prenom?.[0]}{user.nom?.[0]}</span>
            )}
          </div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--txt)' }}>{user.prenom} {user.nom}</h1>
          <p className="flex items-center gap-1 text-sm mt-1" style={{ color: 'var(--txt2)' }}>
            <MapPin size={14} /> {user.quartier ? `${user.quartier}, ` : ''}{user.ville}
          </p>
          <span
            className="mt-3 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: 'var(--orl)', color: 'var(--or)' }}
          >
            {user.verifie ? '✅ Compte vérifié' : '⏳ Non vérifié'} · Membre Kollecta
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl border p-4 text-center" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}>
            <p className="text-xl font-extrabold" style={{ color: 'var(--bord)' }}>{user.nb_dons || 0}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--txt2)' }}>Dons faits</p>
          </div>
          <div className="rounded-xl border p-4 text-center" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}>
            <p className="flex items-center justify-center gap-1 text-xl font-extrabold" style={{ color: 'var(--bord)' }}>
              <Star size={16} /> {user.note_moyenne || '0.0'}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--txt2)' }}>Note</p>
          </div>
          <div className="rounded-xl border p-4 text-center" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}>
            <p className="text-xl font-extrabold" style={{ color: 'var(--bord)' }}>0</p>
            <p className="text-xs mt-1" style={{ color: 'var(--txt2)' }}>Enchères</p>
          </div>
        </div>

        <div className="rounded-2xl border overflow-hidden mb-6" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}>
          <Link
            href="/profil/notifications"
            className="w-full flex items-center gap-3 p-4 border-b hover:opacity-80 transition"
            style={{ borderColor: 'var(--bd)' }}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--card2)' }}>
              <Bell size={16} style={{ color: 'var(--txt)' }} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold" style={{ color: 'var(--txt)' }}>Notifications</p>
              <p className="text-xs" style={{ color: 'var(--txt2)' }}>Vos alertes et mises à jour</p>
            </div>
          </Link>

          <Link
            href="/profil/messages"
            className="w-full flex items-center gap-3 p-4 border-b hover:opacity-80 transition"
            style={{ borderColor: 'var(--bd)' }}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--card2)' }}>
              <MessageCircle size={16} style={{ color: 'var(--txt)' }} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold" style={{ color: 'var(--txt)' }}>Messages</p>
              <p className="text-xs" style={{ color: 'var(--txt2)' }}>Conversations actives</p>
            </div>
          </Link>

          <Link
            href="/profil/mes-dons"
            className="w-full flex items-center gap-3 p-4 border-b hover:opacity-80 transition"
            style={{ borderColor: 'var(--bd)' }}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--card2)' }}>
              <Gift size={16} style={{ color: 'var(--txt)' }} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold" style={{ color: 'var(--txt)' }}>Mes dons publiés</p>
              <p className="text-xs" style={{ color: 'var(--txt2)' }}>Gérer mes annonces actives</p>
            </div>
          </Link>

          <Link
            href="/profil/mes-reservations"
            className="w-full flex items-center gap-3 p-4 border-b hover:opacity-80 transition"
            style={{ borderColor: 'var(--bd)' }}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--card2)' }}>
              <ClipboardList size={16} style={{ color: 'var(--txt)' }} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold" style={{ color: 'var(--txt)' }}>Mes réservations</p>
              <p className="text-xs" style={{ color: 'var(--txt2)' }}>Suivre mes demandes de dons</p>
            </div>
          </Link>

          <Link
            href="/profil/modifier"
            className="w-full flex items-center gap-3 p-4 border-b hover:opacity-80 transition"
            style={{ borderColor: 'var(--bd)' }}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--card2)' }}>
              <Pencil size={16} style={{ color: 'var(--txt)' }} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold" style={{ color: 'var(--txt)' }}>Modifier mon profil</p>
              <p className="text-xs" style={{ color: 'var(--txt2)' }}>Photo, nom, contact, localisation</p>
            </div>
          </Link>

          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 p-4 hover:opacity-80 transition"
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--card2)' }}>
              {isDark ? <Moon size={16} style={{ color: 'var(--txt)' }} /> : <Sun size={16} style={{ color: 'var(--txt)' }} />}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold" style={{ color: 'var(--txt)' }}>{isDark ? 'Mode sombre' : 'Mode clair'}</p>
              <p className="text-xs" style={{ color: 'var(--txt2)' }}>Changer l'apparence</p>
            </div>
          </button>
        </div>

        <button
          onClick={deconnexion}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold border hover:opacity-80 transition"
          style={{ borderColor: '#FFCDD2', color: '#CC2222', backgroundColor: 'var(--card)' }}
        >
          <LogOut size={16} /> Se déconnecter
        </button>
      </div>
    </main>
  );
}
