// Main App
import React, { useState as uS, useEffect as uE } from 'react';
import { Icon } from './components.jsx';
import { SERVICES } from './data.js';
import {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakColor,
  TweakSlider,
  TweakSelect,
  TweakButton,
} from './tweaks-panel.jsx';
import {
  HomePage,
  ServicesPage,
  ServiceDetailPage,
} from './pages-public.jsx';
import {
  BookingPage,
  AboutPage,
  ContactsPage,
  PricesPage,
  ArticlesPage,
  ArticlePage,
  ProfilePage,
} from './pages-public-2.jsx';
import {
  AdminLayout,
  AdminDashboard,
  AdminCalendar,
  AdminAppointments,
  AdminClients,
  AdminPets,
  AdminDoctors,
  AdminServices,
  AdminArticles,
  AdminReports,
  AdminRoles,
  AdminSettings,
} from './pages-admin.jsx';

const TWEAKS_DEFAULTS = /*EDITMODE-BEGIN*/{
  "primaryColor": "#0e7a78",
  "accentColor": "#ff7a45",
  "radius": 14,
  "headingFont": "Inter Tight",
  "bodyFont": "Inter",
  "darkAdmin": true
}/*EDITMODE-END*/;

const Header = ({ go, current, openBooking, openLogin }) => {
  const links = [
    { k:'home', l:'Головна' },
    { k:'services', l:'Послуги' },
    { k:'prices', l:'Ціни' },
    { k:'about', l:'Про клініку' },
    { k:'articles', l:'Статті' },
    { k:'contacts', l:'Контакти' },
  ];
  return (
    <header style={{position:'sticky', top:0, background:'rgba(255,255,255,0.92)', backdropFilter:'blur(10px)', borderBottom:'1px solid var(--ink-100)', zIndex:50}}>
      <div className="container" style={{display:'flex', alignItems:'center', justifyContent:'space-between', height:72, gap:24}}>
        <button onClick={()=>go('home')} style={{display:'flex', alignItems:'center', gap:10, border:0, background:'none', cursor:'pointer'}}>
          <div style={{width:36, height:36, borderRadius:10, background:'var(--teal-600)', display:'grid', placeItems:'center'}}>
            <Icon name="paw" size={20} color="#fff"/>
          </div>
          <div style={{textAlign:'left'}}>
            <div style={{fontFamily:'var(--font-display)', fontWeight:700, fontSize:18, letterSpacing:'-0.02em'}}>PetCare</div>
            <div style={{fontSize:11, color:'var(--ink-500)', marginTop:-2}}>Ветклініка · Львів</div>
          </div>
        </button>
        <nav style={{display:'flex', gap:4}}>
          {links.map(l => (
            <button key={l.k} onClick={()=>go(l.k)}
              style={{padding:'8px 14px', border:0, background: current===l.k?'var(--ink-100)':'transparent', borderRadius:999, fontSize:14, fontWeight:500, cursor:'pointer', color: current===l.k?'var(--ink-900)':'var(--ink-700)'}}>
              {l.l}
            </button>
          ))}
        </nav>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <button onClick={openLogin} className="btn btn-ghost btn-sm"><Icon name="user" size={14}/> Кабінет</button>
          <button onClick={openBooking} className="btn btn-primary btn-sm"><Icon name="calendar" size={14}/> Записатись</button>
        </div>
      </div>
    </header>
  );
};

