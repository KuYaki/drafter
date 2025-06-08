import React from 'react';

// Mock for next-intl translations
jest.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => (key: string) =>
    `${namespace ? namespace + '.' : ''}${key}`,
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
  useFormatter: () => ({
    number: (value: number, options: { style: string; currency: string }) => {
      const currencySymbols: { [key: string]: string } = {
        USD: '$',
        EUR: '€',
      };
      return `${currencySymbols[options.currency]}${value}`;
    },
  }),
  useLocale: jest.fn().mockReturnValue('en'),
}));
