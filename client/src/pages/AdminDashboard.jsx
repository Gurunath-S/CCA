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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  List,
  ListItem,
  Skeleton,
  TablePagination
} from '@mui/material';
import {
  Search as SearchIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Book as NotesIcon,
  Close as CloseIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  ChevronRight as ArrowRightIcon
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

  // User table pagination
  const [userPage, setUserPage] = useState(0);
  const [userRowsPerPage, setUserRowsPerPage] = useState(8);

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

  // User detail dialog
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [detailCategoryFilter, setDetailCategoryFilter] = useState('All');
  const [detailMinScoreFilter, setDetailMinScoreFilter] = useState('All');

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

  // Fetch detailed data for a specific inspected user
  const fetchUserDetail = async (userId, category = 'All', minScore = 'All') => {
    setIsLoadingDetail(true);
    setDetailError('');
    try {
      let url = `/admin/users/${userId}`;
      const params = [];
      if (category && category !== 'All') params.push(`category=${category}`);
      if (minScore && minScore !== 'All') params.push(`minScore=${minScore}`);
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      const response = await api.get(url);
      setUserDetail(response.data);
    } catch (err) {
      console.error(err);
      setDetailError(err.response?.data?.message || 'Failed to fetch user details');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Handle click on user row to inspect
  const handleInspectUser = (userId) => {
    setSelectedUserId(userId);
    setDetailCategoryFilter('All');
    setDetailMinScoreFilter('All');
    fetchUserDetail(userId);
  };

  // Refetch user detail on filter change
  useEffect(() => {
    if (selectedUserId) {
      fetchUserDetail(selectedUserId, detailCategoryFilter, detailMinScoreFilter);
    }
  }, [detailCategoryFilter, detailMinScoreFilter, selectedUserId]);

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

  // Paginated slice of filtered users
  const paginatedUsers = filteredUsers.slice(
    userPage * userRowsPerPage,
    userPage * userRowsPerPage + userRowsPerPage
  );

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
          <TableContainer component={Paper} className="shadow-md rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
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
                  : paginatedUsers.length === 0
                  ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-10 text-slate-400">
                          No users match the search criteria.
                        </TableCell>
                      </TableRow>
                    )
                  : paginatedUsers.map((userItem) => (
                      <TableRow
                        key={userItem.id}
                        onClick={() => handleInspectUser(userItem.id)}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/25 transition-colors cursor-pointer"
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
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 8, 15, 25]}
              component="div"
              count={filteredUsers.length}
              rowsPerPage={userRowsPerPage}
              page={userPage}
              onPageChange={(e, newPage) => setUserPage(newPage)}
              onRowsPerPageChange={(e) => {
                setUserRowsPerPage(parseInt(e.target.value, 10));
                setUserPage(0);
              }}
              className="border-t border-slate-100 dark:border-slate-800 text-slate-500 text-xs"
            />
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

      {/* User Inspection Modal (Detail Dialog) */}
      <Dialog
        open={selectedUserId !== null}
        onClose={() => setSelectedUserId(null)}
        container={() => document.getElementById('root')}
        maxWidth="md"
        fullWidth
        scroll="paper"
        PaperProps={{
          className: 'rounded-3xl shadow-xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-100 dark:border-slate-900'
        }}
      >
        <DialogTitle className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-900">
          <Box className="flex items-center gap-3">
            <Avatar src={userDetail?.user?.picture} alt={userDetail?.user?.name} sx={{ width: 44, height: 44, border: '2px solid rgba(251, 146, 60, 0.5)' }} />
            <Box>
              <Typography variant="h6" className="font-bold text-slate-800 dark:text-slate-250 leading-tight">
                Inspect: {userDetail?.user?.name || 'Anonymous'}
              </Typography>
              <Typography variant="caption" className="text-slate-400 block font-normal mt-0.5">
                {userDetail?.user?.email} • Joined {userDetail?.user && new Date(userDetail.user.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setSelectedUserId(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent className="p-6 space-y-6">
          {isLoadingDetail ? (
            <Box className="flex justify-center p-12">
              <CircularProgress />
            </Box>
          ) : detailError ? (
            <Alert severity="error" className="rounded-xl">
              {detailError}
            </Alert>
          ) : (
            <Grid container spacing={4}>
              {/* Assessments Sub-Section */}
              <Grid item xs={12} md={7} className="space-y-4">
                <Box className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <Typography variant="subtitle1" className="font-serif font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <AssessmentIcon className="text-orange-500" />
                    Assessments ({userDetail?.assessments?.length || 0})
                  </Typography>

                  {/* Filter elements inside inspection modal */}
                  <Box className="flex items-center gap-2">
                    <FormControl size="small" className="min-w-[110px]">
                      <Select
                        value={detailCategoryFilter}
                        onChange={(e) => setDetailCategoryFilter(e.target.value)}
                        className="rounded-lg text-xs"
                      >
                        <MenuItem value="All">All Categories</MenuItem>
                        <MenuItem value="Yama">Yama</MenuItem>
                        <MenuItem value="Niyama">Niyama</MenuItem>
                        <MenuItem value="General">General</MenuItem>
                        <MenuItem value="Custom">Custom</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl size="small" className="min-w-[100px]">
                      <Select
                        value={detailMinScoreFilter}
                        onChange={(e) => setDetailMinScoreFilter(e.target.value)}
                        className="rounded-lg text-xs"
                      >
                        <MenuItem value="All">All Scores</MenuItem>
                        <MenuItem value="5">Score 5</MenuItem>
                        <MenuItem value="4">Score 4+</MenuItem>
                        <MenuItem value="3">Score 3+</MenuItem>
                        <MenuItem value="2">Score 2+</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>

                <Divider className="opacity-10" />

                {userDetail?.assessments?.length === 0 ? (
                  <Paper className="p-8 text-center bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    <Typography variant="body2" className="text-slate-400 font-medium">No assessments recorded with these filters.</Typography>
                  </Paper>
                ) : (
                  <Box className="space-y-3 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
                    {userDetail?.assessments?.map((a) => (
                      <Card key={a.id} className="shadow-xs border border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-900/40 rounded-2xl hover:border-slate-200 dark:hover:border-slate-800 transition-all">
                        <CardContent className="p-4 space-y-2.5">
                          <Box className="flex justify-between items-start gap-2">
                            <Box>
                              <Typography variant="subtitle2" className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                                {a.character?.name}
                              </Typography>
                              <Typography variant="caption" className="text-slate-400 block mt-0.5">
                                {new Date(a.assessmentDate).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <Chip
                              label={`Score: ${a.alignmentScore}/5`}
                              size="small"
                              color={a.alignmentScore >= 4 ? 'success' : a.alignmentScore >= 3 ? 'primary' : 'warning'}
                              className="rounded-full text-xs font-bold"
                            />
                          </Box>
                          
                          <Grid container spacing={1.5} className="text-xs bg-slate-50/70 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-900/60">
                            <Grid item xs={12} sm={6}>
                              <span className="text-slate-400 block font-medium">Others Recognize:</span>
                              <span className="text-slate-600 dark:text-slate-350 font-semibold">{a.othersRecognize}</span>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <span className="text-slate-400 block font-medium">Conscious Effort:</span>
                              <span className="text-slate-600 dark:text-slate-350 font-semibold">{a.consciousEffort ? 'Yes' : 'No'}</span>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <span className="text-slate-400 block font-medium">Effort Level:</span>
                              <span className="text-slate-600 dark:text-slate-350 font-semibold line-clamp-1">{a.effortLevel}</span>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <span className="text-slate-400 block font-medium">Practice Frequency:</span>
                              <span className="text-slate-600 dark:text-slate-350 font-semibold">{a.practiceFrequency}</span>
                            </Grid>
                          </Grid>

                          {a.personalNote && (
                            <Box className="bg-orange-50/30 dark:bg-orange-950/10 p-2.5 rounded-xl border border-orange-100/30 dark:border-orange-900/10 italic text-xs text-slate-500 dark:text-slate-400 max-h-16 overflow-y-auto scrollbar-thin">
                              "{a.personalNote}"
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </Grid>

              {/* Reflective Journal Entries Sub-Section */}
              <Grid item xs={12} md={5} className="space-y-4">
                <Typography variant="subtitle1" className="font-serif font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <NotesIcon className="text-orange-500" />
                  Reflective Journal ({userDetail?.notes?.length || 0})
                </Typography>

                <Divider className="opacity-10" />

                {userDetail?.notes?.length === 0 ? (
                  <Paper className="p-8 text-center bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    <Typography variant="body2" className="text-slate-400 font-medium">No journal entries recorded.</Typography>
                  </Paper>
                ) : (
                  <Box className="space-y-3 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
                    {userDetail?.notes?.map((n) => (
                      <Card key={n.id} className="shadow-xs border border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-900/40 rounded-2xl">
                        <CardContent className="p-4 space-y-2">
                          <Box className="flex justify-between items-start gap-2">
                            <Typography variant="subtitle2" className="font-semibold text-slate-850 dark:text-slate-200 leading-tight">
                              {n.character?.name}
                            </Typography>
                            <Typography variant="caption" className="text-slate-400 shrink-0">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Typography variant="body2" className="text-slate-600 dark:text-slate-350 text-xs leading-relaxed whitespace-pre-wrap">
                            {n.content}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions className="p-4 border-t border-slate-100 dark:border-slate-900">
          <Button onClick={() => setSelectedUserId(null)} variant="contained" className="bg-orange-500 hover:bg-orange-600 rounded-xl">
            Close Overview
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
