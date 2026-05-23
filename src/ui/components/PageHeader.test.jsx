import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageHeader } from './PageHeader.jsx';

describe('PageHeader', () => {
  it('renders title in h1.page-title', () => {
    const { container } = render(<PageHeader title="Proyectos" />);

    const pageHeader = container.querySelector('.page-header');
    const title = container.querySelector('h1.page-title');

    expect(pageHeader).toBeInTheDocument();
    expect(title).toHaveTextContent('Proyectos');
  });

  it('renders subtitle in p.page-subtitle when passed', () => {
    render(<PageHeader title="Proyecto Detalle" subtitle="ONG Nombre" />);

    expect(screen.getByText('ONG Nombre')).toHaveClass('page-subtitle');
  });

  it('renders children as actions slot', () => {
    render(
      <PageHeader title="Proyectos">
        <button type="button">Nueva solicitud</button>
      </PageHeader>
    );

    expect(screen.getByRole('button', { name: 'Nueva solicitud' })).toBeInTheDocument();
  });
});
