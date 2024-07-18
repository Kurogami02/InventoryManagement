'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  AuditOutlined,
  BankOutlined,
  CopyOutlined,
  ExportOutlined,
  FileSyncOutlined,
  GoldOutlined,
  HomeOutlined,
  ImportOutlined,
  ShopOutlined,
  SkinOutlined,
  SwapOutlined,
  SyncOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Menu, Layout, theme } from 'antd';
import { getCookie } from 'cookies-next';
import MyAccount from './MyAccount';
import { UserType } from '@/libs/api/user-api';

const { Header, Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(args: {
  label: React.ReactNode;
  key: React.Key;
  icon?: React.ReactNode;
  onClick?: Function;
}): MenuItem {
  return args as MenuItem;
}

//Valid page that uses AppLayout (elements that have icons are also in left menu)
const leftMenuItems = [
  // {
  //   pathname: '',
  //   label: 'Trang chủ',
  //   icon: <HomeOutlined />,
  // },
  {
    pathname: 'manage-users',
    label: 'Quản lý người dùng',
    icon: <TeamOutlined />,
    role: ['nhanVienTongCuc'],
  },
  {
    pathname: 'manage-materials',
    label: 'Nguyên vật liệu',
    icon: <SkinOutlined />,
    role: ['nhanVienTongCuc'],
  },
  {
    pathname: 'manage-providers',
    label: 'Nhà cung cấp',
    icon: <ShopOutlined />,
    role: ['nhanVienTongCuc'],
  },
  {
    pathname: 'material-provider',
    label: 'NVL theo NCC',
    icon: <SyncOutlined />,
    role: ['nhanVienTongCuc', 'nhanVienKho'],
  },
  {
    pathname: 'warehouse-material',
    label: 'Báo cáo tồn kho',
    icon: <FileSyncOutlined />,
    role: ['nhanVienTongCuc', 'nhanVienKho'],
  },
  {
    pathname: 'manage-warehouses',
    label: 'Quản lý kho',
    icon: <BankOutlined />,
    role: ['nhanVienTongCuc'],
  },
  {
    pathname: 'manage-production-units',
    label: 'Đơn vị sản xuất',
    icon: <GoldOutlined />,
    role: ['nhanVienTongCuc'],
  },
  {
    pathname: 'manage-imports',
    label: 'Phiếu nhập NVL',
    icon: <ImportOutlined />,
    role: ['nhanVienTongCuc', 'nhanVienKho', 'QA'],
  },
  {
    pathname: 'manage-exports',
    label: 'Phiếu xuất NVL',
    icon: <ExportOutlined />,
    role: ['nhanVienTongCuc', 'nhanVienKho'],
  },
  {
    pathname: 'manage-transfers',
    label: 'Phiếu điều chuyển',
    icon: <SwapOutlined />,
    role: ['nhanVienTongCuc', 'nhanVienKho'],
  },
  {
    pathname: 'manage-inventory-reports',
    label: 'Biên bản kiểm kê',
    icon: <AuditOutlined />,
    role: ['nhanVienTongCuc', 'nhanVienKho'],
  },
  // {
  //   pathname: 'warehouse-reports',
  //   label: 'Báo cáo thống kê',
  //   icon: <CopyOutlined />,
  //   role: ['nhanVienTongCuc', 'nhanVienKho'],
  // },
];

const navigations = [
  {
    pathname: 'profile',
    label: 'Trang cá nhân',
    role: ['nhanVienTongCuc', 'nhanVienKho', 'QA'],
  },
  {
    pathname: 'import-details',
    label: 'Chi tiết phiếu nhập',
    role: ['nhanVienTongCuc', 'nhanVienKho', 'QA'],
  },
  {
    pathname: 'export-details',
    label: 'Chi tiết phiếu xuất',
    role: ['nhanVienTongCuc', 'nhanVienKho'],
  },
  {
    pathname: 'transfer-details',
    label: 'Chi tiết điều chuyển',
    role: ['nhanVienTongCuc', 'nhanVienKho'],
  },
  {
    pathname: 'inventory-report-details',
    label: 'Chi tiết biên bản kiểm kê',
    role: ['nhanVienTongCuc', 'nhanVienKho'],
  },
  ...leftMenuItems,
];

const getNavigationWithRole = (role: string) => {
  return {
    navigation: navigations.filter((item) => item.role.includes(role)),
    leftMenu: leftMenuItems.filter((item) => item.role.includes(role)),
  };
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  //Handle path name to use layout
  const pathname = usePathname();
  const route = useRouter();

  const [navigationWithRole, setNavigationWithRole] = useState<any[]>([]);
  const [leftMenu, setLeftMenu] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<UserType>();

  useEffect(() => {
    const getUserCookieInterval = setInterval(() => {
      const currentUserJson = getCookie('login-user')?.toString();
      if (currentUserJson) {
        setCurrentUser(JSON.parse(currentUserJson));
        clearInterval(getUserCookieInterval);
      }
    }, 100);
  }, []);

  useEffect(() => {
    const currentNavigation = getNavigationWithRole(currentUser?.role?.id ?? '');
    setNavigationWithRole(currentNavigation.navigation);
    setLeftMenu(currentNavigation.leftMenu);
  }, [currentUser]);

  const [current, setCurrent] = useState(
    leftMenu.findIndex((element) => element.pathname === 'manage-imports').toString(),
  );

  //Handle menu colapse and style
  // const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const validPageHaveSider = navigationWithRole.map((item) => `/${item.pathname}`);

  //Handle current selected item if access page via URL directly
  useEffect(() => {
    const currentOpenPageKey = leftMenu.findIndex((element) => '/' + element.pathname === pathname);
    setCurrent(currentOpenPageKey.toString());
  }, [pathname]);

  //Render UI based on URL
  const currentOpenPage =
    navigationWithRole.find((element) => '/' + element.pathname === pathname) ||
    navigationWithRole.find((element) => pathname.includes(element.pathname) && element.pathname !== '');

  if (!validPageHaveSider.includes(pathname) && !pathname.includes('-details')) {
    return <div>{children}</div>;
  }

  //Handle select menu
  const items = leftMenu.map((item, key) =>
    getItem({
      label: item.label,
      key,
      icon: item.icon,
    }),
  );

  //Handle onClick event
  const onClick: MenuProps['onClick'] = (e) => {
    setCurrent(e.key);
    const url = leftMenu[+e.key].pathname;
    route.push('/' + url);
  };

  return (
    <Layout style={{ minHeight: '100vh' }} hasSider={true}>
      <Sider
        // collapsible
        // collapsed={collapsed}
        // onCollapse={(value) => setCollapsed(value)}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div className="demo-logo-vertical" />
        <div>
          <Menu theme="dark" items={items} onClick={onClick} selectedKeys={[current]} />
        </div>
      </Sider>

      <Layout style={{ marginLeft: 200 }}>
        <Header
          style={{ padding: '6px', background: colorBgContainer, fontSize: 26, position: 'sticky', top: 0, zIndex: 1 }}
        >
          {currentOpenPage?.label}
          <MyAccount />
        </Header>

        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div style={{ padding: 24, minHeight: '100%', background: colorBgContainer }}>{children}</div>
        </Content>

        <Footer style={{ textAlign: 'center' }}>Công ty TNHH Foobla ©2023</Footer>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
