# Oprava Hydration Mismatch chyby

## Dátum: 14. októbra 2025

### ❌ Problém: Hydration Failed Error

**Chybová správa:**

```
Error: Hydration failed because the server rendered HTML didn't match the client.
```

**Príčina:**

- MUI (Material-UI) s Emotion CSS generoval rôzne štýly na serveri a klientovi
- Next.js App Router vyžaduje špeciálny setup pre Emotion cache
- ThemeProvider používal `localStorage` bez kontroly mounted state

---

## ✅ Vykonané opravy

### 1. **Emotion Provider - Prechod na AppRouterCacheProvider**

**Problém:** Starý `CacheProvider` z `@emotion/react` nie je kompatibilný s Next.js 15 App Router.

**Riešenie:**

- Nainštalovaný balíček `@mui/material-nextjs`
- Nahradený `CacheProvider` za `AppRouterCacheProvider`
- Odstránený starý `emotion-cache.ts` súbor

**Pred:**

```typescript
// EmotionProvider.tsx
import { CacheProvider } from '@emotion/react';
import createEmotionCache from './emotion-cache';

const clientSideEmotionCache = createEmotionCache();

export default function EmotionProvider({ children }: { children: ReactNode }) {
  return (
    <CacheProvider value={clientSideEmotionCache}>{children}</CacheProvider>
  );
}
```

**Po:**

```typescript
// EmotionProvider.tsx
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';

export default function EmotionProvider({ children }: { children: ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ key: 'css' }}>
      {children}
    </AppRouterCacheProvider>
  );
}
```

---

### 2. **ThemeProvider - Prevencia hydration mismatch s localStorage**

**Problém:**

- `localStorage.getItem('theme')` nie je dostupný na serveri
- Server renderoval vždy light theme, ale klient mohol načítať dark theme z localStorage
- Rozdiel medzi server/client renderom spôsobil hydration mismatch

**Riešenie:**

- Pridaný `mounted` state flag
- Theme sa aplikuje až po mount na klientovi
- Použitá premenná `effectiveDarkMode` pre konzistentné renderovanie

**Pred:**

```typescript
export default function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }
  }, []);

  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light', // ❌ Rozdielne na serveri a klientovi
      // ...
    },
  });
}
```

**Po:**

```typescript
export default function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // ✅ Označ že sme na klientovi
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }
  }, []);

  // ✅ Použiť dark mode len ak sme mounted
  const effectiveDarkMode = mounted && isDarkMode;

  const theme = createTheme({
    palette: {
      mode: effectiveDarkMode ? 'dark' : 'light', // ✅ Konzistentné
      // ...
    },
  });
}
```

---

## 📦 Nové závislosti

```json
{
  "dependencies": {
    "@mui/material-nextjs": "^6.x.x"
  }
}
```

**Inštalácia:**

```bash
npm install @mui/material-nextjs --save
```

---

## 🔍 Upravené súbory

1. ✅ `frontend/components/EmotionProvider.tsx` - Prechod na AppRouterCacheProvider
2. ✅ `frontend/components/ThemeProvider.tsx` - Pridaný mounted state
3. ❌ `frontend/components/emotion-cache.ts` - Odstránený (už nepotrebný)

---

## 📊 Výsledok

### Pred opravou:

```
❌ Hydration failed error v konzole
❌ React musí regenerovať celý strom na klientovi
❌ Výkonnostné problémy
❌ Flash of unstyled content (FOUC)
```

### Po oprave:

```
✅ Bez hydration errors
✅ Server a client renderujú identický HTML
✅ Rýchlejšie načítanie
✅ Plynulý prechod medzi light/dark mode
```

---

## 🚀 Testovanie

Pre overenie že oprava funguje:

1. **Otvor konzolu browsera (F12)**

   - Nemali by sa objaviť žiadne hydration errors
   - Žiadne warnings o mismatch

2. **Skontroluj Network tab**

   - HTML z servera by mal mať správne MUI classes
   - Žiadne "regeneration" na klientovi

3. **Test dark mode**
   - Prepni na dark mode
   - Obnov stránku
   - Dark mode by mal zostať aktívny bez flicker

---

## 💡 Dôležité poznámky

### Prečo AppRouterCacheProvider?

Next.js 13+ App Router používa React Server Components (RSC). Emotion cache musí byť správne synchronizovaný medzi serverom a klientom. `@mui/material-nextjs` poskytuje optimalizovaný provider špecificky pre Next.js App Router.

### Prečo mounted state v ThemeProvider?

Server nemá prístup k `localStorage`, takže nemôže vedieť aký theme si užívateľ vybral. Aby sme predišli hydration mismatch:

1. Server vždy renderuje light theme
2. Klient sa mountuje s light theme
3. Po mounte klient načíta preferovaný theme z localStorage
4. Theme sa plynulo prepne (ak je potrebné)

To zabezpečuje že server a klient renderujú identický HTML pri initial load.

---

## 🔧 Ďalšie kroky (voliteľné)

Pre ešte lepší výkon:

1. **Server-side theme detection**

   - Použiť cookie namiesto localStorage
   - Server môže prečítať cookie a renderovať správny theme hneď

2. **CSS variables pre theming**

   - Menej JavaScript, viac CSS
   - Rýchlejší prepínanie themov

3. **Prefers-color-scheme**
   - Automatická detekcia system preference
   - Lepší UX pre nových užívateľov

---

## 📚 Ďalšie zdroje

- [Next.js App Router + MUI](https://mui.com/material-ui/integrations/nextjs/)
- [React Hydration Mismatch](https://react.dev/link/hydration-mismatch)
- [Emotion Cache Configuration](https://emotion.sh/docs/cache-provider)

---

_Posledná aktualizácia: 14. októbra 2025_
