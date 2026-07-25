import { CheckIcon, Combobox, Group, Text, UnstyledButton, useCombobox } from '@mantine/core';
import { ChevronDown } from 'lucide-react';
import styles from './BadgeSelect.module.css';

export interface BadgeSelectOption<T extends string> {
  value: T;
  label: string;
  color?: string;
}

interface BadgeSelectProps<T extends string> {
  value: T;
  options: BadgeSelectOption<T>[];
  disabled?: boolean;
  width?: number;
  onChange: (value: T) => void | Promise<void>;
}

export const BadgeSelect = <T extends string>({
  value,
  options,
  disabled = false,
  width = 190,
  onChange,
}: BadgeSelectProps<T>) => {
  const combobox = useCombobox();

  const selectedOption = options.find((option) => option.value === value);
  const color = selectedOption?.color ?? 'gray';

  const handleSelect = async (nextValue: string) => {
    combobox.closeDropdown();

    const option = options.find((option) => option.value === nextValue);

    if (!option || option.value === value) {
      return;
    }

    await onChange(option.value);
  };

  return (
    <Combobox
      store={combobox}
      withinPortal
      width={width}
      position="bottom"
      classNames={{
        dropdown: styles.dropdown,
        option: styles.option,
      }}
      onOptionSubmit={handleSelect}
    >
      <Combobox.Target data-no-dnd>
        <UnstyledButton
          className={styles.button}
          disabled={disabled}
          data-no-dnd
          px={10}
          style={{
            backgroundColor: `var(--mantine-color-${color}-1)`,
            color: `var(--mantine-color-${color}-7)`,
          }}
          onClick={() => combobox.toggleDropdown()}
        >
          <span className={styles.buttonText}>{selectedOption?.label}</span>
          <ChevronDown size={14} />
        </UnstyledButton>
      </Combobox.Target>

      <Combobox.Dropdown data-no-dnd>
        <Combobox.Options>
          {options.map((option) => (
            <Combobox.Option key={option.value} value={option.value}>
              <Group justify="space-between" gap={8} wrap="nowrap">
                <Text size="sm" fw={500}>
                  {option.label}
                </Text>

                {option.value === value && <CheckIcon size={12} />}
              </Group>
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};
