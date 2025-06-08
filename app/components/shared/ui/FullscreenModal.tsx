'use client';

import { ReactNode } from 'react';
import { Modal } from 'semantic-ui-react';
import '@/app/styles/modal.css';

interface FullscreenModalProps extends React.ComponentProps<typeof Modal> {
  children: ReactNode;
}

export default function FullscreenModal({
  children,
  open,
  className,
  ...props
}: FullscreenModalProps) {
  return (
    <Modal
      open={open}
      dimmer="blurring"
      basic
      className={`ui-fullscreen-modal ${className || ''}`}
      {...props}
    >
      {children}
    </Modal>
  );
}
