'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Checkbox, Form, Input, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { getCookie, setCookie } from 'cookies-next';

import RootTheme from '../components/RootTheme';
import AuthApi from '@/libs/api/auth-api';
import UserApi from '@/libs/api/user-api';

const App: React.FC = () => {
  const router = useRouter();

  if (getCookie('access_token')) {
    router.push('/');
  }

  const [messageApi, contextLogin] = message.useMessage();
  const keyMessage = 'login';

  const getCurrentLoginUser = async (access_token: string) => {
    if (access_token) {
      const userApi = new UserApi(access_token);
      const { user } = await userApi.getUserProfile();
      return user;
    }
    return '';
  };

  const handleLogin = async (values: { email: string; password: string }) => {
    const { email, password } = values;
    const authApi = new AuthApi(email, password);

    messageApi.loading({ content: 'Đang đăng nhập...', key: keyMessage, type: 'loading' });
    const authen = await authApi.auth();
    const { access_token, message } = authen;
    if (access_token) {
      setCookie('access_token', access_token);
      const currentUser = await getCurrentLoginUser(access_token);
      setCookie('login-user', JSON.stringify(currentUser));
      router.push('/manage-imports');
    } else {
      messageApi.error({ content: message, key: keyMessage, duration: 2 });
    }
  };

  return (
    <div>
      {contextLogin}
      <section>
        <img src="./favicon.ico" alt="Đăng nhập hệ thống" />
      </section>
      <br />
      <br />
      <section>
        <RootTheme>
          <Form
            name="login"
            size="large"
            style={{ maxWidth: '100%' }}
            initialValues={{ remember: true }}
            autoComplete="off"
            onFinish={handleLogin}
          >
            <Form.Item name="email" rules={[{ required: true, message: 'Vui lòng nhập Email!' }]}>
              <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Email" size="large" />
            </Form.Item>

            <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="Mật khẩu"
                size="large"
              />
            </Form.Item>
            <Form.Item>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Ghi nhớ đăng nhập</Checkbox>
              </Form.Item>
              <Link href="/forgot-password" style={{ float: 'right' }}>
                Quên mật khẩu?
              </Link>
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button type="primary" htmlType="submit">
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>
        </RootTheme>
      </section>
    </div>
  );
};

export default App;
