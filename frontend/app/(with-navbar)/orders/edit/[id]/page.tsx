'use client';

import OrderForm from '@/components/OrderForm';
import { useParams } from 'next/navigation';

export default function EditOrderPage() {
  const { id } = useParams();
  return <OrderForm mode="edit" orderId={id as string} />;
}
