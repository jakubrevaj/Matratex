'use client';

import { useEffect, useRef, useState, createRef } from 'react';
import axios from 'axios';
import {
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
  Autocomplete,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import CreateIcon from '@mui/icons-material/Create';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/services/api';

type Mode = 'create' | 'edit';

type OrderFormProps = {
  mode: Mode;
  orderId?: string | number;
};

type OrderItemRefs = {
  quantity: React.RefObject<HTMLInputElement | null>;
  price: React.RefObject<HTMLInputElement | null>;
  length: React.RefObject<HTMLInputElement | null>;
  width: React.RefObject<HTMLInputElement | null>;
  height: React.RefObject<HTMLInputElement | null>;
  tech_width: React.RefObject<HTMLInputElement | null>;
  notes_core: React.RefObject<HTMLInputElement | null>;
  notes_cover: React.RefObject<HTMLInputElement | null>;
  label_1: React.RefObject<HTMLInputElement | null>;
  label_2: React.RefObject<HTMLInputElement | null>;
  label_3: React.RefObject<HTMLInputElement | null>;
};

type OrderItemState = {
  id?: number;
  productId: number;
  product_name: string;
  material_name: string;
  status?: string;
  quantity?: number;
  price?: number;
  length?: number;
  width?: number;
  height?: number;
  tech_width?: number;
  notes_core?: string;
  notes_cover?: string;
  label_1?: string;
  label_2?: string;
  label_3?: string;
  refs: OrderItemRefs;
};

export default function OrderForm({ mode, orderId }: OrderFormProps) {
  const router = useRouter();

  type Customer = { id: number; podnik?: string };
  type Product = { id: number; name: string };
  type Material = { id: number; name: string };

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItemState[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [newCustomerMode, setNewCustomerMode] = useState<boolean>(false);
  const [customerSearchInput, setCustomerSearchInput] = useState<string>('');
  const [loadingCustomers, setLoadingCustomers] = useState<boolean>(false);
  const [newCustomerData, setNewCustomerData] = useState<
    Record<string, string>
  >({
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

  const orderNumberRef = useRef<HTMLInputElement | null>(null);
  const issueDateRef = useRef<HTMLInputElement | null>(null);
  const notesRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        console.log('[OrderForm] Fetching data from API...');
        const [productRes, materialRes] = await Promise.all([
          axios.get(`${API_URL}/mattresses`),
          axios.get(`${API_URL}/materials`),
        ]);
        console.log('[OrderForm] Products received:', productRes.data.length);
        console.log('[OrderForm] Materials received:', materialRes.data.length);
        setProducts(productRes.data);
        setMaterials(materialRes.data);

        if (mode === 'create') {
          const today = new Date().toISOString().split('T')[0];
          if (issueDateRef.current) issueDateRef.current.value = today;
          setOrderItems([
            {
              productId: 0,
              product_name: '',
              material_name: '',
              refs: generateRefs(),
            },
          ]);
        }

        if (mode === 'edit' && orderId) {
          const res = await axios.get(`${API_URL}/orders/${orderId}`);
          type FetchedOrderItem = {
            product_id: number;
            product_name: string;
            material_name: string;
            quantity?: number;
            price?: number;
            length?: number;
            width?: number;
            height?: number;
            tech_width?: number;
            notes_core?: string;
            notes_cover?: string;
            label_1?: string;
            label_2?: string;
            label_3?: string;
            status?: string;
          };
          type FetchedOrder = {
            order_number?: string;
            issue_date: string;
            notes?: string;
            customer: Customer;
            order_items: FetchedOrderItem[];
          };
          const order = res.data as FetchedOrder;
          if (orderNumberRef.current)
            orderNumberRef.current.value = order.order_number || '';
          if (issueDateRef.current) {
            const date = new Date(order.issue_date);
            date.setDate(date.getDate() + 1);
            issueDateRef.current.value = date.toISOString().split('T')[0];
          }
          if (notesRef.current) notesRef.current.value = order.notes || '';
          setSelectedCustomer(order.customer);
          setOrderItems(
            (order.order_items || []).map((item) => ({
              ...item,
              productId: item.product_id,
              product_name: item.product_name,
              material_name: item.material_name,
              refs: generateRefs(),
            })),
          );
        }
      } catch (error) {
        console.error('[OrderForm] Error fetching data:', error);
      }
    };

    void init();
  }, [mode, orderId]);

  // Search customers with debouncing
  useEffect(() => {
    const searchCustomers = async () => {
      if (customerSearchInput.length < 2) {
        setCustomers([]);
        return;
      }

      setLoadingCustomers(true);
      try {
        const response = await axios.get(
          `${API_URL}/customers?limit=100&search=${encodeURIComponent(customerSearchInput)}`,
        );
        setCustomers(response.data);
      } catch (error) {
        console.error('[OrderForm] Error searching customers:', error);
      } finally {
        setLoadingCustomers(false);
      }
    };

    const timeoutId = setTimeout(searchCustomers, 300);
    return () => clearTimeout(timeoutId);
  }, [customerSearchInput]);

  const generateRefs = (): OrderItemRefs => ({
    quantity: createRef<HTMLInputElement>(),
    price: createRef<HTMLInputElement>(),
    length: createRef<HTMLInputElement>(),
    width: createRef<HTMLInputElement>(),
    height: createRef<HTMLInputElement>(),
    tech_width: createRef<HTMLInputElement>(),
    notes_core: createRef<HTMLInputElement>(),
    notes_cover: createRef<HTMLInputElement>(),
    label_1: createRef<HTMLInputElement>(),
    label_2: createRef<HTMLInputElement>(),
    label_3: createRef<HTMLInputElement>(),
  });

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

  // removed unused local-only remover (we use handleDeleteItem)

  const handleDeleteItem = async (itemId?: number, index?: number) => {
    const confirmed = confirm('Naozaj chcete zmazať položku?');
    if (!confirmed) return;
    try {
      if (itemId) {
        await axios.delete(`${API_URL}/order-items/${itemId}`);
      }
      if (typeof index === 'number') {
        setOrderItems((prev) => prev.filter((_, i) => i !== index));
      }
    } catch (err) {
      console.error(err);
      alert('Mazanie položky zlyhalo.');
    }
  };

  const handleAddProduct = async (productName: string) => {
    if (!productName.trim()) return;

    try {
      const res = await axios.post(`${API_URL}/mattresses`, {
        name: productName.trim(),
      });

      // Pridaj nový produkt do zoznamu
      setProducts((prev) => [...prev, res.data]);
      alert('Matrac bol úspešne pridaný!');
    } catch (err) {
      console.error('Chyba pri pridávaní matracu:', err);
      alert('Nepodarilo sa pridať matrac.');
    }
  };

  const handleAddMaterial = async (materialName: string) => {
    if (!materialName.trim()) return;

    try {
      const res = await axios.post(`${API_URL}/materials`, {
        name: materialName.trim(),
      });

      // Pridaj nový materiál do zoznamu
      setMaterials((prev) => [...prev, res.data]);
      alert('Materiál bol úspešne pridaný!');
    } catch (err) {
      console.error('Chyba pri pridávaní materiálu:', err);
      alert('Nepodarilo sa pridať materiál.');
    }
  };

  const createNewCustomer = async () => {
    try {
      const preparedCustomer = {
        ...newCustomerData,
        zlava: newCustomerData.zlava ? parseFloat(newCustomerData.zlava) : null,
        kod: newCustomerData.kod ? parseFloat(newCustomerData.kod) : null,
      };
      const res = await axios.post(`${API_URL}/customers`, preparedCustomer);
      setCustomers((prev) => [...prev, res.data]);
      setSelectedCustomer(res.data);
      setNewCustomerMode(false);
      setNewCustomerData({
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

  const buildItemsPayload = () => {
    const validItems = orderItems.filter((item) =>
      (item.product_name || '').trim(),
    );
    return validItems.map((item) => ({
      product_id: item.productId,
      product_name: item.product_name || '',
      material_name: item.material_name || '',
      quantity: Number(item.refs.quantity.current?.value) || 0,
      price: parseFloat(item.refs.price.current?.value ?? '') || 0,
      length: Number(item.refs.length.current?.value) || 0,
      width: Number(item.refs.width.current?.value) || 0,
      height: Number(item.refs.height.current?.value) || 0,
      tech_width: Number(item.refs.tech_width.current?.value) || 0,
      notes_core: item.refs.notes_core.current?.value || '',
      notes_cover: item.refs.notes_cover.current?.value || '',
      label_1: item.refs.label_1.current?.value || '',
      label_2: item.refs.label_2.current?.value || '',
      label_3: item.refs.label_3.current?.value || '',
      status: item.status || 'pending',
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const preparedItems = buildItemsPayload();
    if (preparedItems.length === 0)
      return alert('Musíte pridať aspoň jednu položku.');

    if (!selectedCustomer?.id) {
      return alert('Musíte vybrať zákazníka.');
    }

    const totalPrice = preparedItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0,
    );

    type OrderPayload = {
      order_number?: string;
      issue_date?: string;
      notes?: string;
      total_price: number;
      customer: { id: number };
      order_items: ReturnType<typeof buildItemsPayload>;
    };
    const basePayload: OrderPayload = {
      issue_date: issueDateRef.current?.value,
      notes: notesRef.current?.value || '',
      total_price: totalPrice,
      customer: { id: selectedCustomer.id },
      order_items: preparedItems,
    };

    const orderNumber = orderNumberRef.current?.value?.trim();
    if (orderNumber) basePayload.order_number = orderNumber;

    try {
      if (mode === 'create') {
        await axios.post(`${API_URL}/orders`, basePayload);
        alert('Objednávka bola úspešne vytvorená!');
        router.push('/orders');
      } else {
        await axios.put(`${API_URL}/orders/${orderId}`, basePayload);
        alert('Objednávka bola aktualizovaná.');
        router.push('/orders');
      }
    } catch (err) {
      console.error(err);
      alert('Operácia zlyhala.');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ px: 4, py: 3 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            color: '#1976d2',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {mode === 'create' ? (
            <>
              <CreateIcon sx={{ mr: 1 }} />
              Vytvorenie novej objednávky
            </>
          ) : (
            <>
              <EditIcon sx={{ mr: 1 }} />
              Úprava objednávky
            </>
          )}
        </Typography>
      </Stack>

      <Stack spacing={3}>
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '2px solid #e3f2fd',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                color: '#1976d2',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              👤 Výber zákazníka
            </Typography>

            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Button
                variant={newCustomerMode ? 'contained' : 'outlined'}
                color={newCustomerMode ? 'primary' : 'primary'}
                onClick={() => setNewCustomerMode((v) => !v)}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  fontWeight: 'bold',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 2px 8px rgba(25,118,210,0.2)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {newCustomerMode ? (
                  <>
                    <CancelIcon sx={{ mr: 0.5 }} />
                    Zrušiť nového zákazníka
                  </>
                ) : (
                  <>
                    <AddIcon sx={{ mr: 0.5 }} />
                    Nový zákazník
                  </>
                )}
              </Button>
            </Stack>

            {newCustomerMode ? (
              <Card
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  bgcolor: '#fafafa',
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}
                  >
                    <CreateIcon sx={{ mr: 1 }} />
                    Údaje nového zákazníka
                  </Typography>
                  <Grid container spacing={2}>
                    {Object.keys(newCustomerData).map((field) => (
                      <Grid item xs={12} sm={6} key={field}>
                        <TextField
                          fullWidth
                          label={field.toUpperCase()}
                          value={newCustomerData[field]}
                          onChange={(e) =>
                            setNewCustomerData((prev) => ({
                              ...prev,
                              [field]: e.target.value,
                            }))
                          }
                          margin="dense"
                          size="small"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 1.5,
                            },
                          }}
                        />
                      </Grid>
                    ))}
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={createNewCustomer}
                        fullWidth
                        sx={{
                          borderRadius: 2,
                          py: 1.5,
                          fontWeight: 'bold',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(76,175,80,0.3)',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <CheckCircleIcon sx={{ mr: 0.5 }} />
                        Vytvoriť zákazníka
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ) : (
              <Autocomplete
                options={customers}
                getOptionLabel={(option) =>
                  option.podnik
                    ? `${option.podnik} (ID: ${option.id})`
                    : `Neznámy (ID: ${option.id})`
                }
                getOptionKey={(option) => option.id}
                isOptionEqualToValue={(option, value) =>
                  option?.id === value?.id
                }
                value={selectedCustomer}
                onChange={(e, val) => setSelectedCustomer(val)}
                inputValue={customerSearchInput}
                onInputChange={(e, val) => setCustomerSearchInput(val)}
                loading={loadingCustomers}
                noOptionsText={
                  customerSearchInput.length < 2
                    ? 'Začnite písať pre vyhľadávanie zákazníka (min. 2 znaky)'
                    : 'Žiadni zákazníci nenájdení'
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Zákazník"
                    placeholder="Začnite písať názov zákazníka..."
                    required
                    margin="dense"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                )}
              />
            )}
          </CardContent>
        </Card>

        <Card
          sx={{
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '2px solid #e3f2fd',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                color: '#1976d2',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <AssignmentIcon sx={{ mr: 1 }} />
              Detaily objednávky
            </Typography>
            <Grid container spacing={2}>
              {mode === 'edit' && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Číslo objednávky"
                    inputRef={orderNumberRef}
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={mode === 'edit' ? 6 : 12}>
                <TextField
                  fullWidth
                  type="date"
                  label="Dátum vystavenia"
                  inputRef={issueDateRef}
                  margin="dense"
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  label="Poznámky"
                  inputRef={notesRef}
                  margin="dense"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card
          sx={{
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '2px solid #e3f2fd',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              mb={2}
            >
              <Typography
                variant="h6"
                sx={{
                  color: '#1976d2',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <ShoppingCartIcon sx={{ mr: 1 }} />
                Položky objednávky
              </Typography>
              <Button
                variant="contained"
                color="success"
                onClick={handleAddItem}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  fontWeight: 'bold',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(76,175,80,0.3)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <AddIcon sx={{ mr: 0.5 }} />
                Pridať položku
              </Button>
            </Stack>
            <Stack spacing={2}>
              {orderItems.map((item, index) => (
                <Card
                  key={index}
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    bgcolor: '#fafafa',
                    '&:hover': {
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Grid container spacing={1} alignItems="center">
                      {/* Produkt a materiál - hlavné polia */}
                      <Grid item xs={12}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            mb: 1,
                            color: '#666',
                            fontWeight: 'bold',
                            fontSize: '0.875rem',
                          }}
                        >
                          <InventoryIcon sx={{ mr: 1 }} />
                          Produkt a materiál
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6} md={5}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Autocomplete
                            freeSolo
                            options={products.map((p) => p.name)}
                            inputValue={item.product_name ?? ''}
                            onInputChange={(_, val) => {
                              setOrderItems((prev) => {
                                const newItems = [...prev];
                                newItems[index].product_name = val ?? '';
                                return newItems;
                              });
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Matrac"
                                margin="dense"
                                size="small"
                                placeholder="Vyberte alebo zadajte názov matracu..."
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 1.5,
                                    backgroundColor: '#fafafa',
                                  },
                                  '& .MuiInputLabel-root': {
                                    fontSize: '0.875rem',
                                  },
                                }}
                              />
                            )}
                            sx={{ flex: 1 }}
                          />
                          <IconButton
                            onClick={() => {
                              const productName = item.product_name?.trim();
                              if (
                                productName &&
                                !products.find((p) => p.name === productName)
                              ) {
                                handleAddProduct(productName);
                              }
                            }}
                            sx={{
                              color: '#4caf50',
                              '&:hover': {
                                backgroundColor: '#e8f5e8',
                                transform: 'scale(1.1)',
                              },
                              transition: 'all 0.2s ease',
                            }}
                            title="Pridať nový matrac"
                          >
                            <AddIcon />
                          </IconButton>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={1} md={1}>
                        <IconButton
                          onClick={() => handleDeleteItem(item.id, index)}
                          aria-label="delete"
                          sx={{
                            color: '#f44336',
                            '&:hover': {
                              backgroundColor: '#ffebee',
                              transform: 'scale(1.1)',
                            },
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Grid>

                      <Grid item xs={12} sm={6} md={5}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Autocomplete
                            freeSolo
                            options={materials.map((m) => m.name)}
                            inputValue={item.material_name ?? ''}
                            onInputChange={(_, val) => {
                              setOrderItems((prev) => {
                                const newItems = [...prev];
                                newItems[index].material_name = val ?? '';
                                return newItems;
                              });
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Materiál"
                                margin="dense"
                                size="small"
                                placeholder="Vyberte alebo zadajte názov materiálu..."
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 1.5,
                                    backgroundColor: '#fafafa',
                                  },
                                  '& .MuiInputLabel-root': {
                                    fontSize: '0.875rem',
                                  },
                                }}
                              />
                            )}
                            sx={{ flex: 1 }}
                          />
                          <IconButton
                            onClick={() => {
                              const materialName = item.material_name?.trim();
                              if (
                                materialName &&
                                !materials.find((m) => m.name === materialName)
                              ) {
                                handleAddMaterial(materialName);
                              }
                            }}
                            sx={{
                              color: '#4caf50',
                              '&:hover': {
                                backgroundColor: '#e8f5e8',
                                transform: 'scale(1.1)',
                              },
                              transition: 'all 0.2s ease',
                            }}
                            title="Pridať nový materiál"
                          >
                            <AddIcon />
                          </IconButton>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={1} md={1} />

                      {/* Číselné polia - prvá skupina */}
                      <Grid item xs={12}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            mb: 1,
                            color: '#666',
                            fontWeight: 'bold',
                            fontSize: '0.875rem',
                          }}
                        >
                          📏 Rozmery a množstvo
                        </Typography>
                      </Grid>

                      <Grid item xs={6} sm={4} md={2}>
                        <TextField
                          fullWidth
                          label="Počet"
                          type="number"
                          inputRef={item.refs.quantity}
                          defaultValue={item.quantity ?? ''}
                          margin="dense"
                          size="small"
                          inputProps={{
                            inputMode: 'decimal',
                            step: '1',
                            min: '1',
                          }}
                          InputLabelProps={{ shrink: true }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 1.5,
                              backgroundColor: '#fafafa',
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: '0.875rem',
                            },
                          }}
                        />
                      </Grid>

                      <Grid item xs={6} sm={4} md={2}>
                        <TextField
                          fullWidth
                          label="Cena (€)"
                          type="number"
                          inputRef={item.refs.price}
                          defaultValue={item.price ?? ''}
                          margin="dense"
                          size="small"
                          inputProps={{
                            inputMode: 'decimal',
                            step: '0.01',
                            min: '0',
                          }}
                          InputLabelProps={{ shrink: true }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 1.5,
                              backgroundColor: '#fafafa',
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: '0.875rem',
                            },
                          }}
                        />
                      </Grid>

                      <Grid item xs={6} sm={4} md={2}>
                        <TextField
                          fullWidth
                          label="Dĺžka (cm)"
                          type="number"
                          inputRef={item.refs.length}
                          defaultValue={item.length ?? ''}
                          margin="dense"
                          size="small"
                          inputProps={{
                            inputMode: 'decimal',
                            step: '0.1',
                            min: '0',
                          }}
                          InputLabelProps={{ shrink: true }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 1.5,
                              backgroundColor: '#fafafa',
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: '0.875rem',
                            },
                          }}
                        />
                      </Grid>

                      <Grid item xs={6} sm={4} md={2}>
                        <TextField
                          fullWidth
                          label="Šírka (cm)"
                          type="number"
                          inputRef={item.refs.width}
                          defaultValue={item.width ?? ''}
                          margin="dense"
                          size="small"
                          inputProps={{
                            inputMode: 'decimal',
                            step: '0.1',
                            min: '0',
                          }}
                          InputLabelProps={{ shrink: true }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 1.5,
                              backgroundColor: '#fafafa',
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: '0.875rem',
                            },
                          }}
                        />
                      </Grid>

                      <Grid item xs={6} sm={4} md={2}>
                        <TextField
                          fullWidth
                          label="Výška (cm)"
                          type="number"
                          inputRef={item.refs.height}
                          defaultValue={item.height ?? ''}
                          margin="dense"
                          size="small"
                          inputProps={{
                            inputMode: 'decimal',
                            step: '0.1',
                            min: '0',
                          }}
                          InputLabelProps={{ shrink: true }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 1.5,
                              backgroundColor: '#fafafa',
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: '0.875rem',
                            },
                          }}
                        />
                      </Grid>

                      <Grid item xs={6} sm={4} md={2}>
                        <TextField
                          fullWidth
                          label="T.šírka (cm)"
                          type="number"
                          inputRef={item.refs.tech_width}
                          defaultValue={item.tech_width ?? ''}
                          margin="dense"
                          size="small"
                          inputProps={{
                            inputMode: 'decimal',
                            step: '0.1',
                            min: '0',
                          }}
                          InputLabelProps={{ shrink: true }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 1.5,
                              backgroundColor: '#fafafa',
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: '0.875rem',
                            },
                          }}
                        />
                      </Grid>

                      {/* Poznámky - druhá skupina */}
                      <Grid item xs={12}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            mb: 1,
                            color: '#666',
                            fontWeight: 'bold',
                            fontSize: '0.875rem',
                          }}
                        >
                          <CreateIcon sx={{ mr: 1 }} />
                          Poznámky
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          multiline
                          minRows={2}
                          label="Poznámky Jadro"
                          inputRef={item.refs.notes_core}
                          defaultValue={item.notes_core || ''}
                          margin="dense"
                          size="small"
                          InputLabelProps={{ shrink: true }}
                          placeholder="Zadajte poznámky pre jadro..."
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 1.5,
                              backgroundColor: '#fafafa',
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: '0.875rem',
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          multiline
                          minRows={2}
                          label="Poznámky Plášť"
                          inputRef={item.refs.notes_cover}
                          defaultValue={item.notes_cover || ''}
                          margin="dense"
                          size="small"
                          InputLabelProps={{ shrink: true }}
                          placeholder="Zadajte poznámky pre plášť..."
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 1.5,
                              backgroundColor: '#fafafa',
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: '0.875rem',
                            },
                          }}
                        />
                      </Grid>

                      {/* Štítky - tretia skupina */}
                      <Grid item xs={12}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            mb: 1,
                            color: '#666',
                            fontWeight: 'bold',
                            fontSize: '0.875rem',
                          }}
                        >
                          🏷️ Štítky
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={4} md={4}>
                        <TextField
                          fullWidth
                          label="Štítok 1"
                          inputRef={item.refs.label_1}
                          defaultValue={item.label_1 || ''}
                          margin="dense"
                          size="small"
                          InputLabelProps={{ shrink: true }}
                          placeholder="Zadajte štítok..."
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 1.5,
                              backgroundColor: '#fafafa',
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: '0.875rem',
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4} md={4}>
                        <TextField
                          fullWidth
                          label="Štítok 2"
                          inputRef={item.refs.label_2}
                          defaultValue={item.label_2 || ''}
                          margin="dense"
                          size="small"
                          InputLabelProps={{ shrink: true }}
                          placeholder="Zadajte štítok..."
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 1.5,
                              backgroundColor: '#fafafa',
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: '0.875rem',
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4} md={4}>
                        <TextField
                          fullWidth
                          label="Štítok 3"
                          inputRef={item.refs.label_3}
                          defaultValue={item.label_3 || ''}
                          margin="dense"
                          size="small"
                          InputLabelProps={{ shrink: true }}
                          placeholder="Zadajte štítok..."
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 1.5,
                              backgroundColor: '#fafafa',
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: '0.875rem',
                            },
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={1} md={1} />
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Divider />

        <Card
          sx={{
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '2px solid #e3f2fd',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                color: '#1976d2',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              ⚡ Akcie
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={onSubmit}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  fontWeight: 'bold',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(25,118,210,0.3)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {mode === 'create' ? (
                  <>
                    <CheckCircleIcon sx={{ mr: 0.5 }} />
                    Vytvoriť objednávku
                  </>
                ) : (
                  <>
                    <SaveIcon sx={{ mr: 0.5 }} />
                    Uložiť zmeny
                  </>
                )}
              </Button>
              {mode === 'edit' && (
                <Button
                  color="error"
                  variant="outlined"
                  fullWidth
                  onClick={async () => {
                    const confirmed = confirm(
                      'Naozaj chcete zmazať celú objednávku?',
                    );
                    if (!confirmed) return;
                    try {
                      await axios.delete(`${API_URL}/orders/${orderId}`);
                      alert('Objednávka bola zmazaná.');
                      router.push('/orders');
                    } catch (err) {
                      console.error(err);
                      alert('Mazanie objednávky zlyhalo.');
                    }
                  }}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    fontWeight: 'bold',
                    borderWidth: 2,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(244,67,54,0.3)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <DeleteIcon sx={{ mr: 0.5 }} />
                  Zmazať objednávku
                </Button>
              )}
              <Button
                variant="outlined"
                fullWidth
                onClick={() => router.push('/orders')}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  fontWeight: 'bold',
                  borderWidth: 2,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(158,158,158,0.3)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <CancelIcon sx={{ mr: 0.5 }} />
                Zrušiť
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
