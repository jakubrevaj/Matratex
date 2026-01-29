import axios from 'axios';

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export const fetchOrders = async () => {
  const response = await axios.get(`${API_URL}/orders`);
  return response.data;
};

export const fetchInvoices = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.status) queryParams.append('status', params.status);

  const response = await axios.get(
    `${API_URL}/invoices?${queryParams.toString()}`,
  );
  return response.data;
};

export const fetchInvoiceStats = async () => {
  const response = await axios.get(`${API_URL}/invoices/stats`);
  return response.data;
};

export const createInvoice = async (
  orderId: number,
  selectedItemIds: number[],
  notes: string,
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

// Dashboard API
export const fetchDashboardMetrics = async () => {
  const response = await axios.get(`${API_URL}/dashboard/metrics`);
  return response.data;
};

export const fetchSalesChart = async () => {
  const response = await axios.get(`${API_URL}/dashboard/sales-chart`);
  return response.data;
};

export const fetchRecentActivity = async () => {
  const response = await axios.get(`${API_URL}/dashboard/recent-activity`);
  return response.data;
};
