import { Box, Button, Group, Modal, Paper, ScrollArea, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { Upload } from 'lucide-react';
import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import { formatJsonPreview } from '../lib/formatJsonPreview';
import { getImportErrorMessage } from '../lib/getImportErrorMessage';
import { parseTasksBackup } from '../lib/parseTasksBackup';
import { IMPORT_TASKS_MODE, type ImportTasksMode } from '../model/types';
import { useImportBoard } from '../model/useImportBoard';
import styles from './ImportTasksButton.module.css';

interface ImportTasksButtonProps {
  disabled?: boolean;
}

const MAX_IMPORT_FILE_SIZE = 100 * 1024 * 1024;

export const ImportTasksButton = ({ disabled = false }: ImportTasksButtonProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileContent, setSelectedFileContent] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const { importBoard } = useImportBoard();
  const filePreview = useMemo(() => formatJsonPreview(selectedFileContent), [selectedFileContent]);

  const resetSelectedFile = () => {
    setSelectedFile(null);
    setSelectedFileContent('');

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (isImporting) return;

    resetSelectedFile();
    close();
  };

  const handleSelectFile = async (file: File) => {
    setSelectedFile(file);
    setSelectedFileContent(await file.text());
    open();
  };

  const handleImportFile = async (mode: ImportTasksMode) => {
    if (isImporting || !selectedFile) return;

    setIsImporting(true);

    try {
      const backup = parseTasksBackup(selectedFileContent);

      await importBoard({
        columns: backup.columns,
        tasks: backup.tasks,
        tags: backup.tags,
        comments: backup.comments,
        mode,
      });

      notifications.show({
        title: 'Данные импортированы',
        message: `Импортировано колонок: ${backup.columns.length}, задач: ${backup.tasks.length}, тегов: ${backup.tags.length}, комментариев: ${backup.comments.length}`,
        color: 'brand',
      });

      resetSelectedFile();
      close();
    } catch (error) {
      notifications.show({
        title: 'Не удалось импортировать данные',
        message: getImportErrorMessage(error),
        color: 'red',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const isJsonFile =
      file.type === 'application/json' || file.name.toLowerCase().endsWith('.json');

    if (!isJsonFile) {
      input.value = '';

      notifications.show({
        title: 'Вы выбрали не тот формат файла',
        message: 'Попробуйте выбрать файл в формате JSON',
        color: 'red',
      });

      return;
    }

    if (file.size > MAX_IMPORT_FILE_SIZE) {
      input.value = '';

      notifications.show({
        title: 'Файл слишком большой',
        message: 'Размер файла импорта не должен превышать 100 МБ',
        color: 'red',
      });

      return;
    }

    await handleSelectFile(file);

    input.value = '';
  };

  return (
    <>
      <Button
        disabled={disabled || isImporting}
        leftSection={<Upload size={16} strokeWidth={2} />}
        loading={isImporting}
        onClick={() => inputRef.current?.click()}
        type="button"
        variant="light"
      >
        Импорт
      </Button>

      <input
        accept=".json,application/json"
        hidden
        onChange={handleInputChange}
        ref={inputRef}
        type="file"
      />

      <Modal centered onClose={handleClose} opened={opened} title="Импорт данных">
        <Stack gap="md">
          <Paper
            bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))"
            p="sm"
            radius="md"
            withBorder
          >
            <Stack gap="xs">
              <Text fw={500} size="sm">
                {selectedFile?.name ?? 'Файл не выбран'}
              </Text>

              <ScrollArea h={280} offsetScrollbars type="auto">
                <Box className={styles.previewCode} component="pre">
                  {filePreview}
                </Box>
              </ScrollArea>
            </Stack>
          </Paper>

          <Group justify="flex-end">
            <Button disabled={isImporting} onClick={handleClose} type="button" variant="default">
              Отмена
            </Button>

            <Button
              disabled={!selectedFile || isImporting}
              loading={isImporting}
              onClick={() => handleImportFile(IMPORT_TASKS_MODE.Merge)}
              type="button"
              variant="light"
            >
              Обновить
            </Button>

            <Button
              color="red"
              disabled={!selectedFile || isImporting}
              loading={isImporting}
              onClick={() => handleImportFile(IMPORT_TASKS_MODE.Replace)}
              type="button"
            >
              Заменить все
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};
