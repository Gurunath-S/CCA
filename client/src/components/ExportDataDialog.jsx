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
  FormControlLabel,
  CircularProgress,
  Paper,
  Grid
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableViewIcon from '@mui/icons-material/TableView';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export const ExportDataDialog = ({ open, onClose, onExport, exporting }) => {
  const [format, setFormat] = useState('pdf'); // 'pdf' | 'excel'
  const [content, setContent] = useState('all'); // 'all' | 'assessments' | 'notes'

  const handleExport = () => {
    onExport(format, content);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        className: "bg-themePaper text-themeText border border-themeBorder rounded-2xl p-2"
      }}
    >
      <DialogTitle>
        <Typography variant="h6" className="font-bold text-themeText">
          Export Personal Data
        </Typography>
        <Typography variant="caption" className="text-themeTextSecondary block mt-0.5">
          Select your preferred file format and the progress data you would like to retrieve.
        </Typography>
      </DialogTitle>

      <DialogContent className="space-y-6 mt-2">
        {/* Step 1: Format Selection */}
        <Box className="space-y-2">
          <Typography variant="subtitle2" className="font-bold text-themeTextSecondary text-xs uppercase tracking-wider">
            1. Select Export Format
          </Typography>
          <Grid container spacing={2}>
            {/* PDF Format Option */}
            <Grid item xs={12} sm={6}>
              <Paper
                onClick={() => setFormat('pdf')}
                elevation={0}
                className={`p-4 border rounded-2xl cursor-pointer transition-all relative flex flex-col justify-between h-[110px] ${
                  format === 'pdf'
                    ? 'border-orange-500 bg-orange-500/5 dark:bg-orange-500/10'
                    : 'border-themeBorder bg-themePaper hover:bg-themeBorder/10'
                }`}
              >
                {format === 'pdf' && (
                  <CheckCircleIcon className="text-orange-500 absolute top-3 right-3" fontSize="small" />
                )}
                <PictureAsPdfIcon className="text-red-500 mb-2" fontSize="large" />
                <Box>
                  <Typography variant="subtitle2" className="font-bold text-themeText text-sm">
                    PDF Document
                  </Typography>
                  <Typography variant="caption" className="text-themeTextSecondary block text-[10px]">
                    Best for reading & printing
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Excel / CSV Format Option */}
            <Grid item xs={12} sm={6}>
              <Paper
                onClick={() => setFormat('excel')}
                elevation={0}
                className={`p-4 border rounded-2xl cursor-pointer transition-all relative flex flex-col justify-between h-[110px] ${
                  format === 'excel'
                    ? 'border-orange-500 bg-orange-500/5 dark:bg-orange-500/10'
                    : 'border-themeBorder bg-themePaper hover:bg-themeBorder/10'
                }`}
              >
                {format === 'excel' && (
                  <CheckCircleIcon className="text-orange-500 absolute top-3 right-3" fontSize="small" />
                )}
                <TableViewIcon className="text-green-500 mb-2" fontSize="large" />
                <Box>
                  <Typography variant="subtitle2" className="font-bold text-themeText text-sm">
                    Excel / CSV Sheet
                  </Typography>
                  <Typography variant="caption" className="text-themeTextSecondary block text-[10px]">
                    Best for spreadsheet analysis
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Step 2: Content Selection */}
        <Box className="space-y-2">
          <Typography variant="subtitle2" className="font-bold text-themeTextSecondary text-xs uppercase tracking-wider">
            2. Choose Content to Include
          </Typography>
          <RadioGroup
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="space-y-2"
          >
            {[
              {
                value: 'all',
                label: 'Everything (All Data)',
                desc: 'Includes profile summary, assessments, custom attributes, and reflective notes.'
              },
              {
                value: 'assessments',
                label: 'Assessments & Custom Attributes Only',
                desc: 'Includes only score history, effort levels, and custom trait descriptions.'
              },
              {
                value: 'notes',
                label: 'Reflective Journal Notes Only',
                desc: 'Includes only reflective journal entries and descriptions.'
              }
            ].map((item) => (
              <Paper
                key={item.value}
                onClick={() => setContent(item.value)}
                elevation={0}
                className={`p-3 border rounded-xl cursor-pointer flex items-start gap-2 hover:bg-themeBorder/5 transition-all ${
                  content === item.value ? 'border-orange-500/40 bg-orange-500/[0.02]' : 'border-themeBorder bg-themePaper'
                }`}
              >
                <Radio
                  checked={content === item.value}
                  value={item.value}
                  className="p-1 text-orange-500"
                  color="warning"
                />
                <Box className="mt-0.5">
                  <Typography variant="body2" className="font-bold text-themeText text-sm">
                    {item.label}
                  </Typography>
                  <Typography variant="caption" className="text-themeTextSecondary block leading-snug">
                    {item.desc}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </RadioGroup>
        </Box>
      </DialogContent>

      <DialogActions className="p-4 gap-2">
        <Button
          onClick={onClose}
          className="rounded-xl border border-themeBorder text-themeText hover:bg-themeBorder/10 normal-case px-5 py-2 font-medium"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={exporting}
          onClick={handleExport}
          className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-none hover:shadow-none normal-case px-6 py-2 font-semibold min-w-[120px]"
        >
          {exporting ? <CircularProgress size={20} color="inherit" /> : 'Export Data'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
