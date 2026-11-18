import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';
import '@testing-library/jest-dom';

describe('Smoke test T00 - App Component', () => {
  it('renders App component successfully', () => {
    render(<App />);
    expect(screen.getByText(/Sistemas Triciclos UNTDF/i)).toBeInTheDocument();
  });
});
