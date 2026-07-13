import { Box, Flex, Group, Select, type SelectProps } from '@mantine/core'
import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'
import {
  META_CONTROL_RIGHT_SECTION_WIDTH,
  META_CONTROL_RIGHT_SECTION_WITH_ICON_WIDTH,
  metaControlChevronStyles,
  metaControlSelectStyles,
  metaControlSizerStyles,
  metaControlTextSizerStyles,
} from '../lib/metaControl'

interface MetaSelectProps extends Omit<
  SelectProps,
  'variant' | 'styles' | 'rightSectionWidth' | 'w'
> {
  displayValue: string
  icon?: ReactNode
}

export const MetaSelect = ({
  displayValue,
  icon,
  disabled = false,
  comboboxProps,
  rightSection,
  ...props
}: MetaSelectProps) => {
  const sizerValue = displayValue.trim() || props.placeholder || ' '
  const hasIcon = Boolean(icon && !rightSection)
  const rightSectionWidth = hasIcon
    ? META_CONTROL_RIGHT_SECTION_WITH_ICON_WIDTH
    : META_CONTROL_RIGHT_SECTION_WIDTH

  return (
    <Box style={metaControlSizerStyles} data-no-dnd>
      <Flex style={metaControlTextSizerStyles({ rightSectionWidth })}>{sizerValue}</Flex>

      <Select
        {...props}
        disabled={disabled}
        variant="unstyled"
        w="100%"
        rightSectionWidth={rightSectionWidth}
        rightSection={
          rightSection ?? (
            <Group gap={8} h="100%" pl={8} wrap="nowrap">
              {icon}

              <Box component="span" style={metaControlChevronStyles}>
                <ChevronDown size={14} strokeWidth={2} />
              </Box>
            </Group>
          )
        }
        data-no-dnd
        comboboxProps={{
          withinPortal: true,
          ...comboboxProps,
        }}
        styles={metaControlSelectStyles({ disabled, rightSectionWidth })}
      />
    </Box>
  )
}
