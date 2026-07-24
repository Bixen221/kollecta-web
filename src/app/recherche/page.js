'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search } from 'lucide-react';
import api from '@/services/api';

function RecherchePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const requeteInitiale = searchParams.get('q') || '';

  const [requete,   setRequete]   = useState(requeteInitiale);
  const [dons,      setDons]      = useState([]);
  const [encheres,  setEncheres]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filtre,    setFiltre]    = useState('Tout');

  useEffect(() => {
    const charger = async () => {
      setLoading(true);
      try {
        const [resDons, resEncheres] = await Promise.all([
          api.get('/dons'),
          api.get('/encheres'),
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

  useEffect(() => {
    setRequete(requeteInitiale);
  }, [requeteInitiale]);

  const q = requete.toLowerCase().trim();

  const handleChange = (val) => {
    setRequete(val);
    if (val.trim()) {
      router.replace(`/recherche?q=${encodeURIComponent(val)}`);
    } else {
      router.replace('/recherche');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (requete.trim()) router.replace(`/recherche?q=${encodeURIComponent(requete)}`);
  };

  const donsFiltres = q ? dons.filter(d =>
    d.titre?.toLowerCase().includes(q) ||
    d.quartier?.toLowerCase().includes(q) ||
    d.categorie?.toLowerCase().includes(q) ||
    d.description?.toLowerCase().includes(q)
  ) : [];
  const encheresFiltrees = q ? encheres.filter(e =>
    e.titre?.toLowerCase().includes(q) ||
    e.quartier?.toLowerCase().includes(q) ||
    e.categorie?.toLowerCase().includes(q) ||
    e.description?.toLowerCase().includes(q)
  ) : [];

  const totalResultats = donsFiltres.length + encheresFiltrees.length;
  const afficherDons     = filtre === 'Tout' || filtre === 'Dons';
  const afficherEncheres = filtre === 'Tout' || filtre === 'Enchères';

  return (
    <main style={{ backgroundColor: 'var(--bg)', minHeight: 'calc(100vh - 73px)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-extrabold mb-2" style={{ color: 'var(--txt)' }}>🔍 Recherche</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--txt2)' }}>Cherchez parmi les dons et les enchères</p>

        <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-6 max-w-xl">
          <div
            className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}
          >
            <Search size={16} style={{ color: 'var(--txt3)' }} />
            <input
              type="text"
              placeholder="Rechercher un don ou une enchère..."
              value={requete}
              onChange={(e) => handleChange(e.target.value)}
              className="flex-1 outline-none bg-transparent text-sm"
              style={{ color: 'var(--txt)' }}
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="btn-action px-5 py-3 rounded-xl font-bold text-white text-sm transition"
          >
            Rechercher
          </button>
        </form>

        {q && totalResultats > 0 && (
          <div className="flex gap-2 mb-8 flex-wrap">
            {['Tout', 'Dons', 'Enchères'].map((f) => (
              <button
                key={f}
                onClick={() => setFiltre(f)}
                className="btn-hover-fade px-4 py-2 rounded-full text-sm font-semibold border transition"
                style={{
                  backgroundColor: filtre === f ? 'var(--bord)' : 'var(--card)',
                  borderColor: filtre === f ? 'var(--bord)' : 'var(--bd)',
                  color: filtre === f ? 'white' : 'var(--txt2)',
                }}
              >
                {f === 'Dons' ? `Dons (${donsFiltres.length})` : f === 'Enchères' ? `Enchères (${encheresFiltrees.length})` : `Tout (${totalResultats})`}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <p style={{ color: 'var(--txt2)' }}>Chargement...</p>
        ) : !q ? (
          <p style={{ color: 'var(--txt2)' }}>Tapez quelque chose pour commencer votre recherche.</p>
        ) : totalResultats === 0 ? (
          <p style={{ color: 'var(--txt2)' }}>Aucun résultat pour "{requete}".</p>
        ) : (
          <>
            {afficherDons && donsFiltres.length > 0 && (
              <div className="mb-10">
                <h2 className="text-lg font-extrabold mb-4" style={{ color: 'var(--txt)' }}>
                  🎁 Dons ({donsFiltres.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {donsFiltres.map((don) => (
                    <Link
                      key={don.id}
                      href={`/dons/${don.id}`}
                      className="rounded-2xl overflow-hidden border hover:shadow-lg transition block"
                      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}
                    >
                      <div
                        className="h-36 flex items-center justify-center"
                        style={{ backgroundColor: don.type === 'nourriture' ? '#FFF8E8' : '#EAF5EE' }}
                      >
                        {don.photos?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={don.photos[0]} alt={don.titre} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-4xl">{don.type === 'nourriture' ? '🍱' : '📦'}</span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold mb-1" style={{ color: 'var(--txt)' }}>{don.titre}</h3>
                        <p className="text-sm" style={{ color: 'var(--txt2)' }}>{don.quartier}, {don.ville}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {afficherEncheres && encheresFiltrees.length > 0 && (
              <div>
                <h2 className="text-lg font-extrabold mb-4" style={{ color: 'var(--txt)' }}>
                  🔨 Enchères ({encheresFiltrees.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {encheresFiltrees.map((e) => (
                    <Link
                      key={e.id}
                      href={`/encheres/${e.id}`}
                      className="rounded-2xl overflow-hidden border hover:shadow-lg transition block"
                      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}
                    >
                      <div className="h-36 flex items-center justify-center" style={{ backgroundColor: 'var(--card2)' }}>
                        {e.photos?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={e.photos[0]} alt={e.titre} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-4xl">📦</span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold mb-1" style={{ color: 'var(--txt)' }}>{e.titre}</h3>
                        <p className="font-extrabold" style={{ color: 'var(--bord)' }}>
                          {e.offre_actuelle?.toLocaleString()} FCFA
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default function RecherchePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: 'calc(100vh - 73px)', backgroundColor: 'var(--bg)' }} />}>
      <RecherchePageContent />
    </Suspense>
  );
}
