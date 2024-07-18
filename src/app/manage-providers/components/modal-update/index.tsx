import React, { useState } from 'react';
import { Button, Form, Input, Modal } from 'antd';

import useMessage from 'antd/es/message/useMessage';
import { useForm } from 'antd/es/form/Form';
import TextArea from 'antd/es/input/TextArea';
import { EditOutlined } from '@ant-design/icons';
import { getCookie } from 'cookies-next';
import { mutate } from 'swr';

import ProviderApi, { ProviderType } from '@/libs/api/provider-api';

const ModalUpdateProvider: React.FC<{ provider: ProviderType }> = ({ provider }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = useForm();
  const [messageApi, context] = useMessage();

  const handleUpdateProvider = async (
    provider: ProviderType,
    update_data: { name?: string; address?: string; phone?: string },
  ) => {
    //Handle API Update Provider
    const access_token = getCookie('access_token') || '';
    const providerApi = new ProviderApi(access_token);
    const { success, message } = await providerApi.updateProvider(provider, update_data);

    //Return message to UI
    if (success) {
      mutate('provider-list');
      messageApi.success(message);
      form.setFieldsValue({ update_data });
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
        title={`Cập nhật nhà cung cấp ${provider.name}`}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button form="update-provider" key="submit" htmlType="submit" type="primary">
            Xác nhận
          </Button>,
          <Button form="update-provider" key="cancel" htmlType="reset" onClick={handleCancel}>
            Hủy
          </Button>,
        ]}
      >
        <Form
          form={form}
          id="update-provider"
          labelAlign="left"
          labelCol={{ span: 8 }}
          labelWrap
          onFinish={(update_data: { name?: string; address?: string; phone?: string }) =>
            handleUpdateProvider(provider, update_data)
          }
        >
          <Form.Item
            name="name"
            label="Tên nhà cung cấp"
            initialValue={provider.name}
            rules={[{ required: true, message: 'Vui lòng nhập tên nhà cung cấp!' }]}
          >
            <Input id="name" required autoComplete="off" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            initialValue={provider.phone}
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
          >
            <Input id="phone" required autoComplete="off" />
          </Form.Item>
          <Form.Item
            name="address"
            label="Địa chỉ"
            initialValue={provider.address}
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
          >
            <TextArea id="address" required autoComplete="off" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ModalUpdateProvider;
