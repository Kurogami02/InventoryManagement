import React, { useState } from 'react';
import { Button, Form, Input, Modal } from 'antd';

import useMessage from 'antd/es/message/useMessage';
import { useForm } from 'antd/es/form/Form';
import { EditOutlined } from '@ant-design/icons';
import { getCookie } from 'cookies-next';
import { mutate } from 'swr';

import ProductionUnitApi, { ProductionUnitType } from '@/libs/api/production-unit-api';
import TextArea from 'antd/es/input/TextArea';

const ModalUpdateProductionUnit: React.FC<{ production_unit: ProductionUnitType }> = ({ production_unit }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = useForm();
  const [messageApi, context] = useMessage();

  const handleUpdateProductionUnit = async (
    production_unit: ProductionUnitType,
    update_data: { name?: string; address?: string; phone?: string },
  ) => {
    //Handle API Update ProductionUnit
    const access_token = getCookie('access_token') || '';
    const production_unitApi = new ProductionUnitApi(access_token);
    const { success, message } = await production_unitApi.updateProductionUnit(production_unit, update_data);

    //Return message to UI
    if (success) {
      mutate('production-unit-list');
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
  };

  return (
    <>
      {context}
      <EditOutlined onClick={openEditModal} />
      <Modal
        title={`Cập nhật đơn vị sản xuất ${production_unit.name}`}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button form="update-production_unit" key="submit" htmlType="submit" type="primary">
            Xác nhận
          </Button>,
          <Button form="update-production_unit" key="cancel" htmlType="reset" onClick={handleCancel}>
            Hủy
          </Button>,
        ]}
      >
        <Form
          form={form}
          id="update-production_unit"
          labelAlign="left"
          labelCol={{ span: 8 }}
          labelWrap
          onFinish={(update_data: { name?: string; address?: string; phone?: string }) =>
            handleUpdateProductionUnit(production_unit, update_data)
          }
        >
          <Form.Item
            name="name"
            label="Tên đơn vị sản xuất"
            initialValue={production_unit.name}
            rules={[{ required: true, message: 'Vui lòng nhập tên đơn vị sản xuất!' }]}
          >
            <Input id="name" required autoComplete="off" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            initialValue={production_unit.phone}
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
          >
            <Input id="phone" required autoComplete="off" />
          </Form.Item>
          <Form.Item
            name="address"
            label="Địa chỉ"
            initialValue={production_unit.address}
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
          >
            <TextArea id="address" required autoComplete="off" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ModalUpdateProductionUnit;
