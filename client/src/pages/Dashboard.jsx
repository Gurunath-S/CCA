import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacterStore } from '../store/useCharacterStore';
import { useAuthStore } from '../store/useAuthStore';
import { themePalettes } from '../theme/themeConfig';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  Paper,
  Divider
} from '@mui/material';
import {
  Spa as SpaIcon,
  LocalFireDepartment as FireIcon,
  CheckCircle as CheckIcon,
  Timeline as ChartIcon,
  ListAlt as ListIcon,
  PlayArrow as StartIcon,
  TrendingUp as UpIcon
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { characters, history, fetchCharacters, fetchHistory, isLoading } = useCharacterStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [quickStartId, setQuickStartId] = useState('');

  const userTheme = user?.profile?.theme || 'Serenity';
  const colors = themePalettes[userTheme]?.chartColors || themePalettes.Serenity.chartColors;

  useEffect(() => {
    fetchCharacters();
    fetchHistory();
  }, [fetchCharacters, fetchHistory]);

  // Loading indicator on first load
  if (isLoading && history.length === 0 && characters.length === 0) {
    return (
      <Box className="flex flex-col items-center justify-center p-12 min-h-[60vh]">
        <CircularProgress className="text-orange-500" />
        <Typography className="text-slate-400 mt-3">Loading your dashboard...</Typography>
      </Box>
    );
  }

  // --- STATS CALCULATIONS ---

  // 1. Total Assessments
  const totalAssessments = history.length;

  // 2. Streaks Calculation
  const calculateStreak = () => {
    if (history.length === 0) return 0;
    
    // Get sorted unique dates (YYYY-MM-DD)
    const dates = history
      .map(item => dayjs(item.assessmentDate).format('YYYY-MM-DD'))
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort((a, b) => new Date(b) - new Date(a)); // Descending (today first)

    let streak = 0;
    let today = dayjs().format('YYYY-MM-DD');
    let yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');

    // Check if the most recent submission is today or yesterday
    if (dates[0] !== today && dates[0] !== yesterday) {
      return 0; // Streak broken
    }

    let expectedDate = dayjs(dates[0]);
    for (let i = 0; i < dates.length; i++) {
      const currentDate = dayjs(dates[i]);
      const diff = expectedDate.diff(currentDate, 'day');
      
      if (diff === 0) {
        streak++;
        expectedDate = expectedDate.subtract(1, 'day');
      } else if (diff === 1) {
        // Gap of exactly 1 day (e.g. skipped but next is sequential)
        streak++;
        expectedDate = currentDate.subtract(1, 'day');
      } else {
        break; // Streak broken
      }
    }
    return streak;
  };

  const currentStreak = calculateStreak();

  // 3. Most Practiced Character
  const getMostPracticed = () => {
    if (characters.length === 0) return 'None';
    // Characters are pre-sorted by submission count by default from API
    const topChar = characters[0];
    return topChar && topChar.submissionCount > 0 ? topChar.name.split(' (')[0] : 'None';
  };

  const mostPracticed = getMostPracticed();

  // 4. Recent Activity (latest 4 assessments)
  const recentActivity = history.slice(0, 4);

  // 5. Top Improving Traits
  const getTopImproving = () => {
    const traits = {};
    history.forEach(item => {
      const name = item.character.name.split(' (')[0];
      if (!traits[name]) traits[name] = [];
      traits[name].push(item);
    });

    const improving = [];
    Object.keys(traits).forEach(name => {
      const list = traits[name].sort((a, b) => new Date(a.assessmentDate) - new Date(b.assessmentDate));
      if (list.length > 1) {
        const diff = list[list.length - 1].alignmentScore - list[0].alignmentScore;
        if (diff > 0) {
          improving.push({ name, diff });
        }
      }
    });
    return improving.sort((a, b) => b.diff - a.diff).slice(0, 3);
  };

  const topImproving = getTopImproving();

  // 6. Recent Progress Chart Data (latest 6 assessments)
  const chartData = [...history]
    .slice(0, 6)
    .reverse()
    .map(item => ({
      date: dayjs(item.assessmentDate).format('MMM DD'),
      score: item.alignmentScore,
      character: item.character.name.split(' (')[0]
    }));

  const handleQuickStart = () => {
    if (quickStartId) {
      navigate(`/assess/${quickStartId}`);
    }
  };

  return (
    <Box className="space-y-6">
      {/* Welcome Banner */}
      <Box className="bg-gradient-to-r from-orange-500/10 via-yellow-600/5 to-blue-500/5 p-6 sm:p-8 rounded-3xl border border-orange-100/30 dark:border-orange-900/10 relative overflow-hidden">
        <Box className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Box className="space-y-1">
            <Typography variant="h4" className="font-serif font-bold text-slate-800 dark:text-slate-100">
              Welcome, {user?.name || 'Practitioner'}
            </Typography>
            <Typography variant="body1" className="text-slate-500 dark:text-slate-400">
              "Character is repeated habit." Continue your self-reflection journey today.
            </Typography>
          </Box>
          <Box className="flex gap-2">
            <Button
              variant="contained"
              onClick={() => navigate('/characters')}
              startIcon={<ListIcon />}
              className="bg-orange-500 hover:bg-orange-600 rounded-xl"
            >
              View Characters
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Stats Cards Grid */}
      <Grid container spacing={3}>
        {/* Total Assessments */}
        <Grid item xs={12} sm={4}>
          <Card className="hover:scale-[1.01] transition-transform duration-300">
            <CardContent className="p-6 flex items-center justify-between">
              <Box>
                <Typography variant="subtitle2" className="text-slate-400 font-medium">
                  Total Assessments
                </Typography>
                <Typography variant="h3" className="font-bold font-serif text-slate-800 dark:text-slate-100 mt-1">
                  {totalAssessments}
                </Typography>
              </Box>
              <Box className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-2xl text-blue-500">
                <CheckIcon fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Current Streak */}
        <Grid item xs={12} sm={4}>
          <Card className="hover:scale-[1.01] transition-transform duration-300">
            <CardContent className="p-6 flex items-center justify-between">
              <Box>
                <Typography variant="subtitle2" className="text-slate-400 font-medium">
                  Current Streak
                </Typography>
                <Typography variant="h3" className="font-bold font-serif text-orange-500 mt-1">
                  {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}
                </Typography>
              </Box>
              <Box className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-2xl text-orange-500">
                <FireIcon fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Most Practiced */}
        <Grid item xs={12} sm={4}>
          <Card className="hover:scale-[1.01] transition-transform duration-300">
            <CardContent className="p-6 flex items-center justify-between">
              <Box className="max-w-[70%]">
                <Typography variant="subtitle2" className="text-slate-400 font-medium">
                  Most Practiced Trait
                </Typography>
                <Typography variant="h5" className="font-bold truncate text-teal-600 dark:text-teal-400 mt-2">
                  {mostPracticed}
                </Typography>
              </Box>
              <Box className="p-3 bg-teal-50 dark:bg-teal-950/30 rounded-2xl text-teal-500">
                <SpaIcon fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Grid Content */}
      <Grid container spacing={3}>
        {/* Progress Charts summary */}
        <Grid item xs={12} lg={8}>
          <Card className="h-full">
            <CardContent className="p-6">
              <Box className="flex justify-between items-center mb-4">
                <Typography variant="h6" className="font-semibold text-slate-700 dark:text-slate-350">
                  Recent Alignment Trend
                </Typography>
                <Button
                  size="small"
                  onClick={() => navigate('/history')}
                  startIcon={<ChartIcon />}
                  className="text-orange-500 text-xs hover:bg-orange-50/50"
                >
                  Full History
                </Button>
              </Box>
              <Box className="h-[250px] w-full">
                {chartData.length === 0 ? (
                  <Box className="flex flex-col justify-center items-center h-full text-slate-400">
                    <Typography variant="caption">Submit assessments to view trend chart</Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={colors[0]} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={colors[0]} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                      <XAxis dataKey="date" tickLine={false} />
                      <YAxis domain={[1, 5]} allowDecimals={false} tickLine={false} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="score"
                        name="Alignment Score"
                        stroke={colors[0]}
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorScore)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Start & Improving list */}
        <Grid item xs={12} lg={4}>
          <Box className="space-y-6 h-full flex flex-col justify-between">
            {/* Quick Start Card */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <Typography variant="h6" className="font-semibold text-slate-700 dark:text-slate-350">
                  Quick Start Assessment
                </Typography>
                <FormControl fullWidth size="small">
                  <InputLabel>Select Trait</InputLabel>
                  <Select
                    value={quickStartId}
                    onChange={(e) => setQuickStartId(e.target.value)}
                    label="Select Trait"
                    slotProps={{
                      input: { className: 'rounded-xl' }
                    }}
                  >
                    {characters.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name.split(' (')[0]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  fullWidth
                  variant="contained"
                  disabled={!quickStartId}
                  onClick={handleQuickStart}
                  startIcon={<StartIcon />}
                  className="bg-orange-500 hover:bg-orange-600 rounded-xl"
                >
                  Start Assessment
                </Button>
              </CardContent>
            </Card>

            {/* Improving Traits Card */}
            <Card className="flex-grow">
              <CardContent className="p-6">
                <Typography variant="h6" className="font-semibold mb-3 text-slate-700 dark:text-slate-350">
                  Top Improving Traits
                </Typography>
                {topImproving.length === 0 ? (
                  <Typography variant="caption" className="text-slate-400 block text-center py-4">
                    Assess character traits repeatedly to track improvements!
                  </Typography>
                ) : (
                  <Box className="space-y-3">
                    {topImproving.map((t) => (
                      <Paper
                        key={t.name}
                        elevation={0}
                        className="p-3 border border-slate-100 dark:border-slate-800 rounded-2xl flex justify-between items-center bg-white/50"
                      >
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t.name}</span>
                        <Chip
                          icon={<UpIcon />}
                          label={`+${t.diff}`}
                          color="success"
                          size="small"
                          className="font-bold text-xs rounded-lg"
                        />
                      </Paper>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>

      {/* Recent Activity Logs */}
      <Card>
        <CardContent className="p-6">
          <Typography variant="h6" className="font-semibold mb-3 text-slate-700 dark:text-slate-350">
            Recent Activities
          </Typography>
          {recentActivity.length === 0 ? (
            <Typography variant="caption" className="text-slate-400 block text-center py-6">
              No recent assessment activity recorded.
            </Typography>
          ) : (
            <List className="divide-y divide-slate-100 dark:divide-slate-900 p-0">
              {recentActivity.map((activity) => (
                <ListItem key={activity.id} className="px-0 py-3 flex justify-between items-center gap-4">
                  <ListItemText
                    primary={activity.character.name}
                    secondary={`Checked: ${dayjs(activity.assessmentDate).format('YYYY-MM-DD')} • "${activity.effortLevel}"`}
                    primaryTypographyProps={{ className: 'font-bold text-sm text-slate-800 dark:text-slate-100' }}
                    secondaryTypographyProps={{ className: 'text-xs text-slate-400 mt-0.5' }}
                  />
                  <Chip
                    label={`Score: ${activity.alignmentScore}`}
                    size="small"
                    color={activity.alignmentScore >= 4 ? 'success' : activity.alignmentScore >= 3 ? 'primary' : 'warning'}
                    className="font-semibold text-xs rounded-lg"
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
