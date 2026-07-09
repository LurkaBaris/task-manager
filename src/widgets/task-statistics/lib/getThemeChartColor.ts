import type { MantineColor, MantineTheme } from '@mantine/core'

const DEFAULT_COLOR: MantineColor = 'gray'
const DEFAULT_SHADE = 6

export const getThemeChartColor = (
  theme: MantineTheme,
  color: MantineColor,
  shade = DEFAULT_SHADE,
): string => {
  return theme.colors[color]?.[shade] ?? theme.colors[DEFAULT_COLOR][shade]
}
