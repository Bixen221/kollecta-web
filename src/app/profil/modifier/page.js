'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Camera } from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const API_URL = 'https://kollecta-backend.onrender.com/api';

export default function ModifierProfilPage() {
  const { user, loading: authLoading, setUser } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ nom: '', prenom: '', whatsapp: '', quartier: '', ville: '' });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile,    setAvatarFile]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [erreur,  setErreur]  = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/connexion');
    if (user) {
      setForm({
        nom: user.nom || '', prenom: user.prenom || '', whatsapp: user.whatsapp || '',
        quartier: user.quartier || '', ville: user.ville || '',
      });
      setAvatarPreview(user.avatar_url || null);
    }
  }, [authLoading, user]);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    setLoading(true);
    try {
      if (avatarFile) {
        const token = localStorage.getItem('kollecta_token');
        const formData = new FormData();
        formData.append('photo', avatarFile);
        formData.append('entite_type', 'avatar');
        formData.append('entite_id', user.id);
        formData.append('ordre', '0');

        const res = await fetch(API_URL + '/medias/upload', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + token },
          body: formData,
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
      }

      const res = await api.put('/auth/profil', form);
      setUser(res.user);
      router.push('/profil');
    } catch (err) {
      setErreur(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) return null;

  return (
    <main style={{ backgroundColor: 'var(--bg)', minHeight: 'calc(100vh - 73px)' }}>
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-10">
        <Link href="/profil" className="inline-flex items-center gap-2 text-sm font-semibold mb-6 hover:opacity-70" style={{ color: 'var(--txt2)' }}>
          <ArrowLeft size={16} /> Retour
        </Link>

        <h1 className="text-2xl font-extrabold mb-8" style={{ color: 'var(--txt)' }}>✏️ Modifier mon profil</h1>

        {erreur && (
          <div className="mb-4 px-4 py-3 rounded-lg text-sm font-medium" style={{ backgroundColor: '#FDE8EB', color: '#8B1A2A' }}>
            {erreur}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* AVATAR */}
          <div className="flex flex-col items-center mb-4">
            <label className="relative cursor-pointer">
              <div
                className="w-24 h-24 rounded-full border-2 flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: 'var(--card2)', borderColor: 'var(--or)' }}
              >
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-extrabold" style={{ color: 'var(--or)' }}>{form.prenom?.[0]}{form.nom?.[0]}</span>
                )}
              </div>
              <div
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full border-2 flex items-center justify-center"
                style={{ backgroundColor: 'var(--or)', borderColor: 'var(--bg)' }}
              >
                <Camera size={14} style={{ color: '#0E0A08' }} />
              </div>
              <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
            </label>
            <p className="text-xs mt-3" style={{ color: 'var(--txt2)' }}>Cliquez pour changer la photo</p>
          </div>

          <div className="rounded-2xl border p-5 flex flex-col gap-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}>
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--txt2)' }}>Informations personnelles</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--txt2)' }}>Prénom</label>
                <input
                  type="text" value={form.prenom} onChange={(e) => update('prenom', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border outline-none focus:ring-2"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--bd)', color: 'var(--txt)' }}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--txt2)' }}>Nom</label>
                <input
                  type="text" value={form.nom} onChange={(e) => update('nom', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border outline-none focus:ring-2"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--bd)', color: 'var(--txt)' }}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--txt2)' }}>WhatsApp</label>
              <input
                type="tel" value={form.whatsapp} onChange={(e) => update('whatsapp', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border outline-none focus:ring-2"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--bd)', color: 'var(--txt)' }}
              />
            </div>
          </div>

          <div className="rounded-2xl border p-5 flex flex-col gap-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}>
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--txt2)' }}>Localisation</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--txt2)' }}>Quartier</label>
                <input
                  type="text" value={form.quartier} onChange={(e) => update('quartier', e.target.value)}
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
          </div>

          <button
            type="submit" disabled={loading}
            className="py-3.5 rounded-xl font-bold text-white hover:opacity-90 transition disabled:opacity-60"
            style={{ backgroundColor: 'var(--or)', color: '#0E0A08' }}
          >
            {loading ? 'Sauvegarde...' : 'Sauvegarder ✓'}
          </button>
        </form>
      </div>
    </main>
  );
}
