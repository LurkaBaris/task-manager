import { Box } from '@mantine/core';
import {
  useRef,
  type ComponentPropsWithoutRef,
  type MouseEventHandler,
  type ReactNode,
} from 'react';
import {
  metaControlInputStyles,
  metaControlRightSectionStyles,
  metaControlRootStyles,
  metaControlSizerStyles,
  metaControlTextSizerStyles,
} from '../lib/metaControl';

interface MetaControlInputProps extends Omit<
  ComponentPropsWithoutRef<'input'>,
  'className' | 'style' | 'size' | 'onClick' | 'onMouseDown'
> {
  displayValue: string;
  rightSection?: ReactNode;
  onClick?: MouseEventHandler<HTMLDivElement>;
  onMouseDown?: MouseEventHandler<HTMLDivElement>;
}

export const MetaControlInput = ({
  displayValue,
  rightSection,
  disabled = false,
  onClick,
  onMouseDown,
  ...inputProps
}: MetaControlInputProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const sizerValue = displayValue || inputProps.placeholder || ' ';

  const handleRootMouseDown: MouseEventHandler<HTMLDivElement> = (event) => {
    onMouseDown?.(event);

    if (event.defaultPrevented || disabled) {
      return;
    }

    const input = inputRef.current;

    if (!input) {
      return;
    }

    if (event.target !== input) {
      event.preventDefault();
    }

    input.focus({
      preventScroll: true,
    });
  };

  return (
    <Box
      data-no-dnd
      style={metaControlRootStyles}
      onMouseDown={handleRootMouseDown}
      onClick={disabled ? undefined : onClick}
    >
      <Box style={metaControlSizerStyles}>
        <span style={metaControlTextSizerStyles()}>{sizerValue}</span>

        <input
          {...inputProps}
          ref={inputRef}
          data-no-dnd
          disabled={disabled}
          style={metaControlInputStyles({ disabled })}
        />
      </Box>

      {rightSection && <Box style={metaControlRightSectionStyles}>{rightSection}</Box>}
    </Box>
  );
};
