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
  Skeleton,
  TablePagination,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel
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
import { motion, useReducedMotion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.08, ease: 'easeOut' } })
};

const AssessmentHistory = () => {
  const { history, fetchHistory, isLoading } = useCharacterStore();
  const { user } = useAuthStore();
  const shouldReduceMotion = useReducedMotion();
  const chartAnimProps = shouldReduceMotion
    ? { isAnimationActive: false }
    : { isAnimationActive: true, animationBegin: 150, animationDuration: 800, animationEasing: 'ease-out' };
  
  // Timeline view: weekly, monthly, yearly (default to weekly / last 7 days)
  const [timeFilter, setTimeFilter] = useState('weekly');

  // Self-Reflection Log Table Pagination & Filter state
  const [logPage, setLogPage] = useState(0);
  const [logRowsPerPage, setLogRowsPerPage] = useState(5);
  const [logSearch, setLogSearch] = useState('');
  const [logCategory, setLogCategory] = useState('All');
  const [logTimeRange, setLogTimeRange] = useState('All');
  const [logStartDate, setLogStartDate] = useState('');
  const [logEndDate, setLogEndDate] = useState('');

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

  // Helper to filter history based on selected time range for charts
  const getFilteredHistory = () => {
    const now = dayjs();
    let cutoff;
    if (timeFilter === 'weekly') cutoff = now.subtract(7, 'day');
    else if (timeFilter === 'monthly') cutoff = now.subtract(30, 'day');
    else return history; // 'yearly' shows all

    return history.filter(item => {
      const itemDate = dayjs(item.assessmentDate);
      return itemDate.isAfter(cutoff) || itemDate.isSame(cutoff, 'day');
    });
  };

  const filteredHistory = getFilteredHistory();

  // 1. Line Chart Data: Alignment score trend over time (sorted chronologically)
  const lineChartData = [...filteredHistory]
    .reverse() // Make it chronological (oldest to newest)
    .map(item => ({
      date: dayjs(item.assessmentDate).format('MMM DD'),
      fullDate: dayjs(item.assessmentDate),
      score: item.alignmentScore,
      character: item.character.name.split(' (')[0] // shorten name
    }));

  // 2. Radar Chart Data: Holistic mapping of character strengths (average per trait)
  const traitAverages = {};
  filteredHistory.forEach(item => {
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
  filteredHistory.forEach(item => {
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

  // 4. Log Table Filtering
  const getFilteredLogData = () => {
    return history.filter(item => {
      // Search term filter
      const matchesSearch = item.character.name.toLowerCase().includes(logSearch.toLowerCase()) ||
        (item.personalNote && item.personalNote.toLowerCase().includes(logSearch.toLowerCase()));
      
      // Category filter
      const matchesCategory = logCategory === 'All' || item.character.category === logCategory;

      // Time Period filter
      let matchesTime = true;
      const itemDate = dayjs(item.assessmentDate);
      if (logTimeRange === '7days') {
        matchesTime = itemDate.isAfter(dayjs().subtract(7, 'day')) || itemDate.isSame(dayjs().subtract(7, 'day'), 'day');
      } else if (logTimeRange === '30days') {
        matchesTime = itemDate.isAfter(dayjs().subtract(30, 'day')) || itemDate.isSame(dayjs().subtract(30, 'day'), 'day');
      } else if (logTimeRange === 'custom') {
        if (logStartDate) {
          matchesTime = matchesTime && (itemDate.isAfter(dayjs(logStartDate)) || itemDate.isSame(dayjs(logStartDate), 'day'));
        }
        if (logEndDate) {
          matchesTime = matchesTime && (itemDate.isBefore(dayjs(logEndDate)) || itemDate.isSame(dayjs(logEndDate), 'day'));
        }
      }

      return matchesSearch && matchesCategory && matchesTime;
    });
  };

  const filteredLogData = getFilteredLogData();

  // Paginate filtered log data
  const paginatedLogData = filteredLogData.slice(
    logPage * logRowsPerPage,
    logPage * logRowsPerPage + logRowsPerPage
  );

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
      {filteredHistory.length === 0 ? (
        <Paper className="p-8 text-center bg-white/40 dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-800">
          <Typography variant="body1" className="text-slate-500">
            No assessment data available for the last {timeFilter === 'weekly' ? '7 days' : '30 days'}. Try selecting "Yearly" to see older history.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {/* Line Chart: Progression trend */}
          <Grid item xs={12} lg={8}>
            <motion.div variants={fadeUp} custom={0} initial="hidden" animate="visible">
            <Card>
              <CardContent className="p-6">
                <Typography variant="h6" className="font-semibold mb-4 text-slate-700 dark:text-slate-350">
                  Alignment Score Progression
                </Typography>
                <Box className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineChartData}>
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
                        {...chartAnimProps}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
            </motion.div>
          </Grid>

          {/* Radar Chart: Holistic mapping */}
          <Grid item xs={12} lg={4}>
            <motion.div variants={fadeUp} custom={1} initial="hidden" animate="visible" style={{ height: '100%' }}>
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
                          {...chartAnimProps}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  )}
                </Box>
              </CardContent>
            </Card>
            </motion.div>
          </Grid>

          {/* Bar Chart: Oldest vs. Newest Comparison */}
          <Grid item xs={12} md={6}>
            <motion.div variants={fadeUp} custom={2} initial="hidden" animate="visible" style={{ height: '100%' }}>
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
                      <Bar dataKey="Initial Score" fill={colors[2] || '#94a3b8'} radius={[4, 4, 0, 0]} {...chartAnimProps} />
                      <Bar dataKey="Latest Score" fill={colors[0] || '#2563eb'} radius={[4, 4, 0, 0]} {...chartAnimProps} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
            </motion.div>
          </Grid>

          {/* Growth Highlights */}
          <Grid item xs={12} md={6}>
            <motion.div variants={fadeUp} custom={3} initial="hidden" animate="visible" style={{ height: '100%' }}>
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
            </motion.div>
          </Grid>
        </Grid>
      )}

      {/* Chronological Timeline Table */}
      <motion.div variants={fadeUp} custom={4} initial="hidden" animate="visible">
      <Card>
        <CardContent className="p-6">
          <Typography variant="h6" className="font-semibold mb-4 text-slate-700 dark:text-slate-350">
            Self-Reflection Log
          </Typography>

          {/* Filters Row */}
          <Grid container spacing={2} className="mb-6 items-center">
            {/* Search Input */}
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                label="Search Character / Notes"
                placeholder="Search..."
                value={logSearch}
                onChange={(e) => {
                  setLogSearch(e.target.value);
                  setLogPage(0);
                }}
                slotProps={{
                  input: { className: 'rounded-xl' }
                }}
              />
            </Grid>

            {/* Category Filter */}
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={logCategory}
                  onChange={(e) => {
                    setLogCategory(e.target.value);
                    setLogPage(0);
                  }}
                  label="Category"
                  slotProps={{
                    input: { className: 'rounded-xl' }
                  }}
                >
                  <MenuItem value="All">All Categories</MenuItem>
                  <MenuItem value="Yama">Yama</MenuItem>
                  <MenuItem value="Niyama">Niyama</MenuItem>
                  <MenuItem value="General">General</MenuItem>
                  <MenuItem value="Custom">Custom</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Time Filter Preset */}
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Time Period</InputLabel>
                <Select
                  value={logTimeRange}
                  onChange={(e) => {
                    setLogTimeRange(e.target.value);
                    setLogPage(0);
                  }}
                  label="Time Period"
                  slotProps={{
                    input: { className: 'rounded-xl' }
                  }}
                >
                  <MenuItem value="All">All Time</MenuItem>
                  <MenuItem value="7days">Last 7 Days</MenuItem>
                  <MenuItem value="30days">Last 30 Days</MenuItem>
                  <MenuItem value="custom">Custom Range</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Custom Date Range Pickers */}
            {logTimeRange === 'custom' && (
              <>
                <Grid item xs={12} sm={1.5}>
                  <TextField
                    fullWidth
                    type="date"
                    size="small"
                    label="From"
                    InputLabelProps={{ shrink: true }}
                    value={logStartDate}
                    onChange={(e) => {
                      setLogStartDate(e.target.value);
                      setLogPage(0);
                    }}
                    slotProps={{
                      input: { className: 'rounded-xl' }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={1.5}>
                  <TextField
                    fullWidth
                    type="date"
                    size="small"
                    label="To"
                    InputLabelProps={{ shrink: true }}
                    value={logEndDate}
                    onChange={(e) => {
                      setLogEndDate(e.target.value);
                      setLogPage(0);
                    }}
                    slotProps={{
                      input: { className: 'rounded-xl' }
                    }}
                  />
                </Grid>
              </>
            )}
          </Grid>

          {filteredLogData.length === 0 ? (
            <Paper className="p-8 text-center bg-slate-50/50 dark:bg-slate-900/10 rounded-2xl border border-dashed border-slate-200/60 dark:border-slate-800/40">
              <Typography variant="body2" className="text-slate-400">
                No logs match your filter criteria.
              </Typography>
            </Paper>
          ) : (
            <>
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
                    {paginatedLogData.map((item) => (
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

              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredLogData.length}
                rowsPerPage={logRowsPerPage}
                page={logPage}
                onPageChange={(e, newPage) => setLogPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setLogRowsPerPage(parseInt(e.target.value, 10));
                  setLogPage(0);
                }}
                className="mt-2 text-slate-500 text-xs"
              />
            </>
          )}
        </CardContent>
      </Card>
      </motion.div>
    </Box>
  );
};

export default AssessmentHistory;
