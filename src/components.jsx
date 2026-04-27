import React from 'react';

// Icons + shared atoms
export const Icon = ({ name, size = 18, color = 'currentColor', strokeWidth = 1.8 }) => {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    paw: <><circle cx="5" cy="11" r="2"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="6" r="2"/><circle cx="19" cy="11" r="2"/><path d="M8 14c0-2 2-4 4-4s4 2 4 4 .5 5-4 5-4-3-4-5z"/></>,
    heart: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>,
    scalpel: <><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.12 8.12L20 20"/><path d="M14.8 14.8L20 4"/><path d="M8.12 15.88L12 12"/></>,
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

// UltraVet logo mark — paw silhouette from logo-ultravet.svg
export const Logo = ({ size = 36, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 697 736" xmlns="http://www.w3.org/2000/svg" aria-label="UltraVet">
    <path fill={color} d="M304.2 0.933425C304.067 1.20009 303.667 26.2668 303.133 56.6668L302.2 112L298.6 122.667C296.6 128.533 294.067 134.8 292.867 136.667C291.4 138.933 291.133 139.2 291.667 137.333C293.533 131.733 294.067 98.6668 292.467 93.6001C290.733 88.6668 288.333 85.3334 264.867 56.5334C257.533 47.4668 248.867 36.2668 245.667 31.6001C240.733 24.6668 239.533 23.6001 238.467 25.6001C236.6 28.9334 236.867 77.3334 238.867 95.3334C239.8 103.733 242.2 119.333 244.2 130C247.4 147.333 248.067 149.333 250.467 149.067C251.8 148.933 256.067 148.4 259.667 148C266.2 147.2 266.067 147.333 250.333 155.6C222.467 170.4 200.067 187.067 183.133 206C170.2 220.4 168.6 223.467 165.533 238.267C164.2 244.8 161.8 252.8 160.067 256.133C156.733 262.8 147.133 272.267 138.333 277.467C131.267 281.467 83.5333 303.067 44.8666 319.6C13.5333 332.933 4.73327 337.867 1.79993 343.867C-0.466733 348.8 1.39993 355.733 7.39993 363.6C12.5999 370.4 16.8666 371.333 27.6666 368C35.9333 365.333 40.5999 360.8 42.9999 353.333C45.1333 346.667 46.3333 349.2 44.4666 356.4C41.9333 365.467 34.8666 373.467 23.7999 380C21.6666 381.2 22.3333 382.4 29.5333 390.133C41.2666 403.067 62.3333 416.8 77.9333 421.733C95.2666 427.333 105.533 429.067 121.667 429.067C138.333 428.933 152.067 426.667 182.067 418.533C194.467 415.2 204.867 412.667 205.133 413.067C206.2 414.133 184.867 423.067 172.6 426.8C165.8 428.8 160.733 430.933 161.267 431.333C162.867 432.8 180.6 435.333 188.467 435.333C192.333 435.333 200.6 434.667 206.733 433.733C217 432.267 218.2 432.267 222.733 434.667C230.867 439.067 233 444.533 232.867 460C232.867 470.533 231.667 477.867 227.8 494.667C223.133 514.267 222.6 518.133 221.933 540.933C221.533 557.733 221.8 566 222.6 566C223.4 566 224.467 563.867 224.867 561.2C227.8 545.6 246.067 508 261.267 486.4C275.933 465.333 286.467 454.267 308.2 437.067C318.867 428.533 332.333 417.067 338.2 411.467C350.2 399.867 366.467 378.667 371.133 368.8C372.867 365.2 374.733 362.133 375.267 362C377.533 361.867 383.667 388.533 385.133 404.8L386.067 414.933L396.467 415.733C428.733 418.267 451.8 431.733 463.133 454.8C470.467 469.467 476.333 476 489.8 483.867C495.933 487.467 502.867 491.867 505.267 493.6C510.467 497.467 512.2 503.867 509.267 509.467C508.2 511.6 507 517.867 506.733 523.333C505.667 540.133 496.333 558.267 484.867 565.867C479.133 569.6 475 571.067 452.333 577.2C412.067 588.267 391.267 609.867 382.067 650.667C379.133 663.867 378.867 701.067 381.533 721.733L383.267 735.467L390.2 727.733C407.8 707.733 425.667 693.867 449.667 681.467C480.467 665.6 507.267 656.667 567.667 642C612.867 631.067 632.733 624.533 655.4 613.2C668.333 606.667 685.267 595.333 691.4 588.933L696.6 583.6L680.333 571.333C641.667 541.867 611 510.267 584.067 472.267C564.733 444.933 551.533 421.733 521.667 362C491 300.8 477.133 276.933 453.4 244.4L446.867 235.6L446.467 218.4C445.8 191.6 438.6 169.2 423.133 145.867C413.933 132 406.6 123.333 377.933 93.3334C350.733 64.6668 325.4 32.8001 311.667 9.73343C307.133 2.00009 304.867 -0.533242 304.2 0.933425ZM219.4 254.933C224.333 256.933 228.333 259.067 228.333 259.6C228.333 261.6 214.467 271.333 211.533 271.333C206.333 271.333 203.267 266.667 202.733 257.733L202.333 249.733L206.467 250.4C208.733 250.8 214.6 252.8 219.4 254.933Z"/>
    <path fill={color} d="M435.667 469.867C433.533 471.333 430.333 473.6 428.6 474.933L425.533 477.467L433 482.533C442.867 489.067 446.467 490.4 449.8 488.667C453.267 486.8 453.267 477.467 449.667 471.6C446.6 466.533 441.8 466 435.667 469.867Z"/>
  </svg>
);

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

