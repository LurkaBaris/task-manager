import {
  ActionIcon,
  Box,
  Group,
  Image,
  Paper,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
} from '@mantine/core'
import { Download, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { downloadFile } from '../lib/downloadFile'
import { formatAttachmentSize, isImageAttachment } from '../lib/helpers'
import { TaskCommentAttachmentIcon } from './TaskCommentAttachmentIcon'
import styles from './TaskCommentCard.module.css'

interface TaskCommentAttachmentCardProps {
  name: string
  type: string
  size: number
  file: Blob
  disabled?: boolean
  onRemove?: () => void
  onPreview?: () => void
}

export const TaskCommentAttachmentCard = ({
  name,
  type,
  size,
  file,
  disabled = false,
  onRemove,
  onPreview,
}: TaskCommentAttachmentCardProps) => {
  const [previewErrorFile, setPreviewErrorFile] = useState<Blob | null>(null)
  const previewRef = useRef<HTMLImageElement | null>(null)

  const isImage = isImageAttachment({ name, type })
  const canShowPreview = isImage && previewErrorFile !== file

  useEffect(() => {
    const fileUrl = URL.createObjectURL(file)

    if (previewRef.current) {
      previewRef.current.src = fileUrl
    }

    return () => URL.revokeObjectURL(fileUrl)
  }, [file])

  const preview = (
    <Image
      alt={name}
      className={styles.attachmentPreview}
      fit="cover"
      h={44}
      radius="md"
      ref={previewRef}
      w={44}
      onError={() => setPreviewErrorFile(file)}
    />
  )

  return (
    <Paper
      bg="light-dark(var(--mantine-color-white), var(--mantine-color-dark-7))"
      className={styles.attachmentCard}
      miw={0}
      p={10}
      radius="md"
      withBorder
    >
      <Group align="center" gap="sm" wrap="nowrap">
        {canShowPreview ? (
          onPreview ? (
            <Tooltip label="Открыть изображение" withArrow>
              <UnstyledButton
                aria-label={`Открыть изображение ${name}`}
                className={styles.attachmentPreviewButton}
                onClick={onPreview}
              >
                {preview}
              </UnstyledButton>
            </Tooltip>
          ) : (
            preview
          )
        ) : (
          <Box
            bg="light-dark(var(--mantine-color-brand-0), rgb(45 212 191 / 14%))"
            c="light-dark(var(--mantine-color-brand-7), var(--mantine-color-brand-3))"
            className={styles.attachmentIcon}
            h={44}
            w={44}
          >
            <TaskCommentAttachmentIcon size={20} type={type} />
          </Box>
        )}

        <Stack flex={1} gap={2} miw={0}>
          <Text fw={650} size="sm" title={name} truncate="end">
            {name}
          </Text>

          <Text c="dimmed" size="xs">
            {formatAttachmentSize(size)}
          </Text>
        </Stack>

        {onRemove ? (
          <Tooltip label="Убрать файл" withArrow>
            <ActionIcon
              aria-label={`Убрать файл ${name}`}
              color="gray"
              disabled={disabled}
              radius="md"
              size={34}
              variant="subtle"
              onClick={onRemove}
            >
              <X size={17} />
            </ActionIcon>
          </Tooltip>
        ) : (
          <Tooltip label="Скачать" withArrow>
            <ActionIcon
              aria-label={`Скачать файл ${name}`}
              color="brand"
              radius="md"
              size={34}
              type="button"
              variant="light"
              onClick={() => downloadFile(file, name)}
            >
              <Download size={17} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
    </Paper>
  )
}
