import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { ErrorBoundary } from './providers/error/ErrorBoundary'
import { AppRouter } from './providers/router/AppRouter'
import { theme } from './providers/theme/theme'

function App() {
  return (
    <MantineProvider defaultColorScheme="auto" theme={theme}>
      <Notifications
        styles={{
          notification: {
            border:
              '1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))',
          },
        }}
        position="top-right"
      />

      <ErrorBoundary>
        <AppRouter />
      </ErrorBoundary>
    </MantineProvider>
  )
}

export default App
