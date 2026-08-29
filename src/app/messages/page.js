'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function MessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const charger = async () => {
    try {
      const res = await api.get('/messages/conversations');
      setConversations(res.conversations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    charger();
    const interval = setInterval(charger, 10000); // polling toutes les 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <main style={{ backgroundColor: 'var(--bg)', minHeight: 'calc(100vh - 73px)' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-extrabold mb-2" style={{ color: 'var(--txt)' }}>💬 Messages</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--txt2)' }}>Vos conversations</p>

        {loading ? (
          <p style={{ color: 'var(--txt2)' }}>Chargement...</p>
        ) : conversations.length === 0 ? (
          <p style={{ color: 'var(--txt2)' }}>Aucune conversation pour le moment.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {conversations.map((conv) => (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className="rounded-2xl border p-4 flex items-center gap-3 hover:shadow-lg transition"
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'var(--bord)' }}
                >
                  <MessageCircle size={20} color="white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold truncate" style={{ color: 'var(--txt)' }}>
                      {conv.autre_prenom} {conv.autre_nom}
                    </h3>
                    {Number(conv.non_lus) > 0 && (
                      <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--gr)' }}>
                        {conv.non_lus}
                      </span>
                    )}
                  </div>
                  {conv.entite_titre && (
                    <p className="text-xs font-semibold truncate mb-0.5" style={{ color: 'var(--or)' }}>
                      {conv.entite_type === 'don' ? '🎁' : '🔨'} {conv.entite_titre}
                      {conv.entite_numero && ` · ID: #${String(conv.entite_numero).padStart(5, '0')}`}
                    </p>
                  )}
                  <p className="text-sm truncate" style={{ color: 'var(--txt2)' }}>
                    {conv.dernier_message || 'Nouvelle conversation'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
