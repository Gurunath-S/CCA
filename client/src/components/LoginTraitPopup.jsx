import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  IconButton
} from '@mui/material';
import { Spa as SpaIcon, Close as CloseIcon, InfoOutlined as InfoIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { DEFAULT_TRAITS } from '../utils/defaultTraits';

const LoginTraitPopup = () => {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [trait, setTrait] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Only trigger if user exists, has acknowledged the policy, and the popup hasn't been shown in this tab session
    if (user && user.policyAcknowledged) {
      const shown = sessionStorage.getItem('loginTraitPopupShown');
      if (!shown) {
        // Select a random character trait
        const randomIndex = Math.floor(Math.random() * DEFAULT_TRAITS.length);
        setTrait(DEFAULT_TRAITS[randomIndex]);
        setOpen(true);
        sessionStorage.setItem('loginTraitPopupShown', 'true');
      }
    }
  }, [user]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleExplore = () => {
    setOpen(false);
    navigate('/characters');
  };

  if (!open || !trait) return null;

  // Category chip color helper
  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Yama': return 'primary';
      case 'Niyama': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '28px',
          bgcolor: 'var(--color-bg-paper, #ffffff)',
          color: 'var(--color-text, #0f172a)',
          backgroundImage: 'none',
          border: '1px solid var(--color-border, rgba(0, 0, 0, 0.08))',
          boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          position: 'relative'
        }
      }}
    >
      {/* Decorative top accent colored background */}
      <Box 
        sx={{ 
          height: '8px', 
          width: '100%', 
          bgcolor: '#f97316', 
          background: 'linear-gradient(90deg, #f97316 0%, #f59e0b 100%)' 
        }} 
      />

      {/* Close button in top-right */}
      <IconButton
        onClick={handleClose}
        sx={{
          position: 'absolute',
          right: 12,
          top: 16,
          color: 'text.secondary',
          '&:hover': { color: 'var(--color-text, #0f172a)' }
        }}
      >
        <CloseIcon size="small" />
      </IconButton>

      <DialogContent sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 2 }}>
        {/* Wisdom Spa Icon */}
        <Box 
          sx={{ 
            width: 60, 
            height: 60, 
            borderRadius: '20px', 
            bgcolor: 'rgba(249, 115, 22, 0.08)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            mb: 1
          }}
        >
          <SpaIcon sx={{ color: '#f97316', fontSize: 32 }} />
        </Box>

        <Box sx={{ spaceY: 1 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              fontWeight: 700, 
              color: '#f97316', 
              letterSpacing: '0.1em', 
              textTransform: 'uppercase',
              fontSize: '0.75rem'
            }}
          >
            Daily Trait Insight
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 800, 
              fontFamily: '"Playfair Display", serif', 
              color: 'inherit',
              mt: 0.5
            }}
          >
            {trait.name}
          </Typography>
        </Box>

        <Chip 
          label={`${trait.category} Aspect`} 
          color={getCategoryColor(trait.category)} 
          size="small" 
          sx={{ fontWeight: 600, fontSize: '0.7rem', px: 1 }}
        />

        <Typography 
          variant="body2" 
          sx={{ 
            lineHeight: 1.7, 
            color: 'text.secondary', 
            fontStyle: 'italic',
            px: 1,
            mt: 1
          }}
        >
          “{trait.description}”
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 4, pb: 4, pt: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Button
          fullWidth
          onClick={handleClose}
          variant="contained"
          sx={{
            borderRadius: '14px',
            bgcolor: '#f97316',
            color: '#ffffff',
            py: 1.25,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#ea580c',
              boxShadow: 'none'
            }
          }}
        >
          Got it, thanks!
        </Button>
        <Button
          fullWidth
          onClick={handleExplore}
          variant="outlined"
          sx={{
            borderRadius: '14px',
            borderColor: 'var(--color-border, rgba(0, 0, 0, 0.12))',
            color: 'text.secondary',
            py: 1,
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.8rem',
            '&:hover': {
              borderColor: 'var(--color-text, #0f172a)',
              bgcolor: 'rgba(0, 0, 0, 0.03)'
            }
          }}
        >
          Explore All Attributes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoginTraitPopup;
