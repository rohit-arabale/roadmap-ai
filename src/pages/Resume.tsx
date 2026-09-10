import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, BookOpen, Award, Briefcase, Download, Eye, Settings,
} from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from '@/components/shared/ErrorFallback';
import { AboutSection, EducationSection, SkillsSection, ExperienceSection, ResumePreview, SettingsModal } from '@/resume/components';
import { exportToPDF } from '@/resume/pdfExport';
import {
  generateId, isValidEmail, isValidPhone, sanitizeInput,
  MAX_NAME_LENGTH, MAX_SUMMARY_LENGTH, MAX_SKILLS, MAX_EXPERIENCES, MAX_EDUCATION,
  RESUME_TEMPLATES,
} from '@/resume/constants';
import type { FormDataType, Errors, ResumeTemplate, Tab, EducationEntry, SkillEntry, ExperienceEntry, Achievement, Link } from '@/resume/types';

const tabs: Tab[] = [
  { id: 'about', label: 'About', icon: User },
  { id: 'education', label: 'Education', icon: BookOpen },
  { id: 'skills', label: 'Skills', icon: Award },
  { id: 'experience', label: 'Experience', icon: Briefcase },
];

function createInitialFormData(): FormDataType {
  return {
    about: { name: '', email: '', phone: '', location: '', summary: '', profession: '', photo: null, links: [] },
    education: [{ id: generateId(), degree: '', institution: '', year: '', description: '' }],
    skills: [{ id: generateId(), name: '', level: 'Intermediate' }],
    experience: [{ id: generateId(), title: '', company: '', period: '', current: false, location: '', responsibilities: '', achievements: [] }],
  };
}

function createEmptyEducation(): EducationEntry {
  return { id: generateId(), degree: '', institution: '', year: '', description: '' };
}

function createEmptySkill(): SkillEntry {
  return { id: generateId(), name: '', level: 'Intermediate' };
}

function createEmptyExperience(): ExperienceEntry {
  return { id: generateId(), title: '', company: '', period: '', current: false, location: '', responsibilities: '', achievements: [] };
}

