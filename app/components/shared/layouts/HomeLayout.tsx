'use client';

import { Segment } from 'semantic-ui-react';
import { useTheme } from '@/lib/theme/ThemeContext';
import { DIMENS } from '@/constants/dimens';

interface HomeLayoutProps {}

export default function HomeLayout({}: HomeLayoutProps) {
  const { isDark } = useTheme();

  return (
    <>
      <Segment
        inverted={isDark}
        style={{
          marginBottom: DIMENS.common.bottomSpacing,
        }}
      >
        Drafter
      </Segment>
    </>
  );
}
