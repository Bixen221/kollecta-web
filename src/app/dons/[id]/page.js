'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Star, ChevronRight, MessageCircle } from 'lucide-react';
import BoutonPartager from '@/components/BoutonPartager';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useReservations } from '@/context/ReservationsContext';
import { Send } from 'lucide-react';

export default function DetailDonPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { estReserve, getReservation, charger: rechargerResas } = useReservations();
  const [don,     setDon]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [photoActive, setPhotoActive] = useState(0);
  const [zoomOuvert, setZoomOuvert] = useState(false);
  const [erreur, setErreur] = useState('');
  const [candidats, setCandidats] = useState([]);
  const [choixEnCours, setChoixEnCours] = useState(null);

  useEffect(() => {
    const charger = async () => {
      try {
        const res = await api.get(`/dons/${id}`);
        setDon(res.don);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    charger();
  }, [id]);

  useEffect(() => {
    if (!don || !user || don.proprietaire_id !== user.id) return;
    const chargerCandidats = async () => {
      try {
        const res = await api.get(`/dons/${id}/candidats`);
        setCandidats(res.candidats || []);
      } catch (err) {
        console.error(err);
      }
    };
    chargerCandidats();
  }, [don, user, id]);

  const handleReserver = async () => {
    if (!user) return router.push('/connexion');
    setErreur('');
    try {
      await api.post(`/dons/${id}/reserver`);
      await rechargerResas();
    } catch (err) {
      setErreur(err.message);
    }
  };

  const handleAnnuler = async () => {
    const resa = getReservation(id);
    if (!resa) return;
    if (!confirm('Voulez-vous annuler votre réservation ?')) return;
    try {
      await api.post(`/dons/reservations/${resa.id}/confirmer`, { role: 'annuler' });
      await rechargerResas();
    } catch (err) {
      setErreur(err.message);
    }
  };

  const handleContacter = async () => {
    if (!user) return router.push('/connexion');
    setErreur('');
    try {
      const res = await api.post('/messages/demarrer', { entite_type: 'don', entite_id: id });
      router.push(`/messages/${res.conversation.id}`);
    } catch (err) {
      setErreur(err.message);
    }
  };

  const handleChoisir = async (reservationId) => {
    if (!confirm('Confirmer ce choix ? Les autres candidats en attente seront automatiquement refusés si c\'était la dernière disponibilité.')) return;
    setChoixEnCours(reservationId);
    try {
      await api.post(`/dons/reservations/${reservationId}/choisir`);
      const res = await api.get(`/dons/${id}/candidats`);
      setCandidats(res.candidats || []);
      const resDon = await api.get(`/dons/${id}`);
      setDon(resDon.don);
    } catch (err) {
      alert(err.message);
    } finally {
      setChoixEnCours(null);
    }
  };

  const handleContacterCandidat = async (demandeurId) => {
    try {
      const res = await api.post('/messages/demarrer', { entite_type: 'don', entite_id: id, demandeur_id: demandeurId });
      router.push(`/messages/${res.conversation.id}`);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <main className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 73px)', backgroundColor: 'var(--bg)' }}>
        <p style={{ color: 'var(--txt2)' }}>Chargement...</p>
      </main>
    );
  }

  if (!don) {
    return (
      <main className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 73px)', backgroundColor: 'var(--bg)' }}>
        <p style={{ color: 'var(--txt2)' }}>Ce don n'existe pas ou a été supprimé.</p>
      </main>
    );
  }

  const photos = don.photos?.filter(Boolean) || [];
  const estProprio = user?.id === don.proprietaire_id;
  const plusDispo = don.quantite_dispo <= 0;
  const pourcent = Math.round((1 - don.quantite_dispo / don.quantite_total) * 100);

  return (
    <main style={{ backgroundColor: 'var(--bg)', minHeight: 'calc(100vh - 73px)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/dons" className="inline-flex items-center gap-2 text-sm font-semibold hover:opacity-70" style={{ color: 'var(--txt2)' }}>
            <ArrowLeft size={16} /> Retour aux dons
          </Link>
          <BoutonPartager titre={don?.titre} texte={`Découvrez ce don sur Kollecta : ${don?.titre}`} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div
              onClick={() => photos.length > 0 && setZoomOuvert(true)}
              className="h-80 rounded-2xl overflow-hidden flex items-center justify-center border"
              style={{
                backgroundColor: don.type === 'nourriture' ? '#FFF8E8' : '#EAF5EE',
                borderColor: 'var(--bd)',
                cursor: photos.length > 0 ? 'zoom-in' : 'default',
              }}
            >
              {photos.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photos[photoActive]} alt={don.titre} className="w-full h-full object-cover" />
              ) : (
                <span className="text-7xl">{don.type === 'nourriture' ? '🍱' : '📦'}</span>
              )}
            </div>

            {zoomOuvert && (
              <div
                onClick={() => setZoomOuvert(false)}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                style={{ backgroundColor: 'rgba(0,0,0,0.9)', cursor: 'zoom-out' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photos[photoActive]} alt={don.titre} className="max-w-full max-h-full object-contain rounded-lg" />
              </div>
            )}
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

          <div>
            <div className="flex gap-2 mb-3 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: 'var(--orl)', color: 'var(--or)' }}>
                {don.categorie || don.type}
              </span>
              {don.urgent && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">🚨 Urgent</span>
              )}
            </div>

            <h1 className="text-2xl font-extrabold mb-2" style={{ color: 'var(--txt)' }}>{don.titre}</h1>
            <p className="flex items-center gap-1.5 text-sm mb-6" style={{ color: 'var(--txt2)' }}>
              <MapPin size={15} /> {don.quartier}, {don.ville}
            </p>

            {don.description && (
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--txt2)' }}>Description</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--txt)' }}>{don.description}</p>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--txt2)' }}>Disponibilité</h3>
              <div className="h-2 rounded-full overflow-hidden mb-2" style={{ backgroundColor: 'var(--bd)' }}>
                <div className="h-full rounded-full" style={{ width: `${pourcent}%`, backgroundColor: 'var(--gr)' }} />
              </div>
              <p className="text-sm" style={{ color: 'var(--txt2)' }}>{don.quantite_dispo}/{don.quantite_total} disponibles</p>
            </div>

            <Link
              href={`/profil-public/${don.proprietaire_id}?nom=${encodeURIComponent(don.nom)}&prenom=${encodeURIComponent(don.prenom)}`}
              className="mb-6 flex items-center gap-3 hover:opacity-80 transition"
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: 'var(--bord)' }}
              >
                {don.prenom?.[0]}{don.nom?.[0]}
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm" style={{ color: 'var(--txt)' }}>{don.prenom} {don.nom}</p>
                <p className="flex items-center gap-1 text-xs" style={{ color: 'var(--txt2)' }}>
                  <Star size={12} /> {don.note_moyenne} · {don.nb_dons} dons
                </p>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--txt3)' }} />
            </Link>

            {erreur && (
              <div className="mb-4 px-4 py-3 rounded-lg text-sm font-medium" style={{ backgroundColor: '#FDE8EB', color: '#8B1A2A' }}>
                {erreur}
              </div>
            )}

            {!estProprio && (
              <button
                onClick={handleContacter}
                className="w-full mb-3 py-3 rounded-xl font-bold border flex items-center justify-center gap-2 hover-surface transition"
                style={{ borderColor: 'var(--bd)', color: 'var(--txt)' }}
              >
                <MessageCircle size={18} /> Contacter le propriétaire
              </button>
            )}

            {estProprio && candidats.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--txt2)' }}>
                  Candidats ({candidats.length})
                </h3>
                <div className="flex flex-col gap-3">
                  {candidats.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-xl border p-4"
                      style={{
                        backgroundColor: c.statut === 'confirme_proprio' ? 'var(--grl)' : c.statut === 'refuse' ? 'var(--card2)' : 'var(--card)',
                        borderColor: c.statut === 'confirme_proprio' ? 'var(--gr)' : 'var(--bd)',
                        opacity: c.statut === 'refuse' ? 0.6 : 1,
                      }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ backgroundColor: 'var(--bord)' }}>
                          {c.prenom?.[0]}{c.nom?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm" style={{ color: 'var(--txt)' }}>{c.prenom} {c.nom}</p>
                          <p className="text-xs" style={{ color: 'var(--txt2)' }}>{c.quartier}, {c.ville}</p>
                        </div>
                        <p className="text-xs shrink-0" style={{ color: 'var(--txt3)' }}>
                          {new Date(c.cree_le).toLocaleDateString('fr-SN')} à {new Date(c.cree_le).toLocaleTimeString('fr-SN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {c.statut === 'contacte' || c.statut === 'confirme_proprio' || c.statut === 'confirme_demandeur' || c.statut === 'cloture' ? (
                        <div className="flex flex-col gap-2">
                          <div className="text-xs font-bold text-center py-1 rounded-lg" style={{ color: 'var(--gr)' }}>
                            ✓ Choisi
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleContacterCandidat(c.demandeur_id)}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold border hover-surface transition"
                              style={{ borderColor: 'var(--bd)', color: 'var(--txt)' }}
                            >
                              <Send size={13} /> Écrire un message
                            </button>
                            {c.whatsapp && (
                                <a
                                href={`https://wa.me/${c.whatsapp.replace('+', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold text-white transition"
                                style={{ backgroundColor: '#25D366' }}
                              >
                                WhatsApp
                              </a>
                            )}
                          </div>
                        </div>
                      ) : c.statut === 'refuse' ? (
                        <div className="text-xs font-semibold text-center py-1.5 rounded-lg" style={{ color: 'var(--txt3)' }}>
                          Non retenu
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleContacterCandidat(c.demandeur_id)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold border hover-surface transition"
                            style={{ borderColor: 'var(--bd)', color: 'var(--txt)' }}
                          >
                            <Send size={13} /> Écrire un message
                          </button>
                          <button
                            onClick={() => handleChoisir(c.id)}
                            disabled={choixEnCours === c.id || don.quantite_dispo <= 0}
                            className="flex-1 py-2 rounded-lg text-xs font-bold text-white btn-action transition disabled:opacity-50"
                          >
                            {choixEnCours === c.id ? '...' : 'Choisir'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {estProprio ? (
              <div className="px-4 py-4 rounded-xl text-sm font-semibold text-center" style={{ backgroundColor: 'var(--card2)', color: 'var(--txt2)' }}>
                Ceci est votre annonce
              </div>
            ) : estReserve(id) ? (
              <div className="flex flex-col gap-3">
                <div className="px-4 py-4 rounded-xl text-sm font-semibold" style={{ backgroundColor: 'var(--grl)', color: 'var(--gr)' }}>
                  ✓ Demande envoyée ! Le propriétaire vous contactera s'il vous choisit.
                </div>
                <button
                  onClick={handleAnnuler}
                  className="w-full py-3 rounded-xl font-bold border"
                  style={{ backgroundColor: '#FDE8EB', borderColor: '#FF6B6B', color: '#CC2222' }}
                >
                  Annuler la réservation
                </button>
              </div>
            ) : (
              <button
                onClick={handleReserver}
                disabled={plusDispo}
                className={`w-full py-3.5 rounded-xl font-bold text-white transition disabled:opacity-50 ${!plusDispo ? 'btn-action' : ''}`}
                style={{ backgroundColor: plusDispo ? 'var(--txt3)' : undefined }}
              >
                {plusDispo ? 'Plus disponible' : 'Réserver ce don'}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
