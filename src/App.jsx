// Main App
import React, { useState as uS, useEffect as uE } from "react";
import { createPortal } from "react-dom";
import { Icon, Logo } from "./components.jsx";
import { useStore } from "./store.jsx";
import { HomePage, ServicesPage, ServiceDetailPage } from "./pages-public.jsx";
import {
  BookingPage,
  AboutPage,
  ContactsPage,
  PricesPage,
  ArticlesPage,
  ArticlePage,
  ProfilePage,
} from "./pages-public-2.jsx";
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
  AdminMessages,
  AdminReports,
  AdminRoles,
  AdminSettings,
} from "./pages-admin.jsx";

const THEME = {
  primaryColor: "#7579EA",
  accentColor: "#ff7a45",
  radius: 14,
  headingFont: "Inter Tight",
  bodyFont: "Inter",
};

const Header = ({
  go,
  current,
  openBooking,
  openLogin,
  currentUser,
  logout,
}) => {
  const [menuOpen, setMenuOpen] = uS(false);
  const links = [
    { k: "home", l: "Головна", i: "home" },
    { k: "services", l: "Послуги", i: "heart" },
    { k: "prices", l: "Ціни", i: "money" },
    { k: "about", l: "Про клініку", i: "users" },
    { k: "articles", l: "Статті", i: "book" },
    { k: "contacts", l: "Контакти", i: "pin" },
  ];
  uE(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);
  const handleNav = (k) => {
    setMenuOpen(false);
    go(k);
  };
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--ink-100)",
        zIndex: 50,
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "var(--header-h)",
          gap: 24,
        }}
      >
        <button
          onClick={() => go("home")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            border: 0,
            background: "none",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              display: "grid",
              placeItems: "center",
            }}
          >
            <Logo size={36} color="var(--teal-600)" />
          </div>
          <div style={{ textAlign: "left" }}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 18,
                letterSpacing: "-0.02em",
              }}
            >
              UltraVet
            </div>
            <div
              style={{ fontSize: 11, color: "var(--ink-500)", marginTop: -2 }}
            >
              Ветклініка · Львів
            </div>
          </div>
        </button>
        <nav className="header-nav" style={{ display: "flex", gap: 4 }}>
          {links.map((l) => (
            <button
              key={l.k}
              onClick={() => go(l.k)}
              style={{
                padding: "8px 14px",
                border: 0,
                background: current === l.k ? "var(--ink-100)" : "transparent",
                borderRadius: 999,
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                color: current === l.k ? "var(--ink-900)" : "var(--ink-700)",
              }}
            >
              {l.l}
            </button>
          ))}
        </nav>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {currentUser ? (
            <>
              <button
                onClick={() => go("profile")}
                className="btn btn-ghost btn-sm header-cta-user"
                aria-label="Кабінет"
              >
                <Icon name="user" size={14} /> <span className="btn-label">Кабінет</span>
              </button>
              <button onClick={logout} className="btn btn-ghost btn-sm header-cta-user" aria-label="Вийти">
                <Icon name="logout" size={14} /> <span className="btn-label">Вийти</span>
              </button>
            </>
          ) : (
            <button onClick={openLogin} className="btn btn-ghost btn-sm header-cta-user" aria-label="Кабінет">
              <Icon name="user" size={14} /> <span className="btn-label">Кабінет</span>
            </button>
          )}
          <button onClick={openBooking} className="btn btn-primary btn-sm" aria-label="Записатись">
            <Icon name="calendar" size={14} /> <span className="btn-label">Записатись</span>
          </button>
          <button
            onClick={() => setMenuOpen(true)}
            className="header-burger"
            aria-label="Меню"
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              border: 0,
              background: "var(--ink-100)",
              color: "var(--ink-900)",
              display: "none",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Icon name="menu" size={18} />
          </button>
        </div>
      </div>
      {menuOpen && (
        <MobileMenu
          links={links}
          current={current}
          currentUser={currentUser}
          onNav={handleNav}
          onLogin={() => { setMenuOpen(false); openLogin(); }}
          onLogout={() => { setMenuOpen(false); logout(); }}
          onBooking={() => { setMenuOpen(false); openBooking(); }}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </header>
  );
};

