# 🔧 FIX: Production Scan - Odstránenie Navbaru

## ❗ Problém

Stránka `/production-scan` zobrazuje navbar, aj keď by nemala.

---

## ✅ Riešenie

### 1. **Vyčisti Next.js cache**

```bash
cd frontend
rm -rf .next
npm run dev
```

### 2. **Hard refresh v prehliadači**

Po reštarte servera:

- **Chrome/Edge:** Ctrl+Shift+R (Windows/Linux) alebo Cmd+Shift+R (Mac)
- **Firefox:** Ctrl+F5
- **Safari:** Cmd+Option+R

### 3. **Otvor v incognito mode**

Pre test otvor stránku v súkromnom okne:

```
http://localhost:3001/production-scan
```

---

## 🔍 Overenie

Layout súbor je **SPRÁVNY**:

```typescript
// frontend/app/(no-navbar)/layout.tsx
export default function NoNavbarLayout({ children }) {
  return (
    <html lang="sk">
      <body>
        <EmotionProvider>
          <main>{children}</main> {/* ✅ Žiadny <Navbar /> */}
          <ToastProvider />
        </EmotionProvider>
      </body>
    </html>
  );
}
```

**V zložke `(no-navbar)` NEMÁ Navbar komponent!**

---

## 🐛 Ak stále vidíš navbar:

### Možné príčiny:

1. **Next.js dev server cache**

   ```bash
   # Zastaviť server (Ctrl+C)
   rm -rf .next
   npm run dev
   ```

2. **Browser cache**

   - Hard refresh (Ctrl+Shift+R)
   - Alebo vyčisti cookies pre localhost

3. **Nesprávna URL**

   ```bash
   # ❌ ZLE:
   http://localhost:3001/production

   # ✅ SPRÁVNE:
   http://localhost:3001/production-scan
   ```

4. **Layout hierarchy**
   - Next.js môže používať родительský layout
   - Skontroluj že súbor `(no-navbar)/layout.tsx` existuje

---

## ✅ Finálny test

Po vyčistení cache a reštarte:

1. Otvor: `http://localhost:3001/production-scan`
2. **Nemala by byť žiadna modrá lišta hore**
3. **Mal by byť len:**
   - Gradientové fialové pozadie
   - Modrý header "🏭 VÝROBNÁ STANICA"
   - Scanner input
   - Tabuľka s položkami

---

## 🎯 Ako má vyzerať

```
┌────────────────────────────────────────────────┐
│ (Fialové gradientové pozadie celej stránky)   │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │  🏭 VÝROBNÁ STANICA                      │ │
│  │  Skenuj čiarový kód pre označenie výroby │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │ 📱 [Naskenuj čiarový kód____________]   │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │ 📋 Aktívne objednávky     [🔄 Obnoviť]  │ │
│  ├──────────────────────────────────────────┤ │
│  │ Tabuľka s položkami...                   │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  🔒 Výrobná stanica - Žiadny prístup...       │
└────────────────────────────────────────────────┘

❌ ŽIADNA MODRÁ LIŠTA HORE (navbar)!
```

---

## 💡 Alternatívne riešenie

Ak aj po vyčistení cache stále vidíš navbar, môžeš pridať metadata:

```typescript
// frontend/app/(no-navbar)/production-scan/page.tsx
export const metadata = {
  title: 'Výrobná stanica',
};
```

A do layout pridať:

```typescript
// frontend/app/(no-navbar)/layout.tsx
export const metadata = {
  title: 'Výrobná stanica - Matratex',
};
```

---

## ✅ Hotovo!

Po vyčistení cache by navbar mal zmiznúť.

Ak problém pretrváva, daj vedieť!
