import { ConfigProvider } from 'antd';

export default function RootTheme({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          //seed token
          colorPrimary: '#f57c02',
          colorPrimaryHover: '#F7A14C',

          //alias token
          colorLink: '#f57c02',
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
