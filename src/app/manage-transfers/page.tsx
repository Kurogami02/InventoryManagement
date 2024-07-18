'use client';

import { UserType } from '@/libs/api/user-api';
import WarehouseApi, { WarehouseType } from '@/libs/api/warehouse-api';
import useMessage from 'antd/es/message/useMessage';
import { getCookie } from 'cookies-next';
import { useEffect, useState } from 'react';
import SelectDropdown, { SelectOptionDataType } from '../components/SelectDropdown';
import useSWR, { mutate } from 'swr';
import TransferApi, { TransferType } from '@/libs/api/transfer-api';
import Table, { ColumnsType, TableProps } from 'antd/es/table';
import Link from 'next/link';
import { Button, Col, Input, Row, Spin } from 'antd';
import RangeDatePickerVI from '../components/RangeDatePickerVI';
import NotFoundContent from '../components/NotFoundContent';
import ModalCreateTransfer from './components/modal-create';
import { TRANSFER_ENUM_VI } from '@/libs/enum/transfer-enum';
import ModalUpdateTransfer from './components/modal-update';
import moment from 'moment';

const access_token = getCookie('access_token') || '';

const fetchWarehouseOptions = () => {
  const warehouseApi = new WarehouseApi(access_token);
  return warehouseApi.getAllWarehousesExceptDepartment();
};

const fetchTransfer = (filter: {
  code?: string;
  page?: number;
  transferAt?: { from?: Date; to?: Date };
  warehouseExport?: number;
  warehouseImport?: number;
}) => {
  const transferApi = new TransferApi(access_token);
  return transferApi.getTransferList(filter);
};

const ManageTransfers: React.FC = () => {
  const [messageApi, context] = useMessage();
  const [typing, setTyping] = useState<NodeJS.Timeout | null>();
  const [searchCode, setSearchCode] = useState('');
  const [pagination, setPagination] = useState(1);
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [warehouseExport, setWarehouseExport] = useState<number>();
  const [warehouseImport, setWarehouseImport] = useState<number>();
  const [currentUser, setCurrentUser] = useState<UserType>();

  useEffect(() => {
    const currentUserJson = getCookie('login-user')?.toString();
    if (currentUserJson) setCurrentUser(JSON.parse(currentUserJson));
  }, []);

  //Warehouse dropdown fetching
  const [warehouseOptions, setWarehouseOptions] = useState<SelectOptionDataType[]>([]);
  const { data: warehouseData } = useSWR('warehouse-dropdown', fetchWarehouseOptions);

  //Table data fetching
  const [transferData, setTransferData] = useState(new Array<TransferType>());
  const { data, isValidating } = useSWR('transfer-list', () =>
    fetchTransfer({
      code: searchCode,
      page: pagination,
      transferAt: { from: fromDate, to: toDate },
      warehouseExport: warehouseExport,
      warehouseImport: warehouseImport,
    }),
  );

  useEffect(() => {
    mutate('transfer-list');
  }, [pagination, searchCode, warehouseExport, warehouseImport, fromDate, toDate]);

  useEffect(() => {
    if (warehouseData?.success && warehouseData.warehouses) {
      setWarehouseOptions(warehouseData.warehouses);
    }
  }, [warehouseData]);

  useEffect(() => {
    if (data?.success && data.transfers) {
      setTransferData(data.transfers.map((item, index) => ({ key: index, ...item })));
    }

    if (data?.success === false) messageApi.error(data?.message);
  }, [data]);

  //Table configuration
  const renderColumn: ColumnsType<TransferType> = [
    {
      title: 'Mã điều chuyển',
      align: 'center',
      render: (_, record: any) => (
        <>
          <Link href="/transfer-details/[code]" as={`/transfer-details/${record.code}`} prefetch>
            <Button type="link">{record.code}</Button>
          </Link>
        </>
      ),
    },
    {
      title: 'Kho gửi',
      align: 'center',
      dataIndex: ['warehouseExport', 'name'],
    },
    {
      title: 'Kho nhận',
      align: 'center',
      dataIndex: ['warehouseImport', 'name'],
    },
    {
      title: 'Ngày gửi',
      align: 'center',
      dataIndex: ['transferAt'],
      render: (value: Date) => <>{moment(value).format('DD/MM/YYYY')}</>,
    },
    {
      title: 'Trạng thái',
      align: 'center',
      render: (_, record: TransferType) => <>{TRANSFER_ENUM_VI[record.status]}</>,
    },
    {
      title: 'Thao tác',
      align: 'center',
      render: (_, record: TransferType) => (
        <>
          <ModalUpdateTransfer record={record} />
        </>
      ),
    },
  ];

  const handlePagination = (pagination: TableProps<TransferType>['pagination']) => {
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

  const handleSelectWarehouseExport = (value: number) => {
    setWarehouseExport(value == 0 ? undefined : value);
    setPagination(1);
  };

  const handleSelectWarehouseImport = (value: number) => {
    setWarehouseImport(value == 0 ? undefined : value);
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
          <Input placeholder="Tìm kiếm mã điều chuyển" size="middle" onChange={handleSearch} />
        </Col>
        <Col span={5}>
          <RangeDatePickerVI handleRangePicker={handleDatePicker} />
        </Col>
        <Col span={4.5}>
          <SelectDropdown options={warehouseOptions} optionName={'kho giao'} onSelect={handleSelectWarehouseExport} />
        </Col>
        <Col span={4.5}>
          <SelectDropdown
            options={warehouseOptions.filter((item) => item.value != warehouseExport?.toString())}
            optionName={'kho nhận'}
            onSelect={handleSelectWarehouseImport}
          />
        </Col>
        {currentUser?.role.id === 'nhanVienTongCuc' ? (
          <Col span={8}>
            <ModalCreateTransfer warehouseOptions={warehouseOptions} />
          </Col>
        ) : (
          <></>
        )}
      </Row>
      <Table
        columns={renderColumn}
        dataSource={transferData}
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

export default ManageTransfers;
