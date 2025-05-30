'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';

interface OrderItemDetail {
  id: number;
  product_name: string;
  quantity: number;
  price: number;
  notes_core?: string;
  notes_cover?: string;
  material_name?: string;
  length?: number;
  width?: number;
  height?: number;
  tech_width?: number;
  status: string;
  order?: {
    id: number;
    order_number: string;
  };
  invoice?: {
    id: number;
  };
}

export default function OrderItemDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [item, setItem] = useState<OrderItemDetail | null>(null);

  useEffect(() => {
    if (!id) return;

    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/order-items/${id}`)
      .then((res) => setItem(res.data))
      .catch((err) => console.error('Chyba pri načítaní položky:', err));
  }, [id]);

  if (!item) return <div>Načítavam...</div>;

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>
        Detaily položky #{item.id}
      </h1>

      <table
        style={{ width: '100%', maxWidth: '600px', borderCollapse: 'collapse' }}
      >
        <tbody>
          <Row label="Názov produktu" value={item.product_name} />
          <Row label="Množstvo" value={item.quantity} />
          <Row label="Cena za kus" value={`${item.price.toFixed(2)} €`} />
          <Row label="Materiál" value={item.material_name || '–'} />
          <Row
            label="Rozmery"
            value={`${item.length || '-'} × ${item.width || '-'} × ${
              item.height || '-'
            }`}
          />
          <Row label="Technologická šírka" value={item.tech_width || '-'} />
          <Row label="Stav" value={item.status} />
          <Row label="Poznámka – jadro" value={item.notes_core || '–'} />
          <Row label="Poznámka – poťah" value={item.notes_cover || '–'} />
          <Row
            label="Objednávka"
            value={
              item.order ? (
                <button
                  onClick={() => router.push(`/orders/${item.order.id}`)}
                  style={btnStyle}
                >
                  {item.order.order_number}
                </button>
              ) : (
                '–'
              )
            }
          />
          <Row
            label="Faktúra"
            value={
              item.invoice ? (
                <button
                  onClick={() => router.push(`/invoices/${item.invoice.id}`)}
                  style={btnStyle}
                >
                  #{item.invoice.id}
                </button>
              ) : (
                '–'
              )
            }
          />
        </tbody>
      </table>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <tr>
      <td style={{ padding: '10px', fontWeight: 600, width: '200px' }}>
        {label}
      </td>
      <td style={{ padding: '10px' }}>{value}</td>
    </tr>
  );
}

const btnStyle = {
  backgroundColor: '#1976d2',
  color: 'white',
  border: 'none',
  padding: '6px 12px',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '14px',
};
