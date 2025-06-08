import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import GoBackButton from '../GoBackButton';

// Create mocks before using them
const mockRouterBack = jest.fn();

// Use hoisted mocks
jest.mock('next/navigation', () => ({
  __esModule: true,
  useRouter: () => ({
    back: mockRouterBack,
  }),
}));

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      back: 'Back',
    };
    return translations[key] || key;
  },
  useLocale: () => 'en',
}));

describe('GoBackButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the back button text and icon', () => {
    const { getByText, container } = render(<GoBackButton />);

    const textElement = getByText('Back');
    expect(textElement).toBeInTheDocument();

    const iconElement = container.querySelector('i');
    expect(iconElement).toHaveClass('chevron');
  });

  it('calls goBack when clicked', () => {
    const { getByText } = render(<GoBackButton />);
    const button = getByText('Back');

    fireEvent.click(button);
    expect(mockRouterBack).toHaveBeenCalledTimes(1);
  });
});
