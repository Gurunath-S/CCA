import React, { useEffect, useState } from 'react';
import { api } from '../store/useAuthStore';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TableHead,
  Paper,
  Avatar,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Skeleton
} from '@mui/material';
import {
  Search as SearchIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Book as NotesIcon,
  Add as AddIcon
} from '@mui/icons-material';

const AdminDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [globalAttributes, setGlobalAttributes] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingAttributes, setIsLoadingAttributes] = useState(false);
  const [error, setError] = useState('');

  // User list filters
  const [userSearch, setUserSearch] = useState('');
  const [userAgeFilter, setUserAgeFilter] = useState('All');

  // Infinite scroll state
  const [userPage, setUserPage] = useState(0);
  const userRowsPerPage = 8; // fixed page size for infinite scroll
  const [displayedUsers, setDisplayedUsers] = useState([]);
  const [isScrollLoading, setIsScrollLoading] = useState(false);
  const tableContainerRef = React.useRef(null);

  // New Attribute Form
  const [newAttrName, setNewAttrName] = useState('');
  const [newAttrCategory, setNewAttrCategory] = useState('General');
  const [newAttrDesc, setNewAttrDesc] = useState('');
  const [isSavingAttribute, setIsSavingAttribute] = useState(false);
  const [attrError, setAttrError] = useState('');
  const [attrSuccess, setAttrSuccess] = useState('');

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
    setAttrError('');
    setAttrSuccess('');
    
    if (!newAttrName.trim()) {
      setAttrError('Attribute name is required');
      return;
    }

    setIsSavingAttribute(true);
    try {
      const response = await api.post('/admin/attributes', {
        name: newAttrName.trim(),
        category: newAttrCategory,
        description: newAttrDesc.trim()
      });

      setAttrSuccess(response.data.message || 'Global attribute created successfully!');
      setNewAttrName('');
      setNewAttrDesc('');
      fetchGlobalAttributes();
      fetchUsers(); // Refresh counts if needed
    } catch (err) {
      console.error(err);
      setAttrError(err.response?.data?.message || 'Failed to create global attribute');
    } finally {
      setIsSavingAttribute(false);
    }
  };

  // Filter local users list
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase());
    
    const matchesAge = 
      userAgeFilter === 'All' || 
      u.profile?.ageGroup === userAgeFilter;

    return matchesSearch && matchesAge;
  });

  // Handle container scroll for infinite scroll pagination
  const handleScroll = (e) => {
    const container = e.currentTarget;
    if (!container) return;

    // Check if scroll position is near the bottom
    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;

    if (isAtBottom && !isLoadingUsers && !isScrollLoading && displayedUsers.length < filteredUsers.length) {
      setIsScrollLoading(true);
      setTimeout(() => {
        setUserPage((prevPage) => prevPage + 1);
        setIsScrollLoading(false);
      }, 500); // simulated load delay for premium skeleton loading transition
    }
  };

  // Reset page and displayed users when search parameters or complete list of users changes
  useEffect(() => {
    setUserPage(0);
    setDisplayedUsers(filteredUsers.slice(0, userRowsPerPage));
  }, [userSearch, userAgeFilter, users]);

  // Load more users when page increases
  useEffect(() => {
    if (userPage > 0) {
      setDisplayedUsers(filteredUsers.slice(0, (userPage + 1) * userRowsPerPage));
    }
  }, [userPage, filteredUsers]);

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
          <Tab label="All Users" className="font-semibold text-sm py-3" />
          <Tab label="Global Attributes Manager" className="font-semibold text-sm py-3" />
        </Tabs>
      </Box>

      {/* ERROR Alerts */}
      {error && (
        <Alert severity="error" className="rounded-xl">
          {error}
        </Alert>
      )}

      {/* Tab 1: Users & Usage */}
      {tabValue === 0 && (
        <Box className="space-y-4">
          {/* User Filtering Tools */}
          <Card className="shadow-sm border border-slate-100 dark:border-slate-800">
            <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
              <TextField
                placeholder="Search by name or email..."
                variant="outlined"
                size="small"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full md:max-w-md bg-white/50 dark:bg-slate-800/30 rounded-xl"
                slotProps={{
                  input: {
                    className: 'rounded-xl',
                    startAdornment: (
                      <SearchIcon className="text-slate-400 mr-2" />
                    )
                  }
                }}
              />

              <Box className="flex items-center gap-2 w-full md:w-auto">
                <FormControl size="small" className="min-w-[150px] w-full md:w-auto">
                  <InputLabel>Age Group</InputLabel>
                  <Select
                    value={userAgeFilter}
                    onChange={(e) => setUserAgeFilter(e.target.value)}
                    label="Age Group"
                    className="rounded-xl"
                  >
                    <MenuItem value="All">All Age Groups</MenuItem>
                    <MenuItem value="15–20">15–20</MenuItem>
                    <MenuItem value="20–25">20–25</MenuItem>
                    <MenuItem value="25–30">25–30</MenuItem>
                    <MenuItem value="30–40">30–40</MenuItem>
                    <MenuItem value="40–50">40–50</MenuItem>
                    <MenuItem value="50–60">50–60</MenuItem>
                    <MenuItem value="Above 60">Above 60</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </CardContent>
          </Card>
          
          {/* Users Table */}
          <TableContainer
            component={Paper}
            className="shadow-md rounded-2xl border border-slate-100 dark:border-slate-800 max-h-[550px] overflow-y-auto scrollbar-thin"
            ref={tableContainerRef}
            onScroll={handleScroll}
          >
            <Table>
              <TableHead className="bg-slate-50 dark:bg-slate-900/50">
                <TableRow>
                  <TableCell className="font-semibold text-slate-600 dark:text-slate-300">User</TableCell>
                  <TableCell className="font-semibold text-slate-600 dark:text-slate-300">Role</TableCell>
                  <TableCell className="font-semibold text-slate-600 dark:text-slate-300">Age Group</TableCell>
                  <TableCell className="font-semibold text-slate-600 dark:text-slate-300">Date Joined</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoadingUsers
                  ? Array.from({ length: userRowsPerPage }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Box className="flex items-center gap-3">
                            <Skeleton variant="circular" width={38} height={38} />
                            <Box className="flex flex-col gap-1">
                              <Skeleton variant="text" width={120} height={14} />
                              <Skeleton variant="text" width={160} height={12} />
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell><Skeleton variant="rounded" width={60} height={22} /></TableCell>
                        <TableCell><Skeleton variant="text" width={70} height={14} /></TableCell>
                        <TableCell><Skeleton variant="text" width={90} height={14} /></TableCell>
                      </TableRow>
                    ))
                  : displayedUsers.length === 0
                  ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-10 text-slate-400">
                          No users match the search criteria.
                        </TableCell>
                      </TableRow>
                    )
                  : displayedUsers.map((userItem) => (
                      <TableRow
                        key={userItem.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/25 transition-colors cursor-default"
                      >
                        <TableCell>
                          <Box className="flex items-center gap-3">
                            <Avatar src={userItem.picture} alt={userItem.name} sx={{ width: 38, height: 38 }} />
                            <Box>
                              <Typography className="font-semibold text-sm text-slate-800 dark:text-slate-200">{userItem.name || 'Anonymous'}</Typography>
                              <Typography variant="caption" className="text-slate-400 block">{userItem.email}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={userItem.role}
                            size="small"
                            color={userItem.role === 'ADMIN' ? 'error' : 'default'}
                            className="rounded-full text-xs font-semibold"
                          />
                        </TableCell>
                        <TableCell className="text-sm font-medium text-slate-600 dark:text-slate-400">{userItem.profile?.ageGroup || 'N/A'}</TableCell>
                        <TableCell className="text-sm text-slate-500 dark:text-slate-400">
                          {new Date(userItem.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </TableCell>
                      </TableRow>
                    ))
                }
                {/* Simulated scroll loading skeleton rows */}
                {!isLoadingUsers && isScrollLoading && Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={`scroll-skeleton-${i}`}>
                    <TableCell>
                      <Box className="flex items-center gap-3">
                        <Skeleton variant="circular" width={38} height={38} />
                        <Box className="flex flex-col gap-1">
                          <Skeleton variant="text" width={120} height={14} />
                          <Skeleton variant="text" width={160} height={12} />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell><Skeleton variant="rounded" width={60} height={22} /></TableCell>
                    <TableCell><Skeleton variant="text" width={70} height={14} /></TableCell>
                    <TableCell><Skeleton variant="text" width={90} height={14} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
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

                {attrError && (
                  <Alert severity="error" className="rounded-xl">
                    {attrError}
                  </Alert>
                )}
                {attrSuccess && (
                  <Alert severity="success" className="rounded-xl">
                    {attrSuccess}
                  </Alert>
                )}

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


    </Box>
  );
};

export default AdminDashboard;
