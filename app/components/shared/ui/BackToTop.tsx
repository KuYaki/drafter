'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from 'semantic-ui-react';
import { useTheme } from '@/lib/theme/ThemeContext';

interface BackToTopProps {
  threshold?: number;
}

export default function BackToTop({ threshold = 300 }: BackToTopProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { isDark } = useTheme();
  const t = useTranslations('common');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    setTimeout(() => {
      if (window.scrollY > 0) {
        window.scrollTo(0, 0);
      }
    }, 500);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        transition: 'opacity 0.3s ease-in-out',
      }}
    >
      <Button
        circular
        icon="arrow up"
        inverted={isDark}
        disabled={!isVisible}
        color="grey"
        size="large"
        onClick={scrollToTop}
        content={t('backToTop')}
        className="opacity-60 hover:opacity-100"
      />
    </div>
  );
}
