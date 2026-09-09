import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Login } from './Login';
import { AuthProvider } from '@/context/AuthContext';
import { authService } from '@/services/auth.service';

vi.mock('@/services/auth.service', () => ({
  authService: {
    me: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
}));

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<div>Dashboard page</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('Login', () => {
  beforeEach(() => {
    vi.mocked(authService.me).mockRejectedValue({ status: 401 });
  });

  it('shows a validation error for an invalid email', async () => {
    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByText(/enter a valid email/i)).toBeInTheDocument();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('logs in and navigates to the dashboard on success', async () => {
    vi.mocked(authService.login).mockResolvedValue({
      user: {
        id: '1',
        name: 'Ada',
        email: 'ada@example.com',
        plan: 'free',
        goals: [],
        curiosities: [],
        onboardingCompleted: true,
        notificationPreferences: { dailyReminder: true, weeklyReport: true },
        createdAt: new Date().toISOString(),
      },
    });

    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Email'), 'ada@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => expect(screen.getByText('Dashboard page')).toBeInTheDocument());
  });
});
