import { DIMENS } from '@/constants/dimens';
import { useTranslations } from 'next-intl';
import React from 'react';
import { Button, Icon } from 'semantic-ui-react';
import { useRouter } from 'next/navigation';

export default function GoBackButton() {
  const t = useTranslations('common');
  const router = useRouter();

  return (
    <Button
      onClick={() => router.back()}
      style={{
        whiteSpace: 'nowrap',
        display: 'inline-flex',
        verticalAlign: 'middle',
        gap: DIMENS.backButton.gap,
        background: 'transparent',
        border: 'none',
        padding: '0',
        color: 'inherit',
        boxShadow: 'none',
      }}
    >
      <Icon name="chevron left" fitted />
      {t('back')}
    </Button>
  );
}
