// Spoločné typy pre celú aplikáciu

export interface OrderItem {
  id: number;
  product_name: string;
  material_name: string;
  quantity: number;
  count: number;
  length: number;
  width: number;
  height: number;
  total_price: number;
  price?: number; // Pre historical order items
  status?: string;
  notes_core?: string;
  notes_cover?: string;
  label_1?: string;
  label_2?: string;
  label_3?: string;
  order?: {
    id: number;
    order_number: string;
    customer: {
      id: number;
      podnik: string;
    };
  };
  product_id?: number;
  material_id?: number;
  splitValue?: string;
}

export interface Order {
  id: number;
  order_number: string;
  customer: Customer;
  ico?: string;
  issue_date: Date;
  total_price: number;
  notes?: string;
  production_status: 'pending' | 'in-production' | 'completed' | 'invoiced';
  order_items: OrderItem[];
  invoices?: Invoice[];
}

export interface Customer {
  id: number;
  podnik: string;
  adresa?: string;
  ico?: string;
  email?: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  customer_name: string;
  customer_address?: string;
  items: InvoiceItem[];
  notes?: string;
  total_price: number;
  discount: number;
  discount_percent: number;
}

export interface InvoiceItem {
  name: string;
  dimensions?: string;
  quantity?: number;
  total_price: number;
}

export interface Mattress {
  id: number;
  name: string;
  price: number;
}

export interface Material {
  id: number;
  name: string;
  price: number;
}
