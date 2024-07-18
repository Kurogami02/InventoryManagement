import React, { useState } from 'react';
import { Button, Form, Input, Modal } from 'antd';

import useMessage from 'antd/es/message/useMessage';
import { useForm } from 'antd/es/form/Form';
import { EditOutlined } from '@ant-design/icons';
import { getCookie } from 'cookies-next';
import { mutate } from 'swr';

import WarehouseApi, { WarehouseType } from '@/libs/api/warehouse-api';
import TextArea from 'antd/es/input/TextArea';

const ModalUpdateWarehouse: React.FC<{ warehouse: WarehouseType }> = ({ warehouse }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = useForm();
  const [messageApi, context] = useMessage();

  const handleUpdateWarehouse = async (warehouse: WarehouseType, update_data: { name?: string; address?: string }) => {
    //Handle API Update Warehouse
    const access_token = getCookie('access_token') || '';
    const warehouseApi = new WarehouseApi(access_token);
    const { success, message } = await warehouseApi.updateWarehouse(warehouse, update_data);

    //Return message to UI
    if (success) {
      mutate('warehouse-list');
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
        title={`Cập nhật kho nguyên vật liệu ${warehouse.name}`}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button form="update-warehouse" key="submit" htmlType="submit" type="primary">
            Xác nhận
          </Button>,
          <Button form="update-warehouse" key="cancel" htmlType="reset" onClick={handleCancel}>
            Hủy
          </Button>,
        ]}
      >
        <Form
          form={form}
          id="update-warehouse"
          labelAlign="left"
          labelCol={{ span: 8 }}
          labelWrap
          onFinish={(update_data: { name?: string; address?: string }) => handleUpdateWarehouse(warehouse, update_data)}
        >
          <Form.Item
            name="name"
            label="Tên kho"
            initialValue={warehouse.name}
            rules={[{ required: true, message: 'Vui lòng nhập tên kho nguyên vật liệu!' }]}
          >
            <Input id="name" required autoComplete="off" />
          </Form.Item>
          <Form.Item
            name="address"
            label="Địa chỉ"
            initialValue={warehouse.address}
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
          >
            <TextArea id="address" required autoComplete="off" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ModalUpdateWarehouse;
