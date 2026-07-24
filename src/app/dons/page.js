'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import api from '@/services/api';
import { useReservations } from '@/context/ReservationsContext';

export default function DonsPage() {
  const [dons,       setDons]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filtre,     setFiltre]     = useState('Tout');
  const [recherche,  setRecherche]  = useState('');
  const { estReserve, getReservation, charger: rechargerResas } = useReservations();

  const filtres = ['Tout', 'Nourriture', 'Matériels', 'Urgent'];

  useEffect(() => {
    const charger = async () => {
      setLoading(true);
      try {
        const params = {};
        if (filtre === 'Nourriture') params.type = 'nourriture';
        if (filtre === 'Matériels')  params.type = 'materiel';
        if (filtre === 'Urgent')     params.urgent = true;
        const res = await api.get('/dons', { params });
        setDons(res.dons || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    charger();
  }, [filtre]);

  const handleAnnuler = async (donId, e) => {
    e.preventDefault();
    e.stopPropagation();
    const resa = getReservation(donId);
    if (!resa) return;
    if (!confirm('Voulez-vous annuler votre réservation ?')) return;
    try {
      await api.post(`/dons/reservations/${resa.id}/confirmer`, { role: 'annuler' });
      await rechargerResas();
    } catch (err) {
      alert(err.message);
    }
  };

  const donsFiltres = dons.filter(d =>
    d.titre?.toLowerCase().includes(recherche.toLowerCase()) ||
    d.quartier?.toLowerCase().includes(recherche.toLowerCase()) ||
    d.categorie?.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <main style={{ backgroundColor: 'var(--bg)', minHeight: 'calc(100vh - 73px)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-extrabold mb-2" style={{ color: 'var(--txt)' }}>🎁 Dons</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--txt2)' }}>Trouvez un don près de chez vous</p>

        <div className="flex items-center gap-2 mb-4 max-w-md">
          <div
            className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}
          >
            <Search size={16} style={{ color: 'var(--txt3)' }} />
            <input
              type="text"
              placeholder="Rechercher un don..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="flex-1 outline-none bg-transparent text-sm"
              style={{ color: 'var(--txt)' }}
            />
          </div>
          <button
            type="button"
            className="btn-action px-5 py-3 rounded-xl font-bold text-white text-sm transition"
          >
            Rechercher
          </button>
        </div>

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
        ) : donsFiltres.length === 0 ? (
          <p style={{ color: 'var(--txt2)' }}>
            {recherche ? `Aucun résultat pour "${recherche}"` : 'Aucun don disponible.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {donsFiltres.map((don) => {
              const reserve = estReserve(don.id);
              return (
                <Link
                  key={don.id}
                  href={`/dons/${don.id}`}
                  className="rounded-2xl overflow-hidden border hover:shadow-lg transition block"
                  style={{ backgroundColor: 'var(--card)', borderColor: reserve ? 'var(--gr)' : 'var(--bd)', borderWidth: reserve ? 2 : 1 }}
                >
                  <div
                    className="h-44 flex items-center justify-center relative"
                    style={{ backgroundColor: don.type === 'nourriture' ? '#FFF8E8' : '#EAF5EE' }}
                  >
                    {don.photos?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={don.photos[0]} alt={don.titre} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl">{don.type === 'nourriture' ? '🍱' : '📦'}</span>
                    )}
                    {reserve && (
                      <span className="absolute top-3 right-3 text-white text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: 'var(--gr)' }}>
                        ✓ Réservé
                      </span>
                    )}
                    {don.urgent && (
                      <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        🚨 Urgent
                      </span>
                    )}
                    {!reserve && don.quantite_dispo <= 0 && (
                      <span className="absolute top-3 right-3 bg-gray-700 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        Indisponible
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold mb-1" style={{ color: 'var(--txt)' }}>{don.titre}</h3>
                    <p className="text-sm mb-2" style={{ color: 'var(--txt2)' }}>{don.quartier}, {don.ville}</p>
                    <p className="text-xs mb-3" style={{ color: 'var(--txt3)' }}>{don.prenom} {don.nom}</p>
                    {reserve && (
                      <button
                        onClick={(e) => handleAnnuler(don.id, e)}
                        className="w-full py-2 rounded-lg text-xs font-bold border"
                        style={{ backgroundColor: '#FDE8EB', borderColor: '#FF6B6B', color: '#CC2222' }}
                      >
                        Annuler la réservation
                      </button>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
