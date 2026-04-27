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
const reportMetrics = (appointments) => {
  const completed = appointments.filter(a => a.status === 'completed');
  const revenue = completed.reduce((sum, a) => sum + Number(a.price || 0), 0);
  const avg = completed.length ? revenue / completed.length : 0;
  const byService = appointments.reduce((acc, a) => ({ ...acc, [a.service]: (acc[a.service] || 0) + 1 }), {});
  const topServices = Object.entries(byService).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([name,count]) => ({ n:name, p: Math.round((count / Math.max(appointments.length, 1)) * 100) }));
  const weekDays = ['Нд','Пн','Вт','Ср','Чт','Пт','Сб'];
  const byDay = weekDays.map((d, day) => ({ d, v: appointments.filter(a => new Date(a.date).getDay() === day).length, c: completed.filter(a => new Date(a.date).getDay() === day).length }));
  return { completed, revenue, avg, topServices, byDay };
};

export const AdminLayout = ({ current, setRoute, role, setRole, exitAdmin, children, search, setSearch }) => {
  const { appointments, messages, pets } = useStore();
  const [showNotifications, setShowNotifications] = uA(false);
  const notifications = [
    ...appointments.filter(a => a.status === 'waiting').slice(0, 4).map(a => ({
      id: `ap-${a.id}`,
      title: 'Новий запис очікує підтвердження',
      body: `${a.client} · ${a.pet} · ${a.date} ${a.time}`,
      route: 'appointments',
    })),
    ...messages.slice(0, 3).map(m => ({
      id: `m-${m.id}`,
      title: 'Нове повідомлення з контактної форми',
      body: `${m.name || 'Клієнт'} · ${m.phone || ''}`,
      route: 'messages',
    })),
    ...pets.filter(p => p.alerts?.length).slice(0, 3).map(p => ({
      id: `p-${p.id}`,
      title: 'Медичне попередження',
      body: `${p.name}: ${p.alerts.join(', ')}`,
      route: 'pets',
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
    { k:'messages', l:'Повідомлення', i:'mail', badge: messages.filter(m => m.status === 'new').length },
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
            <option value="admin">Адміністратор</option>
            <option value="doctor">Лікар</option>
            <option value="receptionist">Реєстратор</option>
          </select>
        </div>
        <nav style={{display:'grid', gap:2, flex:1}}>
          {items.map(it => (
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
        <button onClick={exitAdmin} style={{display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:9, border:0, background:'transparent', color:'#cfdcdb', fontSize:13, cursor:'pointer'}}>
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
              {notifications.length > 0 && <div style={{position:'absolute', top:6, right:6, width:7, height:7, borderRadius:'50%', background:'var(--coral-500)'}}></div>}
            </button>
            {showNotifications && (
              <div style={{position:'absolute', right:0, top:44, width:340, background:'#0f2120', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, boxShadow:'0 20px 50px rgba(0,0,0,0.25)', overflow:'hidden', zIndex:50}}>
                <div style={{padding:'12px 14px', borderBottom:'1px solid rgba(255,255,255,0.06)', color:'#fff', fontWeight:600, fontSize:13}}>Сповіщення</div>
                {notifications.length ? notifications.map(n => (
                  <button key={n.id} onClick={()=>{ setRoute(n.route); setShowNotifications(false); }} style={{display:'block', width:'100%', padding:'12px 14px', border:0, borderTop:'1px solid rgba(255,255,255,0.04)', background:'transparent', textAlign:'left', cursor:'pointer'}}>
                    <div style={{color:'#fff', fontSize:13, fontWeight:600, marginBottom:3}}>{n.title}</div>
                    <div style={{color:'#8aa6a4', fontSize:12}}>{n.body}</div>
                  </button>
                )) : (
                  <div style={{padding:16, color:'#8aa6a4', fontSize:13}}>Нових сповіщень немає</div>
                )}
              </div>
            )}
            </div>
            <div style={{display:'flex', alignItems:'center', gap:10, padding:'4px 10px 4px 4px', background:'rgba(255,255,255,0.05)', borderRadius:999}}>
              <Avatar name="Олена Ткач" size={28}/>
              <div style={{fontSize:13}}>
                <div style={{color:'#fff', fontWeight:600, lineHeight:1}}>Олена Ткач</div>
                <div style={{color:'#8aa6a4', fontSize:11}}>{role === 'admin'?'Адмін':role==='doctor'?'Лікар':'Реєстратор'}</div>
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

const AdminModal = ({ title, values, fields, onChange, onClose, onSubmit, submitLabel = 'Зберегти' }) => (
  <div className="backdrop" onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{width:'100%', maxWidth:520, background:'#0f2120', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:24, boxShadow:'0 24px 70px rgba(0,0,0,0.35)'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18}}>
        <h2 style={{fontSize:22, color:'#fff'}}>{title}</h2>
        <button onClick={onClose} style={{width:32, height:32, borderRadius:8, border:0, background:'rgba(255,255,255,0.06)', color:'#cfdcdb', cursor:'pointer'}}><Icon name="x" size={16}/></button>
      </div>
      <div style={{display:'grid', gap:12}}>
        {fields.map(f => (
          <div key={f.key}>
            <label style={{fontSize:12, color:'#8aa6a4', marginBottom:6, display:'block'}}>{f.label}</label>
            {f.type === 'textarea' ? (
              <ATextarea rows="3" value={values[f.key] || ''} onChange={e=>onChange(f.key, e.target.value)}/>
            ) : f.type === 'select' ? (
              <ASelect value={values[f.key] || ''} onChange={e=>onChange(f.key, e.target.value)}>
                {(f.options || []).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </ASelect>
            ) : f.type === 'datalist' ? (
              <>
                <AInput list={`dl-${f.key}`} value={values[f.key] || ''} onChange={e=>onChange(f.key, e.target.value)} placeholder={f.placeholder}/>
                <datalist id={`dl-${f.key}`}>
                  {(f.options || []).map(o => <option key={o} value={o}/>)}
                </datalist>
              </>
            ) : (
              <AInput type={f.type || 'text'} value={values[f.key] || ''} onChange={e=>onChange(f.key, e.target.value)}/>
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

// =================================================================
// DASHBOARD
// =================================================================
export const AdminDashboard = ({ role, search = '', setRoute }) => {
  const { appointments, clients } = useStore();
  const visibleAppointments = appointments.filter(a => matches(a, search));
  const metrics = reportMetrics(visibleAppointments);
  const today = visibleAppointments.filter(a => a.date === new Date().toISOString().slice(0,10));
  const stats = [
    { l:'Записів сьогодні', v:today.length, d:`+${today.filter(a=>a.status==='waiting').length}`, icon:'calendar', c:'teal' },
    { l:'Нових клієнтів', v:clients.filter(c=>c.status==='new').length, d:`${clients.length} всього`, icon:'users', c:'coral' },
    { l:'Дохід завершено', v:money(metrics.revenue), d:`${metrics.completed.length} оплат`, icon:'money', c:'amber' },
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
              <div style={{fontSize:13, color:'#8aa6a4', fontWeight:500}}>Записи за тиждень</div>
              <div style={{fontFamily:'var(--font-display)', fontSize:28, color:'#fff', fontWeight:700}}>{visibleAppointments.length} записів</div>
            </div>
            <div style={{display:'flex', gap:6, padding:4, background:'rgba(255,255,255,0.05)', borderRadius:8}}>
              {['Тиждень','Місяць','Рік'].map((p,i)=>(
                <button key={p} style={{padding:'6px 12px', border:0, borderRadius:6, background: i===0?'var(--teal-600)':'transparent', color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer'}}>{p}</button>
              ))}
            </div>
          </div>
          {/* Bar chart */}
          <svg viewBox="0 0 540 220" style={{width:'100%', height:220}}>
            {[20,40,60,80,100,120,140,160].map(y => <line key={y} x1="40" y1={y+20} x2="540" y2={y+20} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>)}
            {metrics.byDay.map((b,i)=>{
              const x = 60 + i*68;
              const maxV = Math.max(1, ...metrics.byDay.map(d=>Math.max(d.v, d.c)));
              const h1 = (b.v/maxV)*150;
              const h2 = (b.c/maxV)*150;
              return (
                <g key={i}>
                  <rect x={x} y={180-h2} width="22" height={h2} fill="var(--teal-700)" rx="4"/>
                  <rect x={x+26} y={180-h1} width="22" height={h1} fill="var(--coral-500)" rx="4"/>
                  <text x={x+24} y="200" fill="#8aa6a4" fontSize="11" textAnchor="middle">{b.d}</text>
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
export const AdminCalendar = ({ search = '', notify = () => {} }) => {
  const { appointments, doctors, addAppointment } = useStore();
  const [view, setView] = uA('day');
  const [form, setForm] = uA(null);
  const hours = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'];
  const todayIso = new Date().toISOString().slice(0, 10);
  const todayApps = appointments.filter(a => a.date === todayIso && matches(a, search));
  const createAt = (doctor, time) => {
    setForm({ client:'', pet:'', petType:'Інше', serviceName:'Консультація', doctorName:doctor?.name || '—', date:todayIso, time, status:'waiting', price:600 });
  };
  const save = () => {
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
          <button className="btn btn-primary btn-sm" onClick={()=>createAt(doctors[0], '09:00')}><Icon name="plus" size={14} color="#fff"/> Запис</button>
        </div>
      </div>

      <ACard style={{padding:0, overflow:'hidden'}}>
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
                <div key={d.id} onClick={()=>!ap && createAt(d, h)} style={{padding:6, borderLeft:'1px solid rgba(255,255,255,0.04)', position:'relative', cursor: ap?'default':'pointer'}}>
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
      </ACard>
      {form && <AdminModal title="Новий запис у календарі" values={form} onChange={(k,v)=>setForm(f=>({...f,[k]:v}))} onClose={()=>setForm(null)} onSubmit={save} fields={[
        {key:'client', label:'Клієнт'},
        {key:'pet', label:'Тварина'},
        {key:'petType', label:'Вид'},
        {key:'serviceName', label:'Послуга'},
        {key:'doctorName', label:'Лікар'},
        {key:'date', label:'Дата', type:'date'},
        {key:'time', label:'Час'},
        {key:'price', label:'Сума', type:'number'},
      ]}/>}
    </div>
  );
};

// =================================================================
// APPOINTMENTS
// =================================================================
export const AdminAppointments = ({ search: globalSearch = '', notify = () => {} }) => {
  const { appointments, pets, clients, doctors, services, updateAppointment, deleteAppointment, addAppointment, savePet } = useStore();
  const [filter, setFilter] = uA('all');
  const [search, setSearch] = uA('');
  const empty = { client:'', pet:'', petType:'Кіт', serviceName:'Консультація', doctorName:'—', date:new Date().toISOString().slice(0,10), time:'09:00', status:'waiting', price:600 };
  const [form, setForm] = uA(null);
  const clientOptions = uMA(() => Array.from(new Set(clients.map(c => c.name))), [clients]);
  const doctorOptions = uMA(() => ['—', ...doctors.map(d => d.name)], [doctors]);
  const serviceOptions = uMA(() => Array.from(new Set(services.map(s => s.name))), [services]);
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
      if (found) next.petType = found.species || next.petType;
    }
    if (key === 'serviceName') {
      const svc = services.find(s => s.name === value);
      if (svc?.items?.[0]?.price) next.price = svc.items[0].price;
    }
    return next;
  });
  const q = [search, globalSearch].filter(Boolean).join(' ');
  const filtered = appointments.filter(a => (filter==='all' || a.status===filter) && (!q || matches(a, q)));
  const filters = [
    {k:'all', l:'Усі', n:appointments.length},
    {k:'confirmed', l:'Підтверджено', n:appointments.filter(a=>a.status==='confirmed').length},
    {k:'in-progress', l:'На прийомі', n:appointments.filter(a=>a.status==='in-progress').length},
    {k:'waiting', l:'Очікують', n:appointments.filter(a=>a.status==='waiting').length},
    {k:'completed', l:'Завершено', n:appointments.filter(a=>a.status==='completed').length},
    {k:'cancelled', l:'Скасовано', n:appointments.filter(a=>a.status==='cancelled').length},
  ];
  const save = () => {
    const payload = { ...form, service: form.serviceName, doctor: form.doctorName, price: toNum(form.price, 0) };
    if (payload.id) updateAppointment(payload.id, payload);
    else {
      const result = addAppointment({ ...payload, force: true });
      if (!result.ok) return notify(result.error);
      const hasPet = pets.some(p => p.name === payload.pet && p.owner === payload.client);
      if (!hasPet) {
        const petResult = savePet({ name: payload.pet, owner: payload.client, species: payload.petType || 'Інше', breed: '', age: 0, weight: 0, alerts: [] });
        if (!petResult.ok) return notify(petResult.error);
        notify('Запис створено, картку тварини додано.');
      } else {
        notify('Запис створено.');
      }
    }
    setForm(null);
  };
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
        <div><h1 style={{fontSize:28, color:'#fff'}}>Записи</h1><p style={{color:'#8aa6a4', fontSize:14}}>Усі записи клініки</p></div>
        <div style={{display:'flex', gap:10}}>
          <button className="btn btn-sm" style={{background:'rgba(255,255,255,0.06)', color:'#fff'}}><Icon name="filter" size={14}/> Фільтри</button>
          <button className="btn btn-primary btn-sm" onClick={()=>setForm(empty)}><Icon name="plus" size={14} color="#fff"/> Новий</button>
        </div>
      </div>

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

      <ACard style={{padding:0, overflow:'hidden'}}>
        <div style={{display:'grid', gridTemplateColumns:'auto 1.4fr 1.4fr 1.4fr 1fr auto auto auto', gap:14, padding:'12px 22px', fontSize:11, color:'#8aa6a4', textTransform:'uppercase', fontWeight:600, letterSpacing:'0.04em', borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
          <div></div><div>Клієнт</div><div>Послуга</div><div>Лікар</div><div>Час</div><div>Статус</div><div>Сума</div><div></div>
        </div>
        {filtered.length === 0 ? (
          <div style={{padding:48, textAlign:'center', color:'#8aa6a4', fontSize:14}}>Немає записів за цим фільтром.</div>
        ) : filtered.map((ap,i)=>{
          const statusLabel = { confirmed:'Підтвердити', 'in-progress':'На прийом', completed:'Завершити', cancelled:'Скасувати' };
          return (
          <div key={ap.id} style={{display:'grid', gridTemplateColumns:'auto 1.4fr 1.4fr 1.4fr 1fr auto auto auto', gap:14, padding:'14px 22px', alignItems:'center', borderTop: i?'1px solid rgba(255,255,255,0.04)':0}}>
            <Avatar name={ap.client} size={34}/>
            <div><div style={{color:'#fff', fontSize:13, fontWeight:600}}>{ap.client}</div><div style={{color:'#8aa6a4', fontSize:11}}>{ap.pet} · {ap.petType}</div></div>
            <div style={{color:'#cfdcdb', fontSize:12}}>{ap.service}</div>
            <div style={{color:'#cfdcdb', fontSize:12}}>{ap.doctor}</div>
            <div style={{color:'#cfdcdb', fontSize:12}}>{ap.date} · {ap.time}</div>
            <StatusPill status={ap.status}/>
            <div style={{fontFamily:'var(--font-display)', color:'#fff', fontWeight:700}}>{ap.price} ₴</div>
            <div style={{display:'flex', gap:4}}>
              {Object.entries(statusLabel).filter(([st]) => st !== ap.status).map(([st, label]) => (
                <button key={st} onClick={()=>updateAppointment(ap.id,{status:st})} title={label} style={{padding:'5px 9px', border:0, borderRadius:6, background:'rgba(255,255,255,0.05)', color:'#cfdcdb', cursor:'pointer', fontSize:11}}>{label}</button>
              ))}
              <button onClick={()=>setForm({ ...ap, serviceName: ap.service, doctorName: ap.doctor })} title="Редагувати" style={{width:28, height:28, border:0, borderRadius:6, background:'rgba(255,255,255,0.05)', color:'#cfdcdb', cursor:'pointer', display:'grid', placeItems:'center'}}><Icon name="edit" size={13}/></button>
              <button onClick={()=>{ if (window.confirm('Видалити запис?')) deleteAppointment(ap.id); }} title="Видалити" style={{width:28, height:28, border:0, borderRadius:6, background:'rgba(255,255,255,0.05)', color:'#e64561', cursor:'pointer', display:'grid', placeItems:'center'}}><Icon name="trash" size={13}/></button>
            </div>
          </div>
          );
        })}
      </ACard>
      {form && <AdminModal title={form.id ? 'Редагувати запис' : 'Новий запис'} values={form} onChange={onFormChange} onClose={()=>setForm(null)} onSubmit={save} fields={[
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
      ]}/>}
    </div>
  );
};

// =================================================================
// CLIENTS
// =================================================================
export const AdminClients = ({ search = '', notify = () => {} }) => {
  const { clients, saveClient, deleteClient } = useStore();
  const visible = clients.filter(c => matches(c, search));
  const [form, setForm] = uA(null);
  const save = () => {
    const result = saveClient({ ...form, pets: toNum(form.pets, 0), visits: toNum(form.visits, 0) });
    if (!result.ok) return notify(result.error);
    setForm(null);
  };
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
        <div><h1 style={{fontSize:28, color:'#fff'}}>Клієнти</h1><p style={{color:'#8aa6a4', fontSize:14}}>{visible.length} клієнтів у системі</p></div>
        <button className="btn btn-primary btn-sm" onClick={()=>setForm({ name:'', phone:'', email:'', pets:0, visits:0, since:String(new Date().getFullYear()), status:'new' })}><Icon name="plus" size={14} color="#fff"/> Додати клієнта</button>
      </div>
      <ACard style={{padding:0, overflow:'hidden'}}>
        <div style={{display:'grid', gridTemplateColumns:'auto 1.5fr 1.2fr 1.4fr auto auto auto', gap:14, padding:'12px 22px', fontSize:11, color:'#8aa6a4', textTransform:'uppercase', fontWeight:600, letterSpacing:'0.04em', borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
          <div></div><div>Клієнт</div><div>Телефон</div><div>Email</div><div>Тварини</div><div>Візити</div><div>Статус</div>
        </div>
        {visible.length === 0 && (
          <div style={{padding:48, textAlign:'center', color:'#8aa6a4', fontSize:14}}>Клієнтів поки немає.</div>
        )}
        {visible.map((c,i)=>(
          <div key={c.id} style={{display:'grid', gridTemplateColumns:'auto 1.5fr 1.2fr 1.4fr auto auto auto', gap:14, padding:'14px 22px', alignItems:'center', borderTop: i?'1px solid rgba(255,255,255,0.04)':0}}>
            <Avatar name={c.name} size={36}/>
            <div><div style={{color:'#fff', fontSize:13, fontWeight:600}}>{c.name}</div><div style={{color:'#8aa6a4', fontSize:11}}>з {c.since} року</div></div>
            <div style={{color:'#cfdcdb', fontSize:12, fontFamily:'var(--font-mono)'}}>{c.phone}</div>
            <div style={{color:'#cfdcdb', fontSize:12}}>{c.email}</div>
            <div style={{color:'#fff', fontSize:13, fontWeight:600, textAlign:'center'}}>{c.pets}</div>
            <div style={{color:'#fff', fontSize:13, fontWeight:600, textAlign:'center'}}>{c.visits}</div>
            <div style={{display:'flex', gap:6, alignItems:'center'}}><StatusPill status={c.status}/><button onClick={()=>setForm(c)} style={{border:0, background:'transparent', color:'#cfdcdb', cursor:'pointer'}}><Icon name="edit" size={14}/></button><button onClick={()=>{ if (window.confirm(`Видалити клієнта «${c.name}»?`)) deleteClient(c.id); }} style={{border:0, background:'transparent', color:'#e64561', cursor:'pointer'}}><Icon name="trash" size={14}/></button></div>
          </div>
        ))}
      </ACard>
      {form && <AdminModal title={form.id ? 'Редагувати клієнта' : 'Новий клієнт'} values={form} onChange={(k,v)=>setForm(f=>({...f,[k]:v}))} onClose={()=>setForm(null)} onSubmit={save} fields={[
        {key:'name', label:'Імʼя'},
        {key:'phone', label:'Телефон'},
        {key:'email', label:'Email'},
        {key:'pets', label:'Тварини', type:'number'},
        {key:'visits', label:'Візити', type:'number'},
        {key:'status', label:'Статус', type:'select', options:[{value:'active', label:'Активний'}, {value:'new', label:'Новий'}]},
      ]}/>}
    </div>
  );
};

// =================================================================
// PETS
// =================================================================
export const AdminPets = ({ search = '', notify = () => {} }) => {
  const { pets, savePet, deletePet } = useStore();
  const visible = pets.filter(p => matches(p, search));
  const [selectedId, setSelectedId] = uA(pets[0]?.id);
  const [form, setForm] = uA(null);
  const selected = pets.find(p => p.id === selectedId) || visible[0] || pets[0];
  const save = () => {
    const payload = { ...form, age: toNum(form.age, 0), weight: toNum(form.weight, 0), alerts: csv(form.alertsText) };
    const result = savePet(payload);
    if (!result.ok) return notify(result.error);
    setForm(null);
  };
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
        <div><h1 style={{fontSize:28, color:'#fff'}}>Картки тварин</h1><p style={{color:'#8aa6a4', fontSize:14}}>{visible.length} тварин у базі</p></div>
        <button className="btn btn-primary btn-sm" onClick={()=>setForm({ name:'', species:'Кіт', breed:'', age:1, weight:0, owner:'', alertsText:'' })}><Icon name="plus" size={14} color="#fff"/> Завести</button>
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
              <PetIllustration kind={p.species==='Кіт'?'cat':'dog'} color={p.species==='Кіт'?'teal':'coral'} size={48}/>
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
              <PetIllustration kind={selected.species==='Кіт'?'cat':'dog'} color="teal" size={120}/>
              <div style={{flex:1}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                  <div>
                    <h2 style={{fontSize:24, color:'#fff'}}>{selected.name}</h2>
                    <p style={{color:'#8aa6a4', fontSize:14}}>{selected.species} · {selected.breed}</p>
                  </div>
                  <div style={{display:'flex', gap:6}}><button onClick={()=>setForm({ ...selected, alertsText: selected.alerts?.join(', ') || '' })} style={{padding:'6px 12px', background:'rgba(255,255,255,0.05)', border:0, borderRadius:8, color:'#fff', fontSize:12, cursor:'pointer'}}><Icon name="edit" size={12}/> Редагувати</button><button onClick={()=>{ if (window.confirm(`Видалити «${selected.name}»?`)) deletePet(selected.id); }} style={{padding:'6px 12px', background:'rgba(255,255,255,0.05)', border:0, borderRadius:8, color:'#e64561', fontSize:12, cursor:'pointer'}}><Icon name="trash" size={12}/></button></div>
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
              {[{n:'Комплексна (DHPPi+L)', d:'12.10.2025', s:'актуальна'},{n:'Сказ', d:'05.06.2025', s:'актуальна'},{n:'Бордетела', d:'10.01.2026', s:'актуальна'}].map((v,i)=>(
                <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderTop: i?'1px solid rgba(255,255,255,0.04)':0}}>
                  <div><div style={{color:'#fff', fontSize:13, fontWeight:600}}>{v.n}</div><div style={{color:'#8aa6a4', fontSize:11}}>{v.d}</div></div>
                  <div className="chip chip-green" style={{fontSize:10}}>{v.s}</div>
                </div>
              ))}
            </ACard>
            <ACard style={{padding:22}}>
              <div style={{fontSize:14, color:'#fff', fontWeight:600, marginBottom:14}}>Останні візити</div>
              {[{s:'Терапевтичний прийом', d:selected.lastVisit, dr:'Марта Коваль'},{s:'УЗД серця', d:'2026-02-10', dr:'Марта Коваль'},{s:'Чистка зубів', d:'2025-11-22', dr:'Ольга Середа'}].map((v,i)=>(
                <div key={i} style={{padding:'10px 0', borderTop: i?'1px solid rgba(255,255,255,0.04)':0}}>
                  <div style={{color:'#fff', fontSize:13, fontWeight:600}}>{v.s}</div>
                  <div style={{color:'#8aa6a4', fontSize:11}}>{v.d} · {v.dr}</div>
                </div>
              ))}
            </ACard>
          </div>
          <ACard style={{padding:22}}>
            <div style={{fontSize:14, color:'#fff', fontWeight:600, marginBottom:14}}>Медична історія</div>
            <div style={{position:'relative', paddingLeft:18}}>
              <div style={{position:'absolute', left:5, top:8, bottom:8, width:2, background:'rgba(255,255,255,0.06)'}}/>
              {[
                {d:'12.04.2026', t:'Терапевтичний прийом', n:'Профілактичний огляд, все в нормі. Призначено вітамінний комплекс.'},
                {d:'10.02.2026', t:'УЗД серця', n:'Структурних змін не виявлено. Рекомендовано контроль через 12 міс.'},
                {d:'22.11.2025', t:'Чистка зубів', n:'УЗ чистка під седацією. Видалено зуб 102 (рухливість 3 ст.).'},
              ].map((e,i)=>(
                <div key={i} style={{position:'relative', paddingBottom:18}}>
                  <div style={{position:'absolute', left:-18, top:6, width:12, height:12, borderRadius:'50%', background:'var(--teal-500)', border:'3px solid #0f2120'}}/>
                  <div style={{fontSize:11, color:'var(--teal-300)', fontWeight:600, marginBottom:4}}>{e.d}</div>
                  <div style={{color:'#fff', fontSize:14, fontWeight:600, marginBottom:4}}>{e.t}</div>
                  <div style={{color:'#cfdcdb', fontSize:13}}>{e.n}</div>
                </div>
              ))}
            </div>
          </ACard>
        </div>
      </div>
      )}
      {form && <AdminModal title={form.id ? 'Редагувати тварину' : 'Нова тварина'} values={form} onChange={(k,v)=>setForm(f=>({...f,[k]:v}))} onClose={()=>setForm(null)} onSubmit={save} fields={[
        {key:'name', label:'Кличка'},
        {key:'species', label:'Вид', type:'select', options:[{value:'Кіт', label:'Кіт'}, {value:'Собака', label:'Собака'}, {value:'Інше', label:'Інше'}]},
        {key:'breed', label:'Порода'},
        {key:'age', label:'Вік', type:'number'},
        {key:'weight', label:'Вага', type:'number'},
        {key:'owner', label:'Власник'},
        {key:'alertsText', label:'Попередження через кому'},
      ]}/>}
    </div>
  );
};

// =================================================================
// DOCTORS
// =================================================================
export const AdminDoctors = ({ search = '' }) => {
  const { doctors, services, saveDoctor, deleteDoctor } = useStore();
  const visible = doctors.filter(d => matches(d, search));
  const [form, setForm] = uA(null);
  const save = () => {
    saveDoctor({ ...form, exp: toNum(form.exp, 0), services: csv(form.servicesText), schedule: csv(form.scheduleText) });
    setForm(null);
  };
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
        <div><h1 style={{fontSize:28, color:'#fff'}}>Лікарі</h1><p style={{color:'#8aa6a4', fontSize:14}}>Управління командою клініки</p></div>
        <button className="btn btn-primary btn-sm" onClick={()=>setForm({ name:'', role:'Терапевт', bio:'', exp:1, servicesText:'therapy', scheduleText:'Пн 09:00–17:00' })}><Icon name="plus" size={14} color="#fff"/> Додати лікаря</button>
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
              <div style={{display:'flex', gap:6}}><button onClick={()=>setForm({ ...d, servicesText:d.services.join(', '), scheduleText:d.schedule.join(', ') })} style={{width:30, height:30, borderRadius:8, background:'rgba(255,255,255,0.05)', border:0, color:'#cfdcdb', cursor:'pointer'}}><Icon name="edit" size={14}/></button><button onClick={()=>{ if (window.confirm(`Видалити «${d.name}»?`)) deleteDoctor(d.id); }} style={{width:30, height:30, borderRadius:8, background:'rgba(255,255,255,0.05)', border:0, color:'#e64561', cursor:'pointer'}}><Icon name="trash" size={14}/></button></div>
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
        {key:'servicesText', label:'ID послуг через кому'},
        {key:'scheduleText', label:'Графік через кому'},
        {key:'bio', label:'Опис', type:'textarea'},
      ]}/>}
    </div>
  );
};

// =================================================================
// SERVICES
// =================================================================
export const AdminServices = ({ search = '' }) => {
  const { services, saveService, deleteService } = useStore();
  const visible = services.filter(s => matches(s, search));
  const [form, setForm] = uA(null);
  const save = () => {
    const first = { name: form.itemName || form.name, price: toNum(form.price, 0), duration: toNum(form.duration, 30) };
    saveService({ ...form, items: [first, ...(form.items || []).slice(1)] });
    setForm(null);
  };
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
        <div><h1 style={{fontSize:28, color:'#fff'}}>Послуги</h1><p style={{color:'#8aa6a4', fontSize:14}}>Каталог послуг та цін</p></div>
        <button className="btn btn-primary btn-sm" onClick={()=>setForm({ name:'', short:'', desc:'', icon:'heart', color:'teal', itemName:'Консультація', price:600, duration:30 })}><Icon name="plus" size={14} color="#fff"/> Додати послугу</button>
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
              <div style={{display:'flex', gap:6}}><button onClick={()=>setForm({ ...s, itemName:s.items?.[0]?.name || s.name, price:s.items?.[0]?.price || 0, duration:s.items?.[0]?.duration || 30 })} style={{width:32, height:32, borderRadius:8, background:'rgba(255,255,255,0.05)', border:0, color:'#cfdcdb', cursor:'pointer'}}><Icon name="edit" size={14}/></button><button onClick={()=>{ if (window.confirm(`Видалити послугу «${s.name}»?`)) deleteService(s.id); }} style={{width:32, height:32, borderRadius:8, background:'rgba(255,255,255,0.05)', border:0, color:'#e64561', cursor:'pointer'}}><Icon name="trash" size={14}/></button></div>
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
    </div>
  );
};

// =================================================================
// ARTICLES
// =================================================================
export const AdminArticles = ({ search = '' }) => {
  const { articles, saveArticle, deleteArticle } = useStore();
  const visible = articles.filter(a => matches(a, search));
  const [form, setForm] = uA(null);
  const save = () => { saveArticle({ ...form, read: toNum(form.read, 4) }); setForm(null); };
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
        <div><h1 style={{fontSize:28, color:'#fff'}}>Статті</h1><p style={{color:'#8aa6a4', fontSize:14}}>Блог клініки</p></div>
        <button className="btn btn-primary btn-sm" onClick={()=>setForm({ title:'', tag:'Поради', excerpt:'', read:4, date:formatDateUk() })}><Icon name="plus" size={14} color="#fff"/> Нова стаття</button>
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
            <div style={{color:'#fff', fontWeight:600}}>{(i+1)*247}</div>
            <div style={{display:'flex', gap:6}}>
              <button onClick={()=>setForm(a)} style={{width:30, height:30, borderRadius:8, background:'rgba(255,255,255,0.05)', border:0, color:'#cfdcdb', cursor:'pointer'}}><Icon name="edit" size={14}/></button>
              <button onClick={()=>{ if (window.confirm(`Видалити статтю «${a.title}»?`)) deleteArticle(a.id); }} style={{width:30, height:30, borderRadius:8, background:'rgba(255,255,255,0.05)', border:0, color:'#e64561', cursor:'pointer'}}><Icon name="trash" size={14}/></button>
            </div>
          </div>
        ))}
      </ACard>
      {form && <AdminModal title={form.id ? 'Редагувати статтю' : 'Нова стаття'} values={form} onChange={(k,v)=>setForm(f=>({...f,[k]:v}))} onClose={()=>setForm(null)} onSubmit={save} fields={[
        {key:'title', label:'Заголовок'},
        {key:'tag', label:'Тег'},
        {key:'excerpt', label:'Опис', type:'textarea'},
        {key:'read', label:'Хвилин читання', type:'number'},
        {key:'date', label:'Дата'},
      ]}/>}
    </div>
  );
};

// =================================================================
// MESSAGES
// =================================================================
export const AdminMessages = ({ search = '', notify = () => {} }) => {
  const { clients, messages, updateMessage, deleteMessage, saveClient } = useStore();
  const [filter, setFilter] = uA('all');
  const filtered = messages.filter(m => filter === 'all' || m.status === filter);
  const visible = filtered.filter(m => matches(m, search));
  const filters = [
    { k:'all', l:'Усі', n:messages.length },
    { k:'new', l:'Нові', n:messages.filter(m => m.status === 'new').length },
    { k:'in-progress', l:'В роботі', n:messages.filter(m => m.status === 'in-progress').length },
    { k:'done', l:'Закриті', n:messages.filter(m => m.status === 'done').length },
  ];
  const fmt = (iso) => {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleString('uk-UA', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }); } catch { return iso.slice(0,16); }
  };
  const statusColor = (s) => s === 'done' ? 'green' : s === 'in-progress' ? 'amber' : 'coral';
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
    updateMessage(message.id, { status:'in-progress' });
    notify('Клієнта створено. Повідомлення переведено в роботу.');
  };
  const removeMessage = (message) => {
    if (window.confirm(`Видалити повідомлення від «${message.name || 'клієнта'}»?`)) {
      deleteMessage(message.id);
    }
  };
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:24}}>
        <div>
          <h1 style={{fontSize:28, color:'#fff'}}>Повідомлення</h1>
          <p style={{color:'#8aa6a4', fontSize:14}}>Звернення з контактної форми ({messages.length})</p>
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
            <div key={m.id} style={{padding:'18px 22px', borderTop: i ? '1px solid rgba(255,255,255,0.04)' : 0, display:'grid', gridTemplateColumns:'1fr auto', gap:16, alignItems:'flex-start'}}>
              <div>
                <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:6}}>
                  <span style={{color:'#fff', fontWeight:600, fontSize:14}}>{m.name || 'Без імені'}</span>
                  <span className={`chip chip-${statusColor(m.status)}`} style={{fontSize:10}}>{m.status === 'done' ? 'Закрито' : m.status === 'in-progress' ? 'В роботі' : 'Нове'}</span>
                  <span style={{color:'#6d8483', fontSize:12}}>{fmt(m.createdAt)}</span>
                </div>
                <div style={{color:'#cfdcdb', fontSize:13, marginBottom:6}}>{m.message}</div>
                <div style={{color:'#8aa6a4', fontSize:12}}>{m.phone ? `тел.: ${m.phone}` : ''}{m.phone && m.email ? ' · ' : ''}{m.email ? `email: ${m.email}` : ''}</div>
              </div>
              <div style={{display:'flex', gap:6, flexShrink:0}}>
                <button onClick={()=>makeClient(m)} style={{padding:'6px 10px', border:0, borderRadius:6, background:'rgba(18,152,148,0.15)', color:'var(--teal-300)', cursor:'pointer', fontSize:12}}>Створити клієнта</button>
                {m.status !== 'in-progress' && <button onClick={()=>updateMessage(m.id, { status:'in-progress' })} style={{padding:'6px 10px', border:0, borderRadius:6, background:'rgba(255,255,255,0.05)', color:'#cfdcdb', cursor:'pointer', fontSize:12}}>В роботу</button>}
                {m.status !== 'done' && <button onClick={()=>updateMessage(m.id, { status:'done' })} style={{padding:'6px 10px', border:0, borderRadius:6, background:'rgba(46,196,182,0.15)', color:'var(--green-500)', cursor:'pointer', fontSize:12}}>Закрити</button>}
                <button onClick={()=>removeMessage(m)} style={{padding:'6px 10px', border:0, borderRadius:6, background:'rgba(255,90,90,0.15)', color:'var(--coral-500)', cursor:'pointer', fontSize:12}}>Видалити</button>
              </div>
            </div>
          ))}
        </ACard>
      )}
    </div>
  );
};

