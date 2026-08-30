'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/services/api';

const getTempsRestant = (fin_le) => {
  const diff = new Date(fin_le) - new Date();
  if (diff <= 0) return 'Terminée';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (h > 24) return Math.floor(h / 24) + 'j ' + (h % 24) + 'h';
  if (h >= 1) return h + 'h ' + m + 'm';
  return m + 'm ' + s + 's';
};

const estReellementTerminee = (e) => e.statut === 'termine' || new Date(e.fin_le) <= new Date();

export default function EncheresPage() {
  const [encheres,  setEncheres]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filtre,    setFiltre]    = useState('Tout');
  const [recherche, setRecherche] = useState('');
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [prixMin,   setPrixMin]   = useState('');
  const [prixMax,   setPrixMax]   = useState('');
  const [ville,     setVille]     = useState('');
  const [tri,       setTri]       = useState('recent');
  const [page,      setPage]      = useState(1);
  const parPage = 12;

  const filtres = ['Tout', 'En cours', 'À venir', 'Terminées'];

  useEffect(() => { setPage(1); }, [filtre, recherche, prixMin, prixMax, ville, tri]);

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

  const villesDisponibles = [...new Set(encheres.map(e => e.ville).filter(Boolean))];

  let encheresFiltrees = encheres.filter(e => {
    const correspondRecherche =
      e.titre?.toLowerCase().includes(recherche.toLowerCase()) ||
      e.quartier?.toLowerCase().includes(recherche.toLowerCase()) ||
      e.categorie?.toLowerCase().includes(recherche.toLowerCase());
    if (!correspondRecherche) return false;

    const terminee = estReellementTerminee(e);
    if (filtre === 'En cours'  && (terminee || e.statut !== 'en_cours')) return false;
    if (filtre === 'À venir'   && (terminee || e.statut !== 'a_venir')) return false;
    if (filtre === 'Terminées' && !terminee) return false;

    if (prixMin && e.offre_actuelle < parseInt(prixMin)) return false;
    if (prixMax && e.offre_actuelle > parseInt(prixMax)) return false;
    if (ville && e.ville !== ville) return false;

    return true;
  });

  encheresFiltrees = [...encheresFiltrees].sort((a, b) => {
    if (tri === 'recent')       return new Date(b.cree_le) - new Date(a.cree_le);
    if (tri === 'ancien')       return new Date(a.cree_le) - new Date(b.cree_le);
    if (tri === 'prix_asc')     return a.offre_actuelle - b.offre_actuelle;
    if (tri === 'prix_desc')    return b.offre_actuelle - a.offre_actuelle;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(encheresFiltrees.length / parPage));
  const encheresPage = encheresFiltrees.slice((page - 1) * parPage, page * parPage);

  const reinitialiserFiltres = () => {
    setPrixMin(''); setPrixMax(''); setVille(''); setTri('recent');
  };

  const filtresActifs = prixMin || prixMax || ville || tri !== 'recent';

  return (
    <main style={{ backgroundColor: 'var(--bg)', minHeight: 'calc(100vh - 73px)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-extrabold mb-2" style={{ color: 'var(--txt)' }}>🔨 Enchères</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--txt2)' }}>Misez sur les meilleures offres</p>

        <div className="flex items-center gap-2 mb-4 flex-wrap w-full sm:max-w-2xl sm:flex-nowrap">
          <div
            className="flex-1 min-w-[140px] flex items-center gap-2 px-4 py-3 rounded-xl border"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}
          >
            <Search size={16} style={{ color: 'var(--txt3)' }} />
            <input
              type="text"
              placeholder="Rechercher une enchère..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="flex-1 min-w-0 outline-none bg-transparent text-sm"
              style={{ color: 'var(--txt)' }}
            />
          </div>
          <button
            type="button"
            className="btn-action shrink-0 px-3 sm:px-5 py-3 rounded-xl font-bold text-white text-sm transition flex items-center gap-2"
          >
            <Search size={16} className="sm:hidden" />
            <span className="hidden sm:inline">Rechercher</span>
          </button>
          <button
            type="button"
            onClick={() => setFiltresOuverts(!filtresOuverts)}
            className="hover-surface shrink-0 flex items-center gap-2 px-3 sm:px-4 py-3 rounded-xl border text-sm font-bold transition relative"
            style={{ borderColor: filtresActifs ? 'var(--or)' : 'var(--bd)', color: filtresActifs ? 'var(--or)' : 'var(--txt2)' }}
          >
            <SlidersHorizontal size={16} /> <span className="hidden sm:inline">Filtres</span>
            {filtresActifs && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--bord)' }} />
            )}
          </button>
        </div>

        {filtresOuverts && (
          <div className="rounded-2xl border p-5 mb-6 max-w-2xl" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--txt2)' }}>Prix minimum (FCFA)</label>
                <input
                  type="number" placeholder="0" value={prixMin} onChange={(e) => setPrixMin(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border outline-none text-sm"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--bd)', color: 'var(--txt)' }}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--txt2)' }}>Prix maximum (FCFA)</label>
                <input
                  type="number" placeholder="Aucune limite" value={prixMax} onChange={(e) => setPrixMax(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border outline-none text-sm"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--bd)', color: 'var(--txt)' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--txt2)' }}>Ville</label>
                <select
                  value={ville} onChange={(e) => setVille(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border outline-none text-sm"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--bd)', color: 'var(--txt)' }}
                >
                  <option value="">Toutes les villes</option>
                  {villesDisponibles.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--txt2)' }}>Trier par</label>
                <select
                  value={tri} onChange={(e) => setTri(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border outline-none text-sm"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--bd)', color: 'var(--txt)' }}
                >
                  <option value="recent">Plus récentes</option>
                  <option value="ancien">Plus anciennes</option>
                  <option value="prix_asc">Prix croissant</option>
                  <option value="prix_desc">Prix décroissant</option>
                </select>
              </div>
            </div>

            {filtresActifs && (
              <button
                onClick={reinitialiserFiltres}
                className="text-xs font-bold hover:underline"
                style={{ color: 'var(--bord)' }}
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}

        <div className="flex gap-2 mb-8 flex-wrap">
          {filtres.map((f) => (
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
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: 'var(--txt2)' }}>Chargement...</p>
        ) : encheresFiltrees.length === 0 ? (
          <p style={{ color: 'var(--txt2)' }}>
            {recherche ? `Aucun résultat pour "${recherche}"` : 'Aucune enchère disponible.'}
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {encheresPage.map((e) => (
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

        {!loading && encheresFiltrees.length > parPage && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="hover-surface flex items-center gap-1 px-3 py-2 rounded-lg border text-sm font-semibold disabled:opacity-40 transition"
              style={{ borderColor: 'var(--bd)', color: 'var(--txt2)' }}
            >
              <ChevronLeft size={16} /> Précédent
            </button>
            <span className="text-sm font-semibold" style={{ color: 'var(--txt2)' }}>
              Page {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="hover-surface flex items-center gap-1 px-3 py-2 rounded-lg border text-sm font-semibold disabled:opacity-40 transition"
              style={{ borderColor: 'var(--bd)', color: 'var(--txt2)' }}
            >
              Suivant <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
