# UltraVet — план розробки

Проєкт: React 18 + Vite, без бекенда. Все на клієнті, дані в `localStorage` через центральний `AppStore` (Context API). Демо-сайт ветклініки **UltraVet** (Львів, вул. Околична, 10).

## Бренд (фіксований)

- Назва: **UltraVet** (раніше PetCare — повністю замінено).
- Логотип: SVG-силует тваринки в [src/logo-ultravet.svg](src/logo-ultravet.svg). Підключений як React-компонент `<Logo size color/>` у [components.jsx](src/components.jsx) — використовується у Header, Footer, Admin sidebar, у favicon (через `index.html`).
- Контакти: вул. Околична, 10, Львів · +380 63 679 89 77 · hello@ultravet.ua.
- Графік: Пн–Пт 09:00–18:00, Сб–Нд за попереднім записом. Захардкоджено у `DEFAULT_SETTINGS` ([store.jsx](src/store.jsx)) і дублюється у Header/Footer/Contacts/Booking.
- Persist key: `ultravet:state:v1` (попередній `petcare:state:v1` більше не читається — старі сесії побачать seed-state).
- Експорт state: `ultravet-backup-YYYY-MM-DD.json`.

## Тема (фіксована)

- Основний колір: `#7579EA` (фіолетово-синій). Перевизначається ВСЯ шкала `--teal-50..900` (не лише `--teal-600`) — інакше chips, hero-фон, sticky-фони лишаються бірюзовими.
- Акцент: `#ff7a45` (coral, не змінювати).
- Шрифти: Inter Tight (заголовки), Inter (текст). Радіус карток: 14px.
- `--ink-500: #586d6c` (AA-контраст на світлому фоні; не повертати старе `#6d8483`).
- `--header-h: 84px` десктоп / `68px` мобільний — використовуй у `top:` для sticky-секцій.
- Конфіг у `THEME` константі в [App.jsx](src/App.jsx). У `useEffect` мапиться повний brand-об'єкт із усіма teal-відтінками + `--ink-500` + шрифтами.
- ⚠️ Tweaks-панель видалена. Не повертати.

## Архітектура

- `src/store.jsx` — `AppStoreProvider`, `useStore()`. Дії: `addAppointment`, `updateAppointment`, `deleteAppointment`, `cancelAppointment`, `saveClient`, `deleteClient`, `savePet`, `deletePet`, `saveDoctor`, `deleteDoctor`, `saveService`, `deleteService`, `saveArticle`, `deleteArticle`, `updateSettings`, `login`, `logout`, `register`, `addMessage`, `updateMessage`, `deleteMessage`, `acceptCookies`, `resetState`, `importState`. Helpers: `currentYear()`, `formatDateUk()`, `todayIso()`.
- Захист від конфліктів: dedup слотів (date+time+doctor); відмова на минулі дати/поза-графікові слоти (опція `force: true` для адмінського обходу); заборона видалення сутності з активними звʼязками.
- Структура файлів:
  - `src/App.jsx` — роутер, Header, Footer, LegalModal, QuickBookingModal, LoginModal, CookieBanner, тема.
  - `src/components.jsx` — `Icon`, `Logo`, `PetIllustration`, `Avatar`, `StatusPill`, `Stars`.
  - `src/pages-public.jsx` — Home, Services, ServiceDetail.
  - `src/pages-public-2.jsx` — Booking, About, Contacts, Prices, Articles, Article, Profile.
  - `src/pages-admin.jsx` — увесь адмінський функціонал (11 сторінок).
  - `src/store.jsx` — стан + persistence.
  - `src/data.js` — seed-дані.
  - `src/styles.css` — стилі, CSS-змінні палітри, мобільні медіа-запити.
  - `src/logo-ultravet.svg` — оригінальний SVG бренду.

## Зроблено ✅

### MVP-функціонал

- Центральний store + persistence ([store.jsx](src/store.jsx))
- Auth (login / signup / logout), `currentUser` у Header
- Booking flow з 5-крокового мастера + Quick booking modal
- Contact form → `messages` у store
- Cookie banner, Toast після операцій
- Profile: записи, відміна, тварини (CRUD), редагування профілю
- Admin: Dashboard, Calendar (клік по слоту → запис), Appointments (фільтри + статуси), Clients/Pets/Doctors/Services/Articles (CRUD), Messages (статуси + видалення), Reports, Roles, Settings (клініка/графік/сповіщення/Reset/Import/Export JSON)
- Admin global search, notifications dropdown (реальні дані)

