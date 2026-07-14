import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacterStore } from '../store/useCharacterStore';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Chip,
  Button,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Fab
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Spa as SpaIcon,
  Timeline as ChartIcon,
  CheckCircleOutline as CheckIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const CharacterListing = () => {
  const { characters, fetchCharacters, createCustomCharacter, isLoading } = useCharacterStore();
  const navigate = useNavigate();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Custom Character Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customCategory, setCustomCategory] = useState('Custom');
  const [dialogError, setDialogError] = useState('');
  const [isSavingCustom, setIsSavingCustom] = useState(false);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  // Handle custom character creation
  const handleCreateCustom = async () => {
    setDialogError('');
    if (!customName.trim()) {
      setDialogError('Character name is required');
      return;
    }
    
    setIsSavingCustom(true);
    try {
      await createCustomCharacter({
        name: customName.trim(),
        description: customDesc.trim(),
        category: customCategory
      });
      setOpenDialog(false);
      setCustomName('');
      setCustomDesc('');
    } catch (err) {
      setDialogError(err.message || 'Failed to create character');
    } finally {
      setIsSavingCustom(false);
    }
  };

  // Filter & Search characters list
  const filteredCharacters = characters.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Yama', 'Niyama', 'General', 'Custom'];

  // Helper to color codes for tags
  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Yama': return 'primary';
      case 'Niyama': return 'secondary';
      case 'Custom': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box className="space-y-6">
      {/* Page Header */}
      <Box className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Box>
          <Typography variant="h4" className="font-serif font-bold text-slate-800 dark:text-slate-100">
            Character Attributes
          </Typography>
          <Typography variant="body2" className="text-slate-500 dark:text-slate-400 mt-1">
            Focus on individual virtues. Submissions change the priority listing automatically.
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() => setOpenDialog(true)}
          startIcon={<AddIcon />}
          className="bg-orange-500 hover:bg-orange-600 rounded-xl"
        >
          Add Custom Attribute
        </Button>
      </Box>

      {/* Search & Filter bar */}
      <Card className="shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <TextField
            variant="outlined"
            placeholder="Search attributes..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:max-w-md bg-white/50 dark:bg-slate-800/30 rounded-xl"
            slotProps={{
              input: {
                className: 'rounded-xl',
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon className="text-slate-400" />
                  </InputAdornment>
                )
              }
            }}
          />

          <Box className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
            {categories.map((cat) => (
              <Chip
                key={cat}
                label={cat}
                clickable
                onClick={() => setCategoryFilter(cat)}
                variant={categoryFilter === cat ? 'filled' : 'outlined'}
                color={categoryFilter === cat ? 'primary' : 'default'}
                className="rounded-full font-medium"
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Attributes Grid */}
      {isLoading && characters.length === 0 ? (
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Card className="p-6 space-y-4">
                <Skeleton variant="text" width="60%" height={30} />
                <Skeleton variant="rectangular" height={15} className="rounded-full" />
                <Skeleton variant="text" width="90%" height={20} />
                <Box className="flex gap-2">
                  <Skeleton variant="rectangular" width={60} height={25} className="rounded-full" />
                  <Skeleton variant="rectangular" width={60} height={25} className="rounded-full" />
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : filteredCharacters.length === 0 ? (
        <Paper className="p-12 text-center bg-white/40 dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-800">
          <SpaIcon className="text-slate-350 dark:text-slate-650 text-5xl mb-3" />
          <Typography variant="h6" className="font-semibold text-slate-500">
            No attributes found
          </Typography>
          <Typography variant="body2" className="text-slate-400 mt-1">
            Try adjusting your search query or add a custom attribute.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          <AnimatePresence>
            {filteredCharacters.map((c, index) => {
              // Convert 1-5 score to 0-100% progress
              const progressPercentage = c.latestScore ? (c.latestScore / 5) * 100 : 0;
              return (
                <Grid item xs={12} sm={6} md={4} key={c.id}>
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.5) }}
                    className="h-full"
                  >
                    <Card className="h-full flex flex-col justify-between hover:scale-[1.015] hover:shadow-md transition-all duration-300">
                      <CardContent className="p-6 flex flex-col justify-between h-full">
                        <Box>
                          <Box className="flex justify-between items-start mb-3">
                            <Chip
                              label={c.category}
                              size="small"
                              color={getCategoryColor(c.category)}
                              className="rounded-full text-xs font-semibold"
                            />
                            {c.submissionCount > 0 && (
                              <Chip
                                label={`${c.submissionCount} submissions`}
                                size="small"
                                variant="outlined"
                                className="rounded-full text-xs"
                              />
                            )}
                          </Box>

                          <Typography variant="h6" className="font-serif font-bold leading-tight mb-2">
                            {c.name}
                          </Typography>

                          {c.description && (
                            <Typography variant="body2" className="text-slate-500 dark:text-slate-400 line-clamp-3 mb-4 text-sm">
                              {c.description}
                            </Typography>
                          )}
                        </Box>

                        <Box className="mt-4 space-y-4">
                          {/* Progress bar */}
                          <Box>
                            <Box className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                              <span>Alignment score</span>
                              <span>{c.latestScore ? `${c.latestScore} / 5` : 'No score'}</span>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={progressPercentage}
                              color={c.latestScore >= 4 ? 'success' : c.latestScore >= 3 ? 'primary' : 'warning'}
                              className="rounded-full h-1.5"
                            />
                          </Box>

                          <Box className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <Button
                              fullWidth
                              variant="contained"
                              size="small"
                              onClick={() => navigate(`/assess/${c.id}`)}
                              className="bg-orange-500 hover:bg-orange-600 rounded-lg text-xs"
                            >
                              Assess
                            </Button>
                            
                            <Button
                              fullWidth
                              variant="outlined"
                              size="small"
                              disabled={c.submissionCount === 0}
                              onClick={() => navigate(`/aggregate/${c.id}`)}
                              startIcon={<ChartIcon sx={{ width: 14, height: 14 }} />}
                              className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 rounded-lg text-xs"
                            >
                              Stats
                            </Button>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              );
            })}
          </AnimatePresence>
        </Grid>
      )}

      {/* Create Custom Attribute Modal */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle className="font-serif font-bold">Add Custom Character Attribute</DialogTitle>
        <DialogContent className="space-y-4 pt-2">
          {dialogError && (
            <Alert severity="error" className="rounded-xl">
              {dialogError}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Attribute Name"
            placeholder="e.g. Forgiveness (Kshama), Generosity..."
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            margin="dense"
            required
            slotProps={{
              input: { className: 'rounded-xl' }
            }}
          />

          <TextField
            fullWidth
            label="Description"
            placeholder="Describe what practicing this attribute means to you..."
            value={customDesc}
            onChange={(e) => setCustomDesc(e.target.value)}
            multiline
            rows={3}
            margin="dense"
            slotProps={{
              input: { className: 'rounded-xl' }
            }}
          />

          <FormControl fullWidth margin="dense">
            <InputLabel>Category</InputLabel>
            <Select
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              label="Category"
              slotProps={{
                input: { className: 'rounded-xl' }
              }}
            >
              <MenuItem value="Custom">Custom</MenuItem>
              <MenuItem value="Yama">Yama (Restraint)</MenuItem>
              <MenuItem value="Niyama">Niyama (Observance)</MenuItem>
              <MenuItem value="General">General Attribute</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions className="p-4">
          <Button onClick={() => setOpenDialog(false)} className="rounded-xl text-slate-500">
            Cancel
          </Button>
          <Button
            onClick={handleCreateCustom}
            variant="contained"
            disabled={isSavingCustom || !customName.trim()}
            className="bg-orange-500 hover:bg-orange-600 rounded-xl"
          >
            {isSavingCustom ? 'Creating...' : 'Create Attribute'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CharacterListing;
