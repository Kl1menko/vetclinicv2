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
  integrations: [
    { id:'telegram', name:'Telegram bot', connected:true, account:'@UltraVetBot', sync:'messages' },
    { id:'viber', name:'Viber', connected:true, account:'UltraVet Львів', sync:'messages' },
    { id:'googleCalendar', name:'Google Calendar', connected:false, account:'', sync:'appointments' },
    { id:'accounting', name:'1C Бухгалтерія', connected:true, account:'UltraVet ФОП', sync:'invoices' },
  ],
};

const DEFAULT_VACCINATIONS = [
  { id:'vx1', pet:'Барсік', name:'Комплексна (FVRCP)', date:'2025-10-12', validUntil:'2026-10-12', status:'active', doctor:'Марта Коваль' },
  { id:'vx2', pet:'Рекс', name:'Сказ', date:'2025-06-05', validUntil:'2026-06-05', status:'active', doctor:'Іван Рудницький' },
  { id:'vx3', pet:'Луна', name:'Бордетела', date:'2026-01-10', validUntil:'2027-01-10', status:'active', doctor:'Анна Гарасим' },
];

const DEFAULT_MEDICAL_RECORDS = [
  { id:'mr1', pet:'Барсік', date:'2026-04-12', title:'Терапевтичний прийом', doctor:'Марта Коваль', notes:'Профілактичний огляд, все в нормі. Призначено вітамінний комплекс.', diagnosis:'Профілактичний огляд без патологій.', treatment:'Спостереження вдома, контроль через 6 місяців.', medications:'Вітамінний комплекс 1 раз на день 30 днів.', prescription:'Rp.: Вітамінний комплекс по 1 таб 1 р/д, курс 30 днів.', attachments:[], appointmentId:null },
  { id:'mr2', pet:'Рекс', date:'2026-02-10', title:'УЗД серця', doctor:'Марта Коваль', notes:'Структурних змін не виявлено. Рекомендовано контроль через 12 міс.', diagnosis:'Ознак кардіоміопатії не виявлено.', treatment:'Планове спостереження.', medications:'—', prescription:'—', attachments:[], appointmentId:null },
  { id:'mr3', pet:'Спайк', date:'2025-11-22', title:'Чистка зубів', doctor:'Ольга Середа', notes:'УЗ чистка під седацією. Видалено зуб 102.', diagnosis:'Зубний камінь, гінгівіт.', treatment:'Санація ротової порожнини.', medications:'Антисептичний гель 2 р/д 7 днів.', prescription:'Rp.: Гель стоматологічний наносити 2 р/д, 7 днів.', attachments:[], appointmentId:null },
];

const seedState = {
  services: SERVICES,
  doctors: DOCTORS,
  articles: ARTICLES,
  appointments: APPOINTMENTS,
  clients: CLIENTS,
  pets: PETS,
  reviews: REVIEWS,
  messages: [],
  medicalRecords: DEFAULT_MEDICAL_RECORDS,
  vaccinations: DEFAULT_VACCINATIONS,
  invoices: [],
  roles: DEFAULT_ROLES,
  currentUser: null,
  cookiesAccepted: false,
  settings: DEFAULT_SETTINGS,
};

const StoreContext = createContext(null);

