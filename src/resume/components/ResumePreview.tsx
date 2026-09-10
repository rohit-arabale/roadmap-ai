import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { FormDataType, ResumeTemplate } from '../types';

interface ResumePreviewProps {
  formData: FormDataType;
  template: ResumeTemplate;
  onClose: () => void;
}

export const ResumePreview = React.memo(function ResumePreview({
  formData,
  template,
  onClose,
}: ResumePreviewProps) {
  const [activeSection, setActiveSection] = useState<string>('all');
  const sections = ['all', 'about', 'education', 'skills', 'experience'];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-label="Resume preview"
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl"
      >
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Resume Preview</h2>
            <p className="text-sm text-gray-500">Preview how your resume will look</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 rounded-full transition-colors hover:text-gray-600"
            aria-label="Close preview"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex p-4 space-x-2 bg-gray-50 border-b">
          {sections.map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                activeSection === section
                  ? 'bg-white text-brand-600 shadow-soft'
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </button>
          ))}
        </nav>

        <div className="p-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
          <div className={`space-y-8 ${template.id === 'modern' ? 'font-sans' : 'font-serif'}`}>
            {(activeSection === 'all' || activeSection === 'about') && (
              <div className="space-y-4">
                <div className="flex items-center space-x-6">
                  {formData.about.photo && (
                    <img src={formData.about.photo} alt={formData.about.name} className="object-cover w-24 h-24 rounded-full" />
                  )}
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{formData.about.name}</h1>
                    <p className="text-lg text-gray-600">{formData.about.profession}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">{formData.about.email}</p>
                    <p className="text-gray-600">{formData.about.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">{formData.about.location}</p>
                    {formData.about.links?.map((link) => (
                      <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="block text-brand-600 hover:underline">
                        {link.title}
                      </a>
                    ))}
                  </div>
                </div>
                <p className="text-gray-700">{formData.about.summary}</p>
              </div>
            )}

            {(activeSection === 'all' || activeSection === 'skills') && (
              <div>
                <h2 className="mb-4 text-xl font-bold text-gray-900">Skills</h2>
                <div className="grid grid-cols-2 gap-4">
                  {formData.skills.map((skill) => (
                    <div key={skill.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="font-medium text-gray-700">{skill.name}</span>
                      <span className="text-sm text-gray-500">{skill.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(activeSection === 'all' || activeSection === 'education') && (
              <div>
                <h2 className="mb-4 text-xl font-bold text-gray-900">Education</h2>
                <div className="space-y-4">
                  {formData.education.map((edu) => (
                    <div key={edu.id} className="pl-4 border-l-2 border-brand-500">
                      <h3 className="font-bold text-gray-800">{edu.degree}</h3>
                      <p className="text-gray-600">{edu.institution}</p>
                      <p className="text-sm text-gray-500">{edu.year}</p>
                      {edu.description && <p className="mt-2 text-sm text-gray-600">{edu.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(activeSection === 'all' || activeSection === 'experience') && (
              <div>
                <h2 className="mb-4 text-xl font-bold text-gray-900">Experience</h2>
                <div className="space-y-6">
                  {formData.experience.map((exp) => (
                    <div key={exp.id} className="pl-4 border-l-2 border-brand-500">
                      <h3 className="font-bold text-gray-800">{exp.title}</h3>
                      <p className="text-gray-600">{exp.company}</p>
                      <p className="text-sm text-gray-500">{exp.period} • {exp.location}</p>
                      <p className="mt-2 text-gray-700">{exp.responsibilities}</p>
                      {exp.achievements?.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {exp.achievements.map((achievement, i) => (
                            <li key={i} className="text-sm text-gray-600">• {achievement.text}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end items-center p-4 bg-gray-50 border-t">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 rounded-lg transition-colors hover:bg-gray-100">
            Close Preview
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
});