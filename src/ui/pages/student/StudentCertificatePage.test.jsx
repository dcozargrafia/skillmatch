import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import StudentAssignmentPage from './StudentAssignmentPage';

vi.mock('../../../ui/hooks/useStudentAssignment.jsx', () => ({
  default: vi.fn(),
}));

vi.mock('../../../ui/hooks/useStudentCertificate.jsx', () => ({
  default: vi.fn(),
}));

vi.mock('../../../ui/hooks/useStudentReview.jsx', () => ({
  default: vi.fn(),
}));

vi.mock('../../../ui/components/DeliverableCard.jsx', () => ({
  DeliverableCard: vi.fn(({ deliverable }) => (
    <div data-testid="deliverable-card">{deliverable.title} [{deliverable.status}]</div>
  )),
}));

import useStudentAssignment from '../../../ui/hooks/useStudentAssignment.jsx';
import useStudentCertificate from '../../../ui/hooks/useStudentCertificate.jsx';
import useStudentReview from '../../../ui/hooks/useStudentReview.jsx';

const mockCompletedAssignment = {
  id: 'asgn1',
  project_title: 'Web banco de alimentos',
  student_name: 'Ana García',
  start_date: '2026-05-01',
  project_status: 'completed',
  certificate_id: 'cert1',
};

const mockInProgressAssignment = {
  id: 'asgn2',
  project_title: 'Campaña digital',
  student_name: 'Ana García',
  start_date: '2026-05-01',
  project_status: 'in_progress',
  certificate_id: null,
};

function setupAssignmentHook(overrides = {}) {
  const defaults = {
    assignment: null,
    deliverables: [],
    loading: true,
    error: null,
    actions: {
      handleStartDeliverable: vi.fn(),
      handleSubmitDeliverable: vi.fn(),
      handleAcceptAssignment: vi.fn(),
    },
  };
  useStudentAssignment.mockReturnValue({ ...defaults, ...overrides });
}

function setupCertificateHook(overrides = {}) {
  const defaults = {
    downloading: false,
    error: null,
    handleDownload: vi.fn(),
  };
  useStudentCertificate.mockReturnValue({ ...defaults, ...overrides });
}

function setupReviewHook(overrides = {}) {
  const defaults = {
    submitting: false,
    reviewSent: false,
    error: null,
    handleSubmitReview: vi.fn(),
  };
  useStudentReview.mockReturnValue({ ...defaults, ...overrides });
}

function renderPage(assignmentId = 'asgn1') {
  return render(
    <MemoryRouter initialEntries={[`/student/assignments/${assignmentId}`]}>
      <Routes>
        <Route path="/student/assignments/:id" element={<StudentAssignmentPage />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  setupAssignmentHook();
  setupCertificateHook();
  setupReviewHook();
});

describe('StudentAssignmentPage — certificado (HU13)', () => {
  it('AC1: muestra botón Descargar certificado cuando project_status es completed', async () => {
    setupAssignmentHook({
      assignment: mockCompletedAssignment,
      deliverables: [],
      loading: false,
      error: null,
    });
    setupCertificateHook();
    renderPage();
    expect(await screen.findByRole('button', { name: /descargar certificado/i })).toBeInTheDocument();
  });

  it('AC2: no muestra botón Descargar certificado cuando project_status no es completed', async () => {
    setupAssignmentHook({
      assignment: mockInProgressAssignment,
      deliverables: [],
      loading: false,
      error: null,
    });
    setupCertificateHook();
    renderPage('asgn2');
    await screen.findByText('Campaña digital');
    expect(screen.queryByRole('button', { name: /descargar certificado/i })).not.toBeInTheDocument();
  });

  it('AC3: el botón llama a handleDownload con el assignment', async () => {
    const handleDownload = vi.fn();
    setupAssignmentHook({
      assignment: mockCompletedAssignment,
      deliverables: [],
      loading: false,
      error: null,
    });
    setupCertificateHook({ handleDownload });
    renderPage();
    const btn = await screen.findByRole('button', { name: /descargar certificado/i });
    fireEvent.click(btn);
    await waitFor(() => expect(handleDownload).toHaveBeenCalledWith(mockCompletedAssignment));
  });

  it('AC4: muestra error si handleDownload falla', async () => {
    setupAssignmentHook({
      assignment: mockCompletedAssignment,
      deliverables: [],
      loading: false,
      error: null,
    });
    setupCertificateHook({ error: 'Error al descargar el certificado. Intenta de nuevo.' });
    renderPage();
    const btn = await screen.findByRole('button', { name: /descargar certificado/i });
    fireEvent.click(btn);
    await screen.findByRole('alert');
  });
});