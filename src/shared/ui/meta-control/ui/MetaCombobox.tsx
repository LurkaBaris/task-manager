import { Combobox, type ComboboxProps } from '@mantine/core';
import { metaControlComboboxStyles } from '../lib/metaControl';

type MetaComboboxProps = Omit<ComboboxProps, 'styles' | 'withinPortal'>;

export const MetaCombobox = ({ children, ...props }: MetaComboboxProps) => {
  return (
    <Combobox {...props} withinPortal styles={metaControlComboboxStyles}>
      {children}
    </Combobox>
  );
};
