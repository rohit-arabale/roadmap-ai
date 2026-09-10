import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, X } from 'lucide-react';
import { InputField } from './InputField';
import { MAX_EXPERIENCES, generateId } from '../constants';
import type { ExperienceEntry, Errors } from '../types';

interface ExperienceSectionProps {
  data: ExperienceEntry[];
  onChange: (field: string, value: string | boolean | import('../types').Achievement[], index: number) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  errors: Errors;
}

export const ExperienceSection = React.memo(function ExperienceSection({
  data,
  onChange,
  onAdd,
  onRemove,
  errors,
}: ExperienceSectionProps) {
  const handleAddAchievement = (index: number): void => {
    const experience = data[index];
    const achievements = [...(experience.achievements || []), { id: generateId(), text: '' }];
    onChange('achievements', achievements, index);
  };

  const handleUpdateAchievement = (expIndex: number, achievementIndex: number, value: string): void => {
    const experience = data[expIndex];
    const achievements = [...(experience.achievements || [])];
    achievements[achievementIndex] = { ...achievements[achievementIndex], text: value };
    onChange('achievements', achievements, expIndex);
  };

  const handleRemoveAchievement = (expIndex: number, achievementIndex: number): void => {
    const experience = data[expIndex];
    const achievements = [...(experience.achievements || [])];
    achievements.splice(achievementIndex, 1);
    onChange('achievements', achievements, expIndex);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {data.map((exp, index) => (
        <motion.div
          key={exp.id}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="p-6 bg-white rounded-2xl border-2 transition-all duration-200 border-stone-200 hover:border-brand-200"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-medium text-gray-800">Experience #{index + 1}</h3>
            <button type="button" onClick={() => onRemove(index)} className="p-1 text-red-500 rounded hover:bg-red-50">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputField
              label="Job Title"
              value={exp.title}
              onChange={(value) => onChange('title', value, index)}
              error={errors[`experience_${index}_title`]}
              placeholder="Senior Software Engineer"
            />
            <InputField
              label="Company"
              value={exp.company}
              onChange={(value) => onChange('company', value, index)}
              error={errors[`experience_${index}_company`]}
              placeholder="Company Name"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2">
            <div>
              <InputField
                label="Period"
                value={exp.period}
                onChange={(value) => onChange('period', value, index)}
                error={errors[`experience_${index}_period`]}
                placeholder="Jan 2020 - Present"
              />
              <div className="mt-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exp.current}
                    onChange={(e) => onChange('current', e.target.checked, index)}
                    className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
                  />
                  <span className="text-sm text-gray-600">I currently work here</span>
                </label>
              </div>
            </div>
            <InputField
              label="Location"
              value={exp.location}
              onChange={(value) => onChange('location', value, index)}
              placeholder="City, Country"
            />
          </div>

          <div className="mt-4">
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Job Description</label>
            <textarea
              value={exp.responsibilities}
              onChange={(e) => onChange('responsibilities', e.target.value, index)}
              rows={3}
              className="p-2.5 w-full bg-white rounded-lg border-2 transition-all duration-200 border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="Describe your role, responsibilities, and key contributions..."
            />
          </div>

          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">Key Achievements</label>
              <button
                type="button"
                onClick={() => handleAddAchievement(index)}
                className="flex items-center px-2 py-1 text-sm text-brand-600 rounded hover:bg-brand-50"
              >
                <Plus className="mr-1 w-4 h-4" /> Add Achievement
              </button>
            </div>
            <div className="space-y-2">
              {exp.achievements?.map((achievement, achievementIndex) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="text"
                    value={achievement.text}
                    onChange={(e) => handleUpdateAchievement(index, achievementIndex, e.target.value)}
                    className="flex-1 p-2 text-sm bg-white rounded-lg border-2 border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Describe a specific achievement or accomplishment"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveAchievement(index, achievementIndex)}
                    className="p-1 text-red-500 rounded hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      ))}

      {data.length < MAX_EXPERIENCES && (
        <motion.button
          type="button"
          onClick={onAdd}
          className="flex justify-center items-center p-4 w-full text-brand-600 bg-brand-50 rounded-2xl border-2 border-brand-200 border-dashed transition-all duration-200 hover:bg-brand-100/50"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Plus className="mr-2 w-5 h-5" />
          Add Experience
        </motion.button>
      )}
    </motion.div>
  );
});