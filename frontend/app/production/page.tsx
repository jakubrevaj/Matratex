'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Checkbox,
  TableContainer,
  Paper,
  TextField,
  IconButton,
} from '@mui/material';
import axios from 'axios';

import DescriptionIcon from '@mui/icons-material/Description';

import { useRouter } from 'next/navigation';

export default function ProductionPage() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/production/items`
    );
    setItems(res.data);
  };
  const router = useRouter();

  const handleSelect = (id: number) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((sid) => sid !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleMoveToProduction = async () => {
    if (
      !confirm(
        'Naozaj chcete všetky položky v stave "to-production" dať do výroby?'
      )
    ) {
      return;
    }
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/production/move-all-to-in-production`
      );

      // 👉 otvorenie PDF v novej karte, ak je dostupná cesta
      if (response.data.pdfPath) {
        const relativePath = response.data.pdfPath.replace(/\\/g, '/');
        const url = `${process.env.NEXT_PUBLIC_API_URL}${relativePath.replace(
          /^.*\/pdfs/,
          '/pdfs'
        )}`;
        window.open(url, '_blank');
      }
      if (response.data.summaryPath) {
        const relativePath = response.data.summaryPath.replace(/\\/g, '/');
        const url = `${process.env.NEXT_PUBLIC_API_URL}${relativePath.replace(
          /^.*\/pdfs/,
          '/pdfs'
        )}`;
        window.open(url, '_blank');
      }
      await fetchItems();
      alert('Všetky položky boli zaradené do výroby.');
    } catch (err) {
      console.error(err);
      alert('Chyba pri presune položiek.');
    }
  };

  const handleMarkToProduction = async (id: number) => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/order-items/${id}/status`,
        {
          status: 'to-production',
        }
      );
      await fetchItems(); // refreshni položky
    } catch (err) {
      console.error('Chyba pri zmene statusu', err);
      alert('Nepodarilo sa označiť položku.');
    }
  };

  const filtered = items.filter((item) => {
    const query = search.toLowerCase();
    return (
      item.product_name.toLowerCase().includes(query) ||
      item.order?.customer?.podnik?.toLowerCase().includes(query) ||
      item.order?.order_number?.toLowerCase().includes(query)
    );
  });

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Položky pripravené na výrobu
      </Typography>

      <TextField
        label="Hľadať matrac, zákazníka alebo číslo objednávky"
        fullWidth
        sx={{ mb: 2 }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Button
        variant="contained"
        color="primary"
        sx={{ mb: 2 }}
        onClick={handleMoveToProduction}
      >
        Dať vybrané do výroby
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
            <TableRow>
              <TableCell>Akcia</TableCell>
              <TableCell>Matrac</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Objednávka</TableCell>
              <TableCell>Zákazník</TableCell>
              <TableCell>Dátum objednávky</TableCell>
              <TableCell>Rozmery</TableCell>
              <TableCell>Kusov</TableCell>
              <TableCell>Detail</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((item) => (
              <TableRow
                key={item.id}
                sx={{
                  backgroundColor:
                    item.status === 'pending'
                      ? '#ffcccc'
                      : item.status === 'to-production'
                      ? '#ffffd1'
                      : 'inherit',
                }}
              >
                <TableCell>
                  {item.status === 'pending' ? (
                    <Button
                      variant="contained"
                      color="secondary"
                      size="small"
                      onClick={() => handleMarkToProduction(item.id)}
                    >
                      Vyrobiť
                    </Button>
                  ) : (
                    '✔️'
                  )}
                </TableCell>
                <TableCell>{item.product_name}</TableCell>
                <TableCell>
                  {item.status === 'pending' && 'Čaká'}
                  {item.status === 'to-production' && 'Pripravené'}
                </TableCell>
                <TableCell>{item.order?.order_number || '-'}</TableCell>
                <TableCell>{item.order?.customer?.podnik || '-'}</TableCell>
                <TableCell>
                  {item.order?.issue_date
                    ? new Date(item.order.issue_date).toLocaleDateString(
                        'sk-SK'
                      )
                    : '-'}
                </TableCell>
                <TableCell>
                  {item.length} x {item.width} x {item.height} cm
                </TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => router.push(`/orders/${item.order?.id}`)}
                    sx={{ ml: 1 }}
                  >
                    <DescriptionIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="h6" sx={{ mt: 2 }}>
        Celkový počet kusov:{' '}
        {filtered.reduce((sum, item) => sum + item.quantity, 0)}
      </Typography>
    </Container>
  );
}
