import React from 'react';
import { render, screen } from '@testing-library/react';
import PLLAYLogo from '../../components/PLLAYLogo';

describe('PLLAYLogo', () => {
  test('renders logo with default props', () => {
    render(<PLLAYLogo />);
    const logo = screen.getByRole('img', { name: /pllay logo/i });
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveClass('h-8'); // default md size
  });

  test('applies custom size classes', () => {
    render(<PLLAYLogo size="lg" />);
    const logo = screen.getByRole('img', { name: /pllay logo/i });
    expect(logo).toHaveClass('h-12');
  });

  test('applies custom className', () => {
    render(<PLLAYLogo className="custom-class" />);
    const container = screen.getByRole('img', { name: /pllay logo/i }).parentElement;
    expect(container).toHaveClass('custom-class');
  });

  test('applies light variant colors', () => {
    render(<PLLAYLogo variant="light" />);
    const logo = screen.getByRole('img', { name: /pllay logo/i });
    const paths = logo.querySelectorAll('path');
    paths.forEach(path => {
      expect(path).toHaveAttribute('fill', '#FFFFFF');
    });
  });

  test('applies dark variant colors', () => {
    render(<PLLAYLogo variant="dark" />);
    const logo = screen.getByRole('img', { name: /pllay logo/i });
    const paths = logo.querySelectorAll('path');
    paths.forEach(path => {
      expect(path).toHaveAttribute('fill', '#000000');
    });
  });
});