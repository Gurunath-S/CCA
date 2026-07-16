import React, { useEffect, useState } from 'react';
import { useCharacterStore } from '../store/useCharacterStore';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  IconButton,
  CircularProgress,
  Divider,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListSubheader,
  FormControl,
  Select,
  MenuItem
} from '@mui/material';
import {
  NoteAdd as NoteIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CancelIcon,
  Book as JournalIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';

const PersonalNotes = () => {
  const { characters, fetchCharacters, notes, fetchNotes, upsertNote, deleteNote, isLoading } = useCharacterStore();
  const [selectedCharId, setSelectedCharId] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [noteToDelete, setNoteToDelete] = useState(null);

  // Filters & Search for sidebar and history
  const [charSearch, setCharSearch] = useState('');
  const [charCategory, setCharCategory] = useState('All');
  const [noteSearch, setNoteSearch] = useState('');

  const filteredSidebarChars = characters.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(charSearch.toLowerCase());
    const matchesCategory = charCategory === 'All' || c.category === charCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredNotes = notes.filter((note) => {
    return note.content.toLowerCase().includes(noteSearch.toLowerCase());
  });

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  // Set initial selected character once characters load
  useEffect(() => {
    if (characters.length > 0 && !selectedCharId) {
      setSelectedCharId(characters[0].id);
    }
  }, [characters, selectedCharId]);

  // Fetch notes when selected character changes
  useEffect(() => {
    if (selectedCharId) {
      fetchNotes(selectedCharId);
    }
  }, [selectedCharId, fetchNotes]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteContent.trim() || !selectedCharId) return;

    try {
      await upsertNote({
        characterId: selectedCharId,
        content: newNoteContent.trim()
      });
      setNewNoteContent('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEdit = async (noteId) => {
    if (!editingContent.trim()) return;

    try {
      await upsertNote({
        noteId,
        characterId: selectedCharId,
        content: editingContent.trim()
      });
      setEditingNoteId(null);
      setEditingContent('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!noteToDelete) return;
    try {
      await deleteNote(noteToDelete.id, selectedCharId);
      setNoteToDelete(null);
    } catch (err) {
      console.error(err);
    }
  };

  const getSelectedCharName = () => {
    const char = characters.find(c => c.id === selectedCharId);
    return char ? char.name : '';
  };

  return (
    <Box className="space-y-6">
      {/* Header */}
      <Box>
        <Typography variant="h4" className="font-serif font-bold text-slate-800 dark:text-slate-100">
          Reflective Journal
        </Typography>
        <Typography variant="body2" className="text-slate-500 dark:text-slate-400 mt-1">
          Maintain private logs, reminders, and thoughts for each character attribute.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Sidebar: Character Selector */}
        <Grid item xs={12} md={4}>
          <Card className="h-[calc(100vh-230px)] flex flex-col">
            <ListSubheader className="bg-transparent font-bold py-3 text-slate-700 dark:text-slate-350 border-b border-slate-150 dark:border-slate-800">
              Select Character Trait
            </ListSubheader>

            {/* Search & Category Filter for Sidebar */}
            <Box className="p-3 space-y-2 border-b border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
              <TextField
                fullWidth
                size="small"
                placeholder="Search traits..."
                value={charSearch}
                onChange={(e) => setCharSearch(e.target.value)}
                slotProps={{
                  input: {
                    className: 'rounded-xl text-xs bg-white dark:bg-slate-800',
                    startAdornment: <SearchIcon className="text-slate-400 mr-1.5" sx={{ fontSize: 16 }} />
                  }
                }}
              />
              <FormControl size="small" fullWidth>
                <Select
                  value={charCategory}
                  onChange={(e) => setCharCategory(e.target.value)}
                  className="rounded-xl text-xs bg-white dark:bg-slate-800"
                >
                  <MenuItem value="All" className="text-xs">All Categories</MenuItem>
                  <MenuItem value="Yama" className="text-xs">Yama</MenuItem>
                  <MenuItem value="Niyama" className="text-xs">Niyama</MenuItem>
                  <MenuItem value="General" className="text-xs">General</MenuItem>
                  <MenuItem value="Custom" className="text-xs">Custom</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box className="flex-grow overflow-y-auto">
              {isLoading && characters.length === 0 ? (
                <List disablePadding>
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <ListItem key={idx} className="py-3 px-4 border-b border-slate-100 dark:border-slate-800">
                      <ListItemText
                        primary={<Skeleton variant="text" width="60%" height={20} />}
                        secondary={<Skeleton variant="text" width="40%" height={15} />}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : filteredSidebarChars.length === 0 ? (
                <Box className="p-4 text-center text-slate-400 dark:text-slate-500 text-xs">
                  No traits found.
                </Box>
              ) : (
                <List disablePadding>
                  {filteredSidebarChars.map((c) => {
                    const isSelected = selectedCharId === c.id;
                    return (
                      <ListItem key={c.id} disablePadding>
                        <ListItemButton
                          selected={isSelected}
                          onClick={() => {
                            setSelectedCharId(c.id);
                            setEditingNoteId(null);
                          }}
                          className={`py-3 transition-colors border-l-4 ${
                            isSelected
                              ? 'bg-orange-500/5 text-orange-600 dark:text-orange-400 border-orange-500 font-semibold'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-850 border-transparent text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <ListItemText
                            primary={c.name.split(' (')[0]}
                            secondary={c.category}
                            primaryTypographyProps={{ className: 'text-sm font-semibold truncate' }}
                            secondaryTypographyProps={{ className: 'text-xs text-slate-400' }}
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </Box>
          </Card>
        </Grid>

        {/* Main Notes List */}
        <Grid item xs={12} md={8}>
          <Box className="space-y-4 h-[calc(100vh-230px)] flex flex-col justify-between">
            {/* Quick Add Note Box */}
            <Card className="flex-shrink-0">
              <CardContent className="p-4">
                <Typography variant="subtitle2" className="font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  New reflection for: <span className="text-orange-550 font-bold">{getSelectedCharName()}</span>
                </Typography>
                <form onSubmit={handleAddNote} className="flex gap-2">
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder="Capture a thought, experience, or note to yourself..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    className="bg-white dark:bg-slate-850 rounded-xl"
                    slotProps={{
                      input: { className: 'rounded-xl' }
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={!newNoteContent.trim()}
                    startIcon={<NoteIcon />}
                    className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-4"
                  >
                    Add
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Notes List Panel */}
            <Card className="flex-grow overflow-y-auto">
              <CardContent className="p-6">
                <Box className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-100 dark:border-slate-850 pb-3">
                  <Typography variant="h6" className="font-semibold">
                    Reflection History
                  </Typography>

                  {/* Search reflections */}
                  {notes.length > 0 && (
                    <TextField
                      size="small"
                      placeholder="Search reflections..."
                      value={noteSearch}
                      onChange={(e) => setNoteSearch(e.target.value)}
                      className="min-w-[200px]"
                      slotProps={{
                        input: {
                          className: 'rounded-xl text-xs bg-slate-50/50 dark:bg-slate-800/30',
                          startAdornment: <SearchIcon className="text-slate-400 mr-1.5" sx={{ fontSize: 16 }} />
                        }
                      }}
                    />
                  )}
                </Box>

                {isLoading && notes.length === 0 ? (
                  <Box className="space-y-4">
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <Paper key={idx} className="p-5 border border-slate-100 dark:border-slate-800 rounded-2xl bg-white/40 dark:bg-slate-900/40">
                        <Box className="flex justify-between items-center mb-3">
                          <Skeleton variant="text" width="25%" height={20} />
                          <Box className="flex gap-2">
                            <Skeleton variant="circular" width={24} height={24} />
                            <Skeleton variant="circular" width={24} height={24} />
                          </Box>
                        </Box>
                        <Skeleton variant="text" width="90%" height={20} />
                        <Skeleton variant="text" width="60%" height={20} />
                      </Paper>
                    ))}
                  </Box>
                ) : notes.length === 0 ? (
                  <Box className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <JournalIcon className="text-slate-300 dark:text-slate-700 text-5xl mb-2" />
                    <Typography variant="body2">No reflections recorded for this character yet.</Typography>
                    <Typography variant="caption" className="text-slate-400 mt-1">Write your first note above.</Typography>
                  </Box>
                ) : filteredNotes.length === 0 ? (
                  <Box className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <Typography variant="body2">No matching reflections found.</Typography>
                  </Box>
                ) : (
                  <Box className="space-y-4">
                    <AnimatePresence>
                      {filteredNotes.map((note) => {
                        const isEditing = editingNoteId === note.id;
                        return (
                          <motion.div
                            key={note.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.25 }}
                          >
                            <Paper
                              elevation={0}
                              className="p-4 border border-slate-150 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 rounded-2xl flex flex-col justify-between gap-3 hover:shadow-sm transition-shadow"
                            >
                              {isEditing ? (
                                <Box className="space-y-2">
                                  <TextField
                                    fullWidth
                                    multiline
                                    rows={2}
                                    value={editingContent}
                                    onChange={(e) => setEditingContent(e.target.value)}
                                    className="bg-white dark:bg-slate-800 rounded-xl"
                                    slotProps={{
                                      input: { className: 'rounded-xl' }
                                    }}
                                  />
                                  <Box className="flex gap-2 justify-end">
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      onClick={() => handleSaveEdit(note.id)}
                                      disabled={!editingContent.trim()}
                                    >
                                      <SaveIcon />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      color="inherit"
                                      onClick={() => setEditingNoteId(null)}
                                    >
                                      <CancelIcon />
                                    </IconButton>
                                  </Box>
                                </Box>
                              ) : (
                                <Box className="flex justify-between items-start gap-4">
                                  <Box className="space-y-1">
                                    <Typography variant="caption" className="text-slate-400 block font-medium">
                                      {dayjs(note.createdAt).format('MMMM DD, YYYY • h:mm A')}
                                    </Typography>
                                    <Typography variant="body2" className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed text-sm">
                                      {note.content}
                                    </Typography>
                                  </Box>

                                  <Box className="flex flex-shrink-0">
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        setEditingNoteId(note.id);
                                        setEditingContent(note.content);
                                      }}
                                      className="text-slate-400 hover:text-blue-500"
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      onClick={() => setNoteToDelete(note)}
                                      className="text-slate-400 hover:text-red-500"
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                </Box>
                              )}
                            </Paper>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!noteToDelete}
        onClose={() => setNoteToDelete(null)}
        container={() => document.getElementById('root')}
      >
        <DialogTitle className="font-serif font-bold">Delete Reflection Note?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" className="text-slate-500">
            Are you sure you want to permanently delete this self-reflection note? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions className="p-4">
          <Button onClick={() => setNoteToDelete(null)} className="rounded-xl text-slate-500">
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error" className="rounded-xl">
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PersonalNotes;
