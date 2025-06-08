import { render, screen } from '@testing-library/react';
import Header from '../Header';

// Mock useMediaQuery hook
const mockUseMediaQuery = jest.fn();
jest.mock('@/lib/hooks/useMediaQuery', () => ({
  useMediaQuery: () => mockUseMediaQuery(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
    pathname: '/',
  }),
  usePathname: () => '/',
}));

// Mock all components used in Header
jest.mock('../LanguageSwitcher', () => ({
  __esModule: true,
  default: () => <div data-testid="language-switcher" />,
}));

jest.mock('../ThemeToggle', () => ({
  __esModule: true,
  default: () => <div data-testid="theme-toggle" />,
}));

jest.mock('@/app/components/shared/ui/Logo', () => ({
  __esModule: true,
  default: ({ isLinked }: { isLinked?: boolean }) => (
    <div data-testid="logo" data-linked={isLinked} />
  ),
}));

// Mock theme context
jest.mock('@/lib/theme/ThemeContext', () => ({
  useTheme: () => ({
    isDark: false,
    theme: 'light',
    toggleTheme: jest.fn(),
  }),
}));

describe('Header', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('Small screens (mobile)', () => {
    beforeEach(() => {
      // Set up mocks for small screen
      mockUseMediaQuery
        .mockReturnValueOnce(true) // isSmall
        .mockReturnValueOnce(false) // isMedium
        .mockReturnValueOnce(false) // isLarge
        .mockReturnValueOnce(false); // isHuge
    });

    it('renders correctly', () => {
      render(<Header />);

      // Main menu components
      expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('logo')).toBeInTheDocument();
    });
  });

  describe('Medium screens (tablet)', () => {
    beforeEach(() => {
      // Set up mocks for medium screen
      mockUseMediaQuery
        .mockReturnValueOnce(false) // isSmall
        .mockReturnValueOnce(true) // isMedium
        .mockReturnValueOnce(false) // isLarge
        .mockReturnValueOnce(false); // isHuge
    });

    it('renders correctly', () => {
      render(<Header />);

      // Main menu components
      expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('logo')).toBeInTheDocument();
    });
  });

  describe('Large screens (desktop)', () => {
    beforeEach(() => {
      // Set up mocks for large screen
      mockUseMediaQuery
        .mockReturnValueOnce(false) // isSmall
        .mockReturnValueOnce(false) // isMedium
        .mockReturnValueOnce(true) // isLarge
        .mockReturnValueOnce(false); // isHuge
    });

    it('renders correctly', () => {
      render(<Header />);

      // Main menu components
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('logo')).toBeInTheDocument();

      // Language switcher should be in the sidebar for large screens
      expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
    });
  });

  describe('Huge screens (large desktop)', () => {
    beforeEach(() => {
      // Set up mocks for huge screen
      mockUseMediaQuery
        .mockReturnValueOnce(false) // isSmall
        .mockReturnValueOnce(false) // isMedium
        .mockReturnValueOnce(false) // isLarge
        .mockReturnValueOnce(true); // isHuge
    });

    it('renders correctly', () => {
      render(<Header />);

      // Main menu components
      expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('logo')).toBeInTheDocument();
    });
  });

  it('applies dark theme correctly', async () => {
    // Set up mocks for any screen size
    mockUseMediaQuery
      .mockReturnValueOnce(false) // isSmall
      .mockReturnValueOnce(false) // isMedium
      .mockReturnValueOnce(false) // isLarge
      .mockReturnValueOnce(true); // isHuge

    // Update theme mock to dark
    const { mockToggleTheme } = jest.requireMock('@/lib/theme/ThemeContext');
    jest
      .spyOn(require('@/lib/theme/ThemeContext'), 'useTheme')
      .mockImplementation(() => ({
        theme: 'dark',
        isDark: true,
        toggleTheme: mockToggleTheme,
      }));

    const { container } = render(<Header />);

    const menu = container.querySelector('.ui.large.borderless.menu');
    expect(menu).toBeInTheDocument();
    expect(menu).toHaveClass('inverted');
  });
});