const Footer = ({ go, openAdmin }) => (
  <footer style={{background:'var(--ink-950)', color:'#cfdcdb', padding:'56px 0 32px', marginTop:0}}>
    <div className="container">
      <div style={{display:'grid', gridTemplateColumns:'1.5fr 1fr 1fr 1fr', gap:32, marginBottom:40}}>
        <div>
          <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:14}}>
            <div style={{width:36, height:36, borderRadius:10, background:'var(--teal-500)', display:'grid', placeItems:'center'}}><Icon name="paw" size={20} color="#fff"/></div>
            <div style={{fontFamily:'var(--font-display)', fontWeight:700, fontSize:20, color:'#fff'}}>PetCare</div>
          </div>
          <p style={{fontSize:14, opacity:.7, maxWidth:320}}>Сучасна ветклініка у Львові з онлайн-записом, кабінетом власника тварини та зрозумілою медичною історією.</p>
        </div>
        <div>
          <div style={{fontWeight:600, color:'#fff', marginBottom:12}}>Навігація</div>
          <div style={{display:'grid', gap:8, fontSize:14}}>
            <button onClick={()=>go('home')} style={{textAlign:'left', border:0, background:'none', color:'inherit', padding:0, cursor:'pointer'}}>Головна</button>
            <button onClick={()=>go('services')} style={{textAlign:'left', border:0, background:'none', color:'inherit', padding:0, cursor:'pointer'}}>Послуги</button>
            <button onClick={()=>go('about')} style={{textAlign:'left', border:0, background:'none', color:'inherit', padding:0, cursor:'pointer'}}>Про клініку</button>
            <button onClick={()=>go('articles')} style={{textAlign:'left', border:0, background:'none', color:'inherit', padding:0, cursor:'pointer'}}>Статті</button>
            <button onClick={()=>go('contacts')} style={{textAlign:'left', border:0, background:'none', color:'inherit', padding:0, cursor:'pointer'}}>Контакти</button>
          </div>
        </div>
        <div>
          <div style={{fontWeight:600, color:'#fff', marginBottom:12}}>Контакти</div>
          <div style={{display:'grid', gap:8, fontSize:14}}>
            <div>вул. Личаківська, 42</div>
            <div>Львів, 79000</div>
            <div>+380 67 123 45 67</div>
            <div>hello@petcare.ua</div>
          </div>
        </div>
        <div>
          <div style={{fontWeight:600, color:'#fff', marginBottom:12}}>Графік</div>
          <div style={{display:'grid', gap:8, fontSize:14}}>
            <div>Пн–Пт · 09:00–19:00</div>
            <div>Сб · 10:00–18:00</div>
            <div>Нд · вихідний</div>
            <div style={{color:'var(--coral-300)', marginTop:8}}>Ургентна допомога 24/7</div>
          </div>
        </div>
      </div>
      <div style={{borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:24, display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:14, fontSize:13, opacity:.6}}>
        <div>© 2026 PetCare. Всі права захищені.</div>
        <div style={{display:'flex', gap:18}}>
          <button onClick={openAdmin} style={{border:0, background:'none', color:'var(--teal-300)', cursor:'pointer', fontSize:13}}>Адмін-панель →</button>
          <span>Політика конфіденційності</span>
          <span>Умови використання</span>
        </div>
      </div>
    </div>
  </footer>
);

