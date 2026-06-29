import { MantineProvider } from '@mantine/core'
import { AppRouter } from './providers/router/AppRouter'
import { theme } from './providers/theme/theme'

function App() {
  return (
    <MantineProvider theme={theme}>
      <AppRouter />
    </MantineProvider>
  )
}

export default App
