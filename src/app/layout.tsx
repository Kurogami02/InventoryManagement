import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Inter } from 'next/font/google';
import './globals.scss';

import RootTheme from './components/RootTheme';
import { RootStyleRenderer } from './components/RootStyleRenderer';
import AppLayout from './components/AppLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hệ thống quản lý kho nguyên vật liệu Foobla',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  //Handle un-authorised sesstion to navigate Login page
  const headersList = headers();
  const cookiesStorage = cookies();
  const access_token = cookiesStorage.get('access_token')?.value;
  const ignoreAuthPathname = ['/login', '/forgot-password'];
  if (!access_token && !ignoreAuthPathname.includes(headersList.get('x-invoke-path') || '')) {
    redirect('/login');
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <RootStyleRenderer>
          <RootTheme>
            <AppLayout>{children}</AppLayout>
          </RootTheme>
        </RootStyleRenderer>
      </body>
    </html>
  );
}
