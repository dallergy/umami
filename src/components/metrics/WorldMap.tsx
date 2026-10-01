import { Column, type ColumnProps, useTheme } from '@umami/react-zen';
import { colord } from 'colord';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import {
  useCountryNames,
  useLocale,
  useMessages,
  useNavigation,
  useWebsiteMetricsQuery,
} from '@/components/hooks';
import { getThemeColors } from '@/lib/colors';
import { ISO_COUNTRIES, MAP_FILE } from '@/lib/constants';
import { percentFilter } from '@/lib/filters';
import { formatLongNumber } from '@/lib/format';

export interface WorldMapProps extends ColumnProps {
  websiteId?: string;
  data?: any[];
  mapHeight?: number;
  /** Pan and zoom support. Off by default: it attaches extra listeners and is rarely needed. */
  zoomable?: boolean;
  /** Clicking a country filters the dashboard to it. */
  allowFilter?: boolean;
}

// The topology is large; load and parse it once per page load and share it across maps.
let topologyPromise: Promise<any> | null = null;

function loadTopology() {
  if (!topologyPromise) {
    topologyPromise = fetch(`${process.env.basePath || ''}${MAP_FILE}`)
      .then(res => (res.ok ? res.json() : Promise.reject(res.statusText)))
      .catch(error => {
        topologyPromise = null;
        throw error;
      });
  }

  return topologyPromise;
}

function useTopology() {
  const [topology, setTopology] = useState<any>(null);

  useEffect(() => {
    let active = true;

    loadTopology()
      .then(data => active && setTopology(data))
      .catch(() => null);

    return () => {
      active = false;
    };
  }, []);

  return topology;
}

interface Palette {
  base: string;
  empty: string;
  stroke: string;
  hover: string;
}

const CountryLayer = memo(function CountryLayer({
  topology,
  values,
  palette,
  theme,
  onHover,
  onLeave,
  onSelect,
}: {
  topology: any;
  values: Map<string, { y: number; z: number }>;
  palette: Palette;
  theme: string;
  onHover: (code: string, event: React.MouseEvent) => void;
  onLeave: () => void;
  onSelect?: (code: string) => void;
}) {
  const fill = (code: string) => {
    const country = values.get(code);

    if (!country) {
      return palette.empty;
    }

    // Square-root scaling keeps mid-sized countries visible next to a dominant one.
    const share = Math.sqrt(Math.max(0, Math.min(1, country.z / 100)));

    return colord(palette.base)
      .alpha(theme === 'dark' ? 0.25 + share * 0.75 : 0.18 + share * 0.82)
      .toRgbString();
  };

  return (
    <Geographies geography={topology}>
      {({ geographies }) =>
        geographies.map(geo => {
          const code = ISO_COUNTRIES[geo.id];

          if (code === 'AQ') {
            return null;
          }

          return (
            <Geography
              key={geo.rsmKey}
              geography={geo}
              fill={fill(code)}
              stroke={palette.stroke}
              strokeWidth={0.5}
              style={{
                default: { outline: 'none' },
                hover: {
                  outline: 'none',
                  fill: palette.hover,
                  cursor: onSelect && values.has(code) ? 'pointer' : 'default',
                },
                pressed: { outline: 'none' },
              }}
              onMouseEnter={(event: React.MouseEvent) => onHover(code, event)}
              onMouseMove={(event: React.MouseEvent) => onHover(code, event)}
              onMouseLeave={onLeave}
              onClick={onSelect && values.has(code) ? () => onSelect(code) : undefined}
            />
          );
        })
      }
    </Geographies>
  );
});

export function WorldMap({
  websiteId,
  data,
  mapHeight = 600,
  zoomable = false,
  allowFilter = false,
  ...props
}: WorldMapProps) {
  const { theme } = useTheme();
  const { colors } = useMemo(() => getThemeColors(theme), [theme]);
  const { locale } = useLocale();
  const { t, labels } = useMessages();
  const { countryNames } = useCountryNames(locale);
  const { router, updateParams } = useNavigation();
  const topology = useTopology();
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const { data: mapData } = useWebsiteMetricsQuery(
    websiteId,
    { type: 'country' },
    { enabled: !!websiteId && !data },
  );

  const source = (data || mapData || []) as { x: string; y: number }[];
  // Polling (e.g. realtime) returns new arrays even when nothing changed; keying on the
  // content keeps the country layer from re-rendering every few seconds.
  const signature = source.map(({ x, y }) => `${x}:${y}`).join('|');

  const values = useMemo(() => {
    const metrics = percentFilter(source as any[]);
    return new Map<string, { y: number; z: number }>(metrics.map(({ x, y, z }) => [x, { y, z }]));
  }, [signature]);

  const palette = useMemo<Palette>(
    () => ({
      base: colors.map.baseColor,
      empty: colors.map.fillColor,
      stroke: theme === 'dark' ? '#0c0e13' : '#ffffff',
      hover: colord(colors.map.baseColor).darken(0.08).toHex(),
    }),
    [colors, theme],
  );

  // The tooltip is positioned imperatively so hovering never re-renders the map.
  const visitorsLabel = t(labels.visitors);
  const unknownLabel = t(labels.unknown);
  const handleHover = useCallback(
    (code: string, event: React.MouseEvent) => {
      const tooltip = tooltipRef.current;
      const container = containerRef.current;

      if (!tooltip || !container) {
        return;
      }

      const rect = container.getBoundingClientRect();
      const count = values.get(code)?.y || 0;
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      tooltip.textContent = `${countryNames[code] || unknownLabel} · ${formatLongNumber(count)} ${visitorsLabel.toLocaleLowerCase(locale)}`;
      tooltip.style.opacity = '1';
      tooltip.style.transform = `translate(${x > rect.width * 0.6 ? 'calc(-100% - 12px)' : '12px'}, ${y - 36}px)`;
      tooltip.style.left = `${x}px`;
    },
    [values, countryNames, unknownLabel, visitorsLabel, locale],
  );

  const handleLeave = useCallback(() => {
    if (tooltipRef.current) {
      tooltipRef.current.style.opacity = '0';
    }
  }, []);

  const handleSelect = useCallback(
    (code: string) => router.push(updateParams({ country: `eq.${code}` })),
    [router, updateParams],
  );

  const layer = topology ? (
    <CountryLayer
      topology={topology}
      values={values}
      palette={palette}
      theme={theme}
      onHover={handleHover}
      onLeave={handleLeave}
      onSelect={allowFilter ? handleSelect : undefined}
    />
  ) : null;

  return (
    <Column {...props} style={{ margin: 'auto 0', overflow: 'hidden', ...props.style }}>
      <div ref={containerRef} className="relative">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={zoomable ? undefined : { scale: 120, center: [10, 30] }}
          height={mapHeight}
          width={800}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        >
          {zoomable ? (
            <ZoomableGroup zoom={0.8} minZoom={0.7} center={[0, 40]}>
              {layer}
            </ZoomableGroup>
          ) : (
            layer
          )}
        </ComposableMap>
        <div
          ref={tooltipRef}
          role="tooltip"
          className="pointer-events-none absolute top-0 left-0 z-10 rounded-md border border-border bg-popover px-2 py-1 text-xs font-medium whitespace-nowrap text-popover-foreground shadow-pop transition-opacity"
          style={{ opacity: 0 }}
        />
      </div>
    </Column>
  );
}
