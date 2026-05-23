import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Section } from './Section.jsx';

describe('Section', () => {
  it('renders with title text', () => {
    render(<Section title="Skills" />);
    expect(screen.getByText('Skills')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <Section title="Skills">
        <p>child content</p>
      </Section>
    );
    expect(screen.getByText('child content')).toBeInTheDocument();
  });

  it('renders correct BEM classes', () => {
    const { container } = render(<Section title="Test" />);

    const section = container.querySelector('.section');
    const header = container.querySelector('.section__header');
    const title = container.querySelector('.section__title');

    expect(section).toBeInTheDocument();
    expect(header).toBeInTheDocument();
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('Test');
  });

  it('renders without children', () => {
    const { container } = render(<Section title="Solo título" />);
    expect(container.querySelector('.section')).toBeInTheDocument();
    expect(screen.getByText('Solo título')).toBeInTheDocument();
  });

  it('renders JSX children', () => {
    render(
      <Section title="Skills">
        <div className="item-list">
          <button type="button">Acción</button>
        </div>
      </Section>
    );
    expect(screen.getByRole('button', { name: 'Acción' })).toBeInTheDocument();
    expect(screen.getByText('Skills')).toBeInTheDocument();
  });
});
