import axios from 'axios';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

export const fetchOrders = async () => {
  const response = await axios.get(`${API_URL}/orders`);
  return response.data;
};

export const fetchInvoices = async () => {
  const response = await axios.get(`${API_URL}/invoices`);
  return response.data;
};

export const createInvoice = async (
  orderId: number,
  selectedItemIds: number[],
  notes: string
) => {
  const response = await axios.post(`${API_URL}/invoices`, {
    orderId,
    selectedItemIds,
    notes,
  });
  return response.data;
};
export const fetchCustomers = async () => {
  const response = await axios.get(`${API_URL}/customers`);
  return response.data;
};

export const fetchProducts = async () => {
  const response = await axios.get(`${API_URL}/mattresses`);
  return response.data;
};
