import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge.jsx';

describe('StatusBadge', () => {
  it('renders neutral variant with badge class', () => {
    render(<StatusBadge>Neutral</StatusBadge>);
    const badge = screen.getByText('Neutral');
    expect(badge.tagName).toBe('SPAN');
    expect(badge).toHaveClass('badge');
    expect(badge).not.toHaveClass('badge--success');
  });

  it('renders named variant with modifier class', () => {
    render(<StatusBadge variant="success">Success</StatusBadge>);
    const badge = screen.getByText('Success');
    expect(badge).toHaveClass('badge badge--success');
  });

  it('resolves dynamic variant and renders children', () => {
    const verified = true;
    render(
      <StatusBadge variant={verified ? 'success' : 'warning'}>
        ONG verificada
      </StatusBadge>
    );
    const badge = screen.getByText('ONG verificada');
    expect(badge).toHaveClass('badge badge--success');
  });

  it('passes rest props to the span', () => {
    render(
      <StatusBadge variant="error" style={{ marginTop: '8px' }} data-testid="status-badge">
        Error
      </StatusBadge>
    );
    const badge = screen.getByTestId('status-badge');
    expect(badge).toHaveClass('badge badge--error');
    expect(badge).toHaveStyle({ marginTop: '8px' });
  });
});
