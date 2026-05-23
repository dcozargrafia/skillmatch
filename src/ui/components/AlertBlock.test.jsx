import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AlertBlock } from './AlertBlock.jsx';

describe('AlertBlock', () => {
  it('renders error variant with correct className and role', () => {
    render(<AlertBlock variant="error">Error message</AlertBlock>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('alert alert--error');
    expect(alert).toHaveTextContent('Error message');
  });

  it('renders success variant with correct className and role', () => {
    render(<AlertBlock variant="success">Success message</AlertBlock>);
    const alert = screen.getByRole('status');
    expect(alert).toHaveClass('alert alert--success');
    expect(alert).toHaveTextContent('Success message');
  });

  it('renders warning variant with correct className and role', () => {
    render(<AlertBlock variant="warning">Warning message</AlertBlock>);
    const alert = screen.getByRole('status');
    expect(alert).toHaveClass('alert alert--warning');
    expect(alert).toHaveTextContent('Warning message');
  });

  it('renders info variant with correct className and role', () => {
    render(<AlertBlock variant="info">Info message</AlertBlock>);
    const alert = screen.getByRole('status');
    expect(alert).toHaveClass('alert alert--info');
    expect(alert).toHaveTextContent('Info message');
  });

  it('passes rest props to the element', () => {
    render(<AlertBlock variant="error" style={{ marginBottom: '10px' }}>Error</AlertBlock>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveStyle({ marginBottom: '10px' });
  });

  it('renders JSX children', () => {
    render(
      <AlertBlock variant="error">
        <span data-testid="child">Child element</span>
      </AlertBlock>
    );
    const child = screen.getByTestId('child');
    expect(child).toBeInTheDocument();
    expect(child).toHaveTextContent('Child element');
  });
});
