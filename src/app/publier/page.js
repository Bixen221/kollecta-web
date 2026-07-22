'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Gift, Hammer } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function PublierPage() {
  const { user, loading } = useAuth();
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="text-3xl font-extrabold mb-2" style={{ color: 'var(--txt)' }}>Que voulez-vous publier ?</h1>
        <p className="text-sm mb-10" style={{ color: 'var(--txt2)' }}>Choisissez le type d'annonce</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Link
            href="/publier/don"
            className="rounded-2xl border p-8 hover:shadow-lg transition flex flex-col items-center"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: '#FFF8E8' }}>
              <Gift size={28} style={{ color: '#A67C2A' }} />
            </div>
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--txt)' }}>Don</h2>
            <p className="text-sm text-center" style={{ color: 'var(--txt2)' }}>Offrez gratuitement nourriture ou matériel</p>
          </Link>

          <Link
            href="/publier/enchere"
            className="rounded-2xl border p-8 hover:shadow-lg transition flex flex-col items-center"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--orl)' }}>
              <Hammer size={28} style={{ color: 'var(--or)' }} />
            </div>
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--txt)' }}>Enchère</h2>
            <p className="text-sm text-center" style={{ color: 'var(--txt2)' }}>Vendez au meilleur prix en temps réel</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
