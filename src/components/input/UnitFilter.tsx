import { useMessages, useNavigation } from '@/components/hooks';
import { cn } from '@/lib/cn';
import { DATE_RANGE_CONFIG, DEFAULT_DATE_RANGE_VALUE } from '@/lib/constants';
import { getItem } from '@/lib/storage';

export function UnitFilter() {
  const { t, labels } = useMessages();
  const { router, query, updateParams } = useNavigation();

  const DATE_RANGE_UNIT_CONFIG = {
    '0week': {
      defaultUnit: 'day',
      availableUnits: ['day', 'hour'],
    },
    '7day': {
      defaultUnit: 'day',
      availableUnits: ['day', 'hour'],
    },
    '0month': {
      defaultUnit: 'day',
      availableUnits: ['day', 'hour'],
    },
    '30day': {
      defaultUnit: 'day',
      availableUnits: ['day', 'hour'],
    },
    '90day': {
      defaultUnit: 'day',
      availableUnits: ['day', 'month'],
    },
    '6month': {
      defaultUnit: 'month',
      availableUnits: ['month', 'day'],
    },
  };

  const unitConfig =
    DATE_RANGE_UNIT_CONFIG[query.date || getItem(DATE_RANGE_CONFIG) || DEFAULT_DATE_RANGE_VALUE];

  if (!unitConfig) {
    return null;
  }

  const handleChange = (value: string) => {
    router.push(updateParams({ unit: value }));
  };

  const options = [...unitConfig.availableUnits]
    .sort((a: string, b: string) => UNIT_ORDER.indexOf(a) - UNIT_ORDER.indexOf(b))
    .map((unit: string) => ({
      id: unit,
      label: t(labels[unit]),
    }));

  const selectedUnit = query.unit ?? unitConfig.defaultUnit;

  return (
    <div
      role="radiogroup"
      className="inline-flex h-7 items-center rounded-md bg-muted p-0.5 text-xs font-medium"
    >
      {options.map(({ id, label }) => {
        const active = id === selectedUnit;

        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => handleChange(id)}
            className={cn(
              'inline-flex h-6 items-center rounded-[5px] px-2 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring',
              active
                ? 'bg-card text-foreground shadow-card'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

const UNIT_ORDER = ['minute', 'hour', 'day', 'month', 'year'];
