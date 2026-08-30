
import { render, screen } from '@testing-library/react';
import { describe, it, vi, beforeEach } from 'vitest';

vi.mock('@/api/client', () => ({
  apiClient: {
    get: vi.fn().mockRejectedValue(new Error('network disabled')),
    post: vi.fn().mockRejectedValue(new Error('network disabled')),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}));

import { HashRouter, useLocation, Routes, Route } from 'react-router-dom';

function LocationProbe() {
  const loc = useLocation();
  return <div data-testid="probe">pathname={loc.pathname} hash={loc.hash} key={loc.key}</div>;
}

describe('HashRouter location probe', () => {
  it('initial load no hash', () => {
    render(<HashRouter><LocationProbe /></HashRouter>);
    const probe = document.querySelector('[data-testid="probe"]');
    console.log('NO HASH:', probe.textContent);
  });

  it('initial load with #/ login', () => {
    window.location.hash = '#/login';
    render(<HashRouter><LocationProbe /></HashRouter>);
    const probe = document.querySelector('[data-testid="probe"]');
    console.log('HASH #/login:', probe.textContent);
  });
});