### Поліровка

- Видалено Tweaks-панель, основний колір `#7579EA` зашитий у `THEME`.
- Booking-валідація проти `settings.schedule` (вихідні + межі робочих годин); `addAppointment` відхиляє минулі дати.
- Динамічні дати (`formatDateUk`, `todayIso`, `currentYear`) — більше немає захардкоджених `'2026-04-26'` тощо.
- Footer legal links відкривають `LegalModal` ("Політика конфіденційності", "Умови використання").
- Mobile responsive: 3 брейкпоінти у [styles.css](src/styles.css) — ≤1024 / ≤768 / ≤520.
- Іконка хірургії — Lucide `scissors` (хірургічні ножиці), читається у stroke-стилі.
- CSS-змінні `--rose-600/700`, `--violet-600/700` додано (раніше іконки Хірургії/Онкології/Лабораторії були без кольору).
- AdminAppointments: латинські `edit`/`del`/`confirmed` замінено на українські лейбли + іконки + tooltip.
- Confirm перед видаленням у Clients/Pets/Doctors/Services/Articles/Appointments.
- Empty states у Clients/Doctors/Services/Articles/Appointments + ServicesPage (порожній пошук).
- Прибрано mис-led `cursor:pointer` на статичних рядках.

### Ребрендинг (PetCare → UltraVet)

- Замінено логотип у Header, Footer, Admin sidebar (`<Logo>` компонент з оригінального SVG, контролюється через prop `color`).
- Замінено всі контактні дані (адреса, телефон, email, графік) у [App.jsx](src/App.jsx) Footer/LegalModal, [pages-public.jsx](src/pages-public.jsx) Home, [pages-public-2.jsx](src/pages-public-2.jsx) Contacts/мапа, [store.jsx](src/store.jsx) DEFAULT_SETTINGS.
- Оновлено `index.html`: title, favicon → `/src/logo-ultravet.svg`, `viewport` тепер `device-width` (раніше було `width=1280`, що ламало мобільну версію).
- Storage key bumped: `petcare:state:v1` → `ultravet:state:v1`.

## Треба доробити ⏳

### Критичне (security / логіка)

#### 1. Авторизація фейкова ✅

**Як зараз:** [store.jsx login()](src/store.jsx) приймає будь-який email і логінить як `clients[0]`, якщо нема співпадіння. Пароль не перевіряється.
**Як виправити:**

- У `register` зберігати `passwordHash: btoa(payload.password)` (для демо — простий base64; реальний bcrypt без бекенда не потрібен).
- У `login` шукати клієнта точно за `email.toLowerCase()` або `phone`. Якщо не знайдено — повертати `false`.
- Звіряти `btoa(payload.password) === client.passwordHash`. Якщо не збігається — повертати `false`.
- LoginModal у [App.jsx](src/App.jsx) має прийняти результат і показати `field-error` "Невірний логін або пароль" замість мовчазного редіректу.
- **Готово:** `register` пише `passwordHash`, `login` повертає `false` без fallback на `clients[0]`, `LoginModal` показує помилку.

#### 2. Profile показує чужі дані без логіна ✅

**Як зараз:** [pages-public-2.jsx ProfilePage](src/pages-public-2.jsx) має `const user = currentUser || clients[0]`.
**Як виправити:**

- Прибрати fallback `|| clients[0]`. Якщо `!currentUser` — на початку компоненту викликати `useEffect(() => { go('home'); openLogin(); }, [])` або рендерити placeholder "Увійдіть, щоб переглянути кабінет" з кнопкою.
- Передати `openLogin` у Props ProfilePage з App.jsx.
- **Готово:** fallback прибрано, Profile відкриває login modal і рендерить placeholder для неавторизованого користувача.

#### 3. Адмінка без захисту ✅

**Як зараз:** кнопка "Адмін-панель →" у Footer — просто `setAdmin(true)`. Будь-хто з публіки відкриває адмінку.
**Як виправити:**

- Додати у `DEFAULT_SETTINGS.adminPassword: 'admin'` (можна змінити в Admin Settings).
- Перед `setAdmin(true)` показувати модалку з полем пароля; перевіряти проти `settings.adminPassword`.
- Зберігати `adminAuthed` у sessionStorage щоб не вводити повторно у тій же сесії.
- **Готово:** додано `adminPassword`, `AdminLoginModal`, перевірку перед входом і `sessionStorage` ключ `ultravet:admin-authed`; пароль редагується в Admin Settings.

