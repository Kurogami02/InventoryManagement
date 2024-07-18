import React, { useState } from 'react';
import { AutoComplete, Button, Form, Input, Modal } from 'antd';

import useMessage from 'antd/es/message/useMessage';
import { useForm } from 'antd/es/form/Form';
import { getCookie } from 'cookies-next';
import { mutate } from 'swr';
import MaterialProviderApi, { CreateMaterialProviderType } from '@/libs/api/material-provider-api';
import NotFoundContent from '@/app/components/NotFoundContent';
import SelectDropdown, { SelectOptionDataType } from '@/app/components/SelectDropdown';

const ModalCreateMaterialProvider: React.FC<{
  providerOptions: SelectOptionDataType[];
  materialOptions: SelectOptionDataType[];
}> = ({ providerOptions, materialOptions }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = useForm();
  const [messageApi, context] = useMessage();
  const [material, setMaterial] = useState<string>();
  const [provider, setProvider] = useState<number>();

  const handleCreateMaterialProvider = async (values: CreateMaterialProviderType) => {
    //Handle API Create MaterialProvider
    const access_token = getCookie('access_token') || '';
    const materialProviderApi = new MaterialProviderApi(access_token);
    const { success, message } = await materialProviderApi.createMaterialProvider(values);

    //Return message to UI
    if (success) {
      mutate('material-provider-list');
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
        Thêm bản ghi
      </Button>
      <Modal
        title="Thêm bản ghi mới"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button form="create-material-provider" key="submit" htmlType="submit" type="primary">
            Xác nhận
          </Button>,
          <Button form="create-material-provider" key="cancel" htmlType="reset" onClick={handleCancel}>
            Hủy
          </Button>,
        ]}
      >
        <Form
          form={form}
          id="create-material-provider"
          labelAlign="left"
          labelCol={{ span: 8 }}
          labelWrap
          onFinish={handleCreateMaterialProvider}
        >
          <Form.Item
            name="provider"
            label="Nhà cung cấp"
            rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp!' }]}
          >
            <SelectDropdown
              options={providerOptions}
              optionName={'nhà cung cấp'}
              onSelect={(value: number) => {
                setProvider(value == 0 ? undefined : value);
                form.setFieldsValue({ provider: value });
              }}
            />
          </Form.Item>
          <Form.Item
            name="material"
            label="Nguyên vật liệu"
            rules={[{ required: true, message: 'Vui lòng chọn NVL!' }]}
          >
            <AutoComplete
              id="material"
              style={{ width: '100%' }}
              placeholder="Nhập mã nguyên vật liệu"
              options={materialOptions}
              size="middle"
              onSelect={(value: string) => {
                setMaterial(value);
              }}
              allowClear
              notFoundContent={<NotFoundContent />}
              filterOption={(inputValue, option) =>
                option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
              }
            />
          </Form.Item>
          <Form.Item name="unit" label="Đơn vị" rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp!' }]}>
            <Input id="unit" placeholder="Nhập đơn vị" required autoComplete="off" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ModalCreateMaterialProvider;
