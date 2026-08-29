'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, MessageCircleMore } from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function ConversationPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [texte, setTexte] = useState('');
  const [loading, setLoading] = useState(true);
  const [envoi, setEnvoi] = useState(false);
  const bottomRef = useRef(null);

  const charger = async () => {
    try {
      const res = await api.get(`/messages/conversations/${id}`);
      setMessages(res.messages || []);
      setConversation(res.conversation);
      console.log('DEBUG conversation:', res.conversation);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    charger();
    const interval = setInterval(charger, 5000); // polling toutes les 5s
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const envoyer = async (e) => {
    e.preventDefault();
    if (!texte.trim() || envoi) return;
    setEnvoi(true);
    try {
      await api.post(`/messages/conversations/${id}`, { contenu: texte.trim() });
      setTexte('');
      await charger();
    } catch (err) {
      alert(err.message);
    } finally {
      setEnvoi(false);
    }
  };

  if (loading) {
    return (
      <main style={{ backgroundColor: 'var(--bg)', minHeight: 'calc(100vh - 73px)' }}>
        <div className="max-w-2xl mx-auto px-4 py-10">
          <p style={{ color: 'var(--txt2)' }}>Chargement...</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ backgroundColor: 'var(--bg)', minHeight: 'calc(100vh - 73px)' }} className="flex flex-col">
      <div className="max-w-2xl w-full mx-auto px-4 sm:px-6 py-4 flex items-center gap-3 border-b" style={{ borderColor: 'var(--bd)' }}>
        <button onClick={() => router.back()} className="hover-surface p-2 rounded-lg shrink-0">
          <ArrowLeft size={20} style={{ color: 'var(--txt)' }} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold truncate" style={{ color: 'var(--txt)' }}>
            {conversation?.autre_prenom} {conversation?.autre_nom}
          </h2>
          {conversation?.entite_titre && (
            <p className="text-xs truncate" style={{ color: 'var(--or)' }}>
              {conversation.entite_type === 'don' ? '🎁' : '🔨'} {conversation.entite_titre}
              {conversation.entite_numero && ` · ID: #${String(conversation.entite_numero).padStart(5, '0')}`}
            </p>
          )}
        </div>
        {conversation?.autre_whatsapp && (
            <a
            href={`https://wa.me/${conversation.autre_whatsapp.replace('+', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white shrink-0 transition hover:opacity-90"
            style={{ backgroundColor: '#25D366' }}
          >
            <MessageCircleMore size={15} /> <span className="hidden sm:inline">WhatsApp</span>
          </a>
        )}
      </div>

      <div className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-3 overflow-y-auto">
        {messages.length === 0 ? (
          <p style={{ color: 'var(--txt2)' }}>Aucun message. Lancez la discussion !</p>
        ) : (
          messages.map((msg) => {
            const estMoi = msg.expediteur_id === user?.id;
            return (
              <div key={msg.id} className={`flex ${estMoi ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[75%] px-4 py-2 rounded-2xl text-sm"
                  style={{
                    backgroundColor: estMoi ? 'var(--bord)' : 'var(--card)',
                    color: estMoi ? 'white' : 'var(--txt)',
                    border: estMoi ? 'none' : '1px solid var(--bd)',
                  }}
                >
                  {msg.contenu}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={envoyer} className="max-w-2xl w-full mx-auto px-4 sm:px-6 py-4 flex items-center gap-2 border-t" style={{ borderColor: 'var(--bd)' }}>
        <input
          type="text"
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder="Écrire un message..."
          className="flex-1 px-4 py-3 rounded-xl border outline-none text-sm"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)', color: 'var(--txt)' }}
        />
        <button
          type="submit"
          disabled={envoi || !texte.trim()}
          className="btn-action p-3 rounded-xl text-white disabled:opacity-40 transition"
        >
          <Send size={18} />
        </button>
      </form>
    </main>
  );
}
