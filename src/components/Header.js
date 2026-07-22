'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Gift, Hammer, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const [menuOuvert, setMenuOuvert] = useState(false);
  const { user, loading } = useAuth();

  const liens = [
    { href: '/dons', label: 'Dons', icon: Gift },
    { href: '/encheres', label: 'Enchères', icon: Hammer },
  ];

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-extrabold tracking-wide" style={{ color: 'var(--or)' }}>
          KOLLECTA
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {liens.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 text-sm font-semibold hover:opacity-70 transition"
              style={{ color: 'var(--txt2)' }}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {!loading && user ? (
            <Link
              href="/profil"
              className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg hover:opacity-80 transition"
              style={{ color: 'var(--txt) ' }}
            >
              <User size={16} />
              {user.prenom}
            </Link>
          ) : !loading ? (
            <>
              <Link
                href="/connexion"
                className="text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-80 transition"
                style={{ color: 'var(--txt2)' }}
              >
                Connexion
              </Link>
              <Link
                href="/inscription"
                className="text-sm font-bold px-4 py-2 rounded-lg text-white hover:opacity-90 transition"
                style={{ backgroundColor: 'var(--bord)' }}
              >
                S'inscrire
              </Link>
            </>
          ) : null}
        </div>

        <button
          className="md:hidden"
          onClick={() => setMenuOuvert(!menuOuvert)}
          style={{ color: 'var(--txt)' }}
        >
          {menuOuvert ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {menuOuvert && (
        <div className="md:hidden border-t px-4 py-4 flex flex-col gap-3" style={{ borderColor: 'var(--bd)' }}>
          {liens.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOuvert(false)}
              className="flex items-center gap-2 text-sm font-semibold py-2"
              style={{ color: 'var(--txt2)' }}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
          {!loading && user ? (
            <Link
              href="/profil"
              onClick={() => setMenuOuvert(false)}
              className="flex items-center gap-2 text-sm font-semibold py-2"
              style={{ color: 'var(--txt2)' }}
            >
              <User size={18} />
              {user.prenom}
            </Link>
          ) : !loading ? (
            <>
              <Link
                href="/connexion"
                onClick={() => setMenuOuvert(false)}
                className="text-sm font-semibold py-2"
                style={{ color: 'var(--txt2)' }}
              >
                Connexion
              </Link>
              <Link
                href="/inscription"
                onClick={() => setMenuOuvert(false)}
                className="text-sm font-bold py-3 rounded-lg text-white text-center"
                style={{ backgroundColor: 'var(--bord)' }}
              >
                S'inscrire
              </Link>
            </>
          ) : null}
        </div>
      )}
    </header>
  );
}
