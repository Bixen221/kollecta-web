'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Gift, Hammer, Search } from 'lucide-react';
import api from '@/services/api';

export default function Accueil() {
  const [dons,     setDons]     = useState([]);
  const [encheres, setEncheres] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const charger = async () => {
      try {
        const [resDons, resEncheres] = await Promise.all([
          api.get('/dons?limite=6'),
          api.get('/encheres?statut=en_cours&limite=6'),
        ]);
        setDons(resDons.dons || []);
        setEncheres(resEncheres.encheres || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    charger();
  }, []);

  return (
    <main style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      {/* HERO */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
        <div
          className="inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-6"
          style={{ backgroundColor: 'var(--orl)', color: 'var(--or)' }}
        >
          ✦ Ensemble on est plus forts
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold mb-6 leading-tight" style={{ color: 'var(--txt)' }}>
          Donnez, recevez,<br />changez des vies
        </h1>
        <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: 'var(--txt2)' }}>
          12 000+ membres actifs au Sénégal partagent nourriture, matériel et participent à des enchères solidaires.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dons"
            className="px-8 py-3.5 rounded-xl font-bold text-white hover:opacity-90 transition"
            style={{ backgroundColor: 'var(--bord)' }}
          >
            🎁 Voir les dons
          </Link>
          <Link
            href="/encheres"
            className="px-8 py-3.5 rounded-xl font-bold border-2 hover:opacity-80 transition"
            style={{ borderColor: 'var(--or)', color: 'var(--or)' }}
          >
            🔨 Voir les enchères
          </Link>
        </div>
      </section>

      {/* STATS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 grid grid-cols-3 gap-4">
        {[['12k+', 'Membres'], ['3 400', 'Dons actifs'], ['847', 'Enchères']].map(([n, l]) => (
          <div
            key={l}
            className="rounded-2xl p-6 text-center border"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}
          >
            <div className="text-2xl sm:text-3xl font-extrabold" style={{ color: 'var(--bord)' }}>{n}</div>
            <div className="text-sm mt-1" style={{ color: 'var(--txt2)' }}>{l}</div>
          </div>
        ))}
      </section>

      {/* DONS RECENTS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold flex items-center gap-2" style={{ color: 'var(--txt)' }}>
            🎁 Dons récents
          </h2>
          <Link href="/dons" className="font-bold text-sm hover:underline" style={{ color: 'var(--bord)' }}>
            Voir tout →
          </Link>
        </div>

        {loading ? (
          <p style={{ color: 'var(--txt2)' }}>Chargement...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {dons.map((don) => (
              <Link
                key={don.id}
                href={`/dons/${don.id}`}
                className="rounded-2xl overflow-hidden border hover:shadow-lg transition block"
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}
              >
                <div
                  className="h-40 flex items-center justify-center relative"
                  style={{ backgroundColor: don.type === 'nourriture' ? '#FFF8E8' : '#EAF5EE' }}
                >
                  {don.photos?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={don.photos[0]} alt={don.titre} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">{don.type === 'nourriture' ? '🍱' : '📦'}</span>
                  )}
                  {don.urgent && (
                    <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      🚨 Urgent
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold mb-1" style={{ color: 'var(--txt)' }}>{don.titre}</h3>
                  <p className="text-sm" style={{ color: 'var(--txt2)' }}>{don.quartier}, {don.ville}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ENCHERES EN COURS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold flex items-center gap-2" style={{ color: 'var(--txt)' }}>
            🔨 Enchères en cours
          </h2>
          <Link href="/encheres" className="font-bold text-sm hover:underline" style={{ color: 'var(--bord)' }}>
            Voir tout →
          </Link>
        </div>

        {loading ? (
          <p style={{ color: 'var(--txt2)' }}>Chargement...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {encheres.map((e) => (
              <Link
                key={e.id}
                href={`/encheres/${e.id}`}
                className="rounded-2xl overflow-hidden border hover:shadow-lg transition block"
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}
              >
                <div className="h-40 flex items-center justify-center relative" style={{ backgroundColor: 'var(--card2)' }}>
                  {e.photos?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={e.photos[0]} alt={e.titre} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">📦</span>
                  )}
                  <span
                    className="absolute top-2 left-2 text-white text-xs font-bold px-2 py-1 rounded-full"
                    style={{ backgroundColor: 'var(--bord)' }}
                  >
                    🔴 DIRECT
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold mb-1" style={{ color: 'var(--txt)' }}>{e.titre}</h3>
                  <p className="font-extrabold" style={{ color: 'var(--bord)' }}>
                    {e.offre_actuelle?.toLocaleString()} FCFA
                  </p>
                  <p className="text-sm" style={{ color: 'var(--txt2)' }}>🙋 {e.nb_offres} enchères</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
