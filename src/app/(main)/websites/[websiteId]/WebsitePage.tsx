'use client';
import { useState } from 'react';
import { ExpandedViewModal } from '@/app/(main)/websites/[websiteId]/ExpandedViewModal';
import { useNavigation } from '@/components/hooks';
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
  const { query } = useNavigation();
  const compareMode = !!query.compare;

  return (
    <div className="flex flex-col">
      <WebsiteControls
        websiteId={websiteId}
        allowBounceFilter={true}
        allowCompare={true}
        compareMode="toggle"
      />
      <div className="flex flex-col gap-4">
        <section className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-card">
          <WebsiteMetricsBar
            websiteId={websiteId}
            variant="strip"
            focus={focus}
            onFocusChange={setFocus}
            compareMode={compareMode}
          />
          <div className="border-t border-border px-3 pt-2 pb-3 sm:px-5 sm:pb-4">
            <WebsiteChart
              websiteId={websiteId}
              focus={focus}
              compareMode={compareMode}
              chartHeight="300px"
              showAnnotations
              onAnnotationMoreClick={setAnnotationRange}
              legendActions={
                <>
                  <AnnotationsButton websiteId={websiteId} />
                  <UnitFilter />
                </>
              }
            />
          </div>
        </section>
        <WebsitePanels websiteId={websiteId} />
      </div>
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
    </div>
  );
}