const uid = (prefix) => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
const clean = (value) => String(value || '').trim();
const activeAppointment = (appointment) => !['completed', 'cancelled'].includes(appointment.status);
const currentYear = () => String(new Date().getFullYear());
const sameText = (a, b) => clean(a).toLowerCase() === clean(b).toLowerCase();
const appointmentPaidPatch = (patch = {}) => {
  if (patch.status !== 'completed') return patch;
  return {
    ...patch,
    paymentStatus: patch.paymentStatus || 'paid',
    paymentMethod: patch.paymentMethod || 'cash',
    paidAt: patch.paidAt || todayIso(),
  };
};
const withClientStats = (state) => ({
  ...state,
  clients: state.clients.map(client => {
    const name = clean(client.name);
    const pets = state.pets.filter(p => sameText(p.owner, name)).length;
    const visits = state.appointments.filter(a => sameText(a.client, name) && a.status === 'completed').length;
    return { ...client, pets, visits };
  }),
});
const makeInvoice = (appointment) => ({
  id: `inv_${appointment.id}`,
  appointmentId: appointment.id,
  client: appointment.client,
  pet: appointment.pet,
  date: appointment.paidAt || appointment.date || todayIso(),
  amount: Number(appointment.price || 0),
  status: appointment.paymentStatus === 'paid' ? 'paid' : 'unpaid',
  method: appointment.paymentMethod || '',
});
const syncInvoices = (state) => {
  const generated = state.appointments
    .filter(a => a.status === 'completed')
    .map(makeInvoice);
  const generatedIds = new Set(generated.map(i => i.appointmentId));
  const manual = (state.invoices || []).filter(i => !generatedIds.has(i.appointmentId));
  return { ...state, invoices: [...generated, ...manual] };
};
const resolveService = (services, payload = {}) => {
  const key = clean(payload.serviceName || payload.service);
  return services.find(service =>
    sameText(service.id, key) ||
    sameText(service.name, key) ||
    service.items?.some(item => sameText(item.name, key))
  );
};
const normalizeAttachments = (attachments = []) => (
  Array.isArray(attachments)
    ? attachments
      .filter(item => item && (item.url || item.name))
      .map(item => ({
        id: item.id || uid('att'),
        name: clean(item.name || 'file'),
        type: clean(item.type || 'application/octet-stream'),
        size: Number(item.size || 0),
        url: item.url || '',
        addedAt: item.addedAt || new Date().toISOString(),
      }))
    : []
);
const buildMedicalRecordFromAppointment = (appointment, existingId = null) => ({
  id: existingId || uid('mr'),
  pet: appointment.pet,
  date: appointment.date,
  title: appointment.service,
  doctor: appointment.doctor,
  notes: appointment.notes || 'Прийом завершено.',
  diagnosis: appointment.diagnosis || '',
  treatment: appointment.treatment || '',
  medications: appointment.medications || '',
  prescription: appointment.prescription || '',
  attachments: normalizeAttachments(appointment.attachments),
  appointmentId: appointment.id,
});
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
        medicalRecords: Array.isArray(parsed.medicalRecords) ? parsed.medicalRecords : DEFAULT_MEDICAL_RECORDS,
        vaccinations: Array.isArray(parsed.vaccinations) ? parsed.vaccinations : DEFAULT_VACCINATIONS,
        invoices: Array.isArray(parsed.invoices) ? parsed.invoices : [],
        roles: Array.isArray(parsed.roles) && parsed.roles.length ? parsed.roles : DEFAULT_ROLES,
        settings: {
          ...DEFAULT_SETTINGS,
          ...(parsed.settings || {}),
          clinic: { ...DEFAULT_SETTINGS.clinic, ...(parsed.settings?.clinic || {}) },
          notifications: { ...DEFAULT_SETTINGS.notifications, ...(parsed.settings?.notifications || {}) },
          schedule: parsed.settings?.schedule || DEFAULT_SETTINGS.schedule,
          integrations: Array.isArray(parsed.settings?.integrations) ? parsed.settings.integrations : DEFAULT_SETTINGS.integrations,
        },
      };
  } catch {
    return seedState;
  }
};

const upsert = (items, item) => {
  if (!item?.id) return [...items, item];
  const exists = items.some(x => x.id === item.id);
  if (!exists) return [...items, item];
  return items.map(x => x.id === item.id ? { ...x, ...item } : x);
};

let _accessToken = null;

