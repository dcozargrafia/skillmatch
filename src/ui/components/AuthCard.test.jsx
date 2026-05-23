import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthCard } from './AuthCard.jsx';

describe('AuthCard', () => {
  it('renders full card with brand, title, subtitle and children', () => {
    const { container } = render(
      <AuthCard title="Iniciar sesión" subtitle="Texto auxiliar">
        <form aria-label="auth-form">Form content</form>
      </AuthCard>
    );

    expect(container.querySelector('.auth-card__logo')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Iniciar sesión' })).toBeInTheDocument();
    expect(screen.getByText('Texto auxiliar')).toBeInTheDocument();
    expect(screen.getByRole('form', { name: 'auth-form' })).toBeInTheDocument();
  });

  it('renders card without brand and without title when brand is false', () => {
    const { container } = render(
      <AuthCard brand={false}>
        <div>Only children</div>
      </AuthCard>
    );

    expect(container.querySelector('.auth-card__logo')).toBeNull();
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
    expect(screen.getByText('Only children')).toBeInTheDocument();
  });

  it('renders brand and title without subtitle', () => {
    const { container } = render(
      <AuthCard title="Crear cuenta">
        <div>Child content</div>
      </AuthCard>
    );

    expect(container.querySelector('.auth-card__logo')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Crear cuenta' })).toBeInTheDocument();
    expect(screen.queryByText('Texto auxiliar')).not.toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });
});
