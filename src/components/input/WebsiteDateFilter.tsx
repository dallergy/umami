import { Dialog, Modal } from '@umami/react-zen';
import { differenceInCalendarDays, isAfter, isSameDay, isSameYear } from 'date-fns';
import { CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Fragment, useMemo, useState } from 'react';
import { ControlledDialog } from '@/components/common/ControlledDialog';
import {
  useDateRange,
  useDateRangeQuery,
  useKeyboardShortcuts,
  useLocale,
  useMessages,
  useNavigation,
} from '@/components/hooks';
import { DatePickerForm } from '@/components/metrics/DatePickerForm';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/cn';
import { formatDate, getDateRangeValue, getMaxSelectableDate, parseDateValue } from '@/lib/date';

export interface WebsiteDateFilterProps {
  websiteId?: string;
  compare?: string;
  showAllTime?: boolean;
  showButtons?: boolean;
  allowCompare?: boolean;
  /** 'always' shows the comparison picker permanently; 'toggle' lets people switch it on. */
  compareMode?: 'always' | 'toggle';
  /** Adds a Realtime entry (and the R shortcut) that opens the realtime view. */
  realtimeHref?: string;
  /** Enables single-key shortcuts (D, W, M, …). Only one picker per page should enable them. */
  shortcuts?: boolean;
}

interface RangeOption {
  id: string;
  value: string;
  offset?: number;
  label: string;
  shortcut?: string;
}

export function formatDateRange(startDate: Date, endDate: Date, locale: string) {
  if (isSameDay(startDate, endDate)) {
    return formatDate(startDate, 'EEE, MMM d, yyyy', locale);
  }

  if (isSameYear(startDate, endDate)) {
    return `${formatDate(startDate, 'MMM d', locale)} – ${formatDate(endDate, 'MMM d, yyyy', locale)}`;
  }

  return `${formatDate(startDate, 'MMM d, yyyy', locale)} – ${formatDate(endDate, 'MMM d, yyyy', locale)}`;
}

const triggerClass =
  'inline-flex items-center justify-center text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-35';

