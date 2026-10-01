import { Icon, Row, Text } from '@umami/react-zen';
import { DataGrid } from '@/components/common/DataGrid';
import Link from '@/components/common/Link';
import { useLoginQuery, useNavigation, useUserWebsitesQuery } from '@/components/hooks';
import { Favicon } from '@/index';
import { WebsiteCards } from './WebsiteCards';
import { WebsitesTable } from './WebsitesTable';

function WebsitesView({
  data,
  displayMode,
  showActions,
  renderLink,
}: {
  data: any[];
  displayMode?: 'table' | 'cards';
  showActions?: boolean;
  renderLink: (row: any) => React.ReactNode;
}) {
  if (displayMode === 'table') {
    return (
      <div className="rounded-lg border border-border bg-card px-4 py-2 shadow-card">
        <WebsitesTable data={data} showActions={showActions} renderLink={renderLink} />
      </div>
    );
  }

  return <WebsiteCards data={data} showActions={showActions} />;
}

export function WebsitesDataTable({
  userId,
  teamId,
  showActions = true,
}: {
  userId?: string;
  teamId?: string;
  showActions?: boolean;
}) {
  const { user } = useLoginQuery();
  const queryResult = useUserWebsitesQuery({ userId: userId || user?.id, teamId });
  const { renderUrl } = useNavigation();

  const renderLink = (row: any) => (
    <Row alignItems="center" gap="3" minWidth="0" width="100%">
      <Icon size="md" color="muted" style={{ flexShrink: 0 }}>
        <Favicon domain={row.domain} />
      </Icon>
      <Text truncate title={row.name} style={{ maxWidth: '100%' }}>
        <Link href={renderUrl(`/websites/${row.id}`, false)}>{row.name}</Link>
      </Text>
    </Row>
  );

  return (
    <DataGrid
      query={queryResult}
      allowSearch
      allowPaging
      defaultDisplayMode="cards"
      displayModeKey="umami.websites.displayMode"
    >
      {({ data }) => <WebsitesView data={data} showActions={showActions} renderLink={renderLink} />}
    </DataGrid>
  );
}
