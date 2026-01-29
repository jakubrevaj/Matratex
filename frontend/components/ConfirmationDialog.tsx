'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  severity?: 'warning' | 'error' | 'info';
}

export default function ConfirmationDialog({
  open,
  title,
  message,
  confirmText = 'Potvrdiť',
  cancelText = 'Zrušiť',
  onConfirm,
  onCancel,
  severity = 'warning',
}: ConfirmationDialogProps) {
  const getIcon = () => {
    switch (severity) {
      case 'error':
        return <ErrorOutlineIcon color="error" />;
      case 'info':
        return <InfoOutlinedIcon color="info" />;
      default:
        return <WarningAmberIcon color="warning" />;
    }
  };

  const getConfirmColor = () => {
    switch (severity) {
      case 'error':
        return 'error';
      case 'info':
        return 'primary';
      default:
        return 'warning';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getIcon()}
          <Box component="span" sx={{ fontWeight: 600 }}>
            {title}
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} variant="outlined">
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={getConfirmColor()}
          autoFocus
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
