import type { ComboboxProps, SelectProps } from '@mantine/core';
import type { CSSProperties } from 'react';

export const META_CONTROL_MAX_TEXT_LENGTH = 20;
export const META_CONTROL_RIGHT_SECTION_WIDTH = 24;
export const META_CONTROL_RIGHT_SECTION_WITH_ICON_WIDTH = 48;
export const META_CONTROL_TEXT_ICON_GAP = 8;

export const metaControlLabelStyles: CSSProperties = {
  userSelect: 'none',
  WebkitUserSelect: 'none',
};

export const metaControlRootStyles: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: META_CONTROL_TEXT_ICON_GAP,
  width: 'fit-content',
  maxWidth: '100%',
  minWidth: 0,
  flex: '0 0 auto',
  cursor: 'pointer',
  userSelect: 'none',
  WebkitUserSelect: 'none',
};

export const metaControlSizerStyles: CSSProperties = {
  position: 'relative',
  display: 'inline-block',
  height: 24,
  maxWidth: `${META_CONTROL_MAX_TEXT_LENGTH}ch`,
  minWidth: 1,
  flex: '0 0 auto',
  verticalAlign: 'top',
};

export const metaControlTextSizerStyles = ({
  rightSectionWidth = 0,
}: {
  rightSectionWidth?: number;
} = {}): CSSProperties => ({
  display: 'block',
  maxWidth: `${META_CONTROL_MAX_TEXT_LENGTH}ch`,
  minWidth: 1,
  height: 24,
  paddingRight: rightSectionWidth,
  overflow: 'hidden',
  whiteSpace: 'pre',
  textOverflow: 'ellipsis',
  visibility: 'hidden',
  fontSize: 14,
  fontWeight: 500,
  lineHeight: '24px',
});

export const metaControlInputStyles = ({ disabled }: { disabled: boolean }): CSSProperties => ({
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: 24,
  minHeight: 24,
  padding: 0,
  border: 'none',
  borderRadius: 0,
  outline: 'none',
  boxShadow: 'none',
  backgroundColor: 'transparent',
  color: 'inherit',
  fontSize: 14,
  fontWeight: 500,
  lineHeight: '24px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  userSelect: 'none',
  WebkitUserSelect: 'none',
});

export const metaControlRightSectionStyles: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 'fit-content',
  height: 18,
  flex: '0 0 auto',
  color: 'var(--mantine-color-brand-light-color)',
  cursor: 'pointer',
  userSelect: 'none',
  WebkitUserSelect: 'none',
};

export const metaControlChevronStyles: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--mantine-color-brand-light-color)',
  cursor: 'pointer',
  pointerEvents: 'none',
  userSelect: 'none',
  WebkitUserSelect: 'none',
};

export const metaControlSelectStyles = ({
  disabled,
  rightSectionWidth = META_CONTROL_RIGHT_SECTION_WIDTH,
}: {
  disabled: boolean;
  rightSectionWidth?: number;
}): SelectProps['styles'] => ({
  root: {
    position: 'absolute',
    inset: 0,
    display: 'block',
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
    userSelect: 'none',
    WebkitUserSelect: 'none',
  },
  wrapper: {
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
  },
  input: {
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
    height: 24,
    minHeight: 24,
    padding: 0,
    paddingRight: rightSectionWidth,
    border: 'none',
    borderRadius: 0,
    outline: 'none',
    boxShadow: 'none',
    backgroundColor: 'transparent',
    color: 'inherit',
    fontSize: 14,
    fontWeight: 500,
    lineHeight: '24px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  },
  section: {
    width: rightSectionWidth,
    right: 0,
    color: 'var(--mantine-color-brand-light-color)',
    pointerEvents: 'none',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  },
  dropdown: {
    minWidth: 180,
    overflow: 'hidden',
    borderRadius: 12,
    padding: 4,
  },
  option: {
    width: '100%',
    boxSizing: 'border-box',
    borderRadius: 8,
    padding: '6px 12px',
  },
});

export const metaControlComboboxStyles: ComboboxProps['styles'] = {
  dropdown: {
    minWidth: 220,
    overflow: 'hidden',
    borderRadius: 12,
    padding: 4,
  },
  option: {
    borderRadius: 8,
  },
};
