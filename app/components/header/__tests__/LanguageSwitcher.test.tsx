import { render, fireEvent, act } from '@testing-library/react';
import LanguageSwitcher from '../LanguageSwitcher';
import Cookies from 'js-cookie';

// Create mocks before using them
const mockRouterPush = jest.fn();

// Mock next-intl
jest.mock('next-intl', () => ({
  useLocale: () => 'en',
}));

// Mock js-cookie
jest.mock('js-cookie', () => ({
  get: jest.fn((name?: string) => {
    if (name) return 'mock-value';
    return { 'mock-cookie': 'mock-value' };
  }),
  set: jest.fn(),
  remove: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
  usePathname: () => '/en/some/path',
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderAndOpenDropdown = () => {
    const { container } = render(<LanguageSwitcher />);
    // In Semantic UI, the 'dropdown' class is always present
    const dropdown = container.querySelector('.ui.dropdown') as HTMLElement;
    expect(dropdown).toBeInTheDocument();
    fireEvent.click(dropdown);
    return { container, dropdown };
  };

  it('renders with current locale', () => {
    const { container } = render(<LanguageSwitcher />);
    const text = container.querySelector('.ui.dropdown .text');
    expect(text).toHaveTextContent('EN');
  });

  it('shows all language options', () => {
    const { container } = renderAndOpenDropdown();

    // Options should appear after opening the dropdown
    const items = container.querySelectorAll('.ui.dropdown .menu .item');
    expect(items).toHaveLength(3);

    const texts = Array.from(items).map((item) => item.textContent);
    expect(texts).toContain('ES');
    expect(texts).toContain('EN');
    expect(texts).toContain('RU');
  });

  it('handles language change', async () => {
    const { container } = renderAndOpenDropdown();

    // Find the RU option and click on it
    const items = container.querySelectorAll('.ui.dropdown .menu .item');
    const ruOption = Array.from(items).find(
      (item) => item.textContent === 'RU'
    );
    expect(ruOption).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(ruOption as HTMLElement);
    });
    expect(Cookies.set).toHaveBeenCalledWith('NEXT_LOCALE', 'ru');
    expect(mockRouterPush).toHaveBeenCalledWith('/ru/some/path');
  });
});
