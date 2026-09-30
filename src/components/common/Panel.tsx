import { Button, Column, type ColumnProps, Icon, Tooltip, TooltipTrigger } from '@umami/react-zen';
import { type ReactNode, useState } from 'react';
import { useMessages } from '@/components/hooks';
import { Maximize, X } from '@/components/icons';
import { cn } from '@/lib/cn';

export interface PanelProps extends ColumnProps {
  title?: string;
  description?: string;
  allowFullscreen?: boolean;
  toolbar?: ReactNode;
}

const fullscreenStyles = {
  position: 'fixed',
  width: '100vw',
  height: '100vh',
  top: 0,
  left: 0,
  border: 'none',
  zIndex: 9999,
} as any;

export function Panel({
  title,
  description,
  allowFullscreen,
  toolbar,
  style,
  children,
  height,
  width,
  className,
  ...props
}: PanelProps) {
  const { t, labels } = useMessages();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Column
      data-panel=""
      paddingY="6"
      paddingX={{ base: '3', md: '6' }}
      position="relative"
      gap
      className={cn(
        'rounded-xl border border-border bg-card text-card-foreground shadow-xs',
        className,
      )}
      {...props}
      style={{ ...style, ...(isFullscreen ? fullscreenStyles : { height, width }) }}
    >
      {title ? <h2 className="text-base font-semibold tracking-tight">{title}</h2> : null}
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      {(allowFullscreen || toolbar) && (
        <div className="flex items-center justify-end gap-1">
          {toolbar}
          {allowFullscreen &&
            (isFullscreen ? (
              <Button size="sm" variant="quiet" onPress={handleFullscreen}>
                <Icon>
                  <X />
                </Icon>
              </Button>
            ) : (
              <TooltipTrigger delay={0}>
                <Button size="sm" variant="quiet" onPress={handleFullscreen}>
                  <Icon>
                    <Maximize />
                  </Icon>
                </Button>
                <Tooltip>{t(labels.maximize)}</Tooltip>
              </TooltipTrigger>
            ))}
        </div>
      )}
      {children}
    </Column>
  );
}