// Quick booking modal
const QuickBookingModal = ({ onClose, onConfirm }) => {
  const [data, setData] = uS({ name:'', phone:'', service:'', notes:'' });
  const [errors, setErrors] = uS({});
  const submit = () => {
    const e = {};
    if (!data.name.trim()) e.name = 'Введіть ім\'я';
    if (!/^\+?[\d\s\-()]{10,}$/.test(data.phone)) e.phone = 'Невірний номер';
    if (!data.service) e.service = 'Оберіть послугу';
    setErrors(e);
    if (Object.keys(e).length === 0) onConfirm(data);
  };
  return (
    <div className="backdrop" onClick={onClose}>
      <div className="card pop" onClick={e=>e.stopPropagation()} style={{padding:32, maxWidth:480, width:'100%', position:'relative'}}>
        <button onClick={onClose} style={{position:'absolute', top:16, right:16, border:0, background:'var(--ink-100)', borderRadius:'50%', width:32, height:32, display:'grid', placeItems:'center', cursor:'pointer'}}><Icon name="x" size={16}/></button>
        <div className="chip chip-coral" style={{marginBottom:14}}>Швидкий запис</div>
        <h2 style={{fontSize:24, marginBottom:6}}>Залиште заявку</h2>
        <p style={{color:'var(--ink-500)', marginBottom:20, fontSize:14}}>Ми зателефонуємо протягом 15 хвилин і підберемо зручний час.</p>
        <div style={{display:'grid', gap:14}}>
          <div>
            <input className="input" placeholder="Ваше ім'я" value={data.name} onChange={e=>setData({...data, name:e.target.value})}/>
            {errors.name && <div className="field-error">{errors.name}</div>}
          </div>
          <div>
            <input className="input" placeholder="Телефон" value={data.phone} onChange={e=>setData({...data, phone:e.target.value})}/>
            {errors.phone && <div className="field-error">{errors.phone}</div>}
          </div>
          <div>
            <select className="input" value={data.service} onChange={e=>setData({...data, service:e.target.value})}>
              <option value="">Оберіть послугу</option>
              {SERVICES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {errors.service && <div className="field-error">{errors.service}</div>}
          </div>
          <textarea className="input" rows="2" placeholder="Коротко опишіть проблему (не обов'язково)" value={data.notes} onChange={e=>setData({...data, notes:e.target.value})}/>
          <button className="btn btn-primary btn-lg" onClick={submit}>Надіслати заявку</button>
        </div>
      </div>
    </div>
  );
};

// Login modal
const LoginModal = ({ onClose, onLogin }) => {
  const [tab, setTab] = uS('login');
  return (
    <div className="backdrop" onClick={onClose}>
      <div className="card pop" onClick={e=>e.stopPropagation()} style={{padding:32, maxWidth:420, width:'100%', position:'relative'}}>
        <button onClick={onClose} style={{position:'absolute', top:16, right:16, border:0, background:'var(--ink-100)', borderRadius:'50%', width:32, height:32, display:'grid', placeItems:'center', cursor:'pointer'}}><Icon name="x" size={16}/></button>
        <div style={{display:'flex', gap:6, padding:4, background:'var(--ink-100)', borderRadius:10, marginBottom:24}}>
          <button onClick={()=>setTab('login')} style={{flex:1, border:0, padding:'8px', borderRadius:8, background: tab==='login'?'var(--paper)':'transparent', fontWeight:600, fontSize:14, cursor:'pointer'}}>Вхід</button>
          <button onClick={()=>setTab('signup')} style={{flex:1, border:0, padding:'8px', borderRadius:8, background: tab==='signup'?'var(--paper)':'transparent', fontWeight:600, fontSize:14, cursor:'pointer'}}>Реєстрація</button>
        </div>
        {tab==='login' ? (
          <div style={{display:'grid', gap:14}}>
            <h2 style={{fontSize:22}}>Вхід у кабінет</h2>
            <input className="input" placeholder="Email або телефон"/>
            <input className="input" type="password" placeholder="Пароль"/>
            <button className="btn btn-primary" onClick={onLogin}>Увійти</button>
            <button className="btn btn-ghost btn-sm">Забули пароль?</button>
          </div>
        ) : (
          <div style={{display:'grid', gap:14}}>
            <h2 style={{fontSize:22}}>Створення акаунта</h2>
            <input className="input" placeholder="Ім'я"/>
            <input className="input" placeholder="Email"/>
            <input className="input" placeholder="Телефон"/>
            <input className="input" type="password" placeholder="Пароль"/>
            <button className="btn btn-primary" onClick={onLogin}>Зареєструватись</button>
          </div>
        )}
      </div>
    </div>
  );
};

// Cookie banner
const CookieBanner = ({ onAccept }) => (
  <div style={{position:'fixed', bottom:20, left:20, right:20, maxWidth:520, background:'var(--paper)', borderRadius:14, padding:18, boxShadow:'var(--shadow-lg)', zIndex:90, display:'flex', gap:14, alignItems:'flex-start'}} className="slide-right">
    <div style={{width:36, height:36, borderRadius:10, background:'var(--amber-100)', color:'var(--amber-400)', display:'grid', placeItems:'center', flexShrink:0}}>
      <Icon name="cookie"/>
    </div>
    <div style={{flex:1}}>
      <div style={{fontWeight:600, marginBottom:4}}>Ми використовуємо cookies</div>
      <div style={{fontSize:13, color:'var(--ink-500)'}}>Це допомагає покращувати сайт та запам'ятовувати ваші вподобання.</div>
    </div>
    <div style={{display:'flex', flexDirection:'column', gap:6}}>
      <button className="btn btn-primary btn-sm" onClick={onAccept}>Прийняти</button>
      <button className="btn btn-ghost btn-sm" onClick={onAccept}>Тільки необхідні</button>
    </div>
  </div>
);

// Main App router
export default function App() {
  const [route, setRoute] = uS('home');
  const [params, setParams] = uS({});
  const [admin, setAdmin] = uS(false);
  const [adminRoute, setAdminRoute] = uS('dashboard');
  const [adminRole, setAdminRole] = uS('admin');
  const [showBooking, setShowBooking] = uS(false);
  const [showLogin, setShowLogin] = uS(false);
  const [toast, setToast] = uS(null);
  const [showCookies, setShowCookies] = uS(true);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const go = (r, p = {}) => {
    setRoute(r); setParams(p);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Tweaks
  const [tweaks, setTweak] = useTweaks(TWEAKS_DEFAULTS);
  uE(() => {
    const root = document.documentElement;
    // Apply primary color
    if (tweaks.primaryColor) root.style.setProperty('--teal-600', tweaks.primaryColor);
    if (tweaks.accentColor) root.style.setProperty('--coral-500', tweaks.accentColor);
    root.style.setProperty('--radius-lg', tweaks.radius + 'px');
    root.style.setProperty('--font-display', `'${tweaks.headingFont}', system-ui, sans-serif`);
    root.style.setProperty('--font-body', `'${tweaks.bodyFont}', system-ui, sans-serif`);
  }, [tweaks]);

  if (admin) {
    const adminPages = {
      dashboard: <AdminDashboard role={adminRole}/>,
      calendar: <AdminCalendar/>,
      appointments: <AdminAppointments/>,
      clients: <AdminClients/>,
      pets: <AdminPets/>,
      doctors: <AdminDoctors/>,
      services: <AdminServices/>,
      articles: <AdminArticles/>,
      reports: <AdminReports/>,
      roles: <AdminRoles/>,
      settings: <AdminSettings/>,
    };
    return (
      <>
        <AdminLayout current={adminRoute} setRoute={setAdminRoute} role={adminRole} setRole={setAdminRole} exitAdmin={()=>setAdmin(false)}>
          {adminPages[adminRoute] || <AdminDashboard role={adminRole}/>}
        </AdminLayout>
        <TweaksPanel title="Tweaks">
          <TweakSection label="Кольори">
            <TweakColor label="Основний (teal)" value={tweaks.primaryColor} onChange={v=>setTweak('primaryColor', v)}/>
            <TweakColor label="Акцент (coral)" value={tweaks.accentColor} onChange={v=>setTweak('accentColor', v)}/>
          </TweakSection>
        </TweaksPanel>
      </>
    );
  }

  const publicPages = {
    home: <HomePage go={go} openBooking={()=>go('booking')}/>,
    services: <ServicesPage go={go} openBooking={()=>go('booking')}/>,
    service: <ServiceDetailPage go={go} openBooking={()=>go('booking')} params={params}/>,
    booking: <BookingPage go={go} showToast={showToast}/>,
    about: <AboutPage go={go} openBooking={()=>go('booking')}/>,
    contacts: <ContactsPage go={go} openBooking={()=>go('booking')} showToast={showToast}/>,
    prices: <PricesPage go={go} openBooking={()=>go('booking')}/>,
    articles: <ArticlesPage go={go}/>,
    article: <ArticlePage go={go} params={params}/>,
    profile: <ProfilePage go={go} openBooking={()=>go('booking')}/>,
  };

  return (
    <>
      <div data-screen-label={`PUBLIC · ${route}`}>
        <Header go={go} current={route} openBooking={()=>setShowBooking(true)} openLogin={()=>setShowLogin(true)}/>
        {publicPages[route] || <HomePage go={go} openBooking={()=>setShowBooking(true)}/>}
        <Footer go={go} openAdmin={()=>{ setAdmin(true); }}/>
      </div>

      {showBooking && <QuickBookingModal onClose={()=>setShowBooking(false)} onConfirm={()=>{ setShowBooking(false); showToast('Заявка надіслана! Ми зателефонуємо найближчим часом.'); }}/>}
      {showLogin && <LoginModal onClose={()=>setShowLogin(false)} onLogin={()=>{ setShowLogin(false); go('profile'); showToast('Ласкаво просимо!'); }}/>}
      {toast && <div className="toast"><Icon name="check" color="var(--green-500)"/> {toast}</div>}
      {showCookies && <CookieBanner onAccept={()=>setShowCookies(false)}/>}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Кольори">
          <TweakColor label="Основний" value={tweaks.primaryColor} onChange={v=>setTweak('primaryColor', v)}/>
          <TweakColor label="Акцент" value={tweaks.accentColor} onChange={v=>setTweak('accentColor', v)}/>
        </TweakSection>
        <TweakSection label="Радіуси">
          <TweakSlider label="Радіус карток" value={tweaks.radius} onChange={v=>setTweak('radius', v)} min={4} max={32} step={2}/>
        </TweakSection>
        <TweakSection label="Шрифти">
          <TweakSelect label="Заголовки" value={tweaks.headingFont} onChange={v=>setTweak('headingFont', v)} options={[
            {value:'Inter Tight', label:'Inter Tight'},
            {value:'Fraunces', label:'Fraunces (serif)'},
            {value:'Space Grotesk', label:'Space Grotesk'},
            {value:'Manrope', label:'Manrope'},
          ]}/>
        </TweakSection>
        <TweakSection label="Швидка дія">
          <TweakButton label="Відкрити адмінку" onClick={()=>setAdmin(true)}/>
          <TweakButton label="Швидкий запис" onClick={()=>setShowBooking(true)}/>
        </TweakSection>
      </TweaksPanel>
    </>
  );
}
