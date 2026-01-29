# 🔧 Funkčné vylepšenia - Odporúčania

## 🎯 Top Priority (Najdôležitejšie vylepšenia)

### 1. ✅ Export do Excel/CSV
**Problém:** Používatelia nemajú možnosť exportovať dáta do Excelu.

**Riešenie:** Pridať export funkciu pre:
- Objednávky (s filtrami a vyhľadávaním)
- Faktúry (s filtrami)
- Zákazníci
- Výrobné položky
- Dodávky

**Implementácia:**
```typescript
// utils/exportToExcel.ts
import * as XLSX from 'xlsx';

export function exportToExcel(data: any[], filename: string) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
```

**Kde pridať:**
- `orders/page.tsx` - tlačidlo "Exportovať do Excelu"
- `invoices/page.tsx` - tlačidlo "Exportovať faktúry"
- `delivery/page.tsx` - export dodávok
- Dashboard - export štatistík

---

### 2. ✅ Pokročilé filtrovanie a vyhľadávanie
**Problém:** Základné filtrovanie, chýba pokročilé vyhľadávanie.

**Riešenie:**
- **Multi-select filtre** - možnosť vybrať viacero stavov naraz
- **Dátumové rozsahy** - filtrovanie podľa dátumov (od-do)
- **Viacero polí naraz** - vyhľadávanie v objednávkach, faktúrach, zákazníkoch súčasne
- **Uložené filtre** - možnosť uložiť a znovu použiť často používané filtre
- **Rýchle filtre** - preset tlačidlá (dnes, tento týždeň, tento mesiac)

**Príklad:**
```tsx
// AdvancedFilters komponent
<Box>
  <DateRangePicker
    label="Dátum objednávky"
    value={dateRange}
    onChange={setDateRange}
  />
  <MultiSelect
    label="Stavy"
    options={ORDER_STATUSES}
    value={selectedStatuses}
    onChange={setSelectedStatuses}
  />
  <Button onClick={saveFilter}>Uložiť filter</Button>
</Box>
```

---

### 3. ✅ Hromadné operácie (Bulk Operations)
**Status:** Čiastočne implementované na home page
**Vylepšenie:** Rozšíriť na viac stránok a operácií

**Čo pridať:**
- **Hromadná zmena stavu** - vybrať viac položiek a zmeniť stav naraz (už je na home)
- **Hromadné mazanie** - zmazať viac objednávok/faktúr naraz
- **Hromadné archivovanie** - archivovať viac položiek
- **Hromadné vytvorenie faktúr** - vytvoriť faktúry pre viac objednávok
- **Hromadné tlačenie** - vytlačiť viac dokumentov naraz

**Kde pridať:**
- `orders/page.tsx` - hromadné operácie s objednávkami
- `invoices/page.tsx` - hromadné operácie s faktúrami
- `delivery/page.tsx` - hromadné operácie s dodávkami

---

### 4. ✅ Zoradenie a triedenie tabuliek
**Problém:** Nie všetky tabuľky majú možnosť zoradiť podľa stĺpcov.

**Riešenie:** Pridať `TableSortLabel` do všetkých tabuliek:
- Zoradiť podľa dátumu (vzostupne/klesajúco)
- Zoradiť podľa ceny
- Zoradiť podľa zákazníka
- Zoradiť podľa čísla objednávky/faktúry

**Príklad:**
```tsx
<TableSortLabel
  active={sortBy === 'date'}
  direction={sortOrder}
  onClick={() => handleSort('date')}
>
  Dátum
</TableSortLabel>
```

---

### 5. ✅ Kopírovanie/Duplikovanie objednávok
**Problém:** Pri vytváraní podobnej objednávky musí používateľ všetko zadať znovu.

**Riešenie:**
- Tlačidlo "Duplikovať objednávku" na detaili objednávky
- Automatické vytvorenie novej objednávky s rovnakými údajmi
- Možnosť upraviť pred uložením

**Implementácia:**
```tsx
const handleDuplicateOrder = async (orderId: number) => {
  const order = await fetchOrder(orderId);
  router.push(`/orders/new?duplicate=${orderId}`);
  // alebo
  const newOrder = { ...order, order_number: null, id: null };
  setFormData(newOrder);
};
```

---

### 6. ✅ Rýchle akcie (Quick Actions)
**Problém:** Niektoré často používané akcie vyžadujú viacero kliknutí.

**Riešenie:** Pridať rýchle akcie:
- **Rýchle vytvorenie faktúry** - z objednávky jedným klikom
- **Rýchle zmena stavu** - dropdown priamo v tabuľke
- **Rýchle poznámky** - pridanie poznámky bez otvorenia detailu
- **Rýchle zobrazenie** - preview bez otvorenia celej stránky

