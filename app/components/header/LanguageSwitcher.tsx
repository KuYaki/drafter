'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Dropdown } from 'semantic-ui-react';
import Cookies from 'js-cookie';
import { syncCookies } from '@/lib/cookies/actions';

const languageOptions = [
  { key: 'en', text: 'EN', value: 'en', flag: 'gb' },
  { key: 'es', text: 'ES', value: 'es', flag: 'ar' },
  { key: 'ru', text: 'RU', value: 'ru', flag: 'ru' },
  { key: 'km', text: 'KM', value: 'km', flag: 'kh' },
  { key: 'nl', text: 'NL', value: 'nl', flag: 'nl' },
  { key: 'uk', text: 'UK', value: 'uk', flag: 'ua' },
];

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const currentLocale = useLocale();
  const router = useRouter();

  const handleLanguageChange = async (newLocale: string) => {
    if (newLocale === currentLocale) return;

    // Sync all cookies to server before changing language
    const allCookies = Cookies.get();
    await syncCookies(allCookies);

    // Split path into segments and replace the first one (locale)
    const segments = pathname.split('/');
    segments[1] = newLocale;

    // Preserve query parameters and hash
    const queryString = window.location.search;
    const hash = window.location.hash;
    const newPath = segments.join('/') + queryString + hash;

    Cookies.set('NEXT_LOCALE', newLocale);
    router.push(newPath);
  };

  return (
    <Dropdown
      value={currentLocale}
      options={languageOptions}
      onChange={(_, data) => handleLanguageChange(data.value as string)}
    />
  );
}
