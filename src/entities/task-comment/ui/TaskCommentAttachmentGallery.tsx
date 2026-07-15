import { Button, Group, Image, Modal, Stack, Text } from '@mantine/core'
import { Carousel } from '@mantine/carousel'
import { ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { downloadFile } from '../lib/downloadFile'
import { isImageAttachment } from '../lib/helpers'
import type { TaskCommentAttachment } from '../model/types'
import { TaskCommentAttachmentCard } from './TaskCommentAttachmentCard'
import styles from './TaskCommentCard.module.css'

interface TaskCommentAttachmentGalleryProps {
  attachments: TaskCommentAttachment[]
}

interface BlobImageProps {
  file: Blob
  alt: string
  className: string
  fit: 'contain' | 'cover'
}

const BlobImage = ({ file, alt, className, fit }: BlobImageProps) => {
  const imageRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    const imageUrl = URL.createObjectURL(file)

    if (imageRef.current) {
      imageRef.current.src = imageUrl
    }

    return () => URL.revokeObjectURL(imageUrl)
  }, [file])

  return <Image alt={alt} className={className} fit={fit} ref={imageRef} />
}

export const TaskCommentAttachmentGallery = ({
  attachments,
}: TaskCommentAttachmentGalleryProps) => {
  const imageAttachments = attachments.filter(isImageAttachment)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const selectedImage =
    selectedImageIndex === null ? undefined : imageAttachments[selectedImageIndex]
  const canNavigate = imageAttachments.length > 1

  const handleDownload = () => {
    if (!selectedImage) return

    downloadFile(selectedImage.file, selectedImage.name)
  }

  return (
    <>
      <Stack gap="xs">
        {attachments.map((attachment) => {
          const imageIndex = imageAttachments.findIndex((image) => image.id === attachment.id)

          return (
            <TaskCommentAttachmentCard
              file={attachment.file}
              key={attachment.id}
              name={attachment.name}
              size={attachment.size}
              type={attachment.type}
              onPreview={imageIndex >= 0 ? () => setSelectedImageIndex(imageIndex) : undefined}
            />
          )
        })}
      </Stack>

      <Modal
        centered
        classNames={{
          body: styles.galleryModalBody,
          content: styles.galleryModalContent,
          header: styles.galleryModalHeader,
          title: styles.galleryModalTitle,
        }}
        opened={selectedImageIndex !== null}
        overlayProps={{ backgroundOpacity: 0.68 }}
        size="min(94vw, 1120px)"
        title={selectedImage?.name ?? 'Просмотр изображения'}
        transitionProps={{ duration: 180, transition: 'fade' }}
        onClose={() => setSelectedImageIndex(null)}
      >
        <Stack gap="md">
          <Carousel
            aria-label="Галерея изображений комментария"
            classNames={{
              control: styles.galleryCarouselControl,
              root: styles.galleryCarousel,
              slide: styles.galleryCarouselSlide,
              viewport: styles.galleryCarouselViewport,
            }}
            controlsOffset="md"
            controlSize={44}
            emblaOptions={{ duration: 30, loop: true }}
            initialSlide={selectedImageIndex ?? 0}
            nextControlIcon={<ChevronRight size={22} />}
            previousControlIcon={<ChevronLeft size={22} />}
            slideGap={0}
            slideSize="100%"
            withControls={canNavigate}
            onSlideChange={setSelectedImageIndex}
          >
            {imageAttachments.map((attachment) => (
              <Carousel.Slide key={attachment.id}>
                <BlobImage
                  alt={attachment.name}
                  className={styles.galleryImage}
                  file={attachment.file}
                  fit="contain"
                />
              </Carousel.Slide>
            ))}
          </Carousel>

          <Group gap="sm" justify="space-between" wrap="wrap">
            <Text aria-live="polite" c="dimmed" size="sm">
              Изображение {(selectedImageIndex ?? 0) + 1} из {imageAttachments.length}
            </Text>

            <Button
              color="brand"
              disabled={!selectedImage}
              leftSection={<Download size={16} />}
              size="sm"
              variant="light"
              onClick={handleDownload}
            >
              Скачать
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
