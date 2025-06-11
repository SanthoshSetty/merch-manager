import { useState } from 'react';
import {
  Box,
  Fab,
  Drawer,
  IconButton,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import BulkFieldUpdatePanel from './BulkFieldUpdatePanel';

interface FieldUpdateDashboardProps {
  children: React.ReactNode;
  productId: string;
}

export default function FieldUpdateDashboard({ 
  children, 
  productId 
}: FieldUpdateDashboardProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {children}
      
      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
        onClick={() => setDrawerOpen(true)}
      >
        <DashboardIcon />
      </Fab>

      {/* Dashboard Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', md: 600 },
            maxWidth: '100vw',
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Bulk Field Updates</Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <BulkFieldUpdatePanel
            productId={productId}
            onBulkUpdate={() => {}}
          />
        </Box>
      </Drawer>
    </>
  );
}
