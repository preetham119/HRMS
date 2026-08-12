import type { LearningTone } from '@/lib/learning/types';

/** Soft pastels taken from the login page feature cards. */
export const LEARNING_TONES = {
  blue: {
    bg: 'bg-[#EAF4FF]',
    border: 'border-[#D4E7FF]',
    accent: 'text-[#2563EB]',
    button: 'bg-[#2563EB]',
    buttonHover: 'hover:bg-[#1D4ED8]',
  },
  teal: {
    bg: 'bg-[#E6FFFA]',
    border: 'border-[#C8F7EE]',
    accent: 'text-[#059669]',
    button: 'bg-[#059669]',
    buttonHover: 'hover:bg-[#047857]',
  },
  violet: {
    bg: 'bg-[#F4EBFF]',
    border: 'border-[#E7DAFF]',
    accent: 'text-[#7C3AED]',
    button: 'bg-[#7C3AED]',
    buttonHover: 'hover:bg-[#6D28D9]',
  },
  amber: {
    bg: 'bg-[#FFF4E5]',
    border: 'border-[#FFE2B4]',
    accent: 'text-[#F97316]',
    button: 'bg-[#F97316]',
    buttonHover: 'hover:bg-[#EA580C]',
  },
  rose: {
    bg: 'bg-[#FFE8F0]',
    border: 'border-[#FFDAE5]',
    accent: 'text-[#DB2777]',
    button: 'bg-[#DB2777]',
    buttonHover: 'hover:bg-[#BE185D]',
  },
  sky: {
    bg: 'bg-[#E8F6FF]',
    border: 'border-[#CDE7FF]',
    accent: 'text-[#0284C7]',
    button: 'bg-[#0284C7]',
    buttonHover: 'hover:bg-[#0369A1]',
  },
  mint: {
    bg: 'bg-[#ECFDF5]',
    border: 'border-[#D1FAE5]',
    accent: 'text-[#0D9488]',
    button: 'bg-[#0D9488]',
    buttonHover: 'hover:bg-[#0F766E]',
  },
  lavender: {
    bg: 'bg-[#F5F3FF]',
    border: 'border-[#EDE9FE]',
    accent: 'text-[#6366F1]',
    button: 'bg-[#6366F1]',
    buttonHover: 'hover:bg-[#4F46E5]',
  },
} as const satisfies Record<string, LearningTone>;

export const DEFAULT_LEARNING_TONE = LEARNING_TONES.blue;
