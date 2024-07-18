import React, { useState } from 'react';
import { Button, Form, Input, Modal } from 'antd';

import useMessage from 'antd/es/message/useMessage';
import { useForm } from 'antd/es/form/Form';
import { getCookie } from 'cookies-next';
import { mutate } from 'swr';
import WarehouseApi, { WarehouseType } from '@/libs/api/warehouse-api';
import TextArea from 'antd/es/input/TextArea';

const ModalCreateWarehouse: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = useForm();
  const [messageApi, context] = useMessage();

  const handleCreateWarehouse = async (values: WarehouseType) => {
    //Handle API Create Warehouse
    const access_token = getCookie('access_token') || '';
    const warehouseApi = new WarehouseApi(access_token);
    const { success, message } = await warehouseApi.createWarehouse(values);

    //Return message to UI
    if (success) {
      mutate('warehouse-list');
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
        Thêm kho nguyên vật liệu
      </Button>
      <Modal
        title="Thêm kho nguyên vật liệu mới"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button form="create-warehouse" key="submit" htmlType="submit" type="primary">
            Xác nhận
          </Button>,
          <Button form="create-warehouse" key="cancel" htmlType="reset" onClick={handleCancel}>
            Hủy
          </Button>,
        ]}
      >
        <Form
          form={form}
          id="create-warehouse"
          labelAlign="left"
          labelCol={{ span: 8 }}
          labelWrap
          onFinish={handleCreateWarehouse}
        >
          <Form.Item
            name="name"
            label="Tên kho"
            rules={[{ required: true, message: 'Vui lòng nhập tên kho nguyên vật liệu!' }]}
          >
            <Input id="name" placeholder="Kho Quang Minh ERP" required autoComplete="off" />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}>
            <TextArea
              id="address"
              placeholder="29 P. Nguyễn Cơ Thạch,P. Mỹ Đình 2, Q. Nam Từ Liêm, TP. Hà Nội"
              required
              autoComplete="off"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ModalCreateWarehouse;
