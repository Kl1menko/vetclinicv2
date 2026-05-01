// Public pages — part 2: Booking, About, Contacts, Prices, Articles, Profile
import React, { useState as uS2, useMemo as uM2, useEffect as uE2 } from 'react';
import { Icon, PetIllustration, Avatar, StatusPill, Stars } from './components.jsx';
import { useStore } from './store.jsx';

const ArticleCoverImage = ({ src, alt, height = 180, radius = 0, className = '' }) => {
  const [failed, setFailed] = uS2(false);

  return (
    <div className={className} style={{ height, background: 'var(--teal-100)', overflow: 'hidden', borderRadius: radius }}>
      {!failed && src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <div className="stripe-bg" style={{ height: '100%', display: 'grid', placeItems: 'center', color: 'var(--teal-700)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          обкладинка статті
        </div>
      )}
    </div>
  );
};

// =================================================================
// BOOKING — form + calendar side-by-side
// =================================================================
export const BookingPage = ({ go, showToast }) => {
  const { services, doctors, appointments, addAppointment, currentUser, settings } = useStore();
  const petSpeciesOptions = [
    { v:'cat', l:'Кіт', i:'cat', c:'violet' },
    { v:'dog', l:'Собака', i:'dog', c:'coral' },
    { v:'rabbit', l:'Кролик', i:'rabbit', c:'teal' },
    { v:'bird', l:'Птах', i:null, c:'amber' },
    { v:'ferret', l:'Тхір', i:null, c:'rose' },
    { v:'rodent', l:'Гризун', i:null, c:'green' },
    { v:'reptile', l:'Рептилія', i:null, c:'violet' },
    { v:'other', l:'Інше', i:null, c:'teal' },
  ];
  const petSpeciesLabel = petSpeciesOptions.reduce((acc, item) => ({ ...acc, [item.v]: item.l }), {});
  const [step, setStep] = uS2(1);
  const [form, setForm] = uS2({
    petName:'', petSpecies:'cat', petBreed:'', petAge:'',
    service:'', doctor:'', date:'', time:'',
    name: currentUser?.name || '', phone: currentUser?.phone || '', email: currentUser?.email || '', notes:'',
  });
  const [errors, setErrors] = uS2({});

  // Schedule lookup: settings.schedule is ordered Mon..Sun
  const scheduleByDow = uM2(() => {
    const order = ['Понеділок','Вівторок','Середа','Четвер','Пʼятниця','Субота','Неділя'];
    const map = {};
    (settings?.schedule || []).forEach(row => { map[row.day] = row; });
    return order.map(name => map[name] || { day:name, from:'—', to:'—' });
  }, [settings]);
  const isOpenDow = (jsDow) => {
    // jsDow: 0=Sun..6=Sat → schedule index Mon..Sun
    const idx = jsDow === 0 ? 6 : jsDow - 1;
    const row = scheduleByDow[idx];
    return row && row.from !== '—' && row.to !== '—';
  };

  // Generate days starting from today
  const days = uM2(() => {
    const arr = [];
    const today = new Date(); today.setHours(0,0,0,0);
    for (let i = 0; i < 14; i++) {
      const d = new Date(today); d.setDate(today.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, []);
  const allSlots = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30'];
  const slotsForDate = uM2(() => {
    if (!form.date) return allSlots;
    const dow = new Date(form.date).getDay();
    const idx = dow === 0 ? 6 : dow - 1;
    const row = scheduleByDow[idx];
    if (!row || row.from === '—' || row.to === '—') return [];
    return allSlots.filter(s => s >= row.from && s <= row.to);
  }, [form.date, scheduleByDow]);
  const busy = appointments.filter(a => a.date === form.date).map(a => a.time);

  const update = (k, v) => setForm(f => ({...f, [k]: v}));
  const next = () => {
    const e = {};
    if (step === 1) {
      if (!form.petName) e.petName = 'Введіть кличку';
      if (!form.petAge) e.petAge = 'Вкажіть вік';
    }
    if (step === 2) {
      if (!form.service) e.service = 'Оберіть послугу';
    }
    if (step === 3) {
      if (!form.date) e.date = 'Оберіть дату';
      if (!form.time) e.time = 'Оберіть час';
    }
    setErrors(e);
    if (Object.keys(e).length === 0) setStep(s => s+1);
  };
  const submit = () => {
    const e = {};
    if (!form.name) e.name = 'Введіть ім\'я';
    if (!/^\+?[\d\s\-()]{10,}$/.test(form.phone)) e.phone = 'Невірний номер';
    setErrors(e);
    if (Object.keys(e).length === 0) {
      const result = addAppointment({
        ...form,
        name: form.name || currentUser?.name,
        petType: petSpeciesLabel[form.petSpecies] || form.petSpecies,
      });
      if (!result.ok) {
        showToast(result.error);
        return;
      }
      setStep(5);
      showToast('Запис створено!');
    }
  };

  const monthNames = ['Січ','Лют','Бер','Квіт','Трав','Чер','Лип','Сер','Вер','Жов','Лис','Гру'];
  const weekDays = ['Пн','Вт','Ср','Чт','Пт','Сб','Нд'];

  return (
    <div data-screen-label="Booking">
      <section style={{padding:'48px 0 24px', background:'var(--teal-50)'}}>
        <div className="container">
          <div className="chip chip-teal" style={{marginBottom:14}}>Запис на прийом</div>
          <h1 style={{fontSize:48, letterSpacing:'-0.03em', maxWidth:680, marginBottom:14}}>Оберіть зручний час</h1>
          <p style={{fontSize:17, color:'var(--ink-600)', maxWidth:560}}>Заповніть форму — підтвердимо запис протягом 15 хвилин.</p>
        </div>
      </section>

      <section style={{padding:'40px 0 96px'}}>
        <div className="container">
          {/* Stepper */}
          <div className="booking-stepper" style={{display:'flex', alignItems:'center', gap:12, marginBottom:28, maxWidth:720}}>
            {['Тварина','Послуга','Час','Контакти','Готово'].map((s, i) => {
              const n = i + 1;
              const done = n < step, active = n === step;
              return (
                <React.Fragment key={i}>
                  <div className="booking-stepper-item" data-active={active ? '1' : '0'} style={{display:'flex', alignItems:'center', gap:8, flex:'0 0 auto'}}>
                    <div style={{width:28, height:28, borderRadius:'50%', display:'grid', placeItems:'center', fontSize:13, fontWeight:700, flexShrink:0,
                      background: done?'var(--teal-600)':active?'var(--ink-900)':'var(--ink-100)',
                      color: done||active?'#fff':'var(--ink-500)'}}>
                      {done ? <Icon name="check" size={14} color="#fff"/> : n}
                    </div>
                    <div className="booking-stepper-label" style={{fontSize:13, fontWeight: active?700:500, color: done||active?'var(--ink-900)':'var(--ink-500)'}}>{s}</div>
                  </div>
                  {i < 4 && <div className="booking-stepper-bar" style={{flex:1, height:2, background: done?'var(--teal-600)':'var(--ink-100)', borderRadius:2}}/>}
                </React.Fragment>
              );
            })}
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:24, alignItems:'flex-start'}}>
            <div className="card" style={{padding:32}}>
              {step === 1 && (
                <div className="fade-up">
                  <h2 style={{fontSize:24, marginBottom:6}}>Розкажіть про вашу тварину</h2>
                  <p style={{color:'var(--ink-500)', marginBottom:24, fontSize:14}}>Це допоможе підготуватися до прийому.</p>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14}}>
                    <div>
                      <label className="label">Кличка</label>
                      <input className="input" value={form.petName} onChange={e=>update('petName', e.target.value)} placeholder="Барсік"/>
                      {errors.petName && <div className="field-error">{errors.petName}</div>}
                    </div>
                    <div>
                      <label className="label">Вік</label>
                      <input className="input" value={form.petAge} onChange={e=>update('petAge', e.target.value)} placeholder="3 роки"/>
                      {errors.petAge && <div className="field-error">{errors.petAge}</div>}
                    </div>
                  </div>
                  <label className="label">Вид</label>
                  <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:14}}>
                    {petSpeciesOptions.map(p => (
                      <button key={p.v} onClick={()=>update('petSpecies', p.v)}
                        style={{
                          padding:14,
                          borderRadius:14,
                          border: form.petSpecies===p.v ? `2px solid var(--${p.c}-500)` : '1.5px solid var(--ink-200)',
                          background: form.petSpecies===p.v ? `var(--${p.c}-100)` : 'var(--paper)',
                          cursor:'pointer',
                          display:'flex',
                          flexDirection:'column',
                          alignItems:'center',
                          gap:6,
                        }}>
                        {p.i
                          ? <PetIllustration kind={p.i} color={p.c} size={48}/>
                          : <div style={{width:48, height:48, borderRadius:12, background:`var(--${p.c}-100)`, display:'grid', placeItems:'center'}}><Icon name="paw" size={24} color={`var(--${p.c}-700)`}/></div>}
                        <div style={{fontSize:13, fontWeight:600}}>{p.l}</div>
                      </button>
                    ))}
                  </div>
                  <label className="label">Порода (за бажанням)</label>
                  <input className="input" value={form.petBreed} onChange={e=>update('petBreed', e.target.value)} placeholder="Британський короткошерстий"/>
                </div>
              )}

              {step === 2 && (
                <div className="fade-up">
                  <h2 style={{fontSize:24, marginBottom:6}}>Оберіть послугу</h2>
                  <p style={{color:'var(--ink-500)', marginBottom:20, fontSize:14}}>Можна обрати лікаря або довірити вибір реєстратору.</p>
                  <div style={{display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10, marginBottom:18}}>
                    {services.map(s => (
                      <button key={s.id} onClick={()=>update('service', s.id)}
                        style={{padding:14, borderRadius:14, border: form.service===s.id?'2px solid var(--teal-500)':'1.5px solid var(--ink-200)', background: form.service===s.id?'var(--teal-50)':'var(--paper)', cursor:'pointer', display:'flex', alignItems:'center', gap:12, textAlign:'left'}}>
                        <div style={{width:40, height:40, borderRadius:10, background:`var(--${s.color}-100)`, color:`var(--${s.color}-${s.color==='amber'||s.color==='green'?'500':'600'})`, display:'grid', placeItems:'center'}}>
                          <Icon name={s.icon} size={18}/>
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:600, fontSize:14}}>{s.name}</div>
                          <div style={{fontSize:12, color:'var(--ink-500)'}}>від {s.items[0].price} ₴</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  {errors.service && <div className="field-error" style={{marginBottom:14}}>{errors.service}</div>}
                  <label className="label">Лікар (за бажанням)</label>
                  <select className="input" value={form.doctor} onChange={e=>update('doctor', e.target.value)}>
                    <option value="">Будь-який доступний</option>
                    {doctors.filter(d => !form.service || d.services.includes(form.service)).map(d => (
                      <option key={d.id} value={d.id}>{d.name} — {d.role}</option>
                    ))}
                  </select>
                </div>
              )}

              {step === 3 && (
                <div className="fade-up">
                  <h2 style={{fontSize:24, marginBottom:6}}>Дата і час</h2>
                  <p style={{color:'var(--ink-500)', marginBottom:20, fontSize:14}}>Оберіть зручний для вас слот.</p>
                  <label className="label">Дата</label>
                  <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:8, marginBottom:18}}>
                    {days.map((d,i)=>{
                      const key = d.toISOString().slice(0,10);
                      const dn = d.getDate();
                      const wd = weekDays[(d.getDay()+6)%7];
                      const closed = !isOpenDow(d.getDay());
                      const sel = form.date === key;
                      return (
                        <button key={i} disabled={closed} onClick={()=>update('date', key)}
                          style={{padding:'10px 6px', borderRadius:12, border: sel?'2px solid var(--teal-500)':'1.5px solid var(--ink-100)',
                            background: sel?'var(--teal-50)':closed?'var(--ink-50)':'var(--paper)', cursor: closed?'not-allowed':'pointer',
                            opacity: closed?.4:1, display:'flex', flexDirection:'column', alignItems:'center'}}>
                          <div style={{fontSize:11, color:'var(--ink-500)', fontWeight:600, textTransform:'uppercase'}}>{wd}</div>
                          <div style={{fontFamily:'var(--font-display)', fontSize:18, fontWeight:700}}>{dn}</div>
                          <div style={{fontSize:10, color:'var(--ink-500)'}}>{monthNames[d.getMonth()]}</div>
                        </button>
                      );
                    })}
                  </div>
                  {errors.date && <div className="field-error" style={{marginBottom:14}}>{errors.date}</div>}
                  <label className="label">Час</label>
                  {form.date && slotsForDate.length === 0 && <div className="field-error" style={{marginBottom:10}}>Цього дня клініка не працює.</div>}
                  <div style={{display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:8}}>
                    {slotsForDate.map(t => {
                      const isBusy = busy.includes(t);
                      const sel = form.time === t;
                      return (
                        <button key={t} disabled={isBusy} onClick={()=>update('time', t)}
                          style={{padding:'10px 4px', borderRadius:10, border: sel?'2px solid var(--teal-500)':'1.5px solid var(--ink-100)',
                            background: sel?'var(--teal-50)':isBusy?'var(--ink-50)':'var(--paper)',
                            color: isBusy?'var(--ink-300)':'var(--ink-900)',
                            textDecoration: isBusy?'line-through':'none',
                            cursor: isBusy?'not-allowed':'pointer', fontSize:13, fontWeight:600}}>
                          {t}
                        </button>
                      );
                    })}
                  </div>
                  {errors.time && <div className="field-error" style={{marginTop:10}}>{errors.time}</div>}
                </div>
              )}

              {step === 4 && (
                <div className="fade-up">
                  <h2 style={{fontSize:24, marginBottom:6}}>Ваші контакти</h2>
                  <p style={{color:'var(--ink-500)', marginBottom:20, fontSize:14}}>Куди надіслати підтвердження.</p>
                  <div style={{display:'grid', gap:14}}>
                    <div>
                      <label className="label">Ім'я</label>
                      <input className="input" autoComplete="name" value={form.name} onChange={e=>update('name', e.target.value)} placeholder="Ірина Ковальчук"/>
                      {errors.name && <div className="field-error">{errors.name}</div>}
                    </div>
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
                      <div>
                        <label className="label">Телефон</label>
                        <input className="input" type="tel" autoComplete="tel" inputMode="tel" value={form.phone} onChange={e=>update('phone', e.target.value)} placeholder="+380 67 ..."/>
                        {errors.phone && <div className="field-error">{errors.phone}</div>}
                      </div>
                      <div>
                        <label className="label">Email (за бажанням)</label>
                        <input className="input" type="email" autoComplete="email" value={form.email} onChange={e=>update('email', e.target.value)} placeholder="email@..."/>
                      </div>
                    </div>
                    <div>
                      <label className="label">Опис проблеми (за бажанням)</label>
                      <textarea className="input" rows="3" value={form.notes} onChange={e=>update('notes', e.target.value)} placeholder="Симптоми, що турбує..."/>
                    </div>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div style={{textAlign:'center', padding:'24px 0'}} className="pop">
                  <div style={{width:72, height:72, borderRadius:'50%', background:'var(--green-100)', display:'grid', placeItems:'center', margin:'0 auto 18px'}}>
                    <Icon name="check" size={36} color="var(--green-500)"/>
                  </div>
                  <h2 style={{fontSize:28, marginBottom:8}}>Запис створено!</h2>
                  <p style={{color:'var(--ink-500)', marginBottom:20, maxWidth:380, margin:'0 auto 24px'}}>Ми надіслали підтвердження на ваш телефон. Реєстратор зателефонує протягом 15 хвилин.</p>
                  <div style={{padding:18, background:'var(--ink-25)', borderRadius:14, marginBottom:24, textAlign:'left', maxWidth:380, margin:'0 auto 24px'}}>
                    <div style={{fontSize:11, color:'var(--ink-500)', fontWeight:600, textTransform:'uppercase', marginBottom:8}}>Деталі запису</div>
                    <div style={{display:'flex', justifyContent:'space-between', padding:'4px 0', fontSize:14}}><span style={{color:'var(--ink-500)'}}>Тварина</span><span style={{fontWeight:600}}>{form.petName}</span></div>
                    <div style={{display:'flex', justifyContent:'space-between', padding:'4px 0', fontSize:14}}><span style={{color:'var(--ink-500)'}}>Послуга</span><span style={{fontWeight:600}}>{services.find(s=>s.id===form.service)?.name}</span></div>
                    <div style={{display:'flex', justifyContent:'space-between', padding:'4px 0', fontSize:14}}><span style={{color:'var(--ink-500)'}}>Дата і час</span><span style={{fontWeight:600}}>{form.date} · {form.time}</span></div>
                  </div>
                  <button className="btn btn-primary" onClick={()=>go('home')}>На головну</button>
                </div>
              )}

              {step < 5 && (
                <div style={{display:'flex', justifyContent:'space-between', marginTop:28, paddingTop:24, borderTop:'1px solid var(--ink-100)'}}>
                  <button className="btn btn-ghost" onClick={()=>setStep(s => Math.max(1, s-1))} disabled={step===1} style={{visibility: step===1?'hidden':'visible'}}><Icon name="arrowLeft" size={14}/> Назад</button>
                  {step < 4 ? (
                    <button className="btn btn-primary" onClick={next}>Далі <Icon name="arrowRight" size={14} color="#fff"/></button>
                  ) : (
                    <button className="btn btn-primary" onClick={submit}>Підтвердити запис</button>
                  )}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="card" style={{padding:24, position:'sticky', top:96}}>
              <div style={{fontSize:11, color:'var(--ink-500)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:14}}>Ваше замовлення</div>
              <div style={{display:'grid', gap:14}}>
                <div style={{display:'flex', alignItems:'center', gap:12}}>
                  <div style={{width:40, height:40, borderRadius:10, background:'var(--teal-100)', color:'var(--teal-700)', display:'grid', placeItems:'center'}}><Icon name="paw" size={18}/></div>
                  <div>
                    <div style={{fontSize:11, color:'var(--ink-500)'}}>Тварина</div>
                    <div style={{fontWeight:600, fontSize:14}}>{form.petName || '—'}{form.petAge && `, ${form.petAge}`}</div>
                  </div>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:12}}>
                  <div style={{width:40, height:40, borderRadius:10, background:'var(--coral-100)', color:'var(--coral-600)', display:'grid', placeItems:'center'}}><Icon name="heart" size={18}/></div>
                  <div>
                    <div style={{fontSize:11, color:'var(--ink-500)'}}>Послуга</div>
                    <div style={{fontWeight:600, fontSize:14}}>{services.find(s=>s.id===form.service)?.name || '—'}</div>
                  </div>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:12}}>
                  <div style={{width:40, height:40, borderRadius:10, background:'var(--violet-100)', color:'var(--violet-500)', display:'grid', placeItems:'center'}}><Icon name="user" size={18}/></div>
                  <div>
                    <div style={{fontSize:11, color:'var(--ink-500)'}}>Лікар</div>
                    <div style={{fontWeight:600, fontSize:14}}>{doctors.find(d=>d.id===form.doctor)?.name || 'Будь-який'}</div>
                  </div>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:12}}>
                  <div style={{width:40, height:40, borderRadius:10, background:'var(--amber-100)', color:'var(--amber-400)', display:'grid', placeItems:'center'}}><Icon name="calendar" size={18}/></div>
                  <div>
                    <div style={{fontSize:11, color:'var(--ink-500)'}}>Час</div>
                    <div style={{fontWeight:600, fontSize:14}}>{form.date && form.time ? `${form.date} · ${form.time}` : '—'}</div>
                  </div>
                </div>
              </div>
              {form.service && (
                <div style={{marginTop:18, paddingTop:18, borderTop:'1px solid var(--ink-100)'}}>
                  <div style={{display:'flex', justifyContent:'space-between', fontSize:13, color:'var(--ink-500)', marginBottom:4}}><span>Орієнтовна вартість</span></div>
                  <div style={{fontFamily:'var(--font-display)', fontSize:24, fontWeight:700}}>від {services.find(s=>s.id===form.service)?.items[0].price} ₴</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// =================================================================
// ABOUT
// =================================================================
export const AboutPage = ({ go, openBooking }) => {
  const { doctors } = useStore();
  return (
    <div data-screen-label="About">
      <section style={{padding:'72px 0 48px', background:'var(--teal-50)'}}>
        <div className="container">
          <div className="chip chip-teal" style={{marginBottom:14}}>Про клініку</div>
          <h1 style={{fontSize:60, letterSpacing:'-0.035em', maxWidth:760, marginBottom:18}}>Команда, для якої тварини — це не «пацієнти», а близькі</h1>
          <p style={{fontSize:18, color:'var(--ink-600)', maxWidth:620}}>Ми відкрилися у 2014 році як невелика клініка на чотирьох лікарів. Сьогодні нас 12, і ми приймаємо понад 200 тварин на тиждень.</p>
        </div>
      </section>

      <section style={{padding:'56px 0'}}>
        <div className="container" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'center'}}>
          <div className="stripe-bg" style={{height:380, borderRadius:24, background:'var(--teal-100)', display:'grid', placeItems:'center', color:'var(--teal-700)', fontFamily:'var(--font-mono)', fontSize:13}}>
            фото клініки · інтер'єр прийомної
          </div>
          <div>
            <h2 style={{fontSize:36, marginBottom:18}}>Чому ми робимо це</h2>
            <p style={{fontSize:16, color:'var(--ink-700)', marginBottom:14, lineHeight:1.6}}>Більшість власників приходить до ветеринара тоді, коли вже є проблема. Ми хочемо, щоб візит до лікаря став рутиною — як перевірка зубів чи стрижка.</p>
            <p style={{fontSize:16, color:'var(--ink-700)', marginBottom:24, lineHeight:1.6}}>Тому ми створили зрозумілий онлайн-кабінет, прозорі ціни і команду, де лікарі мають час пояснити кожне призначення.</p>
            <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:18}}>
              <div><div style={{fontFamily:'var(--font-display)', fontSize:32, fontWeight:700, color:'var(--teal-600)'}}>12</div><div style={{fontSize:13, color:'var(--ink-500)'}}>років досвіду</div></div>
              <div><div style={{fontFamily:'var(--font-display)', fontSize:32, fontWeight:700, color:'var(--teal-600)'}}>8000+</div><div style={{fontSize:13, color:'var(--ink-500)'}}>тварин у системі</div></div>
              <div><div style={{fontFamily:'var(--font-display)', fontSize:32, fontWeight:700, color:'var(--teal-600)'}}>4.9 ★</div><div style={{fontSize:13, color:'var(--ink-500)'}}>оцінка клієнтів</div></div>
            </div>
          </div>
        </div>
      </section>

      <section style={{padding:'72px 0', background:'var(--paper)'}}>
        <div className="container">
          <div className="chip chip-coral" style={{marginBottom:14}}>Команда</div>
          <h2 style={{fontSize:42, marginBottom:36}}>Усі лікарі</h2>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16}}>
            {doctors.map(d=>(
              <div key={d.id} className="card" style={{padding:0, overflow:'hidden', border:'1px solid var(--ink-100)', boxShadow:'none'}}>
                <div style={{height:200, background:'var(--teal-100)', overflow:'hidden'}}>
                  {d.photo ? (
                    <img src={d.photo} alt={d.name} loading="lazy" style={{width:'100%', height:'100%', objectFit:'cover', display:'block'}}/>
                  ) : (
                    <div className="stripe-bg" style={{height:'100%', display:'grid', placeItems:'center'}}><Avatar name={d.name} size={96}/></div>
                  )}
                </div>
                <div style={{padding:22}}>
                  <div style={{fontFamily:'var(--font-display)', fontWeight:600, fontSize:20, marginBottom:4}}>{d.name}</div>
                  <div style={{fontSize:13, color:'var(--teal-700)', fontWeight:600, marginBottom:10}}>{d.role}</div>
                  <p style={{fontSize:14, color:'var(--ink-600)', marginBottom:14}}>{d.bio}</p>
                  <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                    <div className="chip" style={{fontSize:11}}>{d.exp} років</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{padding:'72px 0'}}>
        <div className="container">
          <h2 style={{fontSize:36, marginBottom:32, maxWidth:600}}>Наші принципи</h2>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16}}>
            {[
              { t:'Без зайвих процедур', d:'Призначаємо тільки те, що дійсно потрібно. Якщо є альтернатива — пропонуємо вибір.' },
              { t:'Прозорі ціни', d:'Кошторис погоджуємо до прийому. Жодних несподіванок у касі.' },
              { t:'Час на розмову', d:'Прийом — не 10 хвилин. Питайте все, що турбує. Ми поряд.' },
            ].map((p,i)=>(
              <div key={i} className="card" style={{padding:28}}>
                <div style={{fontFamily:'var(--font-mono)', fontSize:13, color:'var(--coral-600)', marginBottom:14}}>0{i+1}</div>
                <h3 style={{fontSize:22, marginBottom:10}}>{p.t}</h3>
                <p style={{fontSize:15, color:'var(--ink-600)'}}>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// =================================================================
// CONTACTS
// =================================================================
export const ContactsPage = ({ go, openBooking, showToast }) => {
  const { addMessage } = useStore();
  const [form, setForm] = uS2({name:'', phone:'', message:''});
  const [errors, setErrors] = uS2({});
  const submit = () => {
    const e = {};
    if (!form.name) e.name = 'Введіть ім\'я';
    if (!/^\+?[\d\s\-()]{10,}$/.test(form.phone)) e.phone = 'Невірний номер';
    if (!form.message) e.message = 'Введіть повідомлення';
    setErrors(e);
    if (Object.keys(e).length === 0) {
      addMessage(form);
      showToast('Дякуємо! Ми зв\'яжемося найближчим часом.');
      setForm({name:'', phone:'', message:''});
    }
  };
  return (
    <div data-screen-label="Contacts">
      <section style={{padding:'56px 0 32px', background:'var(--teal-50)'}}>
        <div className="container">
          <div className="chip chip-teal" style={{marginBottom:14}}>Контакти</div>
          <h1 style={{fontSize:54, letterSpacing:'-0.03em', marginBottom:14}}>Як нас знайти</h1>
          <p style={{fontSize:17, color:'var(--ink-600)', maxWidth:560}}>Ми на вулиці Околична, 10 у Львові. Безкоштовна парковка для клієнтів.</p>
        </div>
      </section>

      <section style={{padding:'48px 0 96px'}}>
        <div className="container" style={{display:'grid', gridTemplateColumns:'1fr 1.2fr', gap:32}}>
          <div>
            <div className="card" style={{padding:28, marginBottom:16}}>
              <div style={{display:'grid', gap:18}}>
                <div style={{display:'flex', gap:14}}>
                  <div style={{width:44, height:44, borderRadius:12, background:'var(--teal-100)', color:'var(--teal-600)', display:'grid', placeItems:'center', flexShrink:0}}><Icon name="pin"/></div>
                  <div><div style={{fontSize:12, color:'var(--ink-500)', fontWeight:600, textTransform:'uppercase', marginBottom:4}}>Адреса</div><div style={{fontWeight:600}}>вул. Околична, 10</div><div style={{fontSize:13, color:'var(--ink-500)'}}>Львів, 79000</div></div>
                </div>
                <div style={{display:'flex', gap:14}}>
                  <div style={{width:44, height:44, borderRadius:12, background:'var(--coral-100)', color:'var(--coral-600)', display:'grid', placeItems:'center', flexShrink:0}}><Icon name="phone"/></div>
                  <div><div style={{fontSize:12, color:'var(--ink-500)', fontWeight:600, textTransform:'uppercase', marginBottom:4}}>Телефон</div><a href="tel:+380636798977" style={{fontWeight:600, color:'inherit'}}>+380 63 679 89 77</a><div style={{fontSize:13, color:'var(--ink-500)'}}>Реєстратура · Пн–Пт</div></div>
                </div>
                <div style={{display:'flex', gap:14}}>
                  <div style={{width:44, height:44, borderRadius:12, background:'var(--violet-100)', color:'var(--violet-500)', display:'grid', placeItems:'center', flexShrink:0}}><Icon name="mail"/></div>
                  <div><div style={{fontSize:12, color:'var(--ink-500)', fontWeight:600, textTransform:'uppercase', marginBottom:4}}>Email</div><a href="mailto:hello@ultravet.ua" style={{fontWeight:600, color:'inherit'}}>hello@ultravet.ua</a></div>
                </div>
                <div style={{display:'flex', gap:14}}>
                  <div style={{width:44, height:44, borderRadius:12, background:'var(--amber-100)', color:'var(--amber-400)', display:'grid', placeItems:'center', flexShrink:0}}><Icon name="clock"/></div>
                  <div><div style={{fontSize:12, color:'var(--ink-500)', fontWeight:600, textTransform:'uppercase', marginBottom:4}}>Графік</div><div style={{fontWeight:600}}>Пн–Пт 09:00–18:00</div><div style={{fontSize:13, color:'var(--ink-500)'}}>Сб–Нд за попереднім записом</div></div>
                </div>
              </div>
            </div>
            <div className="card" style={{padding:28}}>
              <h3 style={{fontSize:20, marginBottom:14}}>Зворотний зв'язок</h3>
              <div style={{display:'grid', gap:12}}>
                <div>
                  <input className="input" autoComplete="name" placeholder="Ваше ім'я" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
                  {errors.name && <div className="field-error">{errors.name}</div>}
                </div>
                <div>
                  <input className="input" type="tel" autoComplete="tel" inputMode="tel" placeholder="Телефон" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})}/>
                  {errors.phone && <div className="field-error">{errors.phone}</div>}
                </div>
                <div>
                  <textarea className="input" rows="3" placeholder="Повідомлення" value={form.message} onChange={e=>setForm({...form, message:e.target.value})}/>
                  {errors.message && <div className="field-error">{errors.message}</div>}
                </div>
                <button className="btn btn-primary" onClick={submit}>Надіслати</button>
              </div>
            </div>
          </div>
          <div className="card stripe-bg contacts-map" style={{minHeight:560, background:'linear-gradient(135deg, var(--teal-100), var(--teal-200))', display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:0, position:'relative', overflow:'hidden'}}>
            {/* Mock map */}
            <svg viewBox="0 0 600 700" style={{position:'absolute', inset:0, width:'100%', height:'100%'}}>
              <rect width="600" height="700" fill="var(--teal-50)"/>
              {[80,180,280,380,480].map(x=><line key={'v'+x} x1={x} y1="0" x2={x} y2="700" stroke="var(--teal-200)" strokeWidth="1"/>)}
              {[80,180,280,380,480,580].map(y=><line key={'h'+y} x1="0" y1={y} x2="600" y2={y} stroke="var(--teal-200)" strokeWidth="1"/>)}
              <path d="M 0 280 Q 200 250 400 320 T 600 380" fill="none" stroke="var(--teal-300)" strokeWidth="14" strokeLinecap="round"/>
              <path d="M 100 0 Q 130 200 250 380 T 380 700" fill="none" stroke="var(--teal-300)" strokeWidth="10" strokeLinecap="round"/>
              <rect x="120" y="120" width="80" height="60" rx="6" fill="var(--teal-200)"/>
              <rect x="320" y="180" width="100" height="80" rx="6" fill="var(--teal-200)"/>
              <rect x="200" y="450" width="120" height="80" rx="6" fill="var(--teal-200)"/>
              <rect x="400" y="500" width="80" height="60" rx="6" fill="var(--teal-200)"/>
              {/* Pin */}
              <g transform="translate(280, 320)">
                <circle r="36" fill="var(--coral-500)" opacity=".18"/>
                <circle r="22" fill="var(--coral-500)" opacity=".3"/>
                <circle r="12" fill="var(--coral-500)"/>
                <circle r="5" fill="#fff"/>
              </g>
            </svg>
            <div style={{position:'relative', margin:24, padding:18, background:'var(--paper)', borderRadius:16, boxShadow:'var(--shadow)'}}>
              <div style={{display:'flex', alignItems:'center', gap:12}}>
                <div style={{width:40, height:40, borderRadius:10, background:'var(--coral-100)', color:'var(--coral-600)', display:'grid', placeItems:'center'}}><Icon name="pin" size={18}/></div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600}}>UltraVet · вул. Околична, 10</div>
                  <div style={{fontSize:13, color:'var(--ink-500)'}}>3 хв пішки від зупинки</div>
                </div>
                <a className="btn btn-sm btn-primary" href="https://maps.google.com/?q=вул.+Околична+10,+Львів" target="_blank" rel="noopener noreferrer">Маршрут</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// =================================================================
