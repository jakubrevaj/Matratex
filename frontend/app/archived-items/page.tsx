'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface ArchivedItem {
  id: number;
  original_item_id: number;
  product_name: string;
  quantity: number;
  price: number;
  notes_core: string;
  notes_cover: string;
  order_number?: string;
  customer_name?: string;
  ico?: string;
  archived_at: string;
}

export default function ArchivedItemsPage() {
  const [items, setItems] = useState<ArchivedItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/archived-items`)
      .then((res) => setItems(res.data))
      .catch((err) => console.error('Chyba pri načítaní:', err));
  }, []);

  const handleOrderClick = async (orderNumber: string) => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/lookup/${orderNumber}`
      );
      const { id, isHistorical } = res.data;
      router.push(isHistorical ? `/historical-orders/${id}` : `/orders/${id}`);
    } catch (err) {
      console.error('Nepodarilo sa načítať objednávku:', err);
      alert('Objednávka sa nenašla.');
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ico?.includes(searchTerm) ||
      item.order_number?.includes(searchTerm)
  );

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>
        Archivované položky
      </h1>

      <input
        type="text"
        placeholder="Hľadaj podľa produktu, podniku, IČO alebo čísla objednávky"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          marginBottom: '16px',
          padding: '12px 16px',
          width: '100%',
          fontSize: '16px',
          border: '1px solid #ccc',
          borderRadius: '6px',
          boxSizing: 'border-box',
        }}
      />

      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: 0,
            backgroundColor: '#fff',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left' }}>
              <th style={{ padding: '14px' }}>Matrac</th>
              <th style={{ padding: '14px' }}>Podnik</th>
              <th style={{ padding: '14px' }}>IČO</th>
              <th style={{ padding: '14px' }}>Množstvo</th>
              <th style={{ padding: '14px' }}>Cena</th>
              <th style={{ padding: '14px' }}>Objednávka</th>
              <th style={{ padding: '14px' }}>Archivované</th>
              <th style={{ padding: '14px' }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item, idx) => (
              <tr
                key={item.id}
                style={{
                  backgroundColor: idx % 2 === 0 ? '#fafafa' : '#ffffff',
                  borderBottom: '1px solid #e0e0e0',
                }}
              >
                <td style={{ padding: '14px' }}>{item.product_name}</td>
                <td style={{ padding: '14px' }}>{item.customer_name || '–'}</td>
                <td style={{ padding: '14px' }}>{item.ico || '–'}</td>
                <td style={{ padding: '14px' }}>{item.quantity}</td>
                <td style={{ padding: '14px' }}>
                  {Number(item.price).toFixed(2)} €
                </td>
                <td style={{ padding: '14px' }}>{item.order_number || '–'}</td>
                <td style={{ padding: '14px' }}>
                  {new Date(item.archived_at).toLocaleDateString()}
                </td>
                <td style={{ padding: '14px' }}>
                  {item.order_number && (
                    <button
                      onClick={() => handleOrderClick(item.order_number!)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#1976d2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                      }}
                    >
                      Zobraziť objednávku
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
