import { expect, test } from 'vitest';
import { render, screen } from '@/test/render';
import { ListTable } from './ListTable';

const data = [
  { label: '/pricing', count: 10, percent: 50 },
  { label: '/docs', count: 10, percent: 50 },
];

test('keeps virtualized rows mounted across re-renders', () => {
  const { rerender } = render(<ListTable data={data} virtualize itemCount={2} />);
  const row = screen.getByText('/pricing');

  rerender(<ListTable data={[...data]} virtualize itemCount={2} title="Pages" />);

  expect(screen.getByText('/pricing')).toBe(row);
});
