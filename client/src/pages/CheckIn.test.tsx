import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { CheckIn } from './CheckIn';
import { entriesService } from '@/services/entries.service';
import { ToastProvider } from '@/context/ToastContext';

vi.mock('@/services/entries.service', () => ({
  entriesService: {
    today: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

function renderCheckIn() {
  return render(
    <MemoryRouter initialEntries={['/check-in']}>
      <ToastProvider>
        <CheckIn />
      </ToastProvider>
    </MemoryRouter>,
  );
}

describe('CheckIn', () => {
  beforeEach(() => {
    vi.mocked(entriesService.today).mockResolvedValue({ entry: null });
  });

  it('submits a new check-in with the default values', async () => {
    vi.mocked(entriesService.create).mockResolvedValue({
      entry: {
        id: '1',
        date: '2024-05-01',
        sleepHours: 7.5,
        energy: 5,
        mood: 5,
        productivity: 5,
        exercise: false,
        note: '',
        createdAt: '',
        updatedAt: '',
      },
    });

    renderCheckIn();
    const user = userEvent.setup();

    const saveButton = await screen.findByRole('button', { name: /save today's check-in/i });
    await user.click(saveButton);

    await waitFor(() => expect(entriesService.create).toHaveBeenCalledTimes(1));
    const payload = vi.mocked(entriesService.create).mock.calls[0][0];
    expect(payload.energy).toBe(5);
    expect(payload.exercise).toBe(false);

    expect(await screen.findByText(/you're done for today/i)).toBeInTheDocument();
  });
});
