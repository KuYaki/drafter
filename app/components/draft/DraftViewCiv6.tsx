'use client';

import { Container, Header, Divider } from 'semantic-ui-react';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Draft } from '@/types/draft';

interface DraftViewCiv6Props {
  draft: Draft;
}

export default function DraftViewCiv6({ draft }: DraftViewCiv6Props) {
  const { isDark } = useTheme();

  return (
    <Container>
      <div className="flex items-center justify-between gap-[1rem]">
        <Header inverted={isDark} as="h1" style={{ margin: 0 }}>
          Civilization VI
        </Header>
      </div>

      <Divider />

      <div>
        {/* Draft content specific to Civilization VI */}
        <p>Draft ID: {draft.id}</p>
        <p>Name: {draft.name}</p>
        <p>Game: Civilization VI</p>
        <p>Created: {new Date(draft.created_at).toLocaleString()}</p>
        <p>Parameters: {JSON.stringify(draft.params)}</p>
        {/* Add more game-specific content here */}
      </div>
    </Container>
  );
}
