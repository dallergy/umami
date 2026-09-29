'use client';
import { Loading } from '@umami/react-zen';
import { useRouter } from 'next/navigation';
import { type PropsWithChildren, useEffect } from 'react';
import { useLoginQuery } from '@/components/hooks';
import { AuthFrame } from './AuthFrame';
import { LoginForm } from './LoginForm';

export function LoginPageWrapper({ children }: PropsWithChildren) {
  const { user, isLoading } = useLoginQuery();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user, router]);

  if (isLoading || user) {
    return <Loading placement="absolute" />;
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted px-4 py-12">{children}</div>
  );
}

export function LoginPage() {
  return (
    <LoginPageWrapper>
      <AuthFrame>
        <LoginForm />
      </AuthFrame>
    </LoginPageWrapper>
  );
}
