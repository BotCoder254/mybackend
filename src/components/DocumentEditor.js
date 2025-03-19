import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from '@heroicons/react/outline';

export const DocumentEditor = ({ 
  document, 
  schema, 
  onSave, 
  onClose,
  onFileUpload 
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (document) {
      setFormData(document);
    }
  }, [document]);

  const validateField = (field, value) => {
    const fieldSchema = schema.find(f => f.id === field);
    if (!fieldSchema) return '';

    if (fieldSchema.required && !value) {
      return 'This field is required';
    }

    switch (fieldSchema.type) {
      case 'number':
        if (value && isNaN(Number(value))) {
          return 'Please enter a valid number';
        }
        break;
      case 'date':
        if (value && isNaN(Date.parse(value))) {
          return 'Please enter a valid date';
        }
        break;
      case 'boolean':
        if (value !== true && value !== false) {
          return 'Please select a valid boolean value';
        }
        break;
      default:
        break;
    }

    return '';
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleFileChange = async (field, event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const result = await onFileUpload(file);
        handleChange(field, result.url);
      } catch (error) {
        setErrors(prev => ({ ...prev, [field]: error.message }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate all fields
    const newErrors = {};
    schema.forEach(field => {
      const error = validateField(field.id, formData[field.id]);
      if (error) {
        newErrors[field.id] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      setErrors(prev => ({ ...prev, submit: error.message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field) => {
    const value = formData[field.id] || '';
    const error = errors[field.id];

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        );
      case 'boolean':
        return (
          <select
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value === 'true')}
            className={`w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select a value</option>
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        );
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        );
      case 'image':
        return (
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(field.id, e)}
              className="w-full"
            />
            {value && (
              <img
                src={value}
                alt={field.name}
                className="w-32 h-32 object-cover rounded-md"
              />
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                {document ? 'Edit Document' : 'New Document'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {schema.map(field => (
                <div key={field.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.name}
                    {field.required && (
                      <span className="text-red-600 ml-1">*</span>
                    )}
                  </label>
                  {renderField(field)}
                  {errors[field.id] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[field.id]}
                    </p>
                  )}
                </div>
              ))}

              {errors.submit && (
                <p className="text-sm text-red-600">{errors.submit}</p>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-white bg-primary rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}; 