import DatePickerVI from '@/app/components/DatePickerVI';
import SelectDropdown, { SelectOptionDataType } from '@/app/components/SelectDropdown';
import InventoryReportApi, { CreateInventoryReportType } from '@/libs/api/inventory-report-api';
import { Button, Form, Modal } from 'antd';
import { useForm } from 'antd/es/form/Form';
import useMessage from 'antd/es/message/useMessage';
import { getCookie } from 'cookies-next';
import { useState } from 'react';
import { mutate } from 'swr';

const ModalCreateInventoryReport: React.FC<{ warehouseOptions: SelectOptionDataType[] }> = ({ warehouseOptions }) => {
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

  const handleCreateInventoryReport = async (values: CreateInventoryReportType) => {
    //Handle API Create Inventory Report
    const access_token = getCookie('access_token') || '';
    const inventoryReportApi = new InventoryReportApi(access_token);
    const { success, message } = await inventoryReportApi.createInventoryReport(values);

    //Return message to UI
    if (success) {
      mutate('inventory-report-list');
      messageApi.success(message);
    } else {
      messageApi.error(message);
    }

    //Close modal
    setIsModalOpen(false);
  };

  return (
    <>
      {context}
      <Button type="primary" style={{ float: 'right' }} onClick={openNewForm}>
        Tạo biên bản kiểm kê
      </Button>
      <Modal
        title="Tạo biên bản kiểm kê mới"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button form="create-inventory-report" key="submit" htmlType="submit" type="primary">
            Xác nhận
          </Button>,
          <Button form="create-inventory-report" key="cancel" htmlType="reset" onClick={handleCancel}>
            Hủy
          </Button>,
        ]}
      >
        <Form
          form={form}
          id="create-inventory-report"
          labelAlign="left"
          labelCol={{ span: 8 }}
          labelWrap
          onFinish={handleCreateInventoryReport}
        >
          <Form.Item
            name="warehouse"
            label="Kho nhập NVL"
            rules={[{ required: true, message: 'Vui lòng chọn kho thực hiện kiểm kê!' }]}
          >
            <SelectDropdown
              id="warehouse"
              options={warehouseOptions}
              optionName={'Kho thực hiện kiểm kê'}
              onSelect={(value: number) => {
                form.setFieldsValue({ warehouse: value });
              }}
            />
          </Form.Item>
          <Form.Item
            name="inventoryReportAt"
            label="Thời gian kiểm kê"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian kiểm kê!' }]}
          >
            <DatePickerVI
              handleRangePicker={(value: Date) => {
                form.setFieldsValue({ inventoryReportAt: value });
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ModalCreateInventoryReport;
