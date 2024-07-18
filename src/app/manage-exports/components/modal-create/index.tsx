import React, { useState } from 'react';
import { Button, DatePicker, Form, Input, Modal } from 'antd';

import useMessage from 'antd/es/message/useMessage';
import { useForm } from 'antd/es/form/Form';
import { getCookie } from 'cookies-next';
import { mutate } from 'swr';
import ExportApi, { CreateExportType } from '@/libs/api/export-api';
import SelectDropdown, { SelectOptionDataType } from '@/app/components/SelectDropdown';
import DatePickerVI from '@/app/components/DatePickerVI';

const ModalCreateExport: React.FC<{
  productionUnitOptions: SelectOptionDataType[];
  warehouseOptions: SelectOptionDataType[];
}> = ({ productionUnitOptions, warehouseOptions }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = useForm();
  const [messageApi, context] = useMessage();

  const handleCreateExport = async (values: CreateExportType) => {
    //Handle API Create Export
    const access_token = getCookie('access_token') || '';
    const exportApi = new ExportApi(access_token);
    const { success, message } = await exportApi.createExport(values);

    //Return message to UI
    if (success) {
      mutate('export-list');
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
        Thêm phiếu xuất
      </Button>
      <Modal
        title="Thêm phiếu xuất mới"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button form="create-export" key="submit" htmlType="submit" type="primary">
            Xác nhận
          </Button>,
          <Button form="create-export" key="cancel" htmlType="reset" onClick={handleCancel}>
            Hủy
          </Button>,
        ]}
      >
        <Form
          form={form}
          id="create-export"
          labelAlign="left"
          labelCol={{ span: 8 }}
          labelWrap
          onFinish={handleCreateExport}
        >
          <Form.Item
            name="productionUnit"
            label="Đơn vị sản xuất"
            rules={[{ required: true, message: 'Vui lòng chọn đơn vị sản xuất!' }]}
          >
            <SelectDropdown
              id="productionUnit"
              options={productionUnitOptions}
              optionName={'đơn vị sản xuất'}
              onSelect={(value: number) => {
                form.setFieldsValue({ productionUnit: value });
              }}
            />
          </Form.Item>
          <Form.Item
            name="warehouse"
            label="Kho xuất NVL"
            rules={[{ required: true, message: 'Vui lòng chọn kho xuất nguyên vật liệu!' }]}
          >
            <SelectDropdown
              id="warehouse"
              options={warehouseOptions}
              optionName={'Kho xuất nguyên vật liệu'}
              onSelect={(value: number) => {
                form.setFieldsValue({ warehouse: value });
              }}
            />
          </Form.Item>
          <Form.Item
            name="exportAt"
            label="Thời gian xuất kho"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian xuất kho!' }]}
          >
            <DatePickerVI
              handleRangePicker={(value: Date) => {
                form.setFieldsValue({ exportAt: value });
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ModalCreateExport;
