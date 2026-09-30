'use client';
import { Map as MapIcon } from 'lucide-react';
import { useState } from 'react';
import { LinkButton } from '@/components/common/LinkButton';
import { Panel } from '@/components/common/Panel';
import { useMessages, useNavigation } from '@/components/hooks';
import { BreakdownCard, BreakdownList, DimensionSwitch } from '@/components/metrics/BreakdownCard';
import { WeeklyTraffic } from '@/components/metrics/WeeklyTraffic';
import { WorldMap } from '@/components/metrics/WorldMap';
import { cn } from '@/lib/cn';

export function WebsitePanels({ websiteId }: { websiteId: string }) {
  const { t, labels } = useMessages();

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <BreakdownCard
        title={t(labels.pages)}
        websiteId={websiteId}
        options={[
          { type: 'path', label: t(labels.path) },
          { type: 'entry', label: t(labels.entry) },
          { type: 'exit', label: t(labels.exit) },
          { type: 'title', label: t(labels.title) },
          { type: 'fullPath', label: t(labels.url) },
        ]}
      />
      <BreakdownCard
        title={t(labels.sources)}
        websiteId={websiteId}
        options={[
          { type: 'referrer', label: t(labels.referrers) },
          { type: 'channel', label: t(labels.channels) },
          { type: 'utmCampaign', label: t(labels.campaigns) },
          { type: 'utmSource', label: t(labels.utmSource) },
          { type: 'utmMedium', label: t(labels.utmMedium) },
        ]}
      />
      <LocationCard websiteId={websiteId} />
      <BreakdownCard
        title={t(labels.environment)}
        websiteId={websiteId}
        options={[
          { type: 'browser', label: t(labels.browsers) },
          { type: 'os', label: t(labels.os) },
          { type: 'device', label: t(labels.devices) },
          { type: 'screen', label: t(labels.screens) },
          { type: 'language', label: t(labels.languages) },
        ]}
      />
      <BreakdownCard
        title={t(labels.events)}
        websiteId={websiteId}
        options={[{ type: 'event', label: t(labels.events) }]}
      />
      <Panel paddingY="3" paddingX="4" className="gap-3 lg:col-span-2">
        <h2 className="text-sm font-semibold tracking-tight">{t(labels.traffic)}</h2>
        <WeeklyTraffic websiteId={websiteId} />
      </Panel>
    </div>
  );
}

function LocationCard({ websiteId }: { websiteId: string }) {
  const { t, labels } = useMessages();
  const { updateParams } = useNavigation();
  const [type, setType] = useState('country');
  const [showMap, setShowMap] = useState(true);
  const options = [
    { type: 'country', label: t(labels.countries) },
    { type: 'region', label: t(labels.regions) },
    { type: 'city', label: t(labels.cities) },
  ];
  const mapOpen = showMap && type === 'country';

  return (
    <Panel paddingY="3" paddingX="4" className="gap-3 lg:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-tight">{t(labels.location)}</h2>
        <div className="flex items-center gap-2">
          <DimensionSwitch
            label={t(labels.location)}
            value={type}
            options={options}
            onChange={setType}
          />
          {type === 'country' && (
            <button
              type="button"
              aria-pressed={showMap}
              aria-label={t(labels.countries)}
              onClick={() => setShowMap(open => !open)}
              className={cn(
                'inline-flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground',
                showMap && 'bg-muted text-foreground',
              )}
            >
              <MapIcon className="size-3.5" />
            </button>
          )}
        </div>
      </div>
      <div className={mapOpen ? 'grid items-start gap-3 lg:grid-cols-2' : undefined}>
        {mapOpen && (
          <div className="overflow-hidden rounded-lg border border-border bg-muted/30">
            <WorldMap websiteId={websiteId} mapHeight={240} />
          </div>
        )}
        <BreakdownList websiteId={websiteId} type={type} limit={8} />
      </div>
      <div className="flex justify-end">
        <LinkButton href={updateParams({ view: type })} variant="quiet">
          <span className="text-xs text-muted-foreground">{t(labels.more)}</span>
        </LinkButton>
      </div>
    </Panel>
  );
}
