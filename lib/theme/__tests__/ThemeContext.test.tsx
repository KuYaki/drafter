import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../ThemeContext';
import Cookies from 'js-cookie';

// Clear the global mock for ThemeContext
jest.unmock('@/lib/theme/ThemeContext');

// Mock js-cookie
jest.mock('js-cookie', () => ({
  get: jest.fn(),
  set: jest.fn(),
}));

// Test component that uses theme context
const TestComponent = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="is-dark">{isDark.toString()}</span>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
};

describe('ThemeProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.documentElement.classList.remove('dark');
  });

  it('provides default theme correctly', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(screen.getByTestId('is-dark')).toHaveTextContent('false');
  });

  it('loads theme from cookies if available', () => {
    (Cookies.get as jest.Mock).mockReturnValue('dark');

    render(
      <ThemeProvider defaultTheme="light">
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('is-dark')).toHaveTextContent('true');
  });

  it('uses system theme if no cookie is present', () => {
    (Cookies.get as jest.Mock).mockReturnValue(undefined);
    // System theme is mocked to light in browserMocks.ts

    render(
      <ThemeProvider defaultTheme="dark">
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });

  it('toggles theme correctly', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByText('Toggle Theme');

    act(() => {
      fireEvent.click(toggleButton);
    });

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('is-dark')).toHaveTextContent('true');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(Cookies.set).toHaveBeenCalledWith('drafter_theme', 'dark');

    act(() => {
      fireEvent.click(toggleButton);
    });

    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(screen.getByTestId('is-dark')).toHaveTextContent('false');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(Cookies.set).toHaveBeenCalledWith('drafter_theme', 'light');
  });

  it('updates DOM when theme changes', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <TestComponent />
      </ThemeProvider>
    );

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    const toggleButton = screen.getByText('Toggle Theme');
    fireEvent.click(toggleButton);

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
