import React, { useState } from 'react';
import { Button, Form, Input, Modal } from 'antd';

import useMessage from 'antd/es/message/useMessage';
import { useForm } from 'antd/es/form/Form';
import { getCookie } from 'cookies-next';
import { mutate } from 'swr';
import MaterialApi, { MaterialType } from '@/libs/api/material-api';

const ModalCreateMaterial: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = useForm();
  const [messageApi, context] = useMessage();

  const handleCreateMaterial = async (values: MaterialType) => {
    //Handle API Create Material
    const access_token = getCookie('access_token') || '';
    const materialApi = new MaterialApi(access_token);
    const { success, message } = await materialApi.createMaterial(values);

    //Return message to UI
    if (success) {
      mutate('material-list');
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
        Thêm nguyên vật liệu
      </Button>
      <Modal
        title="Thêm nguyên vật liệu mới"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button form="create-material" key="submit" htmlType="submit" type="primary">
            Xác nhận
          </Button>,
          <Button form="create-material" key="cancel" htmlType="reset" onClick={handleCancel}>
            Hủy
          </Button>,
        ]}
      >
        <Form
          form={form}
          id="create-material"
          labelAlign="left"
          labelCol={{ span: 8 }}
          labelWrap
          onFinish={handleCreateMaterial}
        >
          <Form.Item name="code" label="Mã NVL" rules={[{ required: true, message: 'Vui lòng nhập mã NVL!' }]}>
            <Input id="code" placeholder="VaiBat_2x3" required autoComplete="off" />
          </Form.Item>
          <Form.Item name="name" label="Tên NVL" rules={[{ required: true, message: 'Vui lòng nhập tên NVL!' }]}>
            <Input id="name" placeholder="Vải bạt 2x3m" required autoComplete="off" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ModalCreateMaterial;
