import {
  Button,
  Dialog,
  DialogTrigger,
  Icon,
  Modal,
  Text,
  Tooltip,
  TooltipTrigger,
} from '@umami/react-zen';
import { SegmentEditForm } from '@/app/(main)/websites/[websiteId]/segments/SegmentEditForm';
import {
  useFilters,
  useFormat,
  useMessages,
  useMobile,
  useNavigation,
  useWebsiteSegmentQuery,
} from '@/components/hooks';
import { Bookmark, X } from '@/components/icons';
import {
  isSearchOperator,
  serializeSessionPropertyFilters,
  serializeUniversalEventPropertyFilters,
} from '@/lib/params';

export function FilterBar({ websiteId }: { websiteId?: string }) {
  const { t, labels } = useMessages();
  const { isMobile } = useMobile();
  const { formatValue } = useFormat();
  const { router, pathname, updateParams, replaceParams, query } = useNavigation();
  const { segment, cohort } = query;
  const { filters, eventPropertyFilters, sessionPropertyFilters, operatorLabels } = useFilters();
  const { data, isLoading } = useWebsiteSegmentQuery(websiteId, segment || cohort);
  const canSaveSegment =
    !!websiteId &&
    (filters.length > 0 || sessionPropertyFilters.length > 0) &&
    eventPropertyFilters.length === 0 &&
    !segment &&
    !cohort &&
    !pathname.includes('/share');

  const handleCloseFilter = (param: string) => {
    router.push(updateParams({ [param]: undefined }));
  };

  const handleResetFilter = () => {
    router.push(replaceParams());
  };

  const handleSessionPropertyFilterRemove = (index: number) => {
    const clearedSessionPropertyFilters = Object.fromEntries(
      Object.keys(query)
        .filter(key => /^spf\d+$/.test(key))
        .map(key => [key, undefined]),
    );
    const nextSessionPropertyFilters = sessionPropertyFilters.filter((_, i) => i !== index);

    router.push(
      updateParams({
        ...clearedSessionPropertyFilters,
        ...serializeSessionPropertyFilters(nextSessionPropertyFilters),
      }),
    );
  };

  const handleEventPropertyFilterRemove = (index: number) => {
    const clearedEventPropertyFilters = Object.fromEntries(
      Object.keys(query)
        .filter(key => /^epf\d+$/.test(key))
        .map(key => [key, undefined]),
    );
    const nextEventPropertyFilters = eventPropertyFilters.filter((_, i) => i !== index);

    router.push(
      updateParams({
        ...clearedEventPropertyFilters,
        ...serializeUniversalEventPropertyFilters(nextEventPropertyFilters),
      }),
    );
  };

  const handleSegmentRemove = (type: string) => {
    router.push(updateParams({ [type]: undefined }));
  };

  if (
    !filters.length &&
    !eventPropertyFilters.length &&
    !sessionPropertyFilters.length &&
    !segment &&
    !cohort
  ) {
    return null;
  }

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
      {segment && !isLoading && (
        <FilterItem
          name="segment"
          label={t(labels.segment)}
          value={data?.name || segment}
          operator={operatorLabels.eq}
          onRemove={() => handleSegmentRemove('segment')}
        />
      )}
      {cohort && !isLoading && (
        <FilterItem
          name="cohort"
          label={t(labels.cohort)}
          value={data?.name || cohort}
          operator={operatorLabels.eq}
          onRemove={() => handleSegmentRemove('cohort')}
        />
      )}
      {filters.map(filter => {
        const { name, type, label, operator, value } = filter;
        const paramValue = isSearchOperator(operator)
          ? value
          : String(value)
              .split(',')
              .map(v => formatValue(v, type || name))
              .join(', ');

        return (
          <FilterItem
            key={name}
            name={name}
            label={label}
            operator={operatorLabels[operator]}
            value={paramValue}
            onRemove={(name: string) => handleCloseFilter(name)}
          />
        );
      })}
      {eventPropertyFilters.map((filter, index) => (
        <FilterItem
          key={`epf${index}`}
          name={`epf${index}`}
          label={`${t(labels.eventProperties)}: ${filter.propertyName}`}
          operator={operatorLabels[filter.operator]}
          value={filter.value}
          onRemove={() => handleEventPropertyFilterRemove(index)}
        />
      ))}
      {sessionPropertyFilters.map((filter, index) => (
        <FilterItem
          key={`spf${index}`}
          name={`spf${index}`}
          label={`${t(labels.sessionData)}: ${filter.propertyName}`}
          operator={operatorLabels[filter.operator]}
          value={filter.value}
          onRemove={() => handleSessionPropertyFilterRemove(index)}
        />
      ))}
      <DialogTrigger>
        {canSaveSegment && (
          <TooltipTrigger delay={0}>
            <Button variant="zero" className="size-8 rounded-full p-0 text-muted-foreground">
              <Icon size="sm">
                <Bookmark />
              </Icon>
            </Button>
            <Tooltip>
              <Text>{t(labels.saveSegment)}</Text>
            </Tooltip>
          </TooltipTrigger>
        )}
        <Modal placement={isMobile ? 'fullscreen' : 'center'}>
          <Dialog
            title={t(labels.segment)}
            style={{
              width: isMobile ? '100%' : '800px',
              height: isMobile ? '100%' : undefined,
              minHeight: 300,
              maxHeight: isMobile ? '100%' : 'calc(100dvh - 40px)',
              overflowY: 'auto',
              padding: '32px',
            }}
          >
            {({ close }) => {
              return (
                <SegmentEditForm
                  websiteId={websiteId}
                  onClose={close}
                  filters={filters}
                  sessionPropertyFilters={sessionPropertyFilters}
                />
              );
            }}
          </Dialog>
        </Modal>
      </DialogTrigger>
      <button
        type="button"
        onClick={handleResetFilter}
        className="inline-flex h-8 items-center rounded-full px-2.5 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        {t(labels.clearAll)}
      </button>
    </div>
  );
}

const FilterItem = ({ name, label, operator, value, onRemove }) => {
  return (
    <span className="inline-flex h-8 max-w-full min-w-0 items-center gap-1 rounded-full border border-border bg-card pr-1 pl-3 text-[13px] shadow-card">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="shrink-0 text-subtle-foreground">{operator}</span>
      <span
        className="min-w-0 truncate font-medium text-foreground"
        style={{ maxWidth: 'min(320px, calc(100vw - 12rem))' }}
        title={String(value)}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label={`${label} ×`}
        onClick={() => onRemove(name)}
        className="ml-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="size-3.5" />
      </button>
    </span>
  );
};
