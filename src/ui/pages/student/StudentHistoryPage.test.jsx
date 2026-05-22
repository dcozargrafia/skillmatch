import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import StudentHistoryPage from './StudentHistoryPage';

describe('StudentHistoryPage', () => {
  it('renderiza título "Historial" y mensaje de desarrollo', () => {
    render(
      <MemoryRouter>
        <StudentHistoryPage />
      </MemoryRouter>
    );
    expect(screen.getByText('Historial')).toBeInTheDocument();
    expect(screen.getByText(/en desarrollo/i)).toBeInTheDocument();
  });
});