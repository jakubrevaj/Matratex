'use client';

import Link from 'next/link';
import { AppBar, Toolbar, Button, Box } from '@mui/material';

export default function Navbar() {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
      <Toolbar>
        {/* Prvý tlačidlo: Nová objednávka */}
        <Button
          component={Link}
          href="/orders/new"
          variant="contained"
          sx={{
            backgroundColor: '#8e24aa',
            color: 'white',
            textTransform: 'none',
            mr: 3,
            '&:hover': { backgroundColor: '#9c27b0' },
          }}
        >
          Nová objednávka
        </Button>

        {/* Ostatné odkazy */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Button
            component={Link}
            href="/"
            sx={{
              color: 'white',
              textTransform: 'none',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
            }}
          >
            Domov
          </Button>
          <Button
            component={Link}
            href="/orders"
            sx={{
              color: 'white',
              textTransform: 'none',
              ml: 2,
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
            }}
          >
            Objednávky
          </Button>

          <Button
            component={Link}
            href="/production"
            sx={{
              color: 'white',
              textTransform: 'none',
              ml: 2,
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
            }}
          >
            Produkcia
          </Button>
          <Button
            component={Link}
            href="/invoices"
            sx={{
              color: 'white',
              textTransform: 'none',
              ml: 2,
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
            }}
          >
            Faktúry
          </Button>
          <Button
            component={Link}
            href="/historical-orders"
            sx={{
              color: 'white',
              textTransform: 'none',
              ml: 2,
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
            }}
          >
            Staré objednávky
          </Button>
          <Button
            component={Link}
            href="/archived-items"
            sx={{
              color: 'white',
              textTransform: 'none',
              ml: 2,
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
            }}
          >
            Archivované položky
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
