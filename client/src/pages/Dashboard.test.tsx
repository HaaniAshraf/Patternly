import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Dashboard } from './Dashboard';
import { entriesService } from '@/services/entries.service';
import { patternsService } from '@/services/patterns.service';
import { AuthProvider } from '@/context/AuthContext';
import { authService } from '@/services/auth.service';

vi.mock('@/services/entries.service', () => ({
  entriesService: { list: vi.fn(), today: vi.fn() },
}));
vi.mock('@/services/patterns.service', () => ({
  patternsService: { list: vi.fn() },
}));
vi.mock('@/services/auth.service', () => ({
  authService: { me: vi.fn(), login: vi.fn(), register: vi.fn(), logout: vi.fn() },
}));

function renderDashboard() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Dashboard />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('Dashboard', () => {
  beforeEach(() => {
    vi.mocked(authService.me).mockResolvedValue({
      user: {
        id: '1',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        plan: 'free',
        goals: [],
        curiosities: [],
        onboardingCompleted: true,
        notificationPreferences: { dailyReminder: true, weeklyReport: true },
        createdAt: new Date().toISOString(),
      },
    });
    vi.mocked(entriesService.list).mockResolvedValue({ entries: [] });
    vi.mocked(entriesService.today).mockResolvedValue({ entry: null });
    vi.mocked(patternsService.list).mockResolvedValue({ patterns: [] });
  });

  it('greets the user by first name', async () => {
    renderDashboard();
    expect(await screen.findByText(/Ada/)).toBeInTheDocument();
  });

  it('shows the empty pattern state when no patterns exist', async () => {
    renderDashboard();
    expect(await screen.findByText(/we're still learning/i)).toBeInTheDocument();
  });

  it('prompts for check-in when today has no entry', async () => {
    renderDashboard();
    expect(await screen.findByRole('link', { name: /complete check-in/i })).toBeInTheDocument();
  });
});