#### 4. Register без дедупу ✅

**Як зараз:** [store.jsx register()](src/store.jsx) додає клієнта без перевірки чи email/телефон вже існують.
**Як виправити:**

- На початку `register` reducer'а: `if (s.clients.some(c => c.email.toLowerCase() === email.toLowerCase() || c.phone === phone)) return s;`.
- Краще — повертати `{ ok: false, reason: 'duplicate' }` через `useState` + ref або просто кидати в `messages` toast. UI у LoginModal має показати "Користувач з таким email вже зареєстрований".
- **Готово:** `register` повертає `{ ok, reason? }`, блокує duplicate email/phone і показує помилку в `LoginModal`.

### Поліровка

#### 5. Розширена валідація форм у store ✅

**Як зараз:** `addAppointment`, `saveClient`, `savePet` мовчки повертають `s` при невалідних даних.
**Як виправити:**

- Зробити actions які валідують, повертати `{ ok, error? }` через ref або callback. Найпростіше — додати у store `lastError: string | null` поле, яке actions виставляють, а UI читає через `useEffect(..., [lastError])` і показує toast.
- **Готово:** `addAppointment`, `saveClient`, `savePet` повертають `{ ok, error? }`; Booking/Profile/Admin показують toast і не закривають модалки при помилці.

#### 6. Лічильник нових повідомлень ✅

**Як зараз:** sidebar в [pages-admin.jsx AdminLayout](src/pages-admin.jsx) показує "Повідомлення" без бейджа.
**Як виправити:**

- В items array, для пункту `{k:'messages'}` додати `badge: messages.filter(m => m.status === 'new').length`.
- У map sidebar-кнопки: `{it.badge > 0 && <span style={{marginLeft:'auto', background:'var(--coral-500)', color:'#fff', fontSize:10, padding:'2px 6px', borderRadius:99}}>{it.badge}</span>}`.
- **Готово:** sidebar показує coral badge з кількістю `new` повідомлень.

#### 7. AdminPets empty state ✅

**Як зараз:** після reset/видалення всіх — `selected = pets[0]` стає undefined, layout "ламається" без чіткого повідомлення.
**Як виправити:**

- Перед основним grid: `if (pets.length === 0) return <ACard style={{padding:48, textAlign:'center', color:'#8aa6a4'}}>Тварин поки немає. Додайте першу через кнопку «Завести».</ACard>;`
- Інакше залишити поточний layout.
- **Готово:** порожня база тварин і порожній пошук мають окремі empty states; detail layout рендериться лише коли є `visible` тварини.

#### 8. Header на мобільному ✅

**Як зараз:** на ≤520px кнопки "Кабінет" / "Записатись" з лейблами займають весь рядок поруч з лого.
**Як виправити:**

- У [styles.css](src/styles.css) media `(max-width: 520px)`: `header .btn-sm { padding: 8px 10px; }` + сховати текст-лейбли через додатковий клас. Простіше — обгорнути текст у Header у `<span className="btn-label">` і у CSS на ≤520 `.btn-label { display: none; }`.
- **Готово:** тексти CTA-кнопок у Header обгорнуті в `.btn-label`, на ≤520px лишаються іконки; додано `aria-label`.

#### 9. Розширені палітри shade-варіантів ✅

**Як зараз:** amber/green мають лише `100/400/500`. Якщо хтось задасть `var(--green-600)` — буде fallback на `currentColor`.
**Як виправити:**

- Додати у `:root` в [styles.css](src/styles.css): `--amber-200/300/500/600/700`, `--green-200/300/600/700`. Кольори можна підібрати лінійною інтерполяцією між 100 і 500/700.
- **Готово:** додано amber `200/300/500/600/700` і green `200/300/400/600/700`.

#### 10. Footer схема контактів захардкоджена ✅

**Як зараз:** Footer у [App.jsx](src/App.jsx) має літерально `<div>вул. Околична, 10</div>` тощо. Якщо адмін змінить у Settings — Footer не оновиться.
**Як виправити:**

- У `Footer` отримувати `const { settings } = useStore();` і виводити `settings.clinic.address/phone/email`. Графік — мапити з `settings.schedule`.
- **Готово:** Footer читає `settings.clinic` і формує графік із `settings.schedule`.

## Чек-лист на завершення MVP (всі ✅)

