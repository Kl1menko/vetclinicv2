import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon, Avatar } from './components.jsx';
import { hasRealtimeConfig, supabaseClient } from './supabase-client.js';

const roleLabel = (role) => ({
  client: 'Клієнт',
  doctor: 'Лікар',
  receptionist: 'Реєстратор',
  admin: 'Адмін',
}[role] || role || 'Користувач');

const timeLabel = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

const dateLabel = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' });
  } catch {
    return '';
  }
};

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Не вдалося прочитати файл'));
    reader.readAsDataURL(file);
  });
}

export default function ChatPanel({ store, user, showToast = () => {} }) {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [readMeta, setReadMeta] = useState({ lastReadAtByOthers: null });
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());
  const [typingByConversation, setTypingByConversation] = useState({});
  const typingTimeoutsRef = useRef({});
  const typingChannelRef = useRef(null);
  const lastTypingSentRef = useRef(0);

  const [authReady, setAuthReady] = useState(Boolean(store.getAccessToken?.()));
  const refreshInFlightRef = useRef(null);

  const ensureAccessToken = async () => {
    const current = store.getAccessToken?.();
    if (current) return current;
    if (refreshInFlightRef.current) return refreshInFlightRef.current;
    refreshInFlightRef.current = fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.accessToken) {
          store.setAccessToken?.(data.accessToken);
          if (data.user) store.setCurrentUser?.(data.user);
          setAuthReady(true);
          return data.accessToken;
        }
        return null;
      })
      .catch(() => null)
      .finally(() => { refreshInFlightRef.current = null; });
    return refreshInFlightRef.current;
  };

  const api = async (url, options = {}) => {
    let token = store.getAccessToken?.();
    if (!token) token = await ensureAccessToken();
    if (!token) throw new Error('Сесія завершилась. Увійдіть знову.');
    const res = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) {
      const nextToken = await ensureAccessToken();
      if (nextToken && nextToken !== token) {
        return api(url, options);
      }
    }
    if (!res.ok) throw new Error(data.error || 'Помилка запиту');
    return data;
  };

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) || null,
    [conversations, activeId],
  );
  const activePeer = useMemo(
    () => activeConversation?.participants?.find((p) => p.id !== user.id) || null,
    [activeConversation, user.id],
  );
  const isPeerOnline = Boolean(activePeer?.id && onlineUserIds.has(activePeer.id));

  const loadConversations = async () => {
    setLoadingConversations(true);
    try {
      const data = await api('/api/chat?action=conversations');
      setConversations(data.conversations || []);
      if (!activeId && data.conversations?.length) setActiveId(data.conversations[0].id);
      if (activeId && !(data.conversations || []).some((c) => c.id === activeId)) {
        setActiveId(data.conversations?.[0]?.id || null);
      }
    } catch (e) {
      showToast(e.message || 'Не вдалося завантажити чати');
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadContacts = async () => {
    try {
      const data = await api('/api/chat?action=users&limit=50');
      setContacts(data.users || []);
    } catch (e) {
      setContacts([]);
      showToast(e.message || 'Не вдалося завантажити список контактів');
    }
  };

  const loadMessages = async (conversationId) => {
    if (!conversationId) return;
    setLoadingMessages(true);
    try {
      const data = await api(`/api/chat?action=messages&conversationId=${encodeURIComponent(conversationId)}`);
      const list = data.messages || [];
      setMessages(list);
      setReadMeta(data.readMeta || { lastReadAtByOthers: null });
      const last = list[list.length - 1];
      if (last?.id && last?.sender_user_id !== user.id) {
        api('/api/chat?action=read', {
          method: 'POST',
          body: JSON.stringify({ conversationId, lastReadMessageId: last.id }),
        }).catch(() => {});
      }
    } catch (e) {
      showToast(e.message || 'Не вдалося завантажити повідомлення');
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    ensureAccessToken().finally(() => setAuthReady(Boolean(store.getAccessToken?.())));
  }, [user?.id]);

  useEffect(() => {
    if (!authReady) return;
    loadConversations();
    loadContacts();
    if (hasRealtimeConfig) return undefined;
    const timer = setInterval(loadConversations, 12000);
    return () => clearInterval(timer);
  }, [authReady, user?.id]);

  useEffect(() => {
    if (!authReady) return;
    if (!activeId) return;
    loadMessages(activeId);
    if (hasRealtimeConfig) return undefined;
    const timer = setInterval(() => loadMessages(activeId), 4000);
    return () => clearInterval(timer);
  }, [activeId, authReady]);

  useEffect(() => {
    if (!hasRealtimeConfig || !authReady || !supabaseClient) return undefined;
    const channel = supabaseClient
      .channel(`chat-live-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
        const row = payload.new || payload.old;
        const convId = row?.conversation_id;
        if (!convId) return;
        loadConversations();
        if (activeId && convId === activeId) loadMessages(activeId);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'conversations' }, (payload) => {
        if (!payload.new?.id) return;
        loadConversations();
      })
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [authReady, user.id, activeId]);

  useEffect(() => {
    if (!hasRealtimeConfig || !authReady || !supabaseClient) return undefined;
    const channel = supabaseClient.channel('chat-presence-global', {
      config: { presence: { key: user.id } },
    });

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const ids = new Set(Object.keys(state || {}));
      setOnlineUserIds(ids);
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          userId: user.id,
          name: user.name || 'User',
          role: user.role || 'client',
          at: new Date().toISOString(),
        });
      }
    });

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [authReady, user.id, user.name, user.role]);

  useEffect(() => {
    if (!hasRealtimeConfig || !authReady || !supabaseClient || !activeId) return undefined;

    if (typingChannelRef.current) {
      supabaseClient.removeChannel(typingChannelRef.current);
      typingChannelRef.current = null;
    }

    const channel = supabaseClient.channel(`chat-typing-${activeId}`);
    channel.on('broadcast', { event: 'typing' }, (payload) => {
      const data = payload?.payload || {};
      const senderId = data.userId;
      if (!senderId || senderId === user.id) return;
      const isTyping = Boolean(data.isTyping);
      const convId = data.conversationId || activeId;

      if (typingTimeoutsRef.current[senderId]) {
        clearTimeout(typingTimeoutsRef.current[senderId]);
      }

      setTypingByConversation((prev) => ({
        ...prev,
        [convId]: isTyping ? senderId : null,
      }));

      if (isTyping) {
        typingTimeoutsRef.current[senderId] = setTimeout(() => {
          setTypingByConversation((prev) => ({ ...prev, [convId]: null }));
        }, 2600);
      }
    });
    channel.subscribe();
    typingChannelRef.current = channel;

    return () => {
      if (typingChannelRef.current) {
        supabaseClient.removeChannel(typingChannelRef.current);
        typingChannelRef.current = null;
      }
    };
  }, [activeId, authReady, user.id]);

  useEffect(() => {
    if (!hasRealtimeConfig || !typingChannelRef.current || !activeId) return undefined;
    const now = Date.now();
    const isTyping = Boolean(text.trim());
    if (now - lastTypingSentRef.current < 700 && isTyping) return undefined;

    lastTypingSentRef.current = now;
    typingChannelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        conversationId: activeId,
        userId: user.id,
        isTyping,
      },
    });
    return undefined;
  }, [text, activeId, user.id]);

  const openOrCreateConversation = async (contactId) => {
    const targetId = String(contactId || '').trim();
    if (!targetId) return;
    const existing = conversations.find((c) => c.participants?.some((p) => p.id === targetId));
    if (existing?.id) {
      setActiveId(existing.id);
      return;
    }
    try {
      const data = await api('/api/chat?action=conversations', {
        method: 'POST',
        body: JSON.stringify({ participantUserId: targetId }),
      });
      const newId = data.conversation?.id;
      await loadConversations();
      if (newId) setActiveId(newId);
    } catch (e) {
      showToast(e.message || 'Не вдалося створити чат');
    }
  };

  const openAttachment = async (path) => {
    try {
      const data = await api(`/api/chat?action=file&path=${encodeURIComponent(path)}`);
      if (data.url) window.open(data.url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      showToast(e.message || 'Не вдалося відкрити файл');
    }
  };

  const send = async () => {
    if (!activeId || sending) return;
    const bodyText = text.trim();
    if (!bodyText && !files.length) return;

    setSending(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const dataUrl = await fileToDataUrl(file);
        const uploadedFile = await api('/api/chat?action=upload', {
          method: 'POST',
          body: JSON.stringify({
            conversationId: activeId,
            fileName: file.name,
            dataUrl,
          }),
        });
        if (uploadedFile.attachment) uploaded.push(uploadedFile.attachment);
      }

      await api('/api/chat?action=messages', {
        method: 'POST',
        body: JSON.stringify({
          conversationId: activeId,
          text: bodyText,
          attachments: uploaded,
        }),
      });
      setText('');
      setFiles([]);
      await loadMessages(activeId);
      await loadConversations();
    } catch (e) {
      showToast(e.message || 'Не вдалося відправити повідомлення');
    } finally {
      setSending(false);
    }
  };

  const lastMineMessageId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i]?.sender_user_id === user.id) return messages[i].id;
    }
    return null;
  }, [messages, user.id]);

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="profile-chat-layout">
        <aside className="profile-chat-aside">
          <div style={{ padding: 12, borderBottom: '1px solid var(--ink-100)', display: 'grid', gap: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 600 }}>Кому написати</div>
            <div style={{ display: 'grid', gap: 6, maxHeight: 180, overflowY: 'auto' }}>
              {contacts.length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>Немає доступних контактів</div>
              ) : contacts.map((c) => (
                <button
                  key={c.id}
                  className="btn btn-sm btn-outline"
                  style={{ justifyContent: 'flex-start' }}
                  onClick={() => openOrCreateConversation(c.id)}
                >
                  <Icon name="user" size={13} /> {c.name} · {roleLabel(c.role)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ maxHeight: 420, overflowY: 'auto' }}>
            {loadingConversations && <div style={{ padding: 12, fontSize: 12, color: 'var(--ink-500)' }}>Завантаження…</div>}
            {!loadingConversations && conversations.length === 0 && (
              <div style={{ padding: 12, fontSize: 12, color: 'var(--ink-500)' }}>Поки що немає діалогів</div>
            )}
            {conversations.map((c) => {
              const peer = c.participants?.find((p) => p.id !== user.id);
              return (
                <button key={c.id} onClick={() => setActiveId(c.id)}
                  style={{ width: '100%', border: 0, background: activeId === c.id ? 'var(--teal-50)' : 'transparent', textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid var(--ink-100)', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink-900)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {hasRealtimeConfig && peer?.id && (
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: onlineUserIds.has(peer.id) ? 'var(--green-500)' : 'var(--ink-300)' }} />
                      )}
                      <span>{c.title || peer?.name || 'Чат'}</span>
                    </div>
                    {c.unread > 0 && <span className="chip chip-coral" style={{ fontSize: 10 }}>{c.unread}</span>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 3 }}>
                    {c.lastMessage?.text ? c.lastMessage.text.slice(0, 46) : 'Без повідомлень'}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="profile-chat-main">
          {!activeConversation ? (
            <div style={{ padding: 18, color: 'var(--ink-500)', fontSize: 14 }}>Оберіть або створіть чат</div>
          ) : (
            <>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--ink-100)', background: 'var(--teal-50)' }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{activeConversation.title}</div>
                {activePeer?.name && (
                  <div style={{ marginTop: 3, fontSize: 11, color: 'var(--ink-500)' }}>
                    {hasRealtimeConfig ? (isPeerOnline ? 'онлайн' : 'офлайн') : roleLabel(activePeer.role)}
                  </div>
                )}
              </div>
              <div className="profile-chat-messages">
                {loadingMessages && <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>Оновлення…</div>}
                {!loadingMessages && messages.length === 0 && (
                  <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>Напишіть перше повідомлення</div>
                )}
                {messages.map((m) => {
                  const mine = m.sender_user_id === user.id;
                  const sender = m.users?.name || 'Користувач';
                  const isLastMine = mine && m.id === lastMineMessageId;
                  const isReadByPeer = Boolean(
                    isLastMine &&
                    readMeta?.lastReadAtByOthers &&
                    new Date(readMeta.lastReadAtByOthers) >= new Date(m.created_at),
                  );
                  return (
                    <div key={m.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                      <div style={{ maxWidth: '78%', background: mine ? 'var(--teal-100)' : 'var(--ink-50)', borderRadius: 12, padding: '8px 10px' }}>
                        {!mine && <div style={{ fontSize: 11, color: 'var(--ink-500)', marginBottom: 3 }}>{sender}</div>}
                        {m.text && <div style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>{m.text}</div>}
                        {Array.isArray(m.attachments) && m.attachments.length > 0 && (
                          <div style={{ display: 'grid', gap: 4, marginTop: m.text ? 6 : 0 }}>
                            {m.attachments.map((a) => (
                              <button key={`${m.id}-${a.path}`} onClick={() => openAttachment(a.path)}
                                style={{ border: 0, background: 'rgba(255,255,255,0.75)', borderRadius: 8, padding: '5px 8px', textAlign: 'left', cursor: 'pointer', fontSize: 12 }}>
                                <Icon name="file" size={12} /> {a.name}
                              </button>
                            ))}
                          </div>
                        )}
                        <div style={{ marginTop: 4, fontSize: 10, color: 'var(--ink-400)', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                          <span>{dateLabel(m.created_at)} {timeLabel(m.created_at)}</span>
                          {isLastMine && (
                            <span style={{ color: isReadByPeer ? 'var(--teal-600)' : 'var(--ink-300)', fontWeight: 700 }}>
                              ✓✓{isReadByPeer ? ' Прочитано' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {typingByConversation[activeId] && (
                  <div style={{ fontSize: 12, color: 'var(--ink-500)', fontStyle: 'italic' }}>
                    {activePeer?.name || 'Співрозмовник'} друкує…
                  </div>
                )}
              </div>

              <div style={{ padding: 10, borderTop: '1px solid var(--ink-100)', display: 'grid', gap: 8 }}>
                <textarea className="input" rows={2} placeholder="Напишіть повідомлення…" value={text} onChange={(e) => setText(e.target.value)} />
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
                  <label className="btn btn-sm btn-outline" style={{ cursor: 'pointer' }}>
                    <Icon name="file" size={13} /> Файли
                    <input type="file" multiple style={{ display: 'none' }} onChange={(e) => setFiles(Array.from(e.target.files || []))} />
                  </label>
                  <button className="btn btn-sm btn-primary" disabled={sending || (!text.trim() && !files.length)} onClick={send}>
                    {sending ? 'Надсилаю…' : 'Надіслати'}
                  </button>
                </div>
                {files.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {files.map((f) => <span key={`${f.name}-${f.size}`} className="chip chip-violet" style={{ fontSize: 10 }}>{f.name}</span>)}
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
