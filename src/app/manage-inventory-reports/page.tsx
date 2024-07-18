'use client';

import InventoryReportApi, { InventoryReportType } from '@/libs/api/inventory-report-api';
import WarehouseApi from '@/libs/api/warehouse-api';
import useMessage from 'antd/es/message/useMessage';
import { getCookie } from 'cookies-next';
import { useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';
import SelectDropdown, { SelectOptionDataType } from '../components/SelectDropdown';
import Table, { ColumnsType, TableProps } from 'antd/es/table';
import { Button, Col, Input, Row, Spin } from 'antd';
import Link from 'next/link';
import moment from 'moment';
import NotFoundContent from '../components/NotFoundContent';
import RangeDatePickerVI from '../components/RangeDatePickerVI';
import ModalCreateInventoryReport from './components/modal-create';
import { UserType } from '@/libs/api/user-api';
import { INVENTORY_ENUM_VI } from '@/libs/enum/inventory-enum';
import ModalUpdateInventory from './components/modal-update';

const access_token = getCookie('access_token') || '';

const fetchWarehouseOptions = () => {
  const warehouseApi = new WarehouseApi(access_token);
  return warehouseApi.getAllWarehousesExceptDepartment();
};

const fetchInventoryReport = (filter: {
  code?: string;
  page?: number;
  warehouse?: number;
  transferAt?: { from?: Date; to?: Date };
}) => {
  const inventoryReportApi = new InventoryReportApi(access_token);
  return inventoryReportApi.getInventoryReportList(filter);
};

const ManageInventoryReports: React.FC = () => {
  const [messageApi, context] = useMessage();
  const [typing, setTyping] = useState<NodeJS.Timeout | null>();
  const [searchCode, setSearchCode] = useState<string | undefined>(undefined);
  const [pagination, setPagination] = useState(1);
  const [warehouse, setWarehouse] = useState<number>();
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [currentUser, setCurrentUser] = useState<UserType>();

  //Warehouse dropdown fetching
  const [warehouseOptions, setWarehouseOptions] = useState<SelectOptionDataType[]>([]);
  const { data: warehouseData } = useSWR('warehouse-dropdown', fetchWarehouseOptions);

  //Table data fetching
  const [inventoryReportData, setInventoryReportData] = useState(new Array<InventoryReportType>());
  const { data, isValidating } = useSWR('inventory-report-list', () =>
    fetchInventoryReport({
      code: searchCode,
      page: pagination,
      warehouse: warehouse,
      transferAt: { from: fromDate, to: toDate },
    }),
  );

  useEffect(() => {
    mutate('inventory-report-list');
  }, [pagination, searchCode, warehouse, fromDate, toDate]);

  useEffect(() => {
    if (warehouseData?.success && warehouseData.warehouses) {
      setWarehouseOptions(warehouseData.warehouses);
    }
  }, [warehouseData]);

  useEffect(() => {
    if (data?.success && data.inventoryReports) {
      setInventoryReportData(data.inventoryReports);
    }

    if (data?.success === false) messageApi.error(data?.message);
  }, [data]);

  useEffect(() => {
    const currentUserJson = getCookie('login-user')?.toString();
    if (currentUserJson) setCurrentUser(JSON.parse(currentUserJson));
  }, []);

  //Table configuration
  const renderColumn: ColumnsType<InventoryReportType> = [
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
      title: 'Trạng thái',
      align: 'center',
      dataIndex: ['status'],
      render: (value: string) => <>{INVENTORY_ENUM_VI[value]}</>,
    },
    {
      title: 'Ngày kiểm kê',
      align: 'center',
      dataIndex: ['inventoryReportAt'],
      render: (value: Date) => <>{moment(value).format('DD/MM/YYYY')}</>,
    },
    {
      title: 'Thao tác',
      align: 'center',
      render: (_, record: InventoryReportType) => (
        <>
          <ModalUpdateInventory inventory={record} />
        </>
      ),
    },
  ];

  const handlePagination = (pagination: TableProps<InventoryReportType>['pagination']) => {
    setPagination((pagination && pagination.current) || 1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (typing) {
      clearTimeout(typing);
    }

    // After 500ms, perform the search
    setTyping(
      setTimeout(() => {
        setSearchCode(value);
        setPagination(1);
      }, 500),
    );
  };

  const handleSelectWarehouse = (value: number) => {
    setWarehouse(value == 0 ? undefined : value);
    setPagination(1);
  };

  const handleDatePicker = (value: any) => {
    if (value) {
      const from = value[0] ? new Date(value[0].$d) : undefined;
      const to = value[1] ? new Date(value[1].$d) : undefined;
      setFromDate(from);
      setToDate(to);
    } else {
      setFromDate(undefined);
      setToDate(undefined);
    }
    setPagination(1);
  };

  return (
    <>
      {context}
      <Row gutter={8}>
        <Col span={5}>
          <Input placeholder="Tìm kiếm mã biên bản" size="middle" onChange={handleSearch} />
        </Col>
        <Col span={5}>
          <RangeDatePickerVI handleRangePicker={handleDatePicker} />
        </Col>
        <Col span={4.5}>
          <SelectDropdown options={warehouseOptions} optionName={'kho NVL'} onSelect={handleSelectWarehouse} />
        </Col>
        <Col span={11}>
          {currentUser?.role.id === 'nhanVienTongCuc' || currentUser?.role.id === 'nhanVienKho' ? (
            <ModalCreateInventoryReport warehouseOptions={warehouseOptions} />
          ) : null}
        </Col>
      </Row>
      <Table
        columns={renderColumn}
        dataSource={inventoryReportData}
        pagination={{
          current: pagination,
          pageSize: 10,
          total: data?.total,
          position: ['bottomCenter'],
        }}
        onChange={handlePagination}
        style={{ marginTop: 16 }}
        locale={{
          emptyText: isValidating ? <Spin size="large" /> : <NotFoundContent />,
        }}
      />
    </>
  );
};

export default ManageInventoryReports;