const TabButton = React.memo(function TabButton({ tab, isActive, onClick }: { tab: Tab; isActive: boolean; onClick: () => void }) {
  const Icon = tab.icon;
  return (
    <motion.button
      className={`flex items-center w-full p-3 rounded-lg transition-all duration-200 ${
        isActive ? 'text-white bg-gradient-to-r from-brand-600 to-brand-500 shadow-soft' : 'text-gray-700 hover:bg-brand-50'
      }`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className="mr-2" size={20} />
      {tab.label}
    </motion.button>
  );
});

export default function ResumeBuilder() {
  const [activeTab, setActiveTab] = useState<string>('about');
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate>(RESUME_TEMPLATES[0]);
  const [formData, setFormData] = useState<FormDataType>(createInitialFormData);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [errors, setErrors] = useState<Errors>({});
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const validateForm = useCallback((): boolean => {
    const newErrors: Errors = {};

    if (!formData.about.name.trim()) newErrors.name = 'Name is required';
    if (formData.about.name.length > MAX_NAME_LENGTH) newErrors.name = `Name must be ${MAX_NAME_LENGTH} characters or less`;
    if (!isValidEmail(formData.about.email)) newErrors.email = 'Invalid email format';
    if (!isValidPhone(formData.about.phone)) newErrors.phone = 'Invalid phone number';
    if (formData.about.summary.length > MAX_SUMMARY_LENGTH) newErrors.summary = `Summary must be ${MAX_SUMMARY_LENGTH} characters or less`;
    if (!formData.about.profession) newErrors.profession = 'Profession is required';

    if (formData.education.length > MAX_EDUCATION) newErrors.education = `Maximum of ${MAX_EDUCATION} education entries allowed`;
    formData.education.forEach((edu, index) => {
      if (!edu.degree.trim()) newErrors[`education_${index}_degree`] = 'Degree is required';
      if (!edu.institution.trim()) newErrors[`education_${index}_institution`] = 'Institution is required';
      if (!edu.year || isNaN(Number(edu.year))) newErrors[`education_${index}_year`] = 'Valid year is required';
    });

    if (formData.skills.length > MAX_SKILLS) newErrors.skills = `Maximum of ${MAX_SKILLS} skills allowed`;
    formData.skills.forEach((skill, index) => {
      if (!skill.name.trim()) newErrors[`skill_${index}`] = 'Skill name is required';
    });

    if (formData.experience.length > MAX_EXPERIENCES) newErrors.experience = `Maximum of ${MAX_EXPERIENCES} experience entries allowed`;
    formData.experience.forEach((exp, index) => {
      if (!exp.title.trim()) newErrors[`experience_${index}_title`] = 'Job title is required';
      if (!exp.company.trim()) newErrors[`experience_${index}_company`] = 'Company is required';
      if (!exp.period.trim()) newErrors[`experience_${index}_period`] = 'Period is required';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback((section: keyof FormDataType, field: string, value: string | boolean | Link[] | Achievement[], index: number = 0): void => {
    setFormData(prev => ({
      ...prev,
      [section]: Array.isArray(prev[section])
        ? (prev[section] as unknown[]).map((item, i) => {
            if (i === index) {
              const processedValue = typeof value === 'string' ? sanitizeInput(value) : value;
              return { ...(item as Record<string, unknown>), [field]: processedValue };
            }
            return item;
          })
        : { ...(prev[section] as unknown as Record<string, unknown>), [field]: typeof value === 'string' ? sanitizeInput(value) : value }
    }));
  }, []);

  const addItem = useCallback((section: 'education' | 'skills' | 'experience'): void => {
    setFormData(prev => {
      if (
        (section === 'education' && prev.education.length >= MAX_EDUCATION) ||
        (section === 'experience' && prev.experience.length >= MAX_EXPERIENCES) ||
        (section === 'skills' && prev.skills.length >= MAX_SKILLS)
      ) {
        return prev;
      }
      let newItem: EducationEntry | SkillEntry | ExperienceEntry;
      switch (section) {
        case 'skills': newItem = createEmptySkill(); break;
        case 'education': newItem = createEmptyEducation(); break;
        case 'experience': newItem = createEmptyExperience(); break;
      }
      return { ...prev, [section]: [...(prev[section] as unknown[]), newItem] };
    });
  }, []);

  const removeItem = useCallback((section: 'education' | 'skills' | 'experience', index: number): void => {
    setFormData(prev => ({
      ...prev,
      [section]: (prev[section] as unknown[]).filter((_, i) => i !== index)
    }));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent): void => {
    e.preventDefault();
    if (validateForm()) {
      setShowPreview(true);
    }
  }, [validateForm]);

  const handleDownload = useCallback(async (): Promise<void> => {
    try {
      await exportToPDF(formData);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      alert('Failed to generate PDF. Please try again. Error: ' + message);
    }
  }, [formData]);

  const memoizedAboutSection = useMemo(() => (
    <AboutSection
      data={formData.about}
      onChange={(field, value) => handleInputChange('about', field, value)}
      errors={errors}
    />
  ), [formData.about, handleInputChange, errors]);

  const memoizedEducationSection = useMemo(() => (
    <EducationSection
      data={formData.education}
      onChange={(field, value, index) => handleInputChange('education', field, value, index)}
      onAdd={() => addItem('education')}
      onRemove={(index) => removeItem('education', index)}
      errors={errors}
    />
  ), [formData.education, handleInputChange, addItem, removeItem, errors]);

  const memoizedSkillsSection = useMemo(() => (
    <SkillsSection
      data={formData.skills}
      onChange={(field, value, index) => handleInputChange('skills', field, value, index)}
      onAdd={() => addItem('skills')}
      onRemove={(index) => removeItem('skills', index)}
      errors={errors}
    />
  ), [formData.skills, handleInputChange, addItem, removeItem, errors]);

  const memoizedExperienceSection = useMemo(() => (
    <ExperienceSection
      data={formData.experience}
      onChange={(field, value, index) => handleInputChange('experience', field, value, index)}
      onAdd={() => addItem('experience')}
      onRemove={(index) => removeItem('experience', index)}
      errors={errors}
    />
  ), [formData.experience, handleInputChange, addItem, removeItem, errors]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="p-6 min-h-screen bg-gradient-to-br from-brand-50 via-white to-blue-50 sm:p-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            className="mb-8 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-700 to-brand-500 lg:text-5xl">
              Professional Resume Builder
            </h1>
            <p className="mt-3 text-gray-600 md:text-lg">
              Create a stunning resume that stands out and gets you hired
            </p>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-12">
            <motion.div
              className="space-y-6 lg:col-span-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="p-6 bg-white rounded-2xl border shadow-soft backdrop-blur-sm border-stone-200/70">
                <h3 className="mb-4 text-lg font-semibold text-gray-800">Choose Template</h3>
                <div className="grid grid-cols-2 gap-3">
                  {RESUME_TEMPLATES.map((template) => (
                    <motion.button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`p-4 text-sm rounded-lg border-2 transition-all duration-200 ${
                        selectedTemplate.id === template.id
                          ? 'border-brand-500 bg-brand-50 text-brand-700'
                          : 'border-gray-100 hover:border-gray-300'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {template.name}
                    </motion.button>
                  ))}
                </div>
              </div>

              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <TabButton key={tab.id} tab={tab} isActive={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} />
                ))}
              </nav>

              <div className="space-y-3">
                <motion.button
                  onClick={() => { if (validateForm()) setShowPreview(true); }}
                  className="flex justify-center items-center p-3 w-full text-white bg-gradient-to-r from-brand-600 to-brand-500 rounded-lg shadow-soft transition-all duration-200 hover:from-brand-700 hover:to-brand-600"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Eye className="mr-2 w-5 h-5" />
                  Preview Resume
                </motion.button>

                <motion.button
                  onClick={handleDownload}
                  className="flex justify-center items-center p-3 w-full text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg shadow-soft transition-all duration-200 hover:from-blue-700 hover:to-blue-600"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Download className="mr-2 w-5 h-5" />
                  Download PDF
                </motion.button>

                <motion.button
                  onClick={() => setShowSettings(true)}
                  className="flex justify-center items-center p-3 w-full text-gray-700 bg-white rounded-lg border border-gray-100 shadow-soft transition-all duration-200 hover:bg-gray-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Settings className="mr-2 w-5 h-5" />
                  Settings
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              className="lg:col-span-9"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="p-8 bg-white rounded-2xl border shadow-soft backdrop-blur-sm border-stone-200/70">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {activeTab === 'about' && memoizedAboutSection}
                  {activeTab === 'education' && memoizedEducationSection}
                  {activeTab === 'skills' && memoizedSkillsSection}
                  {activeTab === 'experience' && memoizedExperienceSection}
                </form>
              </div>
            </motion.div>
          </div>
        </div>

        <AnimatePresence>
          {showPreview && (
            <ResumePreview formData={formData} template={selectedTemplate} onClose={() => setShowPreview(false)} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showSettings && (
            <SettingsModal onClose={() => setShowSettings(false)} />
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}