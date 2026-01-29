'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
        },
        success: {
          style: {
            background: '#4caf50',
            color: '#fff',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#4caf50',
          },
        },
        error: {
          style: {
            background: '#f44336',
            color: '#fff',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#f44336',
          },
        },
        loading: {
          style: {
            background: '#2196f3',
            color: '#fff',
          },
        },
      }}
    />
  );
}