// =================================================================
// REPORTS
// =================================================================
export const AdminReports = ({ notify = () => {} }) => {
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
    {l:'Дохід завершено', v:money(metrics.revenue), d:`${delta(metrics.revenue, previousMetrics.revenue)}% до попер.`},
    {l:'Середній чек', v:money(metrics.avg), d:`${metrics.completed.length} оплат`},
    {l:'Записів у періоді', v:visibleAppointments.length, d:`${delta(visibleAppointments.length, previousAppointments.length)}% до попер.`},
    {l:'Утримання', v:`${retained}%`, d:`${clients.length} клієнтів`},
  ];
  const exportCsv = () => {
    const label = periodOptions.find(p => p.k === period)?.l || 'Усе';
    downloadCsv(`ultravet-report-${period}-${new Date().toISOString().slice(0,10)}.csv`, [
      ['Період', label],
      [],
      ['Дата','Час','Клієнт','Тварина','Послуга','Лікар','Статус','Сума'],
      ...visibleAppointments.map(a => [a.date, a.time, a.client, a.pet, a.service, a.doctor, a.status, a.price || 0]),
      [],
      ['Метрика','Значення'],
      ['Дохід завершено', Math.round(metrics.revenue)],
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
          <button onClick={exportCsv} style={{padding:'10px 14px', border:0, borderRadius:8, background:'rgba(255,255,255,0.06)', color:'#fff', cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', gap:8}}><Icon name="file" size={14}/> CSV</button>
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
export const AdminRoles = ({ notify = () => {} }) => {
  const { roles, addRole, renameRole, deleteRole, toggleRolePermission } = useStore();
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
    if (!window.confirm(`Видалити роль «${role.name}»?`)) return;
    const result = deleteRole(role.name);
    if (!result.ok) return notify(result.error);
    notify('Роль видалена.');
  };
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
        <div><h1 style={{fontSize:28, color:'#fff'}}>Ролі та права</h1><p style={{color:'#8aa6a4', fontSize:14}}>Керування доступом</p></div>
        <button className="btn btn-primary btn-sm" onClick={onAdd}><Icon name="plus" size={14} color="#fff"/> Нова роль</button>
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
                  <button onClick={()=>togglePerm(r.name, p)} disabled={r.name==='Адміністратор'} style={{width:26, height:26, border:0, borderRadius:7, background:r.perms.includes(p)?'rgba(30,169,114,0.16)':'rgba(255,255,255,0.04)', color:r.perms.includes(p)?'var(--green-500)':'rgba(255,255,255,0.25)', cursor:r.name==='Адміністратор'?'not-allowed':'pointer', opacity:r.name==='Адміністратор'?0.7:1}}>
                    {r.perms.includes(p) ? <Icon name="check" size={14}/> : '—'}
                  </button>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </ACard>
    </div>
  );
};

// =================================================================
// SETTINGS
// =================================================================
export const AdminSettings = ({ notify = () => {} }) => {
  const store = useStore();
  const { settings, updateSettings, resetState, importState } = store;
  const [draft, setDraft] = uA(settings);
  React.useEffect(() => { setDraft(settings); }, [settings]);
  const dirty = uMA(() => JSON.stringify(draft) !== JSON.stringify(settings), [draft, settings]);
  const setClinic = (key, value) => setDraft(d => ({ ...d, clinic: { ...d.clinic, [key]: value } }));
  const setSchedule = (index, key, value) => setDraft(d => ({ ...d, schedule: d.schedule.map((row, i) => i === index ? { ...row, [key]: value } : row) }));
  const setNotification = (key) => setDraft(d => ({ ...d, notifications: { ...d.notifications, [key]: !d.notifications[key] } }));
  const setAdminPassword = (value) => setDraft(d => ({ ...d, adminPassword: value }));
  const saveDraft = () => {
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
    const snapshot = ['services','doctors','articles','appointments','clients','pets','reviews','messages','settings','currentUser','cookiesAccepted']
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
    if (window.confirm('Скинути всі дані до seed? Поточні зміни буде втрачено.')) resetState();
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
          {[{n:'Telegram bot', s:'Підключено'},{n:'Viber', s:'Підключено'},{n:'Google Calendar', s:'Не підключено'},{n:'1C Бухгалтерія', s:'Підключено'}].map((it,i)=>(
            <div key={i} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderTop: i?'1px solid rgba(255,255,255,0.04)':0}}>
              <div style={{color:'#fff', fontSize:13}}>{it.n}</div>
              <div className={`chip chip-${it.s==='Підключено'?'green':'rose'}`} style={{fontSize:11}}>{it.s}</div>
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
    </div>
  );
};
