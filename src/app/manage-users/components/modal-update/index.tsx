import React, { useState } from 'react';
import { Button, Form, Input, Modal } from 'antd';

import useMessage from 'antd/es/message/useMessage';
import { useForm } from 'antd/es/form/Form';
import { EditOutlined } from '@ant-design/icons';
import { getCookie } from 'cookies-next';
import { mutate } from 'swr';

import SelectDropdown, { SelectOptionDataType } from '@/app/components/SelectDropdown';
import UserApi, { UpdateUserType } from '@/libs/api/user-api';

const ModalUpdateUser: React.FC<{
  user: UpdateUserType;
  roleOptions: SelectOptionDataType[];
  warehouseOptions: SelectOptionDataType[];
}> = ({ user, roleOptions, warehouseOptions }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = useForm();
  const [messageApi, context] = useMessage();

  const handleUpdateUser = async (userUpdate: UpdateUserType) => {
    //Handle API Update User
    const access_token = getCookie('access_token') || '';
    const userApi = new UserApi(access_token);
    const update_data: UpdateUserType = { id: user.id };

    if (userUpdate.fullname && userUpdate.fullname !== user.fullname) {
      update_data.fullname = userUpdate.fullname;
    }

    if (userUpdate.email && userUpdate.email !== user.email) {
      update_data.email = userUpdate.email;
    }

    if (userUpdate.role && userUpdate.role !== user.role) {
      update_data.role = userUpdate.role;
    }

    if (userUpdate.warehouse && userUpdate.warehouse !== user.warehouse) {
      update_data.warehouse = userUpdate.warehouse;
    }

    const { success, message } = await userApi.updateUser(update_data);

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

  const openEditModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  return (
    <>
      {context}
      <EditOutlined onClick={openEditModal} />
      <Modal
        title={`Cập nhật người dùng ${user.fullname}`}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button form="update-user" key="submit" htmlType="submit" type="primary">
            Xác nhận
          </Button>,
          <Button form="update-user" key="cancel" htmlType="reset" onClick={handleCancel}>
            Hủy
          </Button>,
        ]}
      >
        <Form
          form={form}
          id="update-user"
          labelAlign="left"
          labelCol={{ span: 7 }}
          labelWrap
          onFinish={handleUpdateUser}
        >
          <Form.Item
            name="fullname"
            label="Họ và tên"
            initialValue={user.fullname}
            rules={[{ required: true, message: 'Vui lòng nhập Họ và tên!' }]}
          >
            <Input id="fullname" required autoComplete="off" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            initialValue={user.email}
            rules={[
              { required: true, message: 'Vui lòng nhập Email!' },
              { type: 'email', message: 'Email không hợp lệ!' },
            ]}
          >
            <Input id="email" required autoComplete="off" />
          </Form.Item>
          <Form.Item
            name="role"
            label="Chức vụ"
            initialValue={user.role}
            rules={[{ required: true, message: 'Vui lòng chọn chức vụ!' }]}
          >
            <SelectDropdown
              id="role"
              options={roleOptions}
              currentValue={user.role?.toString()}
              optionName={'Chức vụ'}
              onSelect={(value: number) => {
                form.setFieldsValue({ role: value });
              }}
            />
          </Form.Item>
          <Form.Item
            name="warehouse"
            label="Đơn vị công tác"
            initialValue={user.warehouse}
            rules={[{ required: true, message: 'Vui lòng chọn đơn vị công tác!' }]}
          >
            <SelectDropdown
              id="warehouse"
              options={warehouseOptions}
              currentValue={user.warehouse?.toString()}
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

export default ModalUpdateUser;