---

### 7. ✅ Uložené vyhľadania/Filtre
**Problém:** Používatelia opakovane nastavujú rovnaké filtre.

**Riešenie:**
- Uložiť často používané filtre
- Rýchle tlačidlá pre preset filtre
- Export uložených filtrov

---

### 8. ✅ Pokročilé štatistiky a reporty
**Status:** Základné štatistiky sú v dashboard
**Vylepšenie:**
- **Časové porovnania** - porovnanie s predchádzajúcim obdobím
- **Trendy** - graf vývoja v čase
- **Predpovede** - odhad budúcich objednávok
- **Export reportov** - PDF/Excel reporty

---

## 📊 Stredná priorita

### 9. ⚠️ Pagination na všetkých stránkach
**Status:** Už je v invoices
**Vylepšenie:** Pridať na:
- `orders/page.tsx` - ak je veľa objednávok
- `page.tsx` (home) - ak je veľa položiek
- `production/page.tsx`
- `delivery/page.tsx`

---

### 10. ⚠️ Pokročilé notifikácie
**Status:** Základné toast notifikácie sú
**Vylepšenie:**
- **Browser notifikácie** - pre dôležité udalosti
- **Email notifikácie** - pre kritické zmeny
- **Pripomienky** - napr. faktúry po splatnosti
- **Zoznam notifikácií** - história notifikácií

---

### 11. ⚠️ Verzia a história zmien
**Riešenie:**
- Uložiť históriu zmien objednávok/faktúr
- Zobraziť, kto a kedy urobil zmenu
- Možnosť vrátiť zmeny (undo)

---

### 12. ⚠️ Šablóny a predlohy
**Riešenie:**
- Šablóny objednávok pre častých zákazníkov
- Predlohy faktúr
- Rýchle vytvorenie z šablóny

---

## 🔄 Nízka priorita (Nice to have)

### 13. 🔄 Drag & Drop pre zmeny poradia
**Riešenie:** Umožniť používateľom zmeniť poradie položiek v objednávke

---

### 14. 🔄 Pokročilé tlačenie
**Riešenie:**
- Vlastné tlačové šablóny
- Batch tlač
- Tlač s vlastnými nastaveniami

---

### 15. 🔄 API pre externé integrácie
**Riešenie:**
- REST API dokumentácia
- Webhooky pre notifikácie
- Integrácia s externými systémami

---

## 📝 Odporúčaný postup implementácie

### Fáza 1 (Týždeň 1-2):
1. ✅ Export do Excel/CSV
2. ✅ Pokročilé filtrovanie (dátumové rozsahy)
3. ✅ Zoradenie tabuliek

### Fáza 2 (Týždeň 3-4):
4. ✅ Hromadné operácie na viac stránkach
5. ✅ Duplikovanie objednávok
6. ✅ Uložené filtre

### Fáza 3 (Mesiac 2):
7. ✅ Pokročilé štatistiky
8. ✅ Rýchle akcie
9. ✅ Pagination všade

---

## 💡 Konkrétne príklady implementácie

### Export do Excel
```typescript
// hooks/useExportToExcel.ts
import * as XLSX from 'xlsx';

export function useExportToExcel() {
  const exportData = (data: any[], filename: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return { exportData };
}
```

### Pokročilé filtre
```typescript
// components/AdvancedFilters.tsx
interface AdvancedFilters {
  dateRange: { from: Date | null; to: Date | null };
  statuses: string[];
  customers: number[];
  priceRange: { min: number; max: number };
}

export function AdvancedFilters({ filters, onChange }: Props) {
  // ...
}
```

### Duplikovanie objednávky
```typescript
// v orders/[id]/page.tsx
const handleDuplicate = async () => {
  const newOrder = {
    ...order,
    order_number: null,
    id: null,
    issue_date: new Date().toISOString(),
    order_items: order.order_items.map(item => ({
      ...item,
      id: null,
    })),
  };
  router.push(`/orders/new?data=${encodeURIComponent(JSON.stringify(newOrder))}`);
};
```

---

## 🎯 Zhrnutie

**Najdôležitejšie vylepšenia:**
1. Export do Excel/CSV - veľký benefit pre používateľov
2. Pokročilé filtrovanie - uľahčí prácu s veľkým množstvom dát
3. Hromadné operácie - zrýchli prácu
4. Zoradenie tabuliek - lepšia navigácia
5. Duplikovanie objednávok - uľahčí prácu

**ROI (Return on Investment):**
- **Vysoký:** Export, Hromadné operácie, Duplikovanie
- **Stredný:** Pokročilé filtre, Zoradenie, Pagination
- **Nízky:** Drag & Drop, Pokročilé tlačenie, API