const MobileMenu = ({ links, current, currentUser, onNav, onLogin, onLogout, onBooking, onClose }) => createPortal(
  <div
    onClick={onClose}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(11,33,32,0.5)",
      backdropFilter: "blur(4px)",
      WebkitBackdropFilter: "blur(4px)",
      zIndex: 100,
      animation: "fadeUp .2s ease both",
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: "min(86vw, 360px)",
        height: "100dvh",
        background: "var(--paper)",
        boxShadow: "-12px 0 40px rgba(11,33,32,0.18)",
        display: "flex",
        flexDirection: "column",
        animation: "slideRight .25s ease both",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 18px",
          borderBottom: "1px solid var(--ink-100)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logo size={32} color="var(--teal-600)" />
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 17,
              letterSpacing: "-0.02em",
            }}
          >
            UltraVet
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Закрити меню"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            border: 0,
            background: "var(--ink-100)",
            color: "var(--ink-900)",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
          }}
        >
          <Icon name="x" size={16} />
        </button>
      </div>
      <nav style={{ display: "flex", flexDirection: "column", padding: 14, gap: 4, overflowY: "auto", flex: 1 }}>
        {links.map((l) => (
          <button
            key={l.k}
            onClick={() => onNav(l.k)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 14px",
              borderRadius: 12,
              border: 0,
              background: current === l.k ? "var(--teal-50)" : "transparent",
              color: current === l.k ? "var(--teal-700)" : "var(--ink-900)",
              fontSize: 15,
              fontWeight: current === l.k ? 600 : 500,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: current === l.k ? "var(--teal-100)" : "var(--ink-100)",
                color: current === l.k ? "var(--teal-700)" : "var(--ink-700)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Icon name={l.i} size={16} />
            </span>
            {l.l}
          </button>
        ))}
      </nav>
      <div style={{ padding: 14, borderTop: "1px solid var(--ink-100)", display: "grid", gap: 8 }}>
        <button className="btn btn-primary btn-lg" onClick={onBooking}>
          <Icon name="calendar" size={16} color="#fff" /> Записатись
        </button>
        {currentUser ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button className="btn btn-outline" onClick={() => onNav("profile")}>
              <Icon name="user" size={14} /> Кабінет
            </button>
            <button className="btn btn-ghost" onClick={onLogout}>
              <Icon name="logout" size={14} /> Вийти
            </button>
          </div>
        ) : (
          <button className="btn btn-outline" onClick={onLogin}>
            <Icon name="user" size={14} /> Увійти в кабінет
          </button>
        )}
        <a
          href="tel:+380636798977"
          className="btn btn-ghost"
          style={{ justifyContent: "center" }}
        >
          <Icon name="phone" size={14} /> +380 63 679 89 77
        </a>
      </div>
    </div>
  </div>,
  document.body
);

const LegalModal = ({ kind, onClose }) => {
  const content = {
    privacy: {
      title: "Політика конфіденційності",
      body: [
        "UltraVet обробляє персональні дані клієнтів виключно для надання ветеринарних послуг: запис на прийом, ведення медичної картки тварини, звʼязок з власником.",
        "Дані зберігаються на захищених серверах і не передаються третім особам без вашої згоди, окрім випадків, передбачених законодавством України.",
        "Ви маєте право у будь-який момент запросити видалення свого акаунта та повʼязаних даних, написавши на hello@ultravet.ua.",
      ],
    },
    terms: {
      title: "Умови використання",
      body: [
        "Користуючись сайтом UltraVet, ви погоджуєтесь з тим, що інформація про послуги та ціни може змінюватись. Остаточну вартість підтверджує реєстратура під час запису.",
        "Скасування запису можливе не пізніше ніж за 2 години до візиту. Повторні неявки можуть бути підставою для відмови у подальших записах.",
        "У випадку ургентної ситуації телефонуйте на +380 63 679 89 77 — клініка приймає тяжкі випадки за попереднім звʼязком.",
      ],
    },
  }[kind];
  if (!content) return null;
  return (
    <div className="backdrop" onClick={onClose}>
      <div
        className="card pop quick-booking-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          padding: 32,
          maxWidth: 560,
          width: "100%",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            border: 0,
            background: "var(--ink-100)",
            borderRadius: "50%",
            width: 32,
            height: 32,
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
          }}
        >
          <Icon name="x" size={16} />
        </button>
        <h2 style={{ fontSize: 24, marginBottom: 16 }}>{content.title}</h2>
        <div
          style={{
            display: "grid",
            gap: 12,
            color: "var(--ink-700)",
            fontSize: 14,
            lineHeight: 1.6,
          }}
        >
          {content.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <div style={{ marginTop: 18, fontSize: 12, color: "var(--ink-500)" }}>
          Оновлено: {new Date().toLocaleDateString("uk-UA")}
        </div>
      </div>
    </div>
  );
};

