import { Monitor, Moon, Sun } from 'lucide-react';

export const COLOR_SCHEME_OPTIONS = [
  {
    value: 'light',
    label: 'Светлая тема',
    icon: Sun,
  },
  {
    value: 'dark',
    label: 'Тёмная тема',
    icon: Moon,
  },
  {
    value: 'auto',
    label: 'Системная тема',
    icon: Monitor,
  },
] as const;
