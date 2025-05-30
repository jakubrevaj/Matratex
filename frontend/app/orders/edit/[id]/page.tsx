'use client';

import { useEffect, useRef, useState, createRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Container,
  TextField,
  Button,
  Typography,
  Grid,
  Autocomplete,
  IconButton,
} from '@mui/material';
import { Delete } from '@mui/icons-material';

export default function EditOrderPage() {
  const { id } = useParams();
  const router = useRouter();

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const orderNumberRef = useRef();
  const issueDateRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      const [customerRes, productRes, materialRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/customers`),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/mattresses`),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/materials`),
      ]);
      setCustomers(customerRes.data);
      setProducts(productRes.data);
      setMaterials(materialRes.data);

      if (id) {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/orders/${id}`
        );
        const order = res.data;
        if (orderNumberRef.current)
          orderNumberRef.current.value = order.order_number || '';
        if (issueDateRef.current) {
          const date = new Date(order.issue_date);
          date.setDate(date.getDate() + 1);
          issueDateRef.current.value = date.toISOString().split('T')[0];
        }
        setSelectedCustomer(order.customer);
        setOrderItems(
          order.order_items.map((item) => ({
            ...item,
            productId: item.product_id,
            product_name: item.product_name,
            material_name: item.material_name,
            refs: generateRefs(item),
          }))
        );
      }
    };

    fetchData();
  }, [id]);

  const generateRefs = (item = {}) => ({
    quantity: createRef(),
    price: createRef(),
    length: createRef(),
    width: createRef(),
    height: createRef(),
    tech_width: createRef(),
    notes_core: createRef(),
    notes_cover: createRef(),
    label_1: createRef(),
    label_2: createRef(),
    label_3: createRef(),
  });

  const handleRemoveItem = (index) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddItem = () => {
    setOrderItems((prev) => [
      ...prev,
      {
        productId: 0,
        product_name: '',
        material_name: '',
        status: 'pending',
        refs: generateRefs(),
      },
    ]);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const preparedItems = orderItems.map((item) => ({
      product_id: item.productId,
      product_name: item.product_name || '',
      material_name: item.material_name || '',
      quantity: Number(item.refs.quantity.current?.value) || 0,
      price: parseFloat(item.refs.price.current?.value) || 0,
      length: Number(item.refs.length.current?.value) || 0,
      width: Number(item.refs.width.current?.value) || 0,
      height: Number(item.refs.height.current?.value) || 0,
      tech_width: Number(item.refs.tech_width.current?.value) || 0,
      notes_core: item.refs.notes_core.current?.value || '',
      notes_cover: item.refs.notes_cover.current?.value || '',
      label_1: item.refs.label_1.current?.value || '',
      label_2: item.refs.label_2.current?.value || '',
      label_3: item.refs.label_3.current?.value || '',
      status: item.status, // zachová pôvodný status
    }));

    const totalPrice = preparedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const payload = {
      order_number: orderNumberRef.current?.value,
      issue_date: issueDateRef.current?.value,
      total_price: totalPrice,
      customer: { id: selectedCustomer?.id },
      order_items: preparedItems,
    };

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/${id}`,
        payload
      );
      alert('Objednávka bola aktualizovaná.');
      router.push('/orders');
    } catch (err) {
      console.error('Chyba pri aktualizácii objednávky:', err);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h5" gutterBottom>
        Úprava objednávky
      </Typography>
      <form onSubmit={onSubmit}>
        <Autocomplete
          options={customers}
          value={selectedCustomer}
          getOptionLabel={(option) => option.podnik || 'Neznámy'}
          isOptionEqualToValue={(option, value) => option?.id === value?.id}
          onChange={(e, val) => setSelectedCustomer(val)}
          renderInput={(params) => (
            <TextField {...params} label="Zákazník" required margin="dense" />
          )}
        />

        <Grid container spacing={1} marginTop={1}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Číslo objednávky"
              inputRef={orderNumberRef}
              margin="dense"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="date"
              label="Dátum vystavenia"
              inputRef={issueDateRef}
              margin="dense"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        <Typography variant="h6" marginTop={2} gutterBottom>
          Položky objednávky
        </Typography>

        {orderItems.map((item, index) => (
          <Grid
            container
            spacing={1}
            key={index}
            marginBottom={2}
            alignItems="center"
          >
            <Grid item xs={3}>
              <Autocomplete
                freeSolo
                options={products.map((p) => p.name)}
                value={item.product_name || ''}
                onInputChange={(e, val) => {
                  const newItems = [...orderItems];
                  newItems[index].product_name = val;
                  setOrderItems(newItems);
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Matrac" margin="dense" />
                )}
              />
            </Grid>
            <Grid item xs={3}>
              <Autocomplete
                freeSolo
                options={materials.map((m) => m.name)}
                value={item.material_name || ''}
                onInputChange={(e, val) => {
                  const newItems = [...orderItems];
                  newItems[index].material_name = val;
                  setOrderItems(newItems);
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Materiál" margin="dense" />
                )}
              />
            </Grid>

            {[
              'quantity',
              'price',
              'length',
              'width',
              'height',
              'tech_width',
            ].map((field) => (
              <Grid item xs={1.5} key={field}>
                <TextField
                  fullWidth
                  type="number"
                  label={field.charAt(0).toUpperCase() + field.slice(1)}
                  inputRef={item.refs[field]}
                  defaultValue={item[field] || ''}
                  margin="dense"
                  inputProps={{ inputMode: 'decimal', step: 'any' }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            ))}

            <Grid item xs={4}>
              <TextField
                fullWidth
                multiline
                minRows={1}
                label="Poznámky Jadro"
                inputRef={item.refs.notes_core}
                defaultValue={item.notes_core || ''}
                margin="dense"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                multiline
                minRows={1}
                label="Poznámky Plášť"
                inputRef={item.refs.notes_cover}
                defaultValue={item.notes_cover || ''}
                margin="dense"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={2}>
              <TextField
                fullWidth
                label="Štítok 1"
                inputRef={item.refs.label_1}
                defaultValue={item.label_1 || ''}
                margin="dense"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                fullWidth
                label="Štítok 2"
                inputRef={item.refs.label_2}
                defaultValue={item.label_2 || ''}
                margin="dense"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                fullWidth
                label="Štítok 3"
                inputRef={item.refs.label_3}
                defaultValue={item.label_3 || ''}
                margin="dense"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={0.5}>
              <IconButton
                onClick={() => handleRemoveItem(index)}
                aria-label="delete"
              >
                <Delete />
              </IconButton>
            </Grid>
          </Grid>
        ))}

        <Button variant="outlined" onClick={handleAddItem} sx={{ mt: 2 }}>
          Pridať položku
        </Button>

        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          Uložiť zmeny
        </Button>
      </form>
    </Container>
  );
}
