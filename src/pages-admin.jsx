// Admin pages
import React, { useState as uA, useMemo as uMA } from 'react';
import { Icon, Logo, PetIllustration, Avatar, StatusPill, Stars } from './components.jsx';
import { useStore, ALL_PERMISSIONS as ALL_ROLE_PERMISSIONS } from './store.jsx';

const UK_WEEKDAYS = ['Неділя','Понеділок','Вівторок','Середа','Четвер','Пʼятниця','Субота'];
const UK_MONTHS_GEN = ['січня','лютого','березня','квітня','травня','червня','липня','серпня','вересня','жовтня','листопада','грудня'];
const formatDateUk = (d = new Date()) => `${d.getDate()} ${UK_MONTHS_GEN[d.getMonth()]} ${d.getFullYear()}`;
const formatTodayLong = () => { const d = new Date(); return `${UK_WEEKDAYS[d.getDay()]} · ${formatDateUk(d)}`; };
const matches = (value, query) => JSON.stringify(value).toLowerCase().includes((query || '').toLowerCase());
const csv = (value) => String(value || '').split(',').map(x => x.trim()).filter(Boolean);
const toNum = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const money = (value) => `${Math.round(value).toLocaleString('uk-UA')} ₴`;
const parseIsoDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || '')) ? new Date(`${value}T00:00:00`) : null;
const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
const validPhone = (value) => /^\+?[\d\s\-()]{10,}$/.test(String(value || '').trim());
const validTime = (value) => value === '—' || /^([01]\d|2[0-3]):[0-5]\d$/.test(String(value || '').trim());
const isoDate = (date) => date.toISOString().slice(0, 10);
const fmtDateTime = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('uk-UA', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' });
  } catch {
    return String(iso).slice(0, 16);
  }
};
const downloadCsv = (filename, rows) => {
  const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const body = rows.map(row => row.map(escape).join(',')).join('\n');
  const blob = new Blob([`\uFEFF${body}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
const downloadText = (filename, text) => {
  const blob = new Blob([String(text || '')], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result || ''));
  reader.onerror = () => reject(new Error('Не вдалося зчитати файл.'));
  reader.readAsDataURL(file);
});
const reportMetrics = (appointments) => {
  const completed = appointments.filter(a => a.status === 'completed');
  const paid = completed.filter(a => (a.paymentStatus || 'paid') === 'paid');
  const unpaid = completed.filter(a => (a.paymentStatus || 'paid') !== 'paid');
  const revenue = paid.reduce((sum, a) => sum + Number(a.price || 0), 0);
  const receivables = unpaid.reduce((sum, a) => sum + Number(a.price || 0), 0);
  const avg = paid.length ? revenue / paid.length : 0;
  const byService = appointments.reduce((acc, a) => ({ ...acc, [a.service]: (acc[a.service] || 0) + 1 }), {});
  const topServices = Object.entries(byService).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([name,count]) => ({ n:name, p: Math.round((count / Math.max(appointments.length, 1)) * 100) }));
  const weekDays = ['Нд','Пн','Вт','Ср','Чт','Пт','Сб'];
  const byDay = weekDays.map((d, day) => ({ d, v: appointments.filter(a => new Date(a.date).getDay() === day).length, c: completed.filter(a => new Date(a.date).getDay() === day).length }));
  return { completed, paid, unpaid, revenue, receivables, avg, topServices, byDay };
};
const DASHBOARD_PERIODS = [
  { k:'week', l:'Тиждень', title:'Записи за тиждень' },
  { k:'month', l:'Місяць', title:'Записи за місяць' },
  { k:'year', l:'Рік', title:'Записи за рік' },
];
const monthShort = ['Січ','Лют','Бер','Кві','Тра','Чер','Лип','Сер','Вер','Жов','Лис','Гру'];
const weekShort = ['Нд','Пн','Вт','Ср','Чт','Пт','Сб'];
const isPlanned = (status) => !['completed', 'cancelled'].includes(status);
const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const dashboardSeries = (appointments, period) => {
  const now = new Date();
  const dated = appointments
    .map(a => ({ ...a, parsedDate: parseIsoDate(a.date) }))
    .filter(a => a.parsedDate);
  if (period === 'year') {
    const currentYear = now.getFullYear();
    const points = monthShort.map((d, i) => {
      const bucket = dated.filter(a => a.parsedDate.getFullYear() === currentYear && a.parsedDate.getMonth() === i);
      return { d, v: bucket.filter(a => isPlanned(a.status)).length, c: bucket.filter(a => a.status === 'completed').length };
    });
    const total = dated.filter(a => a.parsedDate.getFullYear() === currentYear && a.status !== 'cancelled').length;
    return { points, total };
  }
  if (period === 'month') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const points = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const bucket = dated.filter(a => a.parsedDate.getFullYear() === year && a.parsedDate.getMonth() === month && a.parsedDate.getDate() === day);
      return { d: String(day), v: bucket.filter(a => isPlanned(a.status)).length, c: bucket.filter(a => a.status === 'completed').length };
    });
    const total = dated.filter(a => a.parsedDate.getFullYear() === year && a.parsedDate.getMonth() === month && a.status !== 'cancelled').length;
    return { points, total };
  }
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const points = weekShort.map((d, i) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    const bucket = dated.filter(a => sameDay(a.parsedDate, day));
    return { d, v: bucket.filter(a => isPlanned(a.status)).length, c: bucket.filter(a => a.status === 'completed').length };
  });
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const total = dated.filter(a => a.parsedDate >= weekStart && a.parsedDate <= weekEnd && a.status !== 'cancelled').length;
  return { points, total };
};

export const AdminLayout = ({ current, setRoute, role, setRole, roleOptions = [], exitAdmin, children, search, setSearch, allowedRoutes = null }) => {
  const { appointments, messages, pets, updateMessage } = useStore();
  const [showNotifications, setShowNotifications] = uA(false);
  const unreadMessages = messages.filter(m => !m.readAt);
  const unreadCountRef = React.useRef(unreadMessages.length);
  const audioCtxRef = React.useRef(null);
  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return undefined;
    if (!audioCtxRef.current) {
      try { audioCtxRef.current = new Ctx(); } catch {}
    }
    const unlock = () => {
      const ctx = audioCtxRef.current;
      if (!ctx || ctx.state === 'running') return;
      try { ctx.resume(); } catch {}
    };
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);
  React.useEffect(() => {
    if (unreadMessages.length > unreadCountRef.current && typeof window !== 'undefined') {
      try {
        const ctx = audioCtxRef.current;
        if (ctx && ctx.state === 'suspended') ctx.resume();
        if (ctx && ctx.state === 'running') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(740, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(980, ctx.currentTime + 0.14);
          gain.gain.setValueAtTime(0.001, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.24);
        }
      } catch {}
    }
    unreadCountRef.current = unreadMessages.length;
  }, [unreadMessages.length]);
  const notifications = [
    ...unreadMessages
      .slice()
      .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
      .slice(0, 6)
      .map(m => ({
      id: `m-${m.id}`,
      title: `${m.readAt ? 'Повідомлення' : 'Нове повідомлення'} · ${m.name || 'Клієнт'}`,
      body: m.message || 'Без тексту повідомлення',
      meta: `${fmtDateTime(m.createdAt)}${m.phone ? ` · ${m.phone}` : ''}`,
      unread: !m.readAt,
      route: 'messages',
      onOpen: () => updateMessage(m.id, { readAt:new Date().toISOString(), viewedAt:new Date().toISOString() }),
    })),
  ].slice(0, 8);
  const items = [
    { k:'dashboard', l:'Дашборд', i:'chart' },
    { k:'calendar', l:'Календар', i:'calendar' },
    { k:'appointments', l:'Записи', i:'list' },
    { k:'clients', l:'Клієнти', i:'users' },
    { k:'pets', l:'Тварини', i:'paw' },
    { k:'doctors', l:'Лікарі', i:'user' },
    { k:'services', l:'Послуги', i:'heart' },
    { k:'articles', l:'Статті', i:'book' },
    { k:'messages', l:'Повідомлення', i:'mail', badge: unreadMessages.length },
    { k:'reports', l:'Звіти', i:'activity' },
    { k:'roles', l:'Ролі', i:'shield' },
    { k:'settings', l:'Налаштування', i:'settings' },
  ];
  return (
    <div style={{display:'grid', gridTemplateColumns:'248px 1fr', minHeight:'100vh', background:'#0d1a1a', color:'#cfdcdb'}} data-screen-label={`ADMIN · ${current}`}>
      <aside style={{background:'#091414', borderRight:'1px solid rgba(255,255,255,0.06)', padding:20, position:'sticky', top:0, height:'100vh', display:'flex', flexDirection:'column'}}>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:24, padding:'4px 8px'}}>
          <div style={{width:36, height:36, display:'grid', placeItems:'center'}}><Logo size={32} color="#fff"/></div>
          <div>
            <div style={{fontFamily:'var(--font-display)', fontWeight:700, color:'#fff', fontSize:15}}>UltraVet</div>
            <div style={{fontSize:10, color:'#8aa6a4', textTransform:'uppercase', letterSpacing:'0.06em'}}>Admin</div>
          </div>
        </div>
        <div style={{padding:'10px 12px', background:'rgba(255,255,255,0.03)', borderRadius:10, marginBottom:18, fontSize:12}}>
          <div style={{color:'#8aa6a4', marginBottom:6}}>Роль</div>
          <select value={role} onChange={e=>setRole(e.target.value)} style={{width:'100%', background:'transparent', color:'#fff', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'6px 8px', fontSize:13}}>
            {(roleOptions || []).map(name => <option key={name} value={name}>{name}</option>)}
          </select>
        </div>
        <nav style={{display:'flex', flexDirection:'column', gap:2}}>
          {items.filter(it => !allowedRoutes || allowedRoutes.includes(it.k)).map(it => (
            <button key={it.k} onClick={()=>setRoute(it.k)}
              style={{display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:9, border:0, background: current===it.k?'var(--teal-600)':'transparent', color: current===it.k?'#fff':'#cfdcdb', fontWeight: current===it.k?600:500, fontSize:13.5, cursor:'pointer', textAlign:'left'}}>
              <Icon name={it.i} size={16}/> {it.l}
              {it.badge > 0 && (
                <span style={{marginLeft:'auto', minWidth:18, height:18, padding:'0 6px', borderRadius:99, background:'var(--coral-500)', color:'#fff', fontSize:10, fontWeight:700, display:'inline-flex', alignItems:'center', justifyContent:'center'}}>
                  {it.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
        <button onClick={exitAdmin} style={{display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:9, border:0, background:'transparent', color:'#cfdcdb', fontSize:13, cursor:'pointer', marginTop:'auto'}}>
          <Icon name="logout" size={16}/> Вийти на сайт
        </button>
      </aside>
      <main>
        <header style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 32px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'#0d1a1a', position:'sticky', top:0, zIndex:30}}>
          <div style={{position:'relative', width:380}}>
            <div style={{position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#6d8483'}}><Icon name="search" size={16}/></div>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Пошук клієнтів, тварин, записів..." style={{width:'100%', padding:'10px 14px 10px 40px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, color:'#fff', fontSize:13.5, outline:'none'}}/>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:14}}>
            <div style={{position:'relative'}}>
            <button onClick={()=>setShowNotifications(v=>!v)} style={{position:'relative', width:36, height:36, borderRadius:10, background:'rgba(255,255,255,0.05)', border:0, color:'#cfdcdb', cursor:'pointer'}}>
              <Icon name="bell" size={16}/>
              {unreadMessages.length > 0 && <div style={{position:'absolute', top:6, right:6, width:7, height:7, borderRadius:'50%', background:'var(--coral-500)'}}></div>}
            </button>
            {showNotifications && (
              <div style={{position:'absolute', right:0, top:44, width:340, background:'#0f2120', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, boxShadow:'0 20px 50px rgba(0,0,0,0.25)', overflow:'hidden', zIndex:50}}>
                <div style={{padding:'12px 14px', borderBottom:'1px solid rgba(255,255,255,0.06)', color:'#fff', fontWeight:600, fontSize:13}}>Сповіщення</div>
                {notifications.length ? notifications.map(n => (
                  <button key={n.id} onClick={()=>{ n.onOpen?.(); setRoute(n.route); setShowNotifications(false); }} style={{display:'block', width:'100%', padding:'12px 14px', border:0, borderTop:'1px solid rgba(255,255,255,0.04)', background:'transparent', textAlign:'left', cursor:'pointer'}}>
                    <div style={{color:'#fff', fontSize:13, fontWeight:600, marginBottom:3}}>{n.title}</div>
                    <div style={{color:'#8aa6a4', fontSize:12, lineHeight:1.35}}>{n.body}</div>
                    {n.meta && <div style={{color:'#6d8483', fontSize:11, marginTop:5}}>{n.meta}</div>}
                  </button>
                )) : (
                  <div style={{padding:16, color:'#8aa6a4', fontSize:13}}>Немає нових сповіщень</div>
                )}
              </div>
            )}
            </div>
            <div style={{display:'flex', alignItems:'center', gap:10, padding:'4px 10px 4px 4px', background:'rgba(255,255,255,0.05)', borderRadius:999}}>
              <Avatar name="Олена Ткач" size={28}/>
              <div style={{fontSize:13}}>
                <div style={{color:'#fff', fontWeight:600, lineHeight:1}}>Олена Ткач</div>
                <div style={{color:'#8aa6a4', fontSize:11}}>{role}</div>
              </div>
            </div>
          </div>
        </header>
        <div style={{padding:32}}>{children}</div>
      </main>
    </div>
  );
};

// Reusable admin card
const ACard = ({ children, style }) => (
  <div style={{background:'#0f2120', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, ...style}}>{children}</div>
);

const A_INPUT_STYLE = { width:'100%', padding:'10px 12px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, color:'#fff', fontSize:13, outline:'none' };
const AInput = React.forwardRef(({ style, ...rest }, ref) => (
  <input ref={ref} {...rest} style={{ ...A_INPUT_STYLE, ...style }}/>
));
const ATextarea = ({ style, ...rest }) => (
  <textarea {...rest} style={{ ...A_INPUT_STYLE, fontFamily:'inherit', resize:'vertical', ...style }}/>
);
const ASelect = ({ children, style, ...rest }) => (
  <select {...rest} style={{ ...A_INPUT_STYLE, ...style }}>{children}</select>
);
const AField = ({ label, hint, children }) => (
  <div>
    <label style={{fontSize:12, color:'#8aa6a4', marginBottom:6, display:'block'}}>{label}</label>
    {children}
    {hint && <div style={{color:'#8aa6a4', fontSize:11, marginTop:6}}>{hint}</div>}
  </div>
);
const ABtn = ({ tone = 'soft', size = 'md', icon, children, style, ...rest }) => {
  const padding = size === 'sm' ? '8px 12px' : size === 'icon' ? 0 : '10px 14px';
  const tones = {
    soft: { background:'rgba(255,255,255,0.05)', color:'#cfdcdb' },
    primary: { background:'var(--teal-600)', color:'#fff' },
    danger: { background:'rgba(255,90,90,0.15)', color:'var(--coral-500)' },
    ghost: { background:'transparent', color:'#cfdcdb' },
  };
  const sizing = size === 'icon' ? { width:30, height:30, display:'grid', placeItems:'center' } : { display:'inline-flex', alignItems:'center', gap:8, justifyContent:'center' };
  return (
    <button {...rest} style={{ padding, border:0, borderRadius:8, fontSize:13, cursor:'pointer', ...sizing, ...tones[tone], ...style }}>
      {icon && <Icon name={icon} size={14}/>} {children}
    </button>
  );
};

const AdminModal = ({ title, values, fields, onChange, onFileChange, onClose, onSubmit, submitLabel = 'Зберегти' }) => (
  <div className="backdrop" onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{width:'100%', maxWidth:520, maxHeight:'92vh', overflowY:'auto', background:'#0f2120', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:24, boxShadow:'0 24px 70px rgba(0,0,0,0.35)'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18}}>
        <h2 style={{fontSize:22, color:'#fff'}}>{title}</h2>
        <button onClick={onClose} style={{width:32, height:32, borderRadius:8, border:0, background:'rgba(255,255,255,0.06)', color:'#cfdcdb', cursor:'pointer'}}><Icon name="x" size={16}/></button>
      </div>
      <div style={{display:'grid', gap:12}}>
        {fields.map(f => (
          <div key={f.key}>
            <label style={{fontSize:12, color:'#8aa6a4', marginBottom:6, display:'block'}}>{f.label}</label>
            {f.type === 'textarea' ? (
              <ATextarea rows="3" disabled={Boolean(f.disabled)} value={values[f.key] || ''} onChange={e=>onChange(f.key, e.target.value)}/>
            ) : f.type === 'file' ? (
              <div style={{display:'grid', gap:8}}>
                <AInput type="file" disabled={Boolean(f.disabled)} multiple={f.multiple !== false} accept={f.accept || '*/*'} onChange={e=>onFileChange?.(f.key, Array.from(e.target.files || []))}/>
                {Array.isArray(values[f.key]) && values[f.key].length > 0 && (
                  <div style={{display:'grid', gap:6}}>
                    {values[f.key].map((item, idx) => (
                      <div key={item.id || `${item.name}-${idx}`} style={{display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:12, color:'#cfdcdb', background:'rgba(255,255,255,0.04)', borderRadius:8, padding:'6px 8px'}}>
                        <span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{item.name}</span>
                        <button type="button" disabled={Boolean(f.disabled)} onClick={()=>onChange(f.key, (values[f.key] || []).filter((_, i) => i !== idx))} style={{border:0, background:'transparent', color:'#e64561', cursor:'pointer', opacity:Boolean(f.disabled)?0.5:1}}>видалити</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : f.type === 'select' ? (
              <ASelect disabled={Boolean(f.disabled)} value={values[f.key] || ''} onChange={e=>onChange(f.key, e.target.value)}>
                {(f.options || []).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </ASelect>
            ) : f.type === 'datalist' ? (
              <>
                <AInput disabled={Boolean(f.disabled)} list={`dl-${f.key}`} value={values[f.key] || ''} onChange={e=>onChange(f.key, e.target.value)} placeholder={f.placeholder}/>
                <datalist id={`dl-${f.key}`}>
                  {(f.options || []).map(o => <option key={o} value={o}/>)}
                </datalist>
              </>
            ) : (
              <AInput disabled={Boolean(f.disabled)} type={f.type || 'text'} value={values[f.key] || ''} onChange={e=>onChange(f.key, e.target.value)}/>
            )}
          </div>
        ))}
      </div>
      <div style={{display:'flex', justifyContent:'flex-end', gap:10, marginTop:20}}>
        <button className="btn btn-sm" onClick={onClose} style={{background:'rgba(255,255,255,0.06)', color:'#fff'}}>Скасувати</button>
        <button className="btn btn-primary btn-sm" onClick={onSubmit}>{submitLabel}</button>
      </div>
    </div>
  </div>
);

const AdminConfirmDialog = ({ state, onCancel, onConfirm }) => {
  if (!state) return null;
  return (
    <div className="backdrop" onClick={onCancel}>
      <div onClick={e=>e.stopPropagation()} style={{width:'100%', maxWidth:420, background:'#0f2120', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:22, boxShadow:'0 24px 70px rgba(0,0,0,0.35)'}}>
        <div style={{display:'flex', gap:12, alignItems:'flex-start', marginBottom:18}}>
          <div style={{width:38, height:38, borderRadius:10, background:'rgba(255,90,90,0.14)', color:'var(--coral-500)', display:'grid', placeItems:'center', flexShrink:0}}>
            <Icon name="alert" size={18}/>
          </div>
          <div>
            <h2 style={{fontSize:19, color:'#fff', marginBottom:6}}>{state.title || 'Підтвердити дію'}</h2>
            <p style={{color:'#a8bcba', fontSize:13, lineHeight:1.55}}>{state.message}</p>
          </div>
        </div>
        <div style={{display:'flex', justifyContent:'flex-end', gap:10}}>
          <ABtn onClick={onCancel}>Скасувати</ABtn>
          <ABtn tone="danger" icon="trash" onClick={onConfirm}>{state.confirmLabel || 'Видалити'}</ABtn>
        </div>
      </div>
    </div>
  );
};

const useAdminConfirm = () => {
  const [state, setState] = uA(null);
  const ask = (message, onConfirm, options = {}) => setState({ message, onConfirm, ...options });
  const close = () => setState(null);
  const confirm = () => {
    const action = state?.onConfirm;
    close();
    action?.();
  };
  return { ask, confirmDialog: <AdminConfirmDialog state={state} onCancel={close} onConfirm={confirm}/> };
};

// =================================================================
// DASHBOARD
// =================================================================
export const AdminDashboard = ({ role, search = '', setRoute }) => {
  const { appointments, clients } = useStore();
  const [period, setPeriod] = uA('week');
  const visibleAppointments = appointments.filter(a => matches(a, search));
  const metrics = reportMetrics(visibleAppointments);
  const periodData = uMA(() => dashboardSeries(visibleAppointments, period), [visibleAppointments, period]);
  const periodMeta = DASHBOARD_PERIODS.find(p => p.k === period) || DASHBOARD_PERIODS[0];
  const today = visibleAppointments.filter(a => a.date === new Date().toISOString().slice(0,10));
  const stats = [
    { l:'Записів сьогодні', v:today.length, d:`+${today.filter(a=>a.status==='waiting').length}`, icon:'calendar', c:'teal' },
    { l:'Нових клієнтів', v:clients.filter(c=>c.status==='new').length, d:`${clients.length} всього`, icon:'users', c:'coral' },
    { l:'Оплачений дохід', v:money(metrics.revenue), d:`${metrics.paid.length} оплат`, icon:'money', c:'amber' },
    { l:'Завершено', v:metrics.completed.length, d:`${visibleAppointments.length} всього`, icon:'check', c:'green' },
  ];
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:24}}>
        <div>
          <h1 style={{fontSize:28, color:'#fff', marginBottom:4}}>Дашборд</h1>
          <p style={{color:'#8aa6a4', fontSize:14}}>{formatTodayLong()} · Огляд клініки</p>
        </div>
          <button className="btn btn-primary" onClick={()=>setRoute?.('appointments')}><Icon name="plus" size={14} color="#fff"/> Новий запис</button>
      </div>

      {/* Stats */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:18}}>
        {stats.map((s,i)=>(
          <ACard key={i} style={{padding:20}}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14}}>
              <div style={{width:40, height:40, borderRadius:11, background:`var(--${s.c}-500)`, opacity:.85, display:'grid', placeItems:'center'}}>
                <Icon name={s.icon} size={18} color="#fff"/>
              </div>
              <div style={{fontSize:12, fontWeight:600, color: s.d.startsWith('+')?'var(--teal-300)':'var(--coral-500)'}}>{s.d}</div>
            </div>
            <div style={{fontFamily:'var(--font-display)', fontSize:30, fontWeight:700, color:'#fff', letterSpacing:'-0.02em'}}>{s.v}</div>
            <div style={{fontSize:13, color:'#8aa6a4', marginTop:2}}>{s.l}</div>
          </ACard>
        ))}
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:18, marginBottom:18}}>
        {/* Chart */}
        <ACard style={{padding:24}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18}}>
            <div>
              <div style={{fontSize:13, color:'#8aa6a4', fontWeight:500}}>{periodMeta.title}</div>
              <div style={{fontFamily:'var(--font-display)', fontSize:28, color:'#fff', fontWeight:700}}>{periodData.total} записів</div>
            </div>
            <div style={{display:'flex', gap:6, padding:4, background:'rgba(255,255,255,0.05)', borderRadius:8}}>
              {DASHBOARD_PERIODS.map(p=>(
                <button key={p.k} onClick={() => setPeriod(p.k)} style={{padding:'6px 12px', border:0, borderRadius:6, background: period===p.k?'var(--teal-600)':'transparent', color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer'}}>{p.l}</button>
              ))}
            </div>
          </div>
          {/* Bar chart */}
          <svg viewBox="0 0 540 220" style={{width:'100%', height:220}}>
            {[20,40,60,80,100,120,140,160].map(y => <line key={y} x1="40" y1={y+20} x2="540" y2={y+20} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>)}
            {periodData.points.map((b,i)=>{
              const step = 480 / Math.max(periodData.points.length, 1);
              const x = 48 + i*step;
              const maxV = Math.max(1, ...periodData.points.map(d=>Math.max(d.v, d.c)));
              const h1 = (b.v/maxV)*150;
              const h2 = (b.c/maxV)*150;
              return (
                <g key={i}>
                  <rect x={x} y={180-h2} width={Math.max(6, Math.min(16, step * 0.32))} height={h2} fill="var(--teal-700)" rx="4"/>
                  <rect x={x+Math.max(8, Math.min(18, step * 0.38))} y={180-h1} width={Math.max(6, Math.min(16, step * 0.32))} height={h1} fill="var(--coral-500)" rx="4"/>
                  <text x={x+Math.max(6, Math.min(15, step * 0.35))} y="200" fill="#8aa6a4" fontSize="11" textAnchor="middle">{b.d}</text>
                </g>
              );
            })}
          </svg>
          <div style={{display:'flex', gap:18, marginTop:8, fontSize:12}}>
            <div style={{display:'flex', alignItems:'center', gap:6}}><div style={{width:10, height:10, borderRadius:3, background:'var(--teal-700)'}}/><span style={{color:'#8aa6a4'}}>Заплановано</span></div>
            <div style={{display:'flex', alignItems:'center', gap:6}}><div style={{width:10, height:10, borderRadius:3, background:'var(--coral-500)'}}/><span style={{color:'#8aa6a4'}}>Завершено</span></div>
          </div>
        </ACard>

        {/* Today schedule */}
        <ACard style={{padding:24}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14}}>
            <div style={{fontSize:14, color:'#fff', fontWeight:600}}>Сьогодні</div>
            <div style={{fontSize:12, color:'#8aa6a4'}}>{today.length} записів</div>
          </div>
          <div style={{display:'grid', gap:8}}>
            {today.slice(0,5).map(ap => (
              <div key={ap.id} style={{display:'grid', gridTemplateColumns:'auto 1fr auto', gap:12, alignItems:'center', padding:'10px 12px', background:'rgba(255,255,255,0.03)', borderRadius:10}}>
                <div style={{fontFamily:'var(--font-display)', fontSize:14, fontWeight:700, color:'var(--teal-300)'}}>{ap.time}</div>
                <div>
                  <div style={{fontSize:13, color:'#fff', fontWeight:600}}>{ap.pet} · {ap.client}</div>
                  <div style={{fontSize:11, color:'#8aa6a4'}}>{ap.service}</div>
                </div>
                <StatusPill status={ap.status}/>
              </div>
            ))}
          </div>
        </ACard>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:18}}>
        {/* Recent appointments */}
        <ACard style={{padding:0}}>
          <div style={{padding:'18px 22px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div style={{fontSize:14, color:'#fff', fontWeight:600}}>Останні записи</div>
            <button onClick={()=>setRoute?.('appointments')} style={{border:0, background:'transparent', color:'var(--teal-300)', fontSize:12, cursor:'pointer'}}>Усі →</button>
          </div>
          <div>
            {visibleAppointments.slice(0,6).map((ap,i)=>(
              <div key={ap.id} style={{display:'grid', gridTemplateColumns:'auto 1.5fr 1fr 1fr auto', gap:14, padding:'14px 22px', alignItems:'center', borderTop: i?'1px solid rgba(255,255,255,0.04)':0}}>
                <Avatar name={ap.client} size={34}/>
                <div>
                  <div style={{fontSize:13, color:'#fff', fontWeight:600}}>{ap.client}</div>
                  <div style={{fontSize:11, color:'#8aa6a4'}}>{ap.pet} · {ap.petType}</div>
                </div>
                <div style={{fontSize:12, color:'#cfdcdb'}}>{ap.service}</div>
                <div style={{fontSize:12, color:'#8aa6a4'}}>{ap.date} · {ap.time}</div>
                <StatusPill status={ap.status}/>
              </div>
            ))}
          </div>
        </ACard>

        {/* Quick actions */}
        <ACard style={{padding:24}}>
          <div style={{fontSize:14, color:'#fff', fontWeight:600, marginBottom:14}}>Швидкі дії</div>
          <div style={{display:'grid', gap:8}}>
            {[
              {l:'Створити запис', i:'plus', c:'teal', onClick:()=>setRoute?.('appointments')},
              {l:'Додати клієнта', i:'user', c:'coral', onClick:()=>setRoute?.('clients')},
              {l:'Завести тварину', i:'paw', c:'amber', onClick:()=>setRoute?.('pets')},
              {l:'Виставити рахунок', i:'money', c:'violet', onClick:()=>setRoute?.('reports')},
            ].map((a,i)=>(
              <button key={i} onClick={a.onClick} style={{display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, border:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', color:'#fff', fontSize:13, fontWeight:500, cursor:'pointer', textAlign:'left'}}>
                <div style={{width:30, height:30, borderRadius:8, background:`var(--${a.c}-500)`, opacity:.85, display:'grid', placeItems:'center'}}><Icon name={a.i} size={14} color="#fff"/></div>
                {a.l}
              </button>
            ))}
          </div>
        </ACard>
      </div>
    </div>
  );
};

// =================================================================
// CALENDAR
// =================================================================
export const AdminCalendar = ({ search = '', notify = () => {}, hasPermission = () => true }) => {
  const { appointments, clients, pets, doctors, services, addAppointment } = useStore();
  const [view, setView] = uA('day');
  const [form, setForm] = uA(null);
  const clientOptions = uMA(() => Array.from(new Set(clients.map(c => c.name))), [clients]);
  const doctorOptions = uMA(() => ['—', ...doctors.map(d => d.name)], [doctors]);
  const serviceOptions = uMA(() => Array.from(new Set(services.flatMap(s => [s.name, ...(s.items || []).map(i => i.name)]))), [services]);
  const petOptions = uMA(() => {
    if (!form?.client) return Array.from(new Set(pets.map(p => p.name)));
    const owned = pets.filter(p => p.owner === form.client).map(p => p.name);
    return owned.length ? owned : Array.from(new Set(pets.map(p => p.name)));
  }, [pets, form?.client]);
  const hours = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'];
  const todayIso = isoDate(new Date());
  const baseDate = new Date(`${todayIso}T00:00:00`);
  const weekStart = new Date(baseDate);
  weekStart.setDate(baseDate.getDate() - ((baseDate.getDay() + 6) % 7));
  const weekDays = Array.from({ length:7 }, (_, i) => { const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d; });
  const monthStart = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const monthGridStart = new Date(monthStart);
  monthGridStart.setDate(monthStart.getDate() - ((monthStart.getDay() + 6) % 7));
  const monthDays = Array.from({ length:42 }, (_, i) => { const d = new Date(monthGridStart); d.setDate(monthGridStart.getDate() + i); return d; });
  const visibleApps = appointments.filter(a => matches(a, search));
  const todayApps = visibleApps.filter(a => a.date === todayIso);
  const onFormChange = (key, value) => setForm(f => {
    const next = { ...f, [key]: value };
    if (key === 'client') {
      const ownedPets = pets.filter(p => p.owner === value);
      if (ownedPets.length === 1) {
        next.pet = ownedPets[0].name;
        next.petType = ownedPets[0].species || next.petType;
      }
    }
    if (key === 'pet') {
      const pet = pets.find(p => p.name === value && (!next.client || p.owner === next.client));
      if (pet) {
        next.client = pet.owner || next.client;
        next.petType = pet.species || next.petType;
      }
    }
    if (key === 'serviceName') {
      const svc = services.find(s => s.name === value || s.items?.some(item => item.name === value));
      const item = svc?.items?.find(i => i.name === value) || svc?.items?.[0];
      if (item?.price) next.price = item.price;
      if (svc?.name && value !== svc.name) next.serviceName = item?.name || value;
    }
    if (key === 'status' && value === 'completed') {
      next.paymentStatus = next.paymentStatus || 'paid';
      next.paymentMethod = next.paymentMethod || 'cash';
    }
    return next;
  });
  const createAt = (doctor, time) => {
    setForm({ client:'', pet:'', petType:'Інше', serviceName:'Консультація', doctorName:doctor?.name || '—', date:todayIso, time, status:'waiting', price:600, paymentStatus:'unpaid', paymentMethod:'' });
  };
  const createOnDate = (date, time = '09:00') => {
    setForm({ client:'', pet:'', petType:'Інше', serviceName:'Консультація', doctorName:doctors[0]?.name || '—', date, time, status:'waiting', price:600, paymentStatus:'unpaid', paymentMethod:'' });
  };
  const save = () => {
    if (!hasPermission('Створення записів')) return notify('Недостатньо прав для створення запису.');
    const result = addAppointment({ ...form, price: toNum(form.price, 0), force: true });
    if (!result.ok) return notify(result.error);
    setForm(null);
  };
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
        <div>
          <h1 style={{fontSize:28, color:'#fff'}}>Календар</h1>
          <p style={{color:'#8aa6a4', fontSize:14}}>{formatTodayLong()}</p>
        </div>
        <div style={{display:'flex', gap:10, alignItems:'center'}}>
          <div style={{display:'flex', gap:4, padding:4, background:'rgba(255,255,255,0.05)', borderRadius:8}}>
            {['День','Тиждень','Місяць'].map((p,i)=>{
              const k = ['day','week','month'][i];
              return <button key={p} onClick={()=>setView(k)} style={{padding:'6px 14px', border:0, borderRadius:6, background: view===k?'var(--teal-600)':'transparent', color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer'}}>{p}</button>;
            })}
          </div>
          <button disabled={!hasPermission('Створення записів')} className="btn btn-primary btn-sm" onClick={()=>createAt(doctors[0], '09:00')}><Icon name="plus" size={14} color="#fff"/> Запис</button>
        </div>
      </div>

      {view === 'day' && <ACard style={{padding:0, overflow:'hidden'}}>
        <div style={{display:'grid', gridTemplateColumns:`80px repeat(${doctors.length}, 1fr)`, borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
          <div></div>
          {doctors.map(d => (
            <div key={d.id} style={{padding:'14px 12px', borderLeft:'1px solid rgba(255,255,255,0.04)', textAlign:'center'}}>
              <Avatar name={d.name} size={32}/>
              <div style={{fontSize:12, color:'#fff', fontWeight:600, marginTop:6}}>{d.name.split(' ')[0]}</div>
              <div style={{fontSize:10, color:'#8aa6a4'}}>{d.role.split(',')[0]}</div>
            </div>
          ))}
        </div>
        {hours.map((h,hi) => (
          <div key={h} style={{display:'grid', gridTemplateColumns:`80px repeat(${doctors.length}, 1fr)`, borderBottom:'1px solid rgba(255,255,255,0.04)', minHeight:60}}>
            <div style={{padding:'10px 12px', fontSize:11, color:'#8aa6a4', fontFamily:'var(--font-mono)'}}>{h}</div>
            {doctors.map((d, di) => {
              const ap = todayApps.find(a => a.time === h && a.doctor === d.name);
              return (
                <div key={d.id} onClick={()=>!ap && hasPermission('Створення записів') && createAt(d, h)} style={{padding:6, borderLeft:'1px solid rgba(255,255,255,0.04)', position:'relative', cursor: ap || !hasPermission('Створення записів')?'default':'pointer'}}>
                  {ap && (
                    <div style={{padding:8, borderRadius:8, background: ap.status==='completed'?'rgba(30,169,114,0.15)':ap.status==='in-progress'?'rgba(245,185,66,0.18)':'rgba(18,152,148,0.18)', border:`1px solid ${ap.status==='completed'?'var(--green-500)':ap.status==='in-progress'?'var(--amber-400)':'var(--teal-500)'}`, fontSize:11, cursor:'pointer'}}>
                      <div style={{color:'#fff', fontWeight:600}}>{ap.pet}</div>
                      <div style={{color:'#cfdcdb', fontSize:10, marginTop:2}}>{ap.service}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </ACard>}
      {view === 'week' && <ACard style={{padding:0, overflow:'hidden'}}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
          {weekDays.map(d => <div key={isoDate(d)} style={{padding:'14px 12px', borderLeft:'1px solid rgba(255,255,255,0.04)'}}>
            <div style={{color:'#fff', fontWeight:700, fontSize:13}}>{UK_WEEKDAYS[d.getDay()]}</div>
            <div style={{color:'#8aa6a4', fontSize:11}}>{isoDate(d)}</div>
          </div>)}
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', minHeight:360}}>
          {weekDays.map(d => {
            const date = isoDate(d);
            const dayApps = visibleApps.filter(a => a.date === date);
            return <button key={date} onClick={()=>hasPermission('Створення записів') && createOnDate(date)} style={{padding:10, border:0, borderLeft:'1px solid rgba(255,255,255,0.04)', background:'transparent', textAlign:'left', cursor:hasPermission('Створення записів')?'pointer':'default'}}>
              <div style={{display:'grid', gap:8}}>
                {dayApps.length === 0 && <span style={{color:'#526b69', fontSize:12}}>Вільно</span>}
                {dayApps.map(ap => <div key={ap.id} style={{padding:9, borderRadius:8, background:'rgba(18,152,148,0.13)', border:'1px solid rgba(18,152,148,0.28)'}}>
                  <div style={{color:'#fff', fontSize:12, fontWeight:700}}>{ap.time} · {ap.pet}</div>
                  <div style={{color:'#9fb3b1', fontSize:11, marginTop:2}}>{ap.service}</div>
                </div>)}
              </div>
            </button>;
          })}
        </div>
      </ACard>}
      {view === 'month' && <ACard style={{padding:0, overflow:'hidden'}}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
          {['Пн','Вт','Ср','Чт','Пт','Сб','Нд'].map(d => <div key={d} style={{padding:'10px 12px', color:'#8aa6a4', fontSize:11, fontWeight:700, textTransform:'uppercase'}}>{d}</div>)}
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)'}}>
          {monthDays.map(d => {
            const date = isoDate(d);
            const dayApps = visibleApps.filter(a => a.date === date);
            const muted = d.getMonth() !== baseDate.getMonth();
            return <button key={date} onClick={()=>hasPermission('Створення записів') && createOnDate(date)} style={{minHeight:104, padding:10, border:0, borderLeft:'1px solid rgba(255,255,255,0.04)', borderTop:'1px solid rgba(255,255,255,0.04)', background:date===todayIso?'rgba(18,152,148,0.09)':'transparent', textAlign:'left', cursor:hasPermission('Створення записів')?'pointer':'default'}}>
              <div style={{color:muted?'#526b69':'#fff', fontSize:12, fontWeight:700, marginBottom:8}}>{d.getDate()}</div>
              <div style={{display:'grid', gap:5}}>
                {dayApps.slice(0,3).map(ap => <div key={ap.id} style={{padding:'4px 6px', borderRadius:6, background:'rgba(255,255,255,0.06)', color:'#cfdcdb', fontSize:10, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{ap.time} {ap.pet}</div>)}
                {dayApps.length > 3 && <div style={{color:'var(--teal-300)', fontSize:10}}>+{dayApps.length - 3} ще</div>}
              </div>
            </button>;
          })}
        </div>
      </ACard>}
      {form && <AdminModal title="Новий запис у календарі" values={form} onChange={onFormChange} onClose={()=>setForm(null)} onSubmit={save} fields={[
        {key:'client', label:'Клієнт', type:'datalist', options:clientOptions, placeholder:'Почніть вводити імʼя'},
        {key:'pet', label:'Тварина', type:'datalist', options:petOptions, placeholder:'Кличка тварини'},
        {key:'petType', label:'Вид', type:'select', options:[{value:'Кіт', label:'Кіт'}, {value:'Собака', label:'Собака'}, {value:'Кролик', label:'Кролик'}, {value:'Птах', label:'Птах'}, {value:'Інше', label:'Інше'}]},
        {key:'serviceName', label:'Послуга', type:'datalist', options:serviceOptions},
        {key:'doctorName', label:'Лікар', type:'datalist', options:doctorOptions},
        {key:'date', label:'Дата', type:'date'},
        {key:'time', label:'Час'},
        {key:'price', label:'Сума', type:'number'},
        {key:'status', label:'Статус', type:'select', options:[{value:'waiting', label:'Очікує'}, {value:'confirmed', label:'Підтверджено'}, {value:'in-progress', label:'На прийомі'}, {value:'completed', label:'Завершено'}, {value:'cancelled', label:'Скасовано'}]},
        {key:'paymentStatus', label:'Оплата', type:'select', options:[{value:'unpaid', label:'Не оплачено'}, {value:'paid', label:'Оплачено'}]},
        {key:'paymentMethod', label:'Метод оплати', type:'select', options:[{value:'', label:'—'}, {value:'cash', label:'Готівка'}, {value:'card', label:'Картка'}, {value:'transfer', label:'Переказ'}]},
      ]}/>}
    </div>
  );
};

// =================================================================
// APPOINTMENTS
// =================================================================
export const AdminAppointments = ({ search: globalSearch = '', notify = () => {}, hasPermission = () => true }) => {
  const { appointments, pets, clients, doctors, services, updateAppointment, deleteAppointment, addAppointment } = useStore();
  const { ask, confirmDialog } = useAdminConfirm();
  const tableCols = 'minmax(170px,1.2fr) minmax(120px,0.9fr) minmax(125px,0.95fr) 180px 104px 86px minmax(408px,1.65fr)';
  const [filter, setFilter] = uA('all');
  const [search, setSearch] = uA('');
  const [showAdvancedFilters, setShowAdvancedFilters] = uA(false);
  const [advanced, setAdvanced] = uA({ doctor:'all', service:'all', payment:'all', from:'', to:'' });
  const empty = { client:'', pet:'', petType:'Кіт', serviceName:'Консультація', doctorName:'—', date:new Date().toISOString().slice(0,10), time:'09:00', status:'waiting', price:600, paymentStatus:'unpaid', paymentMethod:'', diagnosis:'', treatment:'', medications:'', prescription:'', attachments:[] };
  const [form, setForm] = uA(null);
  const [formMode, setFormMode] = uA('full');
  const clientOptions = uMA(() => Array.from(new Set(clients.map(c => c.name))), [clients]);
  const doctorOptions = uMA(() => ['—', ...doctors.map(d => d.name)], [doctors]);
  const serviceOptions = uMA(() => Array.from(new Set(services.flatMap(s => [s.name, ...(s.items || []).map(i => i.name)]))), [services]);
  const petOptions = uMA(() => {
    if (!form?.client) return Array.from(new Set(pets.map(p => p.name)));
    const owned = pets.filter(p => p.owner === form.client).map(p => p.name);
    return owned.length ? owned : Array.from(new Set(pets.map(p => p.name)));
  }, [pets, form?.client]);
  const onFormChange = (key, value) => setForm(f => {
    const next = { ...f, [key]: value };
    if (key === 'client') {
      const ownedPets = pets.filter(p => p.owner === value);
      if (ownedPets.length === 1) {
        next.pet = ownedPets[0].name;
        next.petType = ownedPets[0].species || next.petType;
      }
    }
    if (key === 'pet') {
      const found = pets.find(p => p.name === value && (!f.client || p.owner === f.client));
      if (found) {
        next.client = found.owner || next.client;
        next.petType = found.species || next.petType;
      }
    }
    if (key === 'serviceName') {
      const svc = services.find(s => s.name === value || s.items?.some(item => item.name === value));
      const item = svc?.items?.find(i => i.name === value) || svc?.items?.[0];
      if (item?.price) next.price = item.price;
    }
    if (key === 'status' && value === 'completed') {
      next.paymentStatus = next.paymentStatus || 'paid';
      next.paymentMethod = next.paymentMethod || 'cash';
    }
    return next;
  });
  const q = [search, globalSearch].filter(Boolean).join(' ');
  const filtered = appointments.filter(a => {
    if (filter !== 'all' && a.status !== filter) return false;
    if (q && !matches(a, q)) return false;
    if (advanced.doctor !== 'all' && a.doctor !== advanced.doctor) return false;
    if (advanced.service !== 'all' && a.service !== advanced.service) return false;
    if (advanced.payment !== 'all') {
      const status = a.paymentStatus || (a.status === 'completed' ? 'paid' : 'unpaid');
      if (status !== advanced.payment) return false;
    }
    if (advanced.from && a.date < advanced.from) return false;
    if (advanced.to && a.date > advanced.to) return false;
    return true;
  }).sort((a, b) => `${b.date || ''} ${b.time || ''}`.localeCompare(`${a.date || ''} ${a.time || ''}`));
  const filters = [
    {k:'all', l:'Усі', n:appointments.length},
    {k:'confirmed', l:'Підтверджено', n:appointments.filter(a=>a.status==='confirmed').length},
    {k:'in-progress', l:'На прийомі', n:appointments.filter(a=>a.status==='in-progress').length},
    {k:'waiting', l:'Очікують', n:appointments.filter(a=>a.status==='waiting').length},
    {k:'completed', l:'Завершено', n:appointments.filter(a=>a.status==='completed').length},
    {k:'cancelled', l:'Скасовано', n:appointments.filter(a=>a.status==='cancelled').length},
  ];
  const resetAdvanced = () => setAdvanced({ doctor:'all', service:'all', payment:'all', from:'', to:'' });
  const save = () => {
    const payload = { ...form, service: form.serviceName, doctor: form.doctorName, price: toNum(form.price, 0) };
    if (payload.id) {
      const result = updateAppointment(payload.id, payload);
      if (result?.ok === false) return notify(result.error);
      notify('Запис оновлено.');
    }
    else {
      const result = addAppointment({ ...payload, force: true });
      if (!result.ok) return notify(result.error);
      notify('Запис створено. Клієнт і картка тварини синхронізовані.');
    }
    setForm(null);
  };
  const addAttachments = async (files = []) => {
    if (!files.length) return;
    try {
      const prepared = await Promise.all(files.map(async (file) => ({
        id: `att_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size || 0,
        url: await fileToDataUrl(file),
        addedAt: new Date().toISOString(),
      })));
      setForm(prev => ({ ...prev, attachments: [...(prev.attachments || []), ...prepared] }));
    } catch {
      notify('Не вдалося прикріпити один або кілька файлів.');
    }
  };
  const canCreate = hasPermission('Створення записів');
  const canCancel = hasPermission('Скасування записів');
  const canTreat = hasPermission('Призначення лікування');
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
        <div><h1 style={{fontSize:28, color:'#fff'}}>Записи</h1><p style={{color:'#8aa6a4', fontSize:14}}>Усі записи клініки</p></div>
        <div style={{display:'flex', gap:10}}>
          <button className="btn btn-sm" onClick={()=>setShowAdvancedFilters(v=>!v)} style={{background:showAdvancedFilters?'rgba(117,121,234,0.28)':'rgba(255,255,255,0.06)', color:'#fff'}}><Icon name="filter" size={14}/> Фільтри</button>
          <button disabled={!canCreate} className="btn btn-primary btn-sm" onClick={()=>{ setFormMode('full'); setForm(empty); }}><Icon name="plus" size={14} color="#fff"/> Новий</button>
        </div>
      </div>

      {showAdvancedFilters && (
        <ACard style={{padding:14, marginBottom:14}}>
          <div style={{display:'grid', gridTemplateColumns:'repeat(5,minmax(140px,1fr)) auto', gap:10, alignItems:'end'}}>
            <AField label="Лікар">
              <ASelect value={advanced.doctor} onChange={e=>setAdvanced(v=>({...v, doctor:e.target.value}))}>
                <option value="all">Усі лікарі</option>
                {doctorOptions.filter(Boolean).map((d)=><option key={d} value={d}>{d}</option>)}
              </ASelect>
            </AField>
            <AField label="Послуга">
              <ASelect value={advanced.service} onChange={e=>setAdvanced(v=>({...v, service:e.target.value}))}>
                <option value="all">Усі послуги</option>
                {serviceOptions.map((s)=><option key={s} value={s}>{s}</option>)}
              </ASelect>
            </AField>
            <AField label="Оплата">
              <ASelect value={advanced.payment} onChange={e=>setAdvanced(v=>({...v, payment:e.target.value}))}>
                <option value="all">Будь-яка</option>
                <option value="paid">Оплачено</option>
                <option value="unpaid">Не оплачено</option>
              </ASelect>
            </AField>
            <AField label="Від дати">
              <AInput type="date" value={advanced.from} onChange={e=>setAdvanced(v=>({...v, from:e.target.value}))}/>
            </AField>
            <AField label="До дати">
              <AInput type="date" value={advanced.to} onChange={e=>setAdvanced(v=>({...v, to:e.target.value}))}/>
            </AField>
            <ABtn onClick={resetAdvanced}>Скинути</ABtn>
          </div>
        </ACard>
      )}

      <div style={{display:'flex', gap:8, marginBottom:18, flexWrap:'wrap'}}>
        {filters.map(f => (
          <button key={f.k} onClick={()=>setFilter(f.k)} style={{padding:'8px 14px', borderRadius:999, border:0, background: filter===f.k?'var(--teal-600)':'rgba(255,255,255,0.05)', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:8}}>
            {f.l} <span style={{padding:'1px 7px', background:'rgba(255,255,255,0.15)', borderRadius:99, fontSize:11}}>{f.n}</span>
          </button>
        ))}
      </div>

      <div style={{position:'relative', marginBottom:14, maxWidth:380}}>
        <div style={{position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#6d8483'}}><Icon name="search" size={14}/></div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Пошук за клієнтом або твариною..." style={{width:'100%', padding:'10px 14px 10px 40px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, color:'#fff', fontSize:13, outline:'none'}}/>
      </div>

      <ACard className="appointments-table-card" style={{padding:0, overflow:'hidden'}}>
        <div className="appointments-table-scroll">
        <div className="appointments-table-head" style={{display:'grid', gridTemplateColumns:tableCols, gap:12, padding:'12px 18px', fontSize:11, color:'#8aa6a4', textTransform:'uppercase', fontWeight:600, letterSpacing:'0.04em', borderBottom:'1px solid rgba(255,255,255,0.06)', alignItems:'center'}}>
          <div>Клієнт</div><div>Послуга</div><div>Лікар</div><div>Час</div><div>Статус</div><div>Сума</div><div></div>
        </div>
        {filtered.length === 0 ? (
          <div style={{padding:48, textAlign:'center', color:'#8aa6a4', fontSize:14}}>Немає записів за цим фільтром.</div>
        ) : filtered.map((ap,i)=>{
          const statusLabel = { confirmed:'Підтвердити', 'in-progress':'На прийом', completed:'Завершити', cancelled:'Скасувати' };
          const actionTone = {
            confirmed: { bg:'rgba(65,130,255,0.18)', bd:'rgba(117,167,255,0.45)', fg:'#cfe2ff' },
            'in-progress': { bg:'rgba(245,185,66,0.16)', bd:'rgba(245,185,66,0.42)', fg:'#ffe2a8' },
            completed: { bg:'rgba(30,169,114,0.16)', bd:'rgba(30,169,114,0.42)', fg:'#bdf2d8' },
            cancelled: { bg:'rgba(230,69,97,0.14)', bd:'rgba(230,69,97,0.4)', fg:'#ffc2cf' },
          };
          return (
          <div className="appointments-table-row" key={ap.id} style={{display:'grid', gridTemplateColumns:tableCols, gap:12, padding:'12px 18px', alignItems:'center', borderTop: i?'1px solid rgba(255,255,255,0.04)':0, opacity: ap.status === 'cancelled' ? 0.55 : 1, filter: ap.status === 'cancelled' ? 'grayscale(0.25)' : 'none'}}>
            <div style={{minWidth:0}}><div style={{color:'#fff', fontSize:13, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{ap.client}</div><div style={{color:'#8aa6a4', fontSize:11, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{ap.pet} · {ap.petType}</div></div>
            <div style={{color:'#cfdcdb', fontSize:12, minWidth:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{ap.service}</div>
            <div style={{color:'#cfdcdb', fontSize:12, minWidth:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{ap.doctor}</div>
            <div style={{color:'#cfdcdb', fontSize:12}}>{ap.date} · {ap.time}</div>
            <StatusPill status={ap.status} compact/>
            <div style={{fontFamily:'var(--font-display)', color:'#fff', fontWeight:700}}>{ap.price} ₴</div>
            <div style={{display:'flex', gap:4, justifyContent:'flex-end', flexWrap:'nowrap'}}>
              {Object.entries(statusLabel).filter(([st]) => st !== ap.status).map(([st, label]) => (
                <button
                  key={st}
                  onClick={() => {
                    if (st === 'in-progress') {
                      if (!canTreat) return notify('Недостатньо прав для ведення прийому.');
                      setFormMode('visit');
                      setForm({
                        ...ap,
                        status: 'in-progress',
                        serviceName: ap.service,
                        doctorName: ap.doctor,
                        diagnosis: ap.diagnosis || '',
                        treatment: ap.treatment || '',
                        medications: ap.medications || '',
                        prescription: ap.prescription || '',
                        attachments: Array.isArray(ap.attachments) ? ap.attachments : [],
                      });
                      return;
                    }
                    if (st === 'cancelled' && !canCancel) return notify('Недостатньо прав для скасування записів.');
                    if (st !== 'cancelled' && !canCreate) return notify('Недостатньо прав для зміни статусу.');
                    updateAppointment(ap.id, { status: st });
                  }}
                  title={label}
                  style={{padding:'5px 9px', border:`1px solid ${actionTone[st].bd}`, borderRadius:6, background:actionTone[st].bg, color:actionTone[st].fg, cursor:'pointer', fontSize:11, fontWeight:600}}
                >
                  {label}
                </button>
              ))}
              <button disabled={ap.status === 'cancelled' || !canCreate} onClick={()=>{
                setFormMode('schedule');
                setForm({ ...ap, serviceName: ap.service, doctorName: ap.doctor });
              }} title="Редагувати" style={{width:28, height:28, border:0, borderRadius:6, background:'rgba(255,255,255,0.05)', color:'#cfdcdb', cursor:ap.status === 'cancelled' || !canCreate?'not-allowed':'pointer', opacity:ap.status === 'cancelled' || !canCreate?0.45:1, display:'grid', placeItems:'center'}}><Icon name="edit" size={13}/></button>
              <button disabled={ap.status === 'cancelled' || !canCancel} onClick={()=>ask('Видалити цей запис із календаря та списку прийомів?', () => deleteAppointment(ap.id))} title="Видалити" style={{width:28, height:28, border:0, borderRadius:6, background:'rgba(255,255,255,0.05)', color:'#e64561', cursor:ap.status === 'cancelled' || !canCancel?'not-allowed':'pointer', opacity:ap.status === 'cancelled' || !canCancel?0.45:1, display:'grid', placeItems:'center'}}><Icon name="trash" size={13}/></button>
            </div>
          </div>
          );
        })}
        </div>
      </ACard>
      {form && <AdminModal title={formMode === 'visit' ? 'Прийом тварини' : form.id ? 'Редагувати запис' : 'Новий запис'} values={form} onChange={onFormChange} onFileChange={(_, files) => addAttachments(files)} onClose={()=>setForm(null)} onSubmit={save} submitLabel={formMode === 'visit' ? 'Зберегти прийом' : 'Зберегти'} fields={formMode === 'schedule' ? [
        {key:'serviceName', label:'Послуга', type:'datalist', options:serviceOptions},
        {key:'date', label:'Дата', type:'date'},
        {key:'time', label:'Час'},
      ] : formMode === 'visit' ? [
        {key:'client', label:'Клієнт', type:'text', disabled:true},
        {key:'pet', label:'Тварина', type:'text', disabled:true},
        {key:'serviceName', label:'Послуга', type:'text', disabled:true},
        {key:'doctorName', label:'Лікар', type:'text', disabled:true},
        {key:'date', label:'Дата', type:'date', disabled:true},
        {key:'time', label:'Час', disabled:true},
        {key:'status', label:'Статус', type:'select', options:[
          {value:'in-progress', label:'На прийомі'},
          {value:'completed', label:'Завершено'},
          {value:'cancelled', label:'Скасовано'},
        ]},
        {key:'diagnosis', label:'Діагноз', type:'textarea'},
        {key:'treatment', label:'План лікування', type:'textarea'},
        {key:'medications', label:'Призначення (ліки/дозування/курс)', type:'textarea'},
        {key:'prescription', label:'Текст рецепта', type:'textarea'},
        {key:'attachments', label:'Документи (PDF/фото)', type:'file', accept:'.pdf,image/*', multiple:true},
      ] : [
        {key:'client', label:'Клієнт', type:'datalist', options:clientOptions, placeholder:'Почніть вводити імʼя'},
        {key:'pet', label:'Тварина', type:'datalist', options:petOptions, placeholder:form?.client ? 'Тварини власника' : 'Оберіть зі списку'},
        {key:'petType', label:'Вид', type:'select', options:[
          {value:'Кіт', label:'Кіт'},
          {value:'Собака', label:'Собака'},
          {value:'Кролик', label:'Кролик'},
          {value:'Птах', label:'Птах'},
          {value:'Інше', label:'Інше'},
        ]},
        {key:'serviceName', label:'Послуга', type:'datalist', options:serviceOptions},
        {key:'doctorName', label:'Лікар', type:'datalist', options:doctorOptions},
        {key:'date', label:'Дата', type:'date'},
        {key:'time', label:'Час'},
        {key:'price', label:'Сума', type:'number'},
        {key:'status', label:'Статус', type:'select', options:[
          {value:'waiting', label:'Очікує'},
          {value:'confirmed', label:'Підтверджено'},
          {value:'in-progress', label:'На прийомі'},
          {value:'completed', label:'Завершено'},
          {value:'cancelled', label:'Скасовано'},
        ]},
        {key:'paymentStatus', label:'Оплата', type:'select', options:[{value:'unpaid', label:'Не оплачено'}, {value:'paid', label:'Оплачено'}]},
        {key:'paymentMethod', label:'Метод оплати', type:'select', options:[{value:'', label:'—'}, {value:'cash', label:'Готівка'}, {value:'card', label:'Картка'}, {value:'transfer', label:'Переказ'}]},
      ]}/>}
      {confirmDialog}
    </div>
  );
};

// =================================================================
// CLIENTS
// =================================================================
export const AdminClients = ({ search = '', notify = () => {}, hasPermission = () => true }) => {
  const { clients, saveClient, deleteClient } = useStore();
  const { ask, confirmDialog } = useAdminConfirm();
  const visible = clients.filter(c => matches(c, search));
  const clientTableCols = '56px minmax(220px,1.5fr) minmax(190px,1.2fr) minmax(220px,1.4fr) 72px 72px 132px 82px';
  const [form, setForm] = uA(null);
  const save = () => {
    if (!hasPermission('Управління користувачами')) return notify('Недостатньо прав для редагування клієнтів.');
    const result = saveClient({ ...form, pets: toNum(form.pets, 0), visits: toNum(form.visits, 0) });
    if (!result.ok) return notify(result.error);
    notify(form.id ? 'Клієнта оновлено.' : 'Клієнта додано.');
    setForm(null);
  };
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
        <div><h1 style={{fontSize:28, color:'#fff'}}>Клієнти</h1><p style={{color:'#8aa6a4', fontSize:14}}>{visible.length} клієнтів у системі</p></div>
        <button disabled={!hasPermission('Управління користувачами')} className="btn btn-primary btn-sm" onClick={()=>setForm({ name:'', phone:'', email:'', pets:0, visits:0, since:String(new Date().getFullYear()), status:'new' })}><Icon name="plus" size={14} color="#fff"/> Додати клієнта</button>
      </div>
      <ACard style={{padding:0, overflow:'hidden'}}>
        <div style={{display:'grid', gridTemplateColumns:clientTableCols, gap:12, padding:'12px 18px', fontSize:11, color:'#8aa6a4', textTransform:'uppercase', fontWeight:600, letterSpacing:'0.04em', borderBottom:'1px solid rgba(255,255,255,0.06)', alignItems:'center'}}>
          <div></div><div>Клієнт</div><div>Телефон</div><div>Email</div><div style={{textAlign:'center'}}>Тварини</div><div style={{textAlign:'center'}}>Візити</div><div style={{textAlign:'center'}}>Статус</div><div style={{textAlign:'right'}}>Дії</div>
        </div>
        {visible.length === 0 && (
          <div style={{padding:48, textAlign:'center', color:'#8aa6a4', fontSize:14}}>Клієнтів поки немає.</div>
        )}
        {visible.map((c,i)=>(
          <div key={c.id} style={{display:'grid', gridTemplateColumns:clientTableCols, gap:12, padding:'12px 18px', alignItems:'center', borderTop: i?'1px solid rgba(255,255,255,0.04)':0}}>
            <Avatar name={c.name} size={36}/>
            <div style={{minWidth:0}}><div style={{color:'#fff', fontSize:13, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{c.name}</div><div style={{color:'#8aa6a4', fontSize:11}}>з {c.since} року</div></div>
            <div style={{color:'#cfdcdb', fontSize:12, fontFamily:'var(--font-mono)'}}>{c.phone}</div>
            <div style={{color:'#cfdcdb', fontSize:12, minWidth:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{c.email}</div>
            <div style={{color:'#fff', fontSize:13, fontWeight:600, textAlign:'center'}}>{c.pets}</div>
            <div style={{color:'#fff', fontSize:13, fontWeight:600, textAlign:'center'}}>{c.visits}</div>
            <div style={{display:'flex', justifyContent:'center'}}><StatusPill status={c.status} compact/></div>
            <div style={{display:'flex', gap:8, justifyContent:'flex-end'}}>
              <button disabled={!hasPermission('Управління користувачами')} onClick={()=>setForm(c)} style={{width:28, height:28, border:0, borderRadius:6, background:'rgba(255,255,255,0.05)', color:'#cfdcdb', cursor:hasPermission('Управління користувачами')?'pointer':'not-allowed', opacity:hasPermission('Управління користувачами')?1:0.45, display:'grid', placeItems:'center'}}><Icon name="edit" size={14}/></button>
              <button disabled={!hasPermission('Управління користувачами')} onClick={()=>ask(`Видалити клієнта «${c.name}»?`, () => {
                const result = deleteClient(c.id);
                if (result?.ok === false) return notify(result.error);
                notify('Клієнта видалено.');
              })} style={{width:28, height:28, border:0, borderRadius:6, background:'rgba(255,255,255,0.05)', color:'#e64561', cursor:hasPermission('Управління користувачами')?'pointer':'not-allowed', opacity:hasPermission('Управління користувачами')?1:0.45, display:'grid', placeItems:'center'}}><Icon name="trash" size={14}/></button>
            </div>
          </div>
        ))}
      </ACard>
      {form && <AdminModal title={form.id ? 'Редагувати клієнта' : 'Новий клієнт'} values={form} onChange={(k,v)=>setForm(f=>({...f,[k]:v}))} onClose={()=>setForm(null)} onSubmit={save} fields={[
        {key:'name', label:'Імʼя', placeholder:'Ірина Ковальчук'},
        {key:'phone', label:'Телефон', placeholder:'+380 67 123 45 67'},
        {key:'email', label:'Email', placeholder:'client@example.com'},
        {key:'pets', label:'Тварини', type:'number', placeholder:'Кількість, напр. 2'},
        {key:'visits', label:'Візити', type:'number', placeholder:'Кількість, напр. 5'},
        {key:'status', label:'Статус', type:'select', options:[{value:'active', label:'Активний'}, {value:'new', label:'Новий'}]},
      ]}/>}
      {confirmDialog}
    </div>
  );
};

// =================================================================
// PETS
// =================================================================
export const AdminPets = ({ search = '', notify = () => {}, hasPermission = () => true }) => {
  const { pets, clients, appointments, medicalRecords, vaccinations, savePet, deletePet } = useStore();
  const { ask, confirmDialog } = useAdminConfirm();
  const speciesKind = (species) => {
    const key = String(species || '').toLowerCase();
    if (key === 'кіт') return 'cat';
    if (key === 'собака') return 'dog';
    if (key === 'кролик') return 'rabbit';
    return 'other';
  };
  const speciesColor = (species) => {
    const key = String(species || '').toLowerCase();
    if (key === 'кіт') return 'violet';
    if (key === 'собака') return 'coral';
    if (key === 'кролик') return 'teal';
    if (key === 'птах') return 'amber';
    if (key === 'тхір') return 'rose';
    if (key === 'гризун') return 'green';
    if (key === 'рептилія') return 'violet';
    return 'teal';
  };
  const visible = pets.filter(p => matches(p, search));
  const clientOptions = uMA(() => Array.from(new Set(clients.map(c => c.name))), [clients]);
  const [selectedId, setSelectedId] = uA(pets[0]?.id);
  const [form, setForm] = uA(null);
  const selected = pets.find(p => p.id === selectedId) || visible[0] || pets[0];
  const petAppointments = uMA(() => selected ? appointments
    .filter(a => a.pet === selected.name && a.client === selected.owner)
    .sort((a,b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)) : [], [appointments, selected]);
  const petVaccinations = uMA(() => selected ? vaccinations
    .filter(v => v.pet === selected.name)
    .sort((a,b) => String(b.validUntil || b.date).localeCompare(String(a.validUntil || a.date))) : [], [vaccinations, selected]);
  const petRecords = uMA(() => selected ? [
    ...medicalRecords.filter(r => r.pet === selected.name),
    ...petAppointments.filter(a => a.status === 'completed' && !medicalRecords.some(r => r.appointmentId === a.id)).map(a => ({
      id: `ap-${a.id}`,
      date: a.date,
      title: a.service,
      doctor: a.doctor,
      notes: a.notes || 'Завершений прийом.',
      diagnosis: a.diagnosis || '',
      treatment: a.treatment || '',
      medications: a.medications || '',
      prescription: a.prescription || '',
      attachments: Array.isArray(a.attachments) ? a.attachments : [],
    })),
  ].sort((a,b)=>String(b.date).localeCompare(String(a.date))) : [], [medicalRecords, petAppointments, selected]);
  const save = () => {
    if (!hasPermission('Картки пацієнтів')) return notify('Недостатньо прав для редагування карток тварин.');
    const payload = { ...form, age: toNum(form.age, 0), weight: toNum(form.weight, 0), alerts: csv(form.alertsText) };
    const result = savePet(payload);
    if (!result.ok) return notify(result.error);
    notify(form.id ? 'Картку тварини оновлено.' : 'Картку тварини створено. Клієнта синхронізовано.');
    setForm(null);
  };
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
        <div><h1 style={{fontSize:28, color:'#fff'}}>Картки тварин</h1><p style={{color:'#8aa6a4', fontSize:14}}>{visible.length} тварин у базі</p></div>
        <button disabled={!hasPermission('Картки пацієнтів')} className="btn btn-primary btn-sm" onClick={()=>setForm({ name:'', species:'Кіт', breed:'', age:1, weight:0, owner:'', alertsText:'' })}><Icon name="plus" size={14} color="#fff"/> Завести</button>
      </div>
      {pets.length === 0 && (
        <ACard style={{padding:48, textAlign:'center', color:'#8aa6a4'}}>
          <div style={{width:56, height:56, borderRadius:16, background:'rgba(255,255,255,0.05)', color:'var(--teal-300)', display:'grid', placeItems:'center', margin:'0 auto 16px'}}>
            <Icon name="paw" size={24}/>
          </div>
          <div style={{fontSize:18, color:'#fff', fontWeight:600, marginBottom:6}}>Тварин поки немає</div>
          <div style={{fontSize:14, marginBottom:18}}>Додайте першу картку через кнопку «Завести».</div>
          <button className="btn btn-primary btn-sm" onClick={()=>setForm({ name:'', species:'Кіт', breed:'', age:1, weight:0, owner:'', alertsText:'' })}><Icon name="plus" size={14} color="#fff"/> Завести</button>
        </ACard>
      )}
      {pets.length > 0 && visible.length === 0 && (
        <ACard style={{padding:48, textAlign:'center', color:'#8aa6a4', fontSize:14}}>За цим пошуком тварин не знайдено.</ACard>
      )}
      {visible.length > 0 && (
      <div style={{display:'grid', gridTemplateColumns:'380px 1fr', gap:16}}>
        <ACard style={{padding:0, overflow:'hidden', height:'fit-content'}}>
          {visible.map((p,i)=>(
            <button key={p.id} onClick={()=>setSelectedId(p.id)} style={{width:'100%', display:'grid', gridTemplateColumns:'auto 1fr', gap:12, padding:'14px 18px', alignItems:'center', border:0, background: selected?.id===p.id?'rgba(18,152,148,0.15)':'transparent', borderTop: i?'1px solid rgba(255,255,255,0.04)':0, textAlign:'left', cursor:'pointer'}}>
              <PetIllustration kind={speciesKind(p.species)} color={speciesColor(p.species)} size={48}/>
              <div>
                <div style={{color:'#fff', fontWeight:600, fontSize:14}}>{p.name}</div>
                <div style={{color:'#8aa6a4', fontSize:12}}>{p.species} · {p.breed} · {p.age} р.</div>
                <div style={{color:'#8aa6a4', fontSize:11, marginTop:2}}>Власник: {p.owner}</div>
              </div>
            </button>
          ))}
        </ACard>
        <div style={{display:'grid', gap:14}}>
          <ACard style={{padding:24}}>
            <div style={{display:'flex', gap:18, alignItems:'flex-start'}}>
              <PetIllustration kind={speciesKind(selected.species)} color={speciesColor(selected.species)} size={120}/>
              <div style={{flex:1}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                  <div>
                    <h2 style={{fontSize:24, color:'#fff'}}>{selected.name}</h2>
                    <p style={{color:'#8aa6a4', fontSize:14}}>{selected.species} · {selected.breed}</p>
                  </div>
                  <div style={{display:'flex', gap:6}}><button onClick={()=>setForm({ ...selected, alertsText: selected.alerts?.join(', ') || '' })} style={{padding:'6px 12px', background:'rgba(255,255,255,0.05)', border:0, borderRadius:8, color:'#fff', fontSize:12, cursor:'pointer'}}><Icon name="edit" size={12}/> Редагувати</button><button onClick={()=>ask(`Видалити картку «${selected.name}»?`, () => {
                    const result = deletePet(selected.id);
                    if (result?.ok === false) return notify(result.error);
                    notify('Картку тварини видалено.');
                  })} style={{padding:'6px 12px', background:'rgba(255,255,255,0.05)', border:0, borderRadius:8, color:'#e64561', fontSize:12, cursor:'pointer'}}><Icon name="trash" size={12}/></button></div>
                </div>
                <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginTop:18}}>
                  {[{l:'Вік', v:selected.age+' роки'},{l:'Вага', v:selected.weight+' кг'},{l:'Стерилізація', v:selected.sterilized?'так':'ні'},{l:'Власник', v:selected.owner}].map((d,i)=>(
                    <div key={i}><div style={{fontSize:11, color:'#8aa6a4', textTransform:'uppercase', marginBottom:4}}>{d.l}</div><div style={{color:'#fff', fontSize:14, fontWeight:600}}>{d.v}</div></div>
                  ))}
                </div>
                {selected.alerts.length>0 && (
                  <div style={{marginTop:14, padding:'10px 14px', background:'rgba(245,185,66,0.12)', border:'1px solid rgba(245,185,66,0.3)', borderRadius:10, display:'flex', gap:10, alignItems:'center'}}>
                    <Icon name="bell" size={14} color="var(--amber-400)"/>
                    <span style={{color:'var(--amber-400)', fontSize:13, fontWeight:600}}>{selected.alerts.join(' · ')}</span>
                  </div>
                )}
              </div>
            </div>
          </ACard>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
            <ACard style={{padding:22}}>
              <div style={{fontSize:14, color:'#fff', fontWeight:600, marginBottom:14}}>Вакцинації</div>
              {(petVaccinations.length ? petVaccinations : [{name:'Записів немає', date:'—', status:'—'}]).map((v,i)=>(
                <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderTop: i?'1px solid rgba(255,255,255,0.04)':0}}>
                  <div><div style={{color:'#fff', fontSize:13, fontWeight:600}}>{v.name}</div><div style={{color:'#8aa6a4', fontSize:11}}>{v.validUntil ? `до ${v.validUntil}` : v.date}</div></div>
                  <div className={`chip chip-${v.status === 'active' ? 'green' : 'rose'}`} style={{fontSize:10}}>{v.status === 'active' ? 'актуальна' : v.status}</div>
                </div>
              ))}
            </ACard>
            <ACard style={{padding:22}}>
              <div style={{fontSize:14, color:'#fff', fontWeight:600, marginBottom:14}}>Останні візити</div>
              {(petAppointments.length ? petAppointments.slice(0, 3) : [{service:'Записів немає', date:'—', doctor:'—'}]).map((v,i)=>(
                <div key={i} style={{padding:'10px 0', borderTop: i?'1px solid rgba(255,255,255,0.04)':0}}>
                  <div style={{color:'#fff', fontSize:13, fontWeight:600}}>{v.service}</div>
                  <div style={{color:'#8aa6a4', fontSize:11}}>{v.date} · {v.doctor}</div>
                </div>
              ))}
            </ACard>
          </div>
          <ACard style={{padding:22}}>
            <div style={{fontSize:14, color:'#fff', fontWeight:600, marginBottom:14}}>Медична історія</div>
            <div style={{position:'relative', paddingLeft:18}}>
              <div style={{position:'absolute', left:5, top:8, bottom:8, width:2, background:'rgba(255,255,255,0.06)'}}/>
              {(petRecords.length ? petRecords : [{date:'—', title:'Медичних подій немає', notes:'Завершені прийоми автоматично зʼявляться тут.'}]).map((e,i)=>(
                <div key={i} style={{position:'relative', paddingBottom:18}}>
                  <div style={{position:'absolute', left:-18, top:6, width:12, height:12, borderRadius:'50%', background:'var(--teal-500)', border:'3px solid #0f2120'}}/>
                  <div style={{fontSize:11, color:'var(--teal-300)', fontWeight:600, marginBottom:4}}>{e.date}</div>
                  <div style={{color:'#fff', fontSize:14, fontWeight:600, marginBottom:4}}>{e.title}</div>
                  <div style={{color:'#cfdcdb', fontSize:13}}>{e.notes}</div>
                  {e.diagnosis && <div style={{color:'#9fb3b1', fontSize:12, marginTop:6}}><strong>Діагноз:</strong> {e.diagnosis}</div>}
                  {e.treatment && <div style={{color:'#9fb3b1', fontSize:12, marginTop:4}}><strong>Лікування:</strong> {e.treatment}</div>}
                  {e.medications && <div style={{color:'#9fb3b1', fontSize:12, marginTop:4}}><strong>Призначення:</strong> {e.medications}</div>}
                  {Array.isArray(e.attachments) && e.attachments.length > 0 && (
                    <div style={{display:'flex', flexWrap:'wrap', gap:8, marginTop:8}}>
                      {e.attachments.map((att, ai) => (
                        <a key={att.id || `${att.name}-${ai}`} href={att.url} download={att.name} style={{padding:'5px 8px', borderRadius:8, fontSize:11, background:'rgba(255,255,255,0.06)', color:'#cfdcdb'}}>
                          {att.name}
                        </a>
                      ))}
                    </div>
                  )}
                  {e.prescription && e.prescription !== '—' && (
                    <button type="button" onClick={() => downloadText(`recept-${selected.name}-${e.date}.txt`, `${selected.name}\n${e.date}\nЛікар: ${e.doctor || '—'}\n\n${e.prescription}`)} style={{marginTop:8, border:0, borderRadius:8, padding:'6px 10px', background:'rgba(117,121,234,0.25)', color:'#fff', cursor:'pointer', fontSize:12}}>
                      Експорт рецепта
                    </button>
                  )}
                </div>
              ))}
            </div>
          </ACard>
        </div>
      </div>
      )}
      {form && <AdminModal title={form.id ? 'Редагувати тварину' : 'Нова тварина'} values={form} onChange={(k,v)=>setForm(f=>({...f,[k]:v}))} onClose={()=>setForm(null)} onSubmit={save} fields={[
        {key:'name', label:'Кличка', placeholder:'Барсік'},
        {key:'species', label:'Вид', type:'select', options:[
          {value:'Кіт', label:'Кіт'},
          {value:'Собака', label:'Собака'},
          {value:'Кролик', label:'Кролик'},
          {value:'Птах', label:'Птах'},
          {value:'Тхір', label:'Тхір'},
          {value:'Гризун', label:'Гризун'},
          {value:'Рептилія', label:'Рептилія'},
          {value:'Інше', label:'Інше'},
        ]},
        {key:'breed', label:'Порода', placeholder:'Британський короткошерстий'},
        {key:'age', label:'Вік', type:'number', placeholder:'Повних років, напр. 3'},
        {key:'weight', label:'Вага', type:'number', placeholder:'кг, напр. 4.5'},
        {key:'owner', label:'Власник', type:'datalist', options:clientOptions, placeholder:'Імʼя власника'},
        {key:'ownerPhone', label:'Телефон власника', placeholder:'+380 67 123 45 67'},
        {key:'ownerEmail', label:'Email власника', placeholder:'owner@example.com'},
        {key:'alertsText', label:'Попередження через кому', placeholder:'Алергія на пеніцилін, чутливість до шуму'},
      ]}/>}
      {confirmDialog}
    </div>
  );
};

// =================================================================
// DOCTORS
// =================================================================
export const AdminDoctors = ({ search = '', notify = () => {}, hasPermission = () => true }) => {
  const { doctors, services, saveDoctor, deleteDoctor } = useStore();
  const { ask, confirmDialog } = useAdminConfirm();
  const visible = doctors.filter(d => matches(d, search));
  const [form, setForm] = uA(null);
  const serviceNameById = uMA(() => Object.fromEntries((services || []).map(s => [s.id, s.name])), [services]);
  const serviceIdByName = uMA(() => Object.fromEntries((services || []).map(s => [String(s.name || '').toLowerCase(), s.id])), [services]);
  const serviceNameOptions = uMA(() => (services || []).map(s => s.name), [services]);
  const save = () => {
    if (!hasPermission('Управління користувачами')) return notify('Недостатньо прав для редагування лікарів.');
    const mappedServices = csv(form.servicesText).map((value) => {
      const raw = String(value || '').trim();
      const byName = serviceIdByName[raw.toLowerCase()];
      if (byName) return byName;
      const byId = services.find(s => s.id === raw);
      return byId?.id || raw;
    }).filter(Boolean);
    const result = saveDoctor({ ...form, exp: toNum(form.exp, 0), services: mappedServices, schedule: csv(form.scheduleText) });
    if (!result.ok) return notify(result.error);
    notify(form.id ? 'Лікаря оновлено.' : 'Лікаря додано.');
    setForm(null);
  };
  const remove = (doctor) => {
    const result = deleteDoctor(doctor.id);
    if (!result.ok) return notify(result.error);
    notify('Лікаря видалено.');
  };
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
        <div><h1 style={{fontSize:28, color:'#fff'}}>Лікарі</h1><p style={{color:'#8aa6a4', fontSize:14}}>Управління командою клініки</p></div>
        <button disabled={!hasPermission('Управління користувачами')} className="btn btn-primary btn-sm" onClick={()=>setForm({ name:'', role:'Терапевт', bio:'', exp:1, servicesText:'Терапія', scheduleText:'Пн 09:00–17:00' })}><Icon name="plus" size={14} color="#fff"/> Додати лікаря</button>
      </div>
      {visible.length === 0 && (
        <ACard style={{padding:48, textAlign:'center', color:'#8aa6a4', fontSize:14}}>Лікарів поки немає. Додайте першого через кнопку вгорі.</ACard>
      )}
      <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14}}>
        {visible.map(d => (
          <ACard key={d.id} style={{padding:22}}>
            <div style={{display:'flex', gap:14, alignItems:'center', marginBottom:14}}>
              <Avatar name={d.name} size={56}/>
              <div style={{flex:1}}>
                <div style={{color:'#fff', fontWeight:600, fontSize:16}}>{d.name}</div>
                <div style={{color:'#8aa6a4', fontSize:12}}>{d.role}</div>
              </div>
              <div style={{display:'flex', gap:6}}><button onClick={()=>setForm({ ...d, servicesText:d.services.map(id => serviceNameById[id] || id).join(', '), scheduleText:d.schedule.join(', ') })} style={{width:30, height:30, borderRadius:8, background:'rgba(255,255,255,0.05)', border:0, color:'#cfdcdb', cursor:'pointer'}}><Icon name="edit" size={14}/></button><button onClick={()=>ask(`Видалити лікаря «${d.name}»?`, () => remove(d))} style={{width:30, height:30, borderRadius:8, background:'rgba(255,255,255,0.05)', border:0, color:'#e64561', cursor:'pointer'}}><Icon name="trash" size={14}/></button></div>
            </div>
            <p style={{color:'#cfdcdb', fontSize:13, marginBottom:14}}>{d.bio}</p>
            <div style={{display:'flex', gap:6, flexWrap:'wrap', marginBottom:14}}>
              {d.services.map(s => {
                const sv = services.find(x => x.id === s);
                return sv && <div key={s} className="chip" style={{background:`var(--${sv.color}-100)`, color:`var(--${sv.color}-700)`, fontSize:11}}>{sv.name}</div>;
              })}
            </div>
            <div style={{padding:'10px 12px', background:'rgba(255,255,255,0.03)', borderRadius:10, fontSize:12}}>
              <div style={{color:'#8aa6a4', marginBottom:6, fontSize:11, textTransform:'uppercase'}}>Графік</div>
              {d.schedule.map((s,i)=><div key={i} style={{color:'#cfdcdb'}}>{s}</div>)}
            </div>
          </ACard>
        ))}
      </div>
      {form && <AdminModal title={form.id ? 'Редагувати лікаря' : 'Новий лікар'} values={form} onChange={(k,v)=>setForm(f=>({...f,[k]:v}))} onClose={()=>setForm(null)} onSubmit={save} fields={[
        {key:'name', label:'Імʼя'},
        {key:'role', label:'Спеціалізація'},
        {key:'exp', label:'Досвід', type:'number'},
        {key:'servicesText', label:'Послуги через кому (укр. назви)', type:'datalist', options:serviceNameOptions, placeholder:'Терапія, УЗД та рентген'},
        {key:'scheduleText', label:'Графік через кому'},
        {key:'bio', label:'Опис', type:'textarea'},
      ]}/>}
      {confirmDialog}
    </div>
  );
};

// =================================================================
// SERVICES
// =================================================================
export const AdminServices = ({ search = '', notify = () => {}, hasPermission = () => true }) => {
  const { services, saveService, deleteService } = useStore();
  const { ask, confirmDialog } = useAdminConfirm();
  const visible = services.filter(s => matches(s, search));
  const [form, setForm] = uA(null);
  const save = () => {
    if (!hasPermission('Управління послугами')) return notify('Недостатньо прав для редагування послуг.');
    const first = { name: form.itemName || form.name, price: toNum(form.price, 0), duration: toNum(form.duration, 30) };
    const result = saveService({ ...form, items: [first, ...(form.items || []).slice(1)] });
    if (!result.ok) return notify(result.error);
    notify(form.id ? 'Послугу оновлено.' : 'Послугу додано.');
    setForm(null);
  };
  const remove = (service) => {
    const result = deleteService(service.id);
    if (!result.ok) return notify(result.error);
    notify('Послугу видалено.');
  };
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
        <div><h1 style={{fontSize:28, color:'#fff'}}>Послуги</h1><p style={{color:'#8aa6a4', fontSize:14}}>Каталог послуг та цін</p></div>
        <button disabled={!hasPermission('Управління послугами')} className="btn btn-primary btn-sm" onClick={()=>setForm({ name:'', short:'', desc:'', icon:'heart', color:'teal', itemName:'Консультація', price:600, duration:30 })}><Icon name="plus" size={14} color="#fff"/> Додати послугу</button>
      </div>
      <ACard style={{padding:0, overflow:'hidden'}}>
        {visible.length === 0 && (
          <div style={{padding:48, textAlign:'center', color:'#8aa6a4', fontSize:14}}>Послуг поки немає.</div>
        )}
        {visible.map((s,i)=>(
          <div key={s.id} style={{padding:'18px 24px', borderTop: i?'1px solid rgba(255,255,255,0.04)':0}}>
            <div style={{display:'grid', gridTemplateColumns:'auto 1fr auto auto', gap:18, alignItems:'center'}}>
              <div style={{width:44, height:44, borderRadius:12, background:`var(--${s.color}-500)`, opacity:.85, display:'grid', placeItems:'center'}}><Icon name={s.icon} size={20} color="#fff"/></div>
              <div>
                <div style={{color:'#fff', fontWeight:600, fontSize:16}}>{s.name}</div>
                <div style={{color:'#8aa6a4', fontSize:12}}>{s.short} · {s.items.length} позицій</div>
              </div>
              <div style={{fontFamily:'var(--font-display)', color:'#fff', fontWeight:700, fontSize:18}}>від {s.items[0].price} ₴</div>
              <div style={{display:'flex', gap:6}}><button onClick={()=>setForm({ ...s, itemName:s.items?.[0]?.name || s.name, price:s.items?.[0]?.price || 0, duration:s.items?.[0]?.duration || 30 })} style={{width:32, height:32, borderRadius:8, background:'rgba(255,255,255,0.05)', border:0, color:'#cfdcdb', cursor:'pointer'}}><Icon name="edit" size={14}/></button><button onClick={()=>ask(`Видалити послугу «${s.name}»?`, () => remove(s))} style={{width:32, height:32, borderRadius:8, background:'rgba(255,255,255,0.05)', border:0, color:'#e64561', cursor:'pointer'}}><Icon name="trash" size={14}/></button></div>
            </div>
          </div>
        ))}
      </ACard>
      {form && <AdminModal title={form.id ? 'Редагувати послугу' : 'Нова послуга'} values={form} onChange={(k,v)=>setForm(f=>({...f,[k]:v}))} onClose={()=>setForm(null)} onSubmit={save} fields={[
        {key:'name', label:'Назва'},
        {key:'short', label:'Короткий опис'},
        {key:'desc', label:'Повний опис', type:'textarea'},
        {key:'itemName', label:'Перша позиція'},
        {key:'price', label:'Ціна', type:'number'},
        {key:'duration', label:'Тривалість', type:'number'},
      ]}/>}
      {confirmDialog}
    </div>
  );
};

// =================================================================
// ARTICLES
// =================================================================
export const AdminArticles = ({ search = '', notify = () => {}, hasPermission = () => true }) => {
  const { articles, saveArticle, deleteArticle } = useStore();
  const { ask, confirmDialog } = useAdminConfirm();
  const visible = articles.filter(a => matches(a, search));
  const [form, setForm] = uA(null);
  const save = () => {
    if (!hasPermission('Управління статтями')) return notify('Недостатньо прав для редагування статей.');
    const result = saveArticle({ ...form, read: toNum(form.read, 4), views: toNum(form.views, 0) });
    if (!result.ok) return notify(result.error);
    notify(form.id ? 'Статтю оновлено.' : 'Статтю додано.');
    setForm(null);
  };
  const remove = (article) => {
    const result = deleteArticle(article.id);
    if (!result.ok) return notify(result.error);
    notify('Статтю видалено.');
  };
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
        <div><h1 style={{fontSize:28, color:'#fff'}}>Статті</h1><p style={{color:'#8aa6a4', fontSize:14}}>Блог клініки</p></div>
        <button disabled={!hasPermission('Управління статтями')} className="btn btn-primary btn-sm" onClick={()=>setForm({ title:'', tag:'Поради', excerpt:'', read:4, views:0, date:formatDateUk() })}><Icon name="plus" size={14} color="#fff"/> Нова стаття</button>
      </div>
      <ACard style={{padding:0, overflow:'hidden'}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr auto auto auto auto', gap:14, padding:'12px 22px', fontSize:11, color:'#8aa6a4', textTransform:'uppercase', fontWeight:600, letterSpacing:'0.04em', borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
          <div>Заголовок</div><div>Тег</div><div>Дата</div><div>Перегляди</div><div></div>
        </div>
        {visible.length === 0 && (
          <div style={{padding:48, textAlign:'center', color:'#8aa6a4', fontSize:14}}>Статей поки немає.</div>
        )}
        {visible.map((a,i)=>(
          <div key={a.id} style={{display:'grid', gridTemplateColumns:'1fr auto auto auto auto', gap:14, padding:'14px 22px', alignItems:'center', borderTop: i?'1px solid rgba(255,255,255,0.04)':0}}>
            <div><div style={{color:'#fff', fontWeight:600, fontSize:14}}>{a.title}</div><div style={{color:'#8aa6a4', fontSize:11}}>{a.excerpt}</div></div>
            <div className="chip" style={{background:'rgba(113,86,209,0.2)', color:'#b3a4ed', fontSize:11}}>{a.tag}</div>
            <div style={{color:'#cfdcdb', fontSize:12}}>{a.date}</div>
            <div style={{color:'#fff', fontWeight:600}}>{Number(a.views || 0).toLocaleString('uk-UA')}</div>
            <div style={{display:'flex', gap:6}}>
              <button onClick={()=>setForm(a)} style={{width:30, height:30, borderRadius:8, background:'rgba(255,255,255,0.05)', border:0, color:'#cfdcdb', cursor:'pointer'}}><Icon name="edit" size={14}/></button>
              <button onClick={()=>ask(`Видалити статтю «${a.title}»?`, () => remove(a))} style={{width:30, height:30, borderRadius:8, background:'rgba(255,255,255,0.05)', border:0, color:'#e64561', cursor:'pointer'}}><Icon name="trash" size={14}/></button>
            </div>
          </div>
        ))}
      </ACard>
      {form && <AdminModal title={form.id ? 'Редагувати статтю' : 'Нова стаття'} values={form} onChange={(k,v)=>setForm(f=>({...f,[k]:v}))} onClose={()=>setForm(null)} onSubmit={save} fields={[
        {key:'title', label:'Заголовок'},
        {key:'tag', label:'Тег'},
        {key:'excerpt', label:'Опис', type:'textarea'},
        {key:'read', label:'Хвилин читання', type:'number'},
        {key:'views', label:'Перегляди', type:'number'},
        {key:'date', label:'Дата'},
      ]}/>}
      {confirmDialog}
    </div>
  );
};

// =================================================================
// MESSAGES
// =================================================================
export const AdminMessages = ({ search = '', notify = () => {} }) => {
  const { clients, messages, updateMessage, deleteMessage, saveClient } = useStore();
  const { ask, confirmDialog } = useAdminConfirm();
  const [filter, setFilter] = uA('all');
  const [selected, setSelected] = uA(null);
  const unreadMessages = messages.filter(m => !m.readAt);
  const filtered = messages.filter(m => filter === 'all' || (filter === 'unread' ? !m.readAt : m.status === filter));
  const visible = filtered.filter(m => matches(m, search));
  const filters = [
    { k:'all', l:'Усі', n:messages.length },
    { k:'unread', l:'Непрочитані', n:unreadMessages.length },
    { k:'new', l:'Нові', n:messages.filter(m => m.status === 'new').length },
    { k:'in-progress', l:'В роботі', n:messages.filter(m => m.status === 'in-progress').length },
    { k:'done', l:'Закриті', n:messages.filter(m => m.status === 'done').length },
  ];
  const fmt = (iso) => {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleString('uk-UA', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }); } catch { return iso.slice(0,16); }
  };
  const statusColor = (s) => s === 'done' ? 'green' : s === 'in-progress' ? 'amber' : 'coral';
  const viewMessage = (message) => {
    const now = new Date().toISOString();
    if (!message.readAt) updateMessage(message.id, { readAt:now, viewedAt:now });
    else updateMessage(message.id, { viewedAt:now });
    setSelected({ ...message, readAt: message.readAt || now, viewedAt: now });
  };
  const makeClient = (message) => {
    const exists = clients.some(c =>
      (message.phone && c.phone === message.phone) ||
      (message.email && c.email && c.email.toLowerCase() === message.email.toLowerCase())
    );
    if (exists) return notify('Клієнт з таким телефоном або email вже є в базі.');
    const result = saveClient({
      name: message.name || 'Новий клієнт',
      phone: message.phone || '',
      email: message.email || '',
      pets: 0,
      visits: 0,
      since: String(new Date().getFullYear()),
      status: 'new',
    });
    if (!result.ok) return notify(result.error);
    updateMessage(message.id, { status:'in-progress', readAt: message.readAt || new Date().toISOString() });
    notify('Клієнта створено. Повідомлення переведено в роботу.');
  };
  const removeMessage = (message) => {
    ask(`Видалити повідомлення від «${message.name || 'клієнта'}»?`, () => deleteMessage(message.id));
  };
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:24}}>
        <div>
          <h1 style={{fontSize:28, color:'#fff'}}>Повідомлення</h1>
          <p style={{color:'#8aa6a4', fontSize:14}}>Звернення з контактної форми · {unreadMessages.length} непрочитаних</p>
        </div>
      </div>
      <div style={{display:'flex', gap:8, marginBottom:16, flexWrap:'wrap'}}>
        {filters.map(f => (
          <button key={f.k} onClick={()=>setFilter(f.k)} style={{padding:'8px 12px', border:0, borderRadius:999, background: filter===f.k?'var(--teal-600)':'rgba(255,255,255,0.06)', color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer'}}>
            {f.l} <span style={{color: filter===f.k?'#dff8f6':'#8aa6a4'}}>· {f.n}</span>
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <ACard style={{padding:48, textAlign:'center', color:'#8aa6a4', fontSize:14}}>
          {messages.length ? 'Нічого не знайдено за обраним фільтром або запитом.' : 'Поки що повідомлень немає. Вони зʼявляться сюди після відправки контактної форми.'}
        </ACard>
      ) : (
        <ACard>
          {visible.map((m, i) => (
            <div key={m.id} style={{padding:'18px 22px', borderTop: i ? '1px solid rgba(255,255,255,0.04)' : 0, display:'grid', gridTemplateColumns:'1fr auto', gap:16, alignItems:'flex-start', background:!m.readAt?'rgba(255,90,90,0.05)':'transparent'}}>
              <div>
                <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:6}}>
                  {!m.readAt && <span style={{width:8, height:8, borderRadius:'50%', background:'var(--coral-500)', flexShrink:0}}/>}
                  <span style={{color:'#fff', fontWeight:600, fontSize:14}}>{m.name || 'Без імені'}</span>
                  <span className={`chip chip-${statusColor(m.status)}`} style={{fontSize:10}}>{m.status === 'done' ? 'Закрито' : m.status === 'in-progress' ? 'В роботі' : 'Нове'}</span>
                  {!m.readAt && <span className="chip chip-rose" style={{fontSize:10}}>Непрочитане</span>}
                  <span style={{color:'#6d8483', fontSize:12}}>{fmt(m.createdAt)}</span>
                </div>
                <div style={{color:'#cfdcdb', fontSize:13, marginBottom:6}}>{m.message}</div>
                <div style={{color:'#8aa6a4', fontSize:12}}>{m.phone ? `тел.: ${m.phone}` : ''}{m.phone && m.email ? ' · ' : ''}{m.email ? `email: ${m.email}` : ''}</div>
              </div>
              <div style={{display:'flex', gap:6, flexShrink:0}}>
                <button onClick={()=>viewMessage(m)} style={{padding:'6px 10px', border:0, borderRadius:6, background:'rgba(255,255,255,0.05)', color:'#fff', cursor:'pointer', fontSize:12}}>Переглянути</button>
                <button onClick={()=>makeClient(m)} style={{padding:'6px 10px', border:0, borderRadius:6, background:'rgba(18,152,148,0.15)', color:'var(--teal-300)', cursor:'pointer', fontSize:12}}>Створити клієнта</button>
                {m.status !== 'in-progress' && <button onClick={()=>updateMessage(m.id, { status:'in-progress', readAt:m.readAt || new Date().toISOString() })} style={{padding:'6px 10px', border:0, borderRadius:6, background:'rgba(255,255,255,0.05)', color:'#cfdcdb', cursor:'pointer', fontSize:12}}>В роботу</button>}
                {m.status !== 'done' && <button onClick={()=>updateMessage(m.id, { status:'done', readAt:m.readAt || new Date().toISOString() })} style={{padding:'6px 10px', border:0, borderRadius:6, background:'rgba(46,196,182,0.15)', color:'var(--green-500)', cursor:'pointer', fontSize:12}}>Закрити</button>}
                <button onClick={()=>removeMessage(m)} style={{padding:'6px 10px', border:0, borderRadius:6, background:'rgba(255,90,90,0.15)', color:'var(--coral-500)', cursor:'pointer', fontSize:12}}>Видалити</button>
              </div>
            </div>
          ))}
        </ACard>
      )}
      {selected && (
        <div className="backdrop" onClick={()=>setSelected(null)}>
          <div onClick={e=>e.stopPropagation()} style={{width:'100%', maxWidth:560, background:'#0f2120', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:24, boxShadow:'0 24px 70px rgba(0,0,0,0.35)'}}>
            <div style={{display:'flex', justifyContent:'space-between', gap:16, alignItems:'flex-start', marginBottom:18}}>
              <div>
                <h2 style={{fontSize:22, color:'#fff', marginBottom:6}}>{selected.name || 'Без імені'}</h2>
                <div style={{color:'#8aa6a4', fontSize:12}}>{fmt(selected.createdAt)} · переглянуто {fmt(selected.viewedAt)}</div>
              </div>
              <ABtn size="icon" onClick={()=>setSelected(null)}><Icon name="x" size={14}/></ABtn>
            </div>
            <div style={{display:'grid', gap:12, marginBottom:18}}>
              <div style={{padding:14, borderRadius:10, background:'rgba(255,255,255,0.04)', color:'#dce8e7', fontSize:14, lineHeight:1.55}}>{selected.message}</div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                <div><div style={{fontSize:11, color:'#8aa6a4', marginBottom:4}}>Телефон</div><div style={{color:'#fff', fontSize:13}}>{selected.phone || '—'}</div></div>
                <div><div style={{fontSize:11, color:'#8aa6a4', marginBottom:4}}>Email</div><div style={{color:'#fff', fontSize:13}}>{selected.email || '—'}</div></div>
              </div>
            </div>
            <div style={{display:'flex', gap:8, justifyContent:'flex-end', flexWrap:'wrap'}}>
              <ABtn onClick={()=>updateMessage(selected.id, { readAt:null })}>Позначити непрочитаним</ABtn>
              <ABtn onClick={()=>updateMessage(selected.id, { status:'in-progress', readAt:selected.readAt || new Date().toISOString() })}>В роботу</ABtn>
              <ABtn tone="primary" onClick={()=>{ updateMessage(selected.id, { status:'done', readAt:selected.readAt || new Date().toISOString() }); setSelected(null); }}>Закрити</ABtn>
            </div>
          </div>
        </div>
      )}
      {confirmDialog}
    </div>
  );
};

