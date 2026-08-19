import React from 'react';
import { Box, Typography, Link } from '@mui/material';

export const FooterNote = () => {
  return (
    <Box component="footer" className="mt-12 mb-6 pt-6 border-t border-slate-200/50 dark:border-slate-800/50 text-center flex flex-col items-center justify-center gap-3">
      <Link
        href="https://ibacustech.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 hover:opacity-90 transition-opacity"
      >
        <img
          src="https://ibacustech.com/logo.png"
          alt="Ibacus Logo"
          className="h-7 w-auto object-contain dark:brightness-110"
        />
      </Link>
      <Typography variant="body2" className="text-slate-500 dark:text-slate-400 text-xs max-w-md leading-relaxed">
        This non-profit site is developed by{' '}
        <Link
          href="https://ibacustech.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
        >
          Ibacus
        </Link>
        . Please submit questions, feedback via website.
      </Typography>
    </Box>
  );
};
