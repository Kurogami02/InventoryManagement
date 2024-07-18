import React, { useState } from 'react';
import { Button, Form, Input, Modal } from 'antd';
import useMessage from 'antd/es/message/useMessage';
import { useForm } from 'antd/es/form/Form';
import { EditOutlined } from '@ant-design/icons';
import { getCookie } from 'cookies-next';
import { mutate } from 'swr';

import MaterialApi, { MaterialType } from '@/libs/api/material-api';

const ModalUpdateMaterial: React.FC<{ material: MaterialType }> = ({ material }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = useForm();
  const [messageApi, context] = useMessage();

  const handleUpdateMaterial = async (material: MaterialType, update_data: { name?: string; address?: string }) => {
    //Handle API Update Material
    const access_token = getCookie('access_token') || '';
    const materialApi = new MaterialApi(access_token);
    const { success, message } = await materialApi.updateMaterial(material, update_data);

    //Return message to UI
    if (success) {
      mutate('material-list');
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
    form.resetFields();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {context}
      <EditOutlined onClick={openEditModal} />
      <Modal
        title={`Cập nhật kho nguyên vật liệu ${material.name}`}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button form="update-material" key="submit" htmlType="submit" type="primary">
            Xác nhận
          </Button>,
          <Button form="update-material" key="cancel" htmlType="reset" onClick={handleCancel}>
            Hủy
          </Button>,
        ]}
      >
        <Form
          form={form}
          id="update-material"
          labelAlign="left"
          labelCol={{ span: 8 }}
          labelWrap
          onFinish={(update_data: { name?: string; address?: string }) => handleUpdateMaterial(material, update_data)}
        >
          <Form.Item name="code" label="Mã NVL" initialValue={material.code}>
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="name"
            label="Tên NVL"
            initialValue={material.name}
            rules={[{ required: true, message: 'Vui lòng nhập tên NVL!' }]}
          >
            <Input id="name" required autoComplete="off" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ModalUpdateMaterial;
