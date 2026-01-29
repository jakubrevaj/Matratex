# 🚀 Ďalšie návrhy na vylepšenie

## 🎯 Top Priority (Najdôležitejšie)

### 1. 📊 Rozšírený Dashboard s widgetmi
**Problém:** Dashboard je základný, chýbajú vizualizácie a užitočné widgety.

**Riešenie:**
- **Grafy a grafy:**
  - Graf tržieb za posledných 6 mesiacov
  - Graf počtu objednávok v čase
  - Pie chart stavov objednávok
  - Top 5 zákazníkov podľa tržieb
- **Widgety:**
  - Dnešné objednávky
  - Objednávky čakajúce na výrobu
  - Faktúry po splatnosti
  - Priemerný čas výroby
  - Najpredávanejší produkt tento mesiac
- **Rýchle akcie:**
  - Rýchle vytvorenie objednávky
  - Rýchle vytvorenie faktúry
  - Export reportu

**Knižnice:**
- `recharts` alebo `chart.js` pre grafy
- `date-fns` už je nainštalovaná

---

### 2. 🔔 Notifikácie a upozornenia
**Problém:** Používatelia nevedia o dôležitých udalostiach (faktúry po splatnosti, nové objednávky).

**Riešenie:**
- **Systém notifikácií:**
  - Badge s počtom neprečítaných notifikácií
  - Dropdown zoznam notifikácií
  - Automatické notifikácie pre:
    - Faktúry po splatnosti
    - Nové objednávky
    - Objednávky čakajúce na výrobu
    - Dokončené objednávky
- **Email notifikácie:**
  - Automatické upomienky pre faktúry
  - Potvrdenie vytvorenia objednávky
  - Notifikácia o dokončení výroby

**Implementácia:**
- Backend: WebSocket alebo polling
- Frontend: Toast notifikácie + badge v navigácii

---

### 3. 🔍 Vylepšené vyhľadávanie s autocomplete
**Problém:** Vyhľadávanie je základné, chýba autocomplete a návrhy.

**Riešenie:**
- **Autocomplete:**
  - Návrhy pri písaní (zákazníci, objednávky, faktúry)
  - Rýchle výsledky bez potreby kliknúť "Hľadať"
- **Debouncing:**
  - Vyhľadávanie sa spustí až po 300ms pauze
  - Zníženie počtu API volaní
- **Vylepšené výsledky:**
  - Zvýraznenie nájdeného textu
  - Zobrazenie kontextu (napr. "Objednávka #123 - Zákazník ABC")
  - Rýchle akcie priamo z výsledkov

**Knižnice:**
- `use-debounce` pre debouncing
- Vlastný autocomplete komponent

---

### 4. 📱 Responzívny design a mobilná optimalizácia
**Problém:** Aplikácia môže byť zložitá na mobilných zariadeniach.

**Riešenie:**
- **Mobilné menu:**
  - Hamburger menu pre malé obrazovky
  - Zjednodušené navigačné menu
- **Responzívne tabuľky:**
  - Kartový layout na mobiloch
  - Swipe akcie
- **Touch-friendly:**
  - Väčšie tlačidlá
  - Lepšie rozostupy
  - Optimalizované formuláre

---

### 5. 🔐 Bezpečnosť a oprávnenia
**Problém:** Chýba systém používateľov a oprávnení.

**Riešenie:**
- **Autentifikácia:**
  - Prihlasovanie (email + heslo)
  - JWT tokeny
  - Refresh tokeny
- **Autorizácia:**
  - Roly (admin, manager, worker)
  - Oprávnenia na akcie (vytvorenie, úprava, mazanie)
  - Audit log (kto čo urobil)
- **Bezpečnosť:**
  - Hashovanie hesiel (bcrypt)
  - Rate limiting
  - CSRF protection

---

## 📈 Stredná priorita

### 6. 📅 Kalendár a plánovanie
**Riešenie:**
- Kalendárný pohľad na objednávky
- Plánovanie výroby
- Deadline tracking
- Priradenie objednávok k dátumom

**Knižnice:**
- `react-big-calendar` alebo `@fullcalendar/react`

