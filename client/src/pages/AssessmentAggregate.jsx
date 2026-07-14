import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCharacterStore } from '../store/useCharacterStore';
import { useAuthStore } from '../store/useAuthStore';
import { themePalettes } from '../theme/themeConfig';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Paper,
  Divider,
  Alert
} from '@mui/material';
import {
  Spa as SpaIcon,
  Timeline as HistoryIcon,
  Replay as ReplayIcon,
  Home as HomeIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion } from 'framer-motion';

const AssessmentAggregate = () => {
  const { characterId } = useParams();
  const navigate = useNavigate();
  const { characters, fetchCharacters, selectedCharacterStats, fetchAggregateStats, isLoading } = useCharacterStore();
  const { user } = useAuthStore();
  const [selectedChar, setSelectedChar] = useState(null);

  // Fetch active theme color palette for charts
  const userTheme = user?.profile?.theme || 'Serenity';
  const colors = themePalettes[userTheme]?.chartColors || themePalettes.Serenity.chartColors;

  useEffect(() => {
    if (characters.length === 0) {
      fetchCharacters();
    } else {
      const found = characters.find(c => c.id === characterId);
      if (found) {
        setSelectedChar(found);
      }
    }
    fetchAggregateStats(characterId);
  }, [characterId, characters, fetchCharacters, fetchAggregateStats]);

  if (isLoading || !selectedCharacterStats || !selectedChar) {
    return (
      <Box className="flex flex-col items-center justify-center p-12 min-h-[50vh]">
        <CircularProgress className="text-orange-500" />
        <Typography className="text-slate-400 mt-3">Loading aggregate comparison charts...</Typography>
      </Box>
    );
  }

  const {
    userLatestScore,
    userTotalAssessments,
    communityAverage,
    communityResponseCount,
    distributions
  } = selectedCharacterStats;

  // Custom tooltips for nice styling
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Paper className="p-3 border border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-md rounded-xl">
          <Typography variant="body2" className="font-semibold text-slate-800 dark:text-slate-200">
            {payload[0].name || payload[0].payload.score || payload[0].payload.option}
          </Typography>
          <Typography variant="body2" className="text-orange-500 font-bold">
            Count: {payload[0].value}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  return (
    <Box className="space-y-6">
      {/* Header */}
      <Box className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Box>
          <Typography variant="h4" className="font-serif font-bold text-slate-800 dark:text-slate-100">
            Insights & Analytics
          </Typography>
          <Typography variant="body2" className="text-slate-500 dark:text-slate-400 mt-1">
            Analyzing {selectedChar.name} alignment statistics compared to the community.
          </Typography>
        </Box>

        <Box className="flex gap-2">
          <Button
            variant="outlined"
            onClick={() => navigate('/characters')}
            startIcon={<HomeIcon />}
            className="border-slate-250 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl"
          >
            All Traits
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate(`/assess/${characterId}`)}
            startIcon={<ReplayIcon />}
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl"
          >
            Assess Again
          </Button>
        </Box>
      </Box>

      {/* Numerical Stats row */}
      <Grid container spacing={3}>
        {/* Your Score Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="p-6 text-center flex flex-col items-center justify-center">
            <Typography variant="subtitle2" className="text-slate-400 dark:text-slate-500 font-medium">
              Your Latest Alignment
            </Typography>
            <Typography variant="h2" className="font-bold text-orange-500 font-serif my-2">
              {userLatestScore || 'N/A'}
            </Typography>
            <Typography variant="caption" className="text-slate-400">
              Out of 5 points maximum
            </Typography>
          </Card>
        </Grid>

        {/* Community Average Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="p-6 text-center flex flex-col items-center justify-center">
            <Typography variant="subtitle2" className="text-slate-400 dark:text-slate-500 font-medium">
              Community Average
            </Typography>
            <Typography variant="h2" className="font-bold text-blue-500 dark:text-blue-400 font-serif my-2">
              {communityAverage ? communityAverage : '0.00'}
            </Typography>
            <Typography variant="caption" className="text-slate-400">
              Across {communityResponseCount} submissions
            </Typography>
          </Card>
        </Grid>

        {/* Total Self Assessments */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="p-6 text-center flex flex-col items-center justify-center">
            <Typography variant="subtitle2" className="text-slate-400 dark:text-slate-500 font-medium">
              Your Submissions
            </Typography>
            <Typography variant="h2" className="font-bold text-teal-500 dark:text-teal-400 font-serif my-2">
              {userTotalAssessments}
            </Typography>
            <Typography variant="caption" className="text-slate-400">
              Total times self-assessed
            </Typography>
          </Card>
        </Grid>

        {/* Streak / Motivation info */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="p-6 text-center flex flex-col items-center justify-center bg-gradient-to-br from-orange-500/5 to-yellow-600/5">
            <TrendingIcon className="text-orange-500 text-3xl mb-1" />
            <Typography variant="subtitle2" className="text-slate-400 dark:text-slate-500 font-medium">
              Assessment Trend
            </Typography>
            <Typography variant="h6" className="font-semibold text-slate-700 dark:text-slate-300 my-2">
              {userLatestScore >= communityAverage ? 'Above Average' : 'Growing Phase'}
            </Typography>
            <Button
              size="small"
              onClick={() => navigate('/history')}
              startIcon={<HistoryIcon />}
              className="text-xs text-orange-500 hover:underline hover:bg-transparent capitalize"
            >
              View Full Timeline
            </Button>
          </Card>
        </Grid>
      </Grid>

      {/* Distribution Charts Grid */}
      <Grid container spacing={3}>
        {/* 1. Alignment score distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent className="p-6">
              <Typography variant="h6" className="font-semibold mb-4 text-slate-700 dark:text-slate-350">
                Alignment score distribution (Community)
              </Typography>
              <Box className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distributions.alignment}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                    <XAxis dataKey="score" tickLine={false} />
                    <YAxis allowDecimals={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill={colors[0] || '#2563eb'} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 2. Recognition distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent className="p-6">
              <Typography variant="h6" className="font-semibold mb-4 text-slate-700 dark:text-slate-350">
                Do others recognize this trait in your behavior?
              </Typography>
              <Box className="h-[250px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributions.recognition}
                      dataKey="count"
                      nameKey="option"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      label={false}
                    >
                      {distributions.recognition.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      iconSize={10}
                      wrapperStyle={{ fontSize: 11 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 3. Conscious effort distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent className="p-6">
              <Typography variant="h6" className="font-semibold mb-4 text-slate-700 dark:text-slate-350">
                Making conscious effort to strengthen?
              </Typography>
              <Box className="h-[250px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributions.effort}
                      dataKey="count"
                      nameKey="option"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell fill={colors[0]} />
                      <Cell fill={colors[1] || '#94a3b8'} />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 4. Practice Frequency distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent className="p-6">
              <Typography variant="h6" className="font-semibold mb-4 text-slate-700 dark:text-slate-350">
                Conscious practice frequency (Recently)
              </Typography>
              <Box className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distributions.frequency}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                    <XAxis dataKey="option" tickLine={false} tickFormatter={(val) => val.split(' ')[0]} />
                    <YAxis allowDecimals={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill={colors[1] || '#10b981'} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AssessmentAggregate;
