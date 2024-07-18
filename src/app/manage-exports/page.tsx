'use client';

import { useEffect, useState } from 'react';
import useMessage from 'antd/es/message/useMessage';
import { getCookie } from 'cookies-next';
import useSWR, { mutate } from 'swr';

import { UserType } from '@/libs/api/user-api';
import SelectDropdown, { SelectOptionDataType } from '../components/SelectDropdown';
import WarehouseApi from '@/libs/api/warehouse-api';
import ExportApi, { ExportType } from '@/libs/api/export-api';
import ProductionUnitApi from '@/libs/api/production-unit-api';
import { Button, Col, Input, Row, Spin, TableProps } from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import { EXPORT_ENUM_VI } from '@/libs/enum/export-enum';
import Link from 'next/link';
import NotFoundContent from '../components/NotFoundContent';
import RangeDatePickerVI from '../components/RangeDatePickerVI';
import ModalCreateExport from './components/modal-create';
import ModalUpdateExport from './components/modal-update';
import moment from 'moment';

const access_token = getCookie('access_token') || '';

const fetchExport = (filter: {
  search_code?: string;
  page?: number;
  warehouse?: number;
  productionUnit?: number;
  exportAt?: { from?: Date; to?: Date };
}) => {
  const exportApi = new ExportApi(access_token);
  return exportApi.getExportList(filter);
};

const fetchWarehouseOptions = () => {
  const warehouseApi = new WarehouseApi(access_token);
  return warehouseApi.getAllWarehousesExceptDepartment();
};

const fetchProductionUnitOptions = () => {
  const warehouseApi = new ProductionUnitApi(access_token);
  return warehouseApi.getAllProductionUnits();
};

const ManageExports: React.FC = () => {
  //Filter params
  const [messageApi, context] = useMessage();
  const [currentUser, setCurrentUser] = useState<UserType>();
  const [typing, setTyping] = useState<NodeJS.Timeout | null>();
  const [searchCode, setSearchCode] = useState('');
  const [pagination, setPagination] = useState(1);
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [warehouse, setWarehouse] = useState(currentUser?.warehouse.id);
  const [productionUnit, setProductionUnit] = useState<number>();

  //Warehouse dropdown fetching
  const [warehouseOptions, setWarehouseOptions] = useState<SelectOptionDataType[]>([]);
  const { data: warehouseData } = useSWR('warehouse-dropdown', fetchWarehouseOptions);

  //Production unit dropdown fetching
  const [productionUnitOptions, setProductionUnitOptions] = useState<SelectOptionDataType[]>([]);
  const { data: productionUnitData } = useSWR('production-unit-dropdown', fetchProductionUnitOptions);

  //Table data fetching
  const [exportData, setExportData] = useState(new Array<ExportType>());
  const { data, isValidating } = useSWR('export-list', () =>
    fetchExport({
      search_code: searchCode,
      page: pagination,
      warehouse,
      productionUnit,
      exportAt: { from: fromDate, to: toDate },
    }),
  );

  useEffect(() => {
    const currentUserJson = getCookie('login-user')?.toString();
    if (currentUserJson) setCurrentUser(JSON.parse(currentUserJson));
  }, []);

  useEffect(() => {
    mutate('export-list');
  }, [pagination, searchCode, warehouse, productionUnit, fromDate, toDate]);

  useEffect(() => {
    if (warehouseData?.success && warehouseData.warehouses) {
      setWarehouseOptions(warehouseData.warehouses);
    }

    if (productionUnitData?.success && productionUnitData.productionUnits) {
      setProductionUnitOptions(productionUnitData.productionUnits);
    }
  }, [warehouseData, productionUnitData]);

  useEffect(() => {
    if (currentUser?.role.id !== 'nhanVienTongCuc') setWarehouse(currentUser?.warehouse.id);
  }, [currentUser]);

  useEffect(() => {
    if (data?.success && data.exportReceipts) {
      setExportData(data.exportReceipts.map((item, index) => ({ key: index, ...item })));
    }

    if (data?.success === false) messageApi.error(data?.message);
  }, [data]);

  //Table configuration
  const renderColumn: ColumnsType<ExportType> = [
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
          <ModalUpdateExport exportReceipt={record} />
        </>
      ),
    },
  ];

  const handlePagination = (pagination: TableProps<ExportType>['pagination']) => {
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

  const handleSelectProductionUnit = (value: number) => {
    setProductionUnit(value == 0 ? undefined : value);
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
          <Input placeholder="Tìm kiếm mã phiếu xuất" size="middle" onChange={handleSearch} />
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
          <SelectDropdown
            options={productionUnitOptions}
            optionName={'đơn vị sản xuất'}
            onSelect={handleSelectProductionUnit}
          />
        </Col>
        {currentUser?.role.id === 'nhanVienTongCuc' ? (
          <Col span={6}>
            <ModalCreateExport productionUnitOptions={productionUnitOptions} warehouseOptions={warehouseOptions} />
          </Col>
        ) : (
          <></>
        )}
      </Row>
      <Table
        columns={renderColumn}
        dataSource={exportData}
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

export default ManageExports;
