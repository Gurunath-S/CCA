import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Paper
} from '@mui/material';
import { Spa as SpaIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';

const ageGroups = [
  '15–20',
  '20–25',
  '25–30',
  '30–40',
  '40–50',
  '50–60',
  'Above 60'
];

const UserProfileSetup = () => {
  const { user, updateProfile } = useAuthStore();
  const [selectedAge, setSelectedAge] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAgeSelect = (age) => {
    setSelectedAge(age);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProfile(selectedAge || 'Not Specified', user?.profile?.theme || 'Classic');
      navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      await updateProfile('Not Specified', user?.profile?.theme || 'Classic');
      navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="min-h-screen flex flex-col justify-center items-center bg-themeBg text-themeText p-6 theme-transition">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="shadow-2xl bg-themePaper backdrop-blur-md border border-themeBorder rounded-3xl text-themeText">
          <CardContent className="p-8 sm:p-10">
            <Box className="flex flex-col items-center mb-6">
              <SpaIcon className="text-orange-500 text-5xl mb-3" />
              <Typography variant="h4" align="center" className="font-serif font-bold text-themeText">
                Welcome, {user?.name}!
              </Typography>
              <Typography variant="body2" align="center" className="text-themeTextSecondary mt-2">
                Let's tailor your Character Coaching experience. This helps us offer aggregate analysis across groups.
              </Typography>
            </Box>

            <Box className="my-8">
              <Typography variant="subtitle1" className="font-semibold text-themeTextSecondary mb-4 block">
                Please select your Age Group:
              </Typography>

              <Grid container spacing={2}>
                {ageGroups.map((age) => {
                  const isSelected = selectedAge === age;
                  return (
                    <Grid item xs={6} sm={4} key={age}>
                      <Paper
                        onClick={() => handleAgeSelect(age)}
                        elevation={0}
                        className={`p-3 text-center cursor-pointer transition-all duration-300 border rounded-2xl ${
                          isSelected
                            ? 'bg-orange-500 text-white border-orange-500 shadow-md transform -translate-y-0.5'
                            : 'bg-themePaper hover:bg-orange-500/10 text-themeText border-themeBorder'
                        }`}
                      >
                        <Typography variant="body2" className="font-medium">
                          {age}
                        </Typography>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>

            <Box className="flex flex-col sm:flex-row gap-3 mt-8">
              <Button
                fullWidth
                variant="contained"
                disabled={isLoading || !selectedAge}
                onClick={handleSave}
                endIcon={<ChevronRightIcon />}
                className="py-3 bg-gradient-to-r from-orange-500 to-yellow-600 hover:from-orange-600 hover:to-yellow-700 text-white rounded-xl font-medium"
              >
                Get Started
              </Button>
              
              <Button
                fullWidth
                variant="outlined"
                disabled={isLoading}
                onClick={handleSkip}
                className="py-3 border-themeBorder text-themeTextSecondary rounded-xl"
              >
                Skip For Now
              </Button>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default UserProfileSetup;
