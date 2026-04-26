import React from 'react';

// Icons + shared atoms
export const Icon = ({ name, size = 18, color = 'currentColor', strokeWidth = 1.8 }) => {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    paw: <><circle cx="5" cy="11" r="2"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="6" r="2"/><circle cx="19" cy="11" r="2"/><path d="M8 14c0-2 2-4 4-4s4 2 4 4 .5 5-4 5-4-3-4-5z"/></>,
    heart: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>,
    scalpel: <><path d="M14.5 3.5L21 10l-7 7-2.5-2.5"/><path d="M11.5 14.5L3 21"/></>,
    tooth: <path d="M12 5.5c-3 0-5 1-7 2 0 4 1 12 3 13s2-5 4-5 2 6 4 5 3-9 3-13c-2-1-4-2-7-2z"/>,
    flask: <><path d="M9 3h6"/><path d="M10 3v6L4 19a2 2 0 0 0 1.7 3h12.6A2 2 0 0 0 20 19l-6-10V3"/><path d="M7 14h10"/></>,
    wave: <><path d="M2 12c2 0 2-3 4-3s2 6 4 6 2-9 4-9 2 9 4 9 2-3 4-3"/></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></>,
    sparkle: <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z M19 14l.7 2.3L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.7z"/>,
    shield: <><path d="M12 2l9 4v6c0 5-4 9-9 10-5-1-9-5-9-10V6z"/><path d="M9 12l2 2 4-4"/></>,
    home: <><path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-7 8-7s8 3 8 7"/></>,
    users: <><circle cx="9" cy="8" r="3.5"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M15 20c0-2.5 1.8-4 4-4s2 1 2 1"/></>,
    phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>,
    mail: <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 7l10 7 10-7"/></>,
    pin: <><path d="M12 22s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></>,
    arrowRight: <><path d="M5 12h14"/><path d="M13 5l7 7-7 7"/></>,
    arrowLeft: <><path d="M19 12H5"/><path d="M11 5l-7 7 7 7"/></>,
    chevDown: <path d="M6 9l6 6 6-6"/>,
    chevRight: <path d="M9 6l6 6-6 6"/>,
    chevLeft: <path d="M15 6l-6 6 6 6"/>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    check: <path d="M20 6L9 17l-5-5"/>,
    x: <><path d="M18 6L6 18M6 6l12 12"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></>,
    filter: <path d="M3 5h18M6 12h12M10 19h4"/>,
    bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9z"/><path d="M10 21a2 2 0 0 0 4 0"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>,
    chart: <><path d="M3 3v18h18"/><path d="M7 14l3-3 3 3 5-5"/></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></>,
    activity: <path d="M22 12h-4l-3 9-6-18-3 9H2"/>,
    money: <><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></>,
    edit: <><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></>,
    trash: <><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14"/></>,
    book: <><path d="M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4z"/><path d="M4 16h16"/></>,
    cookie: <><circle cx="12" cy="12" r="9"/><circle cx="9" cy="9" r="1"/><circle cx="14" cy="11" r="1"/><circle cx="10" cy="15" r="1"/><circle cx="15" cy="15" r="1"/></>,
    menu: <path d="M3 6h18M3 12h18M3 18h18"/>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    list: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>,
    play: <path d="M5 3l14 9-14 9z"/>,
    pause: <><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></>,
  };
  return <svg {...props}>{paths[name]}</svg>;
};

