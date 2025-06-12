import { useState, useEffect, useCallback } from 'react';
import { type CustomField } from '../components/CustomFieldBuilder';

interface CustomFieldsState {
  definitions: CustomField[];
  values: Record<string, any>;
}

interface UseCustomFieldsReturn {
  customFields: CustomField[];
  customFieldValues: Record<string, any>;
  addCustomField: (field: CustomField) => void;
  updateCustomField: (field: CustomField) => void;
  removeCustomField: (fieldId: string) => void;
  setCustomFieldValue: (fieldId: string, value: any) => void;
  getCustomFieldValue: (fieldId: string) => any;
  validateCustomFields: () => { isValid: boolean; errors: Record<string, string> };
  exportCustomFieldsData: () => CustomFieldsState;
  importCustomFieldsData: (data: CustomFieldsState) => void;
}

export function useCustomFields(productId?: string): UseCustomFieldsReturn {
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});

  // Load custom fields from localStorage on mount
  useEffect(() => {
    try {
      const savedFields = localStorage.getItem('customFieldDefinitions');
      if (savedFields) {
        const fields = JSON.parse(savedFields);
        setCustomFields(fields);
      }

      if (productId) {
        const savedValues = localStorage.getItem(`customFieldValues_${productId}`);
        if (savedValues) {
          const values = JSON.parse(savedValues);
          setCustomFieldValues(values);
        }
      }
    } catch (error) {
      console.error('Error loading custom fields:', error);
    }
  }, [productId]);

  // Save custom field definitions to localStorage
  const saveCustomFields = useCallback((fields: CustomField[]) => {
    try {
      localStorage.setItem('customFieldDefinitions', JSON.stringify(fields));
    } catch (error) {
      console.error('Error saving custom fields:', error);
    }
  }, []);

  // Save custom field values to localStorage
  const saveCustomFieldValues = useCallback((values: Record<string, any>) => {
    if (!productId) return;
    
    try {
      localStorage.setItem(`customFieldValues_${productId}`, JSON.stringify(values));
    } catch (error) {
      console.error('Error saving custom field values:', error);
    }
  }, [productId]);

  const addCustomField = useCallback((field: CustomField) => {
    const newFields = [...customFields, field];
    setCustomFields(newFields);
    saveCustomFields(newFields);
  }, [customFields, saveCustomFields]);

  const updateCustomField = useCallback((updatedField: CustomField) => {
    const newFields = customFields.map(field => 
      field.id === updatedField.id ? updatedField : field
    );
    setCustomFields(newFields);
    saveCustomFields(newFields);
  }, [customFields, saveCustomFields]);

  const removeCustomField = useCallback((fieldId: string) => {
    const newFields = customFields.filter(field => field.id !== fieldId);
    setCustomFields(newFields);
    saveCustomFields(newFields);

    // Also remove the value for this field
    const newValues = { ...customFieldValues };
    delete newValues[fieldId];
    setCustomFieldValues(newValues);
    saveCustomFieldValues(newValues);
  }, [customFields, customFieldValues, saveCustomFields, saveCustomFieldValues]);

  const setCustomFieldValue = useCallback((fieldId: string, value: any) => {
    const newValues = { ...customFieldValues, [fieldId]: value };
    setCustomFieldValues(newValues);
    saveCustomFieldValues(newValues);
  }, [customFieldValues, saveCustomFieldValues]);

  const getCustomFieldValue = useCallback((fieldId: string) => {
    return customFieldValues[fieldId];
  }, [customFieldValues]);

  const validateCustomFields = useCallback(() => {
    const errors: Record<string, string> = {};
    let isValid = true;

    customFields.forEach(field => {
      const value = customFieldValues[field.id];

      // Check required fields
      if (field.required && (!value || value === '')) {
        errors[field.id] = `${field.label} is required`;
        isValid = false;
        return;
      }

      // Skip validation if field is empty and not required
      if (!value && !field.required) return;

      // Type-specific validation
      switch (field.type) {
        case 'text':
        case 'textarea':
          if (typeof value === 'string') {
            if (field.validation?.minLength && value.length < field.validation.minLength) {
              errors[field.id] = `${field.label} must be at least ${field.validation.minLength} characters`;
              isValid = false;
            }
            if (field.validation?.maxLength && value.length > field.validation.maxLength) {
              errors[field.id] = `${field.label} must be no more than ${field.validation.maxLength} characters`;
              isValid = false;
            }
          }
          break;

        case 'number':
          const numValue = parseFloat(value);
          if (isNaN(numValue)) {
            errors[field.id] = `${field.label} must be a valid number`;
            isValid = false;
          } else {
            if (field.validation?.min !== undefined && numValue < field.validation.min) {
              errors[field.id] = `${field.label} must be at least ${field.validation.min}`;
              isValid = false;
            }
            if (field.validation?.max !== undefined && numValue > field.validation.max) {
              errors[field.id] = `${field.label} must be no more than ${field.validation.max}`;
              isValid = false;
            }
          }
          break;

        case 'url':
          try {
            new URL(value);
          } catch {
            errors[field.id] = `${field.label} must be a valid URL`;
            isValid = false;
          }
          break;

        case 'date':
          if (value && isNaN(Date.parse(value))) {
            errors[field.id] = `${field.label} must be a valid date`;
            isValid = false;
          }
          break;
      }
    });

    return { isValid, errors };
  }, [customFields, customFieldValues]);

  const exportCustomFieldsData = useCallback((): CustomFieldsState => {
    return {
      definitions: customFields,
      values: customFieldValues,
    };
  }, [customFields, customFieldValues]);

  const importCustomFieldsData = useCallback((data: CustomFieldsState) => {
    setCustomFields(data.definitions);
    setCustomFieldValues(data.values);
    saveCustomFields(data.definitions);
    saveCustomFieldValues(data.values);
  }, [saveCustomFields, saveCustomFieldValues]);

  return {
    customFields,
    customFieldValues,
    addCustomField,
    updateCustomField,
    removeCustomField,
    setCustomFieldValue,
    getCustomFieldValue,
    validateCustomFields,
    exportCustomFieldsData,
    importCustomFieldsData,
  };
}
