import { render, screen } from '@testing-library/react';
import CardGroup from '../CardGroup';

describe('CardGroup', () => {
  it('renders single child correctly', () => {
    render(
      <CardGroup>
        <div data-testid="child">Child 1</div>
      </CardGroup>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders multiple children in columns', () => {
    const { container } = render(
      <CardGroup>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <div data-testid="child-3">Child 3</div>
      </CardGroup>
    );

    const grid = container.querySelector('.ui.container.grid');
    const columns = grid?.querySelectorAll(':scope > .column');
    expect(columns).toHaveLength(3);
    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
    expect(screen.getByTestId('child-3')).toBeInTheDocument();
  });

  it('applies correct grid props', () => {
    const { container } = render(
      <CardGroup itemsPerRow={3} doubling stackable>
        <div>Child 1</div>
        <div>Child 2</div>
      </CardGroup>
    );

    const grid = container.querySelector('.ui.container.grid');
    expect(grid).toHaveClass('three');
    expect(grid).toHaveClass('doubling');
    expect(grid).toHaveClass('stackable');
  });

  it('uses default props when not specified', () => {
    const { container } = render(
      <CardGroup>
        <div>Child</div>
      </CardGroup>
    );

    const grid = container.querySelector('.ui.container.grid');
    expect(grid).toHaveClass('four'); // default itemsPerRow
    expect(grid).not.toHaveClass('doubling');
    expect(grid).not.toHaveClass('stackable');
  });

  it('handles empty children', () => {
    const { container } = render(<CardGroup />);

    const grid = container.querySelector('.ui.container.grid');
    expect(grid).toBeInTheDocument();
    const columns = grid?.querySelectorAll(':scope > .column');
    expect(columns).toHaveLength(0);
  });
});