// Geometric pet illustration placeholder
export const PetIllustration = ({ kind = 'cat', color = 'teal', size = 120 }) => {
  const colors = {
    teal: { bg: 'var(--teal-100)', fg: 'var(--teal-600)', ac: 'var(--teal-700)' },
    coral: { bg: 'var(--coral-100)', fg: 'var(--coral-600)', ac: 'var(--coral-700)' },
    amber: { bg: 'var(--amber-100)', fg: '#b87a09', ac: '#8a6a13' },
    rose: { bg: 'var(--rose-100)', fg: 'var(--rose-500)', ac: '#98253a' },
    violet: { bg: 'var(--violet-100)', fg: 'var(--violet-500)', ac: '#4b3995' },
    green: { bg: 'var(--green-100)', fg: 'var(--green-500)', ac: '#0e6a48' },
  }[color];
  if (kind === 'cat') {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <rect width="120" height="120" rx="20" fill={colors.bg}/>
        <polygon points="35,55 45,30 55,55" fill={colors.fg}/>
        <polygon points="65,55 75,30 85,55" fill={colors.fg}/>
        <ellipse cx="60" cy="70" rx="28" ry="25" fill={colors.fg}/>
        <circle cx="50" cy="68" r="3" fill={colors.ac}/>
        <circle cx="70" cy="68" r="3" fill={colors.ac}/>
        <path d="M55 78 Q60 82 65 78" stroke={colors.ac} strokeWidth="2" fill="none" strokeLinecap="round"/>
        <circle cx="60" cy="76" r="1.5" fill={colors.ac}/>
      </svg>
    );
  }
  if (kind === 'dog') {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <rect width="120" height="120" rx="20" fill={colors.bg}/>
        <ellipse cx="40" cy="55" rx="10" ry="18" fill={colors.fg}/>
        <ellipse cx="80" cy="55" rx="10" ry="18" fill={colors.fg}/>
        <ellipse cx="60" cy="72" rx="28" ry="24" fill={colors.fg}/>
        <ellipse cx="60" cy="84" rx="14" ry="10" fill={colors.bg}/>
        <circle cx="50" cy="68" r="3" fill={colors.ac}/>
        <circle cx="70" cy="68" r="3" fill={colors.ac}/>
        <ellipse cx="60" cy="83" rx="3" ry="2.5" fill={colors.ac}/>
      </svg>
    );
  }
  if (kind === 'rabbit') {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <rect width="120" height="120" rx="20" fill={colors.bg}/>
        <ellipse cx="48" cy="40" rx="6" ry="20" fill={colors.fg}/>
        <ellipse cx="72" cy="40" rx="6" ry="20" fill={colors.fg}/>
        <circle cx="60" cy="72" r="26" fill={colors.fg}/>
        <circle cx="50" cy="68" r="3" fill={colors.ac}/>
        <circle cx="70" cy="68" r="3" fill={colors.ac}/>
        <ellipse cx="60" cy="78" rx="3" ry="2" fill={colors.ac}/>
      </svg>
    );
  }
};

// Avatar for people
export const Avatar = ({ name = '', size = 40, color }) => {
  const initials = name.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase();
  const palette = ['teal','coral','amber','violet','green','rose'];
  const c = color || palette[name.charCodeAt(0) % palette.length];
  const colors = {
    teal: ['#d1f4f1','#0e7a78'], coral: ['#ffe0d2','#c84614'], amber: ['#fdecc4','#8a6a13'],
    violet: ['#ece6fb','#4b3995'], green: ['#d8f4e6','#0e6a48'], rose: ['#fde2e6','#98253a'],
  }[c];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: colors[0], color: colors[1],
      display: 'grid', placeItems: 'center',
      fontWeight: 700, fontSize: size * 0.38, flexShrink: 0,
      letterSpacing: '-0.02em',
    }}>{initials}</div>
  );
};

// Status pill
export const StatusPill = ({ status }) => {
  const map = {
    confirmed:    { c: 'teal', t: 'Підтверджено' },
    'in-progress':{ c: 'amber', t: 'На прийомі' },
    waiting:      { c: 'violet', t: 'Очікує' },
    completed:    { c: 'green', t: 'Завершено' },
    cancelled:    { c: 'rose', t: 'Скасовано' },
    active:       { c: 'green', t: 'Активний' },
    new:          { c: 'amber', t: 'Новий' },
  };
  const m = map[status] || { c: 'teal', t: status };
  return <span className={`chip chip-${m.c}`}>{m.t}</span>;
};

// Star rating
export const Stars = ({ rating, size = 14 }) => (
  <div style={{display:'inline-flex', gap:2}}>
    {[1,2,3,4,5].map(i => (
      <Icon key={i} name="star" size={size} color={i <= rating ? 'var(--amber-400)' : 'var(--ink-200)'}/>
    ))}
  </div>
);

