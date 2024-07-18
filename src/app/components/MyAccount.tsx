import React, { useEffect, useState } from 'react';
import { DownOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Dropdown, MenuProps, Space } from 'antd';

import { deleteCookie, getCookie, setCookie } from 'cookies-next';
import UserApi, { UserType } from '@/libs/api/user-api';

function handleLogout() {
  deleteCookie('access_token');
  deleteCookie('login-user');
}

const items: MenuProps['items'] = [
  {
    label: (
      <Button type="link" href="/profile">
        Trang cá nhân
      </Button>
    ),
    key: '0',
  },
  {
    label: (
      <Button type="link" href="/login" onClick={handleLogout}>
        Đăng xuất
      </Button>
    ),
    key: '1',
  },
];

const MyAccount: React.FC = () => {
  const [user, setUser] = useState<UserType>();

  //Render user name from api
  useEffect(() => {
    const fetchData = async () => {
      const access_token = getCookie('access_token') || '';
      const userApi = new UserApi(access_token);
      const { user } = await userApi.getUserProfile();
      setUser(user);
    };

    fetchData();
  }, []);

  return (
    <Space style={{ float: 'right', fontSize: 14 }}>
      <UserOutlined />
      Xin chào
      <Dropdown menu={{ items }} trigger={['click']}>
        <a>
          <Space>
            {user?.fullname}
            <DownOutlined />
          </Space>
        </a>
      </Dropdown>
    </Space>
  );
};

export default MyAccount;
