import { Box, Button, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

const LoginPage = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      await login();
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2,
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Merch Manager
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Sign in with your Google account to access your merchant dashboard
          </Typography>
          
          <Box mt={3}>
            <Button
              variant="contained"
              size="large"
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <GoogleIcon />}
              onClick={handleLogin}
              disabled={isLoading}
              sx={{
                backgroundColor: '#4285f4',
                '&:hover': {
                  backgroundColor: '#3367d6',
                },
                py: 1.5,
                px: 4,
                borderRadius: 2,
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign in with Google'}
            </Button>
          </Box>
          
          <Typography variant="caption" display="block" sx={{ mt: 3, opacity: 0.7 }}>
            Secure authentication powered by Google OAuth 2.0
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
