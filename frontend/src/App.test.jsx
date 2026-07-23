import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('Frontend Integration Tests', () => {
  it('renders brand header correctly', () => {
    render(<App />);
    expect(screen.getByText(/TECHNODHA/i)).toBeInTheDocument();
    expect(screen.getByText(/Product Catalogue/i)).toBeInTheDocument();
  });
});
