import React, { useEffect, useState } from 'react';
import { useCharacterStore } from '../store/useCharacterStore';
import { useAuthStore } from '../store/useAuthStore';
import { themePalettes } from '../theme/themeConfig';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Chip,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Skeleton
} from '@mui/material';
import {
  Spa as SpaIcon,
  Timeline as LineIcon,
  TrendingUp as UpIcon,
  TrendingDown as DownIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar
} from 'recharts';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';

const AssessmentHistory = () => {
  const { history, fetchHistory, isLoading } = useCharacterStore();
  const { user } = useAuthStore();
  
  // Timeline view: weekly, monthly, yearly
  const [timeFilter, setTimeFilter] = useState('monthly');

  const userTheme = user?.profile?.theme || 'Classic';
  const colors = themePalettes[userTheme]?.chartColors || themePalettes.Classic.chartColors;

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (isLoading && history.length === 0) {
    return (
      <Box className="space-y-6">
        {/* Header Skeleton */}
        <Box className="flex justify-between items-center">
          <Box className="space-y-2 w-1/3">
            <Skeleton variant="text" width="80%" height={40} />
            <Skeleton variant="text" width="60%" height={20} />
          </Box>
          <Skeleton variant="rectangular" width={100} height={40} className="rounded-xl" />
        </Box>

        {/* Charts Row Skeleton */}
        <Grid container spacing={3}>
          {/* Main Trend Line Chart Skeleton */}
          <Grid item xs={12} md={8}>
            <Card className="p-6">
              <Box className="flex justify-between items-center mb-4">
                <Skeleton variant="text" width="30%" height={25} />
                <Skeleton variant="rectangular" width={120} height={30} className="rounded-lg" />
              </Box>
              <Skeleton variant="rectangular" height={300} className="rounded-2xl" />
            </Card>
          </Grid>

          {/* Side distribution chart skeleton */}
          <Grid item xs={12} md={4}>
            <Card className="p-6 h-full flex flex-col justify-between">
              <Skeleton variant="text" width="60%" height={25} className="mb-4" />
              <Skeleton variant="rectangular" height={220} className="rounded-2xl" />
              <Skeleton variant="text" width="80%" height={20} className="mt-4" />
            </Card>
          </Grid>
        </Grid>

        {/* Logs Table Skeleton */}
        <Card className="p-6">
          <Box className="flex justify-between items-center mb-4">
            <Skeleton variant="text" width="20%" height={25} />
            <Skeleton variant="rectangular" width={180} height={35} className="rounded-xl" />
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <TableCell key={idx}>
                      <Skeleton variant="text" width="60%" height={20} />
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.from({ length: 4 }).map((_, rowIdx) => (
                  <TableRow key={rowIdx}>
                    <TableCell><Skeleton variant="text" width="40%" height={20} /></TableCell>
                    <TableCell><Skeleton variant="text" width="60%" height={20} /></TableCell>
                    <TableCell><Skeleton variant="rectangular" width={40} height={20} className="rounded" /></TableCell>
                    <TableCell><Skeleton variant="text" width="70%" height={20} /></TableCell>
                    <TableCell><Skeleton variant="text" width="50%" height={20} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Box>
    );
  }

  if (history.length === 0) {
    return (
      <Paper className="p-12 text-center bg-white/40 dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-800 max-w-lg mx-auto mt-12">
        <CalendarIcon className="text-slate-350 dark:text-slate-650 text-5xl mb-3" />
        <Typography variant="h6" className="font-semibold text-slate-700 dark:text-slate-300">
          No assessment history yet
        </Typography>
        <Typography variant="body2" className="text-slate-500 dark:text-slate-400 mt-2 mb-4">
          Start by self-assessing a character attribute to begin tracking your progress.
        </Typography>
      </Paper>
    );
  }

  // 1. Line Chart Data: Alignment score trend over time (sorted chronologically)
  const lineChartData = [...history]
    .reverse() // Make it chronological (oldest to newest)
    .map(item => ({
      date: dayjs(item.assessmentDate).format('MMM DD'),
      fullDate: dayjs(item.assessmentDate),
      score: item.alignmentScore,
      character: item.character.name.split(' (')[0] // shorten name
    }));

  // Filter line chart data based on selected range
  const getFilteredLineData = () => {
    const now = dayjs();
    let cutoff;
    if (timeFilter === 'weekly') cutoff = now.subtract(7, 'day');
    else if (timeFilter === 'monthly') cutoff = now.subtract(30, 'day');
    else cutoff = now.subtract(1, 'year');

    return lineChartData.filter(item => {
      return item.fullDate.isAfter(cutoff) || timeFilter === 'yearly';
    });
  };

  // 2. Radar Chart Data: Holistic mapping of character strengths (average per trait)
  const traitAverages = {};
  history.forEach(item => {
    const name = item.character.name.split(' (')[0];
    if (!traitAverages[name]) {
      traitAverages[name] = { total: 0, count: 0 };
    }
    traitAverages[name].total += item.alignmentScore;
    traitAverages[name].count += 1;
  });

  const radarChartData = Object.keys(traitAverages).map(name => ({
    subject: name,
    value: parseFloat((traitAverages[name].total / traitAverages[name].count).toFixed(1)),
    fullMark: 5
  }));

  // 3. Bar Chart Data & Improvement Highlighting: Oldest vs. Latest comparison per character trait
  const traitComparisons = {};
  history.forEach(item => {
    const name = item.character.name.split(' (')[0];
    if (!traitComparisons[name]) {
      traitComparisons[name] = [];
    }
    traitComparisons[name].push(item);
  });

  const comparisonData = [];
  const improvements = [];

  Object.keys(traitComparisons).forEach(name => {
    const assessments = traitComparisons[name].sort((a, b) => new Date(a.assessmentDate) - new Date(b.assessmentDate));
    const oldest = assessments[0];
    const latest = assessments[assessments.length - 1];

    comparisonData.push({
      name,
      'Initial Score': oldest.alignmentScore,
      'Latest Score': latest.alignmentScore
    });

    const diff = latest.alignmentScore - oldest.alignmentScore;
    improvements.push({
      name,
      oldScore: oldest.alignmentScore,
      newScore: latest.alignmentScore,
      difference: diff,
      date: dayjs(latest.assessmentDate).format('MMM DD, YYYY')
    });
  });

  // Sort improvements (highest first)
  improvements.sort((a, b) => b.difference - a.difference);

  return (
    <Box className="space-y-6">
      {/* Header */}
      <Box className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Box>
          <Typography variant="h4" className="font-serif font-bold text-slate-800 dark:text-slate-100">
            Assessment History
          </Typography>
          <Typography variant="body2" className="text-slate-500 dark:text-slate-400 mt-1">
            Compare and monitor progress of all character traits.
          </Typography>
        </Box>

        <ToggleButtonGroup
          value={timeFilter}
          exclusive
          onChange={(e, val) => val && setTimeFilter(val)}
          size="small"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
        >
          <ToggleButton value="weekly" className="px-4 py-1.5 rounded-l-xl text-xs font-semibold capitalize">Weekly</ToggleButton>
          <ToggleButton value="monthly" className="px-4 py-1.5 text-xs font-semibold capitalize">Monthly</ToggleButton>
          <ToggleButton value="yearly" className="px-4 py-1.5 rounded-r-xl text-xs font-semibold capitalize">Yearly</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Main Charts */}
      <Grid container spacing={3}>
        {/* Line Chart: Progression trend */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent className="p-6">
              <Typography variant="h6" className="font-semibold mb-4 text-slate-700 dark:text-slate-350">
                Alignment Score Progression
              </Typography>
              <Box className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getFilteredLineData()}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                    <XAxis dataKey="date" tickLine={false} />
                    <YAxis domain={[1, 5]} tickLine={false} allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="score"
                      name="Alignment Score"
                      stroke={colors[0] || '#2563eb'}
                      strokeWidth={3}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Radar Chart: Holistic mapping */}
        <Grid item xs={12} lg={4}>
          <Card className="h-full">
            <CardContent className="p-6 flex flex-col justify-between h-full">
              <Typography variant="h6" className="font-semibold mb-4 text-slate-700 dark:text-slate-350">
                Character Strengths Map
              </Typography>
              <Box className="h-[260px] w-full flex items-center justify-center">
                {radarChartData.length < 3 ? (
                  <Typography variant="caption" className="text-slate-400 text-center block">
                    Assess at least 3 unique traits to see radar map.
                  </Typography>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" radius="70%" data={radarChartData}>
                      <PolarGrid opacity={0.15} />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis domain={[0, 5]} angle={30} tickCount={6} />
                      <Radar
                        name="Strength level"
                        dataKey="value"
                        stroke={colors[1] || '#10b981'}
                        fill={colors[1] || '#10b981'}
                        fillOpacity={0.25}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Bar Chart: Oldest vs. Newest Comparison */}
        <Grid item xs={12} md={6}>
          <Card className="h-full">
            <CardContent className="p-6">
              <Typography variant="h6" className="font-semibold mb-4 text-slate-700 dark:text-slate-350">
                Trait Comparison (Before & After)
              </Typography>
              <Box className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                    <XAxis dataKey="name" tickLine={false} tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 5]} tickLine={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Initial Score" fill={colors[2] || '#94a3b8'} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Latest Score" fill={colors[0] || '#2563eb'} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Growth Highlights */}
        <Grid item xs={12} md={6}>
          <Card className="h-full">
            <CardContent className="p-6 flex flex-col justify-between h-full">
              <Box>
                <Typography variant="h6" className="font-semibold mb-4 text-slate-700 dark:text-slate-350">
                  Growth & Improvement Highlights
                </Typography>
                <Box className="space-y-3">
                  {improvements.slice(0, 4).map((imp) => {
                    const isPositive = imp.difference > 0;
                    return (
                      <Paper
                        key={imp.name}
                        elevation={0}
                        className="p-3 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between"
                      >
                        <Box>
                          <Typography variant="subtitle2" className="font-bold text-sm">
                            {imp.name}
                          </Typography>
                          <Typography variant="caption" className="text-slate-400">
                            Last checked: {imp.date}
                          </Typography>
                        </Box>

                        <Box className="flex items-center gap-3">
                          <Box className="text-right">
                            <Typography variant="body2" className="text-slate-400 text-xs">
                              {imp.oldScore} → {imp.newScore}
                            </Typography>
                          </Box>
                          <Chip
                            icon={isPositive ? <UpIcon /> : <DownIcon />}
                            label={isPositive ? `+${imp.difference}` : imp.difference}
                            color={isPositive ? 'success' : imp.difference === 0 ? 'default' : 'warning'}
                            size="small"
                            className="font-bold rounded-lg text-xs"
                          />
                        </Box>
                      </Paper>
                    );
                  })}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Chronological Timeline Table */}
      <Card>
        <CardContent className="p-6">
          <Typography variant="h6" className="font-semibold mb-4 text-slate-700 dark:text-slate-350">
            Self-Reflection Log
          </Typography>
          <TableContainer className="border border-slate-100 dark:border-slate-900 rounded-2xl overflow-hidden">
            <Table>
              <TableHead className="bg-slate-50 dark:bg-slate-900">
                <TableRow>
                  <TableCell className="font-semibold text-xs text-slate-500">Date</TableCell>
                  <TableCell className="font-semibold text-xs text-slate-500">Character Attribute</TableCell>
                  <TableCell className="font-semibold text-xs text-slate-500">Score</TableCell>
                  <TableCell className="font-semibold text-xs text-slate-500">Effort Level</TableCell>
                  <TableCell className="font-semibold text-xs text-slate-500">Personal Reflections</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                    <TableCell className="text-xs">{dayjs(item.assessmentDate).format('YYYY-MM-DD')}</TableCell>
                    <TableCell className="font-bold text-xs">{item.character.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={`${item.alignmentScore} / 5`}
                        size="small"
                        color={item.alignmentScore >= 4 ? 'success' : item.alignmentScore >= 3 ? 'primary' : 'warning'}
                        className="font-semibold text-xs rounded-lg"
                      />
                    </TableCell>
                    <TableCell className="text-xs max-w-xs truncate">{item.effortLevel}</TableCell>
                    <TableCell className="text-xs text-slate-500 dark:text-slate-400 italic max-w-md truncate">
                      {item.personalNote || 'No notes added'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AssessmentHistory;
