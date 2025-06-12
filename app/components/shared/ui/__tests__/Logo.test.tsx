import { fireEvent, render, screen } from '@testing-library/react';
import Logo from '../Logo';

describe('Logo', () => {
  it('renders full logo in light mode by default', () => {
    render(<Logo />);
    const logo = screen.getByAltText('Drafter');
    expect(logo).toHaveAttribute('src', '/images/logo-full.svg');
    expect(logo).toHaveStyle({ height: '3rem' });
  });

  it('renders small logo when isSmall prop is true', () => {
    render(<Logo isSmall />);
    const logo = screen.getByAltText('Drafter');
    expect(logo).toHaveAttribute('src', '/images/logo.svg');
    expect(logo).toHaveStyle({ height: '3rem' });
  });

  it('renders full dark logo in dark mode', () => {
    // Override the mock to return dark mode
    jest
      .spyOn(require('@/lib/theme/ThemeContext'), 'useTheme')
      .mockImplementation(() => ({
        isDark: true,
      }));

    render(<Logo />);
    const logo = screen.getByAltText('Drafter');
    expect(logo).toHaveAttribute('src', '/images/logo-full-dark.svg');
    expect(logo).toHaveStyle({ height: '3rem' });
  });

  it('calls navigateTo when clicked', () => {
    const { container } = render(<Logo isLinked />);

    fireEvent.click(container.querySelector('a')!);
  });
});
