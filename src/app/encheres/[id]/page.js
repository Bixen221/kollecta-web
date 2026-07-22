'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Star } from 'lucide-react';
import { io } from 'socket.io-client';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const API_URL = 'https://kollecta-backend.onrender.com';

const getTempsRestant = (fin_le) => {
  const diff = new Date(fin_le) - new Date();
  if (diff <= 0) return { texte: 'Terminée', urgent: false };
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (h > 24) return { texte: Math.floor(h / 24) + 'j ' + (h % 24) + 'h', urgent: false };
  if (h > 1)  return { texte: h + 'h ' + m + 'm', urgent: false };
  return { texte: h + 'h ' + m + 'm ' + s + 's', urgent: true };
};

export default function DetailEncherePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [enchere,  setEnchere]  = useState(null);
  const [offres,   setOffres]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [montant,  setMontant]  = useState('');
  const [placing,  setPlacing]  = useState(false);
  const [temps,    setTemps]    = useState(null);
  const [erreur,   setErreur]   = useState('');
  const [photoActive, setPhotoActive] = useState(0);
  const socketRef = useRef(null);

  useEffect(() => {
    charger();
    connecterSocket();
    return () => { if (socketRef.current) socketRef.current.disconnect(); };
  }, [id]);

  useEffect(() => {
    if (!enchere) return;
    const interval = setInterval(() => setTemps(getTempsRestant(enchere.fin_le)), 1000);
    return () => clearInterval(interval);
  }, [enchere]);

  const charger = async () => {
    try {
      const res = await api.get(`/encheres/${id}`);
      setEnchere(res.enchere);
      setOffres(res.offres || []);
      setTemps(getTempsRestant(res.enchere.fin_le));
      setMontant(String(res.enchere.offre_actuelle + 1000));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const connecterSocket = () => {
    try {
      const token = localStorage.getItem('kollecta_token');
      const socket = io(API_URL, { auth: { token }, transports: ['websocket'] });
      socket.on('connect', () => socket.emit('rejoindre_enchere', id));
      socket.on('nouvelle_offre', (data) => {
        setEnchere(prev => ({ ...prev, offre_actuelle: data.montant, meilleur_offrant_id: data.offreur.id, nb_offres: (prev.nb_offres || 0) + 1 }));
        setOffres(prev => [{ ...data, nom: data.offreur.nom, prenom: data.offreur.prenom }, ...prev]);
        setMontant(String(data.montant + 1000));
      });
      socket.on('erreur_offre', (data) => { setErreur(data.message); setPlacing(false); });
      socketRef.current = socket;
    } catch (err) { console.error('Socket error:', err); }
  };

  const handlePlacerOffre = async () => {
    if (!user) return router.push('/connexion');
    const montantNum = parseInt(montant);
    if (!montantNum || montantNum <= enchere.offre_actuelle) {
      return setErreur(`L'offre doit être supérieure à ${enchere.offre_actuelle?.toLocaleString()} FCFA`);
    }
    setErreur('');
    setPlacing(true);
    try {
      if (socketRef.current?.connected) {
        socketRef.current.emit('placer_offre', { enchere_id: id, montant: montantNum });
      } else {
        await api.post(`/encheres/${id}/offrir`, { montant: montantNum });
        charger();
      }
    } catch (err) {
      setErreur(err.message);
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <main className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 73px)', backgroundColor: 'var(--bg)' }}>
        <p style={{ color: 'var(--txt2)' }}>Chargement...</p>
      </main>
    );
  }

  if (!enchere) {
    return (
      <main className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 73px)', backgroundColor: 'var(--bg)' }}>
        <p style={{ color: 'var(--txt2)' }}>Cette enchère n'existe pas ou a été supprimée.</p>
      </main>
    );
  }

  const photos = enchere.photos?.filter(Boolean) || [];
  const estVendeur = user?.id === enchere.vendeur_id;
  const estEnCours = enchere.statut === 'en_cours';
  const estGagnant = enchere.meilleur_offrant_id === user?.id;

  return (
    <main style={{ backgroundColor: 'var(--bg)', minHeight: 'calc(100vh - 73px)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/encheres" className="inline-flex items-center gap-2 text-sm font-semibold mb-6 hover:opacity-70" style={{ color: 'var(--txt2)' }}>
          <ArrowLeft size={16} /> Retour aux enchères
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* PHOTOS */}
          <div>
            <div
              className="h-80 rounded-2xl overflow-hidden flex items-center justify-center border relative"
              style={{ backgroundColor: 'var(--card2)', borderColor: 'var(--bd)' }}
            >
              {photos.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photos[photoActive]} alt={enchere.titre} className="w-full h-full object-cover" />
              ) : (
                <span className="text-7xl">📦</span>
              )}
              {estEnCours && (
                <span className="absolute top-3 left-3 text-white text-xs font-bold px-3 py-1.5 rounded-full" style={{ backgroundColor: 'var(--bord)' }}>
                  🔴 EN DIRECT
                </span>
              )}
            </div>
            {photos.length > 1 && (
              <div className="flex gap-2 mt-3">
                {photos.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setPhotoActive(i)}
                    className="w-16 h-16 rounded-lg overflow-hidden border-2"
                    style={{ borderColor: i === photoActive ? 'var(--or)' : 'var(--bd)' }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INFOS */}
          <div>
            <h1 className="text-2xl font-extrabold mb-2" style={{ color: 'var(--txt)' }}>{enchere.titre}</h1>
            <p className="flex items-center gap-1.5 text-sm mb-6" style={{ color: 'var(--txt2)' }}>
              <MapPin size={15} /> {enchere.quartier}, {enchere.ville}
            </p>

            {/* TIMER */}
            {estEnCours && temps && (
              <div
                className="rounded-2xl p-5 mb-4 text-center border"
                style={{ backgroundColor: temps.urgent ? '#FDE8EB' : 'var(--card2)', borderColor: temps.urgent ? 'var(--bord)' : 'var(--bd)' }}
              >
                <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--txt2)' }}>Temps restant</p>
                <p className="text-3xl font-extrabold" style={{ color: temps.urgent ? '#CC2222' : 'var(--or)' }}>⏱ {temps.texte}</p>
              </div>
            )}

            {/* PRIX */}
            <div
              className="rounded-2xl p-5 mb-6 flex justify-between items-center border"
              style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--txt2)' }}>Offre actuelle</p>
                <p className="text-3xl font-extrabold" style={{ color: 'var(--bord)' }}>{enchere.offre_actuelle?.toLocaleString()} FCFA</p>
                <p className="text-xs mt-1" style={{ color: 'var(--txt2)' }}>🙋 {enchere.nb_offres} enchères</p>
              </div>
              {estGagnant && estEnCours && (
                <span className="px-3 py-2 rounded-xl text-xs font-bold border" style={{ backgroundColor: 'var(--orl)', borderColor: 'var(--or)', color: 'var(--or)' }}>
                  🏆 Vous menez !
                </span>
              )}
            </div>

            {enchere.description && (
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--txt2)' }}>Description</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--txt)' }}>{enchere.description}</p>
              </div>
            )}

            <div className="mb-6 flex items-center gap-3">
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: 'var(--bord)' }}>
                {enchere.prenom?.[0]}{enchere.nom?.[0]}
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: 'var(--txt)' }}>{enchere.prenom} {enchere.nom}</p>
                <p className="flex items-center gap-1 text-xs" style={{ color: 'var(--txt2)' }}>
                  <Star size={12} /> {enchere.note_moyenne}
                </p>
              </div>
            </div>

            {erreur && (
              <div className="mb-4 px-4 py-3 rounded-lg text-sm font-medium" style={{ backgroundColor: '#FDE8EB', color: '#8B1A2A' }}>
                {erreur}
              </div>
            )}

            {!estVendeur && estEnCours && (
              <div className="flex gap-3">
                <div className="flex-1 flex items-center border rounded-xl px-4" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--bd)' }}>
                  <input
                    type="number"
                    value={montant}
                    onChange={(e) => setMontant(e.target.value)}
                    className="w-full py-3 outline-none bg-transparent font-bold text-lg"
                    style={{ color: 'var(--or)' }}
                  />
                  <span className="text-sm font-semibold" style={{ color: 'var(--txt2)' }}>FCFA</span>
                </div>
                <button
                  onClick={handlePlacerOffre}
                  disabled={placing}
                  className="px-6 py-3 rounded-xl font-bold text-white hover:opacity-90 transition disabled:opacity-60"
                  style={{ backgroundColor: 'var(--bord)' }}
                >
                  {placing ? '...' : '🔨 Enchérir'}
                </button>
              </div>
            )}

            {estVendeur && (
              <div className="px-4 py-4 rounded-xl text-sm font-semibold text-center" style={{ backgroundColor: 'var(--card2)', color: 'var(--txt2)' }}>
                Ceci est votre enchère
              </div>
            )}
          </div>
        </div>

        {/* HISTORIQUE */}
        <div className="mt-10">
          <h3 className="text-lg font-extrabold mb-4" style={{ color: 'var(--txt)' }}>Historique des offres</h3>
          {offres.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--txt2)' }}>Aucune offre. Soyez le premier !</p>
          ) : (
            <div className="flex flex-col gap-2">
              {offres.map((o, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl border"
                  style={{
                    backgroundColor: i === 0 ? 'var(--orl)' : 'var(--card)',
                    borderColor: i === 0 ? 'var(--or)' : 'var(--bd)',
                  }}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'var(--card2)', color: 'var(--or)' }}>
                    {o.prenom?.[0]}{o.nom?.[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: 'var(--txt)' }}>{o.prenom} {o.nom}</p>
                    <p className="text-xs" style={{ color: 'var(--txt2)' }}>{new Date(o.cree_le).toLocaleTimeString('fr-SN')}</p>
                  </div>
                  <p className="font-bold" style={{ color: i === 0 ? 'var(--or)' : 'var(--txt2)' }}>
                    {o.montant?.toLocaleString()} FCFA
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
