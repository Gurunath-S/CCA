import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  FormControlLabel,
  Checkbox,
  CircularProgress
} from '@mui/material';
import { ShieldOutlined as ShieldIcon } from '@mui/icons-material';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate, useLocation } from 'react-router-dom';

const PolicyAcknowledgmentDialog = () => {
  const { user, acknowledgePolicy, logout } = useAuthStore();
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // If no user, already acknowledged, or on the onboarding page, don't render anything
  if (!user || user.policyAcknowledged || location.pathname === '/onboarding') {
    return null;
  }

  const handleAccept = async () => {
    if (!accepted) return;
    setSubmitting(true);
    setError('');
    try {
      await acknowledgePolicy();
    } catch (err) {
      console.error(err);
      setError('Failed to record your agreement. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Dialog
      open={true}
      disableEscapeKeyDown
      maxWidth="md"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: '28px',
          bgcolor: 'var(--color-bg-paper, #ffffff)',
          color: 'var(--color-text, #0f172a)',
          backgroundImage: 'none',
          border: '1px solid var(--color-border, rgba(0, 0, 0, 0.08))',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 3, display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center', textAlign: 'center' }}>
        <ShieldIcon sx={{ color: '#f97316', fontSize: 44, mb: 1 }} />
        <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: '"Playfair Display", serif', color: 'inherit' }}>
          Review & Acknowledge Privacy Policy
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', maxW: '500px', mt: 0.5 }}>
          Before proceeding, please review and accept our Privacy Policy to understand how we store and manage your assessment details.
        </Typography>
      </DialogTitle>
      
      <Divider sx={{ opacity: 0.15 }} />

      <DialogContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3, maxHeight: '350px' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'inherit' }}>
            1. Commitment to Privacy
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.7, color: 'text.secondary' }}>
            Character Coach is a non-profit platform designed to support personal character development, reflection, and self-assessment. We believe your personal growth journey should be completely private. We do not engage in any commercial activity, advertising, or data monetization.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'inherit' }}>
            2. Information Collection and Storage
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.7, color: 'text.secondary' }}>
            <strong>No Mandatory Personal Information:</strong> We do not collect or require any mandatory personal details such as phone numbers, home or work addresses, or official identifications.
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.7, color: 'text.secondary' }}>
            <strong>Google Authentication:</strong> We use Google Sign-In solely to verify your identity securely. The information retrieved from your Google account (specifically your email, name, and profile picture URL) is only used to manage your login session and store your self-assessment records at your individual user level.
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.7, color: 'text.secondary', p: 2, bgcolor: 'rgba(249, 115, 22, 0.06)', borderRadius: '12px', borderLeft: '4px solid #f97316' }}>
            <strong>Recommendation:</strong> We strongly advise that you do not enter any personally identifiable information (PII) such as phone numbers, physical addresses, financial details, or sensitive personal data in any text inputs, journal notes, or custom attribute definitions within this platform.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'inherit' }}>
            3. Data Sharing and Commercial Use
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.7, color: 'text.secondary' }}>
            We strictly enforce a policy against sharing, selling, renting, or disclosing your data. No data collected on this platform will ever be used for marketing, commercial reasons, or advertising. All data remains exclusively yours, stored securely and accessible only through your authenticated login.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'inherit' }}>
            4. User Control and Data Rights
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.7, color: 'text.secondary' }}>
            We support your complete control over your data. In your Account Settings, you have access to:
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 3, lineHeight: 1.7, color: 'text.secondary', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <li><strong>Download Your Data:</strong> Export a full, structured copy of your profile, custom attributes, assessments, and journal notes in a standard JSON format.</li>
            <li><strong>Delete Your Account:</strong> Permanently delete your user account and erase all associated assessments, journal entries, attributes, and settings from our database. This action is immediate and completely irreversible.</li>
          </Typography>
        </Box>
      </DialogContent>

      <Divider sx={{ opacity: 0.15 }} />

      <Box sx={{ px: 4, py: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {error && (
          <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 500 }}>
            {error}
          </Typography>
        )}
        <FormControlLabel
          control={
            <Checkbox
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              sx={{
                color: 'var(--color-text-secondary, rgba(0, 0, 0, 0.54))',
                '&.Mui-checked': {
                  color: '#f97316',
                },
              }}
            />
          }
          label={
            <Typography variant="body2" sx={{ fontWeight: 500, userSelect: 'none', color: 'var(--color-text, inherit)' }}>
              I have read, understood, and accept the Privacy Policy.
            </Typography>
          }
        />
      </Box>

      <Divider sx={{ opacity: 0.15 }} />

      <DialogActions sx={{ p: 3, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        <Button
          onClick={handleDecline}
          variant="outlined"
          sx={{
            borderRadius: '12px',
            borderColor: 'var(--color-border, rgba(0, 0, 0, 0.12))',
            color: 'var(--color-text-secondary, text.secondary)',
            textTransform: 'none',
            px: 3,
            py: 1,
            fontWeight: 500,
            '&:hover': {
              borderColor: '#ef4444',
              color: '#ef4444',
              bgcolor: 'rgba(239, 68, 68, 0.05)'
            }
          }}
        >
          Decline & Logout
        </Button>
        
        <Button
          onClick={handleAccept}
          variant="contained"
          disabled={!accepted || submitting}
          sx={{
            borderRadius: '12px',
            bgcolor: '#f97316',
            color: '#ffffff',
            px: 4,
            py: 1.25,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#ea580c',
              boxShadow: 'none'
            },
            '&.Mui-disabled': {
              bgcolor: 'action.disabledBackground',
              color: 'action.disabled'
            }
          }}
        >
          {submitting ? <CircularProgress size={22} color="inherit" /> : 'Accept & Continue'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PolicyAcknowledgmentDialog;
