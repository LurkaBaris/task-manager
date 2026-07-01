import { ROUTES } from '@/shared/config'
import { Button, Group, Paper, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import { AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface ErrorPageProps {
  onReload?: () => void
  onReset?: () => void
}

export const ErrorPage = ({ onReload, onReset }: ErrorPageProps) => {
  const navigate = useNavigate()

  const handleReload = () => {
    if (onReload) {
      onReload()
      return
    }

    window.location.reload()
  }

  return (
    <Paper maw={520} mx="auto" mt={80} p="xl" radius="lg">
      <Stack align="center" gap="md">
        <ThemeIcon color="priorityHigh" radius="md" size={56} variant="light">
          <AlertTriangle size={28} strokeWidth={2} />
        </ThemeIcon>

        <Title c="gray.9" order={2}>
          Что-то пошло не так
        </Title>

        <Text ta="center" c="gray.6">
          Попробуйте повторить действие или перезагрузить страницу.
        </Text>

        <Group mt="sm">
          {onReset ? (
            <Button color="brand" onClick={onReset}>
              Попробовать снова
            </Button>
          ) : (
            <Button color="brand" onClick={() => navigate(ROUTES.HOME)}>
              Вернуться на главную
            </Button>
          )}

          <Button color="priorityHigh" onClick={handleReload} variant="light">
            Перезагрузить страницу
          </Button>
        </Group>
      </Stack>
    </Paper>
  )
}
