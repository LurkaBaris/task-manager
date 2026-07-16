import { SegmentedControl, Tooltip, VisuallyHidden, useMantineColorScheme } from '@mantine/core'
import { COLOR_SCHEME_OPTIONS } from '../model/options'
import styles from './ToggleColorScheme.module.css'

export const ToggleColorScheme = () => {
  const { colorScheme, setColorScheme } = useMantineColorScheme()

  const handleChange = (value: string) => {
    if (value === 'light' || value === 'dark' || value === 'auto') {
      setColorScheme(value)
    }
  }

  return (
    <SegmentedControl
      aria-label="Выбор цветовой темы"
      classNames={{
        root: styles.root,
        control: styles.control,
        indicator: styles.indicator,
        label: styles.label,
      }}
      data={COLOR_SCHEME_OPTIONS.map(({ value, label, icon: Icon }) => ({
        value,
        label: (
          <Tooltip label={label} openDelay={400} position="bottom">
            <span className={styles.option}>
              <Icon aria-hidden className={styles.icon} size={17} />

              <VisuallyHidden>{label}</VisuallyHidden>
            </span>
          </Tooltip>
        ),
      }))}
      onChange={handleChange}
      radius="xl"
      value={colorScheme}
    />
  )
}
