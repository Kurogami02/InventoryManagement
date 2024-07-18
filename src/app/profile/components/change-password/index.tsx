import { Button, Divider, Form, Input, message } from 'antd';

import UserApi from '@/libs/api/user-api';
import { getCookie } from 'cookies-next';

const ChangePassword: React.FC = () => {
  const [form] = Form.useForm();
  const [messageApi, context] = message.useMessage();

  const handleChangePassword = async (values: { current_password: string; new_password: string }) => {
    const { current_password, new_password } = values;
    const keyMessage = 'change-password';
    const access_token = getCookie('access_token') || '';
    const userApi = new UserApi(access_token);
    const res = await userApi.changePassword({ current_password, new_password });
    const { success, message } = res;
    if (!success) {
      messageApi.error({ content: message, key: keyMessage, duration: 2 });
    } else {
      messageApi.success({ content: message, key: keyMessage, duration: 2 });
    }
  };

  return (
    <>
      {context}
      <Divider orientation="left" orientationMargin="0">
        Cập nhật mật khẩu
      </Divider>
      <Form
        form={form}
        name="profile"
        style={{ maxWidth: 500 }}
        labelCol={{ span: 7 }}
        labelAlign="left"
        onFinish={handleChangePassword}
      >
        <Form.Item
          name="current_password"
          label="Mật khẩu hiện tại"
          rules={[
            {
              required: true,
              message: 'Vui lòng nhập mật khẩu hiện tại!',
            },
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          name="new_password"
          label="Mật khẩu mới"
          dependencies={['current_password']}
          rules={[
            {
              required: true,
              message: 'Vui lòng nhập mật khẩu mới!',
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('current_password') !== value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu mới không được trùng với mật khẩu hiện tại!'));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="confirm_password"
          label="Xác nhận mật khẩu"
          dependencies={['new_password']}
          rules={[
            {
              required: true,
              message: 'Vui lòng nhập xác nhận mật khẩu!',
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('new_password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu nhập lại không trùng khớp!'));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8 }}>
          <Button type="primary" htmlType="submit">
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default ChangePassword;
