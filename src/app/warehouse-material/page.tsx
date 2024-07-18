'use client';

import React, { useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { getCookie } from 'cookies-next';
import { Col, Row, Spin, Table } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';

import NotFoundContent from '../components/NotFoundContent';
import useMessage from 'antd/es/message/useMessage';
import SelectDropdown, { SelectOptionDataType } from '../components/SelectDropdown';
import WarehouseApi from '@/libs/api/warehouse-api';
import WarehouseMaterialApi, { ParamType, WarehouseMaterialType } from '@/libs/api/warehouse-material-api';

const access_token = getCookie('access_token') || '';

const fetchWarehouseMaterial = (filters?: ParamType) => {
  const materialWarehouseApi = new WarehouseMaterialApi(access_token);
  return materialWarehouseApi.getWarehouseMaterialList(filters);
};

const fetchWarehouseOptions = () => {
  const warehouseApi = new WarehouseApi(access_token);
  return warehouseApi.getAllWarehouses();
};

const ManageMaterialWarehouse: React.FC = () => {
  const [messageApi, context] = useMessage();
  const [pagination, setPagination] = useState(1);
  const [warehouse, setWarehouse] = useState<number>();
  const [warehouseMaterialData, setWarehouseMaterialData] = useState(new Array<WarehouseMaterialType>());
  const { data, isValidating } = useSWR('material-warehouse-list', () =>
    fetchWarehouseMaterial({ page: pagination, warehouse }),
  );

  const renderColumns: ColumnsType<WarehouseMaterialType> = [
    {
      title: 'Kho',
      dataIndex: ['warehouse', 'name'],
    },
    {
      title: 'Nguyên vật liệu',
      dataIndex: ['materialProvider', 'material', 'name'],
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: ['materialProvider', 'provider', 'name'],
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
    },
    {
      title: 'Đơn vị tính',
      dataIndex: ['materialProvider', 'unit'],
    },
  ];

  //Warehouse dropdown fetching
  const [warehouseOptions, setWarehouseOptions] = useState<SelectOptionDataType[]>([]);
  const { data: warehouseData } = useSWR('warehouse-dropdown', fetchWarehouseOptions);

  const handlePagination = (pagination: TableProps<WarehouseMaterialType>['pagination']) => {
    setPagination((pagination && pagination.current) || 1);
  };

  const handleSelectWarehouse = (value: number) => {
    setWarehouse(value == 0 ? undefined : value);
    setPagination(1);
  };

  useEffect(() => {
    if (warehouseData?.success && warehouseData.warehouses) {
      setWarehouseOptions(warehouseData.warehouses);
    }
  }, [warehouseData]);

  useEffect(() => {
    if (data?.success && data.warehouseMaterial) {
      const fetchedData = data.warehouseMaterial.map((item, index) => ({ key: index, ...item }));
      setWarehouseMaterialData(fetchedData);
    }
    if (data?.success === false) {
      messageApi.error(data?.message);
    }
  }, [data]);

  useEffect(() => {
    mutate('material-warehouse-list');
  }, [pagination, warehouse]);

  return (
    <>
      {context}
      <Row gutter={16}>
        <Col span={12} style={{ width: '100%' }}>
          <SelectDropdown options={warehouseOptions} optionName={'nhà cung cấp'} onSelect={handleSelectWarehouse} />
        </Col>
      </Row>
      <Table
        columns={renderColumns}
        dataSource={warehouseMaterialData}
        pagination={{
          current: pagination,
          pageSize: 10,
          total: data?.total || 0,
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

export default ManageMaterialWarehouse;
