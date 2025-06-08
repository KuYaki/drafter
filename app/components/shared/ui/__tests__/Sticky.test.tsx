import { render, fireEvent, screen } from '@testing-library/react';
import Sticky from '../Sticky';

describe('Sticky', () => {
  const mockContextRef = { current: document.createElement('div') };
  const mockChildren = <div data-testid="sticky-content">Test Content</div>;

  beforeEach(() => {
    // Mock getBoundingClientRect
    Element.prototype.getBoundingClientRect = jest
      .fn()
      .mockImplementation(() => ({
        width: 100,
        height: 50,
        left: 0,
        right: 100,
        top: 10,
        bottom: 60,
      }));
  });

  it('renders children correctly', () => {
    render(<Sticky>{mockChildren}</Sticky>);
    expect(screen.getByTestId('sticky-content')).toBeInTheDocument();
  });

  describe('without context (stick to viewport top)', () => {
    it('becomes sticky when element top reaches viewport top', () => {
      render(<Sticky>{mockChildren}</Sticky>);

      // Mock element going above viewport
      Element.prototype.getBoundingClientRect = jest.fn().mockReturnValue({
        width: 100,
        height: 50,
        left: 0,
        top: -1,
        bottom: 49,
      });

      fireEvent.scroll(window);

      const stickyContent = screen.getByTestId('sticky-content').parentElement;
      expect(stickyContent).toHaveStyle({
        position: 'fixed',
        top: '0px',
      });
    });

    it('returns to normal position when element is below viewport top', () => {
      render(<Sticky>{mockChildren}</Sticky>);

      // First make it sticky
      Element.prototype.getBoundingClientRect = jest.fn().mockReturnValue({
        width: 100,
        height: 50,
        left: 0,
        top: -1,
        bottom: 49,
      });
      fireEvent.scroll(window);

      // Then return to normal
      Element.prototype.getBoundingClientRect = jest.fn().mockReturnValue({
        width: 100,
        height: 50,
        left: 0,
        top: 1,
        bottom: 51,
      });
      fireEvent.scroll(window);

      const stickyContent = screen.getByTestId('sticky-content').parentElement;
      expect(stickyContent).not.toHaveStyle({
        position: 'fixed',
      });
    });
  });

  describe('with context (stick to context bottom)', () => {
    it('becomes sticky when element top reaches context bottom', () => {
      render(<Sticky context={mockContextRef}>{mockChildren}</Sticky>);

      // Mock context and element positions
      mockContextRef.current.getBoundingClientRect = jest.fn().mockReturnValue({
        top: 0,
        bottom: 100,
      });
      Element.prototype.getBoundingClientRect = jest.fn().mockReturnValue({
        width: 100,
        height: 50,
        left: 0,
        top: 99, // Just below context bottom
        bottom: 149,
      });

      fireEvent.scroll(window);

      const stickyContent = screen.getByTestId('sticky-content').parentElement;
      expect(stickyContent).toHaveStyle({
        position: 'fixed',
        top: '100px', // Should stick to context bottom
      });
    });

    it('returns to normal position when element is above context bottom', () => {
      render(<Sticky context={mockContextRef}>{mockChildren}</Sticky>);

      // First make it sticky
      mockContextRef.current.getBoundingClientRect = jest.fn().mockReturnValue({
        top: 0,
        bottom: 100,
      });
      Element.prototype.getBoundingClientRect = jest.fn().mockReturnValue({
        width: 100,
        height: 50,
        left: 0,
        top: 99,
        bottom: 149,
      });
      fireEvent.scroll(window);

      // Then return to normal
      Element.prototype.getBoundingClientRect = jest.fn().mockReturnValue({
        width: 100,
        height: 50,
        left: 0,
        top: 101,
        bottom: 151,
      });
      fireEvent.scroll(window);

      const stickyContent = screen.getByTestId('sticky-content').parentElement;
      expect(stickyContent).not.toHaveStyle({
        position: 'fixed',
      });
    });
  });

  it('maintains original dimensions when sticky', () => {
    render(<Sticky>{mockChildren}</Sticky>);

    // Make it sticky
    Element.prototype.getBoundingClientRect = jest.fn().mockReturnValue({
      width: 100,
      height: 50,
      left: 0,
      top: -1,
      bottom: 49,
    });
    fireEvent.scroll(window);

    const stickyContent = screen.getByTestId('sticky-content').parentElement;
    expect(stickyContent).toHaveStyle({
      width: '100px',
      left: '0px',
    });
  });

  it('maintains correct height in container when sticky', () => {
    render(<Sticky>{mockChildren}</Sticky>);

    // Make it sticky
    Element.prototype.getBoundingClientRect = jest.fn().mockReturnValue({
      width: 100,
      height: 50,
      left: 0,
      top: -1,
      bottom: 49,
    });
    fireEvent.scroll(window);

    const container =
      screen.getByTestId('sticky-content').parentElement?.parentElement;
    expect(container).toHaveStyle({
      height: '50px',
    });
  });

  it('updates dimensions on window resize', () => {
    render(<Sticky context={mockContextRef}>{mockChildren}</Sticky>);

    // Make it sticky
    mockContextRef.current.getBoundingClientRect = jest.fn().mockReturnValue({
      top: -1,
      bottom: 100,
    });
    fireEvent.scroll(window);

    // Change dimensions
    Element.prototype.getBoundingClientRect = jest
      .fn()
      .mockImplementation(() => ({
        width: 200,
        height: 100,
        left: 20,
        right: 220,
        top: -1,
        bottom: 99,
      }));

    fireEvent.resize(window);

    const stickyContent = screen.getByTestId('sticky-content').parentElement;
    expect(stickyContent).toHaveStyle({
      width: '200px',
      left: '20px',
    });
  });
});
