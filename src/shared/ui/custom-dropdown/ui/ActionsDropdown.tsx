import { Box, Paper } from '@mantine/core';
import { useClickOutside } from '@mantine/hooks';
import { useState, type ReactNode } from 'react';
import styles from './ActionsDropdown.module.css';

interface ActionsDropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  disabled?: boolean;
}

export const ActionsDropdown = ({ trigger, children, disabled = false }: ActionsDropdownProps) => {
  const [opened, setOpened] = useState(false);

  const rootRef = useClickOutside<HTMLDivElement>(() => {
    setOpened(false);
  });

  const handleTriggerClick = () => {
    if (disabled) {
      return;
    }

    setOpened((current) => !current);
  };

  const handleActionClick = () => {
    requestAnimationFrame(() => {
      setOpened(false);
    });
  };

  return (
    <Box ref={rootRef} pos="relative" w="fit-content">
      <Box onClick={handleTriggerClick}>{trigger}</Box>

      <Paper
        shadow="md"
        withBorder
        radius="md"
        p={8}
        pos="absolute"
        top="calc(100% + 8px)"
        left="50%"
        display={opened ? 'block' : 'none'}
        miw={220}
        maw="calc(100vw - 32px)"
        className={styles.dropdown}
        onClickCapture={handleActionClick}
      >
        {children}
      </Paper>
    </Box>
  );
};
