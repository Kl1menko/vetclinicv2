import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { SERVICES, DOCTORS, ARTICLES, APPOINTMENTS, CLIENTS, PETS, REVIEWS } from './data.js';

const STORAGE_KEY = 'ultravet:state:v1';

const DEFAULT_ROLES = [
  { name:'Адміністратор', n:2, c:'teal', perms:['Усі права','Управління користувачами','Управління ролями','Налаштування клініки','Перегляд фінансів','Експорт даних','Перегляд записів','Створення записів','Скасування записів','Картки пацієнтів','Призначення лікування','Управління статтями','Управління послугами','Чат із клієнтами','Перегляд клієнтів'] },
  { name:'Лікар', n:8, c:'coral', perms:['Перегляд записів','Картки пацієнтів','Призначення лікування','Створення записів','Скасування записів','Управління статтями','Управління послугами'] },
  { name:'Реєстратор', n:3, c:'amber', perms:['Створення записів','Перегляд записів','Скасування записів','Картки пацієнтів','Чат із клієнтами','Перегляд клієнтів'] },
];

export const ROLE_COLORS = ['teal','coral','amber','violet','rose','green'];
export const ALL_PERMISSIONS = [
  'Управління користувачами','Управління ролями','Налаштування клініки','Перегляд фінансів','Експорт даних',
  'Перегляд записів','Створення записів','Скасування записів','Картки пацієнтів','Призначення лікування',
  'Управління статтями','Управління послугами','Чат із клієнтами','Перегляд клієнтів',
];

const DEFAULT_SETTINGS = {
  clinic: { name: 'UltraVet', address: 'вул. Околична, 10', phone: '+380 63 679 89 77', email: 'hello@ultravet.ua' },
  schedule: [
    { day: 'Понеділок', from: '09:00', to: '18:00' },
    { day: 'Вівторок', from: '09:00', to: '18:00' },
    { day: 'Середа', from: '09:00', to: '18:00' },
    { day: 'Четвер', from: '09:00', to: '18:00' },
    { day: 'Пʼятниця', from: '09:00', to: '18:00' },
    { day: 'Субота', from: '—', to: '—' },
    { day: 'Неділя', from: '—', to: '—' },
  ],
  notifications: {
    sms: true,
    reminder: true,
    emailArticles: true,
    doctorPush: false,
  },
  adminPassword: 'admin',
};

const seedState = {
  services: SERVICES,
  doctors: DOCTORS,
  articles: ARTICLES,
  appointments: APPOINTMENTS,
  clients: CLIENTS,
  pets: PETS,
  reviews: REVIEWS,
  messages: [],
  roles: DEFAULT_ROLES,
  currentUser: null,
  cookiesAccepted: false,
  settings: DEFAULT_SETTINGS,
};

const StoreContext = createContext(null);

const uid = (prefix) => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
const clean = (value) => String(value || '').trim();
const passwordHash = (value) => {
  const text = String(value || '');
  if (typeof btoa === 'function' && typeof TextEncoder === 'function') {
    const bytes = new TextEncoder().encode(text);
    let binary = '';
    bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
    return btoa(binary);
  }
  return text;
};
const activeAppointment = (appointment) => !['completed', 'cancelled'].includes(appointment.status);
const currentYear = () => String(new Date().getFullYear());
const formatDateUk = (d = new Date()) => {
  const months = ['січня','лютого','березня','квітня','травня','червня','липня','серпня','вересня','жовтня','листопада','грудня'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};
const todayIso = () => new Date().toISOString().slice(0, 10);

const readInitialState = () => {
  if (typeof window === 'undefined') return seedState;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return seedState;
    const parsed = JSON.parse(saved);
    return {
      ...seedState,
      ...parsed,
      roles: Array.isArray(parsed.roles) && parsed.roles.length ? parsed.roles : DEFAULT_ROLES,
      settings: {
        ...DEFAULT_SETTINGS,
        ...(parsed.settings || {}),
        clinic: { ...DEFAULT_SETTINGS.clinic, ...(parsed.settings?.clinic || {}) },
        notifications: { ...DEFAULT_SETTINGS.notifications, ...(parsed.settings?.notifications || {}) },
        schedule: parsed.settings?.schedule || DEFAULT_SETTINGS.schedule,
      },
    };
  } catch {
    return seedState;
  }
};

