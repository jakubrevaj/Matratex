'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Menu,
  MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HomeIcon from '@mui/icons-material/Home';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import BuildIcon from '@mui/icons-material/Build';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HistoryIcon from '@mui/icons-material/History';
import DeleteIcon from '@mui/icons-material/Delete';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import PaymentsIcon from '@mui/icons-material/Payments';
import SettingsIcon from '@mui/icons-material/Settings';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import AddIcon from '@mui/icons-material/Add';
import { alpha } from '@mui/material/styles';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMoreMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMoreMenuAnchor(event.currentTarget);
  };

  const handleMoreMenuClose = () => {
    setMoreMenuAnchor(null);
  };

  const menuItems = [
    { href: '/', label: 'Domov', icon: <HomeIcon />, shortLabel: 'Domov' },
    {
      href: '/orders',
      label: 'Objednávky',
      icon: <AssignmentIcon />,
      shortLabel: 'Objednávky',
    },
    {
      href: '/invoices',
      label: 'Faktúry',
      icon: <ReceiptLongIcon />,
      shortLabel: 'Faktúry',
    },
    {
      href: '/production',
      label: 'Produkcia',
      icon: <BuildIcon />,
      shortLabel: 'Produkcia',
    },
    {
      href: '/delivery',
      label: 'Dodáky',
      icon: <LocalShippingIcon />,
      shortLabel: 'Dodáky',
    },
  ];

  const moreItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: <DashboardIcon />,
      shortLabel: 'Dashboard',
    },
    {
      href: '/historical-orders',
      label: 'História objednávok',
      icon: <HistoryIcon />,
      shortLabel: 'História',
    },
    {
      href: '/deleted-orders',
      label: 'Vymazané objednávky',
      icon: <DeleteIcon />,
      shortLabel: 'Vymazané',
    },
    {
      href: '/archived-items',
      label: 'Archív položiek',
      icon: <Inventory2Icon />,
      shortLabel: 'Archív',
    },
    {
      href: '/invoices/payment-status',
      label: 'Sledovanie platieb',
      icon: <PaymentsIcon />,
      shortLabel: 'Platby',
    },
  ];

  const drawer = (
    <Box
      onClick={handleDrawerToggle}
      sx={{ textAlign: 'center', height: '100%' }}
    >
      <Box
        sx={{
          p: 3,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: 'background.default',
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: 'primary.main',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          <PrecisionManufacturingIcon />
          Matratex
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Systém pre výrobu matracov
        </Typography>
      </Box>

      <List sx={{ pt: 2 }}>
        <Typography
          variant="subtitle2"
          sx={{ px: 2, py: 1, color: 'text.secondary', fontWeight: 'bold' }}
        >
          Hlavné funkcie
        </Typography>
        {menuItems.map((item) => (
          <ListItem key={item.href} disablePadding>
            <ListItemButton
              component={Link}
              href={item.href}
              prefetch={true}
              sx={{
                mx: 1,
                borderRadius: 2,
                mb: 0.5,
                '&:hover': {
                  backgroundColor: 'primary.light',
                  transform: 'translateX(4px)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <ListItemIcon
                sx={{ minWidth: 45, color: 'primary.main', '& svg': { fontSize: 22 } }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontWeight: '600' }}
              />
            </ListItemButton>
          </ListItem>
        ))}

        <Typography
          variant="subtitle2"
          sx={{
            px: 2,
            py: 1,
            color: 'text.secondary',
            fontWeight: 'bold',
            mt: 2,
          }}
        >
          Dodatočné funkcie
        </Typography>
        {moreItems.map((item) => (
          <ListItem key={item.href} disablePadding>
            <ListItemButton
              component={Link}
              href={item.href}
              prefetch={true}
              sx={{
                mx: 1,
                borderRadius: 2,
                mb: 0.5,
                '&:hover': {
                  backgroundColor: 'action.hover',
                  transform: 'translateX(4px)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <ListItemIcon
                sx={{ minWidth: 45, color: 'primary.main', '& svg': { fontSize: 22 } }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                secondary={item.shortLabel}
                primaryTypographyProps={{ fontWeight: '600' }}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="static"
        sx={{
          backgroundColor: 'primary.main',
          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
          borderBottom: `2px solid ${theme.palette.primary.dark}`,
        }}
      >
        <Toolbar sx={{ minHeight: '64px' }}>
          {/* Logo a názov */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mr: { xs: 2, md: 4 },
              borderRight: '2px solid rgba(255,255,255,0.2)',
              pr: { xs: 2, md: 3 },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontSize: { xs: '1rem', md: '1.25rem' },
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <PrecisionManufacturingIcon fontSize="small" />
              Matratex
            </Typography>
          </Box>

          {/* Prvý tlačidlo: Nová objednávka */}
          <Button
            component={Link}
            href="/orders/new"
            prefetch={true}
            variant="contained"
            sx={{
              backgroundColor: 'secondary.main',
              color: 'white',
              textTransform: 'none',
              mr: { xs: 1, md: 3 },
              borderRadius: 2,
              px: { xs: 2, md: 3 },
              fontWeight: 'bold',
              fontSize: { xs: '0.875rem', md: '1rem' },
              boxShadow: `0 2px 8px ${alpha(theme.palette.secondary.main, 0.3)}`,
              '&:hover': {
                backgroundColor: 'secondary.dark',
                boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.4)}`,
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease',
            }}
            startIcon={<AddIcon />}
          >
            {isMobile ? 'Nová' : 'Nová objednávka'}
          </Button>

          {/* Desktop menu */}
          {!isMobile && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexGrow: 1,
                gap: 0.5,
                flexWrap: 'nowrap',
                overflow: 'hidden',
              }}
            >
              {menuItems.map((item) => (
                <Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  prefetch={true}
                  startIcon={
                    <Box sx={{ display: 'flex', alignItems: 'center', '& svg': { fontSize: 18 } }}>
                      {item.icon}
                    </Box>
                  }
                  sx={{
                    color: 'white',
                    textTransform: 'none',
                    borderRadius: 2,
                    px: item.href === '/' ? 2.5 : 2,
                    py: 0.8,
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    minWidth: 'auto',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.common.white, 0.2),
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 8px ${alpha(theme.palette.common.black, 0.2)}`,
                    },
                    transition: 'all 0.3s ease',
                    '&:active': {
                      transform: 'translateY(0px)',
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}

              {/* Viac menu */}
              <Button
                onClick={handleMoreMenuOpen}
                startIcon={
                  <SettingsIcon fontSize="small" />
                }
                endIcon={<ExpandMoreIcon sx={{ fontSize: '1rem' }} />}
                sx={{
                  color: 'white',
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 2,
                  py: 0.8,
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  minWidth: 'auto',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.common.white, 0.2),
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 8px ${alpha(theme.palette.common.black, 0.2)}`,
                  },
                  transition: 'all 0.3s ease',
                  '&:active': {
                    transform: 'translateY(0px)',
                  },
                }}
              >
                Viac
              </Button>
            </Box>
          )}

          {/* Mobile menu button */}
          {isMobile && (
            <Box
              sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}
            >
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
        }}
      >
        {drawer}
      </Drawer>

      {/* Viac menu dropdown */}
      <Menu
        anchorEl={moreMenuAnchor}
        open={Boolean(moreMenuAnchor)}
        onClose={handleMoreMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        sx={{
          '& .MuiPaper-root': {
            borderRadius: 3,
            boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.15)}`,
            border: `1px solid ${theme.palette.divider}`,
            mt: 1,
            minWidth: 200,
          },
        }}
      >
        {moreItems.map((item) => (
          <MenuItem
            key={item.href}
            component={Link}
            href={item.href}
            prefetch={true}
            onClick={handleMoreMenuClose}
            sx={{
              px: 2.5,
              py: 1.5,
              borderRadius: 1,
              mx: 1,
              my: 0.5,
              '&:hover': {
                backgroundColor: 'primary.light',
                transform: 'translateX(4px)',
                boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`,
              },
              transition: 'all 0.2s ease',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', '& svg': { fontSize: 22 }, color: 'primary.main' }}>
                {item.icon}
              </Box>
              <Box>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: '600', color: 'primary.main' }}
                >
                  {item.label}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {item.shortLabel}
                </Typography>
              </Box>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
