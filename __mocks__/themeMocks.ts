import type { Theme } from '@/lib/theme/ThemeContext';

// Mock ThemeContext
jest.mock('@/lib/theme/ThemeContext', () => {
  const mockToggleTheme = jest.fn();
  const mockContext = {
    theme: 'light' as Theme,
    isDark: false,
    toggleTheme: mockToggleTheme,
  };

  return {
    useTheme: () => mockContext,
    __esModule: true,
    mockToggleTheme,
  };
});
