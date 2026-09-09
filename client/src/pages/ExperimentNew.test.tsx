import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ExperimentNew } from './ExperimentNew';
import { experimentsService } from '@/services/experiments.service';
import { AuthProvider } from '@/context/AuthContext';
import { authService } from '@/services/auth.service';
import { ToastProvider } from '@/context/ToastContext';

vi.mock('@/services/experiments.service', () => ({
  experimentsService: { create: vi.fn(), start: vi.fn() },
}));
vi.mock('@/services/auth.service', () => ({
  authService: { me: vi.fn(), login: vi.fn(), register: vi.fn(), logout: vi.fn() },
}));

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/experiments/new']}>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/experiments/new" element={<ExperimentNew />} />
            <Route path="/experiments/:id" element={<div>Experiment detail page</div>} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('ExperimentNew', () => {
  beforeEach(() => {
    vi.mocked(authService.me).mockRejectedValue({ status: 401 });
    vi.mocked(experimentsService.create).mockResolvedValue({
      experiment: { id: 'exp-1' } as any,
    });
    vi.mocked(experimentsService.start).mockResolvedValue({ experiment: { id: 'exp-1' } as any });
  });

  it('creates and starts an experiment, then navigates to its detail page', async () => {
    renderPage();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Title'), 'Exercise → Productivity');
    await user.type(screen.getByLabelText('Hypothesis'), 'Exercising before work improves my productivity.');
    await user.click(screen.getByRole('button', { name: /start experiment/i }));

    expect(await screen.findByText('Experiment detail page')).toBeInTheDocument();
    expect(experimentsService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Exercise → Productivity',
        baselineDays: 7,
        experimentDays: 14,
        primaryMetric: 'productivity',
      }),
    );
    expect(experimentsService.start).toHaveBeenCalledWith('exp-1');
  });
});
