import TransferApi, { TransferType } from '@/libs/api/transfer-api';
import { TRANSFER_ENUM_VI } from '@/libs/enum/transfer-enum';
import { Col, Divider, Form, Input, Row } from 'antd';
import { useForm } from 'antd/es/form/Form';
import useMessage from 'antd/es/message/useMessage';
import { getCookie } from 'cookies-next';
import moment from 'moment';
import { useEffect, useState } from 'react';
import ModalUpdateTransfer from './modal-update-transfer';
import useSWR from 'swr';

const fetchTransferData = (code: string) => {
  const access_token = getCookie('access_token') || '';
  const transferApi = new TransferApi(access_token);
  return transferApi.getTransfer(code);
};

const TransferInfo: React.FC<{ code: string }> = ({ code }) => {
  const [messageApi, context] = useMessage();
  const [form] = useForm();
  const { data } = useSWR('transfer-info', () => fetchTransferData(code));
  const [transferData, setTransferData] = useState<TransferType | undefined>();

  //Fetch transfer data
  useEffect(() => {
    if (transferData) {
      form.setFieldsValue({
        code: transferData.code,
        status: TRANSFER_ENUM_VI[transferData.status],
        warehouseExport: transferData.warehouseExport.name,
        warehouseImport: transferData.warehouseImport.name,
        transferAt: moment(transferData.transferAt).format('DD/MM/YYYY'),
      });
    }
  }, [transferData]);

  useEffect(() => {
    if (data) {
      const transfer = data.transfer;
      setTransferData(transfer);
    }
    if (data?.success === false) messageApi.error(data?.message);
  }, [data]);

  return (
    <>
      {context}
      {transferData ? <ModalUpdateTransfer record={transferData} /> : <></>}
      <Divider orientation="left" orientationMargin="0">
        Thông tin phiếu điều chuyển
      </Divider>

      <Form form={form} id="transfers" labelAlign="left" labelCol={{ span: 8 }} labelWrap>
        <Row gutter={16}>
          <Col span={11}>
            <Form.Item name="code" label="Mã phiếu">
              <Input id="code" disabled />
            </Form.Item>
            <Form.Item name="status" label="Trạng thái">
              <Input id="status" disabled />
            </Form.Item>
            <Form.Item name="transferAt" label="Ngày điều chuyển">
              <Input id="transferAt" disabled />
            </Form.Item>
          </Col>
          <Col span={1} />
          <Col span={11}>
            <Form.Item name="warehouseExport" label="Kho xuất">
              <Input id="warehouseExport" disabled />
            </Form.Item>
            <Form.Item name="warehouseImport" label="Kho nhập">
              <Input id="warehouseImport" disabled />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default TransferInfo;
