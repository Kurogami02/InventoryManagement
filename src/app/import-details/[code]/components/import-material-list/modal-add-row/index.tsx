import SelectDropdown, { SelectOptionDataType } from '@/app/components/SelectDropdown';
import { ImportType } from '@/libs/api/import-api';
import ImportDetailApi, { CreateImportDetailType } from '@/libs/api/import-detail-api';
import { Button, Form, InputNumber, Modal } from 'antd';
import { useForm } from 'antd/es/form/Form';
import useMessage from 'antd/es/message/useMessage';
import { getCookie } from 'cookies-next';
import { useState } from 'react';
import { mutate } from 'swr';

const AddRow: React.FC<{ importReceipt: ImportType; materialProviderOptions: SelectOptionDataType[] }> = ({
  importReceipt,
  materialProviderOptions,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = useForm();
  const [messageApi, context] = useMessage();

  const openNewForm = () => {
    setIsModalOpen(true);
    form.resetFields();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleCreate = async (values: CreateImportDetailType) => {
    const access_token = getCookie('access_token') || '';
    const importDetailApi = new ImportDetailApi(access_token);
    const { success, message } = await importDetailApi.createImportDetails({
      importReceipt: importReceipt,
      materialProvider: values.materialProvider,
      expectQuantity: values.expectQuantity,
    });

    if (success) {
      mutate('import-details-list');
      messageApi.success(message);
    } else {
      messageApi.error(message);
    }

    setIsModalOpen(false);
  };

  return (
    <>
      {context}
      <Button type="primary" style={{ marginTop: 16, marginBottom: 16, float: 'right' }} onClick={openNewForm}>
        Thêm nguyên vật liệu
      </Button>
      <Modal
        title="Thêm nguyên vật liệu cho phiếu nhập"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button form="add-import-material" key="submit" htmlType="submit" type="primary">
            Xác nhận
          </Button>,
          <Button form="add-import-material" key="cancel" htmlType="reset" onClick={handleCancel}>
            Hủy
          </Button>,
        ]}
      >
        <Form
          form={form}
          id="add-import-material"
          labelAlign="left"
          labelCol={{ span: 8 }}
          labelWrap
          onFinish={handleCreate}
        >
          <Form.Item
            name="materialProvider"
            label="Nguyên vật liệu"
            labelCol={{ span: 9 }}
            rules={[{ required: true, message: 'Vui lòng chọn nguyên vật liệu!' }]}
          >
            <SelectDropdown
              id="materialProvider"
              options={materialProviderOptions}
              optionName={'nguyên vật liệu'}
              onSelect={(value: number) => {
                form.setFieldsValue({ materialProvider: value });
              }}
            />
          </Form.Item>
          <Form.Item
            name="expectQuantity"
            label="Số lượng mong muốn"
            labelCol={{ span: 9 }}
            rules={[{ required: true, message: 'Vui lòng nhập số lượng mong muốn!' }]}
          >
            <InputNumber id="expectQuantity" style={{ width: '100%' }} placeholder="Số lượng mong muốn" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AddRow;
