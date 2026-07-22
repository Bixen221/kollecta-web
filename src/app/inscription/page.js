'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import SelecteurPays from '@/components/SelecteurPays';
import { PAYS, paysParDefaut } from '@/data/pays';

export default function InscriptionPage() {
  const { inscription } = useAuth();
  const router = useRouter();
  const [pays, setPays] = useState(paysParDefaut);
  const [form, setForm] = useState({
    nom: '', prenom: '', numeroLocal: '', password: '', confirmPassword: '', quartier: '', ville: paysParDefaut.capitale,
  });
  const [erreur,  setErreur]  = useState('');
  const [loading, setLoading] = useState(false);
  const [voirPassword,        setVoirPassword]        = useState(false);
  const [voirConfirmPassword, setVoirConfirmPassword] = useState(false);

  useEffect(() => {
    try {
      const locale = navigator.language || 'fr-SN';
      const codePays = locale.split('-')[1]?.toUpperCase();
      const trouve = PAYS.find(p => p.code === codePays);
      if (trouve) {
        setPays(trouve);
        setForm(f => ({ ...f, ville: trouve.capitale }));
      }
    } catch (e) {}
  }, []);

  const handleChangerPays = (nouveauPays) => {
    setPays(nouveauPays);
    setForm(f => ({ ...f, numeroLocal: '', ville: nouveauPays.capitale }));
  };

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleNumeroChange = (val) => {
    const chiffres = val.replace(/\D/g, '').slice(0, pays.longueur);
    update('numeroLocal', chiffres);
  };

  const critereLongueur = form.password.length >= 4;
  const motsDePasseIdentiques = form.password.length > 0 && form.password === form.confirmPassword;
  const numeroComplet = form.numeroLocal.length === pays.longueur;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');

    if (!numeroComplet) {
      return setErreur(`Le numéro doit contenir ${pays.longueur} chiffres pour ${pays.nom}.`);
    }
    if (!critereLongueur) {
      return setErreur('Le mot de passe doit contenir au moins 4 caractères.');
    }
    if (form.password !== form.confirmPassword) {
      return setErreur('Les mots de passe ne correspondent pas.');
    }

    setLoading(true);
    try {
      const whatsapp = pays.indicatif + form.numeroLocal;
      await inscription({
        nom:      form.nom,
        prenom:   form.prenom,
        whatsapp,
        password: form.password,
        quartier: form.quartier,
        ville:    form.ville,
      });
      router.push('/');
    } catch (err) {
      setErreur(err.message);
    } finally {
      setLoading(false);
    }
  };

  const Critere = ({ valide, texte }) => (
    <div className="flex items-center gap-1.5 text-xs" style={{ color: valide ? 'var(--gr)' : 'var(--txt3)' }}>
      {valide ? <Check size={13} /> : <X size={13} />}
      {texte}
    </div>
  );

  return (
    <main
      className="min-h-[calc(100vh-73px)] flex items-center justify-center px-4 py-10"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl border p-8"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}
      >
        <h1 className="text-2xl font-extrabold mb-2 text-center" style={{ color: 'var(--txt)' }}>
          Rejoignez Kollecta
        </h1>
        <p className="text-sm text-center mb-8" style={{ color: 'var(--txt2)' }}>
          Créez votre compte en quelques secondes
        </p>

        {erreur && (
          <div className="mb-4 px-4 py-3 rounded-lg text-sm font-medium" style={{ backgroundColor: '#FDE8EB', color: '#8B1A2A' }}>
            {erreur}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--txt2)' }}>Prénom</label>
              <input
                type="text" required value={form.prenom} onChange={(e) => update('prenom', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border outline-none focus:ring-2"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--bd)', color: 'var(--txt)' }}
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--txt2)' }}>Nom</label>
              <input
                type="text" required value={form.nom} onChange={(e) => update('nom', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border outline-none focus:ring-2"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--bd)', color: 'var(--txt)' }}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--txt2)' }}>Numéro WhatsApp</label>
            <div className="flex gap-2">
              <SelecteurPays paysSelectionne={pays} onChange={handleChangerPays} />
              <input
                type="tel" placeholder={'X'.repeat(pays.longueur)} required
                value={form.numeroLocal} onChange={(e) => handleNumeroChange(e.target.value)}
                className="flex-1 min-w-0 px-4 py-3 rounded-lg border outline-none focus:ring-2"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--bd)', color: 'var(--txt)' }}
              />
            </div>
            {form.numeroLocal.length > 0 && (
              <p className="text-xs mt-1.5" style={{ color: numeroComplet ? 'var(--gr)' : 'var(--txt3)' }}>
                {form.numeroLocal.length}/{pays.longueur} chiffres
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--txt2)' }}>Mot de passe</label>
            <div className="relative">
              <input
                type={voirPassword ? 'text' : 'password'} placeholder="4 caractères minimum" required
                value={form.password} onChange={(e) => update('password', e.target.value)}
                className="w-full px-4 py-3 pr-11 rounded-lg border outline-none focus:ring-2"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--bd)', color: 'var(--txt)' }}
              />
              <button
                type="button"
                onClick={() => setVoirPassword(!voirPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--txt3)' }}
              >
                {voirPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {form.password.length > 0 && (
              <div className="mt-2">
                <Critere valide={critereLongueur} texte="4 caractères minimum" />
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--txt2)' }}>Confirmer le mot de passe</label>
            <div className="relative">
              <input
                type={voirConfirmPassword ? 'text' : 'password'} placeholder="Retapez le mot de passe" required
                value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)}
                className="w-full px-4 py-3 pr-11 rounded-lg border outline-none focus:ring-2"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--bd)', color: 'var(--txt)' }}
              />
              <button
                type="button"
                onClick={() => setVoirConfirmPassword(!voirConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--txt3)' }}
              >
                {voirConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {form.confirmPassword.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2 text-xs" style={{ color: motsDePasseIdentiques ? 'var(--gr)' : '#CC2222' }}>
                {motsDePasseIdentiques ? <Check size={13} /> : <X size={13} />}
                {motsDePasseIdentiques ? 'Les mots de passe correspondent' : 'Les mots de passe ne correspondent pas'}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--txt2)' }}>Quartier</label>
              <input
                type="text" placeholder="Plateau..." value={form.quartier} onChange={(e) => update('quartier', e.target.value)}
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
            className="mt-2 py-3.5 rounded-lg font-bold text-white hover:opacity-90 transition disabled:opacity-60"
            style={{ backgroundColor: 'var(--bord)' }}
          >
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-sm text-center mt-6" style={{ color: 'var(--txt2)' }}>
          Déjà un compte ?{' '}
          <Link href="/connexion" className="font-bold hover:underline" style={{ color: 'var(--or)' }}>
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  );
}
