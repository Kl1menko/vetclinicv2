// Admin pages
import React, { useState as uA, useMemo as uMA } from 'react';
import { Icon, PetIllustration, Avatar, StatusPill, Stars } from './components.jsx';
import { SERVICES, DOCTORS, ARTICLES, APPOINTMENTS, CLIENTS, PETS } from './data.js';

export const AdminLayout = ({ current, setRoute, role, setRole, exitAdmin, children }) => {
  const items = [
    { k:'dashboard', l:'Дашборд', i:'chart' },
    { k:'calendar', l:'Календар', i:'calendar' },
    { k:'appointments', l:'Записи', i:'list' },
    { k:'clients', l:'Клієнти', i:'users' },
    { k:'pets', l:'Тварини', i:'paw' },
    { k:'doctors', l:'Лікарі', i:'user' },
    { k:'services', l:'Послуги', i:'heart' },
    { k:'articles', l:'Статті', i:'book' },
    { k:'reports', l:'Звіти', i:'activity' },
    { k:'roles', l:'Ролі', i:'shield' },
    { k:'settings', l:'Налаштування', i:'settings' },
  ];
  return (
    <div style={{display:'grid', gridTemplateColumns:'248px 1fr', minHeight:'100vh', background:'#0d1a1a', color:'#cfdcdb'}} data-screen-label={`ADMIN · ${current}`}>
      <aside style={{background:'#091414', borderRight:'1px solid rgba(255,255,255,0.06)', padding:20, position:'sticky', top:0, height:'100vh', display:'flex', flexDirection:'column'}}>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:24, padding:'4px 8px'}}>
          <div style={{width:32, height:32, borderRadius:9, background:'var(--teal-500)', display:'grid', placeItems:'center'}}><Icon name="paw" size={18} color="#fff"/></div>
          <div>
            <div style={{fontFamily:'var(--font-display)', fontWeight:700, color:'#fff', fontSize:15}}>PetCare</div>
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
            <input placeholder="Пошук клієнтів, тварин, записів..." style={{width:'100%', padding:'10px 14px 10px 40px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, color:'#fff', fontSize:13.5, outline:'none'}}/>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:14}}>
            <button style={{position:'relative', width:36, height:36, borderRadius:10, background:'rgba(255,255,255,0.05)', border:0, color:'#cfdcdb', cursor:'pointer'}}>
              <Icon name="bell" size={16}/>
              <div style={{position:'absolute', top:6, right:6, width:7, height:7, borderRadius:'50%', background:'var(--coral-500)'}}></div>
            </button>
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

// =================================================================
// DASHBOARD
// =================================================================
export const AdminDashboard = ({ role }) => {
  const today = APPOINTMENTS.filter(a => a.date === '2026-04-26');
  const stats = [
    { l:'Записів сьогодні', v:today.length, d:'+12%', icon:'calendar', c:'teal' },
    { l:'Нових клієнтів', v:'7', d:'+24%', icon:'users', c:'coral' },
    { l:'Дохід за день', v:'18 450 ₴', d:'+8%', icon:'money', c:'amber' },
    { l:'Завершено', v:APPOINTMENTS.filter(a=>a.status==='completed').length, d:'+3', icon:'check', c:'green' },
  ];
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:24}}>
        <div>
          <h1 style={{fontSize:28, color:'#fff', marginBottom:4}}>Дашборд</h1>
          <p style={{color:'#8aa6a4', fontSize:14}}>Неділя · 26 квітня 2026 · Огляд клініки</p>
        </div>
        <button className="btn btn-primary"><Icon name="plus" size={14} color="#fff"/> Новий запис</button>
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
              <div style={{fontFamily:'var(--font-display)', fontSize:28, color:'#fff', fontWeight:700}}>87 записів</div>
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
            {[{d:'Пн',v:12,c:14},{d:'Вт',v:18,c:20},{d:'Ср',v:14,c:16},{d:'Чт',v:22,c:24},{d:'Пт',v:19,c:21},{d:'Сб',v:15,c:17},{d:'Нд',v:8,c:10}].map((b,i)=>{
              const x = 60 + i*68;
              const maxV = 24;
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
            <button style={{border:0, background:'transparent', color:'var(--teal-300)', fontSize:12, cursor:'pointer'}}>Усі →</button>
          </div>
          <div>
            {APPOINTMENTS.slice(0,6).map((ap,i)=>(
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
              {l:'Створити запис', i:'plus', c:'teal'},
              {l:'Додати клієнта', i:'user', c:'coral'},
              {l:'Завести тварину', i:'paw', c:'amber'},
              {l:'Виставити рахунок', i:'money', c:'violet'},
            ].map((a,i)=>(
              <button key={i} style={{display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, border:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', color:'#fff', fontSize:13, fontWeight:500, cursor:'pointer', textAlign:'left'}}>
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
export const AdminCalendar = () => {
  const [view, setView] = uA('day');
  const hours = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'];
  const todayApps = APPOINTMENTS.filter(a => a.date === '2026-04-26');
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
        <div>
          <h1 style={{fontSize:28, color:'#fff'}}>Календар</h1>
          <p style={{color:'#8aa6a4', fontSize:14}}>26 квітня 2026 · неділя</p>
        </div>
        <div style={{display:'flex', gap:10, alignItems:'center'}}>
          <div style={{display:'flex', gap:4, padding:4, background:'rgba(255,255,255,0.05)', borderRadius:8}}>
            {['День','Тиждень','Місяць'].map((p,i)=>{
              const k = ['day','week','month'][i];
              return <button key={p} onClick={()=>setView(k)} style={{padding:'6px 14px', border:0, borderRadius:6, background: view===k?'var(--teal-600)':'transparent', color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer'}}>{p}</button>;
            })}
          </div>
          <button className="btn btn-primary btn-sm"><Icon name="plus" size={14} color="#fff"/> Запис</button>
        </div>
      </div>

      <ACard style={{padding:0, overflow:'hidden'}}>
        <div style={{display:'grid', gridTemplateColumns:`80px repeat(${DOCTORS.length}, 1fr)`, borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
          <div></div>
          {DOCTORS.map(d => (
            <div key={d.id} style={{padding:'14px 12px', borderLeft:'1px solid rgba(255,255,255,0.04)', textAlign:'center'}}>
              <Avatar name={d.name} size={32}/>
              <div style={{fontSize:12, color:'#fff', fontWeight:600, marginTop:6}}>{d.name.split(' ')[0]}</div>
              <div style={{fontSize:10, color:'#8aa6a4'}}>{d.role.split(',')[0]}</div>
            </div>
          ))}
        </div>
        {hours.map((h,hi) => (
          <div key={h} style={{display:'grid', gridTemplateColumns:`80px repeat(${DOCTORS.length}, 1fr)`, borderBottom:'1px solid rgba(255,255,255,0.04)', minHeight:60}}>
            <div style={{padding:'10px 12px', fontSize:11, color:'#8aa6a4', fontFamily:'var(--font-mono)'}}>{h}</div>
            {DOCTORS.map((d, di) => {
              const ap = todayApps.find(a => a.time === h && a.doctor === d.name);
              return (
                <div key={d.id} style={{padding:6, borderLeft:'1px solid rgba(255,255,255,0.04)', position:'relative'}}>
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
    </div>
  );
};

// =================================================================
// APPOINTMENTS
// =================================================================
export const AdminAppointments = () => {
  const [filter, setFilter] = uA('all');
  const [search, setSearch] = uA('');
  const filtered = APPOINTMENTS.filter(a => (filter==='all' || a.status===filter) && (!search || a.client.toLowerCase().includes(search.toLowerCase()) || a.pet.toLowerCase().includes(search.toLowerCase())));
  const filters = [
    {k:'all', l:'Усі', n:APPOINTMENTS.length},
    {k:'confirmed', l:'Підтверджено', n:APPOINTMENTS.filter(a=>a.status==='confirmed').length},
    {k:'in-progress', l:'На прийомі', n:APPOINTMENTS.filter(a=>a.status==='in-progress').length},
    {k:'waiting', l:'Очікують', n:APPOINTMENTS.filter(a=>a.status==='waiting').length},
    {k:'completed', l:'Завершено', n:APPOINTMENTS.filter(a=>a.status==='completed').length},
    {k:'cancelled', l:'Скасовано', n:APPOINTMENTS.filter(a=>a.status==='cancelled').length},
  ];
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
        <div><h1 style={{fontSize:28, color:'#fff'}}>Записи</h1><p style={{color:'#8aa6a4', fontSize:14}}>Усі записи клініки</p></div>
        <div style={{display:'flex', gap:10}}>
          <button className="btn btn-sm" style={{background:'rgba(255,255,255,0.06)', color:'#fff'}}><Icon name="filter" size={14}/> Фільтри</button>
          <button className="btn btn-primary btn-sm"><Icon name="plus" size={14} color="#fff"/> Новий</button>
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
        <div style={{display:'grid', gridTemplateColumns:'auto 1.4fr 1.4fr 1.4fr 1fr auto auto', gap:14, padding:'12px 22px', fontSize:11, color:'#8aa6a4', textTransform:'uppercase', fontWeight:600, letterSpacing:'0.04em', borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
          <div></div><div>Клієнт</div><div>Послуга</div><div>Лікар</div><div>Час</div><div>Статус</div><div>Сума</div>
        </div>
        {filtered.map((ap,i)=>(
          <div key={ap.id} style={{display:'grid', gridTemplateColumns:'auto 1.4fr 1.4fr 1.4fr 1fr auto auto', gap:14, padding:'14px 22px', alignItems:'center', borderTop: i?'1px solid rgba(255,255,255,0.04)':0, cursor:'pointer'}}>
            <Avatar name={ap.client} size={34}/>
            <div><div style={{color:'#fff', fontSize:13, fontWeight:600}}>{ap.client}</div><div style={{color:'#8aa6a4', fontSize:11}}>{ap.pet} · {ap.petType}</div></div>
            <div style={{color:'#cfdcdb', fontSize:12}}>{ap.service}</div>
            <div style={{color:'#cfdcdb', fontSize:12}}>{ap.doctor}</div>
            <div style={{color:'#cfdcdb', fontSize:12}}>{ap.date} · {ap.time}</div>
            <StatusPill status={ap.status}/>
            <div style={{fontFamily:'var(--font-display)', color:'#fff', fontWeight:700}}>{ap.price} ₴</div>
          </div>
        ))}
      </ACard>
    </div>
  );
};

// =================================================================
// CLIENTS
// =================================================================
export const AdminClients = () => {
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
        <div><h1 style={{fontSize:28, color:'#fff'}}>Клієнти</h1><p style={{color:'#8aa6a4', fontSize:14}}>{CLIENTS.length} клієнтів у системі</p></div>
        <button className="btn btn-primary btn-sm"><Icon name="plus" size={14} color="#fff"/> Додати клієнта</button>
      </div>
      <ACard style={{padding:0, overflow:'hidden'}}>
        <div style={{display:'grid', gridTemplateColumns:'auto 1.5fr 1.2fr 1.4fr auto auto auto', gap:14, padding:'12px 22px', fontSize:11, color:'#8aa6a4', textTransform:'uppercase', fontWeight:600, letterSpacing:'0.04em', borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
          <div></div><div>Клієнт</div><div>Телефон</div><div>Email</div><div>Тварини</div><div>Візити</div><div>Статус</div>
        </div>
        {CLIENTS.map((c,i)=>(
          <div key={c.id} style={{display:'grid', gridTemplateColumns:'auto 1.5fr 1.2fr 1.4fr auto auto auto', gap:14, padding:'14px 22px', alignItems:'center', borderTop: i?'1px solid rgba(255,255,255,0.04)':0, cursor:'pointer'}}>
            <Avatar name={c.name} size={36}/>
            <div><div style={{color:'#fff', fontSize:13, fontWeight:600}}>{c.name}</div><div style={{color:'#8aa6a4', fontSize:11}}>з {c.since} року</div></div>
            <div style={{color:'#cfdcdb', fontSize:12, fontFamily:'var(--font-mono)'}}>{c.phone}</div>
            <div style={{color:'#cfdcdb', fontSize:12}}>{c.email}</div>
            <div style={{color:'#fff', fontSize:13, fontWeight:600, textAlign:'center'}}>{c.pets}</div>
            <div style={{color:'#fff', fontSize:13, fontWeight:600, textAlign:'center'}}>{c.visits}</div>
            <StatusPill status={c.status}/>
          </div>
        ))}
      </ACard>
    </div>
  );
};

// =================================================================
// PETS
// =================================================================
export const AdminPets = () => {
  const [selected, setSelected] = uA(PETS[0]);
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
        <div><h1 style={{fontSize:28, color:'#fff'}}>Картки тварин</h1><p style={{color:'#8aa6a4', fontSize:14}}>{PETS.length} тварин у базі</p></div>
        <button className="btn btn-primary btn-sm"><Icon name="plus" size={14} color="#fff"/> Завести</button>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'380px 1fr', gap:16}}>
        <ACard style={{padding:0, overflow:'hidden', height:'fit-content'}}>
          {PETS.map((p,i)=>(
            <button key={p.id} onClick={()=>setSelected(p)} style={{width:'100%', display:'grid', gridTemplateColumns:'auto 1fr', gap:12, padding:'14px 18px', alignItems:'center', border:0, background: selected.id===p.id?'rgba(18,152,148,0.15)':'transparent', borderTop: i?'1px solid rgba(255,255,255,0.04)':0, textAlign:'left', cursor:'pointer'}}>
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
                  <button style={{padding:'6px 12px', background:'rgba(255,255,255,0.05)', border:0, borderRadius:8, color:'#fff', fontSize:12, cursor:'pointer'}}><Icon name="edit" size={12}/> Редагувати</button>
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
    </div>
  );
};

// =================================================================
// DOCTORS
// =================================================================
export const AdminDoctors = () => {
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
        <div><h1 style={{fontSize:28, color:'#fff'}}>Лікарі</h1><p style={{color:'#8aa6a4', fontSize:14}}>Управління командою клініки</p></div>
        <button className="btn btn-primary btn-sm"><Icon name="plus" size={14} color="#fff"/> Додати лікаря</button>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14}}>
        {DOCTORS.map(d => (
          <ACard key={d.id} style={{padding:22}}>
            <div style={{display:'flex', gap:14, alignItems:'center', marginBottom:14}}>
              <Avatar name={d.name} size={56}/>
              <div style={{flex:1}}>
                <div style={{color:'#fff', fontWeight:600, fontSize:16}}>{d.name}</div>
                <div style={{color:'#8aa6a4', fontSize:12}}>{d.role}</div>
              </div>
              <button style={{width:30, height:30, borderRadius:8, background:'rgba(255,255,255,0.05)', border:0, color:'#cfdcdb', cursor:'pointer'}}><Icon name="edit" size={14}/></button>
            </div>
            <p style={{color:'#cfdcdb', fontSize:13, marginBottom:14}}>{d.bio}</p>
            <div style={{display:'flex', gap:6, flexWrap:'wrap', marginBottom:14}}>
              {d.services.map(s => {
                const sv = SERVICES.find(x => x.id === s);
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
    </div>
  );
};

// =================================================================
// SERVICES
// =================================================================
export const AdminServices = () => {
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
        <div><h1 style={{fontSize:28, color:'#fff'}}>Послуги</h1><p style={{color:'#8aa6a4', fontSize:14}}>Каталог послуг та цін</p></div>
        <button className="btn btn-primary btn-sm"><Icon name="plus" size={14} color="#fff"/> Додати послугу</button>
      </div>
      <ACard style={{padding:0, overflow:'hidden'}}>
        {SERVICES.map((s,i)=>(
          <div key={s.id} style={{padding:'18px 24px', borderTop: i?'1px solid rgba(255,255,255,0.04)':0}}>
            <div style={{display:'grid', gridTemplateColumns:'auto 1fr auto auto', gap:18, alignItems:'center'}}>
              <div style={{width:44, height:44, borderRadius:12, background:`var(--${s.color}-500)`, opacity:.85, display:'grid', placeItems:'center'}}><Icon name={s.icon} size={20} color="#fff"/></div>
              <div>
                <div style={{color:'#fff', fontWeight:600, fontSize:16}}>{s.name}</div>
                <div style={{color:'#8aa6a4', fontSize:12}}>{s.short} · {s.items.length} позицій</div>
              </div>
              <div style={{fontFamily:'var(--font-display)', color:'#fff', fontWeight:700, fontSize:18}}>від {s.items[0].price} ₴</div>
              <button style={{width:32, height:32, borderRadius:8, background:'rgba(255,255,255,0.05)', border:0, color:'#cfdcdb', cursor:'pointer'}}><Icon name="edit" size={14}/></button>
            </div>
          </div>
        ))}
      </ACard>
    </div>
  );
};

// =================================================================
// ARTICLES
// =================================================================
export const AdminArticles = () => {
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
        <div><h1 style={{fontSize:28, color:'#fff'}}>Статті</h1><p style={{color:'#8aa6a4', fontSize:14}}>Блог клініки</p></div>
        <button className="btn btn-primary btn-sm"><Icon name="plus" size={14} color="#fff"/> Нова стаття</button>
      </div>
      <ACard style={{padding:0, overflow:'hidden'}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr auto auto auto auto', gap:14, padding:'12px 22px', fontSize:11, color:'#8aa6a4', textTransform:'uppercase', fontWeight:600, letterSpacing:'0.04em', borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
          <div>Заголовок</div><div>Тег</div><div>Дата</div><div>Перегляди</div><div></div>
        </div>
        {ARTICLES.map((a,i)=>(
          <div key={a.id} style={{display:'grid', gridTemplateColumns:'1fr auto auto auto auto', gap:14, padding:'14px 22px', alignItems:'center', borderTop: i?'1px solid rgba(255,255,255,0.04)':0}}>
            <div><div style={{color:'#fff', fontWeight:600, fontSize:14}}>{a.title}</div><div style={{color:'#8aa6a4', fontSize:11}}>{a.excerpt}</div></div>
            <div className="chip" style={{background:'rgba(113,86,209,0.2)', color:'#b3a4ed', fontSize:11}}>{a.tag}</div>
            <div style={{color:'#cfdcdb', fontSize:12}}>{a.date}</div>
            <div style={{color:'#fff', fontWeight:600}}>{(i+1)*247}</div>
            <div style={{display:'flex', gap:6}}>
              <button style={{width:30, height:30, borderRadius:8, background:'rgba(255,255,255,0.05)', border:0, color:'#cfdcdb', cursor:'pointer'}}><Icon name="edit" size={14}/></button>
              <button style={{width:30, height:30, borderRadius:8, background:'rgba(255,255,255,0.05)', border:0, color:'#e64561', cursor:'pointer'}}><Icon name="trash" size={14}/></button>
            </div>
          </div>
        ))}
      </ACard>
    </div>
  );
};

// =================================================================
// REPORTS
// =================================================================
export const AdminReports = () => {
  return (
    <div>
      <div style={{marginBottom:24}}><h1 style={{fontSize:28, color:'#fff'}}>Звіти</h1><p style={{color:'#8aa6a4', fontSize:14}}>Фінанси та статистика клініки</p></div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:18}}>
        {[{l:'Дохід місяць',v:'412 800 ₴', d:'+18%'},{l:'Середній чек', v:'1 240 ₴', d:'+4%'},{l:'Записів місяць', v:'332', d:'+22%'},{l:'Утримання', v:'87%', d:'+2%'}].map((s,i)=>(
          <ACard key={i} style={{padding:22}}>
            <div style={{fontSize:12, color:'#8aa6a4', marginBottom:6}}>{s.l}</div>
            <div style={{fontFamily:'var(--font-display)', fontSize:30, fontWeight:700, color:'#fff'}}>{s.v}</div>
            <div style={{fontSize:12, color:'var(--teal-300)', fontWeight:600, marginTop:4}}>{s.d} до минулого місяця</div>
          </ACard>
        ))}
      </div>
      <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:18}}>
        <ACard style={{padding:24}}>
          <div style={{fontSize:14, color:'#fff', fontWeight:600, marginBottom:18}}>Дохід по місяцях</div>
          <svg viewBox="0 0 600 240" style={{width:'100%', height:240}}>
            {[40,80,120,160,200].map(y => <line key={y} x1="30" y1={y} x2="600" y2={y} stroke="rgba(255,255,255,0.04)"/>)}
            <path d="M 30 180 L 90 160 L 150 140 L 210 130 L 270 110 L 330 100 L 390 80 L 450 70 L 510 60 L 570 40" fill="none" stroke="var(--teal-400)" strokeWidth="3"/>
            <path d="M 30 180 L 90 160 L 150 140 L 210 130 L 270 110 L 330 100 L 390 80 L 450 70 L 510 60 L 570 40 L 570 220 L 30 220 Z" fill="url(#g1)" opacity=".25"/>
            <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--teal-400)"/><stop offset="1" stopColor="var(--teal-400)" stopOpacity="0"/></linearGradient></defs>
            {['Січ','Лют','Бер','Кві','Тра','Чер','Лип','Сер','Вер','Жов'].map((m,i)=>(
              <text key={i} x={30+i*60} y="232" fill="#8aa6a4" fontSize="10" textAnchor="middle">{m}</text>
            ))}
          </svg>
        </ACard>
        <ACard style={{padding:24}}>
          <div style={{fontSize:14, color:'#fff', fontWeight:600, marginBottom:18}}>Топ послуг</div>
          {[{n:'Терапія', p:32},{n:'Хірургія', p:24},{n:'Стоматологія', p:18},{n:'УЗД', p:14},{n:'Лабораторія', p:12}].map((s,i)=>(
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
export const AdminRoles = () => {
  const roles = [
    { name:'Адміністратор', n:2, c:'teal', perms:['Усі права','Управління користувачами','Налаштування клініки','Перегляд фінансів']},
    { name:'Лікар', n:8, c:'coral', perms:['Перегляд записів','Картки пацієнтів','Призначення лікування','Створення записів']},
    { name:'Реєстратор', n:3, c:'amber', perms:['Створення записів','Перегляд клієнтів','Дзвінки','Чат із клієнтами']},
  ];
  const allPerms = [
    'Управління користувачами','Управління ролями','Налаштування клініки','Перегляд фінансів','Експорт даних',
    'Перегляд записів','Створення записів','Скасування записів','Картки пацієнтів','Призначення лікування',
    'Управління статтями','Управління послугами','Чат із клієнтами','Перегляд клієнтів',
  ];
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
        <div><h1 style={{fontSize:28, color:'#fff'}}>Ролі та права</h1><p style={{color:'#8aa6a4', fontSize:14}}>Керування доступом</p></div>
        <button className="btn btn-primary btn-sm"><Icon name="plus" size={14} color="#fff"/> Нова роль</button>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:24}}>
        {roles.map((r,i)=>(
          <ACard key={i} style={{padding:22}}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14}}>
              <div style={{display:'flex', alignItems:'center', gap:12}}>
                <div style={{width:40, height:40, borderRadius:10, background:`var(--${r.c}-500)`, opacity:.85, display:'grid', placeItems:'center'}}><Icon name="shield" size={18} color="#fff"/></div>
                <div>
                  <div style={{color:'#fff', fontWeight:600, fontSize:16}}>{r.name}</div>
                  <div style={{color:'#8aa6a4', fontSize:12}}>{r.n} користувачів</div>
                </div>
              </div>
              <button style={{width:30, height:30, borderRadius:8, background:'rgba(255,255,255,0.05)', border:0, color:'#cfdcdb', cursor:'pointer'}}><Icon name="edit" size={14}/></button>
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
        <div style={{display:'grid', gridTemplateColumns:'1.5fr 1fr 1fr 1fr', gap:0, fontSize:12}}>
          <div style={{padding:'10px 14px', color:'#8aa6a4', fontWeight:600, borderBottom:'1px solid rgba(255,255,255,0.06)'}}>Дозвіл</div>
          {roles.map(r=><div key={r.name} style={{padding:'10px 14px', color:'#8aa6a4', fontWeight:600, textAlign:'center', borderBottom:'1px solid rgba(255,255,255,0.06)'}}>{r.name}</div>)}
          {allPerms.map((p,i)=>(
            <React.Fragment key={p}>
              <div style={{padding:'10px 14px', color:'#cfdcdb', borderBottom: i<allPerms.length-1?'1px solid rgba(255,255,255,0.04)':0}}>{p}</div>
              {roles.map((r,ri)=>(
                <div key={r.name} style={{padding:'10px 14px', textAlign:'center', borderBottom: i<allPerms.length-1?'1px solid rgba(255,255,255,0.04)':0}}>
                  {(ri===0 || (ri===1 && i>=5 && i<=11) || (ri===2 && (i>=5 && i<=8 || i===12 || i===13))) ?
                    <Icon name="check" size={14} color="var(--green-500)"/> :
                    <span style={{color:'rgba(255,255,255,0.15)'}}>—</span>}
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
export const AdminSettings = () => {
  return (
    <div>
      <div style={{marginBottom:24}}><h1 style={{fontSize:28, color:'#fff'}}>Налаштування клініки</h1><p style={{color:'#8aa6a4', fontSize:14}}>Загальні налаштування системи</p></div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, maxWidth:920}}>
        <ACard style={{padding:24}}>
          <div style={{fontSize:14, color:'#fff', fontWeight:600, marginBottom:14}}>Інформація про клініку</div>
          <div style={{display:'grid', gap:12}}>
            {[{l:'Назва', v:'PetCare'},{l:'Адреса', v:'вул. Личаківська, 42'},{l:'Телефон', v:'+380 67 123 45 67'},{l:'Email', v:'hello@petcare.ua'}].map((f,i)=>(
              <div key={i}>
                <label style={{fontSize:12, color:'#8aa6a4', marginBottom:6, display:'block'}}>{f.l}</label>
                <input defaultValue={f.v} style={{width:'100%', padding:'10px 12px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, color:'#fff', fontSize:13, outline:'none'}}/>
              </div>
            ))}
          </div>
        </ACard>
        <ACard style={{padding:24}}>
          <div style={{fontSize:14, color:'#fff', fontWeight:600, marginBottom:14}}>Робочий графік</div>
          <div style={{display:'grid', gap:8}}>
            {['Понеділок','Вівторок','Середа','Четвер','П\'ятниця','Субота','Неділя'].map((d,i)=>(
              <div key={d} style={{display:'grid', gridTemplateColumns:'1fr auto auto', gap:10, alignItems:'center', padding:'8px 0'}}>
                <div style={{color:'#fff', fontSize:13}}>{d}</div>
                <input defaultValue={i<5?'09:00':i===5?'10:00':'—'} style={{width:80, padding:'6px 8px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:6, color:'#fff', fontSize:12, textAlign:'center'}}/>
                <input defaultValue={i<5?'19:00':i===5?'18:00':'—'} style={{width:80, padding:'6px 8px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:6, color:'#fff', fontSize:12, textAlign:'center'}}/>
              </div>
            ))}
          </div>
        </ACard>
        <ACard style={{padding:24}}>
          <div style={{fontSize:14, color:'#fff', fontWeight:600, marginBottom:14}}>Сповіщення</div>
          {['SMS клієнтам про запис','Нагадування за день','Email-розсилка статей','Push для лікарів'].map((n,i)=>(
            <div key={i} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderTop: i?'1px solid rgba(255,255,255,0.04)':0}}>
              <div style={{color:'#fff', fontSize:13}}>{n}</div>
              <div style={{width:36, height:20, borderRadius:99, background: i<3?'var(--teal-500)':'rgba(255,255,255,0.1)', position:'relative', cursor:'pointer'}}>
                <div style={{position:'absolute', top:2, left: i<3?18:2, width:16, height:16, borderRadius:'50%', background:'#fff', transition:'left .2s'}}/>
              </div>
            </div>
          ))}
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
      </div>
    </div>
  );
};

