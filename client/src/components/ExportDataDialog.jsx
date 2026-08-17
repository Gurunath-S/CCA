import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Radio,
  RadioGroup,
  CircularProgress,
  Paper,
  Grid,
  IconButton
} from '@mui/material';
import {
  PictureAsPdf as PictureAsPdfIcon,
  TableView as TableViewIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  LibraryBooks as LibraryBooksIcon,
  Assessment as AssessmentIcon,
  MenuBook as MenuBookIcon,
  CloudDownload as DownloadIcon,
  CalendarToday as CalendarTodayIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

export const ExportDataDialog = ({ open, onClose, onExport, exporting }) => {
  const [format, setFormat] = useState('pdf'); // 'pdf' | 'excel'
  const [content, setContent] = useState('all'); // 'all' | 'assessments' | 'notes'
  const [dateRange, setDateRange] = useState('all'); // 'all' | '7days' | '30days' | 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleExport = () => {
    onExport(format, content, {
      type: dateRange,
      startDate,
      endDate
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '32px',
          bgcolor: 'background.paper',
          color: 'var(--color-text, #0f172a)',
          backgroundImage: 'none',
          border: '1px solid var(--color-border, rgba(0, 0, 0, 0.08))',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }
      }}
    >
      {/* Title Header with Icon and Close Button */}
      <DialogTitle sx={{ m: 0, p: 4, pb: 1, position: 'relative' }}>
        <Box className="flex items-center gap-3.5">
          <Box sx={{ 
            p: 2.5, 
            bg: 'rgba(249, 115, 22, 0.1)', 
            bgcolor: 'rgba(249, 115, 22, 0.08)',
            color: '#f97316',
            borderRadius: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center'
          }}>
            <DownloadIcon fontSize="medium" />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: '"Playfair Display", serif', color: 'inherit' }}>
              Export Personal Data
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Select your preferred file format and the progress data you would like to retrieve.
            </Typography>
          </Box>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 20,
            top: 24,
            color: 'text.secondary',
            '&:hover': { color: '#f97316' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 4, py: 3, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Step 1: Format Selection */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.7rem', mb: 2, display: 'block' }}>
            1. Select Export Format
          </Typography>
          <Grid container spacing={2.5}>
            {/* PDF Format Option */}
            <Grid item xs={12} sm={6}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Paper
                  onClick={() => setFormat('pdf')}
                  elevation={0}
                  sx={{
                    p: 3,
                    border: '2px solid',
                    borderColor: format === 'pdf' ? '#f97316' : 'var(--color-border, rgba(0, 0, 0, 0.08))',
                    borderRadius: '24px',
                    cursor: 'pointer',
                    bgcolor: format === 'pdf' ? 'rgba(249, 115, 22, 0.03)' : 'var(--color-bg-paper, #ffffff)',
                    transition: 'all 0.2s ease-in-out',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    boxShadow: format === 'pdf' ? '0 10px 15px -3px rgba(249, 115, 22, 0.08)' : 'none',
                    '&:hover': {
                      borderColor: format === 'pdf' ? '#f97316' : 'rgba(249, 115, 22, 0.3)',
                      bgcolor: format === 'pdf' ? 'rgba(249, 115, 22, 0.05)' : 'rgba(0, 0, 0, 0.01)'
                    }
                  }}
                >
                  {format === 'pdf' && (
                    <CheckCircleIcon sx={{ color: '#f97316', position: 'absolute', top: 16, right: 16 }} fontSize="small" />
                  )}
                  <Box sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: '16px', 
                    bgcolor: 'rgba(239, 68, 68, 0.08)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#ef4444'
                  }}>
                    <PictureAsPdfIcon fontSize="medium" />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.95rem' }}>
                      PDF Document
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5, lineHeight: 1.3 }}>
                      Best for reading, printing, and sharing a summary.
                    </Typography>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>

            {/* Excel / CSV Format Option */}
            <Grid item xs={12} sm={6}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Paper
                  onClick={() => setFormat('excel')}
                  elevation={0}
                  sx={{
                    p: 3,
                    border: '2px solid',
                    borderColor: format === 'excel' ? '#f97316' : 'var(--color-border, rgba(0, 0, 0, 0.08))',
                    borderRadius: '24px',
                    cursor: 'pointer',
                    bgcolor: format === 'excel' ? 'rgba(249, 115, 22, 0.03)' : 'var(--color-bg-paper, #ffffff)',
                    transition: 'all 0.2s ease-in-out',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    boxShadow: format === 'excel' ? '0 10px 15px -3px rgba(249, 115, 22, 0.08)' : 'none',
                    '&:hover': {
                      borderColor: format === 'excel' ? '#f97316' : 'rgba(249, 115, 22, 0.3)',
                      bgcolor: format === 'excel' ? 'rgba(249, 115, 22, 0.05)' : 'rgba(0, 0, 0, 0.01)'
                    }
                  }}
                >
                  {format === 'excel' && (
                    <CheckCircleIcon sx={{ color: '#f97316', position: 'absolute', top: 16, right: 16 }} fontSize="small" />
                  )}
                  <Box sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: '16px', 
                    bgcolor: 'rgba(16, 185, 129, 0.08)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#10b981'
                  }}>
                    <TableViewIcon fontSize="medium" />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.95rem' }}>
                      Excel / CSV Sheet
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5, lineHeight: 1.3 }}>
                      Best for spreadsheet analysis and importing data.
                    </Typography>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </Box>

        {/* Step 2: Content Selection */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.7rem', mb: 2, display: 'block' }}>
            2. Choose Content to Include
          </Typography>
          <RadioGroup
            value={content}
            onChange={(e) => setContent(e.target.value)}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
          >
            {[
              {
                value: 'all',
                label: 'Everything (All Data)',
                desc: 'Includes profile summary, assessments, custom attributes, and reflective notes.',
                icon: <LibraryBooksIcon fontSize="small" />,
                bgColor: 'rgba(59, 130, 246, 0.08)',
                color: '#3b82f6'
              },
              {
                value: 'assessments',
                label: 'Assessments & Custom Attributes Only',
                desc: 'Includes only score history, effort levels, and custom trait descriptions.',
                icon: <AssessmentIcon fontSize="small" />,
                bgColor: 'rgba(249, 115, 22, 0.08)',
                color: '#f97316'
              },
              {
                value: 'notes',
                label: 'Reflective Journal Notes Only',
                desc: 'Includes only reflective journal entries and descriptions.',
                icon: <MenuBookIcon fontSize="small" />,
                bgColor: 'rgba(20, 184, 166, 0.08)',
                color: '#14b8a6'
              }
            ].map((item) => {
              const isSelected = content === item.value;
              return (
                <motion.div key={item.value} whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                  <Paper
                    onClick={() => setContent(item.value)}
                    elevation={0}
                    sx={{
                      p: 2,
                      border: '2px solid',
                      borderColor: isSelected ? '#f97316' : 'var(--color-border, rgba(0, 0, 0, 0.08))',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      bgcolor: isSelected ? 'rgba(249, 115, 22, 0.03)' : 'var(--color-bg-paper, #ffffff)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        borderColor: isSelected ? '#f97316' : 'rgba(249, 115, 22, 0.3)',
                        bgcolor: isSelected ? 'rgba(249, 115, 22, 0.05)' : 'rgba(0, 0, 0, 0.01)'
                      }
                    }}
                  >
                    <Radio
                      checked={isSelected}
                      value={item.value}
                      sx={{
                        p: 0,
                        color: 'var(--color-border)',
                        '&.Mui-checked': { color: '#f97316' }
                      }}
                    />
                    <Box sx={{ 
                      width: 36, 
                      height: 36, 
                      borderRadius: '10px', 
                      bgcolor: item.bgColor, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: item.color,
                      flexShrink: 0
                    }}>
                      {item.icon}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.875rem' }}>
                        {item.label}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.2, lineHeight: 1.3 }}>
                        {item.desc}
                      </Typography>
                    </Box>
                  </Paper>
                </motion.div>
              );
            })}
          </RadioGroup>
        </Box>

        {/* Step 3: Date Range Selection */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.7rem', mb: 2, display: 'block' }}>
            3. Select Date Range
          </Typography>
          <RadioGroup
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
          >
            {[
              {
                value: 'all',
                label: 'All Time',
                desc: 'Includes all historical entries since account creation.',
                icon: <CalendarTodayIcon fontSize="small" />,
                bgColor: 'rgba(59, 130, 246, 0.08)',
                color: '#3b82f6'
              },
              {
                value: '7days',
                label: 'Last 7 Days',
                desc: 'Export entries from the past week only.',
                icon: <DateRangeIcon fontSize="small" />,
                bgColor: 'rgba(20, 184, 166, 0.08)',
                color: '#14b8a6'
              },
              {
                value: '30days',
                label: 'Last 30 Days',
                desc: 'Export entries from the past 30 days only.',
                icon: <DateRangeIcon fontSize="small" />,
                bgColor: 'rgba(16, 185, 129, 0.08)',
                color: '#10b981'
              },
              {
                value: 'custom',
                label: 'Custom Date Range',
                desc: 'Specify a custom start and end date for filtering.',
                icon: <DateRangeIcon fontSize="small" />,
                bgColor: 'rgba(249, 115, 22, 0.08)',
                color: '#f97316'
              }
            ].map((item) => {
              const isSelected = dateRange === item.value;
              return (
                <motion.div key={item.value} whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                  <Paper
                    onClick={() => setDateRange(item.value)}
                    elevation={0}
                    sx={{
                      p: 2,
                      border: '2px solid',
                      borderColor: isSelected ? '#f97316' : 'var(--color-border, rgba(0, 0, 0, 0.08))',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      bgcolor: isSelected ? 'rgba(249, 115, 22, 0.03)' : 'var(--color-bg-paper, #ffffff)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        borderColor: isSelected ? '#f97316' : 'rgba(249, 115, 22, 0.3)',
                        bgcolor: isSelected ? 'rgba(249, 115, 22, 0.05)' : 'rgba(0, 0, 0, 0.01)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Radio
                        checked={isSelected}
                        value={item.value}
                        sx={{
                          p: 0,
                          color: 'var(--color-border)',
                          '&.Mui-checked': { color: '#f97316' }
                        }}
                      />
                      <Box sx={{ 
                        width: 36, 
                        height: 36, 
                        borderRadius: '10px', 
                        bgcolor: item.bgColor, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: item.color,
                        flexShrink: 0
                      }}>
                        {item.icon}
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.875rem' }}>
                          {item.label}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.2, lineHeight: 1.3 }}>
                          {item.desc}
                        </Typography>
                      </Box>
                    </Box>

                    {item.value === 'custom' && isSelected && (
                      <Box sx={{ pl: 7, pr: 2, pb: 1, display: 'flex', gap: 2, mt: 1, flexDirection: { xs: 'column', sm: 'row' } }} onClick={(e) => e.stopPropagation()}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5, display: 'block' }}>
                            Start Date
                          </Typography>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              borderRadius: '12px',
                              border: '1px solid var(--color-border, rgba(0, 0, 0, 0.15))',
                              backgroundColor: 'transparent',
                              color: 'inherit',
                              outline: 'none',
                              fontFamily: 'inherit',
                              fontSize: '0.875rem'
                            }}
                          />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5, display: 'block' }}>
                            End Date
                          </Typography>
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              borderRadius: '12px',
                              border: '1px solid var(--color-border, rgba(0, 0, 0, 0.15))',
                              backgroundColor: 'transparent',
                              color: 'inherit',
                              outline: 'none',
                              fontFamily: 'inherit',
                              fontSize: '0.875rem'
                            }}
                          />
                        </Box>
                      </Box>
                    )}
                  </Paper>
                </motion.div>
              );
            })}
          </RadioGroup>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 4, py: 4, gap: 2 }}>
        <Button
          onClick={onClose}
          sx={{
            borderRadius: '14px',
            border: '1.5px solid var(--color-border, rgba(0,0,0,0.12))',
            color: 'text.secondary',
            textTransform: 'none',
            px: 4,
            py: 1.2,
            fontWeight: 600,
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: 'text.primary',
              bgcolor: 'rgba(0, 0, 0, 0.04)',
              color: 'text.primary'
            }
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={exporting || (dateRange === 'custom' && (!startDate || !endDate || startDate > endDate))}
          onClick={handleExport}
          sx={{
            borderRadius: '14px',
            bgcolor: '#f97316',
            color: '#ffffff',
            boxShadow: 'none',
            textTransform: 'none',
            px: 4,
            py: 1.2,
            fontWeight: 700,
            minWidth: '130px',
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: '#ea580c',
              boxShadow: 'none'
            },
            '&.Mui-disabled': {
              bgcolor: 'rgba(249, 115, 22, 0.5)',
              color: 'rgba(255, 255, 255, 0.8)'
            }
          }}
        >
          {exporting ? <CircularProgress size={20} color="inherit" /> : 'Export Data'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