const Footer = ({ go, openAdmin, openLegal }) => {
  const { settings } = useStore();
  const workingDays = settings.schedule.filter((row) => row.from !== "—" && row.to !== "—");
  const weekendDays = settings.schedule.filter((row) => row.from === "—" || row.to === "—");
  const shortDay = (day) =>
    ({
      Понеділок: "Пн",
      Вівторок: "Вт",
      Середа: "Ср",
      Четвер: "Чт",
      "Пʼятниця": "Пт",
      "П'ятниця": "Пт",
      Субота: "Сб",
      Неділя: "Нд",
    }[day] || day.slice(0, 2));
  const rangeLabel = (rows) => {
    if (!rows.length) return null;
    const first = rows[0];
    const last = rows[rows.length - 1];
    return `${shortDay(first.day)}${rows.length > 1 ? `–${shortDay(last.day)}` : ""} · ${first.from}–${first.to}`;
  };

  return (
    <footer
      style={{
        background: "var(--ink-950)",
        color: "#cfdcdb",
        padding: "56px 0 32px",
        marginTop: 0,
      }}
    >
    <div className="container">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
          gap: 32,
          marginBottom: 40,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                display: "grid",
                placeItems: "center",
              }}
            >
              <Logo size={36} color="#fff" />
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 20,
                color: "#fff",
              }}
            >
              UltraVet
            </div>
          </div>
          <p style={{ fontSize: 14, opacity: 0.7, maxWidth: 320 }}>
            Сучасна ветклініка у Львові з онлайн-записом, кабінетом власника
            тварини та зрозумілою медичною історією.
          </p>
        </div>
        <div>
          <div style={{ fontWeight: 600, color: "#fff", marginBottom: 12 }}>
            Навігація
          </div>
          <div style={{ display: "grid", gap: 8, fontSize: 14 }}>
            <button
              onClick={() => go("home")}
              style={{
                textAlign: "left",
                border: 0,
                background: "none",
                color: "inherit",
                padding: 0,
                cursor: "pointer",
              }}
            >
              Головна
            </button>
            <button
              onClick={() => go("services")}
              style={{
                textAlign: "left",
                border: 0,
                background: "none",
                color: "inherit",
                padding: 0,
                cursor: "pointer",
              }}
            >
              Послуги
            </button>
            <button
              onClick={() => go("about")}
              style={{
                textAlign: "left",
                border: 0,
                background: "none",
                color: "inherit",
                padding: 0,
                cursor: "pointer",
              }}
            >
              Про клініку
            </button>
            <button
              onClick={() => go("articles")}
              style={{
                textAlign: "left",
                border: 0,
                background: "none",
                color: "inherit",
                padding: 0,
                cursor: "pointer",
              }}
            >
              Статті
            </button>
            <button
              onClick={() => go("contacts")}
              style={{
                textAlign: "left",
                border: 0,
                background: "none",
                color: "inherit",
                padding: 0,
                cursor: "pointer",
              }}
            >
              Контакти
            </button>
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 600, color: "#fff", marginBottom: 12 }}>
            Контакти
          </div>
          <div style={{ display: "grid", gap: 8, fontSize: 14 }}>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(settings.clinic.address + ", Львів")}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "inherit" }}
            >
              {settings.clinic.address}
            </a>
            <div>Львів, 79000</div>
            <a href={`tel:${(settings.clinic.phone || "").replace(/\s|\(|\)|-/g, "")}`} style={{ color: "inherit" }}>
              {settings.clinic.phone}
            </a>
            <a href={`mailto:${settings.clinic.email}`} style={{ color: "inherit" }}>
              {settings.clinic.email}
            </a>
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 600, color: "#fff", marginBottom: 12 }}>
            Графік
          </div>
          <div style={{ display: "grid", gap: 8, fontSize: 14 }}>
            {rangeLabel(workingDays) && <div>{rangeLabel(workingDays)}</div>}
            {weekendDays.length > 0 && (
              <div>{shortDay(weekendDays[0].day)}–{shortDay(weekendDays[weekendDays.length - 1].day)} · за попереднім записом</div>
            )}
            <div style={{ color: "var(--coral-300)", marginTop: 8 }}>
              Ургентна допомога 24/7
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          paddingTop: 24,
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 14,
          fontSize: 13,
          opacity: 0.6,
        }}
      >
        <div>© {new Date().getFullYear()} UltraVet. Всі права захищені.</div>
        <div style={{ display: "flex", gap: 18 }}>
          <button
            onClick={openAdmin}
            style={{
              border: 0,
              background: "none",
              color: "var(--teal-300)",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Адмін-панель →
          </button>
          <button
            onClick={() => openLegal("privacy")}
            style={{
              border: 0,
              background: "none",
              color: "inherit",
              cursor: "pointer",
              fontSize: 13,
              padding: 0,
            }}
          >
            Політика конфіденційності
          </button>
          <button
            onClick={() => openLegal("terms")}
            style={{
              border: 0,
              background: "none",
              color: "inherit",
              cursor: "pointer",
              fontSize: 13,
              padding: 0,
            }}
          >
            Умови використання
          </button>
        </div>
      </div>
    </div>
    </footer>
  );
};

