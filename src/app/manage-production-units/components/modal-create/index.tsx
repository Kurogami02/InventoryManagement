import React, { useState } from 'react';
import { Button, Form, Input, Modal } from 'antd';

import useMessage from 'antd/es/message/useMessage';
import { useForm } from 'antd/es/form/Form';
import { getCookie } from 'cookies-next';
import { mutate } from 'swr';
import ProductionUnitApi, { ProductionUnitType } from '@/libs/api/production-unit-api';
import TextArea from 'antd/es/input/TextArea';

const ModalCreateProductionUnit: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = useForm();
  const [messageApi, context] = useMessage();

  const handleCreateProductionUnit = async (values: ProductionUnitType) => {
    //Handle API Create ProductionUnit
    const access_token = getCookie('access_token') || '';
    const production_unitApi = new ProductionUnitApi(access_token);
    const { success, message } = await production_unitApi.createProductionUnit(values);

    //Return message to UI
    if (success) {
      mutate('production-unit-list');
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
        Thêm đơn vị sản xuất
      </Button>
      <Modal
        title="Thêm đơn vị sản xuất mới"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button form="create-production_unit" key="submit" htmlType="submit" type="primary">
            Xác nhận
          </Button>,
          <Button form="create-production_unit" key="cancel" htmlType="reset" onClick={handleCancel}>
            Hủy
          </Button>,
        ]}
      >
        <Form
          form={form}
          id="create-production_unit"
          labelAlign="left"
          labelCol={{ span: 8 }}
          labelWrap
          onFinish={handleCreateProductionUnit}
        >
          <Form.Item
            name="name"
            label="Tên đơn vị sản xuất"
            rules={[{ required: true, message: 'Vui lòng nhập tên đơn vị sản xuất!' }]}
          >
            <Input id="name" placeholder="Công ty TNHH Foobla" required autoComplete="off" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
          >
            <Input id="phone" placeholder="0123456789" required autoComplete="off" />
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

export default ModalCreateProductionUnit;
