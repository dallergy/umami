import { useTheme } from '@umami/react-zen';
import { useCallback, useMemo } from 'react';
import { BarChart, type BarChartProps } from '@/components/charts/BarChart';
import { useLocale, useMessages } from '@/components/hooks';
import { renderDateLabels } from '@/lib/charts';
import { getThemeColors } from '@/lib/colors';
import { generateTimeSeries } from '@/lib/date';

export interface PageviewsChartProps extends BarChartProps {
  data: {
    pageviews: any[];
    sessions: any[];
    compare?: {
      pageviews: any[];
      sessions: any[];
    };
  };
  unit: string;
}

export function PageviewsChart({
  data,
  unit,
  minDate,
  maxDate,
  focus,
  height = '400px',
  ...props
}: PageviewsChartProps & { focus?: 'visitors' | 'views'; height?: string }) {
  const { t, labels } = useMessages();
  const { theme } = useTheme();
  const { locale, dateLocale } = useLocale();
  const { colors } = useMemo(() => getThemeColors(theme), [theme]);

  const chartData: any = useMemo(() => {
    if (!data) return;

    const visitors = {
      type: 'bar',
      label: t(labels.visitors),
      data: generateTimeSeries(data.sessions, minDate, maxDate, unit, dateLocale),
      borderWidth: 1,
      barPercentage: 0.9,
      categoryPercentage: 0.9,
      ...colors.chart.visitors,
      order: 3,
    };
    const views = {
      type: 'bar',
      label: t(labels.views),
      data: generateTimeSeries(data.pageviews, minDate, maxDate, unit, dateLocale),
      barPercentage: 0.9,
      categoryPercentage: 0.9,
      borderWidth: 1,
      ...colors.chart.views,
      order: 4,
    };
    const compare = data.compare
      ? [
          ...(!focus || focus === 'views'
            ? [
                {
                  type: 'line',
                  label: `${t(labels.views)} (${t(labels.previous)})`,
                  data: generateTimeSeries(
                    data.compare.pageviews,
                    minDate,
                    maxDate,
                    unit,
                    dateLocale,
                  ),
                  borderWidth: 2,
                  backgroundColor: '#8601B0',
                  borderColor: '#8601B0',
                  order: 1,
                },
              ]
            : []),
          ...(!focus || focus === 'visitors'
            ? [
                {
                  type: 'line',
                  label: `${t(labels.visitors)} (${t(labels.previous)})`,
                  data: generateTimeSeries(
                    data.compare.sessions,
                    minDate,
                    maxDate,
                    unit,
                    dateLocale,
                  ),
                  borderWidth: 2,
                  backgroundColor: '#f15bb5',
                  borderColor: '#f15bb5',
                  order: 2,
                },
              ]
            : []),
        ]
      : [];

    return {
      __id: Date.now(),
      datasets: [
        ...(!focus || focus === 'visitors' ? [visitors] : []),
        ...(!focus || focus === 'views' ? [views] : []),
        ...compare,
      ],
    };
  }, [data, locale, focus, colors, minDate, maxDate, unit, dateLocale, t, labels]);

  const renderXLabel = useCallback(renderDateLabels(unit, locale), [unit, locale]);

  return (
    <BarChart
      {...props}
      chartData={chartData}
      unit={unit}
      minDate={minDate}
      maxDate={maxDate}
      renderXLabel={renderXLabel}
      height={height}
    />
  );
}
