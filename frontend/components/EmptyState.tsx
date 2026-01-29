'use client';

import type { ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({
  icon = <InboxIcon fontSize="large" />,
  title,
  message,
  action,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 8,
        px: 2,
      }}
    >
      <Box sx={{ mb: 2, color: 'text.secondary', display: 'flex', justifyContent: 'center' }}>
        {icon}
      </Box>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      {message && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
          {message}
        </Typography>
      )}
      {action && (
        <Button variant="contained" onClick={action.onClick} sx={{ mt: 2 }}>
          {action.label}
        </Button>
      )}
    </Box>
  );
}
