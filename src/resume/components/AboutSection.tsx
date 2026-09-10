import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Image } from 'lucide-react';
import { InputField } from './InputField';
import { generateId, MAX_SUMMARY_LENGTH, PROFESSION_CATEGORIES } from '../constants';
import type { AboutData, Errors, Link } from '../types';

interface AboutSectionProps {
  data: AboutData;
  onChange: (field: string, value: string | Link[]) => void;
  errors: Errors;
}

export const AboutSection = React.memo(function AboutSection({
  data,
  onChange,
  errors,
}: AboutSectionProps) {
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange('photo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddLink = (): void => {
    onChange('links', [...(data.links || []), { id: generateId(), title: '', url: '' }]);
  };

  const handleRemoveLink = (id: string): void => {
    onChange('links', data.links.filter((link: Link) => link.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-start space-x-6">
        <div className="flex-shrink-0">
          <div className="relative w-32 h-32">
            {data.photo ? (
              <img src={data.photo} alt="Profile" className="object-cover w-full h-full rounded-lg" />
            ) : (
              <div className="flex justify-center items-center w-full h-full text-gray-400 bg-gray-50 rounded-lg border-2 border-gray-300 border-dashed">
                <Image className="w-8 h-8" />
              </div>
            )}
            <button
              type="button"
              onClick={() => document.getElementById('photo-upload')?.click()}
              className="absolute right-2 bottom-2 p-1.5 text-gray-700 bg-white rounded-full shadow-soft hover:bg-gray-50"
            >
              <Plus className="w-4 h-4" />
            </button>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>
        </div>

        <div className="flex-grow space-y-4">
          <InputField
            label="Full Name"
            value={data.name}
            onChange={(value) => onChange('name', value)}
            error={errors.name}
            placeholder="John Doe"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputField
              label="Email"
              type="email"
              value={data.email}
              onChange={(value) => onChange('email', value)}
              error={errors.email}
              placeholder="john@example.com"
            />
            <InputField
              label="Phone"
              type="tel"
              value={data.phone}
              onChange={(value) => onChange('phone', value)}
              error={errors.phone}
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          label="Location"
          value={data.location}
          onChange={(value) => onChange('location', value)}
          error={errors.location}
          placeholder="City, Country"
        />
        <div>
          <label className="block mb-1.5 text-sm font-medium text-gray-700">Profession Category</label>
          <select
            value={data.profession}
            onChange={(e) => onChange('profession', e.target.value)}
            className={`w-full p-2.5 bg-white rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
              errors.profession ? 'border-red-300' : 'border-stone-200'
            }`}
          >
            <option value="">Select a category</option>
            {PROFESSION_CATEGORIES.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
            </select>
            {errors.profession && <p className="mt-1 text-sm text-red-500">{errors.profession}</p>}
        </div>
      </div>

      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700">Professional Summary</label>
        <textarea
          value={data.summary}
          onChange={(e) => onChange('summary', e.target.value)}
          rows={4}
          className={`w-full p-2.5 bg-white rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
            errors.summary ? 'border-red-300' : 'border-stone-200'
          }`}
          placeholder="Write a compelling summary of your professional background and goals..."
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-gray-500">
            {data.summary.length}/{MAX_SUMMARY_LENGTH} characters
          </p>
          {errors.summary && <p className="text-sm text-red-500">{errors.summary}</p>}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="text-sm font-medium text-gray-700">Social Links & Portfolio</label>
          <button
            type="button"
            onClick={handleAddLink}
            className="flex items-center px-2 py-1 text-sm text-brand-600 rounded hover:bg-brand-50"
          >
            <Plus className="mr-1 w-4 h-4" /> Add Link
          </button>
        </div>
        <div className="space-y-3">
          {data.links?.map((link, index) => (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex space-x-3"
            >
              <InputField
                label="Title"
                value={link.title}
                onChange={(value) => {
                  const newLinks = [...data.links];
                  newLinks[index] = { ...newLinks[index], title: value };
                  onChange('links', newLinks);
                }}
                placeholder="Title (e.g., LinkedIn, Portfolio)"
              />
              <InputField
                label="URL"
                value={link.url}
                onChange={(value) => {
                  const newLinks = [...data.links];
                  newLinks[index] = { ...newLinks[index], url: value };
                  onChange('links', newLinks);
                }}
                placeholder="URL"
              />
              <button
                type="button"
                onClick={() => handleRemoveLink(link.id)}
                className="p-2 text-red-500 rounded hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
});