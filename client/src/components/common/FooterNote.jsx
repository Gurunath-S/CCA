import React from 'react';
import { Box, Typography, Link } from '@mui/material';

export const FooterNote = () => {
  return (
    <Box component="footer" className="mt-12 mb-6 pt-6 border-t border-slate-200/50 dark:border-slate-800/50 text-center">
      <Typography variant="body2" className="text-slate-500 dark:text-slate-400 text-xs font-medium">
        App built by{' '}
        <Link
          href="https://ibacustech.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 underline underline-offset-2 transition-colors"
        >
          Ibacustech
        </Link>
      </Typography>
    </Box>
  );
};
