import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';

interface FieldUpdateAnalytics {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  averageResponseTime: number;
  mostActiveFields: Array<{ field: string; count: number }>;
  recentActivity: {
    today: number;
    yesterday: number;
    thisWeek: number;
    lastWeek: number;
  };
  performance: {
    fastestSync: number;
    slowestSync: number;
    averagePerDay: number;
  };
}

interface FieldUpdateAnalyticsProps {
  analytics: FieldUpdateAnalytics;
}

export default function FieldUpdateAnalytics({ analytics }: FieldUpdateAnalyticsProps) {
  const successRate = analytics.totalSyncs > 0 
    ? (analytics.successfulSyncs / analytics.totalSyncs) * 100 
    : 0;

  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'primary' }: any) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Icon sx={{ mr: 1, color: `${color}.main` }} />
          <Typography variant="h6" component="h3">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" color={`${color}.main`} gutterBottom>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          <AnalyticsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Field Update Analytics
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Performance metrics and insights for field synchronization
        </Typography>
      </Box>

      <Stack spacing={3}>
        {/* Key Metrics */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <StatCard
            title="Total Syncs"
            value={analytics.totalSyncs.toLocaleString()}
            subtitle="All time synchronizations"
            icon={AssignmentIcon}
            color="primary"
          />
          <StatCard
            title="Success Rate"
            value={`${successRate.toFixed(1)}%`}
            subtitle={`${analytics.successfulSyncs} successful`}
            icon={TrendingUpIcon}
            color="success"
          />
          <StatCard
            title="Avg Response"
            value={`${analytics.averageResponseTime}ms`}
            subtitle="Average sync time"
            icon={SpeedIcon}
            color="info"
          />
        </Stack>

        {/* Recent Activity */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Today</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {analytics.recentActivity.today}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(analytics.recentActivity.today / Math.max(analytics.recentActivity.today, analytics.recentActivity.yesterday, 1)) * 100}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">This Week</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {analytics.recentActivity.thisWeek}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(analytics.recentActivity.thisWeek / Math.max(analytics.recentActivity.thisWeek, analytics.recentActivity.lastWeek, 1)) * 100}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Most Active Fields */}
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Most Active Fields
              </Typography>
              <Stack spacing={1}>
                {analytics.mostActiveFields.slice(0, 5).map((field, index) => (
                  <Box key={field.field} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                      {field.field}
                    </Typography>
                    <Chip 
                      label={field.count} 
                      size="small" 
                      color={index === 0 ? 'primary' : 'default'}
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Stack>

        {/* Performance Metrics */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Performance Metrics
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Fastest Sync
                </Typography>
                <Typography variant="h5" color="success.main">
                  {analytics.performance.fastestSync}ms
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Slowest Sync
                </Typography>
                <Typography variant="h5" color="warning.main">
                  {analytics.performance.slowestSync}ms
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Average Per Day
                </Typography>
                <Typography variant="h5" color="info.main">
                  {analytics.performance.averagePerDay.toFixed(1)}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
