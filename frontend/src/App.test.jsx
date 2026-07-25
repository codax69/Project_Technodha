import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('Frontend Integration Tests', () => {
  it('renders brand header correctly', () => {
    render(<App />);
    expect(screen.getAllByText(/TECHNODHA/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Catalogue/i)[0]).toBeInTheDocument();
  });
});
