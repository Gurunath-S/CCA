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
  CircularProgress
} from '@mui/material';
import {
  Palette as PaletteIcon,
  Person as PersonIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const themes = [
  { name: 'Serenity', desc: 'Calm light blue, minimal', colors: ['#2563eb', '#3b82f6', '#f8fafc'] },
  { name: 'Midnight Focus', desc: 'Sleek dark navy focus', colors: ['#60a5fa', '#1e293b', '#0f172a'] },
  { name: 'Nature', desc: 'Relaxing green balance', colors: ['#059669', '#10b981', '#f0fdf4'] },
  { name: 'Classic', desc: 'Gold, cream & warm brown', colors: ['#b45309', '#d97706', '#fffbeb'] },
  { name: 'Vivekananda', desc: 'Saffron energy & deep blue', colors: ['#f97316', '#1e3a8a', '#fffbeb'] },
];

const ageGroups = ['15–20', '20–25', '25–30', '30–40', '40–50', '50–60', 'Above 60'];

const Settings = () => {
  const { user, updateProfile, setTheme } = useAuthStore();
  const [selectedAge, setSelectedAge] = useState(user?.profile?.ageGroup || '');
  const [activeTheme, setActiveTheme] = useState(user?.profile?.theme || 'Classic');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    setSuccessMsg('');
    try {
      await updateProfile(selectedAge, activeTheme);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeChange = async (themeName) => {
    setActiveTheme(themeName);
    try {
      await setTheme(themeName);
      setSuccessMsg(`Theme changed to ${themeName}!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
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

      {successMsg && (
        <Alert severity="success" className="rounded-xl shadow-sm">
          {successMsg}
        </Alert>
      )}

      <Grid container spacing={4}>
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

              <Box className="flex items-center gap-4 mb-6">
                <Avatar src={user?.picture} alt={user?.name} sx={{ width: 64, height: 64 }} />
                <Box>
                  <Typography variant="h6" className="font-semibold text-sm text-themeText">
                    {user?.name}
                  </Typography>
                  <Typography variant="body2" className="text-themeTextSecondary">
                    {user?.email}
                  </Typography>
                </Box>
              </Box>

              <Divider className="opacity-15 my-4" />

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
                          onClick={() => setSelectedAge(age)}
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

              <Button
                variant="contained"
                onClick={handleSaveProfile}
                disabled={isLoading}
                className="mt-6 bg-orange-500 hover:bg-orange-600 rounded-xl text-white font-medium"
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Save Profile Details'}
              </Button>
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
      </Grid>
    </Box>
  );
};

export default Settings;
