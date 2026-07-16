import {
  Badge,
  Button,
  Card,
  Paper,
  Select,
  TextInput,
  Textarea,
  createTheme,
  type MantineColorsTuple,
} from '@mantine/core'

const brand: MantineColorsTuple = [
  '#f0fdfa',
  '#ccfbf1',
  '#99f6e4',
  '#5eead4',
  '#2dd4bf',
  '#14b8a6',
  '#0d9488',
  '#0f766e',
  '#115e59',
  '#134e4a',
]

const accent: MantineColorsTuple = [
  '#fff7ed',
  '#ffedd5',
  '#fed7aa',
  '#fdba74',
  '#fb923c',
  '#f97316',
  '#ea580c',
  '#c2410c',
  '#9a3412',
  '#7c2d12',
]

const statusTodo: MantineColorsTuple = [
  '#eff6ff',
  '#dbeafe',
  '#bfdbfe',
  '#93c5fd',
  '#60a5fa',
  '#3b82f6',
  '#2563eb',
  '#1d4ed8',
  '#1e40af',
  '#1e3a8a',
]

const statusProgress: MantineColorsTuple = [
  '#fffbeb',
  '#fef3c7',
  '#fde68a',
  '#fcd34d',
  '#fbbf24',
  '#f59e0b',
  '#d97706',
  '#b45309',
  '#92400e',
  '#78350f',
]

const statusDone: MantineColorsTuple = [
  '#f0fdf4',
  '#dcfce7',
  '#bbf7d0',
  '#86efac',
  '#4ade80',
  '#22c55e',
  '#16a34a',
  '#15803d',
  '#166534',
  '#14532d',
]

const priorityHigh: MantineColorsTuple = [
  '#fef2f2',
  '#fee2e2',
  '#fecaca',
  '#fca5a5',
  '#f87171',
  '#ef4444',
  '#dc2626',
  '#b91c1c',
  '#991b1b',
  '#7f1d1d',
]

export const theme = createTheme({
  primaryColor: 'brand',
  defaultRadius: 'md',
  fontFamily: '"Geist Variable", system-ui, sans-serif',
  headings: {
    fontFamily: '"Geist Variable", system-ui, sans-serif',
  },
  colors: {
    brand,
    accent,
    priorityHigh,
    priorityLow: statusDone,
    priorityMedium: accent,
    statusDone,
    statusProgress,
    statusTodo,
  },
  components: {
    Badge: Badge.extend({
      defaultProps: {
        radius: 'sm',
        size: 'sm',
        variant: 'light',
      },
    }),
    Button: Button.extend({
      defaultProps: {
        color: 'brand',
        radius: 'md',
      },
    }),
    Card: Card.extend({
      defaultProps: {
        p: 'md',
        radius: 'md',
        withBorder: true,
      },
    }),
    Paper: Paper.extend({
      defaultProps: {
        radius: 'md',
        withBorder: true,
      },
    }),
    Select: Select.extend({
      defaultProps: {
        radius: 'md',
        size: 'sm',
      },
    }),
    Textarea: Textarea.extend({
      defaultProps: {
        radius: 'md',
        size: 'sm',
      },
    }),
    TextInput: TextInput.extend({
      defaultProps: {
        radius: 'md',
        size: 'sm',
      },
    }),
  },
})
