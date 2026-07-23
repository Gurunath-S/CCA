import React from 'react';
import { Box, Card, Skeleton } from '@mui/material';

export const CardSkeleton = ({ count = 3 }) => {
  return (
    <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
          <Skeleton variant="text" width="60%" height={30} className="mb-2" />
          <Skeleton variant="rectangular" height={12} className="rounded-full mb-4" />
          <Skeleton variant="text" width="90%" height={20} className="mb-4" />
          <Box className="flex justify-between items-center pt-2">
            <Skeleton variant="rectangular" width={70} height={26} className="rounded-full" />
            <Skeleton variant="rectangular" width={80} height={32} className="rounded-xl" />
          </Box>
        </Card>
      ))}
    </Box>
  );
};

export const StatsSkeleton = ({ count = 4 }) => {
  return (
    <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
          <Skeleton variant="text" width="50%" height={20} className="mb-1" />
          <Skeleton variant="text" width="40%" height={40} className="mb-2" />
          <Skeleton variant="text" width="70%" height={16} />
        </Card>
      ))}
    </Box>
  );
};

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <Box className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} variant="rectangular" height={50} className="rounded-xl" />
      ))}
    </Box>
  );
};
