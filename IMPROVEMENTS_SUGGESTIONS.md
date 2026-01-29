# 💡 Nápady na vylepšenie a zjednodušenie programu

## 📋 Obsah
1. [Rýchle opravy (vysoký dopad, nízka náročnosť)](#1-rýchle-opravy)
2. [Refaktoring a zjednodušenie kódu](#2-refaktoring-a-zjednodušenie-kódu)
3. [Technické vylepšenia](#3-technické-vylepšenia)
4. [Funkčné vylepšenia](#4-funkčné-vylepšenia)

---

## 1. 🚀 Rýchle opravy (vysoký dopad, nízka náročnosť)

### 1.1 Centralizovať status funkcie ⭐ TOP PRIORITA

**Problém:** Funkcie `getStatusText()` a `getStatusColor()` sú duplikované v 11+ súboroch s rôznymi hodnotami.

**Riešenie:** Vytvoriť shared utility súbor

```typescript
// frontend/utils/statusHelpers.ts
export const STATUS_LABELS: Record<string, string> = {
  pending: 'Čakajúca',
  'to-production': 'Do výroby',
  'in-production': 'Vo výrobe',
  completed: 'Hotová',
  invoiced: 'Fakturovaná',
  archived: 'Archivovaná',
};

export const STATUS_COLORS: Record<string, string> = {
  pending: '#fff3e0',
  'to-production': '#fff8e1',
  'in-production': '#e3f2fd',
  completed: '#e8f5e8',
  invoiced: '#f3e5f5',
  archived: '#f5f5f5',
};

export function getStatusText(status: string): string {
  return STATUS_LABELS[status] || status;
}

export function getStatusColor(status: string): string {
  return STATUS_COLORS[status] || '#f5f5f5';
}
```

**Benefit:**
- ✅ Jedno miesto na úpravu
- ✅ Konzistentné farby/labelky všade
- ✅ Menej duplikácie kódu
- ✅ Jednoduchšie testovanie

**Súbory na úpravu:** 11+ súborov (page.tsx, components)

---

### 1.2 Dokončiť TODO v reports.service.ts

**Problém:** Chýbajúce implementácie

```typescript
// backend/src/reports/reports.service.ts
const newCustomers = 0; // TODO: Implementovať logiku
avgProductionTime: 0, // TODO: Implementovať
```

**Riešenie:**
- Implementovať počítanie nových zákazníkov (porovnanie s predošlým mesiacom)
- Implementovať priemerný čas výroby (rozdiel medzi "to-production" a "completed")

---

### 1.3 Vyriešiť circular dependency v orders.service.ts

**Problém:** Automatické vytváranie dodávok je zakomentované

```typescript
// TODO: Temporarily disabled due to circular dependency
// Automaticky vytvor dodávku pre dokončené položky
```

**Riešenie:**
- Použiť event-driven prístup (NestJS Events)
- Alebo vytvoriť samostatný service bez circular dependency

---

## 2. 🔧 Refaktoring a zjednodušenie kódu

### 2.1 Rozdeliť veľké komponenty

**Problém:**
- `delivery/page.tsx` - **869 riadkov** ⚠️
- `dashboard/page.tsx` - **746 riadkov** ⚠️
- `components/OrderForm.tsx` - **1260 riadkov** ⚠️

**Riešenie:** Rozdeliť na menšie komponenty

**Príklad pre delivery/page.tsx:**
```
delivery/
  ├── page.tsx (hlavná logika)
  ├── components/
  │   ├── CustomerSelector.tsx
  │   ├── ItemList.tsx
  │   ├── DeliveryForm.tsx
  │   └── DeliveryFilters.tsx
  └── hooks/
      └── useDeliveryData.ts
```

**Benefit:**
- ✅ Ľahšia údržba
- ✅ Jednoduchšie testovanie
- ✅ Lepšia čitateľnosť
- ✅ Reusability komponentov

---

### 2.2 Vytvoriť custom hooks pre opakujúcu sa logiku

**Príklady:**
```typescript
// hooks/useStatusFilter.ts
export function useStatusFilter(items: OrderItem[]) {
  const [statusFilter, setStatusFilter] = useState('');
  const filtered = useMemo(() => {
    return statusFilter 
      ? items.filter(item => item.status === statusFilter)
      : items;
  }, [items, statusFilter]);
  return { filtered, statusFilter, setStatusFilter };
}

// hooks/useOrderItems.ts
export function useOrderItems() {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  const refresh = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/order-items`);
      setItems(res.data);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { refresh(); }, []);
  return { items, loading, refresh };
}
```

---

### 2.3 Vytvoriť API service layer

**Problém:** Axios volania sú roztrúsené po celom kóde

**Riešenie:** Centralizovať do services

```typescript
// services/ordersApi.ts
export const ordersApi = {
  getAll: () => axios.get(`${API_URL}/orders`),
  getById: (id: number) => axios.get(`${API_URL}/orders/${id}`),
  create: (data: Partial<Order>) => axios.post(`${API_URL}/orders`, data),
  update: (id: number, data: Partial<Order>) => axios.put(`${API_URL}/orders/${id}`, data),
  delete: (id: number) => axios.delete(`${API_URL}/orders/${id}`),
};
```

**Benefit:**
- ✅ Jednoduchšie zmeny API endpointov
- ✅ Typová bezpečnosť
- ✅ Jednoduchšie mockovanie pre testy

---

## 3. ⚙️ Technické vylepšenia

### 3.1 Pridať Error Boundaries všade

**Aktuálny stav:** ErrorBoundary existuje, ale nie je všade používaný

**Riešenie:** Obaliť hlavné stránky v ErrorBoundary

---

### 3.2 Optimalizovať database queries

**Nápad:** Eager loading namiesto multiple queries

```typescript
// Namiesto:
const order = await orderRepo.findOne({ where: { id } });
const items = await itemRepo.find({ where: { order: { id } } });
const customer = await customerRepo.findOne({ where: { id: order.customerId } });

// Použiť:
const order = await orderRepo.findOne({
  where: { id },
  relations: ['order_items', 'customer'],
});
```

---

### 3.3 Pridať loading states konzistentne

**Problém:** Niektoré stránky nemajú loading states

**Riešenie:** Vytvoriť `<LoadingSpinner />` komponent a použiť všade

---

### 3.4 Implementovať error handling konzistentne

**Problém:** Rôzne spôsoby error handling (alert, toast, console.error)

**Riešenie:** 
- Vždy použiť toast notifications
- Vytvoriť `handleApiError` utility funkciu
- Centralizovať error messages

```typescript
// utils/errorHandler.ts
export function handleApiError(error: unknown, defaultMessage: string) {
  const message = axios.isAxiosError(error) 
    ? error.response?.data?.message || defaultMessage
    : defaultMessage;
  toast.error(message);
  console.error(error);
}
```

---

## 4. 🎯 Funkčné vylepšenia (z NEXT_IMPROVEMENTS.md)

### Top 3 odporúčania:

1. **Export do Excelu** - Pre všetky moduly (objednávky, faktúry, zákazníci)
2. **Dashboard widgety** - Quick overview na homepage
3. **Auto zálohy databázy** - Každý deň o 2:00

---

## 📊 Prioritizácia

### Vysoká priorita (robiť hneď):
1. ✅ Centralizovať status funkcie (1-2h práce, veľký benefit)
2. ✅ Dokončiť TODO v reports (1h práce)
3. ✅ Vytvoriť API service layer (2-3h práce)

### Stredná priorita (robiť čoskoro):
4. ⚠️ Rozdeliť veľké komponenty (4-6h práce)
5. ⚠️ Vytvoriť custom hooks (2-3h práce)
6. ⚠️ Konzistentný error handling (2h práce)

### Nízka priorita (robiť keď je čas):
7. 🔄 Vyriešiť circular dependency (3-4h práce)
8. 🔄 Export do Excelu (4-6h práce)
9. 🔄 Dashboard widgety (3-4h práce)

---

## 🎯 Odporúčaný postup

**Krok 1 (dnes):** Centralizovať status funkcie  
**Krok 2 (zajtra):** Dokončiť TODO v reports  
**Krok 3 (týždeň):** API service layer + error handling  
**Krok 4 (mesiac):** Refaktoring veľkých komponentov  

---

## 💡 Poznámky

- **Neover-engineerovať:** Nie všetko treba refaktorovať naraz
- **Testovať postupne:** Po každej zmene otestovať, že všetko funguje
- **Backup pred refaktoringom:** Vždy git commit pred veľkými zmenami
- **Focus na benefit:** Robiť len to, čo skutočne zlepší kód/používateľský zážitok

---

_Vytvorené: 28. Októbra 2025_  
_Založené na analýze kódu projektu_
