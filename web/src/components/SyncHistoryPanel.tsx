import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Chip,
  Paper,
  Divider,
} from '@mui/material';
import {
  History as HistoryIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

interface SyncHistoryItem {
  id: string;
  timestamp: Date;
  field: string;
  oldValue: any;
  newValue: any;
  status: 'success' | 'error' | 'pending';
  error?: string;
}

interface SyncHistoryPanelProps {
  history: SyncHistoryItem[];
  onClearHistory: () => void;
  onRefreshHistory: () => void;
}

export default function SyncHistoryPanel({ 
  history, 
  onClearHistory, 
  onRefreshHistory 
}: SyncHistoryPanelProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'pending':
        return <ScheduleIcon color="warning" />;
      default:
        return <HistoryIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Sync History
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button
            size="small"
            startIcon={<RefreshIcon />}
            onClick={onRefreshHistory}
          >
            Refresh
          </Button>
          <Button
            size="small"
            startIcon={<ClearIcon />}
            onClick={onClearHistory}
            disabled={history.length === 0}
          >
            Clear History
          </Button>
        </Box>
      </Box>

      {history.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <HistoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            No sync history available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Field updates will appear here once you start making changes
          </Typography>
        </Paper>
      ) : (
        <List>
          {history.map((item, index) => (
            <React.Fragment key={item.id}>
              <ListItem>
                <ListItemIcon>
                  {getStatusIcon(item.status)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1">
                        {item.field}
                      </Typography>
                      <Chip
                        label={item.status}
                        color={getStatusColor(item.status) as any}
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {item.timestamp.toLocaleString()}
                      </Typography>
                      {item.oldValue !== item.newValue && (
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          <span style={{ textDecoration: 'line-through', color: '#999' }}>
                            {String(item.oldValue)}
                          </span>
                          {' → '}
                          <span style={{ fontWeight: 'bold' }}>
                            {String(item.newValue)}
                          </span>
                        </Typography>
                      )}
                      {item.error && (
                        <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
                          Error: {item.error}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
              {index < history.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
}
