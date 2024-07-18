import React, { useState } from 'react';
import { Button, Form, Input, Modal } from 'antd';

import useMessage from 'antd/es/message/useMessage';
import { useForm } from 'antd/es/form/Form';
import { getCookie } from 'cookies-next';
import { mutate } from 'swr';

import SelectDropdown, { SelectOptionDataType } from '../../../components/SelectDropdown';
import UserApi, { CreateUserType } from '@/libs/api/user-api';

const ModalCreateUser: React.FC<{
  roleOptions: SelectOptionDataType[];
  warehouseOptions: SelectOptionDataType[];
}> = ({ roleOptions, warehouseOptions }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = useForm();
  const [messageApi, context] = useMessage();

  const handleCreateUser = async (values: CreateUserType) => {
    //Handle API Create User
    const access_token = getCookie('access_token') || '';
    const userApi = new UserApi(access_token);
    const { success, message } = await userApi.createUser(values);

    //Return message to UI
    if (success) {
      mutate('user-list');
      messageApi.success(message);
    } else {
      messageApi.error(message);
    }

    //Close modal
    setIsModalOpen(false);
  };

  const openNewForm = () => {
    setIsModalOpen(true);
    form.resetFields();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {context}
      <Button type="primary" style={{ float: 'right' }} onClick={openNewForm}>
        Thêm người dùng
      </Button>
      <Modal
        title="Thêm người dùng mới"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button form="create-user" key="submit" htmlType="submit" type="primary">
            Xác nhận
          </Button>,
          <Button form="create-user" key="cancel" htmlType="reset" onClick={handleCancel}>
            Hủy
          </Button>,
        ]}
      >
        <Form
          form={form}
          id="create-user"
          labelAlign="left"
          labelCol={{ span: 7 }}
          labelWrap
          onFinish={handleCreateUser}
        >
          <Form.Item
            name="fullname"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập Họ và tên!' }]}
          >
            <Input id="fullname" placeholder="Nguyễn Văn A" required autoComplete="off" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập Email!' },
              { type: 'email', message: 'Email không hợp lệ!' },
            ]}
          >
            <Input id="email" placeholder="anv@foobla.vn" required autoComplete="off" />
          </Form.Item>
          <Form.Item name="role" label="Chức vụ" rules={[{ required: true, message: 'Vui lòng chọn chức vụ!' }]}>
            <SelectDropdown
              id="role"
              options={roleOptions}
              optionName={'Chức vụ'}
              onSelect={(value: string) => {
                form.setFieldsValue({ role: value });
              }}
            />
          </Form.Item>
          <Form.Item
            name="warehouse"
            label="Đơn vị công tác"
            rules={[{ required: true, message: 'Vui lòng chọn đơn vị công tác!' }]}
          >
            <SelectDropdown
              id="warehouse"
              options={warehouseOptions}
              optionName={'Đơn vị công tác'}
              onSelect={(value: number) => {
                form.setFieldsValue({ warehouse: value });
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ModalCreateUser;
