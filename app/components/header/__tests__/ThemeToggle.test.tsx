import { render, fireEvent } from '@testing-library/react';
import ThemeToggle from '../ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly in light mode', () => {
    const { container } = render(<ThemeToggle />);

    // Check icon
    const sunIcon = container.querySelector('i.sun.large.icon');
    expect(sunIcon).toBeInTheDocument();

    // Check checkbox
    const themeToggle = container.querySelector(
      '.ui.fitted.toggle.checkbox input[type="checkbox"]'
    );
    expect(themeToggle).toBeInTheDocument();
    expect(themeToggle).not.toBeChecked();
  });

  it('renders correctly in dark mode', () => {
    // Update theme mock to dark
    const { mockToggleTheme } = jest.requireMock('@/lib/theme/ThemeContext');
    jest
      .spyOn(require('@/lib/theme/ThemeContext'), 'useTheme')
      .mockImplementation(() => ({
        theme: 'dark',
        isDark: true,
        toggleTheme: mockToggleTheme,
      }));

    const { container } = render(<ThemeToggle />);

    // Check icon
    const moonIcon = container.querySelector('i.moon.large.icon');
    expect(moonIcon).toBeInTheDocument();

    // Check checkbox
    const themeToggle = container.querySelector(
      '.ui.fitted.toggle.checkbox input[type="checkbox"]'
    );
    expect(themeToggle).toBeInTheDocument();
    expect(themeToggle).toBeChecked();
  });

  it('calls toggleTheme when checkbox is clicked', () => {
    const { mockToggleTheme } = jest.requireMock('@/lib/theme/ThemeContext');
    const { container } = render(<ThemeToggle />);

    const themeToggle = container.querySelector(
      '.ui.fitted.toggle.checkbox input[type="checkbox"]'
    );
    expect(themeToggle).toBeInTheDocument();

    // Click the toggle
    fireEvent.click(themeToggle!);
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  it('calls toggleTheme when icon is clicked', () => {
    const { mockToggleTheme } = jest.requireMock('@/lib/theme/ThemeContext');
    const { container } = render(<ThemeToggle />);

    // Find the icon (moon icon in dark mode)
    const icon = container.querySelector('i.moon.large.icon');
    expect(icon).toBeInTheDocument();

    // Click the icon
    fireEvent.click(icon!);
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });
});
