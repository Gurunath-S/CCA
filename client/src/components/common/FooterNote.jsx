import React from 'react';
import { Box, Typography, Link } from '@mui/material';

export const FooterNote = () => {
  return (
    <Box component="footer" className="mt-12 mb-6 pt-6 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-center sm:text-left">
      <Link
        href="https://ibacustech.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center hover:opacity-90 transition-opacity"
      >
        <img
          src="https://ibacustech.com/logo.png"
          alt="Ibacus Logo"
          className="h-6 w-auto object-contain dark:brightness-110"
        />
      </Link>
      <Box className="hidden sm:block h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />
      <Typography variant="body2" className="text-slate-400 dark:text-slate-500 text-[11px] leading-relaxed">
        This non-profit site is developed by{' '}
        <Link
          href="https://ibacustech.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
        >
          Ibacus
        </Link>
        . Please submit questions or feedback via our{' '}
        <Link
          href="https://ibacustech.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
        >
          website
        </Link>
        .
      </Typography>
    </Box>
  );
};
