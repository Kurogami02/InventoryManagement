'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import useMessage from 'antd/es/message/useMessage';
import Table, { ColumnsType, TableProps } from 'antd/es/table';
import { getCookie } from 'cookies-next';
import { Button, Col, Input, Row, Spin } from 'antd';
import useSWR, { mutate } from 'swr';

import NotFoundContent from '../components/NotFoundContent';
import SelectDropdown, { SelectOptionDataType } from '../components/SelectDropdown';
import ImportApi, { ImportType } from '@/libs/api/import-api';
import WarehouseApi from '@/libs/api/warehouse-api';
import ProviderApi from '@/libs/api/provider-api';
import ModalCreateImport from './components/modal-create';
import ModalUpdateImport from './components/modal-update';
import RangeDatePickerVI from '../components/RangeDatePickerVI';
import { IMPORT_ENUM_VI } from '@/libs/enum/import-enum';
import { UserType } from '@/libs/api/user-api';
import moment from 'moment';

const fetchImport = (filter: {
  search_code?: string;
  page?: number;
  warehouse?: number;
  provider?: number;
  importAt?: { from?: Date; to?: Date };
}) => {
  const access_token = getCookie('access_token') || '';
  const importApi = new ImportApi(access_token);
  return importApi.getImportList(filter);
};

const fetchWarehouseOptions = () => {
  const access_token = getCookie('access_token') || '';
  const warehouseApi = new WarehouseApi(access_token);
  return warehouseApi.getAllWarehousesExceptDepartment();
};

const fetchProviderOptions = () => {
  const access_token = getCookie('access_token') || '';
  const providerApi = new ProviderApi(access_token);
  return providerApi.getAllProviders();
};

const ManageImports: React.FC = () => {
  //Filter params
  const [messageApi, context] = useMessage();
  const [currentUser, setCurrentUser] = useState<UserType>();
  const [typing, setTyping] = useState<NodeJS.Timeout | null>();
  const [searchCode, setSearchCode] = useState('');
  const [pagination, setPagination] = useState(1);
  const [warehouse, setWarehouse] = useState(currentUser?.warehouse.id);
  const [provider, setProvider] = useState<number>();
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();

  //Warehouse dropdown fetching
  const [warehouseOptions, setWarehouseOptions] = useState<SelectOptionDataType[]>([]);
  const { data: warehouseData } = useSWR('warehouse-dropdown', fetchWarehouseOptions);

  //Provider dropdown fetching
  const [providerOptions, setProviderOptions] = useState<SelectOptionDataType[]>([]);
  const { data: providerData } = useSWR('provider-dropdown', fetchProviderOptions);

  //Table data fetching
  const [importData, setImportData] = useState(new Array<ImportType>());
  const { data, isValidating } = useSWR('import-list', () =>
    fetchImport({
      search_code: searchCode,
      page: pagination,
      warehouse,
      provider,
      importAt: { from: fromDate, to: toDate },
    }),
  );

  useEffect(() => {
    const currentUserJson = getCookie('login-user')?.toString();
    if (currentUserJson) setCurrentUser(JSON.parse(currentUserJson));
  }, []);

  const renderColumn: ColumnsType<ImportType> = [
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
    // {
    //   title: 'Ghi chú',
    //   align: 'center',
    //   dataIndex: 'note',
    // },
    {
      title: 'Thao tác',
      align: 'center',
      render: (_, record: any) => (
        <>
          <ModalUpdateImport importReceipt={record} />
        </>
      ),
    },
  ];

  const handlePagination = (pagination: TableProps<ImportType>['pagination']) => {
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

  const handleSelectProvider = (value: number) => {
    setProvider(value == 0 ? undefined : value);
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

  useEffect(() => {
    if (data?.success && data.importReceipts) {
      const fetchedData = data.importReceipts.map((item, index) => ({ key: index, ...item }));
      setImportData(fetchedData);
    }
    if (data?.success === false) {
      messageApi.error(data?.message);
    }
  }, [data]);

  useEffect(() => {
    mutate('import-list');
  }, [pagination, searchCode, warehouse, provider, fromDate, toDate]);

  useEffect(() => {
    if (warehouseData?.success && warehouseData.warehouses) {
      setWarehouseOptions(warehouseData.warehouses);
    }

    if (providerData?.success && providerData.providers) {
      setProviderOptions(providerData.providers);
    }
  }, [warehouseData, providerData]);

  useEffect(() => {
    if (currentUser?.role.id !== 'nhanVienTongCuc') setWarehouse(currentUser?.warehouse.id);
  }, [currentUser]);

  return (
    <>
      {context}
      <Row gutter={8}>
        <Col span={5}>
          <Input placeholder="Tìm kiếm mã phiếu nhập" size="middle" onChange={handleSearch} />
        </Col>
        <Col span={5}>
          <RangeDatePickerVI handleRangePicker={handleDatePicker} />
        </Col>
        {currentUser?.role.id === 'nhanVienTongCuc' ? (
          <Col span={4.5}>
            <SelectDropdown options={warehouseOptions} optionName={'kho NVL'} onSelect={handleSelectWarehouse} />
          </Col>
        ) : (
          <></>
        )}
        <Col span={4.5}>
          <SelectDropdown options={providerOptions} optionName={'nhà cung cấp'} onSelect={handleSelectProvider} />
        </Col>
        {currentUser?.role.id === 'nhanVienTongCuc' ? (
          <Col span={7}>
            <ModalCreateImport providerOptions={providerOptions} warehouseOptions={warehouseOptions} />
          </Col>
        ) : (
          <></>
        )}
      </Row>
      <Table
        columns={renderColumn}
        dataSource={importData}
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

export default ManageImports;