// PRICES
// =================================================================
export const PricesPage = ({ go, openBooking }) => {
  const { services } = useStore();
  const [search, setSearch] = uS2('');
  const [active, setActive] = uS2('all');
  const filtered = services.filter(s => active === 'all' || s.id === active);

  return (
    <div data-screen-label="Prices">
      <section style={{padding:'56px 0 32px', background:'var(--teal-50)'}}>
        <div className="container">
          <div className="chip chip-teal" style={{marginBottom:14}}>Прайс</div>
          <h1 style={{fontSize:54, letterSpacing:'-0.03em', marginBottom:14}}>Ціни на послуги</h1>
          <p style={{fontSize:17, color:'var(--ink-600)', maxWidth:560}}>Кошторис погоджуємо до прийому — без сюрпризів у касі.</p>
        </div>
      </section>

      <section style={{padding:'40px 0 96px'}}>
        <div className="container" style={{display:'grid', gridTemplateColumns:'240px 1fr', gap:24, alignItems:'flex-start'}}>
          <div className="card prices-sidebar" style={{padding:14, position:'sticky', top:96}}>
            <div style={{position:'relative', marginBottom:10}}>
              <div style={{position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--ink-400)'}}><Icon name="search" size={14}/></div>
              <input className="input" style={{paddingLeft:34, fontSize:13}} placeholder="Пошук" value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <button onClick={()=>setActive('all')} style={{display:'flex', justifyContent:'space-between', width:'100%', padding:'10px 12px', borderRadius:10, border:0, background: active==='all'?'var(--teal-50)':'transparent', color: active==='all'?'var(--teal-700)':'var(--ink-700)', fontWeight:600, cursor:'pointer', fontSize:14}}>
              Усі категорії <span style={{fontSize:12, color:'var(--ink-500)'}}>{services.reduce((a,s)=>a+s.items.length,0)}</span>
            </button>
            {services.map(s => (
              <button key={s.id} onClick={()=>setActive(s.id)} style={{display:'flex', justifyContent:'space-between', alignItems:'center', width:'100%', padding:'10px 12px', borderRadius:10, border:0, background: active===s.id?'var(--teal-50)':'transparent', color: active===s.id?'var(--teal-700)':'var(--ink-700)', fontWeight: active===s.id?600:500, cursor:'pointer', fontSize:14, textAlign:'left'}}>
                <span>{s.name}</span><span style={{fontSize:12, color:'var(--ink-500)'}}>{s.items.length}</span>
              </button>
            ))}
          </div>
          <div style={{display:'grid', gap:16}}>
            {filtered.map(s => {
              const items = s.items.filter(it => !search || it.name.toLowerCase().includes(search.toLowerCase()));
              if (items.length === 0) return null;
              return (
                <div key={s.id} className="card" style={{padding:0, overflow:'hidden'}}>
                  <div style={{padding:'18px 24px', borderBottom:'1px solid var(--ink-100)', display:'flex', alignItems:'center', gap:12}}>
                    <div style={{width:36, height:36, borderRadius:10, background:`var(--${s.color}-100)`, color:`var(--${s.color}-${s.color==='amber'||s.color==='green'?'500':'600'})`, display:'grid', placeItems:'center'}}>
                      <Icon name={s.icon} size={18}/>
                    </div>
                    <div style={{fontFamily:'var(--font-display)', fontSize:20, fontWeight:600}}>{s.name}</div>
                  </div>
                  {items.map((it, i)=>(
                    <div key={i} style={{display:'grid', gridTemplateColumns:'1fr auto auto', gap:18, alignItems:'center', padding:'14px 24px', borderTop: i?'1px solid var(--ink-100)':0}}>
                      <div style={{fontSize:14}}>{it.name}</div>
                      <div style={{fontSize:13, color:'var(--ink-500)', display:'flex', alignItems:'center', gap:6}}>
                        <Icon name="clock" size={13}/> {it.duration} хв
                      </div>
                      <div style={{fontFamily:'var(--font-display)', fontWeight:700, fontSize:16, minWidth:90, textAlign:'right'}}>{it.price} ₴</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

// =================================================================
// ARTICLES + ARTICLE
// =================================================================
export const ArticlesPage = ({ go }) => {
  const { articles } = useStore();
  const [tag, setTag] = uS2('Усі');
  const tags = ['Усі', ...new Set(articles.map(a=>a.tag))];
  const filtered = tag === 'Усі' ? articles : articles.filter(a => a.tag === tag);
  return (
    <div data-screen-label="Articles">
      <section style={{padding:'56px 0 28px', background:'var(--teal-50)'}}>
        <div className="container">
          <div className="chip chip-violet" style={{marginBottom:14}}>Журнал</div>
          <h1 style={{fontSize:54, letterSpacing:'-0.03em', marginBottom:14}}>Статті лікарів</h1>
          <p style={{fontSize:17, color:'var(--ink-600)', maxWidth:560}}>Поради, відповіді на типові питання, інструкції від нашої команди.</p>
        </div>
      </section>
      <section style={{padding:'24px 0', borderBottom:'1px solid var(--ink-100)', position:'sticky', top:'var(--header-h)', background:'var(--bg)', zIndex:10}}>
        <div className="container" style={{display:'flex', gap:8, overflowX:'auto'}}>
          {tags.map(t => (
            <button key={t} onClick={()=>setTag(t)} style={{padding:'8px 16px', borderRadius:999, border:0, background: tag===t?'var(--ink-900)':'var(--ink-100)', color: tag===t?'#fff':'var(--ink-700)', fontSize:13, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap'}}>{t}</button>
          ))}
        </div>
      </section>
      <section style={{padding:'40px 0 96px'}}>
        <div className="container">
          <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:18}}>
            {filtered.map((a,i)=>(
              <button key={a.id} onClick={()=>go('article',{id:a.id})} className="card" style={{textAlign:'left', border:0, cursor:'pointer', overflow:'hidden', padding:0}}>
                <ArticleCoverImage className="article-cover article-cover-list" src={a.cover} alt={a.title} height={180}/>
                <div style={{padding:22}}>
                  <div style={{display:'flex', gap:10, fontSize:12, color:'var(--ink-500)', marginBottom:10}}>
                    <span style={{fontWeight:600, color:'var(--teal-700)'}}>{a.tag}</span><span>·</span><span>{a.read} хв</span><span>·</span><span>{a.date}</span>
                  </div>
                  <div style={{fontFamily:'var(--font-display)', fontSize:20, fontWeight:600, marginBottom:10, lineHeight:1.2}}>{a.title}</div>
                  <div style={{fontSize:14, color:'var(--ink-500)'}}>{a.excerpt}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export const ArticlePage = ({ go, params }) => {
  const { articles } = useStore();
  const a = articles.find(x => x.id === params.id) || articles[0];
  return (
    <div data-screen-label="Article" style={{paddingBottom:96}}>
      <div className="container" style={{padding:'24px 24px 0', maxWidth:760}}>
        <button onClick={()=>go('articles')} style={{border:0, background:'none', color:'var(--ink-500)', cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', gap:6}}><Icon name="chevLeft" size={14}/> Усі статті</button>
      </div>
      <article className="container" style={{maxWidth:760, padding:'32px 24px'}}>
        <div className="chip chip-violet" style={{marginBottom:18}}>{a.tag}</div>
        <h1 style={{fontSize:48, letterSpacing:'-0.03em', marginBottom:18}}>{a.title}</h1>
        <div style={{display:'flex', gap:14, alignItems:'center', marginBottom:32, color:'var(--ink-500)', fontSize:14}}>
          <Avatar name="Марта Коваль" size={36}/>
          <div>Марта Коваль · {a.date}</div>
          <span>·</span><span>{a.read} хв читати</span>
        </div>
        <div style={{marginBottom:32}}>
          <ArticleCoverImage className="article-cover article-cover-detail" src={a.cover} alt={a.title} height={320} radius={20}/>
        </div>
        <p style={{fontSize:18, color:'var(--ink-700)', marginBottom:18, lineHeight:1.65}}>{a.excerpt} У цій короткій статті ми розглядаємо підхід, який працює для 80% власників.</p>
        <h2 style={{fontSize:28, margin:'28px 0 14px'}}>Що варто знати</h2>
        <p style={{fontSize:17, color:'var(--ink-700)', marginBottom:14, lineHeight:1.65}}>Перед візитом до ветеринара важливо звернути увагу на поведінку тварини за останні 1–2 тижні. Запишіть зміни апетиту, активності та сну — це допоможе лікарю швидше зорієнтуватися.</p>
        <h2 style={{fontSize:28, margin:'28px 0 14px'}}>Поетапний план</h2>
        <ul style={{fontSize:17, color:'var(--ink-700)', lineHeight:1.7, paddingLeft:20}}>
          <li>Підготуйте носій та улюблену іграшку.</li>
          <li>Не годуйте за 4 години до прийому, якщо плануються аналізи.</li>
          <li>Принесіть попередні виписки чи результати аналізів.</li>
          <li>Запишіть 2–3 питання, які хочете поставити лікарю.</li>
        </ul>
        <div style={{padding:24, background:'var(--teal-50)', borderRadius:16, marginTop:32}}>
          <div style={{fontWeight:600, marginBottom:6}}>Хочете дізнатися більше?</div>
          <div style={{fontSize:14, color:'var(--ink-600)', marginBottom:14}}>Запишіться на консультацію — лікар відповість на всі ваші запитання.</div>
          <button className="btn btn-primary btn-sm" onClick={()=>go('booking')}>Записатись</button>
        </div>
      </article>
    </div>
  );
};

// =================================================================
// PROFILE
// =================================================================
const MONTHS_SHORT = ['СІЧ','ЛЮТ','БЕР','КВТ','ТРВ','ЧРВ','ЛИП','СРП','ВРС','ЖОВ','ЛСТ','ГРД'];
const PET_COLORS = ['teal','coral','violet','amber','green'];
const PET_KIND = s => s === 'Кіт' ? 'cat' : s === 'Собака' ? 'dog' : s === 'Кролик' ? 'rabbit' : 'cat';

const EmptyState = ({ icon, title, text, action, onAction }) => (
  <div style={{ textAlign: 'center', padding: '48px 24px' }}>
    <div style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--teal-50)', color: 'var(--teal-500)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
      <Icon name={icon} size={26} />
    </div>
    <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>{title}</div>
    <div style={{ fontSize: 14, color: 'var(--ink-500)', marginBottom: 20, maxWidth: 260, margin: '0 auto 20px' }}>{text}</div>
    {action && <button className="btn btn-primary btn-sm" onClick={onAction}>{action}</button>}
  </div>
);

const PetFormModal = ({ form, onClose, onSave }) => (
  <div className="backdrop" onClick={onClose}>
    <div className="card pop" onClick={e => e.stopPropagation()} style={{ padding: 28, maxWidth: 480, width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>{form.id ? 'Редагувати тварину' : 'Нова тварина'}</h2>
        <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: 8 }}><Icon name="x" size={16} /></button>
      </div>
      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Кличка *</label>
            <input className="input" placeholder="Барсік" value={form.name || ''} onChange={e => form._set('name', e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Вид *</label>
            <input className="input" placeholder="Кіт, Собака…" value={form.species || ''} onChange={e => form._set('species', e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Порода</label>
            <input className="input" placeholder="Мейн-кун" value={form.breed || ''} onChange={e => form._set('breed', e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Вік (р.)</label>
            <input className="input" placeholder="2" inputMode="numeric" value={form.age || ''} onChange={e => form._set('age', e.target.value.replace(/\D/g, ''))} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Вага (кг)</label>
            <input className="input" placeholder="4.5" inputMode="decimal" value={form.weight || ''} onChange={e => form._set('weight', e.target.value.replace(/[^\d.]/g, ''))} />
          </div>
        </div>
        <div>
          <label style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Попередження (через кому)</label>
          <input className="input" placeholder="Алергія на пеніцилін" value={form.alertsText || ''} onChange={e => form._set('alertsText', e.target.value)} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>Скасувати</button>
        <button className="btn btn-primary btn-sm" onClick={onSave}>Зберегти</button>
      </div>
    </div>
  </div>
);

export const ProfilePage = ({ go, openBooking, openLogin, showToast }) => {
  const store = useStore();
  const { currentUser: user, pets, appointments, messages, cancelAppointment, savePet, saveClient, sessionChecked } = store;
  const [tab, setTab] = uS2('upcoming');
  const [petFormData, setPetFormData] = uS2(null);
  const [editProfile, setEditProfile] = uS2(false);
  const [profileDraft, setProfileDraft] = uS2({});
  const [savingProfile, setSavingProfile] = uS2(false);

  uE2(() => {
    if (sessionChecked && !user) openLogin?.();
  }, [sessionChecked, user]);

  // Waiting for session restore — show skeleton
  if (!sessionChecked) {
    return (
      <div data-screen-label="Profile">
        <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, color: 'var(--ink-400)' }}>
            <div style={{ width: 40, height: 40, border: '3px solid var(--teal-200)', borderTopColor: 'var(--teal-600)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <span style={{ fontSize: 14 }}>Завантаження…</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div data-screen-label="Profile">
        <div style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', padding: '40px 16px' }}>
          <div style={{ textAlign: 'center', maxWidth: 380 }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: 'var(--teal-100)', color: 'var(--teal-600)', display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
              <Icon name="user" size={30} />
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 10 }}>Увійдіть у кабінет</h1>
            <p style={{ color: 'var(--ink-500)', marginBottom: 24, lineHeight: 1.6 }}>Ваші записи, тварини та документи доступні після входу.</p>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => openLogin?.()}>Увійти або зареєструватись</button>
          </div>
        </div>
      </div>
    );
  }

  const myPets = pets.filter(p => p.owner === user?.name);
  const myAppts = appointments.filter(a => a.client === user?.name).sort((a, b) => b.date?.localeCompare(a.date));
  const upcoming = myAppts.filter(a => !['Завершено','Скасовано'].includes(a.status));
  const history = myAppts.filter(a => ['Завершено','Скасовано'].includes(a.status));
  const myMessages = messages.filter(m => !m.phone || m.phone === user?.phone);

  const NAV = [
    { k: 'upcoming', l: 'Записи', i: 'calendar', badge: upcoming.length || null },
    { k: 'pets', l: 'Тварини', i: 'paw', badge: myPets.length || null },
    { k: 'history', l: 'Історія', i: 'activity' },
    { k: 'docs', l: 'Документи', i: 'book' },
    { k: 'settings', l: 'Дані', i: 'settings' },
  ];

  const openPetForm = (init) => {
    const data = { ...init };
    data._set = (k, v) => setPetFormData(p => ({ ...p, [k]: v }));
    setPetFormData(data);
  };

  const submitPetForm = () => {
    if (!petFormData) return;
    const result = savePet({
      ...petFormData,
      owner: user?.name || '',
      age: Number(petFormData.age || 0),
      weight: Number(petFormData.weight || 0),
      alerts: String(petFormData.alertsText || '').split(',').map(x => x.trim()).filter(Boolean),
    });
    if (!result.ok) { showToast?.(result.error); return; }
    setPetFormData(null);
    showToast?.('Тварину збережено');
  };

  const startEditProfile = () => {
    setProfileDraft({ name: user.name || '', phone: user.phone || '', email: user.email || '' });
    setEditProfile(true);
  };

  const submitProfile = async () => {
    if (!profileDraft.name?.trim()) { showToast?.('Введіть імʼя'); return; }
    setSavingProfile(true);
    try {
      const token = store.getAccessToken?.();
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: 'include',
        body: JSON.stringify(profileDraft),
      });
      if (res.ok) {
        const data = await res.json();
        store.setCurrentUser(data.user);
        saveClient({ ...user, ...profileDraft });
      }
      setEditProfile(false);
      showToast?.('Дані оновлено');
    } catch { showToast?.('Помилка збереження'); }
    setSavingProfile(false);
  };

  const memberSince = user.created_at ? new Date(user.created_at).toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' }) : null;

  return (
    <div data-screen-label="Profile">
      {/* ── Hero ── */}
      <div className="profile-hero">
        <div className="container">
          <div className="profile-hero-inner">
            <Avatar name={user.name || 'К'} size={64} />
            <div className="profile-hero-info">
              <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>{user.name}</div>
              {memberSince && <div style={{ fontSize: 13, color: 'var(--teal-200)', marginTop: 3 }}>Клієнт з {memberSince}</div>}
              <div className="profile-hero-stats">
                <div className="profile-hero-stat"><span>{myPets.length}</span> тварин</div>
                <div className="profile-hero-stat-div" />
                <div className="profile-hero-stat"><span>{myAppts.length}</span> візитів</div>
                {upcoming.length > 0 && <>
                  <div className="profile-hero-stat-div" />
                  <div className="profile-hero-stat"><span>{upcoming.length}</span> заплановано</div>
                </>}
              </div>
            </div>
            <button className="btn btn-primary profile-hero-cta" onClick={() => go('booking')}>
              <Icon name="plus" size={15} color="#fff" /> Записатись
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile tab nav ── */}
      <div className="profile-tab-nav">
        {NAV.map(item => (
          <button key={item.k} className={`profile-tab-btn${tab === item.k ? ' active' : ''}`} onClick={() => setTab(item.k)}>
            <Icon name={item.i} size={20} />
            <span>{item.l}</span>
            {item.badge ? <span className="profile-tab-badge">{item.badge}</span> : null}
          </button>
        ))}
      </div>

      {/* ── Layout ── */}
      <div className="container profile-section">
        <div className="profile-layout">

          {/* Desktop sidebar */}
          <aside className="profile-sidebar card">
            <div style={{ padding: '8px 8px 4px', fontSize: 11, fontWeight: 700, color: 'var(--ink-400)', letterSpacing: '.06em', textTransform: 'uppercase' }}>Кабінет</div>
            {NAV.map(item => (
              <button key={item.k} className={`profile-nav-btn${tab === item.k ? ' active' : ''}`} onClick={() => setTab(item.k)}>
                <Icon name={item.i} size={15} />
                <span style={{ flex: 1 }}>{item.l === 'Записи' ? 'Мої записи' : item.l === 'Тварини' ? 'Мої тварини' : item.l === 'Дані' ? 'Мої дані' : item.l}</span>
                {item.badge ? <span className="profile-nav-badge">{item.badge}</span> : null}
              </button>
            ))}
            <div className="profile-sidebar-div" />
            <button className="profile-nav-btn profile-nav-logout" onClick={store.logout}>
              <Icon name="logout" size={15} /> Вийти
            </button>
          </aside>

          {/* Content */}
          <main className="profile-main">

            {/* ── Upcoming ── */}
            {tab === 'upcoming' && (
              <div>
                <div className="profile-content-header">
                  <h2 className="profile-content-title">Записи</h2>
                  <button className="btn btn-sm btn-primary" onClick={() => go('booking')}><Icon name="plus" size={13} color="#fff" /> Новий</button>
                </div>
                {upcoming.length === 0 ? (
                  <div className="card" style={{ overflow: 'hidden' }}>
                    <EmptyState icon="calendar" title="Немає активних записів" text="Запишіть свого улюбленця на прийом до лікаря" action="Записатись" onAction={() => go('booking')} />
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: 10 }}>
                    {upcoming.map(ap => {
                      const day = ap.date?.slice(8, 10);
                      const mon = MONTHS_SHORT[parseInt(ap.date?.slice(5, 7), 10) - 1] || '';
                      return (
                        <div key={ap.id} className="card appt-card">
                          <div className="appt-date-badge">
                            <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1, fontFamily: 'var(--font-display)' }}>{day}</div>
                            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.04em' }}>{mon}</div>
                          </div>
                          <div className="appt-info">
                            <div style={{ fontWeight: 600, fontSize: 15 }}>{ap.service}</div>
                            <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 3 }}>
                              {[ap.pet, ap.doctor, ap.time].filter(Boolean).join(' · ')}
                            </div>
                          </div>
                          <div className="appt-actions">
                            <StatusPill status={ap.status} />
                            <button className="btn btn-sm btn-outline" onClick={() => cancelAppointment(ap.id)}>Скасувати</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="profile-content-header" style={{ marginTop: 32 }}>
                  <h2 className="profile-content-title">Швидкі дії</h2>
                </div>
                <div className="quick-actions">
                  {[
                    { icon: 'plus', bg: 'var(--teal-100)', c: 'var(--teal-600)', label: 'Новий запис', sub: 'На прийом', fn: () => go('booking') },
                    { icon: 'phone', bg: 'var(--coral-100)', c: 'var(--coral-600)', label: 'Зателефонувати', sub: 'Пряма лінія' },
                    { icon: 'paw', bg: 'var(--violet-100)', c: 'var(--violet-500)', label: 'Мої тварини', sub: 'Картки', fn: () => setTab('pets') },
                  ].map(({ icon, bg, c, label, sub, fn }) => (
                    <button key={label} className="card quick-action-btn" onClick={fn} disabled={!fn}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: bg, color: c, display: 'grid', placeItems: 'center', marginBottom: 12 }}>
                        <Icon name={icon} size={20} />
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 2 }}>{sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Pets ── */}
            {tab === 'pets' && (
              <div>
                <div className="profile-content-header">
                  <h2 className="profile-content-title">Мої тварини</h2>
                  <button className="btn btn-sm btn-outline" onClick={() => openPetForm({ name: '', species: '', breed: '', age: '', weight: '', alertsText: '' })}>
                    <Icon name="plus" size={13} /> Додати
                  </button>
                </div>
                {myPets.length === 0 ? (
                  <div className="card" style={{ overflow: 'hidden' }}>
                    <EmptyState icon="paw" title="Тварин ще немає" text="Додайте свого улюбленця щоб зберігати його медичну картку" action="Додати тварину" onAction={() => openPetForm({ name: '', species: '', breed: '', age: '', weight: '', alertsText: '' })} />
                  </div>
                ) : (
                  <div className="pet-grid">
                    {myPets.map((p, i) => (
                      <div key={p.id || i} className="card pet-card">
                        <div className="pet-card-visual">
                          <PetIllustration kind={PET_KIND(p.species)} color={PET_COLORS[i % PET_COLORS.length]} size={80} />
                        </div>
                        <div className="pet-card-body">
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700 }}>{p.name}</div>
                          <div style={{ fontSize: 13, color: 'var(--ink-500)', margin: '2px 0 10px' }}>
                            {[p.species, p.breed, p.age ? `${p.age} р.` : null].filter(Boolean).join(' · ')}
                          </div>
                          <div className="pet-card-stats">
                            {p.weight ? <div className="pet-stat"><span style={{ color: 'var(--ink-400)' }}>Вага</span><strong>{p.weight} кг</strong></div> : null}
                            {p.lastVisit ? <div className="pet-stat"><span style={{ color: 'var(--ink-400)' }}>Візит</span><strong>{p.lastVisit}</strong></div> : null}
                          </div>
                          {p.alerts?.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                              {p.alerts.slice(0, 2).map(a => <span key={a} className="chip chip-amber" style={{ fontSize: 11 }}>{a}</span>)}
                            </div>
                          )}
                          <button className="btn btn-sm btn-outline" style={{ marginTop: 12, alignSelf: 'flex-start' }}
                            onClick={() => openPetForm({ ...p, alertsText: p.alerts?.join(', ') || '' })}>
                            <Icon name="edit" size={13} /> Редагувати
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── History ── */}
            {tab === 'history' && (
              <div>
                <h2 className="profile-content-title" style={{ marginBottom: 16 }}>Історія візитів</h2>
                {history.length === 0 ? (
                  <div className="card" style={{ overflow: 'hidden' }}>
                    <EmptyState icon="activity" title="Візитів ще не було" text="Тут зберігатиметься ваша медична історія" />
                  </div>
                ) : (
                  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    {history.map((ap, i) => (
                      <div key={ap.id} className="history-row" style={{ borderTop: i ? '1px solid var(--ink-100)' : 0 }}>
                        <div className="history-main">
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{ap.service}</div>
                          <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 2 }}>{ap.pet} · {ap.doctor}</div>
                        </div>
                        <div className="history-date" style={{ fontSize: 13, color: 'var(--ink-600)' }}>{ap.date}</div>
                        <StatusPill status={ap.status} />
                        {ap.price ? <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, textAlign: 'right' }}>{ap.price} ₴</div> : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Docs ── */}
            {tab === 'docs' && (
              <div>
                <h2 className="profile-content-title" style={{ marginBottom: 16 }}>Документи</h2>
                {(() => {
                  const docs = [
                    ...myAppts.slice(0, 5).map(ap => ({ id: `ap-${ap.id}`, title: `Виписка: ${ap.service}`, meta: `${ap.pet} · ${ap.date}`, icon: 'file' })),
                    ...myMessages.slice(0, 3).map(m => ({ id: `m-${m.id}`, title: 'Звернення до клініки', meta: m.createdAt?.slice(0, 10) || 'сьогодні', icon: 'mail' })),
                  ];
                  if (!docs.length) return (
                    <div className="card" style={{ overflow: 'hidden' }}>
                      <EmptyState icon="book" title="Документів ще немає" text="Виписки та результати аналізів зберігатимуться тут" />
                    </div>
                  );
                  return (
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                      {docs.map((doc, i) => (
                        <div key={doc.id} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 14, padding: '14px 20px', alignItems: 'center', borderTop: i ? '1px solid var(--ink-100)' : 0 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--teal-50)', color: 'var(--teal-700)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                            <Icon name={doc.icon} size={17} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{doc.title}</div>
                            <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 2 }}>{doc.meta}</div>
                          </div>
                          <button className="btn btn-sm btn-outline">Переглянути</button>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ── Settings ── */}
            {tab === 'settings' && (
              <div>
                <div className="profile-content-header">
                  <h2 className="profile-content-title">Мої дані</h2>
                  {!editProfile && <button className="btn btn-sm btn-outline" onClick={startEditProfile}><Icon name="edit" size={13} /> Редагувати</button>}
                </div>

                {editProfile ? (
                  <div className="card" style={{ padding: 24 }}>
                    <div style={{ display: 'grid', gap: 14 }}>
                      <div>
                        <label style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Імʼя та прізвище</label>
                        <input className="input" value={profileDraft.name || ''} onChange={e => setProfileDraft(d => ({ ...d, name: e.target.value }))} placeholder="Іван Коваленко" autoComplete="name" />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Телефон</label>
                        <input className="input" value={profileDraft.phone || ''} onChange={e => setProfileDraft(d => ({ ...d, phone: e.target.value }))} placeholder="+380 XX XXX XX XX" inputMode="tel" autoComplete="tel" />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Email</label>
                        <input className="input" value={profileDraft.email || ''} onChange={e => setProfileDraft(d => ({ ...d, email: e.target.value }))} placeholder="your@email.com" inputMode="email" autoComplete="email" />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditProfile(false)} disabled={savingProfile}>Скасувати</button>
                      <button className="btn btn-primary btn-sm" onClick={submitProfile} disabled={savingProfile}>
                        {savingProfile ? 'Зберігаємо…' : 'Зберегти'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    {[
                      { icon: 'user', label: 'Імʼя', value: user.name },
                      { icon: 'phone', label: 'Телефон', value: user.phone },
                      { icon: 'mail', label: 'Email', value: user.email },
                    ].map(({ icon, label, value }, i) => (
                      <div key={label} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 14, padding: '16px 20px', alignItems: 'center', borderTop: i ? '1px solid var(--ink-100)' : 0 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--ink-50)', color: 'var(--ink-500)', display: 'grid', placeItems: 'center' }}>
                          <Icon name={icon} size={16} />
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--ink-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 2 }}>{label}</div>
                          <div style={{ fontWeight: 600, fontSize: 15 }}>{value || <span style={{ color: 'var(--ink-300)', fontWeight: 400 }}>Не вказано</span>}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="profile-content-header" style={{ marginTop: 28 }}>
                  <h2 className="profile-content-title">Акаунт</h2>
                </div>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <button className="profile-danger-row" onClick={store.logout}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--coral-100)', color: 'var(--coral-600)', display: 'grid', placeItems: 'center' }}>
                      <Icon name="logout" size={16} />
                    </div>
                    <span style={{ fontWeight: 500 }}>Вийти з акаунту</span>
                    <Icon name="chevRight" size={16} color="var(--ink-400)" />
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {petFormData && (
        <PetFormModal
          form={petFormData}
          onClose={() => setPetFormData(null)}
          onSave={submitPetForm}
        />
      )}
    </div>
  );
};
