import { useEffect, useRef } from 'react';

export const useDownloadJsonFile = () => {
  const downloadUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (downloadUrlRef.current) {
        URL.revokeObjectURL(downloadUrlRef.current);
      }
    };
  }, []);

  const downloadJsonFile = (fileName: string, data: unknown) => {
    if (downloadUrlRef.current) {
      URL.revokeObjectURL(downloadUrlRef.current);
    }

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    downloadUrlRef.current = url;
    link.href = url;
    link.download = fileName;
    link.click();
  };

  return downloadJsonFile;
};
