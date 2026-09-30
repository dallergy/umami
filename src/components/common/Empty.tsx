import { useMessages } from '@/components/hooks';

export interface EmptyProps {
  message?: string;
}

export function Empty({ message }: EmptyProps) {
  const { t, messages } = useMessages();

  return (
    <div className="flex min-h-[70px] w-full flex-1 items-center justify-center px-4 py-6 text-sm text-muted-foreground">
      {message || t(messages.noDataAvailable)}
    </div>
  );
}
