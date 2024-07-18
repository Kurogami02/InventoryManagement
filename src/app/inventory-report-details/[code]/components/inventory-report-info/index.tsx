import InventoryReportApi, { InventoryReportType } from '@/libs/api/inventory-report-api';
import { Col, Divider, Form, Input, Row } from 'antd';
import { useForm } from 'antd/es/form/Form';
import useMessage from 'antd/es/message/useMessage';
import { getCookie } from 'cookies-next';
import moment from 'moment';
import { useEffect, useState } from 'react';
import ModalUpdateInventory from './modal-update-inventory';
import { INVENTORY_ENUM_VI } from '@/libs/enum/inventory-enum';
import useSWR from 'swr';

const fetchInventoryReportData = (code: string) => {
  const access_token = getCookie('access_token') || '';
  const inventoryReportApi = new InventoryReportApi(access_token);
  return inventoryReportApi.getInventoryReport(code);
};

const InventoryReportInfo: React.FC<{ code: string }> = ({ code }) => {
  const [messageApi, context] = useMessage();
  const [form] = useForm();
  const { data } = useSWR('inventory-report-info', () => fetchInventoryReportData(code));
  const [inventory, setInventory] = useState<InventoryReportType | undefined>();

  //Fetch inventory data
  useEffect(() => {
    if (inventory) {
      form.setFieldsValue({
        code: inventory.code,
        warehouse: inventory.warehouse.name,
        status: INVENTORY_ENUM_VI[inventory.status] || '',
        inventoryReportAt: moment(inventory.inventoryReportAt).format('DD/MM/YYYY'),
      });
    }
  }, [inventory]);

  useEffect(() => {
    if (data) {
      const inventoryReport = data.inventoryReport;
      setInventory(inventoryReport);
    }

    if (data?.success === false) messageApi.error(data?.message);
  }, [data]);

  return (
    <>
      {context}
      {inventory ? <ModalUpdateInventory inventory={inventory} /> : <></>}
      <Divider orientation="left" orientationMargin="0">
        Thông tin biên bản kiểm kê
      </Divider>

      <Form form={form} labelAlign="left" labelCol={{ span: 8 }} labelWrap>
        <Row gutter={16}>
          <Col span={11}>
            <Form.Item name="code" label="Mã biên bản kiểm kê">
              <Input id="code" disabled />
            </Form.Item>
            <Form.Item name="warehouse" label="Kho kiểm kê">
              <Input id="warehouse" disabled />
            </Form.Item>
          </Col>
          <Col span={11}>
            <Form.Item name="status" label="Trạng thái">
              <Input id="status" disabled />
            </Form.Item>
            <Form.Item name="inventoryReportAt" label="Ngày kiểm kê">
              <Input id="inventoryReportAt" disabled />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default InventoryReportInfo;
