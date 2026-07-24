import { Mark } from '@mantine/core';
import type { ReactNode } from 'react';

export const renderHighlightedText = (text: string, search: string): ReactNode => {
  if (!search) {
    return text;
  }

  const lowerText = text.toLowerCase();
  const index = lowerText.indexOf(search);

  if (index === -1) {
    return text;
  }

  return (
    <>
      {text.slice(0, index)}
      <Mark color="yellow.1" c="inherit">
        {text.slice(index, index + search.length)}
      </Mark>
      {text.slice(index + search.length)}
    </>
  );
};
