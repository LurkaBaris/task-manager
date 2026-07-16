import { ROUTES } from '@/shared/config'
import { Button, Group, Paper, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import { AlertTriangle } from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

interface ErrorStateProps {
  title: string
  description: string
  icon?: ReactNode
  showReload?: boolean
  onRetry?: () => void
}

export const ErrorState = ({
  title,
  description,
  icon = <AlertTriangle size={28} strokeWidth={2} />,
  showReload = false,
  onRetry,
}: ErrorStateProps) => {
  const navigate = useNavigate()

  return (
    <Paper maw={520} mx="auto" mt={80} p="xl" radius="lg">
      <Stack align="center" gap="md">
        <ThemeIcon color="priorityHigh" radius="md" size={56} variant="light">
          {icon}
        </ThemeIcon>

        <Title c="gray.9" order={2} ta="center">
          {title}
        </Title>

        <Text c="gray.6" ta="center">
          {description}
        </Text>

        <Group mt="sm">
          {onRetry ? (
            <Button color="brand" onClick={onRetry}>
              Попробовать снова
            </Button>
          ) : (
            <Button color="brand" onClick={() => navigate(ROUTES.HOME)}>
              Вернуться на главную
            </Button>
          )}

          {showReload && (
            <Button color="priorityHigh" variant="light" onClick={() => window.location.reload()}>
              Перезагрузить страницу
            </Button>
          )}
        </Group>
      </Stack>
    </Paper>
  )
}
