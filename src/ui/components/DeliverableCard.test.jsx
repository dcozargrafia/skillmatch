/**
 * Test: DeliverableCard
 * SDD Phase 3, Task 3.8
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeliverableCard } from './DeliverableCard.jsx';
import { getDeliverableStatusLabel } from '@/domain/project/Project.js';

const mockDeliverable = {
  id: 'del-1',
  title: 'First Deliverable',
  description: 'Build the initial wireframes',
  status: 'pending',
};

const defaultProps = {
  deliverable: mockDeliverable,
  variant: 'student',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('DeliverableCard', () => {
  it('renders deliverable title and description', () => {
    render(<DeliverableCard {...defaultProps} />);

    expect(screen.getByText('First Deliverable')).toBeInTheDocument();
    expect(screen.getByText('Build the initial wireframes')).toBeInTheDocument();
  });

  it('renders status badge', () => {
    render(<DeliverableCard {...defaultProps} />);

    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  describe('student variant', () => {
    it('shows Start button when status is pending', () => {
      render(<DeliverableCard {...defaultProps} variant="student" />);

      expect(screen.getByRole('button', { name: /iniciar/i })).toBeInTheDocument();
    });

    it('shows Retry button when status is rejected', () => {
      render(<DeliverableCard {...defaultProps} deliverable={{ ...mockDeliverable, status: 'rejected' }} variant="student" />);

      expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
    });

    it('shows file URL input + Submit button when status is in_progress', () => {
      render(<DeliverableCard {...defaultProps} deliverable={{ ...mockDeliverable, status: 'in_progress' }} variant="student" />);

      expect(screen.getByLabelText(/url del archivo/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /enviar a revisión/i })).toBeInTheDocument();
    });

    it('shows nothing when status is approved (no actions available)', () => {
      render(<DeliverableCard {...defaultProps} deliverable={{ ...mockDeliverable, status: 'approved' }} variant="student" />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('calls onStart with deliverable id when Start is clicked', () => {
      const handleStart = vi.fn();
      render(<DeliverableCard {...defaultProps} variant="student" onStart={handleStart} />);

      fireEvent.click(screen.getByRole('button', { name: /iniciar/i }));

      expect(handleStart).toHaveBeenCalledWith('del-1');
    });

    it('calls onSubmit with deliverable id and fileUrl when Submit is clicked', () => {
      const handleSubmit = vi.fn();
      render(
        <DeliverableCard
          {...defaultProps}
          deliverable={{ ...mockDeliverable, status: 'in_progress' }}
          variant="student"
          onSubmit={handleSubmit}
        />
      );

      const input = screen.getByLabelText(/url del archivo/i);
      fireEvent.change(input, { target: { value: 'https://files.example.com/output.pdf' } });

      fireEvent.click(screen.getByRole('button', { name: /enviar a revisión/i }));

      expect(handleSubmit).toHaveBeenCalledWith('del-1', 'https://files.example.com/output.pdf');
    });

    it('does not call onSubmit if fileUrl is empty', () => {
      const handleSubmit = vi.fn();
      render(
        <DeliverableCard
          {...defaultProps}
          deliverable={{ ...mockDeliverable, status: 'in_progress' }}
          variant="student"
          onSubmit={handleSubmit}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /enviar a revisión/i }));

      expect(handleSubmit).not.toHaveBeenCalled();
    });
  });

  describe('ngo variant', () => {
    it('shows Approve and Reject buttons when status is in_review', () => {
      render(<DeliverableCard {...defaultProps} deliverable={{ ...mockDeliverable, status: 'in_review' }} variant="ngo" />);

      expect(screen.getByRole('button', { name: /aprobar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /rechazar/i })).toBeInTheDocument();
    });

    it('shows nothing for non-in_review statuses in ngo variant', () => {
      render(<DeliverableCard {...defaultProps} deliverable={{ ...mockDeliverable, status: 'approved' }} variant="ngo" />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('calls onApprove with deliverable id', () => {
      const handleApprove = vi.fn();
      render(<DeliverableCard {...defaultProps} deliverable={{ ...mockDeliverable, status: 'in_review' }} variant="ngo" onApprove={handleApprove} />);

      fireEvent.click(screen.getByRole('button', { name: /aprobar/i }));

      expect(handleApprove).toHaveBeenCalledWith('del-1');
    });

    it('calls onReject with deliverable id', () => {
      const handleReject = vi.fn();
      render(<DeliverableCard {...defaultProps} deliverable={{ ...mockDeliverable, status: 'in_review' }} variant="ngo" onReject={handleReject} />);

      fireEvent.click(screen.getByRole('button', { name: /rechazar/i }));

      expect(handleReject).toHaveBeenCalledWith('del-1');
    });

    it('hides buttons when readOnly=true even for in_review', () => {
      render(<DeliverableCard {...defaultProps} deliverable={{ ...mockDeliverable, status: 'in_review' }} variant="ngo" readOnly={true} />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('readonly variant', () => {
    it('only shows status badge, no action buttons', () => {
      render(<DeliverableCard {...defaultProps} deliverable={{ ...mockDeliverable, status: 'in_review' }} variant="readonly" />);

      expect(screen.getByText('En revisión')).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('shows approved status with success badge class', () => {
      render(<DeliverableCard {...defaultProps} deliverable={{ ...mockDeliverable, status: 'approved' }} variant="readonly" />);

      expect(screen.getByText('Aprobado')).toBeInTheDocument();
      const badge = screen.getByText('Aprobado');
      expect(badge).toHaveClass('badge--success');
    });

    it('shows rejected status with error badge class', () => {
      render(<DeliverableCard {...defaultProps} deliverable={{ ...mockDeliverable, status: 'rejected' }} variant="readonly" />);

      const badge = screen.getByText('Rechazado');
      expect(badge).toHaveClass('badge--error');
    });

    it('shows in_review status with warning badge class', () => {
      render(<DeliverableCard {...defaultProps} deliverable={{ ...mockDeliverable, status: 'in_review' }} variant="readonly" />);

      const badge = screen.getByText('En revisión');
      expect(badge).toHaveClass('badge--warning');
    });
  });

  describe('disabled prop', () => {
    it('disables Start button when disabled=true', () => {
      const handleStart = vi.fn();
      render(<DeliverableCard {...defaultProps} variant="student" disabled={true} onStart={handleStart} />);

      const button = screen.getByRole('button', { name: /iniciar/i });
      expect(button).toBeDisabled();
    });

    it('disables NGO buttons when disabled=true', () => {
      const handleApprove = vi.fn();
      render(<DeliverableCard {...defaultProps} deliverable={{ ...mockDeliverable, status: 'in_review' }} variant="ngo" disabled={true} onApprove={handleApprove} />);

      expect(screen.getByRole('button', { name: /aprobar/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /rechazar/i })).toBeDisabled();
    });
  });

  // PR2: Spanish status labels
  describe('PR2: Spanish status labels', () => {
    const mockWithDate = {
      id: 'del-1',
      title: 'First Deliverable',
      description: 'Build the initial wireframes',
      status: 'pending',
      created_at: '2026-05-10T10:00:00Z',
    };

    it('renders Spanish status label instead of raw status', () => {
      render(<DeliverableCard {...defaultProps} deliverable={mockWithDate} />);
      expect(screen.getByText('Pendiente')).toBeInTheDocument();
    });

    it('shows approved status as Aprobado', () => {
      render(<DeliverableCard {...defaultProps} deliverable={{ ...mockWithDate, status: 'approved' }} />);
      expect(screen.getByText('Aprobado')).toBeInTheDocument();
    });

    it('shows in_progress status as En progreso', () => {
      render(<DeliverableCard {...defaultProps} deliverable={{ ...mockWithDate, status: 'in_progress' }} />);
      expect(screen.getByText('En progreso')).toBeInTheDocument();
    });

    it('shows in_review status as En revisión', () => {
      render(<DeliverableCard {...defaultProps} deliverable={{ ...mockWithDate, status: 'in_review' }} />);
      expect(screen.getByText('En revisión')).toBeInTheDocument();
    });

    it('shows rejected status as Rechazado', () => {
      render(<DeliverableCard {...defaultProps} deliverable={{ ...mockWithDate, status: 'rejected' }} />);
      expect(screen.getByText('Rechazado')).toBeInTheDocument();
    });

    it('renders formatted created_at date', () => {
      const withDate = { ...mockWithDate, created_at: '2026-05-10T10:00:00Z' };
      render(<DeliverableCard {...defaultProps} deliverable={withDate} variant="readonly" />);
      // Check date is rendered (es-ES locale produces 10/5/2026 or 10/05/2026)
      expect(screen.getByText(/10[/.]5[/.]2026/i)).toBeInTheDocument();
    });

    it('shows file_url when present', () => {
      const withFile = { ...mockWithDate, status: 'in_progress', file_url: 'https://files.example.com/doc.pdf' };
      render(<DeliverableCard {...defaultProps} deliverable={withFile} />);
      expect(screen.getByText('https://files.example.com/doc.pdf')).toBeInTheDocument();
    });

    it('shows comment when present', () => {
      const withComment = { ...mockWithDate, comment: '这是我的提交说明' };
      render(<DeliverableCard {...defaultProps} deliverable={withComment} />);
      expect(screen.getByText('这是我的提交说明')).toBeInTheDocument();
    });

    it('does NOT render file_url when absent', () => {
      render(<DeliverableCard {...defaultProps} deliverable={mockWithDate} variant="readonly" />);
      expect(screen.queryByText(/\.pdf$/i)).not.toBeInTheDocument();
    });

    it('does NOT render comment when absent', () => {
      render(<DeliverableCard {...defaultProps} deliverable={mockWithDate} variant="readonly" />);
      expect(screen.queryByText(/这是我的提交说明/)).not.toBeInTheDocument();
    });
  });
});