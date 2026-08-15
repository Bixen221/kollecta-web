'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import SelecteurPays from '@/components/SelecteurPays';
import { paysParDefaut } from '@/data/pays';
import GoogleAuthButton from '@/components/GoogleAuthButton';

export default function ConnexionPage() {
  const { connexion } = useAuth();
  const router = useRouter();
  const [pays, setPays] = useState(paysParDefaut);
  const [numeroLocal, setNumeroLocal] = useState('');
  const [password, setPassword] = useState('');
  const [erreur,   setErreur]   = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleNumeroChange = (val) => {
    const chiffres = val.replace(/\D/g, '').slice(0, pays.longueur);
    setNumeroLocal(chiffres);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    setLoading(true);
    try {
      const whatsapp = pays.indicatif + numeroLocal;
      await connexion(whatsapp, password);
      router.push('/');
    } catch (err) {
      setErreur(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-[calc(100vh-73px)] flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl border p-8"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}
      >
        <h1 className="text-2xl font-extrabold mb-2 text-center" style={{ color: 'var(--txt)' }}>
          Bon retour !
        </h1>
        <p className="text-sm text-center mb-8" style={{ color: 'var(--txt2)' }}>
          Connectez-vous à votre compte Kollecta
        </p>

        {erreur && (
          <div className="mb-4 px-4 py-3 rounded-lg text-sm font-medium" style={{ backgroundColor: '#FDE8EB', color: '#8B1A2A' }}>
            {erreur}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--txt2)' }}>
              Numéro WhatsApp
            </label>
            <div className="flex gap-2">
              <SelecteurPays paysSelectionne={pays} onChange={(p) => { setPays(p); setNumeroLocal(''); }} />
              <input
                type="tel"
                placeholder={'X'.repeat(pays.longueur)}
                value={numeroLocal}
                onChange={(e) => handleNumeroChange(e.target.value)}
                required
                className="flex-1 min-w-0 px-4 py-3 rounded-lg border outline-none focus:ring-2"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--bd)', color: 'var(--txt)' }}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--txt2)' }}>
              Mot de passe
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border outline-none focus:ring-2"
              style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--bd)', color: 'var(--txt)' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 py-3.5 rounded-lg font-bold text-white hover:opacity-90 transition disabled:opacity-60"
            style={{ backgroundColor: 'var(--bord)' }}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--bd)' }} />
          <span className="text-xs" style={{ color: 'var(--txt2)' }}>ou</span>
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--bd)' }} />
        </div>

        <GoogleAuthButton />

        <p className="text-sm text-center mt-6" style={{ color: 'var(--txt2)' }}>
          Pas encore de compte ?{' '}
          <Link href="/inscription" className="font-bold hover:underline" style={{ color: 'var(--or)' }}>
            S'inscrire
          </Link>
        </p>
      </div>
    </main>
  );
}