// Quick booking modal
const QuickBookingModal = ({ onClose, onConfirm, services }) => {
  const [data, setData] = uS({ name: "", phone: "", service: "", notes: "" });
  const [errors, setErrors] = uS({});
  const submit = () => {
    const e = {};
    if (!data.name.trim()) e.name = "Введіть ім'я";
    if (!/^\+?[\d\s\-()]{10,}$/.test(data.phone)) e.phone = "Невірний номер";
    if (!data.service) e.service = "Оберіть послугу";
    setErrors(e);
    if (Object.keys(e).length === 0) onConfirm(data);
  };
  return (
    <div className="backdrop" onClick={onClose}>
      <div
        className="card pop"
        onClick={(e) => e.stopPropagation()}
        style={{
          padding: 32,
          maxWidth: 480,
          width: "100%",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            border: 0,
            background: "var(--ink-100)",
            borderRadius: "50%",
            width: 32,
            height: 32,
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
          }}
        >
          <Icon name="x" size={16} />
        </button>
        <div className="chip chip-coral" style={{ marginBottom: 14 }}>
          Швидкий запис
        </div>
        <h2 style={{ fontSize: 24, marginBottom: 6 }}>Залиште заявку</h2>
        <p style={{ color: "var(--ink-500)", marginBottom: 20, fontSize: 14 }}>
          Ми зателефонуємо протягом 15 хвилин і підберемо зручний час.
        </p>
        <div className="quick-booking-fields" style={{ display: "grid", gap: 14 }}>
          <div>
            <input
              className="input"
              placeholder="Ваше ім'я"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
            />
            {errors.name && <div className="field-error">{errors.name}</div>}
          </div>
          <div>
            <input
              className="input"
              placeholder="Телефон"
              value={data.phone}
              onChange={(e) => setData({ ...data, phone: e.target.value })}
            />
            {errors.phone && <div className="field-error">{errors.phone}</div>}
          </div>
          <div>
            <select
              className="input"
              value={data.service}
              onChange={(e) => setData({ ...data, service: e.target.value })}
            >
              <option value="">Оберіть послугу</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {errors.service && (
              <div className="field-error">{errors.service}</div>
            )}
          </div>
          <textarea
            className="input"
            rows="2"
            placeholder="Коротко опишіть проблему (не обов'язково)"
            value={data.notes}
            onChange={(e) => setData({ ...data, notes: e.target.value })}
          />
          <button className="btn btn-primary btn-lg quick-booking-submit" onClick={submit}>
            Надіслати заявку
          </button>
        </div>
      </div>
    </div>
  );
};

