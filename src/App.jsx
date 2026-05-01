// Main App
import React, { useState as uS, useEffect as uE, useMemo as uM } from "react";
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

const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/['’"`]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

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
          <div style={{ display: "grid", gap: 8, fontSize: 15 }}>
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
const TG_BOT = import.meta.env.VITE_TG_BOT_USERNAME || "";
const VIBER_BOT = import.meta.env.VITE_VIBER_BOT_NAME || "UltraVet";

const LoginModal = ({ onClose, onSuccess }) => {
  const [method, setMethod] = uS("email");
  const [emailTab, setEmailTab] = uS("login");
  const [form, setForm] = uS({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [tgCode, setTgCode] = uS("");
  const [viberCode, setViberCode] = uS("");
  const [error, setError] = uS("");
  const [loading, setLoading] = uS(false);
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submitTelegram = async () => {
    setError("");
    if (!tgCode.trim()) return setError("Введіть код з бота");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/telegram-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code: tgCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Невірний код");
      onSuccess(data.user, data.isNew, data.accessToken);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const submitEmail = async () => {
    setError("");
    if (emailTab === "signup" && !form.name.trim()) return setError("Введіть імʼя");
    if (emailTab === "signup" && !form.email.trim()) return setError("Введіть email");
    if (emailTab === "login" && !form.email.trim() && !form.phone.trim()) return setError("Введіть email або телефон");
    if (!form.password.trim()) return setError("Введіть пароль");
    if (emailTab === "signup" && form.password !== form.confirmPassword) return setError("Паролі не збігаються");
    setLoading(true);
    try {
      const url = emailTab === "signup" ? "/api/auth/register" : "/api/auth/login";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data.error || `Помилка сервера (${res.status})`);
      onSuccess(data.user, data.isNew, data.accessToken);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const submitViber = async () => {
    setError("");
    if (!viberCode.trim()) return setError("Введіть код з Viber");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/viber-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code: viberCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Невірний код");
      onSuccess(data.user, data.isNew, data.accessToken);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const tabBtn = (k, label) => (
    <button
      key={k}
      onClick={() => { setMethod(k); setError(""); }}
      style={{
        flex: 1, border: 0, padding: "8px", borderRadius: 8,
        background: method === k ? "var(--paper)" : "transparent",
        fontWeight: 600, fontSize: 13, cursor: "pointer",
      }}
    >{label}</button>
  );

  return (
    <div className="backdrop" onClick={onClose}>
      <div className="card pop" onClick={(e) => e.stopPropagation()}
        style={{ padding: "56px 32px 32px", maxWidth: 420, width: "100%", position: "relative" }}
      >
        <button onClick={onClose} aria-label="Закрити"
          style={{ position: "absolute", top: 18, right: 18, border: 0, background: "var(--ink-100)", borderRadius: "50%", width: 36, height: 36, display: "grid", placeItems: "center", cursor: "pointer" }}
        ><Icon name="x" size={16} /></button>

        <div style={{ display: "flex", gap: 6, padding: 4, background: "var(--ink-100)", borderRadius: 10, marginBottom: 24 }}>
          {tabBtn("email", "Email")}
          {tabBtn("telegram", "Telegram")}
          {tabBtn("viber", "Viber")}
        </div>

        {method === "email" && (
          <>
            <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
              {["login", "signup"].map((t) => (
                <button key={t} onClick={() => { setEmailTab(t); setError(""); }}
                  style={{ flex: 1, border: 0, padding: "6px 8px", borderRadius: 8, background: emailTab === t ? "var(--teal-600)" : "transparent", color: emailTab === t ? "#fff" : "inherit", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                >{t === "login" ? "Вхід" : "Реєстрація"}</button>
              ))}
            </div>
            <div style={{ display: "grid", gap: 14 }}>
              <h2 style={{ fontSize: 22 }}>{emailTab === "login" ? "Вхід у кабінет" : "Створення акаунта"}</h2>
              {emailTab === "signup" && (
                <input className="input" placeholder="Імʼя" autoComplete="name" value={form.name} onChange={(e) => update("name", e.target.value)} />
              )}
              <input
                className="input"
                placeholder={emailTab === "signup" ? "Email" : "Email або телефон"}
                autoComplete={emailTab === "signup" ? "email" : "username"}
                inputMode="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
              {emailTab === "signup" && (
                <input
                  className="input"
                  placeholder="+380 67 123 45 67"
                  autoComplete="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              )}
              <input className="input" type="password" placeholder="Пароль" autoComplete={emailTab === "login" ? "current-password" : "new-password"} value={form.password} onChange={(e) => update("password", e.target.value)} />
              {emailTab === "signup" && (
                <input className="input" type="password" placeholder="Підтвердіть пароль" autoComplete="new-password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} />
              )}
              {error && <div className="field-error">{error}</div>}
              <button className="btn btn-primary" onClick={submitEmail} disabled={loading}>
                {loading ? "Зачекайте…" : emailTab === "login" ? "Увійти" : "Зареєструватись"}
              </button>
            </div>
          </>
        )}

        {method === "telegram" && (
          <div style={{ display: "grid", gap: 20 }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#2AABEE,#229ED9)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.69 7.96c-.12.58-.48.72-.96.45l-2.64-1.95-1.27 1.23c-.14.14-.26.26-.54.26l.19-2.72 4.94-4.47c.22-.19-.05-.3-.33-.11L7.9 14.49l-2.57-.8c-.56-.18-.57-.56.12-.82l10.02-3.86c.47-.17.88.11.17.79z"/></svg>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 17 }}>Вхід через Telegram</div>
                <div style={{ fontSize: 13, color: "var(--ink-400)" }}>Безпечно через офіційний бот</div>
              </div>
            </div>

            {/* Steps */}
            <div style={{ display: "grid", gap: 10 }}>
              {/* Step 1 */}
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--teal-600)", color: "#fff", fontWeight: 700, fontSize: 13, display: "grid", placeItems: "center", flexShrink: 0, marginTop: 1 }}>1</div>
                <div style={{ flex: 1, display: "grid", gap: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Відкрийте бот і надішліть команду</div>
                  {/* Copyable /start */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--ink-50)", border: "1px solid var(--ink-100)", borderRadius: 8, padding: "8px 12px" }}>
                    <code style={{ flex: 1, fontSize: 15, fontWeight: 700, letterSpacing: "0.03em" }}>/start</code>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard?.writeText("/start")}
                      style={{ border: 0, background: "transparent", cursor: "pointer", color: "var(--teal-600)", fontSize: 12, fontWeight: 600, padding: "2px 6px", borderRadius: 6 }}
                    >копіювати</button>
                  </div>
                  <a
                    href={`https://t.me/${TG_BOT || "ultravet_bot"}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, background: "linear-gradient(135deg,#2AABEE,#229ED9)", color: "#fff", fontWeight: 600, fontSize: 14, textDecoration: "none", width: "fit-content" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.69 7.96c-.12.58-.48.72-.96.45l-2.64-1.95-1.27 1.23c-.14.14-.26.26-.54.26l.19-2.72 4.94-4.47c.22-.19-.05-.3-.33-.11L7.9 14.49l-2.57-.8c-.56-.18-.57-.56.12-.82l10.02-3.86c.47-.17.88.11.17.79z"/></svg>
                    Відкрити @{TG_BOT || "ultravet_bot"}
                  </a>
                  <div style={{ fontSize: 12, color: "var(--ink-400)" }}>
                    Якщо бот вже відкритий — просто надішліть <strong>/start</strong> у чат повторно
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: "var(--ink-100)", margin: "2px 0" }} />

              {/* Step 2 */}
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--teal-600)", color: "#fff", fontWeight: 700, fontSize: 13, display: "grid", placeItems: "center", flexShrink: 0, marginTop: 1 }}>2</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Введіть 6-значний код від бота</div>
                  <input
                    className="input"
                    placeholder="• • • • • •"
                    inputMode="numeric"
                    maxLength={6}
                    value={tgCode}
                    onChange={(e) => setTgCode(e.target.value.replace(/\D/g, ""))}
                    style={{ letterSpacing: tgCode ? "0.3em" : undefined, fontSize: tgCode ? 20 : undefined, textAlign: tgCode ? "center" : undefined }}
                  />
                </div>
              </div>
            </div>

            {error && <div className="field-error">{error}</div>}
            <button className="btn btn-primary" onClick={submitTelegram} disabled={loading || tgCode.length < 6}
              style={{ opacity: tgCode.length < 6 ? 0.5 : 1, transition: "opacity .2s" }}
            >
              {loading ? "Перевірка…" : "Увійти"}
            </button>
          </div>
        )}

        {method === "viber" && (
          <div style={{ display: "grid", gap: 20 }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#8B5CF6,#7C3AED)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M20.94 11c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm0-11c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 17 }}>Вхід через Viber</div>
                <div style={{ fontSize: 13, color: "var(--ink-400)" }}>Отримайте код у Viber-боті</div>
              </div>
            </div>

            {/* Steps */}
            <div style={{ display: "grid", gap: 10 }}>
              {/* Step 1 */}
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--teal-600)", color: "#fff", fontWeight: 700, fontSize: 13, display: "grid", placeItems: "center", flexShrink: 0, marginTop: 1 }}>1</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Відкрийте бот у Viber і надішліть <code style={{ background: "var(--ink-100)", padding: "1px 5px", borderRadius: 4 }}>/start</code></div>
                  <a
                    href={`viber://pa?chatURI=${VIBER_BOT}`}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, background: "linear-gradient(135deg,#8B5CF6,#7C3AED)", color: "#fff", fontWeight: 600, fontSize: 14, textDecoration: "none" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M20.94 11c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm0-11c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>
                    @{VIBER_BOT}
                  </a>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: "var(--ink-100)", margin: "2px 0" }} />

              {/* Step 2 */}
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--teal-600)", color: "#fff", fontWeight: 700, fontSize: 13, display: "grid", placeItems: "center", flexShrink: 0, marginTop: 1 }}>2</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Введіть 6-значний код з бота</div>
                  <input
                    className="input"
                    placeholder="• • • • • •"
                    inputMode="numeric"
                    maxLength={6}
                    value={viberCode}
                    onChange={(e) => setViberCode(e.target.value.replace(/\D/g, ""))}
                    style={{ letterSpacing: viberCode ? "0.3em" : undefined, fontSize: viberCode ? 20 : undefined, textAlign: viberCode ? "center" : undefined }}
                  />
                </div>
              </div>
            </div>

            {error && <div className="field-error">{error}</div>}
            <button className="btn btn-primary" onClick={submitViber} disabled={loading || viberCode.length < 6}>
              {loading ? "Перевірка…" : "Підтвердити"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminLoginModal = ({ onClose, onConfirm }) => {
  const { roles } = useStore();
  const [password, setPassword] = uS("");
  const [selectedRole, setSelectedRole] = uS((roles || [])[0]?.name || "Адміністратор");
  const [error, setError] = uS("");
  const submit = () => {
    setError("");
    if (!onConfirm(password, selectedRole)) setError("Невірний пароль");
  };
  const roleColor = { teal: "var(--teal-600)", coral: "var(--coral-500)", amber: "var(--amber-500)", violet: "var(--violet-500)", rose: "#e64561", green: "var(--green-500)" };
  return (
    <div className="backdrop" onClick={onClose}>
      <div className="card pop" onClick={(e) => e.stopPropagation()} style={{ padding: 32, maxWidth: 400, width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--teal-50)", color: "var(--teal-700)", display: "grid", placeItems: "center" }}>
            <Icon name="shield" size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>Вхід в адмінку</h2>
            <div style={{ fontSize: 13, color: "var(--ink-500)" }}>UltraVet · Панель управління</div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-500)", display: "block", marginBottom: 8 }}>Ваша роль</label>
            <div style={{ display: "grid", gap: 8 }}>
              {(roles || []).map(r => {
                const active = selectedRole === r.name;
                const c = roleColor[r.c] || "var(--teal-600)";
                return (
                  <button key={r.name} type="button" onClick={() => setSelectedRole(r.name)}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, border: `2px solid ${active ? c : "var(--ink-100)"}`, background: active ? `${c}12` : "transparent", cursor: "pointer", textAlign: "left", transition: "border-color .15s, background .15s" }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: c, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink-900)" }}>{r.name}</div>
                      <div style={{ fontSize: 11, color: "var(--ink-400)", marginTop: 1 }}>
                        {r.perms?.includes("Усі права") ? "Повний доступ" : `${r.perms?.length || 0} дозволів`}
                      </div>
                    </div>
                    {active && <Icon name="check" size={15} color={c} />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-500)", display: "block", marginBottom: 6 }}>Пароль</label>
            <input className="input" type="password" placeholder="Пароль адміністратора" value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submit(); }} autoFocus />
          </div>

          {error && <div className="field-error">{error}</div>}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn btn-ghost" onClick={onClose}>Скасувати</button>
            <button className="btn btn-primary" onClick={submit}>Увійти як {selectedRole}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Onboarding wizard ───────────────────────────────────────────────────────
const PET_SPECIES = [
  { k: "Кіт", icon: "🐱" }, { k: "Пес", icon: "🐶" },
  { k: "Кролик", icon: "🐰" }, { k: "Птах", icon: "🐦" },
  { k: "Гризун", icon: "🐹" }, { k: "Рептилія", icon: "🦎" },
  { k: "Інше", icon: "🐾" },
];

const OnboardingModal = ({ user, accessToken, onDone }) => {
  const store = useStore();
  const [step, setStep] = uS(1);
  const [profile, setProfile] = uS({ name: user.name || "", email: user.email || "", phone: user.phone || "" });
  const [pet, setPet] = uS({ name: "", species: "", breed: "", age: "" });
  const [saving, setSaving] = uS(false);
  const [error, setError] = uS("");
  const total = 3;

  const upProfile = (k, v) => setProfile(p => ({ ...p, [k]: v }));
  const upPet = (k, v) => setPet(p => ({ ...p, [k]: v }));

  const isAutoName = (n) => /^(Telegram|Viber)\s+\d+$/.test(n);

  const saveProfile = async () => {
    if (!profile.name.trim() || isAutoName(profile.name)) return setError("Введіть своє імʼя");
    setSaving(true); setError("");
    try {
      await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` },
        credentials: "include",
        body: JSON.stringify(profile),
      });
      store.setCurrentUser({ ...user, ...profile });
      setStep(2);
    } catch { setError("Помилка збереження"); }
    finally { setSaving(false); }
  };

  const savePet = () => {
    if (pet.name.trim() && pet.species) {
      store.savePet({ name: pet.name.trim(), species: pet.species, breed: pet.breed, age: Number(pet.age) || 0, owner: profile.name.trim() || user.name });
    }
    setStep(3);
  };

  const stepLabel = ["", "Ваші дані", "Улюбленець", "Готово"][step];

  return (
    <div className="backdrop">
      <div className="card pop" onClick={e => e.stopPropagation()}
        style={{ padding: "40px 32px 32px", maxWidth: 460, width: "100%", position: "relative" }}
      >
        {/* Progress */}
        <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 32 }}>
          {[1, 2, 3].map((s, i) => (
            <React.Fragment key={s}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 14, background: step >= s ? "var(--teal-600)" : "var(--ink-100)", color: step >= s ? "#fff" : "var(--ink-400)", transition: "background .3s" }}>
                  {step > s ? "✓" : s}
                </div>
                <div style={{ fontSize: 11, color: step === s ? "var(--teal-700)" : "var(--ink-400)", fontWeight: step === s ? 600 : 400, whiteSpace: "nowrap" }}>
                  {["Ваші дані", "Улюбленець", "Готово"][i]}
                </div>
              </div>
              {i < 2 && <div style={{ flex: 1, height: 2, background: step > s ? "var(--teal-600)" : "var(--ink-100)", margin: "0 6px", marginBottom: 20, transition: "background .3s" }} />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1 — profile */}
        {step === 1 && (
          <div style={{ display: "grid", gap: 16 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Розкажіть про себе</div>
              <div style={{ fontSize: 14, color: "var(--ink-400)" }}>Ці дані потрібні для запису до лікаря</div>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--ink-500)", fontWeight: 600, display: "block", marginBottom: 6 }}>Імʼя та прізвище *</label>
                <input className="input" placeholder="Іван Коваленко" autoComplete="name" value={profile.name} onChange={e => upProfile("name", e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--ink-500)", fontWeight: 600, display: "block", marginBottom: 6 }}>Телефон</label>
                <input className="input" placeholder="+380 XX XXX XX XX" autoComplete="tel" inputMode="tel" value={profile.phone} onChange={e => upProfile("phone", e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--ink-500)", fontWeight: 600, display: "block", marginBottom: 6 }}>Email</label>
                <input className="input" placeholder="your@email.com" autoComplete="email" inputMode="email" value={profile.email} onChange={e => upProfile("email", e.target.value)} />
              </div>
            </div>
            {error && <div className="field-error">{error}</div>}
            <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>
              {saving ? "Зберігаємо…" : "Далі →"}
            </button>
          </div>
        )}

        {/* Step 2 — pet */}
        {step === 2 && (
          <div style={{ display: "grid", gap: 16 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Ваш улюбленець</div>
              <div style={{ fontSize: 14, color: "var(--ink-400)" }}>Необов'язково — можна додати пізніше в кабінеті</div>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--ink-500)", fontWeight: 600, display: "block", marginBottom: 8 }}>Вид тварини</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                  {PET_SPECIES.map(s => (
                    <button key={s.k} type="button" onClick={() => upPet("species", s.k)}
                      style={{ border: `2px solid ${pet.species === s.k ? "var(--teal-600)" : "var(--ink-100)"}`, borderRadius: 10, padding: "10px 6px", background: pet.species === s.k ? "var(--teal-50)" : "var(--paper)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transition: "border-color .15s" }}
                    >
                      <span style={{ fontSize: 22 }}>{s.icon}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: pet.species === s.k ? "var(--teal-700)" : "var(--ink-500)" }}>{s.k}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--ink-500)", fontWeight: 600, display: "block", marginBottom: 6 }}>Імʼя тварини</label>
                <input className="input" placeholder="Барсік, Рекс…" value={pet.name} onChange={e => upPet("name", e.target.value)} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--ink-500)", fontWeight: 600, display: "block", marginBottom: 6 }}>Порода</label>
                  <input className="input" placeholder="Мейн-кун…" value={pet.breed} onChange={e => upPet("breed", e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--ink-500)", fontWeight: 600, display: "block", marginBottom: 6 }}>Вік (років)</label>
                  <input className="input" placeholder="2" inputMode="numeric" value={pet.age} onChange={e => upPet("age", e.target.value.replace(/\D/g, ""))} />
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button className="btn btn-ghost" onClick={savePet}>Пропустити</button>
              <button className="btn btn-primary" onClick={savePet} disabled={!pet.species || !pet.name.trim()}>Додати →</button>
            </div>
          </div>
        )}

        {/* Step 3 — done */}
        {step === 3 && (
          <div style={{ display: "grid", gap: 20, textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: 56 }}>🎉</div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Вітаємо в UltraVet!</div>
              <div style={{ fontSize: 15, color: "var(--ink-500)", lineHeight: 1.6 }}>
                Акаунт налаштовано. Тепер ви можете записатись до лікаря, переглядати історію прийомів та керувати даними своїх тварин.
              </div>
            </div>
            <button className="btn btn-primary" style={{ fontSize: 16, padding: "14px" }} onClick={onDone}>
              Перейти до кабінету →
            </button>
          </div>
        )}
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
  const [adminRole, setAdminRole] = uS("Адміністратор");
  const [adminSearch, setAdminSearch] = uS("");
  const [showBooking, setShowBooking] = uS(false);
  const [showLogin, setShowLogin] = uS(false);
  const [showAdminLogin, setShowAdminLogin] = uS(false);
  const [legalKind, setLegalKind] = uS(null);
  const [toast, setToast] = uS(null);
  const [onboarding, setOnboarding] = uS(null); // { user, accessToken }

  // Restore session from httpOnly refresh cookie on mount
  uE(() => {
    fetch("/api/auth/refresh", { method: "POST", credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.user) { store.setCurrentUser(data.user); store.setAccessToken(data.accessToken); } })
      .catch(() => {})
      .finally(() => store.markSessionChecked());
  }, []);

  const serviceSlugById = uM(
    () =>
      Object.fromEntries(
        (store.services || []).map((s) => [s.id, `${s.id}-${slugify(s.name)}`])
      ),
    [store.services]
  );
  const articleSlugById = uM(
    () =>
      Object.fromEntries(
        (store.articles || []).map((a) => [a.id, `${a.id}-${slugify(a.title)}`])
      ),
    [store.articles]
  );
  const serviceIdBySlug = uM(
    () =>
      Object.fromEntries(
        Object.entries(serviceSlugById).map(([id, slug]) => [slug, id])
      ),
    [serviceSlugById]
  );
  const articleIdBySlug = uM(
    () =>
      Object.fromEntries(
        Object.entries(articleSlugById).map(([id, slug]) => [slug, id])
      ),
    [articleSlugById]
  );

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const getPathForRoute = (r, p = {}) => {
    if (r === "home") return "/home";
    if (r === "services") return "/poslugy";
    if (r === "service") return `/poslugy/${serviceSlugById[p.id] || p.id || ""}`.replace(/\/$/, "");
    if (r === "booking") return "/zapis";
    if (r === "about") return "/pro-kliniku";
    if (r === "contacts") return "/kontakty";
    if (r === "prices") return "/ciny";
    if (r === "articles") return "/statti";
    if (r === "article") return `/statti/${articleSlugById[p.id] || p.id || ""}`.replace(/\/$/, "");
    if (r === "profile") return "/kabinet";
    return "/";
  };

  const parsePathToRoute = (pathname) => {
    const cleaned = pathname.replace(/\/+$/, "") || "/";
    const staticRoutes = {
      "/home": { route: "home", params: {} },
      "/poslugy": { route: "services", params: {} },
      "/zapis": { route: "booking", params: {} },
      "/pro-kliniku": { route: "about", params: {} },
      "/kontakty": { route: "contacts", params: {} },
      "/ciny": { route: "prices", params: {} },
      "/statti": { route: "articles", params: {} },
      "/kabinet": { route: "profile", params: {} },
    };
    if (cleaned === "/") return { route: "home", params: {}, redirectTo: "/home" };
    if (staticRoutes[cleaned]) return staticRoutes[cleaned];

    if (cleaned.startsWith("/poslugy/")) {
      const slug = decodeURIComponent(cleaned.replace("/poslugy/", ""));
      const directId = serviceIdBySlug[slug];
      const prefixedId = slug.split("-")[0];
      const id =
        directId ||
        (store.services || []).find((s) => s.id === prefixedId || s.id === slug)?.id;
      return id ? { route: "service", params: { id } } : { route: "services", params: {} };
    }

    if (cleaned.startsWith("/statti/")) {
      const slug = decodeURIComponent(cleaned.replace("/statti/", ""));
      const directId = articleIdBySlug[slug];
      const prefixedId = slug.split("-")[0];
      const id =
        directId ||
        (store.articles || []).find((a) => a.id === prefixedId || a.id === slug)?.id;
      return id ? { route: "article", params: { id } } : { route: "articles", params: {} };
    }

    return { route: "home", params: {} };
  };

  const go = (r, p = {}, opts = {}) => {
    setRoute(r);
    setParams(p);
    if (!opts.silent) {
      const nextPath = getPathForRoute(r, p);
      if (window.location.pathname !== nextPath) {
        window.history.pushState({ route: r, params: p }, "", nextPath);
      }
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const openAdmin = () => {
    if (window.sessionStorage.getItem("ultravet:admin-authed") === "1") {
      setAdmin(true);
      return;
    }
    setShowAdminLogin(true);
  };

  const confirmAdmin = (password, role) => {
    if (password !== (store.settings?.adminPassword || "admin")) return false;
    window.sessionStorage.setItem("ultravet:admin-authed", "1");
    if (role) setAdminRole(role);
    setShowAdminLogin(false);
    setAdmin(true);
    return true;
  };

  const ROLE_ROUTE_BY_PERMISSION = {
    'Перегляд записів': ['calendar', 'appointments'],
    'Створення записів': ['calendar', 'appointments'],
    'Скасування записів': ['calendar', 'appointments'],
    'Картки пацієнтів': ['pets'],
    'Призначення лікування': ['appointments', 'pets'],
    'Управління статтями': ['articles'],
    'Управління послугами': ['services'],
    'Чат із клієнтами': ['messages'],
    'Перегляд клієнтів': ['clients'],
    'Управління користувачами': ['clients', 'doctors'],
    'Управління ролями': ['roles'],
    'Налаштування клініки': ['settings'],
    'Перегляд фінансів': ['reports'],
    'Експорт даних': ['reports'],
  };
  const currentRoleConfig = (store.roles || []).find(r => r.name === adminRole) || (store.roles || [])[0];
  const rolePermissions = currentRoleConfig?.perms || [];
  const hasPermission = (permission) =>
    rolePermissions.includes('Усі права') || rolePermissions.includes(permission);
  const allowedAdminRoutes = uM(() => {
    const full = ['dashboard','calendar','appointments','clients','pets','doctors','services','articles','messages','reports','roles','settings'];
    if (!currentRoleConfig) return full;
    if ((currentRoleConfig.perms || []).includes('Усі права')) return full;
    const routes = new Set(['dashboard']);
    (currentRoleConfig.perms || []).forEach((perm) => {
      (ROLE_ROUTE_BY_PERMISSION[perm] || []).forEach(route => routes.add(route));
    });
    return full.filter(route => routes.has(route));
  }, [currentRoleConfig]);
  const canAccessAdminRoute = (route) => allowedAdminRoutes.includes(route);

  uE(() => {
    const names = (store.roles || []).map(r => r.name);
    if (!names.length) return;
    if (!names.includes(adminRole)) setAdminRole(names[0]);
  }, [store.roles, adminRole]);

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

  uE(() => {
    const applyFromLocation = () => {
      const parsed = parsePathToRoute(window.location.pathname);
      if (parsed.redirectTo && window.location.pathname !== parsed.redirectTo) {
        window.history.replaceState(
          { route: parsed.route, params: parsed.params },
          "",
          parsed.redirectTo
        );
      }
      setRoute(parsed.route);
      setParams(parsed.params);
    };

    applyFromLocation();
    const onPopState = () => applyFromLocation();
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [serviceIdBySlug, articleIdBySlug, store.services, store.articles]);

  if (admin) {
    const adminPages = {
      dashboard: (
        <AdminDashboard
          role={adminRole}
          search={adminSearch}
          setRoute={setAdminRoute}
          permissions={rolePermissions}
        />
      ),
      calendar: <AdminCalendar search={adminSearch} notify={showToast} permissions={rolePermissions} hasPermission={hasPermission} />,
      appointments: <AdminAppointments search={adminSearch} notify={showToast} permissions={rolePermissions} hasPermission={hasPermission} />,
      clients: <AdminClients search={adminSearch} notify={showToast} permissions={rolePermissions} hasPermission={hasPermission} />,
      pets: <AdminPets search={adminSearch} notify={showToast} permissions={rolePermissions} hasPermission={hasPermission} />,
      doctors: <AdminDoctors search={adminSearch} notify={showToast} permissions={rolePermissions} hasPermission={hasPermission} />,
      services: <AdminServices search={adminSearch} notify={showToast} permissions={rolePermissions} hasPermission={hasPermission} />,
      articles: <AdminArticles search={adminSearch} notify={showToast} permissions={rolePermissions} hasPermission={hasPermission} />,
      messages: <AdminMessages search={adminSearch} notify={showToast} permissions={rolePermissions} hasPermission={hasPermission} />,
      reports: <AdminReports notify={showToast} permissions={rolePermissions} hasPermission={hasPermission} />,
      roles: <AdminRoles notify={showToast} permissions={rolePermissions} hasPermission={hasPermission} />,
      settings: <AdminSettings notify={showToast} permissions={rolePermissions} hasPermission={hasPermission} />,
    };
    const effectiveRoute = canAccessAdminRoute(adminRoute) ? adminRoute : allowedAdminRoutes[0];
    const forbiddenView = (
      <div style={{minHeight:'calc(100vh - 150px)', display:'grid', placeItems:'center'}}>
        <div style={{width:'100%', maxWidth:680, background:'#0f2120', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, padding:24}}>
          <h2 style={{fontSize:24, color:'#fff', marginBottom:8}}>Доступ обмежено</h2>
          <p style={{color:'#8aa6a4', fontSize:14}}>У ролі «{adminRole}» ця сторінка недоступна.</p>
        </div>
      </div>
    );
    return (
      <>
        <AdminLayout
          current={effectiveRoute}
          setRoute={(route) => setAdminRoute(canAccessAdminRoute(route) ? route : (allowedAdminRoutes[0] || "dashboard"))}
          role={adminRole}
          setRole={setAdminRole}
          roleOptions={(store.roles || []).map(r => r.name)}
          canPreviewRoles={hasPermission('Управління ролями') || hasPermission('Усі права')}
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
          onSuccess={(user, isNew, accessToken) => {
            store.setCurrentUser(user);
            store.setAccessToken(accessToken);
            setShowLogin(false);
            if (isNew) {
              setOnboarding({ user, accessToken });
            } else {
              go("profile");
              showToast("Ласкаво просимо!");
            }
          }}
        />
      )}
      {onboarding && (
        <OnboardingModal
          user={onboarding.user}
          accessToken={onboarding.accessToken}
          onDone={() => {
            setOnboarding(null);
            go("profile");
            showToast("Ласкаво просимо в UltraVet!");
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
