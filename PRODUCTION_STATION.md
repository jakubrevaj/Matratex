# 🏭 Výrobná stanica - Dokumentácia

## 🎯 Účel

Dedikovaná stránka pre výrobný úsek **BEZ prístupu** k ostatným častiam systému.

---

## 🔗 URL

```
http://localhost:3001/production-scan
```

---

## ✅ Funkcie

### 1. **Skenovanie čiarových kódov**

- Automatický focus na input pole
- Stlač Enter alebo naskenuj čiarový kód
- Okamžitá spätná väzba

### 2. **Zobrazenie aktívnych objednávok**

- Všetky položky vo výrobe (`in-production`)
- Všetky dokončené položky (`completed`)
- Automatické obnovenie každých 5 minút

### 3. **Detailné informácie**

- Číslo objednávky
- Zákazník
- Produkt + materiál
- Rozmery
- Progres (koľko hotovo / celkovo)
- Aktuálny stav (farebne označený)

---

## 🔐 Bezpečnosť

✅ **NEMÁ Navbar** - žiadne navigačné menu  
✅ **Žiadne linky** - nedá sa prejsť na iné stránky  
✅ **Žiadne finančné dáta** - len výrobné info  
✅ **Len čítanie + skenovanie** - nemôžu mazať/upravovať objednávky  
✅ **Samostatný layout** - v zložke `(no-navbar)`

---

## 🎨 Dizajn

### Farebné schémy podľa stavu:

| Stav         | Farba            | Význam                      |
| ------------ | ---------------- | --------------------------- |
| 🟡 Do výroby | Žltá (#fff8e1)   | Čaká na spustenie           |
| 🔵 Vo výrobe | Modrá (#e3f2fd)  | Práve sa vyrába             |
| 🟢 Hotová    | Zelená (#e8f5e8) | Dokončené, ready na balenie |

### Veľký font

- Scanner input: **1.5rem** - ľahké čítanie
- Feedback messages: **H6** - viditeľné z diaľky
- Tlačidlá: **Veľké a farebné**

### Gradientové pozadie

- Profesionálny vzhľad
- Ľahko rozlíšiteľné od administratívnej časti

---

## 📋 Čo vidí výroba

```
╔═══════════════════════════════════════════════╗
║          🏭 VÝROBNÁ STANICA                   ║
║   Skenuj čiarový kód pre označenie výroby     ║
╚═══════════════════════════════════════════════╝

┌───────────────────────────────────────────────┐
│ 📱 [Naskenuj čiarový kód]                     │
└───────────────────────────────────────────────┘

✅ Položka označená! Vyrobené: 5/10

┌───────────────────────────────────────────────┐
│ 📋 Aktívne objednávky vo výrobe               │
│                              [🔄 Obnoviť]      │
├───────────────────────────────────────────────┤
│ Objednávka │ Zákazník │ Produkt │ Progres     │
├────────────┼──────────┼─────────┼─────────────┤
│ 20250114001│ ABC s.r.o│ Penový  │ 5/10 🔵     │
│ 20250114002│ XYZ Comp │ Latexový│ 3/5  🔵     │
│ 20250114003│ Hotel    │ Kokosový│ 8/8  🟢     │
└────────────┴──────────┴─────────┴─────────────┘

🔒 Výrobná stanica - Žiadny prístup k ostatným častiam systému
```

---

## 🔄 Workflow

1. **Výroba dostane štítky** (z `/production`)
2. **Otvorí `/production-scan`** (na tablete/počítači)
3. **Skenuje čiarový kód** z hotového matraca
4. **Systém automaticky:**
   - Zvýši count (+1)
   - Ak je hotovo (count = quantity) → zmení status na `completed`
   - Zobrazí feedback "✅ Položka označená!"
5. **Zoznam sa automaticky obnoví**
6. **Balenie vidí zelené položky** (completed) a môže začať baliť

---

## 🖥️ Odporúčané nasadenie

### Pre výrobný úsek:

1. **Tablet/počítač pri výrobe**

   - Pevne na stole
   - Vždy otvorené na `/production-scan`
   - Prihlásenie nie je potrebné (pre jednoduchosť)

2. **USB Barcode scanner**

   - Funguje ako klávesnica
   - Automaticky odošle Enter
   - Žiadna konfigurácia

3. **Veľký monitor (voliteľne)**
   - Zoznam aktívnych položiek viditeľný z diaľky
   - Všetci vidia čo treba dokončiť

---

## 🚀 Ako nastaviť

### 1. Pre výrobu daj tablet s URL:

```
http://[IP_SERVERA]:3001/production-scan
```

Príklad:

```
http://192.168.1.100:3001/production-scan
```

### 2. V Nextjs config povoľ prístup z LAN:

```typescript
// frontend/package.json - už máš:
"start": "next start -p 3001 -H 0.0.0.0"
```

✅ Už je nastavené! Frontend počúva na všetkých IP adresách.

### 3. (Voliteľne) Pridaj do záložiek

- Otvor Chrome na tablete
- Prejdi na `/production-scan`
- Menu → Pridať na plochu
- Bude fungovať ako appka

---

## 💡 Tipy na zlepšenie UX

### 1. **Zvukové efekty**

```typescript
// Pri úspešnom skene:
const successSound = new Audio('/sounds/success.mp3');
successSound.play();

// Pri chybe:
const errorSound = new Audio('/sounds/error.mp3');
errorSound.play();
```

### 2. **Vibrácie (na mobile)**

```typescript
// Pri skene:
if (navigator.vibrate) {
  navigator.vibrate(200); // 200ms vibrácia
}
```

### 3. **Fullscreen mode**

```typescript
// Tlačidlo "Celá obrazovka"
document.documentElement.requestFullscreen();
```

---

## 🐛 Riešenie problémov

### Scanner nefunguje

**Problém:** Čiarový kód sa nezobrazuje  
**Riešenie:**

- Klikni do input poľa (auto-focus by mal fungovať)
- Skontroluj že scanner je v "keyboard emulation" mode

### Zoznam sa neaktualizuje

**Problém:** Staré dáta  
**Riešenie:**

- Klikni "🔄 Obnoviť"
- Alebo počkaj 5 minút (auto-refresh)

### Backend nedostupný

**Problém:** "Network error"  
**Riešenie:**

- Skontroluj že backend beží na porte 3002
- Skontroluj IP adresu servera
- Overte firewall nastavenia

---

## 📊 Štatistiky

Po nasadení sleduj:

- Koľko položiek sa označí denne
- Či výroba používa scanner (alebo manuálne?)
- Aké chyby sa vyskytujú

---

## ✅ Hotovo!

Výrobná stanica je pripravená na použitie.

**URL:** `http://localhost:3001/production-scan`

**Benefit:**

- ✅ Jednoduché používanie
- ✅ Žiadne komplikované menu
- ✅ Bezpečné (žiadny prístup k financiám)
- ✅ Rýchle označovanie výroby
- ✅ Prehľad aktívnych položiek
