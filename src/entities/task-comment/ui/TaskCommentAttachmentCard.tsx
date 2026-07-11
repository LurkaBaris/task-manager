import { ActionIcon, Box, Group, Image, Paper, Stack, Text, Tooltip } from '@mantine/core'
import { Download, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { formatAttachmentSize } from '../lib/helpers'
import { TaskCommentAttachmentIcon } from './TaskCommentAttachmentIcon'
import styles from './TaskCommentCard.module.css'

const IMAGE_FILE_EXTENSION = /\.(gif|jpe?g|png|webp)$/i

interface TaskCommentAttachmentCardProps {
  name: string
  type: string
  size: number
  file: Blob
  disabled?: boolean
  onRemove?: () => void
}

export const TaskCommentAttachmentCard = ({
  name,
  type,
  size,
  file,
  disabled = false,
  onRemove,
}: TaskCommentAttachmentCardProps) => {
  const [previewErrorFile, setPreviewErrorFile] = useState<Blob | null>(null)
  const fileUrlRef = useRef<string | null>(null)
  const previewRef = useRef<HTMLImageElement | null>(null)

  const isImage = type.startsWith('image/') || IMAGE_FILE_EXTENSION.test(name)
  const canShowPreview = isImage && previewErrorFile !== file

  useEffect(() => {
    const fileUrl = URL.createObjectURL(file)

    fileUrlRef.current = fileUrl

    if (previewRef.current) {
      previewRef.current.src = fileUrl
    }

    return () => {
      URL.revokeObjectURL(fileUrl)

      if (fileUrlRef.current === fileUrl) {
        fileUrlRef.current = null
      }
    }
  }, [file])

  const handleDownload = () => {
    const fileUrl = fileUrlRef.current

    if (!fileUrl) return

    const link = document.createElement('a')

    link.href = fileUrl
    link.download = name
    link.click()
  }

  return (
    <Paper bg="white" className={styles.attachmentCard} miw={0} p={10} radius="md" withBorder>
      <Group align="center" gap="sm" wrap="nowrap">
        {canShowPreview ? (
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
        ) : (
          <Box bg="brand.0" c="brand.7" className={styles.attachmentIcon} h={44} w={44}>
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
              onClick={handleDownload}
            >
              <Download size={17} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
    </Paper>
  )
}
