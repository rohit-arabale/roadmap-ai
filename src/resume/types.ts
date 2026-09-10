export interface Link {
  id: string;
  title: string;
  url: string;
}

export interface Achievement {
  id: string;
  text: string;
}

export interface AboutData {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  profession: string;
  photo: string | null;
  links: Link[];
}

export interface EducationEntry {
  id: string;
  degree: string;
  institution: string;
  year: string;
  description: string;
  location?: string;
}

export interface SkillEntry {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export interface ExperienceEntry {
  id: string;
  title: string;
  company: string;
  period: string;
  current: boolean;
  location: string;
  responsibilities: string;
  achievements: Achievement[];
}

export interface FormDataType {
  about: AboutData;
  education: EducationEntry[];
  skills: SkillEntry[];
  experience: ExperienceEntry[];
}

export interface Errors {
  [key: string]: string;
}

export interface ResumeTemplate {
  id: string;
  name: string;
  color: string;
}

export interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}