export function WebsiteDateFilter({
  websiteId,
  showAllTime = true,
  showButtons = true,
  allowCompare,
  compareMode = 'always',
  realtimeHref,
  shortcuts = false,
}: WebsiteDateFilterProps) {
  const { dateRange, isAllTime, isCustomRange } = useDateRange();
  const { t, labels } = useMessages();
  const { locale } = useLocale();
  const { router, updateParams, query } = useNavigation();
  const offset = Number(query.offset || 0);
  const compare = query.compare;
  const [showPicker, setShowPicker] = useState(false);
  const disableForward = isAllTime || isAfter(dateRange.endDate, new Date());
  const canStep = showButtons && !isAllTime && !isCustomRange;
  const isToggleCompare = compareMode === 'toggle';
  const compareEnabled = allowCompare && !isAllTime && (!isToggleCompare || !!compare);

  const websiteDateRange = useDateRangeQuery(websiteId);
  const hasData = !!(websiteDateRange.startDate && websiteDateRange.endDate);

  const groups: RangeOption[][] = [
    [
      { id: 'today', value: '0day', label: t(labels.today), shortcut: 'd' },
      { id: 'yesterday', value: '0day', offset: -1, label: t(labels.yesterday), shortcut: 'e' },
      { id: '24h', value: '24hour', label: t(labels.lastHours, { x: '24' }), shortcut: 'h' },
    ],
    [
      { id: 'week', value: '0week', label: t(labels.thisWeek) },
      { id: '7d', value: '7day', label: t(labels.lastDays, { x: '7' }), shortcut: 'w' },
    ],
    [
      { id: 'month', value: '0month', label: t(labels.thisMonth), shortcut: 'm' },
      { id: 'last-month', value: '0month', offset: -1, label: t(labels.lastMonth), shortcut: 'l' },
      { id: '30d', value: '30day', label: t(labels.lastDays, { x: '30' }), shortcut: 't' },
      { id: '90d', value: '90day', label: t(labels.lastDays, { x: '90' }) },
    ],
    [
      { id: 'year', value: '0year', label: t(labels.thisYear), shortcut: 'y' },
      { id: '6m', value: '6month', label: t(labels.lastMonths, { x: '6' }) },
      { id: '12m', value: '12month', label: t(labels.lastMonths, { x: '12' }) },
    ],
  ];

  const current = dateRange.value || '';
  const selected = isAllTime
    ? 'all'
    : groups.flat().find(option => option.value === current && (option.offset || 0) === offset)?.id;

  const label = useMemo(() => {
    if (isAllTime) {
      return t(labels.allTime);
    }

    const option = groups.flat().find(item => item.id === selected);

    if (option) {
      return option.label;
    }

    if (!isCustomRange && offset !== 0) {
      const { num, unit } = parseDateValue(current) || {};

      if (!num && unit === 'day') {
        return formatDate(dateRange.startDate, 'EEE, MMM d', locale);
      }

      if (!num && unit === 'month') {
        return formatDate(dateRange.startDate, 'MMMM yyyy', locale);
      }

      if (!num && unit === 'year') {
        return formatDate(dateRange.startDate, 'yyyy', locale);
      }
    }

    return formatDateRange(dateRange.startDate, dateRange.endDate, locale);
  }, [selected, isAllTime, isCustomRange, offset, current, dateRange, locale, t, labels]);

  const applyRange = (value: string, nextOffset = 0) => {
    if (value === 'all') {
      if (!hasData) {
        return;
      }

      router.push(
        updateParams({
          date: `${getDateRangeValue(websiteDateRange.startDate, websiteDateRange.endDate)}:all`,
          offset: undefined,
          unit: undefined,
          page: undefined,
        }),
      );
      return;
    }

    router.push(
      updateParams({
        date: value,
        offset: nextOffset || undefined,
        unit: undefined,
        page: undefined,
      }),
    );
  };

  const step = (increment: number) => {
    if (!canStep || (increment > 0 && disableForward)) {
      return;
    }

    router.push(updateParams({ offset: offset + increment || undefined }));
  };

  const setCompare = (value?: string) => {
    router.push(updateParams({ compare: value }));
  };

  const shortcutHandlers: Record<string, () => void> = {
    c: () => setShowPicker(true),
  };

  // Only claim the arrow keys when they can do something.
  if (canStep) {
    shortcutHandlers.ArrowLeft = () => step(-1);
    shortcutHandlers.ArrowRight = () => step(1);
  }

  for (const option of groups.flat()) {
    if (option.shortcut) {
      shortcutHandlers[option.shortcut] = () => applyRange(option.value, option.offset);
    }
  }

  if (showAllTime && hasData) {
    shortcutHandlers.a = () => applyRange('all');
  }

  if (realtimeHref) {
    shortcutHandlers.r = () => router.push(realtimeHref);
  }

  if (allowCompare && isToggleCompare && !isAllTime) {
    shortcutHandlers.x = () => setCompare(compare ? undefined : 'prev');
  }

  useKeyboardShortcuts(shortcutHandlers, shortcuts);

  const handlePickerChange = (value: string) => {
    setShowPicker(false);
    router.push(updateParams({ date: value, offset: undefined, unit: undefined, page: undefined }));
  };

  const kbd = (key?: string) =>
    shortcuts && key ? (
      <kbd className="ml-auto rounded border border-border bg-muted px-1.5 font-sans text-[10px] font-medium text-muted-foreground uppercase">
        {key}
      </kbd>
    ) : null;

  const itemClass = (active: boolean) =>
    cn('gap-2 pr-1.5', active && 'bg-accent/70 font-medium text-foreground');

  const rangeDays = differenceInCalendarDays(dateRange.endDate, dateRange.startDate) + 1;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex h-9 items-stretch overflow-hidden rounded-lg border border-border bg-card shadow-card">
        {canStep && (
          <button
            type="button"
            aria-label={t(labels.previous)}
            title={shortcuts ? `${t(labels.previous)} (←)` : t(labels.previous)}
            onClick={() => step(-1)}
            className={cn(triggerClass, 'w-8 border-r border-border')}
          >
            <ChevronLeft className="size-4" />
          </button>
        )}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger
            data-test="date-range-picker"
            className="inline-flex min-w-0 items-center gap-2 px-3 text-[13px] font-medium text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset data-[state=open]:bg-accent"
            title={isCustomRange || offset ? `${rangeDays}d` : undefined}
          >
            <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{label}</span>
            <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            {realtimeHref && (
              <>
                <DropdownMenuItem
                  onSelect={() => router.push(realtimeHref)}
                  className="gap-2 pr-1.5"
                >
                  <span className="relative flex size-2">
                    <span className="live-ping absolute inline-flex size-full rounded-full bg-live" />
                    <span className="relative inline-flex size-2 rounded-full bg-live" />
                  </span>
                  {t(labels.realtime)}
                  {kbd('r')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            {groups.map((group, index) => (
              <Fragment key={group[0].id}>
                {index > 0 && <DropdownMenuSeparator />}
                {group.map(option => (
                  <DropdownMenuItem
                    key={option.id}
                    onSelect={() => applyRange(option.value, option.offset)}
                    className={itemClass(selected === option.id)}
                  >
                    {option.label}
                    {kbd(option.shortcut)}
                  </DropdownMenuItem>
                ))}
              </Fragment>
            ))}
            <DropdownMenuSeparator />
            {showAllTime && hasData && (
              <DropdownMenuItem
                onSelect={() => applyRange('all')}
                className={itemClass(selected === 'all')}
              >
                {t(labels.allTime)}
                {kbd('a')}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onSelect={() => setShowPicker(true)}
              className={itemClass(isCustomRange)}
            >
              {t(labels.customRange)}…{kbd('c')}
            </DropdownMenuItem>
            {allowCompare && isToggleCompare && !isAllTime && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  role="menuitemcheckbox"
                  aria-checked={!!compare}
                  onSelect={() => setCompare(compare ? undefined : 'prev')}
                  className="gap-2 pr-1.5"
                >
                  <span
                    aria-hidden
                    className={cn(
                      'flex size-3.5 items-center justify-center rounded-[4px] border',
                      compare
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border-strong',
                    )}
                  >
                    {compare && <Check className="size-3 text-primary-foreground" />}
                  </span>
                  {t(labels.compare)}
                  {kbd('x')}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        {canStep && (
          <button
            type="button"
            aria-label={t(labels.next)}
            title={shortcuts ? `${t(labels.next)} (→)` : t(labels.next)}
            onClick={() => step(1)}
            disabled={disableForward}
            className={cn(triggerClass, 'w-8 border-l border-border')}
          >
            <ChevronRight className="size-4" />
          </button>
        )}
      </div>
      {compareEnabled && (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-[13px] text-muted-foreground shadow-card outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-accent">
            <span className="text-xs font-medium tracking-wide uppercase">vs</span>
            <span className="font-medium text-foreground">
              {compare === 'yoy' ? t(labels.previousYear) : t(labels.previousPeriod)}
            </span>
            <ChevronDown className="size-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuRadioGroup value={compare || 'prev'} onValueChange={setCompare}>
              <DropdownMenuRadioItem value="prev">{t(labels.previousPeriod)}</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="yoy">{t(labels.previousYear)}</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            {isToggleCompare && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setCompare(undefined)} className="gap-2">
                  <Check className="size-4 opacity-0" />
                  {t(labels.cancel)}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {showPicker && (
        <ControlledDialog>
          <Modal isOpen={true} onOpenChange={open => !open && setShowPicker(false)}>
            <Dialog>
              <DatePickerForm
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                minDate={new Date(2000, 0, 1)}
                maxDate={getMaxSelectableDate()}
                onChange={handlePickerChange}
                onClose={() => setShowPicker(false)}
              />
            </Dialog>
          </Modal>
        </ControlledDialog>
      )}
    </div>
  );
}
