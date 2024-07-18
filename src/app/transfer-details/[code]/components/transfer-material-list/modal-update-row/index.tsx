import SelectDropdown, { SelectOptionDataType } from '@/app/components/SelectDropdown';
import { TransferType } from '@/libs/api/transfer-api';
import TransferDetailApi, { TransferDetailType } from '@/libs/api/transfer-detail-api';
import { Button, Form, InputNumber, Modal } from 'antd';
import { useForm } from 'antd/es/form/Form';
import useMessage from 'antd/es/message/useMessage';
import { getCookie } from 'cookies-next';
import { useState } from 'react';
import { mutate } from 'swr';

const EditRow: React.FC<{
  record: TransferDetailType;
  warehouseMaterialOptions: SelectOptionDataType[];
}> = ({ record, warehouseMaterialOptions }) => {
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

  const handleUpdate = async (values: TransferDetailType) => {
    const access_token = getCookie('access_token') || '';
    const transferDetailApi = new TransferDetailApi(access_token);
    const { success, message } = await transferDetailApi.updateTransferDetail(record.id, {
      exportQuantity: values.exportQuantity,
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
      <Button type="link" onClick={openNewForm}>
        Cập nhật
      </Button>
      <Modal
        title="Cập nhật chi tiết điều chuyển"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button form="update-transfer-material" key="submit" htmlType="submit" type="primary">
            Xác nhận
          </Button>,
          <Button form="update-transfer-material" key="cancel" htmlType="reset" onClick={handleCancel}>
            Hủy
          </Button>,
        ]}
      >
        <Form
          form={form}
          id="update-transfer-material"
          labelAlign="left"
          labelCol={{ span: 8 }}
          labelWrap
          onFinish={handleUpdate}
        >
          <Form.Item
            name="materialProvider"
            label="Nguyên vật liệu"
            labelCol={{ span: 9 }}
            rules={[{ required: true, message: 'Vui lòng chọn nguyên vật liệu!' }]}
            initialValue={record.materialProvider}
          >
            <SelectDropdown
              id="materialProvider"
              options={warehouseMaterialOptions}
              optionName={'nguyên vật liệu'}
              onSelect={(value: number) => {
                form.setFieldsValue({ materialProvider: value });
              }}
              currentValue={record.materialProvider.id.toString()}
              disabled
            />
          </Form.Item>
          <Form.Item
            name="exportQuantity"
            label="Số lượng điều chuyển"
            labelCol={{ span: 9 }}
            rules={[{ required: true, message: 'Vui lòng nhập số lượng điều chuyển!' }]}
            initialValue={record.exportQuantity}
          >
            <InputNumber id="exportQuantity" style={{ width: '100%' }} placeholder="Số lượng điều chuyển" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default EditRow;
