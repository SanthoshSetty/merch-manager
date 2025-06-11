import { ThemeProvider, createTheme, CssBaseline, Box, Typography, Button } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Typography variant="h2" gutterBottom align="center">
          🚀 Google Merchant API Manager
        </Typography>
        <Typography variant="h5" gutterBottom align="center" color="text.secondary">
          Real-time Field Synchronization Interface
        </Typography>
        
        <Box sx={{ mt: 4, p: 4, border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            🎯 Project Successfully Created!
          </Typography>
          <Typography variant="body1" paragraph>
            Your Google Merchant API management interface has been set up with the following features:
          </Typography>
          
          <Box component="ul" sx={{ pl: 2 }}>
            <Typography component="li" variant="body2">
              ✅ Backend: Node.js + Express + TypeScript
            </Typography>
            <Typography component="li" variant="body2">
              ✅ Frontend: React + TypeScript + Vite + Material-UI
            </Typography>
            <Typography component="li" variant="body2">
              ✅ Real-time field synchronization components
            </Typography>
            <Typography component="li" variant="body2">
              ✅ Google Merchant API integration
            </Typography>
            <Typography component="li" variant="body2">
              ✅ Advanced dashboard with analytics
            </Typography>
            <Typography component="li" variant="body2">
              ✅ Bulk operations support
            </Typography>
          </Box>

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            🔧 Next Steps:
          </Typography>
          
          <Box component="ol" sx={{ pl: 2 }}>
            <Typography component="li" variant="body2" paragraph>
              Set up your Google Cloud Project and enable the Merchant API
            </Typography>
            <Typography component="li" variant="body2" paragraph>
              Create a service account and download the credentials
            </Typography>
            <Typography component="li" variant="body2" paragraph>
              Update the .env file with your project details
            </Typography>
            <Typography component="li" variant="body2" paragraph>
              Place your service account key in credentials/service-account-key.json
            </Typography>
            <Typography component="li" variant="body2" paragraph>
              Grant the service account access to your Merchant Center
            </Typography>
          </Box>

          <Button 
            variant="contained" 
            size="large" 
            sx={{ mt: 2 }}
            href="https://console.cloud.google.com/"
            target="_blank"
          >
            Open Google Cloud Console
          </Button>
        </Box>

        <Box sx={{ mt: 4, p: 3, bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            📚 Documentation
          </Typography>
          <Typography variant="body2">
            Check the README.md and FIELD_MAPPINGS.md files for detailed setup instructions and API references.
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
