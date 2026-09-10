import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { InputField } from './InputField';
import { MAX_EDUCATION } from '../constants';
import type { EducationEntry, Errors } from '../types';

interface EducationSectionProps {
  data: EducationEntry[];
  onChange: (field: string, value: string, index: number) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  errors: Errors;
}

export const EducationSection = React.memo(function EducationSection({
  data,
  onChange,
  onAdd,
  onRemove,
  errors,
}: EducationSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {data.map((edu, index) => (
        <motion.div
          key={edu.id}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="p-6 bg-white rounded-2xl border-2 transition-all duration-200 border-stone-200 hover:border-brand-200"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-medium text-gray-800">Education #{index + 1}</h3>
            <button type="button" onClick={() => onRemove(index)} className="p-1 text-red-500 rounded hover:bg-red-50">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputField
              label="Degree/Certificate"
              value={edu.degree}
              onChange={(value) => onChange('degree', value, index)}
              error={errors[`education_${index}_degree`]}
              placeholder="Bachelor of Science in Computer Science"
            />
            <InputField
              label="Institution"
              value={edu.institution}
              onChange={(value) => onChange('institution', value, index)}
              error={errors[`education_${index}_institution`]}
              placeholder="University Name"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2">
            <InputField
              label="Year"
              type="text"
              value={edu.year}
              onChange={(value) => onChange('year', value, index)}
              error={errors[`education_${index}_year`]}
              placeholder="2020 - 2024"
            />
            <InputField
              label="Location (Optional)"
              value={edu.location || ''}
              onChange={(value) => onChange('location', value, index)}
              placeholder="City, Country"
            />
          </div>

          <div className="mt-4">
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Description (Optional)</label>
            <textarea
              value={edu.description || ''}
              onChange={(e) => onChange('description', e.target.value, index)}
              rows={3}
              className="p-2.5 w-full bg-white rounded-lg border-2 transition-all duration-200 border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="Notable achievements, activities, or relevant coursework..."
            />
          </div>
        </motion.div>
      ))}

      {data.length < MAX_EDUCATION && (
        <motion.button
          type="button"
          onClick={onAdd}
          className="flex justify-center items-center p-4 w-full text-brand-600 bg-brand-50 rounded-2xl border-2 border-brand-200 border-dashed transition-all duration-200 hover:bg-brand-100/50"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Plus className="mr-2 w-5 h-5" />
          Add Education
        </motion.button>
      )}
    </motion.div>
  );
});