import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Divider
} from '@mui/material';
import { Close as CloseIcon, InfoOutlined as InfoIcon } from '@mui/icons-material';

const AppInfoDialog = ({ open, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          bgcolor: 'var(--color-bg-paper, #ffffff)',
          color: 'var(--color-text, #0f172a)',
          backgroundImage: 'none',
          border: '1px solid var(--color-border, rgba(0, 0, 0, 0.08))',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 3, display: 'flex', alignItems: 'center', gap: 1.5, color: '#f97316' }}>
        <InfoIcon sx={{ fontSize: 28 }} />
        <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: '"Playfair Display", serif', color: 'var(--color-text, inherit)' }}>
          What is Character Coach?
        </Typography>
        {onClose && (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 16,
              top: 16,
              color: 'text.secondary',
              '&:hover': { color: '#f97316' }
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>
      
      <Divider sx={{ opacity: 0.15 }} />

      <DialogContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
          Character Coach is a non-commercial, non-profit platform dedicated to supporting your personal growth, mindfulness, and character alignment.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'start', gap: 1.5 }}>
            <span style={{ color: '#f97316', marginTop: '2px', fontWeight: 'bold' }}>✦</span>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--color-text, inherit)' }}>
                Self-Assessments
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.825rem', mt: 0.25 }}>
                Map and rate your core character traits across key values to monitor alignment with your ideals.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'start', gap: 1.5 }}>
            <span style={{ color: '#f97316', marginTop: '2px', fontWeight: 'bold' }}>✦</span>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--color-text, inherit)' }}>
                Reflective Journal
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.825rem', mt: 0.25 }}>
                Write down private lessons, observations, and milestones directly attached to your assessments.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'start', gap: 1.5 }}>
            <span style={{ color: '#f97316', marginTop: '2px', fontWeight: 'bold' }}>✦</span>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--color-text, inherit)' }}>
                Visual Analytics
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.825rem', mt: 0.25 }}>
                Review interactive charts and historical trends tracking your development and progress over time.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'start', gap: 1.5 }}>
            <span style={{ color: '#f97316', marginTop: '2px', fontWeight: 'bold' }}>✦</span>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--color-text, inherit)' }}>
                Guaranteed Privacy
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.825rem', mt: 0.25 }}>
                No tracking, no commercial ads, zero mandatory personal info, and complete self-service export and account deletion.
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <Divider sx={{ opacity: 0.15 }} />

      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            borderRadius: '12px',
            bgcolor: '#f97316',
            color: '#ffffff',
            px: 4,
            py: 1,
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              bgcolor: '#ea580c'
            }
          }}
        >
          Got It
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AppInfoDialog;
