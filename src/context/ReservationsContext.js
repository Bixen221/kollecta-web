'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import { useAuth } from './AuthContext';

const ReservationsContext = createContext({});

export function ReservationsProvider({ children }) {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);

  const charger = useCallback(async () => {
    if (!user) { setReservations([]); return; }
    try {
      const res = await api.get('/dons/reservations/mes-reservations');
      const actives = (res.reservations || []).filter(r => !['annule', 'cloture'].includes(r.statut));
      setReservations(actives);
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  useEffect(() => { charger(); }, [charger]);

  const estReserve = (donId) => reservations.some(r => r.don_id === donId);
  const getReservation = (donId) => reservations.find(r => r.don_id === donId);

  return (
    <ReservationsContext.Provider value={{ reservations, charger, estReserve, getReservation }}>
      {children}
    </ReservationsContext.Provider>
  );
}

export const useReservations = () => useContext(ReservationsContext);
