import { Button, Icon, Tooltip, TooltipTrigger } from '@umami/react-zen';
import { useSpring, useTransform } from 'motion/react';
import { type ReactNode, useEffect } from 'react';
import { AnimatedDiv } from '@/components/common/AnimatedDiv';
import { Info } from '@/components/icons';
import { ChangeLabel } from '@/components/metrics/ChangeLabel';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatNumber } from '@/lib/format';

export interface MetricCardProps {
  value: number;
  previousValue?: number;
  change?: number;
  label?: string;
  tooltip?: ReactNode;
  reverseColors?: boolean;
  formatValue?: (n: any) => string;
  showLabel?: boolean;
  showChange?: boolean;
}

export const MetricCard = ({
  value = 0,
  change = 0,
  label,
  tooltip,
  reverseColors = false,
  formatValue = formatNumber,
  showLabel = true,
  showChange = false,
}: MetricCardProps) => {
  const diff = value - change;
  const pct = diff !== 0 ? ((value - diff) / diff) * 100 : value !== 0 ? 100 : 0;
  const x = Number(value) || 0;
  const p = Number(pct) || 0;
  const xSpring = useSpring(0, { stiffness: 170, damping: 26 });
  const pctSpring = useSpring(0, { stiffness: 170, damping: 26 });
  const valueText = useTransform(xSpring, n => formatValue(n));
  const pctText = useTransform(pctSpring, n => `${Math.abs(~~n)}%`);

  useEffect(() => {
    xSpring.set(x);
  }, [x, xSpring]);

  useEffect(() => {
    pctSpring.set(p);
  }, [p, pctSpring]);

  return (
    <Card className="gap-1.5 px-5 py-4">
      {showLabel && (
        <CardHeader className="flex min-h-5 flex-row items-center justify-between gap-2 px-0">
          <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            {label}
          </p>
          {tooltip && (
            <TooltipTrigger delay={0}>
              <Button size="sm" variant="quiet" className="-my-1 size-6 p-0">
                <Icon size="sm">
                  <Info />
                </Icon>
              </Button>
              <Tooltip placement="top">{tooltip}</Tooltip>
            </TooltipTrigger>
          )}
        </CardHeader>
      )}
      <CardContent className="flex flex-wrap items-baseline gap-x-2 gap-y-1 px-0">
        <div className="text-2xl leading-8 font-bold tracking-tight text-foreground tabular-nums">
          <AnimatedDiv title={value?.toString()}>{valueText}</AnimatedDiv>
        </div>
        {showChange && (
          <ChangeLabel value={change} title={formatValue(change)} reverseColors={reverseColors}>
            <AnimatedDiv>{pctText}</AnimatedDiv>
          </ChangeLabel>
        )}
      </CardContent>
    </Card>
  );
};
