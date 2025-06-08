import { getRequestConfig } from 'next-intl/server';
import { i18n } from '@/i18n.config';

export default getRequestConfig(async ({ locale }) => {
  const currentLocale = locale || i18n.defaultLocale;

  const messages = (await import(`@/locales/${currentLocale}.json`)).default;

  return {
    locale: currentLocale,
    messages,
    timeZone: 'Europe/Moscow',
  };
});