const upsert = (items, item) => item.id ? items.map(x => x.id === item.id ? { ...x, ...item } : x) : [...items, item];

export const AppStoreProvider = ({ children }) => {
  const [state, setState] = useState(readInitialState);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const actions = useMemo(() => ({
    acceptCookies: () => setState(s => ({ ...s, cookiesAccepted: true })),
    login: (payload = {}) => {
      const key = clean(payload.email || payload.phone).toLowerCase();
      const phone = clean(payload.phone || payload.email);
      const password = passwordHash(payload.password);
      const found = state.clients.find(c => clean(c.email).toLowerCase() === key || clean(c.phone) === phone);
      if (!found || !found.passwordHash || found.passwordHash !== password) return false;
      setState(s => ({ ...s, currentUser: found }));
      return true;
    },
    logout: () => setState(s => ({ ...s, currentUser: null })),
    register: (payload) => {
      const name = clean(payload.name);
      const email = clean(payload.email);
      const phone = clean(payload.phone);
      const password = clean(payload.password);
      if (!name || (!email && !phone) || !password) return { ok: false, reason: 'invalid' };
      const duplicate = state.clients.some(c =>
        (email && clean(c.email).toLowerCase() === email.toLowerCase()) ||
        (phone && clean(c.phone) === phone)
      );
      if (duplicate) return { ok: false, reason: 'duplicate' };
      const client = { id: uid('c'), name, phone, email, passwordHash: passwordHash(password), pets: 0, visits: 0, since: currentYear(), status: 'new' };
      setState(s => ({ ...s, clients: [...s.clients, client], currentUser: client }));
      return { ok: true, client };
    },
    addMessage: (payload) => setState(s => {
      if (!clean(payload.name) || !clean(payload.message)) return s;
      return { ...s, messages: [{ id: uid('m'), createdAt: new Date().toISOString(), status: 'new', ...payload }, ...s.messages] };
    }),
    updateMessage: (id, patch) => setState(s => ({ ...s, messages: s.messages.map(m => m.id === id ? { ...m, ...patch } : m) })),
    deleteMessage: (id) => setState(s => ({ ...s, messages: s.messages.filter(m => m.id !== id) })),
    resetState: () => {
      try { window.localStorage.removeItem(STORAGE_KEY); } catch {}
      setState(seedState);
    },
    importState: (payload) => {
      if (!payload || typeof payload !== 'object') return false;
      setState(s => ({ ...s, ...payload }));
      return true;
    },
    addAppointment: (payload = {}) => {
      const service = state.services.find(x => x.id === payload.service);
      const doctor = state.doctors.find(x => x.id === payload.doctor);
      const clientName = clean(payload.name || payload.client || state.currentUser?.name);
      const petName = clean(payload.petName || payload.pet);
      const date = clean(payload.date || todayIso());
      const time = clean(payload.time || '09:00');
      const doctorName = clean(payload.doctorName || doctor?.name || payload.doctor || '—');
      if (!clientName) return { ok: false, error: 'Вкажіть клієнта.' };
      if (!petName) return { ok: false, error: 'Вкажіть тварину.' };
      if (!date) return { ok: false, error: 'Оберіть дату запису.' };
      if (!time) return { ok: false, error: 'Оберіть час запису.' };
      if (!payload.force) {
        const reqDate = new Date(`${date}T${time}`);
        const today0 = new Date(); today0.setHours(0,0,0,0);
        if (reqDate < today0) return { ok: false, error: 'Не можна створити запис у минулому.' };
        const dow = new Date(date).getDay();
        const idx = dow === 0 ? 6 : dow - 1;
        const row = state.settings?.schedule?.[idx];
        if (row && (row.from === '—' || row.to === '—' || time < row.from || time > row.to)) {
          return { ok: false, error: 'Обраний слот поза робочим графіком клініки.' };
        }
      }
      const slotTaken = state.appointments.some(a => activeAppointment(a) && a.date === date && a.time === time && a.doctor === doctorName);
      if (slotTaken) return { ok: false, error: 'Цей слот уже зайнятий.' };
      const appointment = {
        id: uid('ap'),
        client: clientName,
        pet: petName,
        petType: payload.petType || payload.petSpecies || 'Інше',
        service: payload.serviceName || service?.name || payload.service || 'Консультація',
        doctor: doctorName,
        date,
        time,
        status: payload.status || 'waiting',
        price: Number(payload.price || service?.items?.[0]?.price || 0),
        notes: payload.notes || '',
      };
      setState(s => {
        const clientExists = s.clients.some(c => c.name === clientName);
        const clients = clientExists ? s.clients : [...s.clients, { id: uid('c'), name: clientName, phone: payload.phone || '', email: payload.email || '', pets: 1, visits: 0, since: currentYear(), status: 'new' }];
        return { ...s, appointments: [appointment, ...s.appointments], clients };
      });
      return { ok: true, appointment };
    },
    updateAppointment: (id, patch) => setState(s => {
      const current = s.appointments.find(a => a.id === id);
      if (!current) return s;
      const next = { ...current, ...patch };
      const slotTaken = s.appointments.some(a => a.id !== id && activeAppointment(a) && a.date === next.date && a.time === next.time && a.doctor === next.doctor);
      if (!clean(next.client) || !clean(next.pet) || !clean(next.date) || !clean(next.time) || slotTaken) return s;
      return { ...s, appointments: s.appointments.map(a => a.id === id ? next : a) };
    }),
    deleteAppointment: (id) => setState(s => ({ ...s, appointments: s.appointments.filter(a => a.id !== id) })),
    cancelAppointment: (id) => setState(s => ({ ...s, appointments: s.appointments.map(a => a.id === id ? { ...a, status: 'cancelled' } : a) })),
    saveClient: (client = {}) => {
      if (!clean(client.name)) return { ok: false, error: 'Вкажіть імʼя клієнта.' };
      const nextClient = client.id ? client : { ...client, id: uid('c'), since: currentYear(), visits: 0, pets: 0, status: 'new' };
      setState(s => {
        const currentUser = s.currentUser?.id === nextClient.id ? { ...s.currentUser, ...nextClient } : s.currentUser;
        return { ...s, clients: upsert(s.clients, nextClient), currentUser };
      });
      return { ok: true, client: nextClient };
    },
    deleteClient: (id) => setState(s => {
      const client = s.clients.find(c => c.id === id);
      if (!client || s.appointments.some(a => a.client === client.name && activeAppointment(a))) return s;
      return { ...s, clients: s.clients.filter(c => c.id !== id), currentUser: s.currentUser?.id === id ? null : s.currentUser };
    }),
    savePet: (pet = {}) => {
      if (!clean(pet.name)) return { ok: false, error: 'Вкажіть кличку тварини.' };
      if (!clean(pet.owner)) return { ok: false, error: 'Вкажіть власника тварини.' };
      const nextPet = pet.id ? pet : { ...pet, id: uid('p'), alerts: pet.alerts || [], lastVisit: pet.lastVisit || '—', sterilized: false };
      setState(s => ({ ...s, pets: upsert(s.pets, nextPet) }));
      return { ok: true, pet: nextPet };
    },
    deletePet: (id) => setState(s => {
      const pet = s.pets.find(p => p.id === id);
      if (!pet || s.appointments.some(a => a.pet === pet.name && activeAppointment(a))) return s;
      return { ...s, pets: s.pets.filter(p => p.id !== id) };
    }),
    saveDoctor: (doctor) => setState(s => {
      if (!clean(doctor.name) || !clean(doctor.role)) return s;
      return { ...s, doctors: upsert(s.doctors, doctor.id ? doctor : { ...doctor, id: uid('d'), services: doctor.services || [], schedule: doctor.schedule || [], exp: Number(doctor.exp || 0) }) };
    }),
    deleteDoctor: (id) => setState(s => {
      const doctor = s.doctors.find(d => d.id === id);
      if (!doctor || s.appointments.some(a => a.doctor === doctor.name && activeAppointment(a))) return s;
      return { ...s, doctors: s.doctors.filter(d => d.id !== id) };
    }),
    saveService: (service) => setState(s => {
      if (!clean(service.name)) return s;
      return { ...s, services: upsert(s.services, service.id ? service : { ...service, id: uid('svc'), items: service.items || [{ name: service.name || 'Послуга', price: 0, duration: 30 }] }) };
    }),
    deleteService: (id) => setState(s => {
      const service = s.services.find(sv => sv.id === id);
      if (!service || s.appointments.some(a => a.service === service.name && activeAppointment(a))) return s;
      return { ...s, services: s.services.filter(sv => sv.id !== id) };
    }),
    saveArticle: (article) => setState(s => {
      if (!clean(article.title)) return s;
      return { ...s, articles: upsert(s.articles, article.id ? article : { ...article, id: uid('a'), read: 4, date: formatDateUk() }) };
    }),
    deleteArticle: (id) => setState(s => ({ ...s, articles: s.articles.filter(a => a.id !== id) })),
    updateSettings: (patch) => setState(s => ({ ...s, settings: { ...s.settings, ...patch } })),
    addRole: (name) => {
      const trimmed = clean(name);
      if (!trimmed) return { ok: false, error: 'Вкажіть назву ролі.' };
      if (state.roles.some(r => r.name.toLowerCase() === trimmed.toLowerCase())) return { ok: false, error: 'Роль із такою назвою вже існує.' };
      const used = new Set(state.roles.map(r => r.c));
      const color = ['violet','rose','green','amber','coral','teal'].find(c => !used.has(c)) || 'violet';
      const role = { name: trimmed, n: 0, c: color, perms: ['Перегляд записів'] };
      setState(s => ({ ...s, roles: [...s.roles, role] }));
      return { ok: true, role };
    },
    renameRole: (oldName, newName) => {
      const trimmed = clean(newName);
      if (!trimmed) return { ok: false, error: 'Вкажіть назву ролі.' };
      if (oldName === 'Адміністратор') return { ok: false, error: 'Назву Адміністратора не можна змінювати.' };
      if (state.roles.some(r => r.name !== oldName && r.name.toLowerCase() === trimmed.toLowerCase())) return { ok: false, error: 'Роль із такою назвою вже існує.' };
      setState(s => ({ ...s, roles: s.roles.map(r => r.name === oldName ? { ...r, name: trimmed } : r) }));
      return { ok: true };
    },
    deleteRole: (name) => {
      if (name === 'Адміністратор') return { ok: false, error: 'Адміністратора видалити не можна.' };
      setState(s => ({ ...s, roles: s.roles.filter(r => r.name !== name) }));
      return { ok: true };
    },
    toggleRolePermission: (roleName, permission) => {
      if (roleName === 'Адміністратор') return { ok: false, error: 'Адміністратор має повний доступ.' };
      setState(s => ({ ...s, roles: s.roles.map(r => {
        if (r.name !== roleName) return r;
        const has = r.perms.includes(permission);
        return { ...r, perms: has ? r.perms.filter(p => p !== permission) : [...r.perms, permission] };
      }) }));
      return { ok: true };
    },
  }), [state]);

  return <StoreContext.Provider value={{ ...state, ...actions }}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const value = useContext(StoreContext);
  if (!value) throw new Error('useStore must be used within AppStoreProvider');
  return value;
};
