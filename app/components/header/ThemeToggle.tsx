'use client';

import { useTheme } from '@/lib/theme/ThemeContext';
import { Checkbox, Icon } from 'semantic-ui-react';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <Icon
        name={isDark ? 'moon' : 'sun'}
        size="large"
        inverted={isDark}
        onClick={toggleTheme}
      />
      <Checkbox toggle checked={isDark} onChange={toggleTheme} />
    </div>
  );
}