- Створив запис → видно в /profile (upcoming) і в /admin/appointments + /admin/calendar
- Адмін змінив статус → змінилось у профілі
- Зареєструвався → у /admin/clients зʼявився новий клієнт
- Перезавантажив сторінку → стан зберігся
- Основний колір сайту і адмінки — `#7579EA`
- Tweaks-панелі немає на жодній сторінці
- Бренд UltraVet всюди (Header, Footer, Admin, favicon, title), контакти з реальної точки на вул. Околична, 10

## Журнал змін

### 2026-04-27 — header, burger menu, hero polish, stock photos

- **Sticky header fix:** `html, body { overflow-x: hidden }` ламав `position:sticky` всередині (створював scroll-container). Замінено на `overflow-x: clip`. Тепер header прилипає на десктопі і мобільному.
- **Header висота:** 72→84 десктоп, 60→68 мобільний; винесено в `--header-h`. Container використовує `height: var(--header-h)`.
- **Burger menu:** на ≤768 ховається `.header-nav` і `.header-cta-user`, показується `.header-burger`. Drawer (`MobileMenu`) рендериться через `createPortal(..., document.body)` — інакше `backdrop-filter` на header створював containing block для `position:fixed` і drawer ховався вище екрану після скролу.
- **MobileMenu UX:** slide-right drawer 86vw/360px, лого+X у шапці, навігація з іконками (active state — teal-50/100/700), CTA "Записатись" + "Кабінет/Вийти" або "Увійти" + tel-лінк. Блокує `body.overflow` поки відкритий.
- **Hero:** прибрано бейдж "Працюємо сьогодні · Запис на 14:30 ще вільний". Додано класи `.home-hero-title` / `.home-hero-lead` для контрольованих розмірів на мобільному (40/15px на ≤768, 34px на ≤520). Top-padding hero на ≤768 збільшено 36→64px.
- **Hero stats** (12 років / 24/7 / 4.9★ / 8000+) — `.hero-stats` 2-кол grid centered на ≤768.
- **Trust bar** — `.trust-bar` 2-кол grid centered на ≤768.
- **Card collapse fix:** браузер серіалізує inline `repeat(3,1fr)` як `repeat(3, 1fr)` (з пробілом). Селектори `[style*="repeat(3,1fr)"]` без пробілу не ловили — картки лишалися 3-4 кол на мобільному. Додано варіанти з пробілом для всіх `repeat(N,1fr)` і двоколонкових пропорцій.
- **Stock photos:** `DOCTORS[].photo` і `ARTICLES[].cover` (Unsplash). HomePage doctors + AboutPage doctors: `<img object-fit:cover>` замість `Avatar` всередині `stripe-bg`. HomePage/ArticlesPage cards + ArticlePage cover: `<img>` замість порожнього `stripe-bg`. Fallback на старий вигляд якщо `photo`/`cover` не задано.
- **LoginModal:** padding `32` → `44px 32px 32px`, X кнопка `top/right: 16→12`, розмір 32→36px (зручніше попасти на мобільному).
- **Cookie banner:** додано клас `.cookie-banner` для адресного responsive.
- **Inputs:** додано `autoComplete` (`name/tel/email/current-password/username`) + `inputMode` для мобільних клавіатур.

### 2026-04-27 — design & mobile polish (waves 1-3)

- **Бренд:** замість одного `--teal-600` тепер у `App.jsx` через `useEffect` перевизначається повна шкала `--teal-50..900` фіолетово-синіми відтінками від `#7579EA`. Hero-градієнти, chips, sticky-фони стали брендовими.
- **Контраст:** `--ink-500` піднято з `#6d8483` до `#586d6c` для AA на світлому фоні.
- **Hardcoded дата:** `AdminDashboard` "сьогодні" і `AdminAppointments` empty-template тепер використовують `new Date().toISOString().slice(0,10)`.
- **Sticky-aside на мобільному:** Booking summary, Profile aside, Prices sidebar, Service detail aside стають `position:static` на ≤768.
- **`--header-h`** CSS-змінна (72/60) — sticky-секції (Services filter, Articles tag-bar) синхронізовані з висотою шапки.
- **Tel/Mailto/Maps лінки:** усі `+380 63 679 89 77` тепер `<a href="tel:...">`; emails — `mailto:`; адреса (Footer + Contacts) → Google Maps.
- **Booking stepper:** на ≤520px ховаються лейбли неактивних кроків — лишається кружечок з номером.
- **Profile рядки історії/документів:** на ≤768 стек замість 5-кол grid.
- **Booking pet-species:** 4-кол → 2x2 на мобільному.
- **Mock-map (Contacts):** `min-height` 560 → 320 на мобільному.
- **Doctor/article cards:** фіксовані висоти заглушок 180/200 → 140 на мобільному.
- **Footer:** 4-кол → 2-кол на ≤768 (брендова колонка займає всю ширину); кнопки навігації мають `min-height:36`.
- **Cookie banner:** на ≤520 вертикальний layout, кнопки в ряд з `flex:1`. Іконка `--amber-400` → `--amber-700` для видимості.
- **Inputs autocomplete/inputMode:** name/tel/email/password тепер мають коректні `autoComplete` атрибути для мобільних клавіатур.
- **`КВІТ` хардкод у Profile:** замінено на динамічний місяць з `ap.date`.
- **Не торкалися:** мобільної адаптації адмінки (за просьбою — низький пріоритет).

