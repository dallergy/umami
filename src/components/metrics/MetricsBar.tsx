import { Grid, type GridProps } from '@umami/react-zen';
import type { ReactNode } from 'react';

export interface MetricsBarProps extends GridProps {
  children?: ReactNode;
}

export function MetricsBar({ children, ...props }: MetricsBarProps) {
  return (
    <Grid className="gap-3" columns="repeat(auto-fit, minmax(160px, 1fr))" {...props}>
      {children}
    </Grid>
  );
}
