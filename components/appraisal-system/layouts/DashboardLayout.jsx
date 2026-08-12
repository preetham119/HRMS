import { useState } from 'react';
import {
  Box, Drawer, AppBar, Toolbar, Typography, IconButton, List, ListItemButton,
  ListItemIcon, ListItemText, Avatar, Menu, MenuItem, Badge, Divider, InputBase,
  useMediaQuery, Tooltip, Stack, alpha, Button, Paper,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../contexts/ThemeContext';
import { notificationApi, profileApi } from '../services';

const DRAWER_WIDTH = 260;

export default function DashboardLayout({ menuItems, basePath }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const { user, logout } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();

  const { data: notifData, refetch: refetchNotifs } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.list({ limit: 8 }).then((r) => r.data),
    refetchInterval: 60000,
  });

  const handleSearch = async (q) => {
    setSearch(q);
    if (q.length >= 2) {
      const { data } = await profileApi.search(q);
      setSearchResults(data.data);
    } else {
      setSearchResults(null);
    }
  };

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2.5, pb: 2 }}>
        <Typography variant="subtitle2" sx={{ opacity: 0.7, letterSpacing: 1, mb: 0.5 }}>
          ENTERPRISE HRMS
        </Typography>
        <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
          Growth & Appraisal
        </Typography>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />
      <List sx={{ flex: 1, px: 1.5, py: 2 }}>
        {menuItems.map((item) => {
          const selected = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <ListItemButton
              key={item.path}
              selected={selected}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                color: 'rgba(255,255,255,0.85)',
                '&.Mui-selected': {
                  bgcolor: 'rgba(255,255,255,0.18)',
                  color: '#fff',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' },
                },
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: selected ? 700 : 500, fontSize: 14 }} />
            </ListItemButton>
          );
        })}
      </List>
      <Box sx={{ p: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.1)' }}>
          <Avatar
            src={user?.profilePhoto}
            sx={{ width: 40, height: 40, bgcolor: 'rgba(255,255,255,0.25)' }}
          >
            {user?.firstName?.[0]}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700} noWrap>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.75, textTransform: 'capitalize' }}>
              {user?.role}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <IconButton edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 1, display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>

          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              bgcolor: (t) => alpha(t.palette.primary.main, 0.06),
              borderRadius: 2,
              px: 1.5,
              py: 0.5,
              flex: 1,
              maxWidth: 420,
              position: 'relative',
            }}
          >
            <SearchIcon fontSize="small" color="action" />
            <InputBase
              placeholder="Global search..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              sx={{ ml: 1, flex: 1, fontSize: 14 }}
            />
            {searchResults && (
              <Paper
                sx={{
                  position: 'absolute',
                  top: '110%',
                  left: 0,
                  right: 0,
                  zIndex: 20,
                  maxHeight: 300,
                  overflow: 'auto',
                  p: 1,
                }}
              >
                {searchResults.employees?.length === 0 && searchResults.cycles?.length === 0 && (
                  <Typography variant="body2" color="text.secondary" p={1}>No results</Typography>
                )}
                {searchResults.employees?.map((e) => (
                  <MenuItem
                    key={e.id}
                    onClick={() => {
                      navigate(user?.role === 'hr' ? `/hr/reports` : `/manager/team`);
                      setSearchResults(null);
                      setSearch('');
                    }}
                  >
                    <Typography variant="body2">{e.name} — {e.employee_code}</Typography>
                  </MenuItem>
                ))}
                {searchResults.cycles?.map((c) => (
                  <MenuItem key={c.id} onClick={() => { navigate('/hr/cycles'); setSearchResults(null); }}>
                    <Typography variant="body2">Cycle: {c.name}</Typography>
                  </MenuItem>
                ))}
              </Paper>
            )}
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Tooltip title={mode === 'light' ? 'Dark mode' : 'Light mode'}>
            <IconButton onClick={toggleMode} sx={{ mr: 0.5 }}>
              {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>

          <IconButton onClick={(e) => setNotifAnchor(e.currentTarget)} sx={{ mr: 0.5 }}>
            <Badge badgeContent={notifData?.unreadCount || 0} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar src={user?.profilePhoto} sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
              {user?.firstName?.[0]}
            </Avatar>
          </IconButton>

          <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={() => { navigate(`${basePath}/profile`); setAnchorEl(null); }}>
              <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
              My Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { setAnchorEl(null); logout(); }}>
              <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
              Logout
            </MenuItem>
          </Menu>

          <Menu
            anchorEl={notifAnchor}
            open={!!notifAnchor}
            onClose={() => setNotifAnchor(null)}
            PaperProps={{ sx: { width: 340, maxHeight: 400 } }}
          >
            <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography fontWeight={700}>Notifications</Typography>
              <Button
                size="small"
                onClick={async () => {
                  await notificationApi.markAllRead();
                  refetchNotifs();
                }}
              >
                Mark all read
              </Button>
            </Box>
            <Divider />
            {(notifData?.data || []).length === 0 && (
              <Typography variant="body2" color="text.secondary" p={2}>No notifications</Typography>
            )}
            {(notifData?.data || []).map((n) => (
              <MenuItem
                key={n.id}
                onClick={async () => {
                  if (!n.is_read) await notificationApi.markRead(n.id);
                  refetchNotifs();
                  setNotifAnchor(null);
                  if (n.link) {
                    if (String(n.link).includes('self-appraisal')) {
                      await qc.invalidateQueries({ queryKey: ['my-appraisal'] });
                    }
                    navigate(n.link);
                  }
                }}
                sx={{ whiteSpace: 'normal', alignItems: 'flex-start', py: 1.5, bgcolor: n.is_read ? 'transparent' : 'action.hover' }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={n.is_read ? 500 : 700}>{n.title}</Typography>
                  <Typography variant="caption" color="text.secondary">{n.message}</Typography>
                </Box>
              </MenuItem>
            ))}
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8,
          minHeight: '100vh',
          background: (t) =>
            t.palette.mode === 'light'
              ? 'linear-gradient(180deg, #F5F8FC 0%, #EBF2FA 100%)'
              : 'linear-gradient(180deg, #0A1929 0%, #0D2137 100%)',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
