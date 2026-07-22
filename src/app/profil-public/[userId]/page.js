'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star } from 'lucide-react';
import api from '@/services/api';

export default function ProfilPublicPage() {
  const { userId } = useParams();
  const searchParams = useSearchParams();
  const nom    = searchParams.get('nom')    || '';
  const prenom = searchParams.get('prenom') || '';

  const [evaluations, setEvaluations] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    const charger = async () => {
      try {
        const res = await api.get(`/evaluations/utilisateur/${userId}`);
        setEvaluations(res.evaluations || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    charger();
  }, [userId]);

  const noteMoyenne = evaluations.length > 0
    ? (evaluations.reduce((sum, e) => sum + e.note, 0) / evaluations.length).toFixed(1)
    : '0.0';

  const repartition = [5, 4, 3, 2, 1].map(n => ({
    note: n,
    nombre: evaluations.filter(e => e.note === n).length,
  }));

  const Etoiles = ({ note, taille = 16 }) => (
    <div className="flex">
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} size={taille} fill={n <= note ? 'var(--or)' : 'none'} style={{ color: 'var(--or)', opacity: n <= note ? 1 : 0.3 }} />
      ))}
    </div>
  );

  return (
    <main style={{ backgroundColor: 'var(--bg)', minHeight: 'calc(100vh - 73px)' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold mb-6 hover:opacity-70" style={{ color: 'var(--txt2)' }}>
          <ArrowLeft size={16} /> Retour
        </Link>

        <div
          className="rounded-2xl border p-8 flex flex-col items-center text-center mb-6"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-extrabold border-2 mb-4"
            style={{ backgroundColor: 'var(--card2)', borderColor: 'var(--or)', color: 'var(--or)' }}
          >
            {prenom?.[0]}{nom?.[0]}
          </div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--txt)' }}>{prenom} {nom}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Etoiles note={Math.round(noteMoyenne)} />
            <span className="text-sm font-bold" style={{ color: 'var(--or)' }}>{noteMoyenne}</span>
            <span className="text-xs" style={{ color: 'var(--txt2)' }}>({evaluations.length} avis)</span>
          </div>
        </div>

        {loading ? (
          <p style={{ color: 'var(--txt2)' }}>Chargement...</p>
        ) : (
          <>
            {evaluations.length > 0 && (
              <div className="rounded-2xl border p-5 mb-6" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}>
                {repartition.map(({ note, nombre }) => {
                  const pourcent = evaluations.length > 0 ? (nombre / evaluations.length) * 100 : 0;
                  return (
                    <div key={note} className="flex items-center gap-2 mb-2">
                      <span className="text-xs w-3" style={{ color: 'var(--txt2)' }}>{note}</span>
                      <span className="text-xs">⭐</span>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bd)' }}>
                        <div className="h-full rounded-full" style={{ width: `${pourcent}%`, backgroundColor: 'var(--or)' }} />
                      </div>
                      <span className="text-xs w-5 text-right" style={{ color: 'var(--txt2)' }}>{nombre}</span>
                    </div>
                  );
                })}
              </div>
            )}

            <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--txt3)' }}>
              Avis reçus ({evaluations.length})
            </p>

            {evaluations.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: 'var(--txt2)' }}>Aucun avis pour le moment.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {evaluations.map((ev) => (
                  <div key={ev.id} className="rounded-2xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: 'var(--bord)' }}>
                        {ev.prenom?.[0]}{ev.nom?.[0]}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold" style={{ color: 'var(--txt)' }}>{ev.prenom} {ev.nom}</p>
                        <p className="text-xs" style={{ color: 'var(--txt3)' }}>{new Date(ev.cree_le).toLocaleDateString('fr-SN')}</p>
                      </div>
                      <Etoiles note={ev.note} taille={13} />
                    </div>
                    {ev.titre_don && (
                      <p className="text-xs mb-1" style={{ color: 'var(--txt3)' }}>Don : {ev.titre_don}</p>
                    )}
                    {ev.commentaire && (
                      <p className="text-sm" style={{ color: 'var(--txt2)' }}>{ev.commentaire}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
