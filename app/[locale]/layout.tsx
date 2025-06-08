import 'semantic-ui-css/semantic.min.css';
import '../globals.css';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { i18n } from '@/i18n.config';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Header from '@/app/components/header/Header';
import { Container } from 'semantic-ui-react';
import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from '@/lib/theme/ThemeContext';

const geistSans = localFont({
  src: '../fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: '../fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Drafter',
  description: 'Draft your character',
};

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
  };
}

export function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const paramsData = await params;
  const locale = paramsData.locale;
  if (!i18n.locales.includes(locale as any)) notFound();

  const messages = (await import(`@/locales/${locale}.json`)).default;
  const cookieStore = await cookies();
  const theme = (cookieStore.get('theme')?.value || 'light') as
    | 'light'
    | 'dark';
  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={theme === 'dark' ? 'dark' : ''}
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider defaultTheme={theme}>
            <Header />
            <Container
              style={{
                flex: 1,
                position: 'relative',
              }}
            >
              {children}
            </Container>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
