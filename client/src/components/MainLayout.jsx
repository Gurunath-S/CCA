import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  useTheme as useMuiTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ListAlt as ListIcon,
  History as HistoryIcon,
  HelpOutline as HelpIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Spa as SpaIcon,
  Book as JournalIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const drawerWidth = 260;

const MainLayout = ({ children }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { text: 'Dashboard', path: '/', icon: <DashboardIcon /> },
    { text: 'Character Attributes', path: '/characters', icon: <ListIcon /> },
    { text: 'Assessment History', path: '/history', icon: <HistoryIcon /> },
    { text: 'Reflective Journal', path: '/notes', icon: <JournalIcon /> },
    { text: 'Help Section', path: '/help', icon: <HelpIcon /> },
    { text: 'Settings', path: '/settings', icon: <SettingsIcon /> },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ text: 'Admin Panel', path: '/admin', icon: <AdminIcon /> });
  }

  const drawerContent = (
    <Box className="h-full flex flex-col justify-between theme-transition text-slate-100/90">
      <Box>
        {/* Header/Logo */}
        <Box className="p-6 flex items-center gap-3">
          <SpaIcon className="text-orange-500 text-3xl" />
          <Typography variant="h5" className="font-bold tracking-wider font-serif bg-gradient-to-r from-orange-400 via-yellow-500 to-amber-300 bg-clip-text text-transparent">
            Character Coach
          </Typography>
        </Box>
        
        <Divider className="opacity-15 mx-4" />
 
        {/* User Card */}
        <Box className="p-5 flex items-center gap-3">
          <Avatar 
            src={user?.picture} 
            alt={user?.name}
            sx={{ width: 44, height: 44, border: '2px solid rgba(251, 146, 60, 0.5)' }}
          />
          <Box className="overflow-hidden">
            <Typography variant="subtitle2" className="font-semibold truncate text-white">
              {user?.name || 'Guest User'}
            </Typography>
            <Typography variant="caption" className="text-slate-350 block truncate">
              {user?.profile?.ageGroup ? `Age: ${user.profile.ageGroup}` : 'Onboarding Profile'}
            </Typography>
          </Box>
        </Box>
 
        <Divider className="opacity-15 mx-4 mb-4" />
 
        {/* Navigation List */}
        <List className="px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  onClick={() => isMobile && setMobileOpen(false)}
                  className={`rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-orange-500/20 text-orange-400 font-semibold border-l-4 border-orange-500 pl-3' 
                      : 'hover:bg-white/10 text-slate-350 hover:text-white'
                  }`}
                >
                  <ListItemIcon 
                    className={`min-w-[40px] transition-colors ${
                      isActive ? 'text-orange-400' : 'text-slate-400'
                    }`}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} primaryTypographyProps={{ className: 'text-sm font-medium' }} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
 
      {/* Logout button at bottom */}
      <Box className="p-4">
        <Button
          fullWidth
          variant="outlined"
          color="inherit"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          className="rounded-xl border-white/20 text-slate-300 hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10 py-2.5"
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box className="flex min-h-screen bg-themeBg text-themeText theme-transition">
      {/* Sidebar for Desktop */}
      {!isMobile && (
        <Box 
          component="nav" 
          sx={{ width: drawerWidth, flexShrink: 0 }}
          className="h-screen sticky top-0 border-r border-themeBorder bg-themeSidebar"
        >
          {drawerContent}
        </Box>
      )}

      {/* Sidebar Drawer for Mobile */}
      {isMobile && (
        <>
          <AppBar 
            position="fixed" 
            elevation={0}
            className="bg-themeSidebar text-white border-b border-themeBorder"
          >
            <Toolbar className="flex justify-between px-4">
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" className="font-serif font-semibold">
                Character Coach
              </Typography>
              <Avatar 
                src={user?.picture} 
                alt={user?.name}
                sx={{ width: 32, height: 32 }}
                onClick={() => navigate('/settings')}
                className="cursor-pointer"
              />
            </Toolbar>
          </AppBar>
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth, 
                backgroundColor: 'var(--color-bg-sidebar)',
                borderRight: '1px solid var(--color-border)'
              },
            }}
          >
            {drawerContent}
          </Drawer>
        </>
      )}

      {/* Main Content Area */}
      <Box 
        component="main" 
        className={`flex-grow flex flex-col min-h-screen overflow-hidden ${
          isMobile ? 'pt-[64px]' : ''
        }`}
      >
        <Box className="flex-grow p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="h-full flex flex-col"
          >
            {children}
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
