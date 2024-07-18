import SelectDropdown, { SelectOptionDataType } from '@/app/components/SelectDropdown';
import { ImportType } from '@/libs/api/import-api';
import ImportDetailApi, { ImportDetailType } from '@/libs/api/import-detail-api';
import { Button, Form, Input, InputNumber, Modal } from 'antd';
import { useForm } from 'antd/es/form/Form';
import useMessage from 'antd/es/message/useMessage';
import { getCookie } from 'cookies-next';
import { useState } from 'react';
import { mutate } from 'swr';

const EditRow: React.FC<{
  record: ImportDetailType;
  importReceipt: ImportType;
  materialProviderOptions: SelectOptionDataType[];
  currentUserRole: string;
}> = ({ record, importReceipt, materialProviderOptions, currentUserRole }) => {
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

  const handleUpdate = async (values: ImportDetailType) => {
    const access_token = getCookie('access_token') || '';
    const importDetailApi = new ImportDetailApi(access_token);
    const { success, message } = await importDetailApi.updateImportDetail(
      record.id,
      {
        ...values,
        importReceipt: importReceipt,
      },
      currentUserRole,
    );

    if (success) {
      mutate('import-details-list');
      messageApi.success(message);
    } else {
      messageApi.error(message);
    }

    setIsModalOpen(false);
  };

  const status = importReceipt.status;

  const formBody =
    // nhanVienTongCuc can update materialProvider and expectQuantity when status is 'draft'
    currentUserRole === 'nhanVienTongCuc' && status === 'draft' ? (
      <>
        <Form.Item
          name="materialProvider"
          label="Nguyên vật liệu"
          labelCol={{ span: 9 }}
          rules={[{ required: true, message: 'Vui lòng chọn nguyên vật liệu!' }]}
          initialValue={record.materialProvider}
        >
          <SelectDropdown
            id="materialProvider"
            options={materialProviderOptions}
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
          <InputNumber id="expectQuantity" style={{ width: '100%' }} placeholder="Số lượng mong muốn" />
        </Form.Item>
      </>
    ) : //nhanVienKho can update actual quantity only when status is 'open'
    currentUserRole === 'nhanVienKho' && status === 'open' ? (
      <Form.Item
        name="actualQuantity"
        label="Số lượng thực tế"
        labelCol={{ span: 9 }}
        rules={[{ required: true, message: 'Vui lòng nhập số lượng thực tế!' }]}
        initialValue={record.actualQuantity}
      >
        <InputNumber id="actualQuantity" style={{ width: '100%' }} placeholder="Số lượng thực tế" />
      </Form.Item>
    ) : //qa can update note only
    currentUserRole === 'QA' && status === 'warehouse_confirm' ? (
      <Form.Item
        name="qaNote"
        label="Ghi chú"
        rules={[{ required: true, message: 'Vui lòng nhập Ghi chú!' }]}
        labelCol={{ span: 9 }}
        initialValue={record.qaNote}
      >
        <Input id="qaNote" style={{ width: '100%' }} placeholder="Ghi chú" />
      </Form.Item>
    ) : null;

  return (
    <>
      {context}
      {
        //Valid conditions to display update form
        (currentUserRole === 'nhanVienTongCuc' && status === 'draft') ||
        (currentUserRole === 'nhanVienKho' && status === 'open') ||
        (currentUserRole === 'QA' && status === 'warehouse_confirm') ? (
          <>
            <Button type="link" onClick={openNewForm}>
              Cập nhật
            </Button>
            <Modal
              title="Cập nhật chi tiết phiếu nhập"
              open={isModalOpen}
              onCancel={handleCancel}
              footer={[
                <Button form="update-import-material" key="submit" htmlType="submit" type="primary">
                  Xác nhận
                </Button>,
                <Button form="update-import-material" key="cancel" htmlType="reset" onClick={handleCancel}>
                  Hủy
                </Button>,
              ]}
            >
              <Form
                form={form}
                id="update-import-material"
                labelAlign="left"
                labelCol={{ span: 8 }}
                labelWrap
                onFinish={handleUpdate}
              >
                {formBody}
              </Form>
            </Modal>
          </>
        ) : null
      }
    </>
  );
};

export default EditRow;
