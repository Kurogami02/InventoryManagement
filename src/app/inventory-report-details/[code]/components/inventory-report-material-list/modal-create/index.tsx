import SelectDropdown, { SelectOptionDataType } from '@/app/components/SelectDropdown';
import { InventoryReportType } from '@/libs/api/inventory-report-api';
import InventoryReportDetailApi, { CreateInventoryReportDetailType } from '@/libs/api/inventory-report-detail-api';
import { Button, Form, InputNumber, Modal } from 'antd';
import { useForm } from 'antd/es/form/Form';
import useMessage from 'antd/es/message/useMessage';
import { getCookie } from 'cookies-next';
import { useState } from 'react';
import { mutate } from 'swr';

const AddRow: React.FC<{ inventoryReport: InventoryReportType; warehouseMaterialOptions: SelectOptionDataType[] }> = ({
  inventoryReport,
  warehouseMaterialOptions,
}) => {
  const [messageApi, context] = useMessage();
  const [form] = useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openNewForm = () => {
    setIsModalOpen(true);
    form.resetFields();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleCreate = async (values: CreateInventoryReportDetailType) => {
    const access_token = getCookie('access_token') || '';
    const inventoryReportDetailApi = new InventoryReportDetailApi(access_token);
    const { success, message } = await inventoryReportDetailApi.createInventoryReportDetail({
      ...values,
      inventoryReport: inventoryReport.code,
    });

    if (!success) {
      messageApi.error(message);
    } else {
      mutate('inventory-report-details-list');
      messageApi.success(message);
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
        title="Thêm nguyên vật liệu kiểm kê"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button form="add-inventory-report-material" key="submit" htmlType="submit" type="primary">
            Xác nhận
          </Button>,
          <Button form="add-inventory-report-material" key="cancel" htmlType="reset" onClick={handleCancel}>
            Hủy
          </Button>,
        ]}
      >
        <Form
          form={form}
          id="add-inventory-report-material"
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
            name="originQuantity"
            label="Số lượng hiện tại"
            labelCol={{ span: 9 }}
            rules={[{ required: true, message: 'Vui lòng nhập số lượng hiện tại!' }]}
          >
            <InputNumber id="originQuantity" style={{ width: '100%' }} placeholder="Số lượng hiện tại" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AddRow;
