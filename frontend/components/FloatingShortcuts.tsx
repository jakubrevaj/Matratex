'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function FloatingShortcuts() {
  const { shortcuts } = useKeyboardShortcuts();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip title="Zobraziť klávesové skratky" placement="left">
        <Button
          onClick={() => setOpen(true)}
          aria-label="help-shortcuts"
          sx={{
            position: 'fixed',
            right: 16,
            bottom: 16,
            minWidth: 0,
            width: 42,
            height: 42,
            borderRadius: '50%',
            boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
            backgroundColor: '#1976d2',
            color: 'white',
            '&:hover': {
              backgroundColor: '#1565c0',
              transform: 'translateY(-1px)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
            },
            textTransform: 'none',
            p: 0,
            zIndex: 1300,
          }}
        >
          <HelpOutlineIcon />
        </Button>
      </Tooltip>

      {open && (
        <Box
          onClick={() => setOpen(false)}
          sx={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.2)',
            zIndex: 1400,
          }}
        >
          <Paper
            onClick={(e) => e.stopPropagation()}
            elevation={6}
            sx={{
              position: 'fixed',
              right: 16,
              bottom: 70,
              width: { xs: 300, sm: 360 },
              maxHeight: '60vh',
              overflow: 'auto',
              borderRadius: 2,
              p: 2,
              zIndex: 1500,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Klávesové skratky
              </Typography>
              <IconButton onClick={() => setOpen(false)} size="small">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 1 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {shortcuts.map((s, idx) => {
                const keys: string[] = [];
                if (s.ctrlKey) keys.push('Ctrl');
                if (s.shiftKey) keys.push('Shift');
                if (s.altKey) keys.push('Alt');
                keys.push(s.key.length === 1 ? s.key.toUpperCase() : s.key);
                return (
                  <Box
                    key={`${idx}-${s.description}`}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        flexWrap: 'wrap',
                      }}
                    >
                      {keys.map((k, i) => (
                        <Box
                          key={`${k}-${i}`}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          <Box
                            sx={{
                              px: 0.75,
                              py: 0.25,
                              borderRadius: 1,
                              border: '1px solid #ddd',
                              boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.08)',
                              backgroundColor: '#f9f9f9',
                              fontSize: '0.75rem',
                              color: '#333',
                              minWidth: 22,
                              textAlign: 'center',
                            }}
                          >
                            {k}
                          </Box>
                          {i < keys.length - 1 && (
                            <Typography
                              variant="caption"
                              sx={{ color: '#999' }}
                            >
                              +
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                    <Typography variant="caption" sx={{ color: '#555' }}>
                      {s.description}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Box>
      )}
    </>
  );
}
