'use client';
import { Column } from '@umami/react-zen';
import { useState } from 'react';
import { ExpandedViewModal } from '@/app/(main)/websites/[websiteId]/ExpandedViewModal';
import { Panel } from '@/components/common/Panel';
import { DialogButton } from '@/components/input/DialogButton';
import { UnitFilter } from '@/components/input/UnitFilter';
import type { AnnotationRange } from '@/lib/annotations';
import { AnnotationsButton } from './annotations/AnnotationsButton';
import { AnnotationsModal } from './annotations/AnnotationsModal';
import type { ChartFocus } from './WebsiteChart';
import { WebsiteChart } from './WebsiteChart';
import { WebsiteControls } from './WebsiteControls';
import { WebsiteMetricsBar } from './WebsiteMetricsBar';
import { WebsitePanels } from './WebsitePanels';

export function WebsitePage({ websiteId }: { websiteId: string }) {
  const [annotationRange, setAnnotationRange] = useState<AnnotationRange | null>(null);
  const [focus, setFocus] = useState<ChartFocus>('visitors');

  return (
    <Column gap="3">
      <WebsiteControls websiteId={websiteId} allowBounceFilter={true} />
      <Panel paddingY="3" paddingX="4" className="gap-2">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <WebsiteMetricsBar
              websiteId={websiteId}
              showChange={true}
              variant="strip"
              focus={focus}
              onFocusChange={setFocus}
            />
          </div>
          <UnitFilter />
        </div>
        <WebsiteChart
          websiteId={websiteId}
          focus={focus}
          chartHeight="220px"
          showAnnotations
          onAnnotationMoreClick={setAnnotationRange}
          legendActions={<AnnotationsButton websiteId={websiteId} />}
        />
      </Panel>
      <WebsitePanels websiteId={websiteId} />
      <ExpandedViewModal websiteId={websiteId} />
      <DialogButton
        isOpen={!!annotationRange}
        onOpenChange={isOpen => !isOpen && setAnnotationRange(null)}
        title={null}
        width="800px"
      >
        {({ close }) =>
          annotationRange && (
            <AnnotationsModal
              websiteId={websiteId}
              range={annotationRange}
              onClose={() => {
                close();
                setAnnotationRange(null);
              }}
            />
          )
        }
      </DialogButton>
    </Column>
  );
}
