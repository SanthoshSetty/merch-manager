import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline
} from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProductListPage from './components/ProductListPage';
import ProductDetailPage from './components/ProductDetailPage';
import CompetitiveAnalysisPage from './components/CompetitiveAnalysisPage';
import ExperimentalCompetitiveAnalysisPage from './components/ExperimentalCompetitiveAnalysisPage';
import SuperIntelligentAnalysisPage from './components/SuperIntelligentAnalysisPage';

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
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<ProductListPage />} />
          <Route path="/product/:productId" element={<ProductDetailPage />} />
          <Route path="/competitive-analysis" element={<CompetitiveAnalysisPage />} />
          <Route path="/experimental-competitive-analysis" element={<ExperimentalCompetitiveAnalysisPage />} />
          <Route path="/super-intelligent-analysis" element={<SuperIntelligentAnalysisPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
