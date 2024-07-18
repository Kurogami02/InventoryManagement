import ExportApi, { ExportType } from '@/libs/api/export-api';
import { EXPORT_ENUM_VI } from '@/libs/enum/export-enum';
import { Col, Divider, Form, Input, Row } from 'antd';
import { useForm } from 'antd/es/form/Form';
import useMessage from 'antd/es/message/useMessage';
import { getCookie } from 'cookies-next';
import moment from 'moment';
import { useEffect, useState } from 'react';
import ModalUpdateExport from './modal-update-export';
import useSWR from 'swr';

const fetchExportData = (code: string) => {
  const access_token = getCookie('access_token') || '';
  const exportApi = new ExportApi(access_token);
  return exportApi.getExport(code);
};

const ExportReceiptInfo: React.FC<{ code: string }> = ({ code }) => {
  const [messageApi, context] = useMessage();
  const [form] = useForm();
  const { data } = useSWR('export-info', () => fetchExportData(code));
  const [exportData, setExportData] = useState<ExportType | undefined>();

  useEffect(() => {
    if (exportData) {
      form.setFieldsValue({
        code: exportData.code,
        status: EXPORT_ENUM_VI[exportData.status],
        productionUnit: exportData.productionUnit.name,
        warehouse: exportData.warehouse.name,
        exportAt: moment(exportData.exportAt).format('DD/MM/YYYY'),
      });
    }
  }, [exportData]);

  useEffect(() => {
    if (data) {
      const exportReceipt = data.exportReceipt;
      setExportData(exportReceipt);
    }

    if (data?.success === false) messageApi.error(data?.message);
  }, [data]);

  return (
    <>
      {context}
      {exportData ? <ModalUpdateExport exportReceipt={exportData} /> : <></>}
      <Divider orientation="left" orientationMargin="0">
        Thông tin phiếu xuất
      </Divider>

      <Form form={form} id="exports" labelAlign="left" labelCol={{ span: 8 }} labelWrap>
        <Row gutter={16}>
          <Col span={11}>
            <Form.Item name="code" label="Mã phiếu xuất">
              <Input id="code" disabled />
            </Form.Item>
            <Form.Item name="warehouse" label="Kho">
              <Input id="warehouse" disabled />
            </Form.Item>
            <Form.Item name="productionUnit" label="Đơn vị sản xuất">
              <Input id="productionUnit" disabled />
            </Form.Item>
          </Col>
          <Col span={1} />
          <Col span={11}>
            <Form.Item name="status" label="Trạng thái">
              <Input id="status" disabled />
            </Form.Item>
            <Form.Item name="exportAt" label="Ngày xuất">
              <Input id="exportAt" disabled />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default ExportReceiptInfo;
