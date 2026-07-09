import { Box, Select, type SelectProps } from '@mantine/core'
import { ChevronDown } from 'lucide-react'
import {
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
}

export const MetaSelect = ({
  displayValue,
  disabled = false,
  comboboxProps,
  rightSection,
  ...props
}: MetaSelectProps) => {
  const sizerValue = displayValue.trim() || props.placeholder || ' '

  return (
    <Box style={metaControlSizerStyles} data-no-dnd>
      <span style={metaControlTextSizerStyles({ withRightSection: true })}>{sizerValue}</span>

      <Select
        {...props}
        disabled={disabled}
        variant="unstyled"
        w="100%"
        rightSection={
          rightSection ?? (
            <Box component="span" style={metaControlChevronStyles}>
              <ChevronDown size={14} strokeWidth={2} />
            </Box>
          )
        }
        data-no-dnd
        comboboxProps={{
          withinPortal: true,
          ...comboboxProps,
        }}
        styles={metaControlSelectStyles({ disabled })}
      />
    </Box>
  )
}
