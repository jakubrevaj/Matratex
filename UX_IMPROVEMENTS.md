# 🎨 UX Vylepšenia z pohľadu používateľa

## 🎯 Hlavné oblasti na zlepšenie

### 1. ✅ Empty States (Prázdne stavy)
**Problém:** Keď nie sú žiadne dáta, používateľ vidí prázdnu tabuľku bez vysvetlenia.

**Riešenie:** Pridať informačné správy keď nie sú žiadne výsledky:
- "Nenašli sa žiadne objednávky" + ikona + akcia (napr. "Vytvoriť novú objednávku")
- "Žiadne výsledky vyhľadávania" + návrh na zmenenie filtrov
- "Zatiaľ žiadne položky" s pomocným textom

**Príklady:**
```tsx
{filteredOrders.length === 0 && !loading && (
  <Box sx={{ textAlign: 'center', py: 8 }}>
    <Typography variant="h6" color="text.secondary" gutterBottom>
      📭 Nenašli sa žiadne objednávky
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
      {search || statusFilter 
        ? 'Skúste zmeniť filtre alebo vyhľadávanie'
        : 'Začnite vytvorením novej objednávky'}
    </Typography>
    {!search && !statusFilter && (
      <Button 
        variant="contained" 
        onClick={() => router.push('/orders/new')}
      >
        ➕ Vytvoriť novú objednávku
      </Button>
    )}
  </Box>
)}
```

---

### 2. ✅ Confirmation Dialógy (Potvrdzovacie dialógy)
**Problém:** Používa sa natívny `confirm()` a `alert()`, ktoré sú zastarané a nekonzistentné s dizajnom.

**Riešenie:** Nahradiť MUI Dialog komponentom alebo toast s potvrdením.

**Príklady miest:**
- `orders/[id]/page.tsx` - mazanie objednávky (riadok 141, 130)
- `deleted-orders/page.tsx` - obnovenie/trvalé mazanie (riadok 74, 88)
- `OrderForm.tsx` - mazanie objednávky (riadok 1208)
- `delivery/page.tsx` - hromadné operácie

**Riešenie:**
```tsx
// Vytvoriť ConfirmationDialog komponent
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

const [confirmDialog, setConfirmDialog] = useState<{
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
} | null>(null);

// Použitie:
const handleDelete = () => {
  setConfirmDialog({
    open: true,
    title: 'Zmazať objednávku?',
    message: 'Naozaj chcete zmazať túto objednávku? Táto akcia sa nedá vrátiť späť.',
    onConfirm: async () => {
      await axios.delete(...);
      setConfirmDialog(null);
    }
  });
};
```

---

### 3. ✅ Loading States (Stavy načítavania)
**Problém:** Nie všetky operácie majú loading feedback.

**Riešenie:** 
- Pridať `Skeleton` komponenty namiesto prázdnych tabuliek
- Pridať loading indikátory pre buttony počas operácií
- Pridať progress pre hromadné operácie

**Príklady:**
```tsx
// Skeleton namiesto prázdnej tabuľky
{loading ? (
  <TableBody>
    {[...Array(5)].map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton /></TableCell>
        <TableCell><Skeleton /></TableCell>
        {/* ... */}
      </TableRow>
    ))}
  </TableBody>
) : (
  // skutočné dáta
)}

// Loading button
<Button 
  disabled={deleting}
  startIcon={deleting ? <CircularProgress size={16} /> : null}
>
  {deleting ? 'Maže sa...' : 'Zmazať'}
</Button>
```

---

### 4. ✅ Tooltips (Tipy)
**Problém:** Niektoré akcie a ikony nie sú jasné bez vysvetlenia.

**Riešenie:** Pridať Tooltips k:
- Ikony v tabuľkách
- Akčné buttony (najmä tie s ikonami)
- Status Chipy (vysvetlenie čo znamenajú)
- Filtrovacie možnosti

**Príklad:**
```tsx
<Tooltip title="Zobraziť detail objednávky">
  <IconButton onClick={...}>
    <VisibilityIcon />
  </IconButton>
</Tooltip>
```

---

### 5. ✅ Better Error Messages (Lepšie chybové správy)
**Problém:** Niektoré chybové správy sú generické ("Chyba pri načítavaní").

**Riešenie:** 
- Konkrétnejšie správy ("Nepodarilo sa načítať faktúry - skontrolujte pripojenie")
- Pridať "Skúsiť znovu" button pri chybách
- Zobraziť čas chyby (kedy sa stala)

