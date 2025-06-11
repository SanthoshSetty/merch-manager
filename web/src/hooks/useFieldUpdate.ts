import { useState, useCallback } from 'react';
import axios from 'axios';

interface FieldState {
  isUpdating: boolean;
  lastUpdated: Date | null;
  hasChanges: boolean;
  error: string | null;
}

interface UseFieldUpdateReturn {
  updateField: (fieldPath: string, value: any) => Promise<void>;
  getFieldState: (fieldPath: string) => FieldState;
  isAnyFieldUpdating: boolean;
}

export function useFieldUpdate(productId: string, onUpdate?: () => void): UseFieldUpdateReturn {
  const [fieldStates, setFieldStates] = useState<Record<string, FieldState>>({});

  const updateFieldState = useCallback((fieldPath: string, updates: Partial<FieldState>) => {
    setFieldStates(prev => ({
      ...prev,
      [fieldPath]: { ...prev[fieldPath], ...updates }
    }));
  }, []);

  const updateField = useCallback(async (fieldPath: string, value: any) => {
    updateFieldState(fieldPath, { 
      isUpdating: true, 
      hasChanges: true, 
      error: null 
    });

    try {
      await axios.patch(`http://localhost:3001/api/products/${productId}/fields`, {
        updates: { [fieldPath]: value },
        updateMask: `attributes.${fieldPath}`
      });

      updateFieldState(fieldPath, {
        isUpdating: false,
        hasChanges: false,
        lastUpdated: new Date(),
        error: null
      });

      onUpdate?.();
    } catch (error: any) {
      updateFieldState(fieldPath, {
        isUpdating: false,
        error: error.response?.data?.error || 'Update failed'
      });
    }
  }, [productId, onUpdate, updateFieldState]);

  const getFieldState = useCallback((fieldPath: string): FieldState => {
    return fieldStates[fieldPath] || {
      isUpdating: false,
      lastUpdated: null,
      hasChanges: false,
      error: null
    };
  }, [fieldStates]);

  const isAnyFieldUpdating = Object.values(fieldStates).some(state => state.isUpdating);

  return { updateField, getFieldState, isAnyFieldUpdating };
}
