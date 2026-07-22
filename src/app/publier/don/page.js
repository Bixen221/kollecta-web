'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, X, Camera } from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const API_URL = 'https://kollecta-backend.onrender.com/api';

const CATEGORIES = {
  nourriture: ['Riz & Céréales', 'Légumes & Fruits', 'Viande & Poisson', 'Huile & Épices', 'Lait & Produits laitiers', 'Autre'],
  materiel:   ['Vêtements', 'Scolaire', 'Électronique', 'Mobilier', 'Jouets', 'Autre'],
};

export default function PublierDonPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    type: 'nourriture', titre: '', categorie: '', description: '',
    quartier: '', ville: 'Dakar', quantite: '1', urgent: false,
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
    if (!form.titre.trim())    return setErreur('Le titre est obligatoire.');
    if (!form.quartier.trim()) return setErreur('Le quartier est obligatoire.');

    setErreur('');
    setLoading(true);
    try {
      const token = localStorage.getItem('kollecta_token');

      const resDon = await api.post('/dons', {
        titre: form.titre.trim(),
        description: form.description.trim(),
        type: form.type,
        categorie: form.categorie || CATEGORIES[form.type][0],
        quartier: form.quartier.trim(),
        ville: form.ville.trim(),
        quantite_total: parseInt(form.quantite) || 1,
        urgent: form.urgent,
      });

      const donId = resDon.don.id;

      for (let i = 0; i < photos.length; i++) {
        const formData = new FormData();
        formData.append('photo', photos[i].file);
        formData.append('entite_type', 'don');
        formData.append('entite_id', donId);
        formData.append('ordre', String(i));

        await fetch(API_URL + '/medias/upload', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + token },
          body: formData,
        });
      }

      router.push(`/dons/${donId}`);
    } catch (err) {
      setErreur(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) return null;

  return (
    <main style={{ backgroundColor: 'var(--bg)', minHeight: 'calc(100vh - 73px)' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <Link href="/publier" className="inline-flex items-center gap-2 text-sm font-semibold mb-6 hover:opacity-70" style={{ color: 'var(--txt2)' }}>
          <ArrowLeft size={16} /> Retour
        </Link>

        <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--txt)' }}>🎁 Publier un don</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--txt2)' }}>Partagez avec la communauté Kollecta</p>

        {erreur && (
          <div className="mb-4 px-4 py-3 rounded-lg text-sm font-medium" style={{ backgroundColor: '#FDE8EB', color: '#8B1A2A' }}>
            {erreur}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* TYPE */}
          <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--txt2)' }}>Type de don *</p>
            <div className="grid grid-cols-2 gap-3">
              {[['nourriture', '🍱', 'Nourriture'], ['materiel', '📦', 'Matériel']].map(([val, emoji, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => { update('type', val); update('categorie', ''); }}
                  className="flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition"
                  style={{
                    borderColor: form.type === val ? 'var(--or)' : 'var(--bd)',
                    backgroundColor: form.type === val ? 'var(--orl)' : 'var(--card2)',
                  }}
                >
                  <span className="text-2xl">{emoji}</span>
                  <span className="text-sm font-bold" style={{ color: form.type === val ? 'var(--or)' : 'var(--txt2)' }}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* PHOTOS */}
          <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}>
            <div className="flex justify-between items-center mb-3">
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--txt2)' }}>Photos ({photos.length}/5)</p>
            </div>
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
                placeholder="Ex: Riz basmati 25 kg, Livres scolaires..."
                className="w-full px-4 py-3 rounded-lg border outline-none focus:ring-2"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--bd)', color: 'var(--txt)' }}
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--txt2)' }}>Catégorie</label>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES[form.type].map(cat => (
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
                placeholder="Quantité, état, conditions de récupération..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg border outline-none focus:ring-2 resize-none"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--bd)', color: 'var(--txt)' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--txt2)' }}>Quantité</label>
                <input
                  type="number" min="1" value={form.quantite} onChange={(e) => update('quantite', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border outline-none focus:ring-2"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--bd)', color: 'var(--txt)' }}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--txt2)' }}>Urgent ?</label>
                <button
                  type="button"
                  onClick={() => update('urgent', !form.urgent)}
                  className="w-full px-4 py-3 rounded-lg border font-semibold text-sm"
                  style={{
                    backgroundColor: form.urgent ? '#FDE8EB' : 'var(--bg)',
                    borderColor: form.urgent ? '#CC2222' : 'var(--bd)',
                    color: form.urgent ? '#CC2222' : 'var(--txt2)',
                  }}
                >
                  {form.urgent ? '🚨 Oui, urgent' : 'Non urgent'}
                </button>
              </div>
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
            style={{ backgroundColor: 'var(--or)', color: '#0E0A08' }}
          >
            {loading ? 'Publication...' : 'Publier le don ✓'}
          </button>
        </form>
      </div>
    </main>
  );
}
