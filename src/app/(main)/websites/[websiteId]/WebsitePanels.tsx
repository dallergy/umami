'use client';
import { useState } from 'react';
import { useMessages, useNavigation } from '@/components/hooks';
import { BAR_ROW_HEIGHT } from '@/components/metrics/BarList';
import {
  BreakdownCard,
  BreakdownList,
  DetailsLink,
  REPORT_ROWS,
  ReportCard,
  ReportColumns,
  ReportTabs,
} from '@/components/metrics/BreakdownCard';
import { WeeklyTraffic } from '@/components/metrics/WeeklyTraffic';
import { WorldMap } from '@/components/metrics/WorldMap';

export function WebsitePanels({ websiteId }: { websiteId: string }) {
  const { t, labels } = useMessages();

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <BreakdownCard
        title={t(labels.sources)}
        websiteId={websiteId}
        options={[
          { type: 'channel', label: t(labels.channels), column: t(labels.channel) },
          { type: 'referrer', label: t(labels.sources), column: t(labels.source) },
          { type: 'utmCampaign', label: t(labels.campaigns), column: t(labels.campaign) },
          { type: 'utmSource', label: t(labels.utmSource) },
          { type: 'utmMedium', label: t(labels.utmMedium) },
          { type: 'utmContent', label: t(labels.utmContent) },
          { type: 'utmTerm', label: t(labels.utmTerm) },
        ]}
      />
      <BreakdownCard
        title={t(labels.pages)}
        websiteId={websiteId}
        options={[
          { type: 'path', label: t(labels.pages), column: t(labels.page) },
          { type: 'entry', label: t(labels.entry), column: t(labels.page) },
          { type: 'exit', label: t(labels.exit), column: t(labels.page) },
          { type: 'title', label: t(labels.title) },
          { type: 'fullPath', label: t(labels.url) },
          { type: 'hostname', label: t(labels.hostname) },
        ]}
      />
      <LocationsCard websiteId={websiteId} />
      <BreakdownCard
        title={t(labels.devices)}
        websiteId={websiteId}
        options={[
          { type: 'browser', label: t(labels.browsers), column: t(labels.browser) },
          { type: 'os', label: t(labels.os) },
          { type: 'device', label: t(labels.devices), column: t(labels.device) },
          { type: 'screen', label: t(labels.screens), column: t(labels.screen) },
          { type: 'language', label: t(labels.languages), column: t(labels.language) },
        ]}
      />
      <BreakdownCard
        title={t(labels.events)}
        websiteId={websiteId}
        options={[
          {
            type: 'event',
            label: t(labels.events),
            column: t(labels.event),
            metric: t(labels.total),
          },
        ]}
      />
      <ReportCard title={t(labels.traffic)}>
        <div className="flex flex-1 flex-col pt-1 pb-3">
          <WeeklyTraffic websiteId={websiteId} />
        </div>
      </ReportCard>
    </div>
  );
}

function LocationsCard({ websiteId }: { websiteId: string }) {
  const { t, labels } = useMessages();
  const { updateParams } = useNavigation();
  const [type, setType] = useState('map');
  const options = [
    { type: 'map', label: t(labels.map) },
    { type: 'country', label: t(labels.countries), column: t(labels.country) },
    { type: 'region', label: t(labels.regions), column: t(labels.region) },
    { type: 'city', label: t(labels.cities), column: t(labels.city) },
  ];
  const option = options.find(item => item.type === type);
  const isMap = type === 'map';

  return (
    <ReportCard
      title={t(labels.location)}
      tabs={
        <ReportTabs
          label={t(labels.location)}
          value={type}
          options={options}
          onChange={setType}
          maxVisible={4}
        />
      }
      footer={<DetailsLink href={updateParams({ view: isMap ? 'country' : type })} />}
    >
      {isMap ? (
        <div
          className="flex items-center justify-center"
          style={{ minHeight: REPORT_ROWS * (BAR_ROW_HEIGHT + 2) + 26 }}
        >
          <WorldMap websiteId={websiteId} mapHeight={420} allowFilter className="w-full" />
        </div>
      ) : (
        <>
          <ReportColumns label={option?.column || option?.label} metric={t(labels.visitors)} />
          <BreakdownList websiteId={websiteId} type={type} />
        </>
      )}
    </ReportCard>
  );
}
