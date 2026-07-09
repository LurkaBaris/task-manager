import { ROUTES } from '@/shared/config'
import { AppShell, Container, Group, Text } from '@mantine/core'
import { NavLink } from 'react-router-dom'
import styles from './Header.module.css'

export const Header = () => {
  return (
    <AppShell.Header className={styles.header}>
      <Container className={styles.inner} size="xl">
        <NavLink className={styles.brand} to={ROUTES.HOME}>
          <Group gap="sm" wrap="nowrap">
            <Text className={styles.brandText} component="span">
              Канбан доска
            </Text>
          </Group>
        </NavLink>

        <nav className={styles.nav} aria-label="Основная навигация">
          <NavLink
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.linkActive}` : styles.link
            }
            to={ROUTES.HOME}
          >
            Главная
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.linkActive}` : styles.link
            }
            to={ROUTES.STATISTIC}
          >
            Статистика
          </NavLink>
        </nav>
      </Container>
    </AppShell.Header>
  )
}
