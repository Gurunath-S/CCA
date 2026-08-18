import React, { useEffect, useState } from 'react';
import { api, useAuthStore } from '../store/useAuthStore';
import WorldMap from 'react-svg-worldmap';
import { themePalettes } from '../theme/themeConfig';
import dayjs from 'dayjs';

import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Search as SearchIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Book as NotesIcon,
  Add as AddIcon
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';

const AdminDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const { user } = useAuthStore();
  const activeTheme = user?.profile?.theme || 'Classic';
  const themePalette = themePalettes[activeTheme] || themePalettes.Classic;
  const primaryColor = themePalette.primary.main;

  const [users, setUsers] = useState([]);
  const [globalAttributes, setGlobalAttributes] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingAttributes, setIsLoadingAttributes] = useState(false);
  const [error, setError] = useState('');

  // We no longer need user list filters or infinite scroll state

  // New Attribute Form
  const [newAttrName, setNewAttrName] = useState('');
  const [newAttrCategory, setNewAttrCategory] = useState('General');
  const [newAttrDesc, setNewAttrDesc] = useState('');
  const [isSavingAttribute, setIsSavingAttribute] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastSeverity, setToastSeverity] = useState('success');
  const [countryPage, setCountryPage] = useState(1);

  // Global Attributes filters
  const [attrSearch, setAttrSearch] = useState('');
  const [attrCategoryFilter, setAttrCategoryFilter] = useState('All');



  useEffect(() => {
    fetchUsers();
    fetchGlobalAttributes();
  }, []);

  // Fetch all users with basic usage counts
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    setError('');
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.users);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch users list');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Fetch all global character attributes to list
  const fetchGlobalAttributes = async () => {
    setIsLoadingAttributes(true);
    try {
      // Standard characters endpoint returns both global and custom (but since we are admin, we want to know current list)
      const response = await api.get('/characters');
      // Filter only global ones (where isCustom is false or userId is null)
      // Since response maps fields, we can just use the returned list
      setGlobalAttributes(response.data.characters.filter(c => !c.isCustom));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAttributes(false);
    }
  };



  // Handle adding new global attribute
  const handleCreateGlobalAttribute = async (e) => {
    e.preventDefault();
    setToastMsg('');
    
    if (!newAttrName.trim()) {
      setToastMsg('Attribute name is required');
      setToastSeverity('error');
      return;
    }

    setIsSavingAttribute(true);
    try {
      const response = await api.post('/admin/attributes', {
        name: newAttrName.trim(),
        category: newAttrCategory,
        description: newAttrDesc.trim()
      });

      setToastMsg(response.data.message || 'Global attribute created successfully!');
      setToastSeverity('success');
      setNewAttrName('');
      setNewAttrDesc('');
      fetchGlobalAttributes();
      fetchUsers(); // Refresh counts if needed
    } catch (err) {
      console.error(err);
      setToastMsg(err.response?.data?.message || 'Failed to create global attribute');
      setToastSeverity('error');
    } finally {
      setIsSavingAttribute(false);
    }
  };

  // Generate registration trend chronologically with dynamic aggregation
  const getRegistrationTrendData = () => {
    if (users.length === 0) return [];
    
    // Sort users by createdAt oldest first
    const sortedUsers = [...users].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const firstDate = dayjs(sortedUsers[0].createdAt);
    const lastDate = dayjs(sortedUsers[sortedUsers.length - 1].createdAt);
    const daySpan = lastDate.diff(firstDate, 'day');

    const counts = {};
    
    if (daySpan <= 35) {
      // Group by day
      sortedUsers.forEach(u => {
        const dateStr = dayjs(u.createdAt).format('MMM DD');
        counts[dateStr] = (counts[dateStr] || 0) + 1;
      });
    } else if (daySpan <= 365) {
      // Group by week
      sortedUsers.forEach(u => {
        const dateStr = dayjs(u.createdAt).startOf('week').format('MMM DD');
        counts[dateStr] = (counts[dateStr] || 0) + 1;
      });
    } else {
      // Group by month
      sortedUsers.forEach(u => {
        const dateStr = dayjs(u.createdAt).startOf('month').format('MMM YYYY');
        counts[dateStr] = (counts[dateStr] || 0) + 1;
      });
    }

    return Object.keys(counts).map(date => ({
      date,
      count: counts[date]
    }));
  };

  // Generate age group distribution
  const getAgeDistributionData = () => {
    const groups = {
      '15–20': 0,
      '20–25': 0,
      '25–30': 0,
      '30–40': 0,
      '40–50': 0,
      '50–60': 0,
      'Above 60': 0,
      'N/A': 0
    };
    
    users.forEach(u => {
      const age = u.profile?.ageGroup || 'N/A';
      if (groups[age] !== undefined) {
        groups[age]++;
      } else {
        groups['N/A']++;
      }
    });
    
    return Object.keys(groups).map(name => ({
      name,
      count: groups[name]
    }));
  };

  // Country code mapping dictionary
  const countryNameMap = {
    in: 'India',
    us: 'United States',
    ca: 'Canada',
    gb: 'United Kingdom',
    au: 'Australia',
    de: 'Germany',
    fr: 'France',
    jp: 'Japan',
    cn: 'China',
    br: 'Brazil',
    za: 'South Africa',
    ru: 'Russia',
    mx: 'Mexico',
    it: 'Italy',
    es: 'Spain',
    sg: 'Singapore',
    ae: 'United Arab Emirates',
    sa: 'Saudi Arabia',
    my: 'Malaysia',
    id: 'Indonesia',
    nl: 'Netherlands',
    ch: 'Switzerland',
    se: 'Sweden',
    no: 'Norway',
    nz: 'New Zealand'
  };

  const getCountryName = (code) => {
    if (!code || code === 'unknown') return 'Unknown Location';
    return countryNameMap[code.toLowerCase()] || code.toUpperCase();
  };

  // Generate country distribution for map
  const getCountryDistributionForMap = () => {
    const counts = {};
    users.forEach(u => {
      let country = u.profile?.country || 'unknown';
      country = country.trim().toLowerCase();
      if (country && country !== 'unknown') {
        counts[country] = (counts[country] || 0) + 1;
      }
    });
    
    return Object.entries(counts).map(([country, value]) => ({
      country,
      value
    }));
  };

  // Generate country distribution for list
  const getCountryDistribution = () => {
    const counts = {};
    users.forEach(u => {
      let country = u.profile?.country || 'unknown';
      country = country.trim().toLowerCase();
      counts[country] = (counts[country] || 0) + 1;
    });
    
    return Object.entries(counts)
      .map(([code, count]) => ({
        code,
        name: getCountryName(code),
        count
      }))
      .sort((a, b) => b.count - a.count);
  };

  // Filter global attributes list
  const filteredGlobalAttributes = globalAttributes.filter((attr) => {
    const matchesSearch = 
      attr.name?.toLowerCase().includes(attrSearch.toLowerCase()) ||
      attr.description?.toLowerCase().includes(attrSearch.toLowerCase());
    
    const matchesCategory = 
      attrCategoryFilter === 'All' || 
      attr.category === attrCategoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Aggregate stats
  const totalUsersCount = users.length;
  const totalAssessmentsCount = users.reduce((acc, u) => acc + (u._count?.assessments || 0), 0);
  const totalNotesCount = users.reduce((acc, u) => acc + (u._count?.notes || 0), 0);

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Yama': return 'primary';
      case 'Niyama': return 'secondary';
      case 'Custom': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box className="space-y-6">
      {/* Page Header */}
      <Box>
        <Typography variant="h4" className="font-serif font-bold text-slate-800 dark:text-slate-100">
          Admin Dashboard
        </Typography>
        <Typography variant="body2" className="text-slate-500 dark:text-slate-400 mt-1">
          Monitor user progress, view custom metrics, and manage predefined global character attributes.
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Card className="shadow-md bg-white/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-2xl">
            <CardContent className="flex items-center gap-4 p-5">
              <Box className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
                <PeopleIcon className="text-2xl" />
              </Box>
              <Box>
                <Typography variant="body2" className="text-slate-400 font-medium">Total Registered Users</Typography>
                <Typography variant="h5" className="font-bold text-slate-800 dark:text-white mt-0.5">{totalUsersCount}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card className="shadow-md bg-white/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-2xl">
            <CardContent className="flex items-center gap-4 p-5">
              <Box className="p-3 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 rounded-xl">
                <AssessmentIcon className="text-2xl" />
              </Box>
              <Box>
                <Typography variant="body2" className="text-slate-400 font-medium">Total Assessments Submitted</Typography>
                <Typography variant="h5" className="font-bold text-slate-800 dark:text-white mt-0.5">{totalAssessmentsCount}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card className="shadow-md bg-white/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-2xl">
            <CardContent className="flex items-center gap-4 p-5">
              <Box className="p-3 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-xl">
                <NotesIcon className="text-2xl" />
              </Box>
              <Box>
                <Typography variant="body2" className="text-slate-400 font-medium">Total Reflective Notes</Typography>
                <Typography variant="h5" className="font-bold text-slate-800 dark:text-white mt-0.5">{totalNotesCount}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box className="border-b border-slate-200 dark:border-slate-800">
        <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} color="primary">
          <Tab label="Analytics & Trends" className="font-semibold text-sm py-3" />
          <Tab label="Global Attributes Manager" className="font-semibold text-sm py-3" />
        </Tabs>
      </Box>

      {/* ERROR Alerts */}
      {error && (
        <Alert severity="error" className="rounded-xl">
          {error}
        </Alert>
      )}

      {/* Tab 1: User Analytics & Trends */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          {/* Signups Trend Chart */}
          <Grid item xs={12} md={7}>
            <Card className="shadow-md bg-white/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-2xl">
              <CardContent className="p-6">
                <Typography variant="h6" className="font-semibold mb-4 text-slate-700 dark:text-slate-350">
                  User Registration Trend
                </Typography>
                {isLoadingUsers ? (
                  <Box className="flex justify-center items-center h-[260px]">
                    <CircularProgress size={30} />
                  </Box>
                ) : users.length === 0 ? (
                  <Box className="flex justify-center items-center h-[260px] text-slate-400 text-sm">
                    No signup data available.
                  </Box>
                ) : (
                  <Box className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={getRegistrationTrendData()}>
                        <defs>
                          <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                        <XAxis dataKey="date" tickLine={false} tick={{ fontSize: 10 }} />
                        <YAxis allowDecimals={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="count"
                          name="Signups"
                          stroke="#3b82f6"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#colorSignups)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Age Group Distribution Chart */}
          <Grid item xs={12} md={5}>
            <Card className="shadow-md bg-white/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-2xl">
              <CardContent className="p-6">
                <Typography variant="h6" className="font-semibold mb-4 text-slate-700 dark:text-slate-350">
                  Age Group Distribution
                </Typography>
                {isLoadingUsers ? (
                  <Box className="flex justify-center items-center h-[260px]">
                    <CircularProgress size={30} />
                  </Box>
                ) : users.length === 0 ? (
                  <Box className="flex justify-center items-center h-[260px] text-slate-400 text-sm">
                    No age group data available.
                  </Box>
                ) : (
                  <Box className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getAgeDistributionData()}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                        <XAxis dataKey="name" tickLine={false} tick={{ fontSize: 10 }} />
                        <YAxis allowDecimals={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="count" name="Users" fill="#f97316" radius={[6, 6, 0, 0]}>
                          {getAgeDistributionData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#f97316' : '#ea580c'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Location Statistics (World Map & Countries List) */}
          <Grid item xs={12}>
            <Card className="shadow-md bg-white/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-2xl">
              <CardContent className="p-6">
                <Typography variant="h6" className="font-semibold mb-6 text-slate-700 dark:text-slate-350">
                  Global User Distribution
                </Typography>
                
                {isLoadingUsers ? (
                  <Box className="flex justify-center items-center h-[350px]">
                    <CircularProgress size={30} />
                  </Box>
                ) : users.length === 0 ? (
                  <Box className="flex justify-center items-center h-[350px] text-slate-400 text-sm">
                    No location data available.
                  </Box>
                ) : (
                  <Grid container spacing={4} alignItems="flex-start">
                    {/* World Map Visualization */}
                    <Grid item xs={12} md={7} className="w-full">
                      <Box className="w-full max-w-[550px] bg-slate-50 dark:bg-slate-950/40 rounded-xl p-4 border border-slate-100 dark:border-slate-800/60 location-map-container mx-auto">
                        <WorldMap
                          color={primaryColor}
                          backgroundColor="transparent"
                          borderColor="#cbd5e1"
                          title=""
                          valueSuffix=" users"
                          size="responsive"
                          data={getCountryDistributionForMap()}
                        />
                      </Box>
                    </Grid>

                    {/* Country List Breakdown */}
                    <Grid item xs={12} md={5}>
                      <Typography variant="subtitle2" className="font-semibold text-slate-500 dark:text-slate-400 mb-3">
                        Country breakdown
                      </Typography>
                      <Box className="space-y-4 max-h-[320px] overflow-y-auto pr-2">
                        {(() => {
                          const countryList = getCountryDistribution();
                          const countriesPerPage = 5;
                          const totalPages = Math.ceil(countryList.length / countriesPerPage);
                          
                          // Safeguard page bounds in case data size changes dynamically
                          const activePage = Math.min(countryPage, Math.max(1, totalPages));
                          const paginated = countryList.slice((activePage - 1) * countriesPerPage, activePage * countriesPerPage);

                          return (
                            <>
                              {paginated.map((item, index) => {
                                const percentage = Math.round((item.count / users.length) * 100);
                                return (
                                  <Box key={index} className="space-y-1">
                                    <Box className="flex justify-between text-xs font-semibold text-slate-650 dark:text-slate-300">
                                      <span>{item.name} ({item.code.toUpperCase()})</span>
                                      <span>{item.count} {item.count === 1 ? 'user' : 'users'} ({percentage}%)</span>
                                    </Box>
                                    <Box className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                                      <Box 
                                        className="h-full rounded-full transition-all duration-500" 
                                        style={{ width: `${percentage}%`, backgroundColor: primaryColor }} 
                                      />
                                    </Box>
                                  </Box>
                                );
                              })}

                              {totalPages > 1 && (
                                <Box className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                                  <Typography variant="caption" className="text-slate-400 font-medium">
                                    Page {activePage} of {totalPages}
                                  </Typography>
                                  <Box className="flex space-x-2">
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      disabled={activePage === 1}
                                      onClick={() => setCountryPage(p => Math.max(1, p - 1))}
                                      className="text-xs min-w-0 px-2.5 py-0.5 rounded-lg border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    >
                                      Prev
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      disabled={activePage === totalPages}
                                      onClick={() => setCountryPage(p => Math.min(totalPages, p + 1))}
                                      className="text-xs min-w-0 px-2.5 py-0.5 rounded-lg border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    >
                                      Next
                                    </Button>
                                  </Box>
                                </Box>
                              )}
                            </>
                          );
                        })()}
                      </Box>
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 2: Global Attributes Manager */}
      {tabValue === 1 && (
        <Grid container spacing={4}>
          {/* Left Panel: Add Predefined Attribute */}
          <Grid item xs={12} md={5}>
            <Card className="shadow-md rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60">
              <CardContent className="p-6 space-y-4">
                <Box>
                  <Typography variant="h6" className="font-serif font-bold text-slate-800 dark:text-slate-100">
                    Add Global Attribute
                  </Typography>
                  <Typography variant="caption" className="text-slate-400">
                    These virtues instantly populate in the dashboard listings of all users.
                  </Typography>
                </Box>

                <form onSubmit={handleCreateGlobalAttribute} className="space-y-4">
                  <TextField
                    fullWidth
                    label="Virtue Name"
                    placeholder="e.g. Non-violence (Ahimsa), Compassion..."
                    required
                    value={newAttrName}
                    onChange={(e) => setNewAttrName(e.target.value)}
                    slotProps={{
                      input: { className: 'rounded-xl' }
                    }}
                  />

                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={newAttrCategory}
                      onChange={(e) => setNewAttrCategory(e.target.value)}
                      label="Category"
                      className="rounded-xl"
                    >
                      <MenuItem value="Yama">Yama (Restraint)</MenuItem>
                      <MenuItem value="Niyama">Niyama (Observance)</MenuItem>
                      <MenuItem value="General">General Attribute</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="Description"
                    placeholder="Provide a detailed guideline or explanation of the virtue..."
                    multiline
                    rows={4}
                    value={newAttrDesc}
                    onChange={(e) => setNewAttrDesc(e.target.value)}
                    slotProps={{
                      input: { className: 'rounded-xl' }
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isSavingAttribute}
                    className="bg-orange-500 hover:bg-orange-600 rounded-xl py-3 font-semibold shadow-md"
                    startIcon={isSavingAttribute ? <CircularProgress size={18} color="inherit" /> : <AddIcon />}
                  >
                    {isSavingAttribute ? 'Saving Virtue...' : 'Create Global Virtue'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Panel: Predefined Global Attributes List */}
          <Grid item xs={12} md={7}>
            <Card className="shadow-md rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60">
              <CardContent className="p-6 space-y-4">
                <Box>
                  <Typography variant="h6" className="font-serif font-bold text-slate-800 dark:text-slate-100">
                    Existing Global Virtues ({filteredGlobalAttributes.length} / {globalAttributes.length})
                  </Typography>
                  <Typography variant="caption" className="text-slate-400">
                    List of predefined virtues packaged within the database seed.
                  </Typography>
                </Box>

                {/* Filter bar for global virtues */}
                <Box className="flex flex-col sm:flex-row gap-3 items-center">
                  <TextField
                    placeholder="Search virtue name or description..."
                    variant="outlined"
                    size="small"
                    value={attrSearch}
                    onChange={(e) => setAttrSearch(e.target.value)}
                    className="w-full bg-white/50 dark:bg-slate-850/30 rounded-xl"
                    slotProps={{
                      input: {
                        className: 'rounded-xl',
                        startAdornment: (
                          <SearchIcon className="text-slate-400 mr-2" />
                        )
                      }
                    }}
                  />

                  <FormControl size="small" className="min-w-[140px] w-full sm:w-auto">
                    <Select
                      value={attrCategoryFilter}
                      onChange={(e) => setAttrCategoryFilter(e.target.value)}
                      className="rounded-xl"
                    >
                      <MenuItem value="All">All Categories</MenuItem>
                      <MenuItem value="Yama">Yama</MenuItem>
                      <MenuItem value="Niyama">Niyama</MenuItem>
                      <MenuItem value="General">General</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {isLoadingAttributes ? (
                  <Box className="flex justify-center p-6">
                    <CircularProgress size={30} />
                  </Box>
                ) : filteredGlobalAttributes.length === 0 ? (
                  <Paper className="p-8 text-center bg-white/40 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800">
                    <Typography className="text-slate-400 text-sm">No virtues found matching criteria.</Typography>
                  </Paper>
                ) : (
                  <Box className="max-h-[500px] overflow-y-auto pr-1 space-y-2 scrollbar-thin">
                    {filteredGlobalAttributes.map((attr) => (
                      <Paper key={attr.id} className="p-4 flex flex-col justify-between border border-slate-100 dark:border-slate-850 hover:shadow-sm transition-all rounded-xl bg-white dark:bg-slate-900/80">
                        <Box className="flex justify-between items-start gap-2 mb-1.5">
                          <Typography variant="subtitle2" className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                            {attr.name}
                          </Typography>
                          <Chip
                            label={attr.category}
                            size="small"
                            color={getCategoryColor(attr.category)}
                            className="rounded-full text-2xs font-semibold h-5"
                          />
                        </Box>
                        {attr.description && (
                          <Typography variant="body2" className="text-slate-400 text-xs italic line-clamp-2">
                            "{attr.description}"
                          </Typography>
                        )}
                      </Paper>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}


      {/* Floating success/error feedback message */}
      <Snackbar
        open={Boolean(toastMsg)}
        autoHideDuration={4000}
        onClose={() => setToastMsg('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setToastMsg('')} 
          severity={toastSeverity} 
          variant="filled"
          sx={{ 
            width: '100%', 
            borderRadius: '16px', 
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
            bgcolor: toastSeverity === 'error' ? 'error.main' : 'success.main',
            color: '#ffffff',
            fontWeight: 600,
            '& .MuiAlert-icon': {
              color: '#ffffff'
            }
          }}
        >
          {toastMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard;
