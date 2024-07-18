'use client';

import WarehouseApi from '@/libs/api/warehouse-api';
import { Button, Col, Divider, Form, Row, Table } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { getCookie } from 'cookies-next';
import { useEffect, useState } from 'react';
import SelectDropdown, { SelectOptionDataType } from '../components/SelectDropdown';
import useSWR from 'swr';
import RangeDatePickerVI from '../components/RangeDatePickerVI';
import ExportApi from '@/libs/api/export-api';
import ImportApi from '@/libs/api/import-api';
import InventoryReportApi from '@/libs/api/inventory-report-api';
import { ColumnsType } from 'antd/es/table';
import { AnyObject } from 'antd/es/_util/type';
import Link from 'next/link';
import moment from 'moment';
import { EXPORT_ENUM_VI } from '@/libs/enum/export-enum';
import NotFoundContent from '../components/NotFoundContent';
import { IMPORT_ENUM_VI } from '@/libs/enum/import-enum';

const access_token = getCookie('access_token') || '';

const fetchWarehouseOptions = () => {
  const warehouseApi = new WarehouseApi(access_token);
  return warehouseApi.getAllWarehousesExceptDepartment();
};

const WarehouseReport: React.FC = () => {
  const [reportTable, setReportTable] = useState(<></>);
  const [form] = useForm();

  //Warehouse dropdown fetching
  const [warehouseOptions, setWarehouseOptions] = useState<SelectOptionDataType[]>([]);
  const { data: warehouseData } = useSWR('warehouse-dropdown', fetchWarehouseOptions);

  useEffect(() => {
    if (warehouseData?.success && warehouseData.warehouses) {
      const defaultOptions = { value: '', label: 'Tất cả' };
      if (!warehouseOptions.includes(defaultOptions)) {
        setWarehouseOptions([defaultOptions, ...warehouseData.warehouses]);
      }
    }
  }, [warehouseData]);

  //Report types
  const reportTypes: SelectOptionDataType[] = [
    {
      value: 'export',
      label: 'Báo cáo xuất kho',
    },
    {
      value: 'import',
      label: 'Báo cáo nhập kho',
    },
    {
      value: 'inventory',
      label: 'Biên bản kiểm kê',
    },
  ];

  const generateReport = async (values: {
    warehouse: number;
    reportRange: { from: Date; to: Date };
    reportType: 'export' | 'import' | 'inventory';
  }) => {
    //Get report data
    const access_token = getCookie('access_token') || '';
    let dataSource = [];
    let columns: ColumnsType<AnyObject> = [];
    switch (values.reportType) {
      case 'export':
        //Get export data
        const exportApi = new ExportApi(access_token);
        const { exportReceipts } = await exportApi.getExportList({
          size: 1000,
          warehouse: values.warehouse,
          exportAt: values.reportRange,
        });
        dataSource = exportReceipts.map((item, index) => ({ key: index, ...item }));

        //Config table columns
        columns = [
          {
            title: 'STT',
            align: 'center',
            render: (_, record: any) => <>{record.key + 1}</>,
          },
          {
            title: 'Mã phiếu xuất',
            align: 'center',
            render: (_, record: any) => (
              <>
                <Link href="/export-details/[code]" as={`/export-details/${record.code}`} prefetch>
                  <Button type="link">{record.code}</Button>
                </Link>
              </>
            ),
          },
          {
            title: 'Kho',
            align: 'center',
            dataIndex: ['warehouse', 'name'],
          },
          {
            title: 'Đơn vị sản xuất',
            align: 'center',
            dataIndex: ['productionUnit', 'name'],
          },
          {
            title: 'Ngày xuất',
            align: 'center',
            dataIndex: 'exportAt',
            render: (value: Date) => <>{moment(value).format('DD/MM/YYYY')}</>,
          },
          {
            title: 'Trạng thái',
            align: 'center',
            render: (_, record: any) => <>{EXPORT_ENUM_VI[record.status]}</>,
          },
        ];

        break;

      case 'import':
        //Get export data
        const importApi = new ImportApi(access_token);
        const { importReceipts } = await importApi.getImportList({
          size: 1000,
          warehouse: values.warehouse,
          importAt: values.reportRange,
        });
        dataSource = importReceipts.map((item, index) => ({ key: index, ...item }));

        //Config table columns
        columns = [
          {
            title: 'STT',
            align: 'center',
            render: (_, record: any) => <>{record.key + 1}</>,
          },
          {
            title: 'Mã phiếu nhập',
            align: 'center',
            render: (_, record: any) => (
              <>
                <Link href="/import-details/[code]" as={`/import-details/${record.code}`} prefetch>
                  <Button type="link">{record.code}</Button>
                </Link>
              </>
            ),
          },
          {
            title: 'Nhà cung cấp',
            align: 'center',
            dataIndex: ['provider', 'name'],
          },
          {
            title: 'Kho',
            align: 'center',
            dataIndex: ['warehouse', 'name'],
          },
          {
            title: 'Ngày nhập',
            align: 'center',
            dataIndex: 'importAt',
            render: (value: Date) => <>{moment(value).format('DD/MM/YYYY')}</>,
          },
          {
            title: 'Trạng thái',
            align: 'center',
            render: (_, record: any) => <>{IMPORT_ENUM_VI[record.status]}</>,
          },
        ];
        break;

      case 'inventory':
        //Get inventory data
        const inventoryApi = new InventoryReportApi(access_token);
        const { inventoryReports } = await inventoryApi.getInventoryReportList({
          size: 1000,
          warehouse: values.warehouse,
          inventoryReportAt: values.reportRange,
        });

        dataSource = inventoryReports.map((item, index) => ({ key: index, ...item }));

        //Config table columns
        columns = [
          {
            title: 'STT',
            align: 'center',
            render: (_, record: any) => <>{record.key + 1}</>,
          },
          {
            title: 'Mã biên bản kiểm kê',
            align: 'center',
            render: (_, record: any) => (
              <>
                <Link href="/inventory-report-details/[code]" as={`/inventory-report-details/${record.code}`} prefetch>
                  <Button type="link">{record.code}</Button>
                </Link>
              </>
            ),
          },
          {
            title: 'Kho kiểm kê',
            align: 'center',
            dataIndex: ['warehouse', 'name'],
          },
          {
            title: 'Ngày kiểm kê',
            align: 'center',
            dataIndex: ['inventoryReportAt'],
            render: (value: Date) => <>{moment(value).format('DD/MM/YYYY')}</>,
          },
        ];

        break;
    }

    setReportTable(
      <Table
        columns={columns}
        dataSource={dataSource}
        style={{ marginTop: 16, width: '100%' }}
        pagination={false}
        locale={{
          emptyText: <NotFoundContent />,
        }}
      />,
    );
  };

  return (
    <>
      <Divider orientation="left" orientationMargin="0">
        Chọn loại báo cáo
      </Divider>
      <Form
        form={form}
        labelAlign="left"
        labelCol={{ span: 8 }}
        labelWrap
        wrapperCol={{ span: 10 }}
        onFinish={generateReport}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="1. Chọn kho" name={'warehouse'}>
              <SelectDropdown
                id="warehouse"
                optionName=" kho để tạo báo cáo..."
                options={warehouseOptions}
                onSelect={(value: number) => {
                  form.setFieldValue('warehouse', value);
                }}
              />
            </Form.Item>
            <Form.Item label="2. Chọn ngày xuất báo cáo" name={'reportRange'}>
              <RangeDatePickerVI
                handleRangePicker={(value: any) => {
                  if (value?.length > 0) {
                    const from = value[0] ? new Date(value[0].$d) : undefined;
                    const to = value[1] ? new Date(value[1].$d) : undefined;
                    form.setFieldValue('reportRange', { from, to });
                  }
                }}
              />
            </Form.Item>
            <Form.Item label="3. Chọn loại báo cáo" name={'reportType'}>
              <SelectDropdown
                id="reportType"
                options={reportTypes}
                optionName={'loại báo cáo'}
                onSelect={(value: string) => {
                  form.setFieldsValue({ reportType: value });
                }}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Xem báo cáo
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <Row gutter={16}>{reportTable}</Row>
    </>
  );
};

export default WarehouseReport;
