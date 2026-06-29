import { AppShell, Container } from '@mantine/core'
import { Outlet } from 'react-router-dom'
import { Header } from './header/Header'
import styles from './AppLayout.module.css'

export const AppLayout = () => {
  return (
    <AppShell className={styles.layout} header={{ height: 64 }}>
      <Header />

      <AppShell.Main className={styles.main}>
        <Container className={styles.container} size="xl">
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}
