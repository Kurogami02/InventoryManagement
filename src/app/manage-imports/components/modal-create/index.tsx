import React, { useState } from 'react';
import { Button, DatePicker, Form, Input, Modal } from 'antd';

import useMessage from 'antd/es/message/useMessage';
import { useForm } from 'antd/es/form/Form';
import { getCookie } from 'cookies-next';
import { mutate } from 'swr';
import ImportApi, { CreateImportType } from '@/libs/api/import-api';
import SelectDropdown, { SelectOptionDataType } from '@/app/components/SelectDropdown';
import DatePickerVI from '@/app/components/DatePickerVI';

const ModalCreateImport: React.FC<{
  providerOptions: SelectOptionDataType[];
  warehouseOptions: SelectOptionDataType[];
}> = ({ providerOptions, warehouseOptions }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = useForm();
  const [messageApi, context] = useMessage();

  const handleCreateImport = async (values: CreateImportType) => {
    //Handle API Create Import
    const access_token = getCookie('access_token') || '';
    const importApi = new ImportApi(access_token);
    const { success, message } = await importApi.createImport(values);

    //Return message to UI
    if (success) {
      mutate('import-list');
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
        Thêm phiếu nhập
      </Button>
      <Modal
        title="Thêm phiếu nhập mới"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button form="create-import" key="submit" htmlType="submit" type="primary">
            Xác nhận
          </Button>,
          <Button form="create-import" key="cancel" htmlType="reset" onClick={handleCancel}>
            Hủy
          </Button>,
        ]}
      >
        <Form
          form={form}
          id="create-import"
          labelAlign="left"
          labelCol={{ span: 8 }}
          labelWrap
          onFinish={handleCreateImport}
        >
          <Form.Item
            name="provider"
            label="Nhà cung cấp"
            rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp!' }]}
          >
            <SelectDropdown
              id="provider"
              options={providerOptions}
              optionName={'nhà cung cấp'}
              onSelect={(value: number) => {
                form.setFieldsValue({ provider: value });
              }}
            />
          </Form.Item>
          <Form.Item
            name="warehouse"
            label="Kho nhập NVL"
            rules={[{ required: true, message: 'Vui lòng chọn kho nhập nguyên vật liệu!' }]}
          >
            <SelectDropdown
              id="warehouse"
              options={warehouseOptions}
              optionName={'Kho nhập nguyên vật liệu'}
              onSelect={(value: number) => {
                form.setFieldsValue({ warehouse: value });
              }}
            />
          </Form.Item>
          <Form.Item
            name="importAt"
            label="Thời gian nhập kho"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian nhập kho!' }]}
          >
            <DatePickerVI
              handleRangePicker={(value: Date) => {
                form.setFieldsValue({ importAt: value });
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ModalCreateImport;
