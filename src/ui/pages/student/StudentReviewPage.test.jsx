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

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/student/assignments/asgn1']}>
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

describe('StudentAssignmentPage — valoración (HU14)', () => {
  it('AC1: muestra formulario de valoración cuando project_status es completed', async () => {
    setupAssignmentHook({
      assignment: mockCompletedAssignment,
      deliverables: [],
      loading: false,
      error: null,
    });
    setupReviewHook();
    renderPage();
    await screen.findByText('Web banco de alimentos');
    expect(screen.getByRole('spinbutton', { name: /valoración/i })).toBeInTheDocument();
  });

  it('AC2: no muestra formulario si project_status no es completed', async () => {
    setupAssignmentHook({
      assignment: { ...mockCompletedAssignment, project_status: 'in_progress' },
      deliverables: [],
      loading: false,
      error: null,
    });
    setupReviewHook();
    renderPage();
    await screen.findByText('Web banco de alimentos');
    expect(screen.queryByRole('spinbutton', { name: /valoración/i })).not.toBeInTheDocument();
  });

  it('AC3: enviar llama a handleSubmitReview con assignment_id, rating y comment', async () => {
    const handleSubmitReview = vi.fn().mockResolvedValue(undefined);
    setupAssignmentHook({
      assignment: mockCompletedAssignment,
      deliverables: [],
      loading: false,
      error: null,
    });
    setupReviewHook({ handleSubmitReview });
    renderPage();
    await screen.findByText('Web banco de alimentos');
    fireEvent.change(screen.getByRole('spinbutton', { name: /valoración/i }), {
      target: { value: '4' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: /comentario/i }), {
      target: { value: 'Muy buen proyecto' },
    });
    fireEvent.click(screen.getByRole('button', { name: /enviar valoración/i }));
    await waitFor(() =>
      expect(handleSubmitReview).toHaveBeenCalledWith(
        expect.objectContaining({ assignment_id: 'asgn1', rating: 4, comment: 'Muy buen proyecto' })
      )
    );
  });

  it('AC4: tras enviar, el formulario se oculta', async () => {
    const handleSubmitReview = vi.fn().mockResolvedValue(undefined);
    setupAssignmentHook({
      assignment: mockCompletedAssignment,
      deliverables: [],
      loading: false,
      error: null,
    });
    setupReviewHook({ handleSubmitReview, reviewSent: false });

    const { unmount } = renderPage();
    await screen.findByText('Web banco de alimentos');
    fireEvent.change(screen.getByRole('spinbutton', { name: /valoración/i }), {
      target: { value: '5' },
    });
    fireEvent.click(screen.getByRole('button', { name: /enviar valoración/i }));

    await waitFor(() => expect(handleSubmitReview).toHaveBeenCalled());

    // After successful submission, reviewSent becomes true — unmount old render, re-render with new state
    unmount();
    setupReviewHook({ handleSubmitReview, reviewSent: true });
    renderPage();

    expect(screen.queryByRole('spinbutton', { name: /valoración/i })).not.toBeInTheDocument();
  });

  it('AC5: error 409 muestra mensaje "ya has valorado"', async () => {
    const handleSubmitReview = vi.fn().mockRejectedValue(
      Object.assign(new Error('Conflict'), { response: { status: 409 } })
    );
    setupAssignmentHook({
      assignment: mockCompletedAssignment,
      deliverables: [],
      loading: false,
      error: null,
    });
    setupReviewHook({
      handleSubmitReview,
      reviewSent: false,
      error: null,
    });
    renderPage();
    await screen.findByText('Web banco de alimentos');
    fireEvent.change(screen.getByRole('spinbutton', { name: /valoración/i }), {
      target: { value: '3' },
    });
    fireEvent.click(screen.getByRole('button', { name: /enviar valoración/i }));

    await waitFor(() => expect(handleSubmitReview).toHaveBeenCalled());

    // After rejection, hook sets error to 409 message — re-render with updated error
    setupReviewHook({
      handleSubmitReview,
      reviewSent: false,
      error: 'Ya has valorado este proyecto.',
    });
    renderPage();
    await screen.findByRole('alert');
    expect(screen.getByRole('alert')).toHaveTextContent(/ya has valorado/i);
  });

  it('AC6: error genérico de API muestra mensaje visible', async () => {
    const handleSubmitReview = vi.fn().mockRejectedValue(new Error('Error servidor'));
    setupAssignmentHook({
      assignment: mockCompletedAssignment,
      deliverables: [],
      loading: false,
      error: null,
    });
    setupReviewHook({
      handleSubmitReview,
      reviewSent: false,
      error: null,
    });
    renderPage();
    await screen.findByText('Web banco de alimentos');
    fireEvent.change(screen.getByRole('spinbutton', { name: /valoración/i }), {
      target: { value: '2' },
    });
    fireEvent.click(screen.getByRole('button', { name: /enviar valoración/i }));

    await waitFor(() => expect(handleSubmitReview).toHaveBeenCalled());

    setupReviewHook({
      handleSubmitReview,
      reviewSent: false,
      error: 'Error al enviar la valoración. Intenta de nuevo.',
    });
    renderPage();
    await screen.findByRole('alert');
  });
});