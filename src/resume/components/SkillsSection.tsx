import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Lightbulb } from 'lucide-react';
import { InputField } from './InputField';
import { MAX_SKILLS, SKILL_LEVELS, SKILL_CATEGORIES, SUGGESTED_SKILLS } from '../constants';
import type { SkillEntry, Errors } from '../types';

interface SkillsSectionProps {
  data: SkillEntry[];
  onChange: (field: string, value: string, index: number) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  errors: Errors;
}

export const SkillsSection = React.memo(function SkillsSection({
  data,
  onChange,
  onAdd,
  onRemove,
  errors,
}: SkillsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((skill, index) => (
          <motion.div
            key={skill.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative p-4 bg-white rounded-2xl border-2 transition-all duration-200 group border-stone-200 hover:border-brand-200"
          >
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute top-2 right-2 p-1 text-red-500 rounded opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-red-50"
            >
              <X className="w-4 h-4" />
            </button>

            <InputField
              label="Skill name"
              value={skill.name}
              onChange={(value) => onChange('name', value, index)}
              error={errors[`skill_${index}`]}
              placeholder="Skill name"
            />

            <select
              value={skill.level}
              onChange={(e) => onChange('level', e.target.value, index)}
              className="p-2 w-full text-sm bg-gray-50 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {SKILL_LEVELS.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </motion.div>
        ))}
      </div>

      {data.length < MAX_SKILLS && (
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 p-2.5 text-sm bg-white rounded-lg border-2 border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Select a skill category</option>
              {SKILL_CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <motion.button
              type="button"
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="p-2.5 text-brand-600 bg-brand-50 rounded-lg transition-colors duration-200 hover:bg-brand-100"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Lightbulb className="w-5 h-5" />
            </motion.button>
          </div>

          {showSuggestions && selectedCategory && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-white rounded-2xl border border-stone-200"
            >
              <h4 className="mb-3 text-sm font-medium text-gray-700">Suggested {selectedCategory}</h4>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_SKILLS[selectedCategory]?.map(skill => (
                  <motion.button
                    key={skill}
                    type="button"
                    onClick={() => {
                      onAdd();
                    }}
                    className="px-3 py-1.5 text-sm text-brand-600 bg-brand-50 rounded-lg transition-colors duration-200 hover:bg-brand-100"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {skill}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          <motion.button
            type="button"
            onClick={onAdd}
            className="flex justify-center items-center p-4 w-full text-brand-600 bg-brand-50 rounded-2xl border-2 border-brand-200 border-dashed transition-all duration-200 hover:bg-brand-100/50"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <Plus className="mr-2 w-5 h-5" />
            Add Skill
          </motion.button>
        </div>
      )}
    </motion.div>
  );
});