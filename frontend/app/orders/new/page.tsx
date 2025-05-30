'use client';

import { useState, useEffect, useRef, createRef } from 'react';
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

const statuses = [
  'pending',
  'to-production',
  'in-production',
  'completed',
  'invoiced',
  'archived', // nový stav
];

export default function NewOrderPage() {
  const orderNumberRef = useRef();
  const issueDateRef = useRef();
  const notesRef = useRef();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [newCustomerMode, setNewCustomerMode] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [newCustomerData, setNewCustomerData] = useState({
    ico: '',
    drc: '',
    podnik: '',
    podnik2: '',
    adresa: '',
    psc: '',
    mesto: '',
    stat: '',
    tel: '',
    mobil: '',
    mobil2: '',
    plat_dph: '',
    zlava: '',
    cuct: '',
    banka: '',
    kod_ban: '',
    kod: '',
    kpodnik: '',
    kadresa: '',
    kpsc: '',
    kmesto: '',
    zhz: '',
    lok: '',
    fy: '',
    sk: '',
    email: '', // 👈 tu pridávame
  });

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/customers`)
      .then((res) => setCustomers(res.data));
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/mattresses`)
      .then((res) => setProducts(res.data));
    const today = new Date().toISOString().split('T')[0];
    if (issueDateRef.current) issueDateRef.current.value = today;
    setOrderItems([{ productId: 0, refs: generateRefs() }]);

    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/materials`).then((res) => {
      console.log('Materials:', res.data);
      setMaterials(res.data);
    });
  }, []);

  const generateRefs = () => ({
    quantity: createRef(),
    price: createRef(),
    length: createRef(),
    width: createRef(),
    height: createRef(),
    tech_width: createRef(),
    notes_core: createRef(),
    notes_cover: createRef(),
    status: createRef(),
    label_1: createRef(),
    label_2: createRef(),
    label_3: createRef(),
    material: createRef(),
  });

  const handleAddItem = () => {
    setOrderItems((prev) => [
      ...prev,
      {
        productId: 0,
        product_name: '', // ← pridaj
        material_name: '', // ← pridaj
        refs: generateRefs(),
      },
    ]);
  };

  const handleRemoveItem = (indexToRemove) => {
    setOrderItems((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const createNewCustomer = async () => {
    try {
      const preparedCustomer = {
        ...newCustomerData,
        zlava: newCustomerData.zlava ? parseFloat(newCustomerData.zlava) : null,
        kod: newCustomerData.kod ? parseFloat(newCustomerData.kod) : null,
      };
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/customers`,
        preparedCustomer
      );
      setCustomers((prev) => [...prev, res.data]);
      setSelectedCustomer(res.data);
      setNewCustomerMode(false);
      setNewCustomerData({
        // vyresetuje všetky polia
        ico: '',
        drc: '',
        podnik: '',
        podnik2: '',
        adresa: '',
        psc: '',
        mesto: '',
        stat: '',
        tel: '',
        mobil: '',
        mobil2: '',
        plat_dph: '',
        zlava: '',
        cuct: '',
        banka: '',
        kod_ban: '',
        kod: '',
        kpodnik: '',
        kadresa: '',
        kpsc: '',
        kmesto: '',
        zhz: '',
        lok: '',
        fy: '',
        sk: '',
        email: '',
      });
      alert('Zákazník bol vytvorený.');
    } catch (err) {
      console.error(err);
      alert('Chyba pri vytváraní zákazníka.');
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const validItems = orderItems.filter((item) => item.product_name?.trim());
    if (validItems.length === 0)
      return alert('Musíte pridať aspoň jednu položku.');

    const preparedItems = validItems.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        product_id: item.productId,
        product_name: item.product_name || '',
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

        status: 'pending',
        material_name: item.material_name || '',
      };
    });

    const totalPrice = preparedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const payload = {
      issue_date: issueDateRef.current?.value,
      notes: notesRef.current?.value,
      total_price: totalPrice,
      customer: { id: selectedCustomer?.id },
      order_items: preparedItems,
    };

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/orders`, payload);
      alert('Objednávka bola úspešne vytvorená!');
      setOrderItems([]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h5" gutterBottom>
        Vytvorenie novej objednávky
      </Typography>
      <form onSubmit={onSubmit}>
        <Button
          variant="outlined"
          onClick={() => setNewCustomerMode((v) => !v)}
        >
          {newCustomerMode ? 'Zrušiť nového zákazníka' : 'Nový zákazník'}
        </Button>

        {newCustomerMode && (
          <Grid container spacing={2} marginTop={1}>
            {Object.keys(newCustomerData).map((field) => (
              <Grid item xs={6} key={field}>
                <TextField
                  fullWidth
                  label={field.toUpperCase()}
                  value={newCustomerData[field]}
                  onChange={(e) =>
                    setNewCustomerData({
                      ...newCustomerData,
                      [field]: e.target.value,
                    })
                  }
                  margin="dense"
                />
              </Grid>
            ))}
            <Grid item xs={12}>
              <Button variant="contained" onClick={createNewCustomer} fullWidth>
                Vytvoriť zákazníka
              </Button>
            </Grid>
          </Grid>
        )}

        {!newCustomerMode && (
          <Autocomplete
            options={customers.filter(
              (v, i, a) => a.findIndex((t) => t.podnik === v.podnik) === i
            )}
            getOptionLabel={(option) => option.podnik || 'Neznámy'}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            value={selectedCustomer}
            onChange={(e, val) => setSelectedCustomer(val)}
            renderInput={(params) => (
              <TextField {...params} label="Zákazník" required margin="dense" />
            )}
          />
        )}

        <Grid container spacing={1} marginTop={1}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="date"
              label="Dátum vystavenia"
              inputRef={issueDateRef}
              InputLabelProps={{ shrink: true }}
              margin="dense"
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
            <Grid item xs={3.5}>
              <Autocomplete
                freeSolo
                options={products.map((p) => p.name)}
                inputValue={item.product_name ?? ''}
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
            <Grid item xs={0.5}>
              <IconButton
                onClick={async () => {
                  const name = item.product_name?.trim();
                  if (!name) return;
                  try {
                    const res = await axios.post(
                      `${process.env.NEXT_PUBLIC_API_URL}/mattresses`,
                      { name }
                    );
                    setProducts((prev) => [...prev, res.data]);
                    alert(`Matrac '${name}' bol pridaný`);
                  } catch (err) {
                    console.error(err);
                    alert('Nepodarilo sa pridať matrac.');
                  }
                }}
              >
                +
              </IconButton>
            </Grid>

            <Grid item xs={3.5}>
              <Autocomplete
                freeSolo
                options={materials.map((m) => m.name)}
                inputValue={item.material_name ?? ''}
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
            <Grid item xs={0.5}>
              <IconButton
                onClick={async () => {
                  const name = item.material_name?.trim();
                  if (!name) return;
                  try {
                    const res = await axios.post(
                      `${process.env.NEXT_PUBLIC_API_URL}/materials`,
                      { name }
                    );
                    setMaterials((prev) => [...prev, res.data]);
                    alert(`Materiál '${name}' bol pridaný`);
                  } catch (err) {
                    console.error(err);
                    alert('Nepodarilo sa pridať materiál.');
                  }
                }}
              >
                +
              </IconButton>
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
                  label={field.charAt(0).toUpperCase() + field.slice(1)}
                  type="number"
                  inputRef={item.refs[field]}
                  margin="dense"
                  inputProps={{ inputMode: 'decimal', step: 'any' }}
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
                margin="dense"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                multiline
                minRows={1}
                label="Poznámky Plášť"
                inputRef={item.refs.notes_cover}
                margin="dense"
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                fullWidth
                multiline
                minRows={1}
                label="Štítok 1"
                inputRef={item.refs.label_1}
                margin="dense"
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                fullWidth
                multiline
                minRows={1}
                label="Štítok 2"
                inputRef={item.refs.label_2}
                margin="dense"
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                fullWidth
                multiline
                minRows={1}
                label="Štítok 3"
                inputRef={item.refs.label_3}
                margin="dense"
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
          Vytvoriť objednávku
        </Button>
      </form>
    </Container>
  );
}
