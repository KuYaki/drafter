'use client';

import { Container, Menu } from 'semantic-ui-react';
import { useTheme } from '@/lib/theme/ThemeContext';
import Logo from '@/app/components/shared/ui/Logo';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const { isDark } = useTheme();

  return (
    <>
      <Menu
        borderless
        inverted={isDark}
        size="large"
        style={{ borderRadius: 0 }}
      >
        <Container>
          <Menu.Item style={{ paddingTop: 0, paddingBottom: 0 }}>
            <Logo isLinked />
          </Menu.Item>
          <Menu.Item>
            <LanguageSwitcher />
          </Menu.Item>

          <Menu.Item>
            <ThemeToggle />
          </Menu.Item>
        </Container>
      </Menu>
    </>
  );
}