// =================================================================
// REPORTS
// =================================================================
export const AdminReports = ({ notify = () => {}, hasPermission = () => true }) => {
  const { appointments, clients } = useStore();
  const [period, setPeriod] = uA('all');
  const periodOptions = [
    { k:'today', l:'Сьогодні', days:1 },
    { k:'7d', l:'7 днів', days:7 },
    { k:'30d', l:'30 днів', days:30 },
    { k:'all', l:'Усе', days:null },
  ];
  const visibleAppointments = appointments.filter(a => {
    if (period === 'all') return true;
    const option = periodOptions.find(p => p.k === period);
    const date = parseIsoDate(a.date);
    if (!date || !option?.days) return false;
    const from = new Date();
    from.setHours(0,0,0,0);
    from.setDate(from.getDate() - option.days + 1);
    const to = new Date();
    to.setHours(23,59,59,999);
    return date >= from && date <= to;
  });
  const previousAppointments = appointments.filter(a => {
    if (period === 'all') return true;
    const option = periodOptions.find(p => p.k === period);
    const date = parseIsoDate(a.date);
    if (!date || !option?.days) return false;
    const to = new Date();
    to.setHours(23,59,59,999);
    to.setDate(to.getDate() - option.days);
    const from = new Date(to);
    from.setHours(0,0,0,0);
    from.setDate(from.getDate() - option.days + 1);
    return date >= from && date <= to;
  });
  const metrics = reportMetrics(visibleAppointments);
  const previousMetrics = reportMetrics(previousAppointments);
  const cancelled = visibleAppointments.filter(a => a.status === 'cancelled').length;
  const retained = visibleAppointments.length ? Math.round(((visibleAppointments.length - cancelled) / visibleAppointments.length) * 100) : 0;
  const delta = (current, previous) => previous ? Math.round(((current - previous) / previous) * 100) : (current ? 100 : 0);
  const stats = [
    {l:'Оплачений дохід', v:money(metrics.revenue), d:`${delta(metrics.revenue, previousMetrics.revenue)}% до попер.`},
    {l:'Середній чек', v:money(metrics.avg), d:`${metrics.paid.length} оплат`},
    {l:'До отримання', v:money(metrics.receivables), d:`${metrics.unpaid.length} неоплачених`},
    {l:'Записів у періоді', v:visibleAppointments.length, d:`${delta(visibleAppointments.length, previousAppointments.length)}% до попер.`},
  ];
  const exportCsv = () => {
    const label = periodOptions.find(p => p.k === period)?.l || 'Усе';
    downloadCsv(`ultravet-report-${period}-${new Date().toISOString().slice(0,10)}.csv`, [
      ['Період', label],
      [],
      ['Дата','Час','Клієнт','Тварина','Послуга','Лікар','Статус','Оплата','Метод','Сума'],
      ...visibleAppointments.map(a => [a.date, a.time, a.client, a.pet, a.service, a.doctor, a.status, a.paymentStatus || (a.status === 'completed' ? 'paid' : 'unpaid'), a.paymentMethod || '', a.price || 0]),
      [],
      ['Метрика','Значення'],
      ['Оплачений дохід', Math.round(metrics.revenue)],
      ['До отримання', Math.round(metrics.receivables)],
      ['Середній чек', Math.round(metrics.avg)],
      ['Записів у періоді', visibleAppointments.length],
      ['Утримання', `${retained}%`],
    ]);
  };
  const printSummary = () => {
    window.print();
    notify('Друкований summary відкрито.');
  };
  const points = metrics.byDay.map((d,i) => {
    const max = Math.max(1, ...metrics.byDay.map(x=>x.v));
    return `${30 + i * 90} ${190 - (d.v / max) * 140}`;
  }).join(' L ');
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', gap:18, marginBottom:24}}>
        <div><h1 style={{fontSize:28, color:'#fff'}}>Звіти</h1><p style={{color:'#8aa6a4', fontSize:14}}>Фінанси та статистика клініки</p></div>
        <div style={{display:'flex', gap:10, alignItems:'center', flexWrap:'wrap', justifyContent:'flex-end'}}>
          <div style={{display:'flex', gap:4, padding:4, background:'rgba(255,255,255,0.05)', borderRadius:10}}>
            {periodOptions.map(p => (
              <button key={p.k} onClick={()=>setPeriod(p.k)} style={{padding:'7px 12px', border:0, borderRadius:8, background: period===p.k?'var(--teal-600)':'transparent', color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer'}}>{p.l}</button>
            ))}
          </div>
          <button disabled={!hasPermission('Експорт даних')} onClick={exportCsv} style={{padding:'10px 14px', border:0, borderRadius:8, background:'rgba(255,255,255,0.06)', color:'#fff', cursor:hasPermission('Експорт даних')?'pointer':'not-allowed', opacity:hasPermission('Експорт даних')?1:0.45, fontSize:13, display:'flex', alignItems:'center', gap:8}}><Icon name="file" size={14}/> CSV</button>
          <button onClick={printSummary} style={{padding:'10px 14px', border:0, borderRadius:8, background:'rgba(255,255,255,0.06)', color:'#fff', cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', gap:8}}><Icon name="print" size={14}/> Друк</button>
        </div>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:18}}>
        {stats.map((s,i)=>(
          <ACard key={i} style={{padding:22}}>
            <div style={{fontSize:12, color:'#8aa6a4', marginBottom:6}}>{s.l}</div>
            <div style={{fontFamily:'var(--font-display)', fontSize:30, fontWeight:700, color:'#fff'}}>{s.v}</div>
            <div style={{fontSize:12, color:'var(--teal-300)', fontWeight:600, marginTop:4}}>{s.d}</div>
          </ACard>
        ))}
      </div>
      <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:18}}>
        <ACard style={{padding:24}}>
          <div style={{fontSize:14, color:'#fff', fontWeight:600, marginBottom:18}}>Записи по днях тижня</div>
          <svg viewBox="0 0 600 240" style={{width:'100%', height:240}}>
            {[40,80,120,160,200].map(y => <line key={y} x1="30" y1={y} x2="600" y2={y} stroke="rgba(255,255,255,0.04)"/>)}
            <path d={`M ${points}`} fill="none" stroke="var(--teal-400)" strokeWidth="3"/>
            <path d={`M ${points} L 570 220 L 30 220 Z`} fill="url(#g1)" opacity=".25"/>
            <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--teal-400)"/><stop offset="1" stopColor="var(--teal-400)" stopOpacity="0"/></linearGradient></defs>
            {metrics.byDay.map((m,i)=>(
              <text key={i} x={30+i*90} y="232" fill="#8aa6a4" fontSize="10" textAnchor="middle">{m.d}</text>
            ))}
          </svg>
        </ACard>
        <ACard style={{padding:24}}>
          <div style={{fontSize:14, color:'#fff', fontWeight:600, marginBottom:18}}>Топ послуг</div>
          {(metrics.topServices.length ? metrics.topServices : [{n:'Немає даних', p:0}]).map((s,i)=>(
            <div key={i} style={{marginBottom:14}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:13}}>
                <span style={{color:'#fff'}}>{s.n}</span><span style={{color:'#8aa6a4'}}>{s.p}%</span>
              </div>
              <div style={{height:6, background:'rgba(255,255,255,0.05)', borderRadius:99, overflow:'hidden'}}>
                <div style={{height:'100%', width:`${s.p*3}%`, background:'var(--teal-500)'}}></div>
              </div>
            </div>
          ))}
        </ACard>
      </div>
    </div>
  );
};

