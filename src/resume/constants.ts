export const MAX_NAME_LENGTH = 100;
export const MAX_SUMMARY_LENGTH = 500;
export const MAX_SKILLS = 20;
export const MAX_EXPERIENCES = 10;
export const MAX_EDUCATION = 5;

export const RESUME_TEMPLATES: import('./types').ResumeTemplate[] = [
  { id: 'modern', name: 'Modern', color: 'teal' },
  { id: 'professional', name: 'Professional', color: 'blue' },
  { id: 'creative', name: 'Creative', color: 'purple' },
  { id: 'minimal', name: 'Minimal', color: 'gray' },
];

export const PROFESSION_CATEGORIES: string[] = [
  'Technology', 'Healthcare', 'Education', 'Finance', 'Arts & Entertainment',
  'Legal', 'Marketing', 'Engineering', 'Hospitality', 'Other'
];

export const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const;

export const SKILL_CATEGORIES = [
  'Programming Languages',
  'Frameworks & Libraries',
  'Tools & Technologies',
  'Soft Skills',
  'Languages',
  'Other',
] as const;

export const SUGGESTED_SKILLS: Record<string, string[]> = {
  'Programming Languages': ['JavaScript', 'Python', 'Java', 'C++', 'Ruby', 'PHP'],
  'Frameworks & Libraries': ['React', 'Angular', 'Vue.js', 'Node.js', 'Django', 'Flask'],
  'Tools & Technologies': ['Git', 'Docker', 'AWS', 'Linux', 'SQL', 'MongoDB'],
  'Soft Skills': ['Communication', 'Leadership', 'Problem Solving', 'Teamwork'],
  'Languages': ['English', 'Spanish', 'French', 'German', 'Mandarin'],
  'Other': [],
};

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+(\.[^\s@]+)+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  return /^\+?[\d\s-]{10,14}$/.test(phone) && (phone.match(/\d/g)?.length ?? 0) >= 7;
}

export function sanitizeInput(input: string): string {
  return input.replace(/[<>&'"]/g, (char) => ({ '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;', '&': '&amp;' } as Record<string, string>)[char]);
}