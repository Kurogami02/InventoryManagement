import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Đăng nhập',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <div className={'center-card'}>{children}</div>;
}
