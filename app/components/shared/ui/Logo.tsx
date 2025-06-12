'use client';

import { Image } from 'semantic-ui-react';
import { useTheme } from '@/lib/theme/ThemeContext';
import Link from 'next/link';

type LogoProps = {
  isSmall?: boolean;
  isLinked?: boolean;
};

export default function Logo({ isSmall = false, isLinked = false }: LogoProps) {
  const { isDark } = useTheme();

  const logo = (
    <Image
      src={
        isSmall
          ? '/images/logo.svg'
          : isDark
          ? '/images/logo-full-dark.svg'
          : '/images/logo-full.svg'
      }
      alt="Drafter"
      style={{
        height: '3rem',
      }}
    />
  );

  if (!isLinked) {
    return logo;
  }

  return <Link href="/">{logo}</Link>;
}
