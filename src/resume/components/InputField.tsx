import React, { useId } from 'react';
import { motion } from 'framer-motion';

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
}

export const InputField = React.memo(function InputField({
  label,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
}: InputFieldProps) {
  const reactId = useId();
  const id = `input-${reactId}`;
  const errorId = `${id}-error`;

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block mb-1.5 text-sm font-medium text-gray-700">{label}</label>
      <motion.input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-describedby={error ? errorId : undefined}
        className={`w-full p-2.5 bg-white rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
          error ? 'border-red-300' : 'border-stone-200'
        }`}
        whileFocus={{ scale: 1.01 }}
      />
      {error && <p id={errorId} className="mt-1 text-sm text-red-500" role="alert">{error}</p>}
    </div>
  );
});

interface TextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  rows?: number;
}

export const TextArea = React.memo(function TextArea({
  label,
  value,
  onChange,
  error,
  placeholder,
  rows = 4,
}: TextAreaProps) {
  const reactId = useId();
  const id = `textarea-${reactId}`;
  const errorId = `${id}-error`;

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block mb-1.5 text-sm font-medium text-gray-700">{label}</label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full p-2.5 bg-white rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
          error ? 'border-red-300' : 'border-stone-200'
        }`}
        rows={rows}
        placeholder={placeholder}
        aria-describedby={error ? errorId : undefined}
      />
      {error && <p id={errorId} className="mt-1 text-sm text-red-500" role="alert">{error}</p>}
    </div>
  );
});