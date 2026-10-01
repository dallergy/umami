'use client';
import { PageBody } from '@/components/common/PageBody';
import { PageHeader } from '@/components/common/PageHeader';
import { useLoginQuery, useMessages, useNavigation, useTeamMembersQuery } from '@/components/hooks';
import { ROLES } from '@/lib/constants';
import { WebsiteAddButton } from './WebsiteAddButton';
import { WebsitesDataTable } from './WebsitesDataTable';

export function WebsitesPage() {
  const { user } = useLoginQuery();
  const { teamId } = useNavigation();
  const { t, labels } = useMessages();
  const { data } = useTeamMembersQuery(teamId);

  const showActions =
    (teamId &&
      data?.data.filter(team => team.userId === user.id && team.role !== ROLES.teamViewOnly)
        .length > 0) ||
    (!teamId && user.role !== ROLES.viewOnly);

  return (
    <PageBody>
      <PageHeader title={t(labels.websites)}>
        {showActions && <WebsiteAddButton teamId={teamId} />}
      </PageHeader>
      <WebsitesDataTable teamId={teamId} showActions={showActions} />
    </PageBody>
  );
}
