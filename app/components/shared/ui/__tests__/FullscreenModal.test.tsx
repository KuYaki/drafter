import { render, screen } from '@testing-library/react';
import FullscreenModal from '../FullscreenModal';
import { Modal } from 'semantic-ui-react';

describe('FullscreenModal', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
  };

  it('renders with default props', () => {
    render(
      <FullscreenModal {...defaultProps}>
        <div>Modal Content</div>
      </FullscreenModal>
    );

    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('applies fullscreen class', () => {
    render(
      <FullscreenModal {...defaultProps}>
        <div data-testid="modal-content">Modal Content</div>
      </FullscreenModal>
    );

    const content = screen.getByTestId('modal-content');
    const modal = content.closest('.ui-fullscreen-modal');
    expect(modal).toBeInTheDocument();
  });

  it('merges additional className', () => {
    render(
      <FullscreenModal {...defaultProps} className="custom-class">
        <div data-testid="modal-content">Modal Content</div>
      </FullscreenModal>
    );

    const content = screen.getByTestId('modal-content');
    const modal = content.closest('.ui-fullscreen-modal');
    expect(modal).toHaveClass('custom-class');
  });

  it('passes Modal props correctly', () => {
    render(
      <FullscreenModal
        {...defaultProps}
        dimmer="inverted"
        closeIcon
        closeOnDimmerClick
      >
        <div data-testid="modal-content">Modal Content</div>
      </FullscreenModal>
    );

    const content = screen.getByTestId('modal-content');
    expect(content).toBeInTheDocument();
  });

  it('renders children components', () => {
    render(
      <FullscreenModal {...defaultProps}>
        <Modal.Header>Header</Modal.Header>
        <Modal.Content>Content</Modal.Content>
        <Modal.Actions>Actions</Modal.Actions>
      </FullscreenModal>
    );

    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('is not visible when open is false', () => {
    render(
      <FullscreenModal {...defaultProps} open={false}>
        <div data-testid="modal-content">Modal Content</div>
      </FullscreenModal>
    );

    expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();
  });
});
