import SelectDropdown, { SelectOptionDataType } from '@/app/components/SelectDropdown';
import ExportDetailApi, { ExportDetailType } from '@/libs/api/export-detail-api';
import { Button, Form, InputNumber, Modal } from 'antd';
import { useForm } from 'antd/es/form/Form';
import useMessage from 'antd/es/message/useMessage';
import { getCookie } from 'cookies-next';
import { useState } from 'react';
import { mutate } from 'swr';

const EditRow: React.FC<{
  record: ExportDetailType;
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

  const handleUpdate = async (values: ExportDetailType) => {
    const access_token = getCookie('access_token') || '';
    const exportDetailApi = new ExportDetailApi(access_token);

    const { success, message } = await exportDetailApi.updateExportDetail(record.id, {
      expectQuantity: values.expectQuantity,
      returnQuantity: values.returnQuantity == 0 ? undefined : values.returnQuantity,
    });

    if (success) {
      mutate('export-details-list');
      messageApi.success(message);
    } else {
      messageApi.error(message);
    }

    setIsModalOpen(false);
  };

  const exportStatus = record.exportReceipt.status;

  return (
    <>
      {context}
      <Button type="link" onClick={openNewForm}>
        Cập nhật
      </Button>
      <Modal
        title="Cập nhật chi tiết phiếu xuất"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button form="update-export-material" key="submit" htmlType="submit" type="primary">
            Xác nhận
          </Button>,
          <Button form="update-export-material" key="cancel" htmlType="reset" onClick={handleCancel}>
            Hủy
          </Button>,
        ]}
      >
        <Form
          form={form}
          id="update-export-material"
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
            name="expectQuantity"
            label="Số lượng mong muốn"
            labelCol={{ span: 9 }}
            rules={[{ required: true, message: 'Vui lòng nhập số lượng mong muốn!' }]}
            initialValue={record.expectQuantity}
          >
            <InputNumber
              id="expectQuantity"
              style={{ width: '100%' }}
              placeholder="Số lượng mong muốn"
              disabled={exportStatus === 'warehouse_confirm'}
            />
          </Form.Item>
          <Form.Item
            name="returnQuantity"
            label="Số lượng hoàn trả"
            labelCol={{ span: 9 }}
            initialValue={record.returnQuantity}
            rules={[
              {
                required: exportStatus === 'warehouse_confirm',
                message: 'Vui lòng nhập số lượng hoàn trả',
              },
            ]}
          >
            <InputNumber id="returnQuantity" style={{ width: '100%' }} placeholder="Số lượng hoàn trả" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default EditRow;
