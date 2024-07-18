import { useEffect } from 'react';
import { Col, Divider, Form, Input, Row, message } from 'antd';
import { getCookie, setCookie } from 'cookies-next';
import UserApi from '@/libs/api/user-api';

const UserInfo: React.FC = () => {
  const [messageApi, context] = message.useMessage();
  const keyMessage = 'profile';
  const [form] = Form.useForm();

  useEffect(() => {
    const renderData = async () => {
      const access_token = getCookie('access_token') || '';
      const userApi = new UserApi(access_token);
      const userProfile = await userApi.getUserProfile();
      const { success, message, user } = userProfile;
      if (!success) {
        messageApi.error({ content: message, key: keyMessage, duration: 2 });
      }
      form.setFieldsValue({
        fullname: user.fullname,
        email: user.email,
        role: user.role.name,
        warehouse: user.warehouse.name,
      });
    };

    renderData();
  }, []);

  return (
    <>
      {context}
      <Divider orientation="left" orientationMargin="0">
        Thông tin người dùng
      </Divider>
      <Form form={form} labelAlign="left" labelCol={{ span: 5 }} labelWrap>
        <Row gutter={16}>
          <Col span={10}>
            <Form.Item name="fullname" label="Họ và tên">
              <Input disabled />
            </Form.Item>
            <Form.Item name="email" label="Email">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={1}></Col>
          <Col span={12}>
            <Form.Item name="role" label="Chức vụ">
              <Input disabled />
            </Form.Item>
            <Form.Item name="warehouse" label="Đơn vị công tác">
              <Input disabled />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default UserInfo;
