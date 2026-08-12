'use client';

import { Box, Button, Stack, Typography } from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

/**
 * In-app Performance chrome: keeps HRMS left nav (AppShell) and shows
 * Appraisal section tabs + page content in the same tab.
 */
export default function EmbeddedLayout({ menuItems, title = 'Performance' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();

  const goTo = async (path) => {
    if (path.includes('self-appraisal')) {
      await qc.invalidateQueries({ queryKey: ['my-appraisal'] });
    }
    navigate(path);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Box
        sx={{
          borderRadius: '24px',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          px: { xs: 2, sm: 2.5 },
          py: 2,
          boxShadow: '0 2px 12px rgba(21,101,192,0.06)',
        }}
      >
        <Typography variant="overline" color="text.secondary" fontWeight={700} letterSpacing={1.6}>
          Growth & Appraisal
        </Typography>
        <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
          {title}
        </Typography>
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
          sx={{ mt: 2 }}
        >
          {menuItems.map((item) => {
            const selected =
              location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            return (
              <Button
                key={item.path}
                size="small"
                startIcon={item.icon}
                onClick={() => goTo(item.path)}
                variant={selected ? 'contained' : 'outlined'}
                sx={{
                  borderRadius: 999,
                  px: 1.75,
                  textTransform: 'none',
                  fontWeight: 600,
                  ...(selected
                    ? {}
                    : { bgcolor: 'background.paper', borderColor: 'divider', color: 'text.primary' }),
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Stack>
      </Box>

      <Box
        sx={{
          borderRadius: '24px',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          p: { xs: 2, sm: 2.5 },
          minHeight: 480,
          boxShadow: '0 2px 12px rgba(21,101,192,0.04)',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
