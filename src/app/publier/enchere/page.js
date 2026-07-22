'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, X, Camera } from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const API_URL = 'https://kollecta-backend.onrender.com/api';

const CATEGORIES = ['Art', 'Électronique', 'Mode', 'Maison', 'Auto', 'Sport', 'Bijoux', 'Autre'];

const DUREES = [
  { label: '1 heure',   heures: 1 },
  { label: '6 heures',  heures: 6 },
  { label: '12 heures', heures: 12 },
  { label: '1 jour',    heures: 24 },
  { label: '2 jours',   heures: 48 },
  { label: '3 jours',   heures: 72 },
  { label: '7 jours',   heures: 168 },
];

export default function PublierEncherePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    titre: '', description: '', categorie: '', quartier: '', ville: 'Dakar',
    prix_depart: '', duree: 24,
  });
  const [photos,  setPhotos]  = useState([]);
  const [loading, setLoading] = useState(false);
  const [erreur,  setErreur]  = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/connexion');
  }, [authLoading, user]);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const ajouterPhotos = (e) => {
    const fichiers = Array.from(e.target.files || []);
    const restant = 5 - photos.length;
    const nouvelles = fichiers.slice(0, restant).map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    setPhotos(p => [...p, ...nouvelles]);
    e.target.value = '';
  };

  const supprimerPhoto = (index) => setPhotos(p => p.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titre.trim())       return setErreur('Le titre est obligatoire.');
    if (!form.prix_depart)        return setErreur('Le prix de départ est obligatoire.');
    if (!form.quartier.trim())    return setErreur('Le quartier est obligatoire.');
    if (parseInt(form.prix_depart) <= 0) return setErreur('Le prix doit être supérieur à 0.');

    setErreur('');
    setLoading(true);
    try {
      const token = localStorage.getItem('kollecta_token');
      const debut = new Date();
      const fin   = new Date(debut.getTime() + form.duree * 3600000);

      const resEnc = await api.post('/encheres', {
        titre: form.titre.trim(),
        description: form.description.trim(),
        categorie: form.categorie || CATEGORIES[0],
        quartier: form.quartier.trim(),
        ville: form.ville.trim(),
        prix_depart: parseInt(form.prix_depart),
        debut_le: debut.toISOString(),
        fin_le: fin.toISOString(),
      });

      const enchereId = resEnc.enchere.id;

      for (let i = 0; i < photos.length; i++) {
        const formData = new FormData();
        formData.append('photo', photos[i].file);
        formData.append('entite_type', 'enchere');
        formData.append('entite_id', enchereId);
        formData.append('ordre', String(i));

        await fetch(API_URL + '/medias/upload', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + token },
          body: formData,
        });
      }

      router.push(`/encheres/${enchereId}`);
    } catch (err) {
      setErreur(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) return null;

  const dureeSelectionnee = DUREES.find(d => d.heures === form.duree);

  return (
    <main style={{ backgroundColor: 'var(--bg)', minHeight: 'calc(100vh - 73px)' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <Link href="/publier" className="inline-flex items-center gap-2 text-sm font-semibold mb-6 hover:opacity-70" style={{ color: 'var(--txt2)' }}>
          <ArrowLeft size={16} /> Retour
        </Link>

        <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--txt)' }}>🔨 Lancer une enchère</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--txt2)' }}>Vendez au meilleur prix sur Kollecta</p>

        {erreur && (
          <div className="mb-4 px-4 py-3 rounded-lg text-sm font-medium" style={{ backgroundColor: '#FDE8EB', color: '#8B1A2A' }}>
            {erreur}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* PHOTOS */}
          <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--txt2)' }}>Photos ({photos.length}/5)</p>
            <div className="flex gap-3 flex-wrap">
              {photos.map((p, i) => (
                <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.preview} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => supprimerPhoto(i)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center text-xs"
                  >
                    <X size={12} />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded">Principale</span>
                  )}
                </div>
              ))}
              {photos.length < 5 && (
                <label
                  className="w-24 h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer gap-1"
                  style={{ borderColor: 'var(--bd)', backgroundColor: 'var(--card2)' }}
                >
                  <Camera size={22} style={{ color: 'var(--txt3)' }} />
                  <span className="text-[10px]" style={{ color: 'var(--txt3)' }}>Ajouter</span>
                  <input type="file" accept="image/*" multiple onChange={ajouterPhotos} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* INFOS */}
          <div className="rounded-2xl border p-5 flex flex-col gap-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--txt2)' }}>Titre *</label>
              <input
                type="text" required value={form.titre} onChange={(e) => update('titre', e.target.value)}
                placeholder="Ex: Samsung Galaxy A54, Tableau original..."
                className="w-full px-4 py-3 rounded-lg border outline-none focus:ring-2"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--bd)', color: 'var(--txt)' }}
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--txt2)' }}>Catégorie</label>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => update('categorie', cat)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold border transition"
                    style={{
                      backgroundColor: form.categorie === cat ? 'var(--bord)' : 'var(--card2)',
                      borderColor: form.categorie === cat ? 'var(--bord)' : 'var(--bd)',
                      color: form.categorie === cat ? 'white' : 'var(--txt2)',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--txt2)' }}>Description</label>
              <textarea
                value={form.description} onChange={(e) => update('description', e.target.value)}
                placeholder="État, caractéristiques, conditions de vente..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg border outline-none focus:ring-2 resize-none"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--bd)', color: 'var(--txt)' }}
              />
            </div>
          </div>

          {/* PRIX */}
          <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--txt2)' }}>Prix de départ *</p>
            <div className="flex items-center gap-2 border rounded-lg px-4" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--bd)' }}>
              <input
                type="number" required min="1"
                value={form.prix_depart} onChange={(e) => update('prix_depart', e.target.value)}
                placeholder="0"
                className="w-full py-3 outline-none bg-transparent font-extrabold text-2xl"
                style={{ color: 'var(--or)' }}
              />
              <span className="text-sm font-semibold" style={{ color: 'var(--txt2)' }}>FCFA</span>
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--txt3)' }}>Les enchérisseurs devront proposer un montant supérieur</p>
          </div>

          {/* DUREE */}
          <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--txt2)' }}>Durée de l'enchère</p>
            <div className="flex gap-2 flex-wrap mb-3">
              {DUREES.map(d => (
                <button
                  key={d.heures}
                  type="button"
                  onClick={() => update('duree', d.heures)}
                  className="px-3.5 py-2 rounded-full text-xs font-semibold border transition"
                  style={{
                    backgroundColor: form.duree === d.heures ? 'var(--bord)' : 'var(--card2)',
                    borderColor: form.duree === d.heures ? 'var(--bord)' : 'var(--bd)',
                    color: form.duree === d.heures ? 'white' : 'var(--txt2)',
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--orl)' }}>
              <p className="text-xs" style={{ color: 'var(--txt2)' }}>
                ⏱ L'enchère se terminera dans <span className="font-bold" style={{ color: 'var(--or)' }}>{dureeSelectionnee?.label}</span>
              </p>
            </div>
          </div>

          {/* LOCALISATION */}
          <div className="rounded-2xl border p-5 flex flex-col gap-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}>
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--txt2)' }}>Localisation *</p>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--txt2)' }}>Quartier *</label>
              <input
                type="text" required value={form.quartier} onChange={(e) => update('quartier', e.target.value)}
                placeholder="Ex: Plateau, Mermoz..."
                className="w-full px-4 py-3 rounded-lg border outline-none focus:ring-2"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--bd)', color: 'var(--txt)' }}
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--txt2)' }}>Ville</label>
              <input
                type="text" value={form.ville} onChange={(e) => update('ville', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border outline-none focus:ring-2"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--bd)', color: 'var(--txt)' }}
              />
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="py-3.5 rounded-xl font-bold text-white hover:opacity-90 transition disabled:opacity-60"
            style={{ backgroundColor: 'var(--bord)' }}
          >
            {loading ? 'Publication...' : "🔨 Lancer l'enchère"}
          </button>
        </form>
      </div>
    </main>
  );
}
