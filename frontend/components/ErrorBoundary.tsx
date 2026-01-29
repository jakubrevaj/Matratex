'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md" sx={{ mt: 8 }}>
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              borderTop: '4px solid #d32f2f',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            <ErrorOutlineIcon sx={{ fontSize: 80, color: '#d32f2f', mb: 2 }} />
            <Typography
              variant="h4"
              gutterBottom
              sx={{ color: '#d32f2f', fontWeight: 'bold' }}
            >
              Niečo sa pokazilo
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Aplikácia narazila na neočakávanú chybu. Skúste obnoviť stránku.
            </Typography>
            {this.state.error && (
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  backgroundColor: '#fff3e0',
                  borderRadius: 1,
                  textAlign: 'left',
                  overflow: 'auto',
                  maxHeight: '200px',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: 'monospace',
                    color: '#666',
                    display: 'block',
                  }}
                >
                  {this.state.error.toString()}
                </Typography>
              </Box>
            )}
            <Button
              variant="contained"
              size="large"
              onClick={() => window.location.reload()}
              sx={{
                backgroundColor: '#1976d2',
                '&:hover': { backgroundColor: '#1565c0' },
                px: 4,
                py: 1.5,
                fontWeight: 'bold',
                textTransform: 'none',
              }}
            >
              <RefreshIcon sx={{ mr: 0.5 }} />
              Obnoviť stránku
            </Button>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
