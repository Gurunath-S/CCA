import React, { useState, Suspense } from 'react';
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
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ListAlt as ListIcon,
  History as HistoryIcon,
  AutoAwesome as InspirationIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Spa as SpaIcon,
  Book as JournalIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { useMemo } from 'react';
import { motion } from 'framer-motion';

const drawerWidth = 260;

const baseNavItems = [
  { text: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { text: 'Character Attributes', path: '/characters', icon: <ListIcon /> },
  { text: 'Assessment History', path: '/history', icon: <HistoryIcon /> },
  { text: 'Reflective Journal', path: '/notes', icon: <JournalIcon /> },
  { text: 'Inspiration', path: '/inspiration', icon: <InspirationIcon /> },
  { text: 'Settings', path: '/settings', icon: <SettingsIcon /> },
];

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

  const navItems = useMemo(() => {
    if (user?.role === 'ADMIN') {
      return [...baseNavItems, { text: 'Admin Panel', path: '/admin', icon: <AdminIcon /> }];
    }
    return baseNavItems;
  }, [user?.role]);

  const drawerContent = useMemo(() => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: 'rgba(248, 250, 252, 0.9)', transition: 'all 0.3s ease' }}>
      <Box>
        {/* Header/Logo */}
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <SpaIcon sx={{ color: '#f97316', fontSize: 32 }} />
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700, 
              letterSpacing: '0.05em',
              fontFamily: '"Playfair Display", serif',
              background: 'linear-gradient(to right, #fb923c, #eab308, #fcd34d)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Character Coach
          </Typography>
        </Box>
        
        <Divider sx={{ opacity: 0.15, mx: 2 }} />
 
        {/* User Card */}
        <Box sx={{ px: 2.5, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar 
            src={user?.picture} 
            alt={user?.name}
            sx={{ width: 44, height: 44, border: '2px solid rgba(251, 146, 60, 0.6)' }}
          />
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user?.name || 'Guest User'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#cbd5e1', display: 'block', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user?.profile?.ageGroup ? `Age: ${user.profile.ageGroup}` : 'Onboarding Profile'}
            </Typography>
          </Box>
        </Box>
 
        <Divider sx={{ opacity: 0.15, mx: 2, mb: 2 }} />
 
        {/* Navigation List */}
        <List sx={{ px: 1.5, py: 0 }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  onClick={() => isMobile && setMobileOpen(false)}
                  sx={{
                    borderRadius: '12px',
                    transition: 'all 0.3s ease',
                    backgroundColor: isActive ? 'rgba(249, 115, 22, 0.18)' : 'transparent',
                    borderLeft: isActive ? '4px solid #f97316' : '4px solid transparent',
                    pl: isActive ? 1.5 : 2,
                    '&:hover': {
                      backgroundColor: isActive ? 'rgba(249, 115, 22, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                    }
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      minWidth: 40, 
                      color: isActive ? '#fb923c' : '#cbd5e1',
                      transition: 'color 0.3s ease'
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      sx: { 
                        fontSize: '0.875rem', 
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? '#fb923c' : '#e2e8f0'
                      } 
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
 
      {/* Logout button at bottom */}
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            borderRadius: '12px',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            color: '#cbd5e1',
            py: 1.25,
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': {
              color: '#f87171',
              borderColor: 'rgba(239, 68, 68, 0.5)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)'
            }
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  ), [user, location.pathname, navItems, isMobile, handleLogout]);

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
            sx={{
              backgroundColor: 'var(--color-bg-sidebar)',
              color: '#ffffff',
              borderBottom: '1px solid var(--color-border)',
              boxShadow: 'none'
            }}
          >
            <Toolbar className="flex justify-between px-4">
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
                aria-label="Toggle navigation menu"
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" className="font-serif font-semibold text-white">
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
            container={() => document.getElementById('root') || document.body}
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: false }}
            sx={{
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth, 
                backgroundColor: 'var(--color-bg-sidebar)',
                color: '#f8fafc',
                borderRight: '1px solid var(--color-border)',
                backgroundImage: 'none'
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="h-full flex flex-col"
          >
            <Suspense fallback={
              <Box className="flex flex-col items-center justify-center min-h-[300px]">
                <CircularProgress className="text-orange-500" />
              </Box>
            }>
              {children}
            </Suspense>
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
