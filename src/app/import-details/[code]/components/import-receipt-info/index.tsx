import ImportApi, { ImportType } from '@/libs/api/import-api';
import { IMPORT_ENUM_VI } from '@/libs/enum/import-enum';
import { Col, Divider, Form, Input, Row } from 'antd';
import { useForm } from 'antd/es/form/Form';
import useMessage from 'antd/es/message/useMessage';
import { getCookie } from 'cookies-next';
import moment from 'moment';
import { useEffect, useState } from 'react';
import ModalUpdateImport from './modal-update-import';
import useSWR from 'swr';

const fetchImportData = (code: string) => {
  const access_token = getCookie('access_token') || '';
  const importApi = new ImportApi(access_token);
  return importApi.getImport(code);
};

const ImportReceiptInfo: React.FC<{ code: string }> = ({ code }) => {
  const [messageApi, context] = useMessage();
  const [form] = useForm();
  const { data } = useSWR('import-info', () => fetchImportData(code));
  const [importData, setImportData] = useState<ImportType | undefined>();

  useEffect(() => {
    if (importData) {
      form.setFieldsValue({
        code: importData.code,
        status: IMPORT_ENUM_VI[importData.status],
        provider: importData.provider.name,
        warehouse: importData.warehouse.name,
        importAt: moment(importData.importAt).format('DD/MM/YYYY'),
        note: importData.note,
      });
    }
  }, [importData]);

  useEffect(() => {
    if (data) {
      const importReceipt = data.importReceipt;
      setImportData(importReceipt);
    }

    if (data?.success === false) messageApi.error(data?.message);
  }, [data]);

  return (
    <>
      {context}
      {importData ? <ModalUpdateImport importReceipt={importData} /> : <></>}
      <Divider orientation="left" orientationMargin="0">
        Thông tin phiếu nhập
      </Divider>

      <Form form={form} id="imports" labelAlign="left" labelCol={{ span: 8 }} labelWrap>
        <Row gutter={16}>
          <Col span={11}>
            <Form.Item name="code" label="Mã phiếu nhập">
              <Input id="code" disabled />
            </Form.Item>
            <Form.Item name="warehouse" label="Kho">
              <Input id="warehouse" disabled />
            </Form.Item>
            <Form.Item name="provider" label="Nhà cung cấp">
              <Input id="provider" disabled />
            </Form.Item>
          </Col>
          <Col span={1} />
          <Col span={11}>
            <Form.Item name="status" label="Trạng thái">
              <Input id="status" disabled />
            </Form.Item>
            <Form.Item name="importAt" label="Ngày nhập">
              <Input id="importAt" disabled />
            </Form.Item>
            {/* <Form.Item name="note" label="Ghi chú">
              <Input.TextArea id="note" disabled />
            </Form.Item> */}
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default ImportReceiptInfo;