### 2026-04-27 — auth/profile/admin/security

- `store.login/register`: додано перевірку пароля, `passwordHash`, duplicate guard для email/phone.
- `ProfilePage`: прибрано fallback на `clients[0]`, додано login placeholder.
- `App.jsx`: додано `AdminLoginModal`, `adminPassword`, sessionStorage `ultravet:admin-authed`.
- `AdminSettings`: пароль адмінки можна редагувати.

### 2026-04-27 — MVP polish

- `addAppointment/saveClient/savePet` повертають `{ ok, error? }`; UI показує toast замість мовчазного fail.
- `AdminLayout`: badge нових повідомлень у sidebar.
- `AdminPets`: empty state для порожньої бази і порожнього пошуку.
- `Header`: mobile CTA labels сховані через `.btn-label`, додано `aria-label`.
- `Footer`: контакти й графік читаються з `settings`.
- `styles.css`: додано amber/green shade variables.

### 2026-04-27 — admin messages

- Notification dropdown для контактних повідомлень веде в `messages`, не в `clients`.
- `AdminMessages`: додано фільтри `Усі/Нові/В роботі/Закриті`.
- `AdminMessages`: видалення повідомлення підтверджується через адмінський confirm-dialog.
- `AdminMessages`: дія `Створити клієнта` створює клієнта з повідомлення і переводить звернення в роботу.

### 2026-04-27 — admin reports

- `AdminReports`: додано фільтр періоду `Сьогодні / 7 днів / 30 днів / Усе`.
- Метрики, графік і топ послуг рахуються по обраному періоду.
- Додано CSV export `ultravet-report-{period}-YYYY-MM-DD.csv` з записами й summary-метриками.
- Примітка: періодні фільтри працюють для ISO-дат `YYYY-MM-DD`; старі текстові дати потрапляють тільки у режим `Усе`.

### 2026-04-27 — admin functionality pass

- `AdminRoles`: матриця прав стала інтерактивною; `Нова роль` додає демо-роль, права перемикаються кліком.
- `AdminAppointments`: новий запис автоматично створює картку тварини, якщо такої тварини у клієнта ще немає.
- `AdminSettings`: додано валідацію email/телефону клініки та часу графіку (`HH:MM` або `—`, from < to).
- `AdminReports`: додано порівняння з попереднім періодом і кнопку друку summary.
- Admin UI: `window.alert` замінено на спільний toast через `notify`.

## Далі доробити в адмінці

- ✅ `AdminRoles`: ролі винесено у `store.jsx` (`roles`, `addRole`, `renameRole`, `deleteRole`, `toggleRolePermission`); persist у `ultravet:state:v1`. Адмін лочений від rename/delete/toggle.
- ✅ `AdminAppointments`: клієнт/тварина/послуга/лікар через `datalist` (autocomplete з store). Вибір клієнта автоматично підставляє його єдину тварину, послуга — ціну з прайсу.
- ✅ `AdminSettings`: dirty-state, кнопки `Зберегти` / `Скасувати`, валідація email/phone/schedule на сабміті замість миттєвого write-through.
- ✅ Admin UI: спільні `AInput / ATextarea / ASelect / AField / ABtn` (поряд з `ACard`) — використовуються в `AdminModal`, `AdminRoles`, `AdminSettings`. Решта сторінок поступово мігрує.
- ✅ Admin UI: усі destructive actions і reset seed переведені з `window.confirm` на спільний `AdminConfirmDialog`.
- ✅ Admin data logic: `addAppointment/updateAppointment` тепер атомарно синхронізують клієнта і картку тварини; `saveClient/savePet` мають дедуп і перерахунок `pets/visits`; завершені записи отримують `paymentStatus/paymentMethod/paidAt`.
- ✅ Admin finance: Dashboard/Reports рахують оплачений дохід, середній чек по оплачених прийомах і `До отримання` по завершених неоплачених; CSV містить оплату і метод.
- ✅ Admin clinical data: у store додано `medicalRecords`, `vaccinations`, `invoices`; Pet profile читає реальні записи/вакцинації/медичні події замість hardcoded історії.
- ✅ Admin calendar: `День/Тиждень/Місяць` стали реальними view; week/month показують записи по датах і дозволяють створювати запис кліком по дню.
- ✅ Admin CRUD: `saveDoctor/saveService/saveArticle/deleteDoctor/deleteService/deleteArticle` повертають `{ ok, error? }`, UI показує toast; статичні article views замінено на поле `views`.
- ✅ Admin Settings: інтеграції зберігаються в `settings.integrations`, редагуються в UI й експортуються разом із новими колекціями.
- ✅ Admin notifications/messages: повідомлення мають `readAt/viewedAt`; sidebar/header badge рахує непрочитані, нове непрочитане програє короткий Web Audio сигнал, перегляд повідомлення відкриває modal і позначає його прочитаним.