---

### 7. 📝 Šablóny a predlohy
**Riešenie:**
- Šablóny objednávok (pre opakujúce sa objednávky)
- Šablóny faktúr
- Rýchle vytvorenie z šablóny
- Uložené poznámky a poznámky

---

### 8. 🔄 Verzovanie a histórie zmien
**Riešenie:**
- História zmien objednávok
- Verzovanie faktúr
- Zobrazenie, kto a kedy zmenil čo
- Možnosť vrátiť zmeny

---

### 9. 📊 Pokročilé reporty
**Riešenie:**
- Custom reporty (vlastné filtre a stĺpce)
- Export reportov do PDF
- Plánované reporty (email každý týždeň)
- Porovnanie období (tento mesiac vs. minulý mesiac)

---

### 10. 🎨 Témy a prispôsobenie
**Riešenie:**
- Dark mode (už je základná implementácia)
- Vlastné farby
- Uložené preferencie
- Rôzne layouty

---

## 🔧 Technické vylepšenia

### 11. ⚡ Performance optimalizácia
**Riešenie:**
- Lazy loading komponentov
- Code splitting
- Memoization (React.memo, useMemo)
- Virtual scrolling pre veľké tabuľky
- Caching API odpovedí

---

### 12. 🧪 Testovanie
**Riešenie:**
- Unit testy (Jest)
- Integration testy
- E2E testy (Playwright/Cypress)
- Test coverage

---

### 13. 📦 Backup a obnova dát
**Riešenie:**
- Automatické denné zálohy databázy
- Export dát do JSON/CSV
- Import dát
- Obnova zálohy

---

### 14. 🌐 Internacionalizácia (i18n)
**Riešenie:**
- Podpora viacerých jazykov (SK, EN)
- Prepínanie jazykov
- Lokalizované dátumy a čísla

**Knižnice:**
- `next-intl` alebo `react-i18next`

---

### 15. 📱 PWA (Progressive Web App)
**Riešenie:**
- Offline podpora
- Service Worker
- Installable app
- Push notifikácie

---

## 💡 UX vylepšenia

### 16. 🎯 Rýchle akcie a shortcuts
**Riešenie:**
- Keyboard shortcuts (už je základná implementácia)
- Kontextové menu (pravý klik)
- Drag & drop pre zmenu poradia
- Batch operácie s viacerými položkami

---

### 17. 🔍 Pokročilé filtrovanie
**Riešenie:**
- Multi-select filtre
- Uložené filtre
- Kombinované filtre (AND/OR)
- Dátumové rozsahy

---

### 18. 📋 Clipboard a kopírovanie
**Riešenie:**
- Kopírovanie čísla objednávky jedným klikom
- Kopírovanie všetkých údajov objednávky
- Rýchle kopírovanie do Excelu

---

### 19. 🎨 Vizuálne vylepšenia
**Riešenie:**
- Animácie a prechody
- Loading states (skeleton screens)
- Better error messages
- Success animations

---

### 20. 📱 Mobile app (voliteľné)
**Riešenie:**
- React Native app
- Push notifikácie
- Offline mode
- Barcode scanner v mobile app

---

## 🎯 Odporúčania na začiatok

**Najväčší dopad:**
1. **Rozšírený Dashboard** - používatelia uvidia všetko na jednom mieste
2. **Notifikácie** - používatelia nepremeškajú dôležité udalosti
3. **Vylepšené vyhľadávanie** - rýchlejšie nájdenie toho, čo hľadajú
4. **Responzívny design** - aplikácia bude použiteľná na mobiloch

**Najjednoduchšie na implementáciu:**
1. **Vylepšené vyhľadávanie s debouncing** - relatívne jednoduché
2. **Rozšírený Dashboard** - už existuje základ, len rozšíriť
3. **Keyboard shortcuts** - už je základná implementácia
4. **Vizuálne vylepšenia** - postupne

---

## 📝 Poznámky

- Všetky vylepšenia by mali byť implementované postupne
- Prioritizovať podľa používateľských potrieb
- Testovať každé vylepšenie pred nasadením
- Zbierať feedback od používateľov
