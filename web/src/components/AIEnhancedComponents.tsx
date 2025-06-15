import React, { memo, useState } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Box,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Link,
  Stack,
} from '@mui/material';
import {
  AutoAwesome as AIIcon,
  OpenInNew as ExternalLinkIcon,
} from '@mui/icons-material';
import { apiClient } from '../config/api';

interface AIEnhancedSelectProps {
  fieldName: string;
  fieldInstructions: string;
  productData: any;
  onFieldChange: (field: string, value: any) => void;
  aiGenerating: any;
  setAiGenerating: (field: string, generating: boolean) => void;
  country?: string;
  children: React.ReactNode;
  [key: string]: any;
}

interface AIEnhancedSwitchProps {
  fieldName: string;
  fieldInstructions: string;
  productData: any;
  onFieldChange: (field: string, value: any) => void;
  aiGenerating: any;
  setAiGenerating: (field: string, generating: boolean) => void;
  country?: string;
  [key: string]: any;
}

// AI-Enhanced Select component
export const AIEnhancedSelect = memo<AIEnhancedSelectProps>(({
  fieldName,
  fieldInstructions,
  productData,
  onFieldChange,
  aiGenerating,
  setAiGenerating,
  country = 'Singapore',
  children,
  ...selectProps
}) => {
  const [showRefinement, setShowRefinement] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');
  const [lastGeneratedContent, setLastGeneratedContent] = useState('');
  const [groundedSources, setGroundedSources] = useState<any[]>([]);

  const generateContent = async (useCustomInstructions = false) => {
    if (!productData.title || !productData.brand) {
      alert('Please fill in product title and brand first');
      return;
    }

    setAiGenerating(fieldName, true);
    
    try {
      const requestBody: any = {
        productName: productData.title,
        brand: productData.brand,
        country: country,
        fieldName,
        fieldInstructions,
        productContext: productData
      };

      if (useCustomInstructions && customInstructions.trim()) {
        requestBody.customInstructions = customInstructions.trim();
      }

      const response = await apiClient.post('/api/ai-content/generate-field', requestBody);

      const result = response.data;
      
      if (result.success) {
        setLastGeneratedContent(result.content);
        setGroundedSources(result.grounded_sources || []);
        
        if (useCustomInstructions) {
          onFieldChange(fieldName, result.content);
          setShowRefinement(false);
        } else {
          setShowRefinement(true);
        }
      } else {
        throw new Error(result.error || 'Failed to generate content');
      }
    } catch (error: any) {
      console.error('AI generation error:', error);
      alert(`Failed to generate content: ${error.message}`);
    } finally {
      setAiGenerating(fieldName, false);
    }
  };

  const acceptGeneration = () => {
    onFieldChange(fieldName, lastGeneratedContent);
    setShowRefinement(false);
  };

  const isGenerating = aiGenerating[fieldName];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
        <FormControl {...selectProps} sx={{ flex: 1 }}>
          <InputLabel>{selectProps.label}</InputLabel>
          <Select {...selectProps}>
            {children}
          </Select>
        </FormControl>
        
        <Tooltip title={`Generate ${fieldName} with AI`}>
          <IconButton
            onClick={() => generateContent()}
            disabled={isGenerating}
            sx={{ 
              color: 'primary.main',
              '&:hover': { 
                backgroundColor: 'primary.light',
                color: 'white'
              }
            }}
          >
            {isGenerating ? (
              <CircularProgress size={20} />
            ) : (
              <AIIcon />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      <Dialog 
        open={showRefinement} 
        onClose={() => setShowRefinement(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AIIcon color="primary" />
          AI Generated {fieldName}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Generated Content:</strong>
              </Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>
                {lastGeneratedContent}
              </Typography>
            </Alert>

            {groundedSources.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Sources:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {groundedSources.map((source, index) => (
                    <Chip
                      key={index}
                      label={source.title || `Source ${index + 1}`}
                      component={Link}
                      href={source.uri}
                      target="_blank"
                      clickable
                      icon={<ExternalLinkIcon />}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Stack>
              </Box>
            )}

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Refine with custom instructions:
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="Add specific instructions to refine the generated content..."
                variant="outlined"
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRefinement(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => generateContent(true)}
            disabled={!customInstructions.trim() || isGenerating}
            variant="outlined"
          >
            {isGenerating ? <CircularProgress size={20} /> : 'Refine'}
          </Button>
          <Button 
            onClick={acceptGeneration}
            variant="contained"
          >
            Accept
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

// AI-Enhanced Switch component
export const AIEnhancedSwitch = memo<AIEnhancedSwitchProps>(({
  fieldName,
  fieldInstructions,
  productData,
  onFieldChange,
  aiGenerating,
  setAiGenerating,
  country = 'Singapore',
  ...switchProps
}) => {
  const [showRefinement, setShowRefinement] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');
  const [lastGeneratedContent, setLastGeneratedContent] = useState('');
  const [predictedValue, setPredictedValue] = useState<boolean | null>(null);
  const [groundedSources, setGroundedSources] = useState<any[]>([]);

  const generateContent = async (useCustomInstructions = false) => {
    if (!productData.title || !productData.brand) {
      alert('Please fill in product title and brand first');
      return;
    }

    setAiGenerating(fieldName, true);
    
    try {
      const requestBody: any = {
        productName: productData.title,
        brand: productData.brand,
        country: country,
        fieldName,
        fieldInstructions,
        productContext: productData
      };

      if (useCustomInstructions && customInstructions.trim()) {
        requestBody.customInstructions = customInstructions.trim();
      }

      const response = await apiClient.post('/api/ai-content/generate-field', requestBody);

      const result = response.data;
      
      if (result.success) {
        setLastGeneratedContent(result.content);
        setGroundedSources(result.grounded_sources || []);
        
        // Convert AI response to boolean
        const booleanValue = convertToBooleanValue(result.content);
        setPredictedValue(booleanValue);
        
        if (useCustomInstructions) {
          onFieldChange(fieldName, booleanValue);
          setShowRefinement(false);
        } else {
          setShowRefinement(true);
        }
      } else {
        throw new Error(result.error || 'Failed to generate content');
      }
    } catch (error: any) {
      console.error('AI generation error:', error);
      alert(`Failed to generate content: ${error.message}`);
    } finally {
      setAiGenerating(fieldName, false);
    }
  };

  const convertToBooleanValue = (content: string): boolean => {
    const lowerContent = content.toLowerCase().trim();
    const positiveWords = ['true', 'yes', 'on', 'enabled', 'active', 'available', 'recommended'];
    const negativeWords = ['false', 'no', 'off', 'disabled', 'inactive', 'unavailable', 'not recommended'];
    
    for (const word of positiveWords) {
      if (lowerContent.includes(word)) return true;
    }
    
    for (const word of negativeWords) {
      if (lowerContent.includes(word)) return false;
    }
    
    return true; // Default to true if unclear
  };

  const acceptGeneration = () => {
    onFieldChange(fieldName, predictedValue);
    setShowRefinement(false);
  };

  const isGenerating = aiGenerating[fieldName];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FormControlLabel 
          control={switchProps.control}
          label={switchProps.label}
          {...(switchProps.control ? {} : switchProps)}
        />
        
        <Tooltip title={`Generate ${fieldName} with AI`}>
          <IconButton
            onClick={() => generateContent()}
            disabled={isGenerating}
            size="small"
            sx={{ 
              color: 'primary.main',
              '&:hover': { 
                backgroundColor: 'primary.light',
                color: 'white'
              }
            }}
          >
            {isGenerating ? (
              <CircularProgress size={16} />
            ) : (
              <AIIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      <Dialog 
        open={showRefinement} 
        onClose={() => setShowRefinement(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AIIcon color="primary" />
          AI Generated {fieldName}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>AI Analysis:</strong>
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                {lastGeneratedContent}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                Predicted Setting: {predictedValue ? 'ON' : 'OFF'}
              </Typography>
            </Alert>

            {groundedSources.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Sources:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {groundedSources.map((source, index) => (
                    <Chip
                      key={index}
                      label={source.title || `Source ${index + 1}`}
                      component={Link}
                      href={source.uri}
                      target="_blank"
                      clickable
                      icon={<ExternalLinkIcon />}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Stack>
              </Box>
            )}

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Refine with custom instructions:
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="Add specific instructions to refine the AI analysis..."
                variant="outlined"
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRefinement(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => generateContent(true)}
            disabled={!customInstructions.trim() || isGenerating}
            variant="outlined"
          >
            {isGenerating ? <CircularProgress size={20} /> : 'Refine'}
          </Button>
          <Button 
            onClick={acceptGeneration}
            variant="contained"
          >
            Accept
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

// Set display names for better debugging
AIEnhancedSelect.displayName = 'AIEnhancedSelect';
AIEnhancedSwitch.displayName = 'AIEnhancedSwitch';
