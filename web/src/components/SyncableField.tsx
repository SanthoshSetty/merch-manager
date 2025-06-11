import React, { useState, useEffect } from 'react';
import { TextField, Box, Chip, CircularProgress, Fade, alpha } from '@mui/material';
import { Check, Sync, Error } from '@mui/icons-material';

interface FieldState {
  isUpdating: boolean;
  lastUpdated: Date | null;
  hasChanges: boolean;
  error: string | null;
}

interface SyncableFieldProps {
  fieldPath: string;
  value: any;
  onChange: (value: any) => void;
  syncLabel: string;
  fieldState: FieldState;
  [key: string]: any; // For TextField props
}

export default function SyncableField({
  fieldPath,
  value,
  onChange,
  syncLabel,
  fieldState,
  ...textFieldProps
}: SyncableFieldProps) {
  const [localValue, setLocalValue] = useState(value);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (fieldState.lastUpdated && !fieldState.isUpdating && !fieldState.error) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [fieldState.lastUpdated, fieldState.isUpdating, fieldState.error]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  const getSyncStatus = () => {
    if (fieldState.isUpdating) {
      return (
        <Chip
          icon={<CircularProgress size={16} />}
          label="Syncing..."
          color="primary"
          variant="outlined"
          size="small"
        />
      );
    }

    if (fieldState.error) {
      return (
        <Chip
          icon={<Error />}
          label="Sync Error"
          color="error"
          variant="outlined"
          size="small"
        />
      );
    }

    if (showSuccess) {
      return (
        <Fade in={showSuccess}>
          <Chip
            icon={<Check />}
            label="Synced"
            color="success"
            variant="outlined"
            size="small"
          />
        </Fade>
      );
    }

    if (fieldState.hasChanges) {
      return (
        <Chip
          icon={<Sync />}
          label="Pending"
          color="warning"
          variant="outlined"
          size="small"
        />
      );
    }

    return null;
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <TextField
        {...textFieldProps}
        value={localValue}
        onChange={handleChange}
        error={!!fieldState.error}
        helperText={fieldState.error || textFieldProps.helperText}
        sx={{
          ...textFieldProps.sx,
          '& .MuiOutlinedInput-root': {
            transition: 'all 0.3s ease',
            ...(fieldState.hasChanges && {
              borderColor: alpha('#ed6c02', 0.5),
              backgroundColor: alpha('#ed6c02', 0.05),
            }),
            ...(fieldState.isUpdating && {
              borderColor: alpha('#1976d2', 0.5),
              backgroundColor: alpha('#1976d2', 0.05),
            }),
            ...(showSuccess && {
              borderColor: alpha('#2e7d32', 0.5),
              backgroundColor: alpha('#2e7d32', 0.05),
            }),
          }
        }}
      />
      
      {getSyncStatus() && (
        <Box sx={{ 
          position: 'absolute', 
          top: 8, 
          right: 8, 
          zIndex: 1 
        }}>
          {getSyncStatus()}
        </Box>
      )}
    </Box>
  );
}
