import React from 'react';
import { Box, Typography } from '@mui/material';
import { getScoreColorClass } from '../../utils/formatters';

export const ScoreBadge = ({ score, maxScore = 5, size = 'medium' }) => {
  const colorClass = getScoreColorClass(score);
  const isSmall = size === 'small';

  return (
    <Box className={`inline-flex items-center justify-center font-bold rounded-xl px-2.5 py-1 bg-white/40 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/40 ${colorClass}`}>
      <Typography variant={isSmall ? 'caption' : 'body2'} className="font-bold">
        {score} / {maxScore}
      </Typography>
    </Box>
  );
};
