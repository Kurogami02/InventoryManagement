import DatePickerVI from '@/app/components/DatePickerVI';
import { SelectOptionDataType } from '@/app/components/SelectDropdown';
import TransferApi from '@/libs/api/transfer-api';
import { Button, Form, Modal, Select } from 'antd';
import { useForm } from 'antd/es/form/Form';
import useMessage from 'antd/es/message/useMessage';
import { getCookie } from 'cookies-next';
import { useEffect, useState } from 'react';
import { mutate } from 'swr';

const ModalCreateTransfer: React.FC<{ warehouseOptions: SelectOptionDataType[] }> = ({ warehouseOptions }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = useForm();
  const [messageApi, context] = useMessage();
  const [warehouseImportOptions, setWarehouseImportOptions] = useState<SelectOptionDataType[]>(warehouseOptions);

  useEffect(() => {
    const fromWarehouseValue = form.getFieldValue('warehouseExport');
    setWarehouseImportOptions(warehouseOptions.filter((item) => item.value !== fromWarehouseValue));
  }, [form.getFieldValue('warehouseExport')]);

  const handleCreateTransfer = async (values: any) => {
    //Handle API Create Transfer
    const access_token = getCookie('access_token') || '';
    const transferApi = new TransferApi(access_token);
    const { success, message } = await transferApi.createTransfer(values);

    //Return message to UI
    if (success) {
      mutate('transfer-list');
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
        Thêm phiếu điều chuyển
      </Button>
      <Modal
        title="Thêm phiếu điều chuyển mới"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button form="create-transfer" key="submit" htmlType="submit" type="primary">
            Xác nhận
          </Button>,
          <Button form="create-transfer" key="cancel" htmlType="reset" onClick={handleCancel}>
            Hủy
          </Button>,
        ]}
      >
        <Form
          form={form}
          id="create-transfer"
          labelAlign="left"
          labelCol={{ span: 8 }}
          labelWrap
          onFinish={handleCreateTransfer}
        >
          <Form.Item
            name="warehouseExport"
            label="Kho xuất NVL"
            rules={[{ required: true, message: 'Vui lòng chọn kho xuất nguyên vật liệu!' }]}
          >
            <Select
              id="warehouseExport"
              options={warehouseOptions}
              placeholder={'Chọn Kho xuất nguyên vật liệu'}
              onSelect={(value: number) => {
                form.setFieldsValue({ warehouseExport: value });

                //Obmit selected warehouseExport out of the warehouseImport list
                setWarehouseImportOptions(warehouseOptions.filter((item) => item.value !== value.toString()));

                //if we re-choose the same warehouse, reset the warehouseImport field
                if (form.getFieldValue('warehouseImport') == value.toString()) {
                  form.setFieldsValue({ warehouseImport: undefined });
                }
              }}
            />
          </Form.Item>
          <Form.Item
            name="warehouseImport"
            label="Kho nhập NVL"
            rules={[{ required: true, message: 'Vui lòng chọn kho nhập nguyên vật liệu!' }]}
          >
            <Select
              id="warehouseImport"
              options={warehouseImportOptions}
              placeholder={'Chọn Kho nhập nguyên vật liệu'}
              onSelect={(value: number) => {
                form.setFieldsValue({ warehouseImport: value });
              }}
              disabled={!form.getFieldValue('warehouseExport')}
            />
          </Form.Item>
          <Form.Item
            name="transferAt"
            label="Ngày điều chuyển"
            rules={[{ required: true, message: 'Vui lòng chọn ngày xuất nguyên vật liệu!' }]}
          >
            <DatePickerVI
              handleRangePicker={(value: Date) => {
                form.setFieldsValue({ transferAt: value });
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ModalCreateTransfer;
