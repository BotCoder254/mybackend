import React, { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { 
  DocumentTextIcon,
  CalculatorIcon,
  CheckIcon,
  CalendarIcon,
  PhotoIcon,
  Bars3Icon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const FIELD_TYPES = [
  { id: 'text', name: 'Text', icon: DocumentTextIcon },
  { id: 'number', name: 'Number', icon: CalculatorIcon },
  { id: 'boolean', name: 'Boolean', icon: CheckIcon },
  { id: 'date', name: 'Date', icon: CalendarIcon },
  { id: 'image', name: 'Image', icon: PhotoIcon }
];

const getFieldTypeIcon = (type) => {
  switch (type) {
    case 'string':
      return DocumentTextIcon;
    case 'number':
      return CalculatorIcon;
    case 'boolean':
      return CheckIcon;
    case 'date':
      return CalendarIcon;
    case 'image':
      return PhotoIcon;
    default:
      return DocumentTextIcon;
  }
};

export const SchemaManager = ({ schema, onUpdate }) => {
  const [fields, setFields] = useState(schema || []);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');
  const [isRequired, setIsRequired] = useState(false);

  const handleAddField = () => {
    if (newFieldName.trim()) {
      const newField = {
        id: newFieldName.toLowerCase().replace(/\s+/g, '_'),
        name: newFieldName,
        type: newFieldType,
        required: isRequired
      };

      setFields([...fields, newField]);
      setNewFieldName('');
      setNewFieldType('text');
      setIsRequired(false);
      onUpdate([...fields, newField]);
    }
  };

  const handleRemoveField = (index) => {
    const updatedFields = fields.filter((_, i) => i !== index);
    setFields(updatedFields);
    onUpdate(updatedFields);
  };

  const handleReorder = (newOrder) => {
    setFields(newOrder);
    onUpdate(newOrder);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Schema Fields
        </h3>

        {/* Add New Field Form */}
        <div className="flex items-end space-x-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Field Name
            </label>
            <input
              type="text"
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              placeholder="Enter field name"
            />
          </div>
          <div className="w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={newFieldType}
              onChange={(e) => setNewFieldType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            >
              {FIELD_TYPES.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="required"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="required" className="ml-2 text-sm text-gray-700">
              Required
            </label>
          </div>
          <button
            onClick={handleAddField}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Field
          </button>
        </div>

        {/* Fields List */}
        <Reorder.Group axis="y" values={fields} onReorder={handleReorder}>
          {fields.map((field, index) => (
            <Reorder.Item
              key={field.id}
              value={field}
              className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg mb-2"
            >
              <Bars3Icon className="h-5 w-5 text-gray-400 cursor-move" />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  {getFieldTypeIcon(field.type) && (
                    <div className="h-5 w-5 text-gray-500">
                      {React.createElement(getFieldTypeIcon(field.type))}
                    </div>
                  )}
                  <span className="font-medium text-gray-900">{field.name}</span>
                  {field.required && (
                    <span className="text-xs text-red-600">Required</span>
                  )}
                </div>
                <span className="text-sm text-gray-500">{field.type}</span>
              </div>
              <button
                onClick={() => handleRemoveField(index)}
                className="text-red-600 hover:text-red-900"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>
    </div>
  );
}; 