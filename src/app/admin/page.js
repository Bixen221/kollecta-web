'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, TrendingUp, Users, Gift, Hammer, Star, ShieldAlert, ImageOff, Trash2, ShieldCheck, Download } from 'lucide-react';
import { exporterCsv } from '@/utils/exportCsv';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function AdminPage() {
  const { user, loading: authLoading, deconnexion } = useAuth();
  const router = useRouter();
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [erreur,  setErreur]  = useState('');
  const [annoncesSansPhoto, setAnnoncesSansPhoto] = useState([]);
  const [usersNonVerifies, setUsersNonVerifies] = useState([]);
  const [tousLesUsers, setTousLesUsers] = useState([]);
  const [tousLesDons, setTousLesDons] = useState([]);
  const [toutesLesEncheres, setToutesLesEncheres] = useState([]);

  useEffect(() => {
    if (!authLoading && (!user || !user.est_admin)) router.push('/');
  }, [authLoading, user]);

  const chargerAnnoncesSansPhoto = async () => {
    try {
      const res = await api.get('/admin/annonces-sans-photo');
      setAnnoncesSansPhoto(res.annonces || []);
    } catch (err) {
      console.error(err);
    }
  };

  const chargerUsersNonVerifies = async () => {
    try {
      const res = await api.get('/admin/users');
      setTousLesUsers(res.users || []);
      setUsersNonVerifies((res.users || []).filter(u => !u.verifie));
    } catch (err) {
      console.error(err);
    }
  };

  const chargerDonsEtEncheres = async () => {
    try {
      const [resDons, resEncheres] = await Promise.all([
        api.get('/admin/dons'),
        api.get('/admin/encheres'),
      ]);
      setTousLesDons(resDons.dons || []);
      setToutesLesEncheres(resEncheres.encheres || []);
    } catch (err) {
      console.error(err);
    }
  };

  const exporterUsers = () => {
    exporterCsv(tousLesUsers, [
      { champ: 'prenom', label: 'Prénom' },
      { champ: 'nom', label: 'Nom' },
      { champ: 'whatsapp', label: 'WhatsApp' },
      { champ: 'quartier', label: 'Quartier' },
      { champ: 'ville', label: 'Ville' },
      { champ: 'nb_dons', label: 'Dons faits' },
      { champ: 'note_moyenne', label: 'Note moyenne' },
      { champ: 'verifie', label: 'Vérifié' },
      { champ: 'cree_le', label: 'Date inscription' },
    ], `kollecta-utilisateurs-${new Date().toISOString().slice(0,10)}.csv`);
  };

  const exporterDons = () => {
    exporterCsv(tousLesDons, [
      { champ: 'titre', label: 'Titre' },
      { champ: 'type', label: 'Type' },
      { champ: 'statut', label: 'Statut' },
      { champ: 'quartier', label: 'Quartier' },
      { champ: 'ville', label: 'Ville' },
      { champ: 'quantite_total', label: 'Quantité totale' },
      { champ: 'quantite_dispo', label: 'Quantité disponible' },
      { champ: 'prenom', label: 'Prénom propriétaire' },
      { champ: 'nom', label: 'Nom propriétaire' },
      { champ: 'cree_le', label: 'Date publication' },
    ], `kollecta-dons-${new Date().toISOString().slice(0,10)}.csv`);
  };

  const exporterEncheres = () => {
    exporterCsv(toutesLesEncheres, [
      { champ: 'titre', label: 'Titre' },
      { champ: 'statut', label: 'Statut' },
      { champ: 'prix_depart', label: 'Prix de départ' },
      { champ: 'offre_actuelle', label: 'Offre actuelle' },
      { champ: 'nb_offres', label: 'Nombre offres' },
      { champ: 'quartier', label: 'Quartier' },
      { champ: 'ville', label: 'Ville' },
      { champ: 'prenom', label: 'Prénom vendeur' },
      { champ: 'nom', label: 'Nom vendeur' },
      { champ: 'cree_le', label: 'Date publication' },
    ], `kollecta-encheres-${new Date().toISOString().slice(0,10)}.csv`);
  };

  const verifierUser = async (u) => {
    try {
      await api.put(`/admin/users/${u.id}/verifier`, { verifie: true });
      chargerUsersNonVerifies();
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    const charger = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.stats);
      } catch (err) {
        setErreur(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (user?.est_admin) { charger(); chargerAnnoncesSansPhoto(); chargerUsersNonVerifies(); chargerDonsEtEncheres(); }
  }, [user]);

  const supprimerAnnonce = async (annonce) => {
    if (!confirm(`Supprimer "${annonce.titre}" ? Cette action est irréversible.`)) return;
    try {
      const endpoint = annonce.categorie_annonce === 'don' ? 'dons' : 'encheres';
      await api.delete(`/admin/${endpoint}/${annonce.id}`);
      chargerAnnoncesSansPhoto();
    } catch (err) {
      alert(err.message);
    }
  };

  if (authLoading || !user || !user.est_admin) return null;

  const KpiCard = ({ icon: Icon, label, value, sous, couleur }) => (
    <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} style={{ color: couleur || 'var(--or)' }} />
        <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--txt2)' }}>{label}</p>
      </div>
      <p className="text-2xl font-extrabold" style={{ color: couleur || 'var(--txt)' }}>{value}</p>
      {sous && <p className="text-xs mt-1" style={{ color: 'var(--txt3)' }}>{sous}</p>}
    </div>
  );

  return (
    <main style={{ backgroundColor: 'var(--bg)', minHeight: 'calc(100vh - 73px)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold" style={{ color: 'var(--txt)' }}>🛠 Tableau de bord</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--txt2)' }}>Bienvenue, {user.prenom}</p>
          </div>
          <button
            onClick={deconnexion}
            className="hover-surface flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border"
            style={{ borderColor: '#FFCDD2', color: '#CC2222' }}
          >
            <LogOut size={16} /> Déconnexion
          </button>
        </div>

        {erreur && (
          <div className="mb-4 px-4 py-3 rounded-lg text-sm font-medium" style={{ backgroundColor: '#FDE8EB', color: '#8B1A2A' }}>
            {erreur}
          </div>
        )}

        {!loading && (
          <div className="flex gap-3 flex-wrap mb-8">
            <button
              onClick={exporterUsers}
              className="hover-surface flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold border transition"
              style={{ borderColor: 'var(--bd)', color: 'var(--txt2)' }}
            >
              <Download size={15} /> Exporter utilisateurs
            </button>
            <button
              onClick={exporterDons}
              className="hover-surface flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold border transition"
              style={{ borderColor: 'var(--bd)', color: 'var(--txt2)' }}
            >
              <Download size={15} /> Exporter dons
            </button>
            <button
              onClick={exporterEncheres}
              className="hover-surface flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold border transition"
              style={{ borderColor: 'var(--bd)', color: 'var(--txt2)' }}
            >
              <Download size={15} /> Exporter enchères
            </button>
          </div>
        )}

        {loading ? (
          <p style={{ color: 'var(--txt2)' }}>Chargement...</p>
        ) : stats && (
          <>
            {/* CROISSANCE */}
            <p className="text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-2" style={{ color: 'var(--txt3)' }}>
              <TrendingUp size={13} /> Croissance (7 derniers jours)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <KpiCard icon={Users}  label="Nouveaux membres" value={stats.nouveaux_users_7j} />
              <KpiCard icon={Gift}   label="Nouveaux dons"    value={stats.nouveaux_dons_7j} />
              <KpiCard icon={Hammer} label="Nouvelles enchères" value={stats.nouvelles_encheres_7j} />
            </div>

            {/* VUE D'ENSEMBLE */}
            <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--txt3)' }}>Vue d'ensemble</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              <KpiCard icon={Users}  label="Utilisateurs"     value={stats.total_users} />
              <KpiCard icon={Gift}   label="Dons actifs"      value={stats.dons_actifs} sous={`${stats.total_dons} au total`} />
              <KpiCard icon={Hammer} label="Enchères en cours" value={stats.encheres_en_cours} sous={`${stats.total_encheres} au total`} />
            </div>

            {/* SANTE DE LA PLATEFORME */}
            <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--txt3)' }}>Santé de la plateforme</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <KpiCard
                icon={Gift}
                label="Taux de dons complétés"
                value={`${stats.taux_completion_dons}%`}
                couleur={stats.taux_completion_dons >= 50 ? 'var(--gr)' : 'var(--or)'}
              />
              <KpiCard
                icon={Gift}
                label="Réservations"
                value={`${stats.resa_confirmees} ✓ / ${stats.resa_annulees} ✗`}
                sous="Confirmées vs annulées"
              />
              <KpiCard icon={Star} label="Note moyenne globale" value={`⭐ ${stats.note_moyenne_globale}`} />
            </div>

            {/* ENCHERES */}
            <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--txt3)' }}>Enchères</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <KpiCard
                icon={Hammer}
                label="Volume en cours"
                value={`${stats.volume_encheres_cours?.toLocaleString()} FCFA`}
                sous="Somme des offres actuelles sur enchères actives"
              />
              <KpiCard icon={Hammer} label="Réservations totales" value={stats.total_reservations} />
            </div>

            {/* MODERATION */}
            <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--txt3)' }}>Modération</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <KpiCard
                icon={ShieldAlert}
                label="Utilisateurs non vérifiés"
                value={stats.users_non_verifies}
                couleur={stats.users_non_verifies > 0 ? 'var(--bord)' : 'var(--gr)'}
                sous="À examiner en priorité"
              />
              <KpiCard
                icon={ImageOff}
                label="Annonces sans photo"
                value={annoncesSansPhoto.length}
                couleur={annoncesSansPhoto.length > 0 ? 'var(--bord)' : 'var(--gr)'}
                sous="À compléter ou supprimer"
              />
            </div>

            {/* LISTE UTILISATEURS NON VERIFIES */}
            {usersNonVerifies.length > 0 && (
              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-2" style={{ color: 'var(--txt3)' }}>
                  <ShieldCheck size={13} /> Utilisateurs non vérifiés ({usersNonVerifies.length})
                </p>
                <div className="flex flex-col gap-2">
                  {usersNonVerifies.map((u) => (
                    <div
                      key={u.id}
                      className="rounded-xl border p-4 flex items-center gap-4"
                      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" style={{ backgroundColor: 'var(--bord)' }}>
                        {u.prenom?.[0]}{u.nom?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold" style={{ color: 'var(--txt)' }}>{u.prenom} {u.nom}</p>
                        <p className="text-xs" style={{ color: 'var(--txt2)' }}>{u.whatsapp} · {u.quartier}, {u.ville}</p>
                        <p className="text-xs" style={{ color: 'var(--txt3)' }}>{u.nb_dons} dons · ⭐ {u.note_moyenne}</p>
                      </div>
                      <button
                        onClick={() => verifierUser(u)}
                        className="hover-surface flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border flex-shrink-0"
                        style={{ borderColor: 'var(--gr)', color: 'var(--gr)' }}
                      >
                        <ShieldCheck size={14} /> Vérifier
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LISTE ANNONCES SANS PHOTO */}
            {annoncesSansPhoto.length > 0 && (
              <>
                <p className="text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-2" style={{ color: 'var(--txt3)' }}>
                  <ImageOff size={13} /> Annonces sans photo ({annoncesSansPhoto.length})
                </p>
                <div className="flex flex-col gap-2">
                  {annoncesSansPhoto.map((annonce) => (
                    <div
                      key={annonce.id}
                      className="rounded-xl border p-4 flex items-center gap-4"
                      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}
                    >
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--bordl)' }}>
                        <ImageOff size={16} style={{ color: 'var(--bord)' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold" style={{ color: 'var(--txt)' }}>{annonce.titre}</p>
                        <p className="text-xs" style={{ color: 'var(--txt2)' }}>
                          {annonce.categorie_annonce === 'don' ? '🎁 Don' : '🔨 Enchère'} · {annonce.prenom} {annonce.nom} · {new Date(annonce.cree_le).toLocaleDateString('fr-SN')}
                        </p>
                      </div>
                      <button
                        onClick={() => supprimerAnnonce(annonce)}
                        className="hover-surface p-2 rounded-lg border flex-shrink-0"
                        style={{ borderColor: '#FFCDD2' }}
                      >
                        <Trash2 size={16} style={{ color: '#CC2222' }} />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