// =================================================================
// ROLES
// =================================================================
export const AdminRoles = ({ notify = () => {}, hasPermission = () => true }) => {
  const { roles, addRole, renameRole, deleteRole, toggleRolePermission } = useStore();
  const { ask, confirmDialog } = useAdminConfirm();
  const [editing, setEditing] = uA(null);
  const [draftName, setDraftName] = uA('');
  const startRename = (role) => {
    if (role.name === 'Адміністратор') return notify('Назву Адміністратора не можна змінювати.');
    setEditing(role.name);
    setDraftName(role.name);
  };
  const commitRename = () => {
    if (!editing) return;
    if (draftName.trim() && draftName.trim() !== editing) {
      const result = renameRole(editing, draftName.trim());
      if (!result.ok) return notify(result.error);
      notify('Назву ролі оновлено.');
    }
    setEditing(null);
  };
  const togglePerm = (roleName, perm) => {
    const result = toggleRolePermission(roleName, perm);
    if (!result.ok) return notify(result.error);
  };
  const onAdd = () => {
    const base = 'Нова роль';
    let name = base; let i = 2;
    while (roles.some(r => r.name === name)) { name = `${base} ${i++}`; }
    const result = addRole(name);
    if (!result.ok) return notify(result.error);
    notify('Роль додана. Перейменуйте її натиснувши на іконку олівця.');
  };
  const onDelete = (role) => {
    ask(`Видалити роль «${role.name}»?`, () => {
      const result = deleteRole(role.name);
      if (!result.ok) return notify(result.error);
      notify('Роль видалена.');
    });
  };
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
        <div><h1 style={{fontSize:28, color:'#fff'}}>Ролі та права</h1><p style={{color:'#8aa6a4', fontSize:14}}>Керування доступом</p></div>
        <button disabled={!hasPermission('Управління ролями')} className="btn btn-primary btn-sm" onClick={onAdd}><Icon name="plus" size={14} color="#fff"/> Нова роль</button>
      </div>
      <div style={{display:'grid', gridTemplateColumns:`repeat(${roles.length},1fr)`, gap:14, marginBottom:24}}>
        {roles.map((r,i)=>(
          <ACard key={r.name} style={{padding:22}}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14, gap:10}}>
              <div style={{display:'flex', alignItems:'center', gap:12, minWidth:0, flex:1}}>
                <div style={{width:40, height:40, borderRadius:10, background:`var(--${r.c}-500)`, opacity:.85, display:'grid', placeItems:'center', flexShrink:0}}><Icon name="shield" size={18} color="#fff"/></div>
                <div style={{minWidth:0, flex:1}}>
                  {editing === r.name ? (
                    <AInput autoFocus value={draftName} onChange={e=>setDraftName(e.target.value)} onBlur={commitRename} onKeyDown={e=>{ if (e.key==='Enter') commitRename(); if (e.key==='Escape') setEditing(null); }} style={{padding:'6px 8px', fontSize:14}}/>
                  ) : (
                    <div style={{color:'#fff', fontWeight:600, fontSize:16, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{r.name}</div>
                  )}
                  <div style={{color:'#8aa6a4', fontSize:12}}>{r.n} користувачів</div>
                </div>
              </div>
              <div style={{display:'flex', gap:4}}>
                <ABtn size="icon" onClick={()=>startRename(r)} title="Перейменувати"><Icon name="edit" size={14}/></ABtn>
                {r.name !== 'Адміністратор' && (
                  <ABtn size="icon" tone="danger" onClick={()=>onDelete(r)} title="Видалити роль"><Icon name="trash" size={14}/></ABtn>
                )}
              </div>
            </div>
            <div style={{display:'grid', gap:6}}>
              {r.perms.map((p,pi)=>(
                <div key={pi} style={{display:'flex', alignItems:'center', gap:8, fontSize:12, color:'#cfdcdb'}}>
                  <Icon name="check" size={12} color="var(--green-500)"/> {p}
                </div>
              ))}
            </div>
          </ACard>
        ))}
      </div>
      <ACard style={{padding:24}}>
        <div style={{fontSize:14, color:'#fff', fontWeight:600, marginBottom:14}}>Матриця прав</div>
        <div style={{display:'grid', gridTemplateColumns:`1.5fr repeat(${roles.length}, 1fr)`, gap:0, fontSize:12}}>
          <div style={{padding:'10px 14px', color:'#8aa6a4', fontWeight:600, borderBottom:'1px solid rgba(255,255,255,0.06)'}}>Дозвіл</div>
          {roles.map(r=><div key={r.name} style={{padding:'10px 14px', color:'#8aa6a4', fontWeight:600, textAlign:'center', borderBottom:'1px solid rgba(255,255,255,0.06)'}}>{r.name}</div>)}
          {ALL_ROLE_PERMISSIONS.map((p,i)=>(
            <React.Fragment key={p}>
              <div style={{padding:'10px 14px', color:'#cfdcdb', borderBottom: i<ALL_ROLE_PERMISSIONS.length-1?'1px solid rgba(255,255,255,0.04)':0}}>{p}</div>
              {roles.map((r)=>(
                <div key={r.name} style={{padding:'10px 14px', textAlign:'center', borderBottom: i<ALL_ROLE_PERMISSIONS.length-1?'1px solid rgba(255,255,255,0.04)':0}}>
                  <button onClick={()=>togglePerm(r.name, p)} disabled={r.name==='Адміністратор' || !hasPermission('Управління ролями')} style={{width:26, height:26, border:0, borderRadius:7, background:r.perms.includes(p)?'rgba(30,169,114,0.16)':'rgba(255,255,255,0.04)', color:r.perms.includes(p)?'var(--green-500)':'rgba(255,255,255,0.25)', cursor:r.name==='Адміністратор' || !hasPermission('Управління ролями')?'not-allowed':'pointer', opacity:r.name==='Адміністратор' || !hasPermission('Управління ролями')?0.7:1}}>
                    {r.perms.includes(p) ? <Icon name="check" size={14}/> : '—'}
                  </button>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </ACard>
      {confirmDialog}
    </div>
  );
};

// =================================================================
// SETTINGS
// =================================================================
export const AdminSettings = ({ notify = () => {}, hasPermission = () => true }) => {
  const store = useStore();
  const { settings, updateSettings, resetState, importState } = store;
  const { ask, confirmDialog } = useAdminConfirm();
  const [draft, setDraft] = uA(settings);
  React.useEffect(() => { setDraft(settings); }, [settings]);
  const dirty = uMA(() => JSON.stringify(draft) !== JSON.stringify(settings), [draft, settings]);
  const setClinic = (key, value) => setDraft(d => ({ ...d, clinic: { ...d.clinic, [key]: value } }));
  const setSchedule = (index, key, value) => setDraft(d => ({ ...d, schedule: d.schedule.map((row, i) => i === index ? { ...row, [key]: value } : row) }));
  const setNotification = (key) => setDraft(d => ({ ...d, notifications: { ...d.notifications, [key]: !d.notifications[key] } }));
  const setIntegration = (id, patch) => setDraft(d => ({ ...d, integrations: (d.integrations || []).map(it => it.id === id ? { ...it, ...patch } : it) }));
  const setAdminPassword = (value) => setDraft(d => ({ ...d, adminPassword: value }));
  const saveDraft = () => {
    if (!hasPermission('Налаштування клініки')) return notify('Недостатньо прав для зміни налаштувань.');
    if (draft.clinic.email && !validEmail(draft.clinic.email)) return notify('Введіть коректний email клініки.');
    if (draft.clinic.phone && !validPhone(draft.clinic.phone)) return notify('Введіть коректний телефон клініки.');
    for (const row of draft.schedule) {
      if (!validTime(row.from) || !validTime(row.to)) return notify(`${row.day}: час має бути у форматі HH:MM або —.`);
      if (row.from !== '—' && row.to !== '—' && row.from >= row.to) return notify(`${row.day}: початок має бути раніше завершення.`);
    }
    if (!draft.adminPassword) return notify('Пароль адміна не може бути порожнім.');
    updateSettings(draft);
    notify('Налаштування збережено.');
  };
  const discardDraft = () => { setDraft(settings); notify('Зміни скасовано.'); };
  const fileInputRef = React.useRef(null);
  const exportJson = () => {
    const snapshot = ['services','doctors','articles','appointments','clients','pets','reviews','messages','medicalRecords','vaccinations','invoices','settings','currentUser','cookiesAccepted']
      .reduce((acc, k) => ({ ...acc, [k]: store[k] }), {});
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ultravet-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const importJson = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (importState(parsed)) notify('Дані успішно імпортовано.');
        else notify('Файл не містить валідного state.');
      } catch {
        notify('Не вдалося прочитати JSON.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };
  const onReset = () => {
    ask('Скинути всі дані до seed? Поточні зміни буде втрачено.', resetState, { confirmLabel:'Скинути', title:'Скинути демо-дані' });
  };
  const notif = [
    ['sms', 'SMS клієнтам про запис'],
    ['reminder', 'Нагадування за день'],
    ['emailArticles', 'Email-розсилка статей'],
    ['doctorPush', 'Push для лікарів'],
  ];
  return (
    <div>
      <div style={{marginBottom:24, display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:18, flexWrap:'wrap'}}>
        <div>
          <h1 style={{fontSize:28, color:'#fff'}}>Налаштування клініки</h1>
          <p style={{color:'#8aa6a4', fontSize:14}}>Загальні налаштування системи {dirty && <span style={{color:'var(--coral-500)', fontWeight:600}}>· незбережені зміни</span>}</p>
        </div>
        <div style={{display:'flex', gap:10}}>
          <ABtn onClick={discardDraft} disabled={!dirty} style={{opacity:dirty?1:0.4, cursor:dirty?'pointer':'not-allowed'}}>Скасувати</ABtn>
          <ABtn tone="primary" onClick={saveDraft} disabled={!dirty} icon="check" style={{opacity:dirty?1:0.5, cursor:dirty?'pointer':'not-allowed'}}>Зберегти</ABtn>
        </div>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, maxWidth:920}}>
        <ACard style={{padding:24}}>
          <div style={{fontSize:14, color:'#fff', fontWeight:600, marginBottom:14}}>Інформація про клініку</div>
          <div style={{display:'grid', gap:12}}>
            {[{l:'Назва', k:'name'},{l:'Адреса', k:'address'},{l:'Телефон', k:'phone'},{l:'Email', k:'email'}].map((f)=>(
              <AField key={f.k} label={f.l}>
                <AInput value={draft.clinic[f.k] || ''} onChange={e=>setClinic(f.k, e.target.value)}/>
              </AField>
            ))}
          </div>
        </ACard>
        <ACard style={{padding:24}}>
          <div style={{fontSize:14, color:'#fff', fontWeight:600, marginBottom:14}}>Робочий графік</div>
          <div style={{display:'grid', gap:8}}>
            {draft.schedule.map((d,i)=>(
              <div key={d.day} style={{display:'grid', gridTemplateColumns:'1fr auto auto', gap:10, alignItems:'center', padding:'8px 0'}}>
                <div style={{color:'#fff', fontSize:13}}>{d.day}</div>
                <AInput value={d.from} onChange={e=>setSchedule(i, 'from', e.target.value)} style={{width:80, padding:'6px 8px', fontSize:12, textAlign:'center', borderRadius:6}}/>
                <AInput value={d.to} onChange={e=>setSchedule(i, 'to', e.target.value)} style={{width:80, padding:'6px 8px', fontSize:12, textAlign:'center', borderRadius:6}}/>
              </div>
            ))}
          </div>
        </ACard>
        <ACard style={{padding:24}}>
          <div style={{fontSize:14, color:'#fff', fontWeight:600, marginBottom:14}}>Сповіщення</div>
          {notif.map(([k,n],i)=>(
            <div key={i} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderTop: i?'1px solid rgba(255,255,255,0.04)':0}}>
              <div style={{color:'#fff', fontSize:13}}>{n}</div>
              <div onClick={()=>setNotification(k)} style={{width:36, height:20, borderRadius:99, background: draft.notifications[k]?'var(--teal-500)':'rgba(255,255,255,0.1)', position:'relative', cursor:'pointer'}}>
                <div style={{position:'absolute', top:2, left: draft.notifications[k]?18:2, width:16, height:16, borderRadius:'50%', background:'#fff', transition:'left .2s'}}/>
              </div>
            </div>
          ))}
        </ACard>
        <ACard style={{padding:24}}>
          <div style={{fontSize:14, color:'#fff', fontWeight:600, marginBottom:14}}>Безпека адмінки</div>
          <AField label="Пароль адміністратора" hint="Використовується для входу через посилання «Адмін-панель» у футері.">
            <AInput type="password" value={draft.adminPassword || ''} onChange={e=>setAdminPassword(e.target.value)}/>
          </AField>
        </ACard>
        <ACard style={{padding:24}}>
          <div style={{fontSize:14, color:'#fff', fontWeight:600, marginBottom:14}}>Інтеграції</div>
          {(draft.integrations || []).map((it,i)=>(
            <div key={it.id} style={{display:'grid', gridTemplateColumns:'1fr auto', gap:12, alignItems:'center', padding:'12px 0', borderTop: i?'1px solid rgba(255,255,255,0.04)':0}}>
              <div>
                <div style={{color:'#fff', fontSize:13, fontWeight:600}}>{it.name}</div>
                <AInput value={it.account || ''} onChange={e=>setIntegration(it.id, { account:e.target.value })} placeholder="Акаунт або ключ" style={{marginTop:8, padding:'7px 9px', fontSize:12}}/>
                <div style={{color:'#6d8483', fontSize:11, marginTop:5}}>Синхронізація: {it.sync}</div>
              </div>
              <button onClick={()=>setIntegration(it.id, { connected:!it.connected })} className={`chip chip-${it.connected?'green':'rose'}`} style={{fontSize:11, border:0, cursor:'pointer'}}>
                {it.connected ? 'Підключено' : 'Вимкнено'}
              </button>
            </div>
          ))}
        </ACard>
        <ACard style={{padding:24, gridColumn:'1 / -1'}}>
          <div style={{fontSize:14, color:'#fff', fontWeight:600, marginBottom:6}}>Дані демо</div>
          <div style={{color:'#8aa6a4', fontSize:12, marginBottom:14}}>Експортуйте поточний стан у JSON, відновіть з файлу або скиньте до seed-даних.</div>
          <div style={{display:'flex', gap:10, flexWrap:'wrap'}}>
            <ABtn icon="file" onClick={exportJson} style={{color:'#fff'}}>Експорт JSON</ABtn>
            <ABtn icon="plus" onClick={()=>fileInputRef.current?.click()} style={{color:'#fff'}}>Імпорт JSON</ABtn>
            <input ref={fileInputRef} type="file" accept="application/json" onChange={importJson} style={{display:'none'}}/>
            <ABtn tone="danger" icon="x" onClick={onReset} style={{marginLeft:'auto'}}>Скинути до seed</ABtn>
          </div>
        </ACard>
      </div>
      {confirmDialog}
    </div>
  );
};
