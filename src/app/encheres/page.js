'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import api from '@/services/api';

const getTempsRestant = (fin_le) => {
  const diff = new Date(fin_le) - new Date();
  if (diff <= 0) return 'Terminée';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 24) return Math.floor(h / 24) + 'j ' + (h % 24) + 'h';
  return h + 'h ' + m + 'm';
};

const estReellementTerminee = (e) => e.statut === 'termine' || new Date(e.fin_le) <= new Date();

export default function EncheresPage() {
  const [encheres,  setEncheres]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filtre,    setFiltre]    = useState('Tout');
  const [recherche, setRecherche] = useState('');

  const filtres = ['Tout', 'En cours', 'À venir', 'Terminées'];

  useEffect(() => {
    const charger = async () => {
      setLoading(true);
      try {
        const res = await api.get('/encheres');
        setEncheres(res.encheres || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    charger();
  }, []);

  const encheresFiltres = encheres.filter(e => {
    const correspondRecherche =
      e.titre?.toLowerCase().includes(recherche.toLowerCase()) ||
      e.quartier?.toLowerCase().includes(recherche.toLowerCase()) ||
      e.categorie?.toLowerCase().includes(recherche.toLowerCase());
    if (!correspondRecherche) return false;

    const terminee = estReellementTerminee(e);
    if (filtre === 'En cours')  return !terminee && e.statut === 'en_cours';
    if (filtre === 'À venir')   return e.statut === 'a_venir' && !terminee;
    if (filtre === 'Terminées') return terminee;
    return true;
  });

  return (
    <main style={{ backgroundColor: 'var(--bg)', minHeight: 'calc(100vh - 73px)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-extrabold mb-2" style={{ color: 'var(--txt)' }}>🔨 Enchères</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--txt2)' }}>Misez sur les meilleures offres</p>

        {/* RECHERCHE */}
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-xl border mb-4 max-w-md"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}
        >
          <Search size={16} style={{ color: 'var(--txt3)' }} />
          <input
            type="text"
            placeholder="Rechercher une enchère..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="flex-1 outline-none bg-transparent text-sm"
            style={{ color: 'var(--txt)' }}
          />
        </div>

        {/* FILTRES */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {filtres.map((f) => (
            <button
              key={f}
              onClick={() => setFiltre(f)}
              className="px-4 py-2 rounded-full text-sm font-semibold border transition"
              style={{
                backgroundColor: filtre === f ? 'var(--bord)' : 'var(--card)',
                borderColor: filtre === f ? 'var(--bord)' : 'var(--bd)',
                color: filtre === f ? 'white' : 'var(--txt2)',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* LISTE */}
        {loading ? (
          <p style={{ color: 'var(--txt2)' }}>Chargement...</p>
        ) : encheresFiltres.length === 0 ? (
          <p style={{ color: 'var(--txt2)' }}>
            {recherche ? `Aucun résultat pour "${recherche}"` : 'Aucune enchère disponible.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {encheresFiltres.map((e) => (
              <Link
                key={e.id}
                href={`/encheres/${e.id}`}
                className="rounded-2xl overflow-hidden border hover:shadow-lg transition block"
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}
              >
                <div className="h-44 flex items-center justify-center relative" style={{ backgroundColor: 'var(--card2)' }}>
                  {e.photos?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={e.photos[0]} alt={e.titre} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl">📦</span>
                  )}
                  <span
                    className="absolute top-3 left-3 text-white text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: estReellementTerminee(e) ? 'var(--txt3)' : (e.statut === 'en_cours' ? 'var(--bord)' : 'var(--txt3)') }}
                  >
                    {estReellementTerminee(e) ? 'Terminée' : (e.statut === 'en_cours' ? '🔴 EN DIRECT' : 'À venir')}
                  </span>
                  {!estReellementTerminee(e) && e.statut === 'en_cours' && (
                    <span className="absolute bottom-3 right-3 bg-black/70 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      ⏱ {getTempsRestant(e.fin_le)}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold mb-2" style={{ color: 'var(--txt)' }}>{e.titre}</h3>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs mb-1" style={{ color: 'var(--txt2)' }}>Offre actuelle</p>
                      <p className="font-extrabold text-lg" style={{ color: 'var(--bord)' }}>
                        {e.offre_actuelle?.toLocaleString()} FCFA
                      </p>
                      <p className="text-xs" style={{ color: 'var(--txt2)' }}>🙋 {e.nb_offres} enchères</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
