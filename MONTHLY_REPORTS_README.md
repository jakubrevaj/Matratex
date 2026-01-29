# 📊 Mesačné Reporty - Dokumentácia

## ✅ Implementované!

Systém teraz automaticky generuje a odosiela mesačné reporty emailom.

---

## 🔧 Konfigurácia

### 1. Nastavenie emailu v `.env`

```bash
# backend/.env
OWNER_EMAIL=revaj@matratex.sk
```

**⚠️ DÔLEŽITÉ:** Zmeň `revaj@matratex.sk` na tvoju emailovú adresu!

---

## ⏰ Automatické posielanie

**Kedy:** Každý **1. deň v mesiaci** o **2:00 ráno**

```
Január 1, 2:00   → Report za December
Február 1, 2:00  → Report za Január
Marec 1, 2:00    → Report za Február
...atď
```

---

## 📧 Čo dostaneš emailom

### Subject:

```
📊 Mesačný report - August 2025
```

### Obsah:

1. **Tržby**

   - Celková suma
   - Porovnanie s predošlým mesiacom
   - Porovnanie s vlaňajším rokom

2. **Objednávky**

   - Počet objednávok
   - Priemerná hodnota
   - Počet zákazníkov

3. **Výroba**

   - Vyrobených položiek
   - Dokončených objednávok

4. **Faktúry**

   - Zaplatené / Nezaplatené
   - **⚠️ Upozornenia na faktúry po splatnosti**

5. **TOP 5 Zákazníkov**

   - Názov, tržby, počet objednávok

6. **TOP 5 Produktov**
   - Názov, počet kusov, tržby

### Príloha:

📎 **Excel súbor** s detailnými dátami (`report-2025-08.xlsx`)

---

## 🧪 Manuálne testovanie

Ak chceš odoslať testovací report BEZ čakania na 1. deň:

```typescript
// Otvor NestJS konzolu alebo vytvor dočasný endpoint
// backend/src/app.controller.ts (len na testovanie!)

@Get('test-monthly-report')
async testMonthlyReport() {
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  await this.reportsService.sendMonthlyReport(lastMonth);
  return { message: 'Report odoslaný' };
}
```

Potom:

```bash
curl http://localhost:3002/test-monthly-report
```

**⚠️ Nezabudni odstrániť tento endpoint po testovaní!**

---

## 🔐 Bezpečnosť

✅ **Report vidí JEN majiteľ** (OWNER_EMAIL)  
✅ **Žiadny endpoint pre stiahnutie**  
✅ **Žiadne tlačidlo v UI**  
✅ **Zamestnanci NEVIDIA finančné dáta**  
✅ **Generuje sa v noci** (mimo pracovnej doby)

---

## 📊 Príklad emailu

```
╔════════════════════════════════════╗
║  MESAČNÝ REPORT - August 2025      ║
║       Matratex s.r.o.              ║
╚════════════════════════════════════╝

💰 TRŽBY
12,150.00 €
▲ +8.5% vs júl 2025
▲ +15.2% vs august 2024

📋 OBJEDNÁVKY
• Celkový počet: 45 objednávok
• Priemerná hodnota: 270.00 €
• Aktívnych zákazníkov: 37

🏭 VÝROBA
• Vyrobených položiek: 156 ks
• Dokončených objednávok: 42

🧾 FAKTÚRY
• Zaplatených: 38 faktúr
• Nezaplatených: 3 (450.00 €)
• Po splatnosti: 1 (150.00 €) ⚠️

⚠️ UPOZORNENIA - Faktúry po splatnosti
┌─────────────┬──────────────┬─────────┬──────────┐
│ Faktúra     │ Zákazník     │ Suma    │ Dní      │
├─────────────┼──────────────┼─────────┼──────────┤
│ 20250802    │ Firma XYZ    │ 150.00€ │ 12 dní   │
└─────────────┴──────────────┴─────────┴──────────┘

🏆 TOP 5 ZÁKAZNÍKOV
1. Firma ABC s.r.o.     1,250.00 €  (5 objednávok)
2. XYZ Company            980.00 €  (3 objednávky)
3. Matrace Slovakia       850.00 €  (4 objednávky)
...

📦 TOP 5 PRODUKTOV
1. Penový matrac 200x90x10    45 ks    3,600.00 €
2. Latexový matrac 180x80     32 ks    4,800.00 €
3. Kokosový matrac 190x90     28 ks    2,240.00 €
...

📎 Príloha: report-2025-08.xlsx
```

---

## 📁 Excel súbor obsahuje

### Sheet 1: Súhrn

- Všetky číselné štatistiky
- Prehľadne v tabuľke

### Sheet 2: TOP Zákazníci

- Kompletný zoznam všetkých zákazníkov
- Zoradené podľa tržieb

### Sheet 3: TOP Produkty

- Kompletný zoznam všetkých produktov
- Zoradené podľa tržieb

---

## 🐛 Riešenie problémov

### Email sa neodosiela

1. **Skontroluj email konfiguráciu:**

   ```bash
   # backend/.env
   EMAIL_HOST=mail.matratex.sk
   EMAIL_PORT=587
   EMAIL_USER=matratex@matratex.sk
   EMAIL_PASS=tvoje_heslo
   OWNER_EMAIL=revaj@matratex.sk
   ```

2. **Skontroluj logy:**

   ```bash
   # Hľadaj v konzole servera:
   📊 Generujem mesačný report...
   ✅ Mesačný report odoslaný na revaj@matratex.sk

   # Alebo chyby:
   ❌ Chyba pri odosielaní mesačného reportu: ...
   ```

3. **Test email connection:**
   ```bash
   curl http://localhost:3002/invoices/test-email
   ```

### Report obsahuje nesprávne dáta

- Skontroluj databázu
- Overte že faktúry majú správne `status` a `due_date`
- Overte že objednávky majú `issue_date`

---

## 📝 Zmeny v budúcnosti

Ak chceš upraviť:

### Zmeniť email príjemcu

```bash
# backend/.env
OWNER_EMAIL=novy@email.sk
```

### Zmeniť čas odosielania

```typescript
// backend/src/app.service.ts
@Cron('0 2 1 * *')  // Teraz: 1. deň mesiaca o 2:00
                     // Zmeniť na napr: '0 8 1 * *' pre 8:00
```

### Vypnúť automatické reporty

```typescript
// backend/src/app.service.ts
// Zakomentuj alebo zmaž celý @Cron blok
```

### Upraviť HTML template

```typescript
// backend/src/reports/reports.service.ts
// Metóda: generateEmailReport()
```

---

## ✅ Hotovo!

Report bude automaticky poslaný každý mesiac.

**Prvý report dostaneš:** 1. Február 2025 o 2:00 (report za Január)

Ak potrebuješ niečo zmeniť, kontaktuj vývojára! 🚀