// Login modal
const LoginModal = ({ onClose, onLogin, onRegister }) => {
  const [tab, setTab] = uS("login");
  const [form, setForm] = uS({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = uS("");
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = () => {
    setError("");
    if (tab === "signup" && !form.name.trim()) return setError("Введіть імʼя");
    if (!form.email.trim() && !form.phone.trim())
      return setError("Введіть email або телефон");
    if (!form.password.trim()) return setError("Введіть пароль");
    if (tab === "signup") {
      const result = onRegister(form);
      if (!result?.ok) {
        return setError(
          result?.reason === "duplicate"
            ? "Користувач з таким email або телефоном вже зареєстрований"
            : "Перевірте дані для реєстрації",
        );
      }
      return;
    }
    if (!onLogin(form)) setError("Невірний логін або пароль");
  };
  return (
    <div className="backdrop" onClick={onClose}>
      <div
        className="card pop"
        onClick={(e) => e.stopPropagation()}
        style={{
          padding: "56px 32px 32px",
          maxWidth: 420,
          width: "100%",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Закрити"
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            border: 0,
            background: "var(--ink-100)",
            borderRadius: "50%",
            width: 36,
            height: 36,
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
          }}
        >
          <Icon name="x" size={16} />
        </button>
        <div
          style={{
            display: "flex",
            gap: 6,
            padding: 4,
            background: "var(--ink-100)",
            borderRadius: 10,
            marginBottom: 24,
          }}
        >
          <button
            onClick={() => setTab("login")}
            style={{
              flex: 1,
              border: 0,
              padding: "8px",
              borderRadius: 8,
              background: tab === "login" ? "var(--paper)" : "transparent",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Вхід
          </button>
          <button
            onClick={() => setTab("signup")}
            style={{
              flex: 1,
              border: 0,
              padding: "8px",
              borderRadius: 8,
              background: tab === "signup" ? "var(--paper)" : "transparent",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Реєстрація
          </button>
        </div>
        {tab === "login" ? (
          <div style={{ display: "grid", gap: 14 }}>
            <h2 style={{ fontSize: 22 }}>Вхід у кабінет</h2>
            <input
              className="input"
              placeholder="Email або телефон"
              autoComplete="username"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
            <input
              className="input"
              type="password"
              placeholder="Пароль"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
            />
            {error && <div className="field-error">{error}</div>}
            <button className="btn btn-primary" onClick={submit}>
              Увійти
            </button>
            <button className="btn btn-ghost btn-sm">Забули пароль?</button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            <h2 style={{ fontSize: 22 }}>Створення акаунта</h2>
            <input
              className="input"
              placeholder="Ім'я"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
            <input
              className="input"
              placeholder="Email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
            <input
              className="input"
              placeholder="Телефон"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
            <input
              className="input"
              type="password"
              placeholder="Пароль"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
            />
            {error && <div className="field-error">{error}</div>}
            <button className="btn btn-primary" onClick={submit}>
              Зареєструватись
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminLoginModal = ({ onClose, onConfirm }) => {
  const [password, setPassword] = uS("");
  const [error, setError] = uS("");
  const submit = () => {
    setError("");
    if (!onConfirm(password)) setError("Невірний пароль адміністратора");
  };
  return (
    <div className="backdrop" onClick={onClose}>
      <div
        className="card pop"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: 28, maxWidth: 380, width: "100%" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--teal-50)", color: "var(--teal-700)", display: "grid", placeItems: "center" }}>
            <Icon name="shield" size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: 22 }}>Вхід в адмінку</h2>
            <div style={{ fontSize: 13, color: "var(--ink-500)" }}>
              Введіть пароль адміністратора.
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          <input
            className="input"
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            autoFocus
          />
          {error && <div className="field-error">{error}</div>}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn btn-ghost" onClick={onClose}>Скасувати</button>
            <button className="btn btn-primary" onClick={submit}>Увійти</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Cookie banner
const CookieBanner = ({ onAccept }) => (
  <div
    style={{
      position: "fixed",
      bottom: 20,
      left: 20,
      right: 20,
      maxWidth: 520,
      background: "var(--paper)",
      borderRadius: 14,
      padding: 18,
      boxShadow: "var(--shadow-lg)",
      zIndex: 90,
      display: "flex",
      gap: 14,
      alignItems: "flex-start",
    }}
    className="slide-right cookie-banner"
  >
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        background: "var(--amber-100)",
        color: "var(--amber-700)",
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
      }}
    >
      <Icon name="cookie" />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>
        Ми використовуємо cookies
      </div>
      <div style={{ fontSize: 13, color: "var(--ink-500)" }}>
        Це допомагає покращувати сайт та запам'ятовувати ваші вподобання.
      </div>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <button className="btn btn-primary btn-sm" onClick={onAccept}>
        Прийняти
      </button>
      <button className="btn btn-ghost btn-sm" onClick={onAccept}>
        Тільки необхідні
      </button>
    </div>
  </div>
);

// Main App router
export default function App() {
  const store = useStore();
  const [route, setRoute] = uS("home");
  const [params, setParams] = uS({});
  const [admin, setAdmin] = uS(false);
  const [adminRoute, setAdminRoute] = uS("dashboard");
  const [adminRole, setAdminRole] = uS("admin");
  const [adminSearch, setAdminSearch] = uS("");
  const [showBooking, setShowBooking] = uS(false);
  const [showLogin, setShowLogin] = uS(false);
  const [showAdminLogin, setShowAdminLogin] = uS(false);
  const [legalKind, setLegalKind] = uS(null);
  const [toast, setToast] = uS(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const go = (r, p = {}) => {
    setRoute(r);
    setParams(p);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const openAdmin = () => {
    if (window.sessionStorage.getItem("ultravet:admin-authed") === "1") {
      setAdmin(true);
      return;
    }
    setShowAdminLogin(true);
  };

  const confirmAdmin = (password) => {
    if (password !== (store.settings?.adminPassword || "admin")) return false;
    window.sessionStorage.setItem("ultravet:admin-authed", "1");
    setShowAdminLogin(false);
    setAdmin(true);
    return true;
  };

  const ADMIN_ROUTE_ACCESS = {
    admin: ["dashboard","calendar","appointments","clients","pets","doctors","services","articles","messages","reports","roles","settings"],
    doctor: ["dashboard","calendar","appointments","pets","articles"],
    receptionist: ["dashboard","calendar","appointments","clients","pets","messages"],
  };
  const allowedAdminRoutes = ADMIN_ROUTE_ACCESS[adminRole] || ADMIN_ROUTE_ACCESS.admin;
  const canAccessAdminRoute = (route) => allowedAdminRoutes.includes(route);

  uE(() => {
    const root = document.documentElement;
    // Brand palette derived from THEME.primaryColor (#7579EA)
    const brand = {
      "--teal-50":  "#f1f2fc",
      "--teal-100": "#e0e2f8",
      "--teal-200": "#c4c7f1",
      "--teal-300": "#a5a9ea",
      "--teal-400": "#8b8fe4",
      "--teal-500": "#7579ea",
      "--teal-600": THEME.primaryColor,
      "--teal-700": "#4a4eb6",
      "--teal-800": "#393c8e",
      "--teal-900": "#2a2c66",
      "--coral-500": THEME.accentColor,
      // Bump secondary text to AA contrast on light bg
      "--ink-500": "#586d6c",
      "--radius-lg": THEME.radius + "px",
      "--font-display": `'${THEME.headingFont}', system-ui, sans-serif`,
      "--font-body": `'${THEME.bodyFont}', system-ui, sans-serif`,
    };
    Object.entries(brand).forEach(([k, v]) => root.style.setProperty(k, v));
  }, []);

  if (admin) {
    const adminPages = {
      dashboard: (
        <AdminDashboard
          role={adminRole}
          search={adminSearch}
          setRoute={setAdminRoute}
        />
      ),
      calendar: <AdminCalendar search={adminSearch} notify={showToast} />,
      appointments: <AdminAppointments search={adminSearch} notify={showToast} />,
      clients: <AdminClients search={adminSearch} notify={showToast} />,
      pets: <AdminPets search={adminSearch} notify={showToast} />,
      doctors: <AdminDoctors search={adminSearch} notify={showToast} />,
      services: <AdminServices search={adminSearch} notify={showToast} />,
      articles: <AdminArticles search={adminSearch} notify={showToast} />,
      messages: <AdminMessages search={adminSearch} notify={showToast} />,
      reports: <AdminReports notify={showToast} />,
      roles: <AdminRoles notify={showToast} />,
      settings: <AdminSettings notify={showToast} />,
    };
    const effectiveRoute = canAccessAdminRoute(adminRoute) ? adminRoute : allowedAdminRoutes[0];
    const forbiddenView = (
      <div style={{maxWidth:680, background:'#0f2120', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, padding:24}}>
        <h2 style={{fontSize:24, color:'#fff', marginBottom:8}}>Доступ обмежено</h2>
        <p style={{color:'#8aa6a4', fontSize:14}}>У ролі «{adminRole === 'admin' ? 'Адміністратор' : adminRole === 'doctor' ? 'Лікар' : 'Реєстратор'}» ця сторінка недоступна.</p>
      </div>
    );
    return (
      <>
        <AdminLayout
          current={effectiveRoute}
          setRoute={(route) => setAdminRoute(canAccessAdminRoute(route) ? route : (allowedAdminRoutes[0] || "dashboard"))}
          role={adminRole}
          setRole={setAdminRole}
          exitAdmin={() => setAdmin(false)}
          search={adminSearch}
          setSearch={setAdminSearch}
          allowedRoutes={allowedAdminRoutes}
        >
          {canAccessAdminRoute(adminRoute) ? (adminPages[adminRoute] || (
            <AdminDashboard
              role={adminRole}
              search={adminSearch}
              setRoute={setAdminRoute}
            />
          )) : forbiddenView}
        </AdminLayout>
        {toast && (
          <div className="toast">
            <Icon name="check" color="var(--green-500)" /> {toast}
          </div>
        )}
      </>
    );
  }

  const publicPages = {
    home: <HomePage go={go} openBooking={() => go("booking")} />,
    services: <ServicesPage go={go} openBooking={() => go("booking")} />,
    service: (
      <ServiceDetailPage
        go={go}
        openBooking={() => go("booking")}
        params={params}
      />
    ),
    booking: <BookingPage go={go} showToast={showToast} />,
    about: <AboutPage go={go} openBooking={() => go("booking")} />,
    contacts: (
      <ContactsPage
        go={go}
        openBooking={() => go("booking")}
        showToast={showToast}
      />
    ),
    prices: <PricesPage go={go} openBooking={() => go("booking")} />,
    articles: <ArticlesPage go={go} />,
    article: <ArticlePage go={go} params={params} />,
    profile: <ProfilePage go={go} openBooking={() => go("booking")} openLogin={() => setShowLogin(true)} showToast={showToast} />,
  };

  return (
    <>
      <div data-screen-label={`PUBLIC · ${route}`}>
        <Header
          go={go}
          current={route}
          openBooking={() => setShowBooking(true)}
          openLogin={() => setShowLogin(true)}
          currentUser={store.currentUser}
          logout={() => {
            store.logout();
            showToast("Ви вийшли з кабінету.");
          }}
        />
        {publicPages[route] || (
          <HomePage go={go} openBooking={() => setShowBooking(true)} />
        )}
        <Footer
          go={go}
          openAdmin={openAdmin}
          openLegal={setLegalKind}
        />
      </div>

      {showBooking && (
        <QuickBookingModal
          services={store.services}
          onClose={() => setShowBooking(false)}
          onConfirm={(data) => {
            const result = store.addAppointment({
              ...data,
              serviceName: store.services.find((s) => s.id === data.service)
                ?.name,
              pet: "Швидкий запис",
              petType: "Інше",
            });
            if (!result.ok) {
              showToast(result.error);
              return;
            }
            setShowBooking(false);
            showToast("Заявка надіслана! Ми зателефонуємо найближчим часом.");
          }}
        />
      )}
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLogin={(data) => {
            if (!store.login(data)) return false;
            setShowLogin(false);
            go("profile");
            showToast("Ласкаво просимо!");
            return true;
          }}
          onRegister={(data) => {
            const result = store.register(data);
            if (!result?.ok) return result;
            setShowLogin(false);
            go("profile");
            showToast("Акаунт створено!");
            return result;
          }}
        />
      )}
      {showAdminLogin && (
        <AdminLoginModal
          onClose={() => setShowAdminLogin(false)}
          onConfirm={confirmAdmin}
        />
      )}
      {legalKind && (
        <LegalModal kind={legalKind} onClose={() => setLegalKind(null)} />
      )}
      {toast && (
        <div className="toast">
          <Icon name="check" color="var(--green-500)" /> {toast}
        </div>
      )}
      {!store.cookiesAccepted && (
        <CookieBanner onAccept={store.acceptCookies} />
      )}
    </>
  );
}
