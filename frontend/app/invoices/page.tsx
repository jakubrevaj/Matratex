'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Invoice {
  id: number;
  invoice_number: string;
  customer_name: string;
  total_price: number;
  created_at: string;
  order_number: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/invoices`)
      .then((res) => {
        setInvoices(res.data);
      })
      .catch((err) => {
        console.error('Chyba pri načítavaní faktúr:', err);
      });
  }, []);

  const filtered = invoices.filter(
    (inv) =>
      inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      inv.order_number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '20px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <h1 style={{ fontSize: '24px' }}>Faktúry</h1>
        <button
          onClick={() => router.push('/invoices/new')}
          style={{
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          + Vytvoriť novú faktúru
        </button>
      </div>

      <input
        type="text"
        placeholder="Hľadať podľa faktúry, zákazníka alebo objednávky"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: '10px',
          width: '100%',
          marginBottom: '20px',
          borderRadius: '8px',
          border: '1px solid #ccc',
          fontSize: '16px',
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
              <th style={{ padding: '14px', fontWeight: 600 }}>Faktúra</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Zákazník</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Objednávka</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Cena</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Dátum</th>
              <th style={{ padding: '14px' }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 20).map((inv, idx) => (
              <tr
                key={inv.id}
                style={{
                  backgroundColor: idx % 2 === 0 ? '#fafafa' : '#ffffff',
                  borderBottom: '1px solid #e0e0e0',
                }}
              >
                <td style={{ padding: '14px' }}>{inv.invoice_number}</td>
                <td style={{ padding: '14px' }}>{inv.customer_name}</td>
                <td style={{ padding: '14px' }}>{inv.order_number}</td>
                <td style={{ padding: '14px' }}>
                  {inv.total_price
                    ? parseFloat(inv.total_price).toFixed(2) + ' €'
                    : '–'}
                </td>
                <td style={{ padding: '14px' }}>
                  {new Date(inv.created_at).toLocaleDateString()}
                </td>
                <td style={{ padding: '14px' }}>
                  <button
                    onClick={() => router.push(`/invoices/${inv.id}`)}
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
                    Zobraziť
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
