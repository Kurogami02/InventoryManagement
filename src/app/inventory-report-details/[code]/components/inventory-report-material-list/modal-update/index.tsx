import SelectDropdown, { SelectOptionDataType } from '@/app/components/SelectDropdown';
import InventoryReportDetailApi, { InventoryReportDetailType } from '@/libs/api/inventory-report-detail-api';
import { Button, Form, InputNumber, Modal } from 'antd';
import { useForm } from 'antd/es/form/Form';
import useMessage from 'antd/es/message/useMessage';
import { getCookie } from 'cookies-next';
import { useState } from 'react';
import { mutate } from 'swr';

const EditRow: React.FC<{ record: InventoryReportDetailType; warehouseMaterialOptions: SelectOptionDataType[] }> = ({
  record,
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

  const handleUpdate = async (values: InventoryReportDetailType) => {
    console.log(123827321837128327);

    const access_token = getCookie('access_token') || '';
    const inventoryReportDetailApi = new InventoryReportDetailApi(access_token);

    const { success, message } = await inventoryReportDetailApi.updateInventoryReportDetail(record.id, {
      actualQuantity: values.actualQuantity,
    });
    console.log('🚀 ~ file: index.tsx:34 ~ handleUpdate ~ success:', success);

    if (success) {
      mutate('inventory-report-details-list');
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
        title="Cập nhật chi tiết kiểm kê"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button form="update-inventory-report-detail" key="submit" htmlType="submit" type="primary">
            Xác nhận
          </Button>,
          <Button form="update-inventory-report-detail" key="cancel" htmlType="reset" onClick={handleCancel}>
            Hủy
          </Button>,
        ]}
      >
        <Form
          form={form}
          id="update-inventory-report-detail"
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
            name="originQuantity"
            label="Số lượng hiện tại"
            labelCol={{ span: 9 }}
            rules={[{ required: true, message: 'Vui lòng nhập số lượng hiện tại!' }]}
            initialValue={record.originQuantity}
          >
            <InputNumber id="originQuantity" style={{ width: '100%' }} placeholder="Số lượng hiện tại" disabled />
          </Form.Item>
          <Form.Item
            name="actualQuantity"
            label="Số lượng thực tế"
            labelCol={{ span: 9 }}
            initialValue={record.originQuantity}
          >
            <InputNumber id="actualQuantity" style={{ width: '100%' }} placeholder="Số lượng thực tế" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default EditRow;