### 2026-04-27 — mobile UI/UX pass

- Розширено `styles.css` responsive: 3 брейкпоінти (≤1024 / ≤768 / ≤520) тепер ловлять усі inline-grid патерни (`1.15fr 1fr`, `1.5fr 1fr`, `1.4fr 1fr`, `1fr 1.2fr`, `260px 1fr`, `240px 1fr`, `repeat(N,1fr)` etc.).
- На ≤768 секційні паддінги `88/80/72/56/48px` нормалізуються до `52/40/36px`; шрифти `h1/h2/h3` опускаються до `34/24/19`; sticky-секції стають static; section-headers з кнопкою `space-between` стейкаються.
- Hero: cluster з декоративними картками (`.home-hero-cluster`) ховається на мобільному; CTA-блок (`.home-cta`) — single-column з повноширинними кнопками.
- Service detail: aside (`.service-detail-aside`) втрачає sticky, grid стейкається; price-rows компактні.
- Modals: `.backdrop > div` отримав `max-height: 92vh`, scroll, `border-radius` як bottom-sheet на ≤768.
- Header: на ≤768 ховаються підзаголовок «Ветклініка · Львів» і nav; на ≤520 кнопки CTA стають icon-only.
- Профілеві/адмін-рядки `auto 1fr auto auto` і `1fr 1fr 1fr auto auto` теж стейкаються на ≤768.

### 2026-04-27 — admin refactor

- `store.jsx`: додано `DEFAULT_ROLES`, exported `ALL_PERMISSIONS`; persist ролей у localStorage.
- `pages-admin.jsx`: `AdminRoles` працює з store-ролями, підтримує rename/delete; `AdminAppointments` має autocomplete; `AdminSettings` локальний draft + Save bar; виділено admin primitives.

## Конвенції для агентів

- Не повертати tweaks-панель. Тема — статична константа `THEME`.
- Не повертати назву "PetCare". Завжди UltraVet.
- Усі нові дані — через `useStore()` actions, не пряма мутація `data.js`.
- Дати — через helpers (`formatDateUk`, `todayIso`, `currentYear`), не літерали.
- Перед видаленням сутності у store — перевіряти активні залежності; в UI — показувати спільний `AdminConfirmDialog`.
- Логотип — компонент `<Logo>` з [components.jsx](src/components.jsx), не вставляти SVG напряму.
- **`overflow-x` на html/body**: тільки `clip`, не `hidden` (інакше ламається `position:sticky`).
- **Modals/drawers** з `position:fixed` під шапкою з `backdrop-filter` — рендерити через `createPortal` у `document.body`, інакше fixed позиціонується відносно header, а не viewport.
- **CSS-селектори по inline-grid** — додавати обидві серіалізації: `repeat(3,1fr)` І `repeat(3, 1fr)` (браузер нормалізує з пробілом).
- **Sticky-секції під шапкою** — `top: var(--header-h)`, не літерали 72/60.
- **Stock-фото** для doctors/articles — поля `photo`/`cover` у `data.js`, рендер через `<img loading="lazy" object-fit:cover>` з fallback на `stripe-bg`/`Avatar`.
- **Telefon/email/адреси** — обовʼязково `tel:`/`mailto:`/Google Maps лінки, не plain text.
- **Адмінка під мобільний** — наразі низький пріоритет, не торкатися без явного запиту.
