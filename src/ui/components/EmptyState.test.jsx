import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState.jsx';

describe('EmptyState', () => {
  it('renders message in p.empty-state__text', () => {
    const { container } = render(<EmptyState message="No hay proyectos" />);

    const emptyState = container.querySelector('.empty-state');
    const text = container.querySelector('p.empty-state__text');

    expect(emptyState).toBeInTheDocument();
    expect(text).toHaveTextContent('No hay proyectos');
  });

  it('renders children as action slot', () => {
    render(
      <EmptyState message="No hay proyectos">
        <button type="button">Crear proyecto</button>
      </EmptyState>
    );

    expect(screen.getByRole('button', { name: 'Crear proyecto' })).toBeInTheDocument();
  });
});
