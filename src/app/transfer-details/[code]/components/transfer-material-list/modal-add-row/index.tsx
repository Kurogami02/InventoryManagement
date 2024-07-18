import SelectDropdown, { SelectOptionDataType } from '@/app/components/SelectDropdown';
import { TransferType } from '@/libs/api/transfer-api';
import TransferDetailApi, { CreateTransferDetailType } from '@/libs/api/transfer-detail-api';
import { Button, Form, InputNumber, Modal } from 'antd';
import { useForm } from 'antd/es/form/Form';
import useMessage from 'antd/es/message/useMessage';
import { getCookie } from 'cookies-next';
import { useState } from 'react';
import { mutate } from 'swr';

const AddRow: React.FC<{ transfer: TransferType; warehouseMaterialOptions: SelectOptionDataType[] }> = ({
  transfer,
  warehouseMaterialOptions,
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

  const handleCreate = async (values: CreateTransferDetailType) => {
    const access_token = getCookie('access_token') || '';
    const transferDetailApi = new TransferDetailApi(access_token);
    const { success, message } = await transferDetailApi.createTransferDetails({
      ...values,
      transfer: transfer,
    });

    if (success) {
      mutate('transfer-details-list');
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
        title="Thêm nguyên vật liệu điều chuyển"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button form="add-transfer-material" key="submit" htmlType="submit" type="primary">
            Xác nhận
          </Button>,
          <Button form="add-transfer-material" key="cancel" htmlType="reset" onClick={handleCancel}>
            Hủy
          </Button>,
        ]}
      >
        <Form
          form={form}
          id="add-transfer-material"
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
              options={warehouseMaterialOptions}
              optionName={'nguyên vật liệu'}
              onSelect={(value: number) => {
                form.setFieldsValue({ materialProvider: value });
              }}
            />
          </Form.Item>
          <Form.Item
            name="exportQuantity"
            label="Số lượng điều chuyển"
            labelCol={{ span: 9 }}
            rules={[{ required: true, message: 'Vui lòng nhập số lượng điều chuyển!' }]}
          >
            <InputNumber id="exportQuantity" style={{ width: '100%' }} placeholder="Số lượng điều chuyển" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AddRow;
