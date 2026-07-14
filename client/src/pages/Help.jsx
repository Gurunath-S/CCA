import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Paper,
  Divider,
  Button
} from '@mui/material';
import {
  Book as BookIcon,
  OpenInNew as OpenIcon,
  HelpOutline as HelpIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const Help = () => {
  const [iframeLoading, setIframeLoading] = useState(true);
  
  // Google Drive embed link replacing /view with /preview and keeping the resource key
  const pdfEmbedUrl = "https://drive.google.com/file/d/0B37aWeOTAf9PV2x5eW1IbGlVNms/preview?resourcekey=0-hQnZ4RvsdfdZnp5GrFFaYg";
  const pdfOriginalUrl = "https://drive.google.com/file/d/0B37aWeOTAf9PV2x5eW1IbGlVNms/view?usp=drivesdk&resourcekey=0-hQnZ4RvsdfdZnp5GrFFaYg";

  return (
    <Box className="space-y-6 flex flex-col h-[calc(100vh-130px)]">
      {/* Header */}
      <Box className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
        <Box>
          <Typography variant="h4" className="font-serif font-bold text-slate-800 dark:text-slate-100">
            Inspirational Reading
          </Typography>
          <Typography variant="body2" className="text-slate-500 dark:text-slate-400 mt-1">
            "The Miracle That Obeys You" — Embedded guide on self-reflection and character building.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          href={pdfOriginalUrl}
          target="_blank"
          rel="noopener noreferrer"
          startIcon={<OpenIcon />}
          className="border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl"
        >
          Open in Drive
        </Button>
      </Box>

      {/* Embedded PDF Card */}
      <Card className="flex-grow flex flex-col overflow-hidden relative border border-slate-150 dark:border-slate-850">
        {iframeLoading && (
          <Box className="absolute inset-0 flex flex-col justify-center items-center bg-white/70 dark:bg-slate-950/70 z-10">
            <CircularProgress className="text-orange-500" />
            <Typography variant="caption" className="text-slate-400 mt-3 font-semibold">
              Loading Google Drive document reader...
            </Typography>
          </Box>
        )}
        
        <iframe
          src={pdfEmbedUrl}
          width="100%"
          height="100%"
          allow="autoplay"
          title="The Miracle That Obeys You"
          onLoad={() => setIframeLoading(false)}
          className="border-0 flex-grow"
        />
      </Card>
    </Box>
  );
};

export default Help;
