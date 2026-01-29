'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Box,
  useTheme,
} from '@mui/material';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { alpha } from '@mui/material/styles';
import { API_URL } from '@/services/api';

interface ArchivedItem {
  id: number;
  original_item_id: number;
  product_name: string;
  quantity: number;
  price: number;
  notes_core: string;
  notes_cover: string;
  order_number?: string;
  customer_name?: string;
  ico?: string;
  archived_at: string;
}

export default function ArchivedItemsPage() {
  const [items, setItems] = useState<ArchivedItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const theme = useTheme();
  const router = useRouter();

  useEffect(() => {
    axios
      .get(`${API_URL}/archived-items`)
      .then((res) => setItems(res.data))
      .catch((err) => console.error('Chyba pri načítaní:', err));
  }, []);

  const handleOrderClick = async (orderNumber: string) => {
    try {
      const res = await axios.get(`${API_URL}/orders/lookup/${orderNumber}`);
      const { id, isHistorical } = res.data;
      router.push(isHistorical ? `/historical-orders/${id}` : `/orders/${id}`);
    } catch (err) {
      console.error('Nepodarilo sa načítať objednávku:', err);
      alert('Objednávka sa nenašla.');
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ico?.includes(searchTerm) ||
      item.order_number?.includes(searchTerm)
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          textAlign: 'center',
          mb: 3,
          p: 2,
          backgroundColor: 'background.paper',
          borderRadius: 2,
          borderLeft: `3px solid ${theme.palette.text.secondary}`,
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            color: 'text.secondary',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          <Inventory2Icon />
          Archivované položky
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Prehľad všetkých archivovaných položiek
        </Typography>
      </Box>

      <TextField
        fullWidth
        label="Hľadaj podľa produktu, podniku, IČO alebo čísla objednávky"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
      />

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}`,
          overflow: 'hidden',
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'background.default' }}>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: 'text.secondary',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Matrac
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: 'text.secondary',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Podnik
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: 'text.secondary',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                IČO
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: 'text.secondary',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Množstvo
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: 'text.secondary',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Cena
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: 'text.secondary',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Objednávka
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: 'text.secondary',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Archivované
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: 'text.secondary',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Akcie
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow
                key={item.id}
                sx={{
                  backgroundColor: 'background.default',
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.common.white, 0.6),
                    transform: 'scale(1.01)',
                    transition: 'all 0.2s ease',
                    boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}`,
                  },
                }}
              >
                <TableCell>{item.product_name}</TableCell>
                <TableCell>{item.customer_name || '–'}</TableCell>
                <TableCell>{item.ico || '–'}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{Number(item.price).toFixed(2)} €</TableCell>
                <TableCell>
                  {item.order_number ? (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleOrderClick(item.order_number!)}
                      sx={{
                        border: '2px solid',
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        borderRadius: 2,
                        fontWeight: 'bold',
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: 'primary.main',
                          color: 'common.white',
                          boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
                        },
                      }}
                    >
                      {item.order_number}
                    </Button>
                  ) : (
                    '–'
                  )}
                </TableCell>
                <TableCell>
                  {new Date(item.archived_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {item.order_number && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleOrderClick(item.order_number!)}
                      sx={{
                        backgroundColor: 'primary.main',
                        '&:hover': { backgroundColor: 'primary.dark' },
                        borderRadius: 2,
                        fontWeight: 'bold',
                        textTransform: 'none',
                        boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
                      }}
                      startIcon={<VisibilityIcon />}
                    >
                      Zobraziť objednávku
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
