import { beforeEach, expect, test } from 'vitest';
import { getTestRouter, resetTestNavigation } from '@/test/navigation';
import { render, screen } from '@/test/render';
import { WebsiteDateFilter } from './WebsiteDateFilter';

beforeEach(() => {
  resetTestNavigation();
});

const pushedOffsets = () =>
  getTestRouter().push.mock.calls.map(([url]) =>
    new URL(url, 'http://localhost').searchParams.get('offset'),
  );

test('steps accumulate when pressed again before the URL updates', async () => {
  const { user } = render(<WebsiteDateFilter websiteId="site-1" />, {
    route: '/websites/site-1?date=7day',
  });
  const previous = screen.getByRole('button', { name: 'Previous' });

  await user.click(previous);
  await user.click(previous);

  expect(pushedOffsets()).toEqual(['-1', '-2']);
});

test('arrow keys step from the pending offset', async () => {
  const { user } = render(<WebsiteDateFilter websiteId="site-1" shortcuts />, {
    route: '/websites/site-1?date=7day',
  });

  await user.keyboard('{ArrowLeft}{ArrowLeft}{ArrowRight}{ArrowRight}{ArrowRight}');

  // The last press would move past the range on screen, so it is ignored.
  expect(pushedOffsets()).toEqual(['-1', '-2', '-1', null]);
});

test('does not step forward past the current range', async () => {
  const { user } = render(<WebsiteDateFilter websiteId="site-1" />, {
    route: '/websites/site-1?date=7day',
  });

  await user.click(screen.getByRole('button', { name: 'Next' }));

  expect(getTestRouter().push).not.toHaveBeenCalled();
});
