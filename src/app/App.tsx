import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { ErrorBoundary } from './providers/error/ErrorBoundary'
import { AppRouter } from './providers/router/AppRouter'
import { theme } from './providers/theme/theme'

function App() {
  return (
    <MantineProvider theme={theme}>
      <Notifications
        styles={{
          notification: {
            border: '1px solid var(--mantine-color-gray-3)',
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