export const AppStoreProvider = ({ children }) => {
  const [state, setState] = useState(readInitialState);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const actions = useMemo(() => ({
    acceptCookies: () => setState(s => ({ ...s, cookiesAccepted: true })),
    setCurrentUser: (user) => setState(s => ({ ...s, currentUser: user || null })),
    setAccessToken: (token) => { _accessToken = token || null; },
    getAccessToken: () => _accessToken,
    logout: () => {
      fetch('/api/auth/refresh', { method: 'DELETE', credentials: 'include' }).catch(() => {});
      _accessToken = null;
      setState(s => ({ ...s, currentUser: null }));
    },
    addMessage: (payload) => setState(s => {
      if (!clean(payload.name) || !clean(payload.message)) return s;
      return { ...s, messages: [{ id: uid('m'), createdAt: new Date().toISOString(), status: 'new', readAt: null, viewedAt: null, ...payload }, ...s.messages] };
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
      const service = resolveService(state.services, payload);
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
      const appointment = appointmentPaidPatch({
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
        paymentStatus: payload.paymentStatus || (payload.status === 'completed' ? 'paid' : 'unpaid'),
        paymentMethod: payload.paymentMethod || '',
        paidAt: payload.paidAt || '',
        notes: payload.notes || '',
        diagnosis: payload.diagnosis || '',
        treatment: payload.treatment || '',
        medications: payload.medications || '',
        prescription: payload.prescription || '',
        attachments: normalizeAttachments(payload.attachments),
      });
      setState(s => {
        const clientExists = s.clients.some(c => sameText(c.name, clientName));
        const petExists = s.pets.some(p => sameText(p.name, petName) && sameText(p.owner, clientName));
        const clients = clientExists ? s.clients : [...s.clients, { id: uid('c'), name: clientName, phone: payload.phone || '', email: payload.email || '', pets: 0, visits: 0, since: currentYear(), status: 'new' }];
        const pets = petExists ? s.pets : [...s.pets, { id: uid('p'), name: petName, owner: clientName, species: payload.petType || payload.petSpecies || 'Інше', breed: payload.breed || '', age: Number(payload.age || 0), weight: Number(payload.weight || 0), alerts: [], lastVisit: '—', sterilized: false }];
        const base = withClientStats({ ...s, appointments: [appointment, ...s.appointments], clients, pets });
        const withRecord = appointment.status === 'completed'
          ? { ...base, medicalRecords: [buildMedicalRecordFromAppointment(appointment), ...base.medicalRecords] }
          : base;
        return syncInvoices(withRecord);
      });
      return { ok: true, appointment };
    },
    updateAppointment: (id, patch) => {
      const current = state.appointments.find(a => a.id === id);
      if (!current) return { ok: false, error: 'Запис не знайдено.' };
      const next = { ...current, ...appointmentPaidPatch(patch) };
      const slotTaken = state.appointments.some(a => a.id !== id && activeAppointment(a) && a.date === next.date && a.time === next.time && a.doctor === next.doctor);
      if (!clean(next.client) || !clean(next.pet) || !clean(next.date) || !clean(next.time)) return { ok: false, error: 'Заповніть клієнта, тварину, дату і час.' };
      if (slotTaken) return { ok: false, error: 'Цей слот уже зайнятий.' };
      setState(s => {
        const clientExists = s.clients.some(c => sameText(c.name, next.client));
        const petExists = s.pets.some(p => sameText(p.name, next.pet) && sameText(p.owner, next.client));
        const clients = clientExists ? s.clients : [...s.clients, { id: uid('c'), name: clean(next.client), phone: next.phone || '', email: next.email || '', pets: 0, visits: 0, since: currentYear(), status: 'new' }];
        const pets = petExists ? s.pets : [...s.pets, { id: uid('p'), name: clean(next.pet), owner: clean(next.client), species: next.petType || 'Інше', breed: next.breed || '', age: Number(next.age || 0), weight: Number(next.weight || 0), alerts: [], lastVisit: '—', sterilized: false }];
        const updated = s.appointments.map(a => a.id === id ? next : a);
        const hasRecord = s.medicalRecords.some(r => r.appointmentId === id);
        const records = next.status === 'completed'
          ? (hasRecord
            ? s.medicalRecords.map(r => r.appointmentId === id ? buildMedicalRecordFromAppointment(next, r.id) : r)
            : [buildMedicalRecordFromAppointment(next), ...s.medicalRecords])
          : s.medicalRecords;
        return syncInvoices(withClientStats({ ...s, appointments: updated, clients, pets, medicalRecords: records }));
      });
      return { ok: true, appointment: next };
    },
    deleteAppointment: (id) => setState(s => syncInvoices(withClientStats({ ...s, appointments: s.appointments.filter(a => a.id !== id), medicalRecords: s.medicalRecords.filter(r => r.appointmentId !== id), invoices: s.invoices.filter(i => i.appointmentId !== id) }))),
    cancelAppointment: (id) => setState(s => withClientStats({ ...s, appointments: s.appointments.map(a => a.id === id ? { ...a, status: 'cancelled' } : a) })),
    saveClient: (client = {}) => {
      if (!clean(client.name)) return { ok: false, error: 'Вкажіть імʼя клієнта.' };
      const duplicate = state.clients.some(c => c.id !== client.id && (
        (clean(client.email) && sameText(c.email, client.email)) ||
        (clean(client.phone) && clean(c.phone) === clean(client.phone))
      ));
      if (duplicate) return { ok: false, error: 'Клієнт з таким телефоном або email вже є в базі.' };
      const nextClient = client.id ? client : { ...client, id: uid('c'), since: currentYear(), visits: 0, pets: 0, status: 'new' };
      setState(s => {
        const currentUser = s.currentUser?.id === nextClient.id ? { ...s.currentUser, ...nextClient } : s.currentUser;
        return withClientStats({ ...s, clients: upsert(s.clients, nextClient), currentUser });
      });
      return { ok: true, client: nextClient };
    },
    deleteClient: (id) => {
      const client = state.clients.find(c => c.id === id);
      if (!client) return { ok: false, error: 'Клієнта не знайдено.' };
      if (state.appointments.some(a => a.client === client.name && activeAppointment(a))) {
        return { ok: false, error: 'Не можна видалити клієнта з активними записами.' };
      }
      setState(s => withClientStats({ ...s, clients: s.clients.filter(c => c.id !== id), currentUser: s.currentUser?.id === id ? null : s.currentUser }));
      return { ok: true };
    },
    savePet: (pet = {}) => {
      if (!clean(pet.name)) return { ok: false, error: 'Вкажіть кличку тварини.' };
      if (!clean(pet.owner)) return { ok: false, error: 'Вкажіть власника тварини.' };
      const duplicate = state.pets.some(p => p.id !== pet.id && sameText(p.name, pet.name) && sameText(p.owner, pet.owner));
      if (duplicate) return { ok: false, error: 'У цього клієнта вже є тварина з такою кличкою.' };
      const ownerName = clean(pet.owner);
      const nextPet = pet.id ? pet : { ...pet, id: uid('p'), alerts: pet.alerts || [], lastVisit: pet.lastVisit || '—', sterilized: false };
      setState(s => {
        const hasOwner = s.clients.some(c => sameText(c.name, ownerName));
        const clients = hasOwner ? s.clients : [...s.clients, { id: uid('c'), name: ownerName, phone: pet.ownerPhone || '', email: pet.ownerEmail || '', pets: 0, visits: 0, since: currentYear(), status: 'new' }];
        return withClientStats({ ...s, clients, pets: upsert(s.pets, nextPet) });
      });
      return { ok: true, pet: nextPet };
    },
    deletePet: (id) => {
      const pet = state.pets.find(p => p.id === id);
      if (!pet) return { ok: false, error: 'Тварину не знайдено.' };
      if (state.appointments.some(a => a.pet === pet.name && activeAppointment(a))) {
        return { ok: false, error: 'Не можна видалити тварину з активними записами.' };
      }
      setState(s => withClientStats({ ...s, pets: s.pets.filter(p => p.id !== id) }));
      return { ok: true };
    },
    saveDoctor: (doctor = {}) => {
      if (!clean(doctor.name) || !clean(doctor.role)) return { ok:false, error:'Вкажіть імʼя та спеціалізацію лікаря.' };
      const duplicate = state.doctors.some(d => d.id !== doctor.id && sameText(d.name, doctor.name));
      if (duplicate) return { ok:false, error:'Лікар із таким імʼям уже є.' };
      const next = doctor.id ? doctor : { ...doctor, id: uid('d'), services: doctor.services || [], schedule: doctor.schedule || [], exp: Number(doctor.exp || 0) };
      setState(s => ({ ...s, doctors: upsert(s.doctors, next) }));
      return { ok:true, doctor: next };
    },
    deleteDoctor: (id) => {
      const doctor = state.doctors.find(d => d.id === id);
      if (!doctor) return { ok:false, error:'Лікаря не знайдено.' };
      if (state.appointments.some(a => a.doctor === doctor.name && activeAppointment(a))) return { ok:false, error:'Не можна видалити лікаря з активними записами.' };
      setState(s => ({ ...s, doctors: s.doctors.filter(d => d.id !== id) }));
      return { ok:true };
    },
    saveService: (service = {}) => {
      if (!clean(service.name)) return { ok:false, error:'Вкажіть назву послуги.' };
      const duplicate = state.services.some(sv => sv.id !== service.id && sameText(sv.name, service.name));
      if (duplicate) return { ok:false, error:'Послуга з такою назвою вже є.' };
      const next = service.id ? service : { ...service, id: uid('svc'), items: service.items || [{ name: service.name || 'Послуга', price: 0, duration: 30 }] };
      setState(s => ({ ...s, services: upsert(s.services, next) }));
      return { ok:true, service: next };
    },
    deleteService: (id) => {
      const service = state.services.find(sv => sv.id === id);
      if (!service) return { ok:false, error:'Послугу не знайдено.' };
      const serviceNames = new Set([service.name, ...(service.items || []).map(i => i.name)]);
      if (state.appointments.some(a => serviceNames.has(a.service) && activeAppointment(a))) return { ok:false, error:'Не можна видалити послугу з активними записами.' };
      setState(s => ({ ...s, services: s.services.filter(sv => sv.id !== id) }));
      return { ok:true };
    },
    saveArticle: (article = {}) => {
      if (!clean(article.title)) return { ok:false, error:'Вкажіть заголовок статті.' };
      const next = article.id ? article : { ...article, id: uid('a'), views: Number(article.views || 0), read: Number(article.read || 4), date: article.date || formatDateUk() };
      setState(s => ({ ...s, articles: upsert(s.articles, next) }));
      return { ok:true, article: next };
    },
    deleteArticle: (id) => {
      if (!state.articles.some(a => a.id === id)) return { ok:false, error:'Статтю не знайдено.' };
      setState(s => ({ ...s, articles: s.articles.filter(a => a.id !== id) }));
      return { ok:true };
    },
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
