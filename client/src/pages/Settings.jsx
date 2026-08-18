import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Avatar,
  Divider,
  Paper,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Snackbar
} from '@mui/material';
import {
  Palette as PaletteIcon,
  Person as PersonIcon,
  CheckCircle as CheckIcon,
  ShieldOutlined as ShieldIcon,
  DownloadOutlined as DownloadIcon,
  DeleteForeverOutlined as DeleteIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { profileService } from '../services/profile.service';
import { generatePDFReport } from '../utils/pdfGenerator';
import { generateCSVReport } from '../utils/csvGenerator';
import PrivacyPolicyDialog from '../components/PrivacyPolicyDialog';
import { ExportDataDialog } from '../components/ExportDataDialog';

const themes = [
  { name: 'Serenity', desc: 'Calm light blue, minimal', colors: ['#2563eb', '#3b82f6', '#f8fafc'] },
  { name: 'Midnight Focus', desc: 'Sleek dark navy focus', colors: ['#60a5fa', '#1e293b', '#0f172a'] },
  { name: 'Nature', desc: 'Relaxing green balance', colors: ['#059669', '#10b981', '#f0fdf4'] },
  { name: 'Classic', desc: 'Gold, cream & warm brown', colors: ['#b45309', '#d97706', '#fffbeb'] },
  { name: 'Vivekananda', desc: 'Saffron energy & deep blue', colors: ['#f97316', '#1e3a8a', '#fffbeb'] },
];

const PRESET_AVATARS = [
  '/avatars/avatar_1.png',
  '/avatars/avatar_2.png',
  '/avatars/avatar_3.png',
  '/avatars/avatar_4.png',
  '/avatars/avatar_5.png',
  '/avatars/avatar_6.png',
  '/avatars/avatar_7.png',
  '/avatars/avatar_8.png'
];

const ageGroups = ['15–20', '20–25', '25–30', '30–40', '40–50', '50–60', 'Above 60'];

const Settings = () => {
  const { user, updateProfile, updateAccount, setTheme, deleteAccount, accessToken } = useAuthStore();
  const selectedAge = user?.profile?.ageGroup || '';
  const activeTheme = user?.profile?.theme || 'Classic';
  const selectedStreak = user?.profile?.streakType || '';
  const [successMsg, setSuccessMsg] = useState('');
  const [successMsgSeverity, setSuccessMsgSeverity] = useState('success');
  const [isLoading, setIsLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // Account details states
  const [tempName, setTempName] = useState(user?.name || '');
  const [tempEmail, setTempEmail] = useState(user?.email || '');
  const [tempPicture, setTempPicture] = useState(user?.picture || '');
  const [saveAccountLoading, setSaveAccountLoading] = useState(false);

  const handleExportData = async (format = 'pdf', contentSelection = 'all', dateFilter = { type: 'all' }) => {
    setExporting(true);
    setSuccessMsg('');
    try {
      const data = await profileService.exportData(accessToken);
      
      // Clone the exported data payload to avoid mutations
      const filteredData = { ...data };

      if (dateFilter && dateFilter.type !== 'all') {
        let start = null;
        let end = null;

        if (dateFilter.type === '7days') {
          start = new Date();
          start.setDate(start.getDate() - 7);
          start.setHours(0, 0, 0, 0);
        } else if (dateFilter.type === '30days') {
          start = new Date();
          start.setDate(start.getDate() - 30);
          start.setHours(0, 0, 0, 0);
        } else if (dateFilter.type === 'custom') {
          if (dateFilter.startDate) {
            start = new Date(dateFilter.startDate);
            start.setHours(0, 0, 0, 0);
          }
          if (dateFilter.endDate) {
            end = new Date(dateFilter.endDate);
            end.setHours(23, 59, 59, 999);
          }
        }

        if (filteredData.assessments) {
          filteredData.assessments = filteredData.assessments.filter(assess => {
            const date = new Date(assess.assessmentDate);
            if (start && date < start) return false;
            if (end && date > end) return false;
            return true;
          });
        }

        if (filteredData.journalNotes) {
          filteredData.journalNotes = filteredData.journalNotes.filter(note => {
            const date = new Date(note.createdAt);
            if (start && date < start) return false;
            if (end && date > end) return false;
            return true;
          });
        }

        filteredData.dateRangeLabel = dateFilter.type === '7days' ? 'Last 7 Days'
          : dateFilter.type === '30days' ? 'Last 30 Days'
          : `Custom Range (${new Date(dateFilter.startDate).toLocaleDateString()} - ${new Date(dateFilter.endDate).toLocaleDateString()})`;
      } else {
        filteredData.dateRangeLabel = 'All Time';
      }

      if (format === 'excel') {
        generateCSVReport(filteredData, contentSelection);
        setSuccessMsg('Your progress data spreadsheet has been successfully compiled and downloaded!');
        setSuccessMsgSeverity('success');
      } else {
        generatePDFReport(filteredData, contentSelection);
        setSuccessMsg('Your personal progress report PDF has been successfully compiled and downloaded!');
        setSuccessMsgSeverity('success');
      }
      setExportDialogOpen(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setSuccessMsg('Failed to export your data. Please try again.');
      setSuccessMsgSeverity('error');
      setTimeout(() => setSuccessMsg(''), 5000);
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
    } catch (err) {
      console.error(err);
      setSuccessMsg('Failed to delete account. Please try again.');
      setSuccessMsgSeverity('error');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleAgeChange = async (age) => {
    setIsLoading(true);
    setSuccessMsg('');
    const newAge = selectedAge === age ? 'Not Specified' : age;
    try {
      await updateProfile(newAge, activeTheme, selectedStreak);
      setSuccessMsg('Age group updated successfully!');
      setSuccessMsgSeverity('success');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setSuccessMsg(err.message || 'Failed to update age group.');
      setSuccessMsgSeverity('error');
      setTimeout(() => setSuccessMsg(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStreakChange = async (streak) => {
    setIsLoading(true);
    setSuccessMsg('');
    const newStreak = selectedStreak === streak ? '' : streak;
    try {
      await updateProfile(selectedAge, activeTheme, newStreak);
      setSuccessMsg('Streak calculation mode updated successfully!');
      setSuccessMsgSeverity('success');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setSuccessMsg(err.message || 'Failed to update streak calculation mode.');
      setSuccessMsgSeverity('error');
      setTimeout(() => setSuccessMsg(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAccount = async () => {
    setSaveAccountLoading(true);
    setSuccessMsg('');
    try {
      await updateAccount(tempName, tempEmail, tempPicture);
      setSuccessMsg('Account details updated successfully!');
      setSuccessMsgSeverity('success');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setSuccessMsg(err.message || 'Failed to update account details.');
      setSuccessMsgSeverity('error');
      setTimeout(() => setSuccessMsg(''), 5000);
    } finally {
      setSaveAccountLoading(false);
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Limit maximum dimensions to 800px to ensure base64 size is small
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          if (width > MAX_WIDTH || height > MAX_HEIGHT) {
            if (width > height) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            } else {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to JPEG format with 70% quality compression
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        try {
          const compressedBase64 = await compressImage(file);
          setTempPicture(compressedBase64);
        } catch (err) {
          console.error('Image compression failed:', err);
          setSuccessMsg('Failed to process and compress the image.');
          setSuccessMsgSeverity('error');
          setTimeout(() => setSuccessMsg(''), 5000);
        }
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setTempPicture(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleThemeChange = async (themeName) => {
    try {
      await setTheme(themeName);
      setSuccessMsg(`Theme changed to ${themeName}!`);
      setSuccessMsgSeverity('success');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setSuccessMsg(err.message || 'Failed to update theme.');
      setSuccessMsgSeverity('error');
      setTimeout(() => setSuccessMsg(''), 5000);
    }
  };

  return (
    <Box className="space-y-6">
      {/* Title */}
      <Box>
        <Typography variant="h4" className="font-serif font-bold text-themeText">
          Settings
        </Typography>
        <Typography variant="body2" className="text-themeTextSecondary mt-1">
          Customize your experience, profile details, and style theme.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Account Settings Card */}
        <Grid item xs={12} md={6}>
          <Card className="shadow-sm bg-themePaper border border-themeBorder text-themeText">
            <CardContent className="p-6">
              <Box className="flex items-center gap-2 mb-6">
                <PersonIcon className="text-orange-500" />
                <Typography variant="h6" className="font-semibold text-themeText">
                  Account Settings
                </Typography>
              </Box>


              <Box className="space-y-4">
                <TextField
                  label="Full Name"
                  fullWidth
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  variant="outlined"
                  InputLabelProps={{ className: 'text-themeTextSecondary' }}
                  inputProps={{ className: 'text-themeText' }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'var(--color-border)' },
                      '&:hover fieldset': { borderColor: '#f97316' },
                      '&.Mui-focused fieldset': { borderColor: '#f97316' },
                    }
                  }}
                />

                <TextField
                  label="Email Address"
                  fullWidth
                  value={tempEmail}
                  onChange={(e) => setTempEmail(e.target.value)}
                  variant="outlined"
                  InputLabelProps={{ className: 'text-themeTextSecondary' }}
                  inputProps={{ className: 'text-themeText' }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'var(--color-border)' },
                      '&:hover fieldset': { borderColor: '#f97316' },
                      '&.Mui-focused fieldset': { borderColor: '#f97316' },
                    }
                  }}
                />

                <Box className="pt-2">
                  <Typography variant="subtitle2" className="font-medium text-themeTextSecondary mb-2">
                    Profile Picture:
                  </Typography>
                  <Box className="flex items-center gap-4 mb-4">
                    <Avatar 
                      src={tempPicture || '/avatars/avatar_1.png'} 
                      alt={tempName} 
                      imgProps={{
                        onError: (e) => {
                          e.target.src = '/avatars/avatar_1.png';
                        }
                      }}
                      sx={{ width: 64, height: 64 }} 
                      className="border border-themeBorder"
                    >
                      {tempName ? tempName.charAt(0).toUpperCase() : 'U'}
                    </Avatar>
                    <Box className="flex flex-col gap-2">
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<UploadIcon />}
                        className="rounded-xl border-orange-500/50 text-orange-500 hover:bg-orange-500/10 text-xs py-1.5 px-3 normal-case font-semibold"
                      >
                        Upload Picture
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </Button>

                    </Box>
                  </Box>

                  <TextField
                    label="Profile Image URL"
                    fullWidth
                    value={tempPicture && !tempPicture.startsWith('data:') ? tempPicture : ''}
                    onChange={(e) => setTempPicture(e.target.value)}
                    placeholder="Or paste an image URL..."
                    variant="outlined"
                    size="small"
                    InputLabelProps={{ className: 'text-themeTextSecondary' }}
                    inputProps={{ className: 'text-themeText' }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: 'var(--color-border)' },
                        '&:hover fieldset': { borderColor: '#f97316' },
                        '&.Mui-focused fieldset': { borderColor: '#f97316' },
                      }
                    }}
                  />

                  <Box className="mt-4">
                    <Typography variant="caption" className="text-[11px] font-semibold text-themeTextSecondary block mb-2">
                      Preset Avatars:
                    </Typography>
                    <Box className="flex gap-2 flex-wrap">
                      {PRESET_AVATARS.map((avatarUrl, idx) => (
                        <Avatar
                          key={idx}
                          src={avatarUrl}
                          onClick={() => setTempPicture(avatarUrl)}
                          sx={{ 
                            width: 38, 
                            height: 38, 
                            cursor: 'pointer', 
                            border: tempPicture === avatarUrl ? '2px solid #f97316' : '1px solid rgba(0,0,0,0.1)',
                            '&:hover': { transform: 'scale(1.08)' },
                            transition: 'all 0.2s'
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Button
                variant="contained"
                onClick={handleSaveAccount}
                disabled={
                  saveAccountLoading || 
                  (tempName === (user?.name || '') && 
                   tempEmail === (user?.email || '') && 
                   tempPicture === (user?.picture || ''))
                }
                className="mt-6 bg-orange-500 hover:bg-orange-600 rounded-xl text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saveAccountLoading ? <CircularProgress size={24} color="inherit" /> : 'Save Account Details'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Card */}
        <Grid item xs={12} md={6}>
          <Card className="shadow-sm bg-themePaper border border-themeBorder text-themeText">
            <CardContent className="p-6">
              <Box className="flex items-center gap-2 mb-6">
                <PersonIcon className="text-orange-500" />
                <Typography variant="h6" className="font-semibold text-themeText">
                  Personal Profile
                </Typography>
              </Box>



              <Box className="space-y-4">
                <Typography variant="subtitle2" className="font-medium text-themeTextSecondary">
                  Update Age Group:
                </Typography>
                <Grid container spacing={1.5}>
                  {ageGroups.map((age) => {
                    const isSelected = selectedAge === age;
                    return (
                      <Grid item xs={6} sm={4} key={age}>
                        <Paper
                          onClick={() => handleAgeChange(age)}
                          elevation={0}
                          className={`p-2.5 text-center cursor-pointer border rounded-xl transition-all ${
                            isSelected
                              ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                              : 'bg-themePaper hover:bg-orange-500/10 text-themeText border-themeBorder'
                          }`}
                        >
                          <Typography variant="body2" className="text-xs font-semibold">
                            {age}
                          </Typography>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>

              <Divider className="opacity-15 my-4" />

              <Box className="space-y-4">
                <Typography variant="subtitle2" className="font-medium text-themeTextSecondary">
                  Streak Calculation Mode:
                </Typography>
                <Grid container spacing={1.5}>
                  {[
                    { mode: 'Daily', desc: 'Consecutive days assessed' },
                    { mode: 'Weekly', desc: 'Consecutive calendar weeks' }
                  ].map((item) => {
                    const isSelected = selectedStreak === item.mode;
                    return (
                      <Grid item xs={6} key={item.mode}>
                        <Paper
                          onClick={() => handleStreakChange(item.mode)}
                          elevation={0}
                          className={`p-3 text-center cursor-pointer border rounded-xl transition-all ${
                            isSelected
                              ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                              : 'bg-themePaper hover:bg-orange-500/10 text-themeText border-themeBorder'
                          }`}
                        >
                          <Typography variant="body2" className="text-xs font-bold block">
                            {item.mode}
                          </Typography>
                          <Typography variant="caption" className={`text-[10px] block opacity-80 ${isSelected ? 'text-white' : 'text-themeTextSecondary'}`}>
                            {item.desc}
                          </Typography>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Theme Settings Card */}
        <Grid item xs={12} md={6}>
          <Card className="shadow-sm bg-themePaper border border-themeBorder text-themeText">
            <CardContent className="p-6">
              <Box className="flex items-center gap-2 mb-6">
                <PaletteIcon className="text-orange-500" />
                <Typography variant="h6" className="font-semibold text-themeText">
                  Aesthetic Theme
                </Typography>
              </Box>

              <Box className="space-y-3">
                {themes.map((t) => {
                  const isSelected = activeTheme === t.name;
                  return (
                    <Paper
                      key={t.name}
                      onClick={() => handleThemeChange(t.name)}
                      elevation={0}
                      className={`p-4 cursor-pointer border rounded-2xl transition-all duration-300 flex items-center justify-between hover:scale-[1.01] ${
                        isSelected
                          ? 'border-orange-500 bg-orange-500/5 dark:bg-orange-500/10'
                          : 'border-themeBorder bg-themePaper hover:bg-orange-500/10 text-themeText'
                      }`}
                    >
                      <Box className="flex items-center gap-3">
                        {/* Custom visual color dots */}
                        <Box className="flex gap-1">
                          {t.colors.map((c, i) => (
                            <Box
                              key={i}
                              className="w-4 h-4 rounded-full border border-slate-200/50"
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" className="font-bold text-sm text-themeText">
                            {t.name}
                          </Typography>
                          <Typography variant="caption" className="text-themeTextSecondary opacity-80">
                            {t.desc}
                          </Typography>
                        </Box>
                      </Box>
                      {isSelected && <CheckIcon className="text-orange-500" />}
                    </Paper>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Privacy & Account Management Card */}
        <Grid item xs={12} md={6}>
          <Card className="shadow-sm bg-themePaper border border-themeBorder text-themeText">
            <CardContent className="p-6">
              <Box className="flex items-center gap-2 mb-4">
                <ShieldIcon className="text-orange-500" />
                <Typography variant="h6" className="font-semibold text-themeText">
                  Privacy & Data Management
                </Typography>
              </Box>

              <Typography variant="body2" className="text-themeTextSecondary mb-6 max-w-2xl leading-relaxed">
                Manage your data privacy and control your account. We prioritize security and guarantee that your personal assessment history and notes are kept private and never used commercially.
              </Typography>

              <Box className="space-y-4">
                {/* Review Privacy Policy Row */}
                <Paper className="p-5 border border-themeBorder bg-themePaper/50 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <Box className="space-y-1 max-w-xl">
                    <Typography variant="subtitle2" className="font-bold text-sm text-themeText">
                      Review Privacy Policy
                    </Typography>
                    <Typography variant="caption" className="text-themeTextSecondary block leading-relaxed">
                      Read details about our commitment to not sharing, selling, or using your data for commercial reasons.
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    onClick={() => setPrivacyOpen(true)}
                    sx={{ minWidth: '160px' }}
                    className="rounded-xl border-orange-500/50 text-orange-500 hover:bg-orange-500/10 text-xs py-2 normal-case font-semibold"
                  >
                    Read Policy
                  </Button>
                </Paper>

                {/* Export Progress Data Row */}
                <Paper className="p-5 border border-themeBorder bg-themePaper/50 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <Box className="space-y-1 max-w-xl">
                    <Typography variant="subtitle2" className="font-bold text-sm text-themeText">
                      Export Progress Data
                    </Typography>
                    <Typography variant="caption" className="text-themeTextSecondary block leading-relaxed">
                      Download your progress report as a PDF document or export assessment and journal logs to a spreadsheet.
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    onClick={() => setExportDialogOpen(true)}
                    disabled={exporting}
                    startIcon={exporting ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
                    sx={{ minWidth: '160px' }}
                    className="rounded-xl border-orange-500/50 text-orange-500 hover:bg-orange-500/10 text-xs py-2 normal-case font-semibold"
                  >
                    {exporting ? 'Exporting...' : 'Export Data'}
                  </Button>
                </Paper>

                {/* Delete Account Row */}
                <Paper className="p-5 border border-red-500/20 bg-red-500/5 dark:bg-red-500/10 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <Box className="space-y-1 max-w-xl">
                    <Typography variant="subtitle2" className="font-bold text-sm text-red-500 dark:text-red-400">
                      Delete Account
                    </Typography>
                    <Typography variant="caption" className="text-themeTextSecondary block leading-relaxed">
                      Permanently delete your profile and erase all assessments and reflective notes from our servers. Irreversible.
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    onClick={() => setDeleteDialogOpen(true)}
                    startIcon={<DeleteIcon />}
                    sx={{ minWidth: '160px' }}
                    className="rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs py-2 normal-case font-semibold shadow-none hover:shadow-none"
                  >
                    Delete Account
                  </Button>
                </Paper>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Privacy Policy Dialog */}
      <PrivacyPolicyDialog open={privacyOpen} onClose={() => setPrivacyOpen(false)} />

      {/* Export Data Dialog */}
      <ExportDataDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        onExport={handleExportData}
        exporting={exporting}
      />

      {/* Delete Account Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            bgcolor: 'background.paper',
            color: 'var(--color-text, #0f172a)',
            backgroundImage: 'none',
            border: '1px solid var(--color-border, rgba(0, 0, 0, 0.08))',
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1, color: '#ef4444' }}>
          Delete Your Account Permanently?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'var(--color-text-secondary, text.secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
            Are you absolutely sure you want to delete your account? This will permanently erase your profile, settings, character ratings, assessment logs, and reflective notes from the database. <strong>This action is immediate and cannot be undone.</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
            variant="outlined"
            sx={{
              borderRadius: '10px',
              borderColor: 'var(--color-border, rgba(0, 0, 0, 0.12))',
              color: 'var(--color-text-secondary, text.secondary)',
              textTransform: 'none',
              px: 3,
              '&:hover': {
                borderColor: 'var(--color-text, text.primary)',
                bgcolor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAccount}
            disabled={deleting}
            variant="contained"
            color="error"
            sx={{
              borderRadius: '10px',
              bgcolor: '#ef4444',
              color: '#ffffff',
              textTransform: 'none',
              boxShadow: 'none',
              px: 3,
              '&:hover': {
                bgcolor: '#dc2626',
                boxShadow: 'none'
              }
            }}
          >
            {deleting ? 'Deleting...' : 'Yes, Delete Account'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating success feedback message */}
      <Snackbar
        open={Boolean(successMsg)}
        autoHideDuration={4000}
        onClose={() => setSuccessMsg('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSuccessMsg('')} 
          severity={successMsgSeverity} 
          variant="filled"
          sx={{ 
            width: '100%', 
            borderRadius: '16px', 
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
            bgcolor: successMsgSeverity === 'error' ? 'error.main' : 'success.main',
            color: '#ffffff',
            fontWeight: 600,
            '& .MuiAlert-icon': {
              color: '#ffffff'
            }
          }}
        >
          {successMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
