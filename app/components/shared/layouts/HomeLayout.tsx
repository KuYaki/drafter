'use client';

import { Container, Header, Segment } from 'semantic-ui-react';
import { useTheme } from '@/lib/theme/ThemeContext';
import { DIMENS } from '@/constants/dimens';
import DraftsView from '@/app/components/drafts/DraftsView';

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
        <Container>
          <Header as="h1" inverted={isDark}>Drafter</Header>
          <DraftsView />
        </Container>
      </Segment>
    </>
  );
}
