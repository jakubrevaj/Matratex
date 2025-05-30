'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Typography,
  Container,
  Card,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Divider,
  Button,
  Collapse,
  IconButton,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import axios from 'axios';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'archived':
      return '#d6d6d6'; // tmavšia sivá pre archived
    case 'invoiced':
    default:
      return '#ffffff'; // biela
  }
};

export default function HistoricalOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [openRow, setOpenRow] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      axios
        .get(`${process.env.NEXT_PUBLIC_API_URL}/historical/${id}`)
        .then((res) => setOrder(res.data))
        .catch((err) => console.error('Chyba pri načítaní detailu:', err));
    }
  }, [id]);

  if (!order) return <Typography sx={{ m: 4 }}>Načítavam...</Typography>;

  return (
    <Container sx={{ mt: 4, maxWidth: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Detail objednávky č. {order.order_number}
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">Zákazník: {order.customer_name}</Typography>
          <Typography variant="body2">IČO: {order.ico || '-'}</Typography>
          <Typography variant="body2">
            Dátum vystavenia:{' '}
            {new Date(order.issue_date).toLocaleDateString('sk-SK')}
          </Typography>
          <Typography variant="body2">
            Cena spolu: {parseFloat(order.total_price).toFixed(2)} €
          </Typography>
        </CardContent>
      </Card>

      <Typography variant="h6" sx={{ mb: 1 }}>
        Položky:
      </Typography>

      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell />
              <TableCell>Názov</TableCell>
              <TableCell>Množstvo</TableCell>
              <TableCell>Rozmery</TableCell>
              <TableCell>Cena/ks</TableCell>
              <TableCell>Spolu</TableCell>
              <TableCell>Stav</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {order.order_items.map((item: any) => (
              <>
                <TableRow
                  key={item.id}
                  sx={{ backgroundColor: getStatusColor(item.status) }}
                >
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() =>
                        setOpenRow(openRow === item.id ? null : item.id)
                      }
                    >
                      {openRow === item.id ? (
                        <KeyboardArrowUpIcon />
                      ) : (
                        <KeyboardArrowDownIcon />
                      )}
                    </IconButton>
                  </TableCell>
                  <TableCell>{item.product_name}</TableCell>
                  <TableCell>{item.quantity} ks</TableCell>
                  <TableCell>
                    {item.length}×{item.width}×{item.height} cm
                  </TableCell>
                  <TableCell>{parseFloat(item.price).toFixed(2)} €</TableCell>
                  <TableCell>
                    {(parseFloat(item.price) * item.quantity).toFixed(2)} €
                  </TableCell>
                  <TableCell>{item.status}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell colSpan={7} sx={{ p: 0 }}>
                    <Collapse
                      in={openRow === item.id}
                      timeout="auto"
                      unmountOnExit
                    >
                      <CardContent sx={{ bgcolor: '#f9f9f9' }}>
                        <Typography variant="body2">
                          <strong>Poznámka jadro:</strong>{' '}
                          {item.notes_core || '–'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Poznámka poťah:</strong>{' '}
                          {item.notes_cover || '–'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Štítky:</strong>{' '}
                          {[item.label_1, item.label_2, item.label_3]
                            .filter(Boolean)
                            .join(', ') || '–'}
                        </Typography>
                      </CardContent>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Button variant="outlined" href="/historical-orders">
        Späť na archív
      </Button>
    </Container>
  );
}
