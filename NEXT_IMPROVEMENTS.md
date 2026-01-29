# 💡 Ďalšie nápady na vylepšenie

## 🔥 TOP Priority (Užitočné hneď)

### 1. **Export do Excelu**

**Prečo:** Pre účtovníčku, mesačné reporty

```typescript
// Backend endpoint:
@Get('invoices/export/excel')
async exportInvoices(@Res() res: Response) {
  const invoices = await this.invoicesService.findAll();
  // Export pomocou ExcelJS
}
```

**Benefit:** Rýchle reporty bez kopírovania

### 2. ~~**Tlač štítkov hromadne**~~ ✅ **UŽ MÁTE!**

**Status:** Už implementované! 🎉

```typescript
// moveAllToInProduction() už generuje:
- JEDNO PDF s VŠETKÝMI štítkami
- A4 stránka = 24 štítkov (3x8)
- Pre každý matrac 3 štítky (3 pracoviská)
- Automatické pridávanie stránok
- Súbor: pdfs/stitky-2025-01-14_14-30-00.pdf
```

**Benefit:** Už ušetrujete čas! Len stlačiť "Presunúť do výroby" → vytlačiť PDF

### 3. **Dashboard widgety**

**Prečo:** Rýchly prehľad pri príchode do práce

```typescript
// Homepage môže mať:
- "Dnes treba vyrobiť: 23 položiek"
- "Čakajú na faktúru: 5 objednávok"
- "Nezaplatené faktúry: 3 (suma: 450€)"
- Quick action buttons
```

**Benefit:** Nemusíš klikať do každej sekcie

### 4. **Automatické zálohovanie DB**

**Prečo:** Ochrana pred stratou dát

```bash
# Cron job v app.service.ts
@Cron('0 2 * * *') // 2:00 ráno
async backupDatabase() {
  // pg_dump do súboru
  // Skopírovať na externý disk/cloud
}
```

**Benefit:** Spíš pokojne

### 5. **Notifikácie pre hotové položky**

**Prečo:** Balenie môže hneď začať baliť

```typescript
// Keď výroba označí položku ako "completed":
- Desktop notifikácia
- Alebo zvukový signál
- Alebo email pre balenie
```

**Benefit:** Rýchlejší workflow

---

## 🎯 Stredná priorita (Nice to have)

### 6. **Keyboard shortcuts všade**

```typescript
// Globálne:
- Ctrl+N: Nová objednávka
- Ctrl+F: Focus search
- Ctrl+S: Uložiť (kde je to relevantné)
- Esc: Zavrieť modal
- F5: Refresh (už funguje)
```

### 7. **Batch PDF generovanie**

```typescript
// Endpoint pre viac faktúr naraz:
POST / invoices / batch / pdf;
{
  invoiceIds: [1, 2, 3, 4, 5];
}
// Vráti ZIP s PDF súbormi
```

### 8. **Sledovanie zmien (Audit log)**

```typescript
// Kto, kedy, čo zmenil:
"Jakub Revaj zmenil stav objednávky #001 z 'pending' na 'completed' o 14:23";
```

### 9. **Vyhľadávanie všade**

```typescript
// Globálna search bar v Navbare:
- Hľadaj v objednávkach, faktúrach, zákazníkoch naraz
- Ctrl+K na otvorenie
```

### 10. **Mobile optimalizácia**

```typescript
// Ak niekto kontroluje na mobile/tablete:
- Väčšie tlačidlá
- Swipe akcie
- Offline mode pre barcode scanner
```

---

## 📊 Analytika & Reporty

### 11. **Mesačné reporty automaticky**

```typescript
// Koniec mesiaca automaticky vygeneruj:
- PDF report: "August 2025 - Výroba"
- Počet objednávok, tržby, top zákazníci
- Graf trendov
```

### 12. **Výrobná efektivita**

```typescript
// Dashboard metriky:
- Priemerný čas výroby položky
- Najrýchlejší/najpomalší produkt
- Produktivita týždňov
```

### 13. **Cash flow prehľad**

```typescript
// Vizualizácia:
- Grafy príjmov vs výdavkov
- Predpoveď cash flow na ďalší mesiac
- Upozornenie na veľké nezaplatené faktúry
```

---

## 🛠️ Technické vylepšenia

### 14. **Websockets pre real-time updates**

```typescript
// Keď niekto zmení stav položky:
- Všetci vidia zmenu okamžite (bez F5)
- Vhodné pre výrobu + balenie spolupráca
```

### 15. **PWA (Progressive Web App)**

```typescript
// Možnosť "nainštalovať" ako appku:
- Rýchlejší štart
- Offline cache
- Push notifikácie
```

### 16. **Dark mode**

```typescript
// Pre prácu vo večerných/nočných zmenách
- Toggle v Navbare
- Ušetrí oči
```

---

## 🚀 Automatizácia

### 17. **Auto-archivovanie starých objednávok**

```typescript
// Už máš pre "invoiced"
// Pridaj aj:
- Archivovať objednávky staršie ako 90 dní
- Upratovanie temp súborov
```

### 18. **Email remaindery automaticky**

```typescript
// Už máš PaymentTracking
// Rozšír:
- Pošli upomienku automaticky po 7, 14, 30 dňoch
- Eskalácia pre veľké dlhy
```

### 19. **Predpovedanie zásoby materiálu**

```typescript
// Ak sleduješ spotrebu:
- "O 2 týždne dôjde penový materiál XY"
- Alert pre nákup
```

---

## 💰 ROI vylepšenia (čo najviac ušetrí času)

| Funkcia           | Ušetrený čas | Náročnosť | Odporúčam     |
| ----------------- | ------------ | --------- | ------------- |
| Export do Excelu  | 2h/mesiac    | Nízka     | ✅ Áno        |
| ~~Hromadná tlač~~ | -            | -         | ✅ UŽ MÁTE    |
| Dashboard widgety | 1h/týždeň    | Nízka     | ✅ Áno        |
| Auto zálohy       | -            | Nízka     | ✅ Áno        |
| Notifikácie       | 30min/deň    | Stredná   | ⚠️ Možno      |
| Websockets        | 10min/deň    | Vysoká    | ❌ Zatiaľ nie |
| Mesačné reporty   | 3h/mesiac    | Stredná   | ✅ Áno        |
| Audit log         | -            | Stredná   | ⚠️ Možno      |

---

## 🎯 Moja TOP 4 odporúčaní:

1. **✅ Export do Excelu** (najrýchlejšie na implementáciu, okamžitá value)
2. **✅ Dashboard widgety** (lepší UX každý deň)
3. **✅ Auto zálohy DB** (bezpečnosť)
4. **✅ Mesačné reporty** (úspora času majiteľovi)

~~5. Hromadná tlač štítkov~~ - **UŽ MÁTE implementované!** 🎉

---

## 📝 Poznámky

**Čo NEOPRAVOVAŤ:**

- Všetko funguje dobre
- Nerobím "over-engineering"
- Pridávaj len čo **skutočne** použijú

**Ak chceš niečo implementovať:**

1. Začni s Excelom (najjednoduchšie)
2. Potom Dashboard widgety
3. Zvyšok podľa potreby

**Potrebné balíčky:**

```bash
npm install exceljs        # Pre Excel export
npm install socket.io      # Pre websockets (ak chceš)
npm install node-cron      # Pre lepší cron (už máš @nestjs/schedule)
```
