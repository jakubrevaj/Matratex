// Centralized status helpers for order items and invoices

// Order status values array (for dropdowns/filters)
export const ORDER_STATUSES = [
  'pending',
  'to-production',
  'in-production',
  'completed',
  'invoiced',
  'archived',
] as const;

// Order item status labels
export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Čakajúca',
  'to-production': 'Do výroby',
  'in-production': 'Vo výrobe',
  completed: 'Hotová',
  invoiced: 'Fakturovaná',
  archived: 'Archivovaná',
};

// Order item status colors (background colors for table rows)
export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: '#fff3e0', // jemná oranžová
  'to-production': '#fff8e1', // jemná žltá
  'in-production': '#e3f2fd', // jemná modrá
  completed: '#e8f5e8', // jemná zelená
  invoiced: '#f3e5f5', // jemná fialová
  archived: '#f5f5f5', // jemná sivá
};

// Invoice status labels
export const INVOICE_STATUS_LABELS: Record<string, string> = {
  paid: 'Zaplatená',
  unpaid: 'Nezaplatená',
  overdue: 'Po splatnosti',
};

// Order status colors (for Material-UI Chip component)
export const ORDER_STATUS_CHIP_COLORS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  completed: 'success',
  'in-production': 'info',
  pending: 'warning',
  'to-production': 'warning',
  invoiced: 'success',
  archived: 'default',
};

// Invoice status colors (for Material-UI Chip component)
export const INVOICE_STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  paid: 'success',
  unpaid: 'warning',
  overdue: 'error',
};

// Get status text for order items
export function getOrderStatusText(status: string): string {
  return ORDER_STATUS_LABELS[status] || status;
}

// Get status color for order items (background color)
export function getOrderStatusColor(status: string): string {
  return ORDER_STATUS_COLORS[status] || '#f5f5f5';
}

// Get status color for order items (Material-UI Chip color)
export function getOrderStatusChipColor(status: string): 'success' | 'warning' | 'error' | 'info' | 'default' {
  return ORDER_STATUS_CHIP_COLORS[status] || 'default';
}

// Get status text for invoices
export function getInvoiceStatusText(status: string): string {
  return INVOICE_STATUS_LABELS[status] || status;
}

// Get status color for invoices (Material-UI Chip color)
export function getInvoiceStatusColor(status: string): 'success' | 'warning' | 'error' | 'default' {
  return INVOICE_STATUS_COLORS[status] || 'default';
}

// Universal function that handles both order and invoice statuses (for dashboard)
export function getStatusColorChip(status: string): 'success' | 'warning' | 'error' | 'info' | 'default' {
  // Try invoice status first
  if (INVOICE_STATUS_COLORS[status]) {
    return INVOICE_STATUS_COLORS[status];
  }
  // Then try order status
  return ORDER_STATUS_CHIP_COLORS[status] || 'default';
}

export function getStatusLabelUniversal(status: string): string {
  // Try invoice status first
  if (INVOICE_STATUS_LABELS[status]) {
    return INVOICE_STATUS_LABELS[status];
  }
  // Then try order status
  return ORDER_STATUS_LABELS[status] || status;
}

// Legacy aliases for backward compatibility
export const getStatusText = getOrderStatusText;
export const getStatusColor = getOrderStatusColor;
export const getStatusLabel = getOrderStatusText;
