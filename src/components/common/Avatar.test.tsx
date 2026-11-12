import { expect, test } from 'vitest';
import { render, screen } from '@/test/render';
import { Avatar } from './Avatar';

test('shows a new avatar when the seed changes on the same element', () => {
  const { rerender } = render(<Avatar seed="session-a" size={32} />);
  const image = screen.getByAltText('Avatar') as HTMLImageElement;
  const first = image.src;

  rerender(<Avatar seed="session-b" size={32} />);

  expect(screen.getByAltText('Avatar')).toBe(image);
  expect(image.src).not.toBe(first);
});
