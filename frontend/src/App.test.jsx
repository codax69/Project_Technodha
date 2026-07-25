import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('Frontend Integration Tests', () => {
  it('renders brand header correctly', () => {
    render(<App />);
    const header = screen.getByRole('banner');
    expect(header).toHaveTextContent(/TECHNODHA/i);
    expect(header).toHaveTextContent(/Catalogue/i);
  });
});
