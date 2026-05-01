// Public pages — part 1: Home, Services, Service Detail
import React, { useState as useS, useMemo as useM, useEffect as useEf } from 'react';
import { Icon, PetIllustration, Avatar, Stars } from './components.jsx';
import { useStore } from './store.jsx';

// =================================================================
// HOME PAGE
// =================================================================
export const HomePage = ({ go, openBooking }) => {
  const { services, doctors, articles, reviews } = useStore();
  return (
    <div data-screen-label="Home">
      {/* HERO */}
      <section className="home-hero" style={{position:'relative', overflow:'hidden', background:'linear-gradient(180deg, var(--teal-50), transparent 80%)'}}>
        <div className="container home-hero-grid" style={{padding:'72px 24px 96px', display:'grid', gridTemplateColumns:'1.15fr 1fr', gap:48, alignItems:'center'}}>
          <div className="fade-up">
            <h1 className="home-hero-title" style={{fontSize:64, lineHeight:1.02, letterSpacing:'-0.035em', marginBottom:20}}>
              Уважна ветеринарія<br/>
              <span style={{color:'var(--teal-600)'}}>для тих, кого ви любите</span>
            </h1>
            <p className="home-hero-lead" style={{fontSize:18, color:'var(--ink-600)', maxWidth:520, marginBottom:32}}>
              Сучасна клініка у Львові з онлайн-записом, прозорими цінами та власним кабінетом, де зберігається вся медична історія вашого улюбленця.
            </p>
            <div className="home-hero-actions" style={{display:'flex', gap:12, alignItems:'center'}}>
              <button className="btn btn-primary btn-lg" onClick={openBooking}>
                <Icon name="calendar" size={16} color="#fff"/> Записатись на прийом
              </button>
              <button className="btn btn-ghost btn-lg" onClick={()=>go('services')}>
                Дивитись послуги <Icon name="arrowRight" size={16}/>
              </button>
            </div>
            <div className="hero-stats" style={{display:'flex', gap:32, marginTop:40, flexWrap:'wrap'}}>
              {[
                { v:'12 років', l:'на ринку' },
                { v:'24/7', l:'ургентна допомога' },
                { v:'4.9 ★', l:'оцінка клієнтів' },
                { v:'8000+', l:'тварин у системі' },
              ].map((s,i)=>(
                <div key={i}>
                  <div style={{fontFamily:'var(--font-display)', fontSize:24, fontWeight:700, letterSpacing:'-0.02em'}}>{s.v}</div>
                  <div style={{fontSize:13, color:'var(--ink-500)'}}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Visual cluster */}
          <div className="home-hero-cluster" style={{position:'relative', height:520}}>
            <div className="card" style={{position:'absolute', top:0, right:0, width:340, padding:24, transform:'rotate(2deg)', boxShadow:'var(--shadow-lg)'}}>
              <div style={{display:'flex', alignItems:'center', gap:14, marginBottom:14}}>
                <PetIllustration kind="dog" color="coral" size={64}/>
                <div>
                  <div style={{fontWeight:700, fontFamily:'var(--font-display)', fontSize:18}}>Рекс, 7 років</div>
                  <div style={{fontSize:13, color:'var(--ink-500)'}}>Лабрадор · Олег В.</div>
                </div>
              </div>
              <div style={{padding:14, background:'var(--teal-50)', borderRadius:12, marginBottom:10}}>
                <div style={{fontSize:12, color:'var(--teal-700)', fontWeight:600, marginBottom:4}}>НАСТУПНИЙ ВІЗИТ</div>
                <div style={{fontWeight:600}}>УЗД серця · 27 квітня · 11:00</div>
                <div style={{fontSize:13, color:'var(--ink-500)', marginTop:2}}>Лікар: Марта Коваль</div>
              </div>
              <div style={{display:'flex', gap:6}}>
                <div className="chip chip-green" style={{fontSize:11}}>Вакцинація актуальна</div>
                <div className="chip chip-amber" style={{fontSize:11}}>Контроль ваги</div>
              </div>
            </div>

            <div className="card" style={{position:'absolute', top:170, left:0, width:300, padding:20, transform:'rotate(-3deg)', boxShadow:'var(--shadow-lg)'}}>
              <div style={{fontSize:12, color:'var(--ink-500)', fontWeight:600, marginBottom:10}}>СЬОГОДНІ В РОБОТІ</div>
              {doctors.slice(0,3).map((d,i)=>(
                <div key={d.id} style={{display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderTop: i?'1px solid var(--ink-100)':0}}>
                  <Avatar name={d.name} size={36}/>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600, fontSize:14}}>{d.name}</div>
                    <div style={{fontSize:12, color:'var(--ink-500)'}}>{d.role}</div>
                  </div>
                  <div style={{width:8, height:8, borderRadius:'50%', background:'var(--green-500)'}}></div>
                </div>
              ))}
            </div>

            <div className="card" style={{position:'absolute', bottom:0, right:30, width:240, padding:18, boxShadow:'var(--shadow-lg)', background:'var(--ink-900)', color:'#fff', transform:'rotate(1deg)'}}>
              <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
                <Icon name="phone" size={14} color="var(--coral-500)"/>
                <div style={{fontSize:11, color:'var(--coral-300)', fontWeight:600, letterSpacing:'0.04em'}}>УРГЕНТНА ЛІНІЯ</div>
              </div>
              <a href="tel:+380636798977" style={{fontFamily:'var(--font-display)', fontSize:22, fontWeight:700, color:'#fff'}}>+380 63 679 89 77</a>
              <div style={{fontSize:12, opacity:.6, marginTop:4}}>Пн–Пт 09:00–18:00 · Сб–Нд за записом</div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section style={{borderTop:'1px solid var(--ink-100)', borderBottom:'1px solid var(--ink-100)', background:'var(--paper)'}}>
        <div className="container trust-bar" style={{padding:'20px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:14}}>
          {['Сертифікація MSD','IDEXX лабораторія','Партнер Royal Canin','VCA Member','Цифрова рентгенографія'].map((b,i)=>(
            <div key={i} style={{fontSize:13, fontWeight:600, color:'var(--ink-500)', letterSpacing:'0.02em', textTransform:'uppercase'}}>{b}</div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section style={{padding:'88px 0'}}>
        <div className="container">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:36}}>
            <div>
              <div className="chip chip-teal" style={{marginBottom:14}}>Послуги</div>
              <h2 style={{fontSize:42, maxWidth:560}}>Все необхідне для здоров'я вашої тварини</h2>
            </div>
            <button className="btn btn-outline" onClick={()=>go('services')}>Усі послуги <Icon name="arrowRight" size={14}/></button>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16}}>
            {services.slice(0,6).map((s,i)=>(
              <button key={s.id} onClick={()=>go('service',{id:s.id})}
                className="card" style={{padding:24, textAlign:'left', border:0, cursor:'pointer', transition:'transform .15s ease, box-shadow .15s ease'}}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='var(--shadow)';}}
                onMouseLeave={e=>{e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='';}}>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18}}>
                  <div style={{width:48, height:48, borderRadius:14, background:`var(--${s.color}-100)`, color:`var(--${s.color}-${s.color==='amber'||s.color==='green'?'500':'600'})`, display:'grid', placeItems:'center'}}>
                    <Icon name={s.icon} size={24}/>
                  </div>
                  <Icon name="arrowRight" size={18} color="var(--ink-300)"/>
                </div>
                <div style={{fontFamily:'var(--font-display)', fontSize:22, fontWeight:600, marginBottom:6}}>{s.name}</div>
                <div style={{fontSize:14, color:'var(--ink-500)', marginBottom:14}}>{s.short}</div>
                <div style={{fontSize:13, color:'var(--ink-700)', fontWeight:600}}>від {s.items[0].price} ₴</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section style={{padding:'80px 0', background:'var(--ink-950)', color:'#fff'}}>
        <div className="container">
          <div className="chip chip-teal" style={{marginBottom:14}}>Чому UltraVet</div>
          <h2 style={{fontSize:42, color:'#fff', maxWidth:680, marginBottom:48}}>Не лікарня, а простір довіри між власником, лікарем і твариною</h2>
          <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16}}>
            {[
              { i:'shield', t:'Прозоре лікування', d:'Кожне призначення з поясненням і альтернативами. Без зайвих процедур.' },
              { i:'clock', t:'Без черг', d:'Записи через сайт або застосунок. Час прийому — реальний, не «приблизний».' },
              { i:'file', t:'Карта тварини онлайн', d:'Усі вакцинації, аналізи й висновки доступні у вашому кабінеті.' },
              { i:'heart', t:'Команда з 12 лікарів', d:'Терапія, хірургія, стоматологія, УЗД, офтальмологія — все під одним дахом.' },
            ].map((f,i)=>(
              <div key={i} style={{padding:24, borderRadius:18, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)'}}>
                <div style={{width:44, height:44, borderRadius:12, background:'var(--teal-600)', display:'grid', placeItems:'center', marginBottom:18}}>
                  <Icon name={f.i} size={20} color="#fff"/>
                </div>
                <div style={{fontFamily:'var(--font-display)', fontSize:19, fontWeight:600, marginBottom:6, color:'#fff'}}>{f.t}</div>
                <div style={{fontSize:14, color:'#aac1bf'}}>{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DOCTORS */}
      <section style={{padding:'88px 0'}}>
        <div className="container">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:36}}>
            <div>
              <div className="chip chip-coral" style={{marginBottom:14}}>Команда</div>
              <h2 style={{fontSize:42}}>Наші лікарі</h2>
            </div>
            <button className="btn btn-outline" onClick={()=>go('about')}>Уся команда <Icon name="arrowRight" size={14}/></button>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16}}>
            {doctors.slice(0,4).map(d=>(
              <div key={d.id} className="card" style={{padding:0, overflow:'hidden'}}>
                <div style={{height:180, background:'var(--teal-100)', overflow:'hidden'}}>
                  {d.photo ? (
                    <img src={d.photo} alt={d.name} loading="lazy" style={{width:'100%', height:'100%', objectFit:'cover', display:'block'}}/>
                  ) : (
                    <div className="stripe-bg" style={{height:'100%', display:'grid', placeItems:'center'}}><Avatar name={d.name} size={84}/></div>
                  )}
                </div>
                <div style={{padding:18}}>
                  <div style={{fontFamily:'var(--font-display)', fontWeight:600, fontSize:18}}>{d.name}</div>
                  <div style={{fontSize:13, color:'var(--ink-500)', marginBottom:10}}>{d.role}</div>
                  <div style={{display:'flex', gap:6}}>
                    <div className="chip" style={{fontSize:11}}>{d.exp} років досвіду</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section style={{padding:'88px 0', background:'var(--paper)'}}>
        <div className="container">
          <div className="chip chip-amber" style={{marginBottom:14}}>Відгуки</div>
          <h2 style={{fontSize:42, marginBottom:36}}>Що кажуть власники</h2>
          <div style={{display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16}}>
            {reviews.slice(0,4).map((r,i)=>(
              <div key={i} className="card" style={{padding:28, border:'1px solid var(--ink-100)', boxShadow:'none'}}>
                <Stars rating={r.rating}/>
                <p style={{fontSize:17, lineHeight:1.5, margin:'14px 0 18px', color:'var(--ink-800)'}}>«{r.text}»</p>
                <div style={{display:'flex', alignItems:'center', gap:12}}>
                  <Avatar name={r.name} size={40}/>
                  <div>
                    <div style={{fontWeight:600, fontSize:14}}>{r.name}</div>
                    <div style={{fontSize:12, color:'var(--ink-500)'}}>{r.pet} · {r.date}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ARTICLES */}
      <section style={{padding:'88px 0'}}>
        <div className="container">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:36}}>
            <div>
              <div className="chip chip-violet" style={{marginBottom:14}}>Журнал</div>
              <h2 style={{fontSize:42}}>Корисні статті</h2>
            </div>
            <button className="btn btn-outline" onClick={()=>go('articles')}>Усі статті <Icon name="arrowRight" size={14}/></button>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16}}>
            {articles.slice(0,3).map((a,i)=>(
              <button key={a.id} onClick={()=>go('article', {id:a.id})} className="card" style={{textAlign:'left', border:0, cursor:'pointer', overflow:'hidden', padding:0}}>
                <div style={{height:160, background: ['var(--teal-100)','var(--coral-100)','var(--violet-100)'][i%3], overflow:'hidden'}}>
                  {a.cover && <img src={a.cover} alt={a.title} loading="lazy" style={{width:'100%', height:'100%', objectFit:'cover', display:'block'}}/>}
                </div>
                <div style={{padding:22}}>
                  <div style={{display:'flex', gap:10, fontSize:12, color:'var(--ink-500)', marginBottom:10}}>
                    <span style={{fontWeight:600, color:'var(--teal-700)'}}>{a.tag}</span>
                    <span>·</span>
                    <span>{a.read} хв читати</span>
                  </div>
                  <div style={{fontFamily:'var(--font-display)', fontSize:19, fontWeight:600, marginBottom:10, lineHeight:1.2}}>{a.title}</div>
                  <div style={{fontSize:14, color:'var(--ink-500)'}}>{a.excerpt}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{padding:'48px 0 96px'}}>
        <div className="container">
          <div className="home-cta" style={{padding:'56px 56px', borderRadius:28, background:'linear-gradient(135deg, var(--teal-600), var(--teal-800))', color:'#fff', display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:32, alignItems:'center', position:'relative', overflow:'hidden'}}>
            <div style={{position:'absolute', top:-60, right:-60, width:300, height:300, borderRadius:'50%', background:'var(--coral-500)', opacity:.15, pointerEvents:'none'}}/>
            <div style={{position:'relative', zIndex:1}}>
              <h2 style={{fontSize:38, color:'#fff', marginBottom:14}}>Готові записатися?</h2>
              <p style={{fontSize:17, opacity:.85, maxWidth:520}}>Виберіть зручний час, лікаря та послугу. Ми підтвердимо запис протягом 15 хвилин.</p>
            </div>
            <div style={{display:'flex', gap:12, justifySelf:'end', position:'relative', zIndex:1}}>
              <button className="btn btn-coral btn-lg" onClick={openBooking}>Записатись онлайн</button>
              <a href="tel:+380636798977" className="btn btn-lg" style={{background:'rgba(255,255,255,0.12)', color:'#fff'}}><Icon name="phone" size={16}/> Подзвонити</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// =================================================================
// SERVICES PAGE
// =================================================================
export const ServicesPage = ({ go, openBooking }) => {
  const { services } = useStore();
  const [search, setSearch] = useS('');
  const [view, setView] = useS('grid');
  const filtered = services.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.short.toLowerCase().includes(search.toLowerCase()));

  return (
    <div data-screen-label="Services">
      <section style={{padding:'56px 0 24px', background:'var(--teal-50)'}}>
        <div className="container">
          <div className="chip chip-teal" style={{marginBottom:14}}>Послуги</div>
          <h1 style={{fontSize:54, letterSpacing:'-0.03em', maxWidth:760, marginBottom:14}}>Каталог послуг клініки</h1>
          <p style={{fontSize:17, color:'var(--ink-600)', maxWidth:560}}>Від планового огляду до складних операцій. Усі ціни прозорі, кошторис погоджуємо до прийому.</p>
        </div>
      </section>

      <section style={{padding:'32px 0 16px', position:'sticky', top:'var(--header-h)', background:'var(--bg)', zIndex:10, borderBottom:'1px solid var(--ink-100)'}}>
        <div className="container" style={{display:'flex', gap:14, alignItems:'center'}}>
          <div style={{position:'relative', flex:1, maxWidth:480}}>
            <div style={{position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--ink-400)'}}><Icon name="search" size={16}/></div>
            <input className="input" style={{paddingLeft:40}} placeholder="Знайти послугу..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <div style={{display:'flex', gap:4, padding:4, background:'var(--ink-100)', borderRadius:10}}>
            <button onClick={()=>setView('grid')} style={{border:0, padding:'6px 10px', borderRadius:8, background: view==='grid'?'var(--paper)':'transparent', cursor:'pointer'}}><Icon name="grid" size={16}/></button>
            <button onClick={()=>setView('list')} style={{border:0, padding:'6px 10px', borderRadius:8, background: view==='list'?'var(--paper)':'transparent', cursor:'pointer'}}><Icon name="list" size={16}/></button>
          </div>
          <div style={{fontSize:13, color:'var(--ink-500)'}}>{filtered.length} послуг</div>
        </div>
      </section>

      <section style={{padding:'40px 0 96px'}}>
        <div className="container">
          {filtered.length === 0 ? (
            <div className="card" style={{padding:48, textAlign:'center', color:'var(--ink-500)'}}>
              <div style={{fontSize:16, fontWeight:600, color:'var(--ink-700)', marginBottom:6}}>Нічого не знайдено</div>
              <div style={{fontSize:14}}>Спробуйте інший запит або перегляньте всі послуги.</div>
            </div>
          ) : view === 'grid' ? (
            <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16}}>
              {filtered.map(s => (
                <div key={s.id} className="card" style={{padding:26, display:'flex', flexDirection:'column'}}>
                  <div style={{width:56, height:56, borderRadius:16, background:`var(--${s.color}-100)`, color:`var(--${s.color}-${s.color==='amber'||s.color==='green'?'500':'600'})`, display:'grid', placeItems:'center', marginBottom:18}}>
                    <Icon name={s.icon} size={26}/>
                  </div>
                  <div style={{fontFamily:'var(--font-display)', fontSize:22, fontWeight:600, marginBottom:6}}>{s.name}</div>
                  <p style={{fontSize:14, color:'var(--ink-500)', marginBottom:18, flex:1}}>{s.desc}</p>
                  <div style={{borderTop:'1px solid var(--ink-100)', paddingTop:14, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <div>
                      <div style={{fontSize:11, color:'var(--ink-500)', textTransform:'uppercase', letterSpacing:'0.04em'}}>Від</div>
                      <div style={{fontFamily:'var(--font-display)', fontWeight:700, fontSize:20}}>{s.items[0].price} ₴</div>
                    </div>
                    <button className="btn btn-sm btn-outline" onClick={()=>go('service',{id:s.id})}>Деталі →</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{padding:0, overflow:'hidden'}}>
              {filtered.map((s,i) => (
                <button key={s.id} onClick={()=>go('service',{id:s.id})} style={{display:'grid', gridTemplateColumns:'auto 1fr auto auto', gap:18, alignItems:'center', padding:'20px 24px', width:'100%', border:0, background:'none', cursor:'pointer', borderTop: i?'1px solid var(--ink-100)':0, textAlign:'left'}}>
                  <div style={{width:44, height:44, borderRadius:12, background:`var(--${s.color}-100)`, color:`var(--${s.color}-${s.color==='amber'||s.color==='green'?'500':'600'})`, display:'grid', placeItems:'center'}}>
                    <Icon name={s.icon} size={20}/>
                  </div>
                  <div>
                    <div style={{fontWeight:600, fontSize:16}}>{s.name}</div>
                    <div style={{fontSize:13, color:'var(--ink-500)'}}>{s.short}</div>
                  </div>
                  <div style={{fontFamily:'var(--font-display)', fontWeight:700, fontSize:18}}>від {s.items[0].price} ₴</div>
                  <Icon name="chevRight" size={18} color="var(--ink-400)"/>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

// =================================================================
// SERVICE DETAIL
// =================================================================
export const ServiceDetailPage = ({ go, openBooking, params }) => {
  const { services, doctors } = useStore();
  const s = services.find(x => x.id === params.id) || services[0];
  const drs = doctors.filter(d => d.services.includes(s.id));

  return (
    <div data-screen-label={`Service · ${s.name}`}>
      <div className="container" style={{padding:'24px 24px 0'}}>
        <button onClick={()=>go('services')} style={{border:0, background:'none', color:'var(--ink-500)', cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', gap:6}}>
          <Icon name="chevLeft" size={14}/> Усі послуги
        </button>
      </div>
      <section style={{padding:'24px 0 56px'}}>
        <div className="container service-detail-grid" style={{display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:48, alignItems:'flex-start'}}>
          <div>
            <div style={{display:'flex', gap:14, alignItems:'center', marginBottom:24}}>
              <div style={{width:64, height:64, borderRadius:18, background:`var(--${s.color}-100)`, color:`var(--${s.color}-${s.color==='amber'||s.color==='green'?'500':'600'})`, display:'grid', placeItems:'center'}}>
                <Icon name={s.icon} size={30}/>
              </div>
              <div>
                <div className="chip chip-teal">Послуга</div>
                <h1 style={{fontSize:42, letterSpacing:'-0.03em', marginTop:6}}>{s.name}</h1>
              </div>
            </div>
            <p style={{fontSize:18, color:'var(--ink-700)', marginBottom:32, maxWidth:600, lineHeight:1.5}}>{s.desc}</p>

            <h3 style={{fontSize:22, marginBottom:16}}>Що входить</h3>
            <div className="card" style={{padding:0, overflow:'hidden', marginBottom:32}}>
              {s.items.map((it, i)=>(
                <div key={i} style={{display:'grid', gridTemplateColumns:'1fr auto auto', gap:18, alignItems:'center', padding:'18px 22px', borderTop: i?'1px solid var(--ink-100)':0}}>
                  <div style={{fontWeight:500}}>{it.name}</div>
                  <div style={{fontSize:13, color:'var(--ink-500)', display:'flex', alignItems:'center', gap:6}}>
                    <Icon name="clock" size={13}/> {it.duration} хв
                  </div>
                  <div style={{fontFamily:'var(--font-display)', fontWeight:700, fontSize:17}}>{it.price} ₴</div>
                </div>
              ))}
            </div>

            <h3 style={{fontSize:22, marginBottom:16}}>Як проходить прийом</h3>
            <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:32}}>
              {[
                { n:'01', t:'Запис', d:'Онлайн або телефоном' },
                { n:'02', t:'Огляд', d:'Збір анамнезу' },
                { n:'03', t:'Діагностика', d:'За потреби — аналізи' },
                { n:'04', t:'Призначення', d:'З поясненням' },
              ].map((st,i)=>(
                <div key={i} style={{padding:18, borderRadius:14, background:'var(--ink-25)', border:'1px solid var(--ink-100)'}}>
                  <div style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--teal-600)', fontWeight:600, marginBottom:8}}>{st.n}</div>
                  <div style={{fontWeight:600, marginBottom:4}}>{st.t}</div>
                  <div style={{fontSize:13, color:'var(--ink-500)'}}>{st.d}</div>
                </div>
              ))}
            </div>

            {drs.length > 0 && (
              <>
                <h3 style={{fontSize:22, marginBottom:16}}>Лікарі</h3>
                <div style={{display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12}}>
                  {drs.map(d => (
                    <div key={d.id} className="card" style={{padding:18, display:'flex', alignItems:'center', gap:14}}>
                      <Avatar name={d.name} size={56}/>
                      <div>
                        <div style={{fontWeight:600, fontFamily:'var(--font-display)', fontSize:17}}>{d.name}</div>
                        <div style={{fontSize:13, color:'var(--ink-500)'}}>{d.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="service-detail-aside" style={{position:'sticky', top:96}}>
            <div className="card" style={{padding:28}}>
              <div style={{fontSize:13, color:'var(--ink-500)', marginBottom:6}}>Вартість послуги</div>
              <div style={{fontFamily:'var(--font-display)', fontSize:36, fontWeight:700, letterSpacing:'-0.03em'}}>від {s.items[0].price} ₴</div>
              <div style={{fontSize:13, color:'var(--ink-500)', marginBottom:22}}>Тривалість: ~{s.items[0].duration} хв</div>
              <button className="btn btn-primary btn-lg" style={{width:'100%'}} onClick={()=>go('booking', {service: s.id})}>Записатись</button>
              <a href="tel:+380636798977" className="btn btn-outline" style={{width:'100%', marginTop:10}}><Icon name="phone" size={14}/> Зателефонувати</a>
              <div style={{borderTop:'1px solid var(--ink-100)', marginTop:22, paddingTop:18, fontSize:13, color:'var(--ink-600)', lineHeight:1.6}}>
                <div style={{display:'flex', gap:10, alignItems:'flex-start', marginBottom:10}}>
                  <Icon name="check" size={14} color="var(--green-500)"/>
                  <span>Підтвердження за 15 хвилин</span>
                </div>
                <div style={{display:'flex', gap:10, alignItems:'flex-start', marginBottom:10}}>
                  <Icon name="check" size={14} color="var(--green-500)"/>
                  <span>Кошторис погоджуємо до прийому</span>
                </div>
                <div style={{display:'flex', gap:10, alignItems:'flex-start'}}>
                  <Icon name="check" size={14} color="var(--green-500)"/>
                  <span>Безкоштовне скасування за 2 год</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