---

### 6. ✅ Search Improvements (Vylepšenia vyhľadávania)
**Problém:** Niektoré stránky nemajú debouncing (okamžité vyhľadávanie).

**Riešenie:** 
- Pridať debouncing tam, kde chýba (napr. `orders/page.tsx`)
- Pridať "Vyčistiť" button do search poľa
- Pridať search suggestions/históriu
- Zobraziť počet výsledkov ("Nájdených: 15 objednávok")

**Príklad:**
```tsx
useEffect(() => {
  const timeoutId = setTimeout(() => {
    // vyhľadávanie
  }, 500);
  return () => clearTimeout(timeoutId);
}, [search]);
```

---

### 7. ✅ Bulk Operations Feedback (Feedback pre hromadné operácie)
**Problém:** Pri hromadných operáciách nie je jasné, koľko položiek sa spracovalo.

**Riešenie:**
- Zobraziť progress bar pre hromadné operácie
- Zobraziť výsledok ("Úspešne zmenené 5 položiek")
- Zobraziť zlyhané položky ak nejaké boli

---

### 8. ✅ Keyboard Shortcuts (Klávesové skratky)
**Status:** Už sú implementované! ✅
**Vylepšenie:** Pridať skratky pre:
- Vyhľadávanie (Ctrl+K / Cmd+K)
- Zrušiť akciu (Escape)
- Uložiť formulár (Ctrl+S)

---

### 9. ✅ Table Improvements (Vylepšenia tabuliek)
**Problém:** Niektoré tabuľky nemajú:
- Sticky headers (pri scrollovaní)
- Možnosť zmeniť veľkosť stránky
- Export dát

**Riešenie:**
- Pridať sticky headers pre dlhé tabuľky
- Pridať možnosť zmeniť počet riadkov na stránku
- Pridať export do CSV/Excel (ako je v TODO)

---

### 10. ✅ Success Feedback (Feedback po úspechu)
**Problém:** Niektoré operácie majú len toast, nie vizuálny feedback.

**Riešenie:**
- Pridať vizuálne zvýraznenie nových/zmienených riadkov
- Pridať animácie pri úspešných operáciách
- Pridať "Undo" možnosť kde je to možné

---

## 📊 Prioritizácia

### Vysoká priorita (robiť hneď):
1. ✅ **Empty states** - Rýchle, veľký UX benefit
2. ✅ **Confirmation dialógy** - Profesionálnejší vzhľad
3. ✅ **Loading states** - Lepší feedback

### Stredná priorita:
4. ⚠️ **Tooltips** - Pomôžu novým používateľom
5. ⚠️ **Search improvements** - Lepšie vyhľadávanie
6. ⚠️ **Better error messages** - Lepšia diagnostika

### Nízka priorita:
7. 🔄 **Bulk operations feedback** - Nice to have
8. 🔄 **Table improvements** - Doplňujúce funkcie
9. 🔄 **Success feedback** - Vizualizácia

---

## 💡 Odporúčaný postup

**Krok 1 (dnes):** Pridať empty states na hlavné stránky  
**Krok 2 (zajtra):** Nahradiť confirm/alert MUI Dialog  
**Krok 3 (týždeň):** Pridať loading states a tooltips  
**Krok 4 (mesiac):** Vylepšiť search a error handling  

---

## 🎯 Konkrétne príklady implementácie

### Empty State Komponent
```tsx
// components/EmptyState.tsx
export function EmptyState({ 
  icon, 
  title, 
  message, 
  action 
}: {
  icon: string;
  title: string;
  message?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>{icon}</Typography>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      {message && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {message}
        </Typography>
      )}
      {action && (
        <Button variant="contained" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </Box>
  );
}
```

### Confirmation Dialog Hook
```tsx
// hooks/useConfirmDialog.ts
export function useConfirmDialog() {
  const [dialog, setDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const confirm = (title: string, message: string) => {
    return new Promise<boolean>((resolve) => {
      setDialog({
        open: true,
        title,
        message,
        onConfirm: () => {
          setDialog(null);
          resolve(true);
        },
      });
    });
  };

  return { dialog, confirm };
}
```

---

## 📝 Poznámky

- **Začínať jednoducho:** Najprv implementovať empty states a confirmation dialógy
- **Testovať s používateľmi:** Zistiť, čo im najviac chýba
- **Konzistentnosť:** Používať rovnaké komponenty všade
- **Performance:** Empty states a tooltips sú lightweight, môžu sa pridať všade
