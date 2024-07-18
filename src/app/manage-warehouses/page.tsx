'use client';

import React, { useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { getCookie } from 'cookies-next';
import { Col, Input, Row, Space, Spin, Table } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';

import NotFoundContent from '../components/NotFoundContent';
import useMessage from 'antd/es/message/useMessage';
import WarehouseApi, { WarehouseType } from '@/libs/api/warehouse-api';
import ModalCreateWarehouse from './components/modal-create';
import ModalUpdateWarehouse from './components/modal-update';
import ModalDeleteWarehouse from './components/modal-delete';
import { UserType } from '@/libs/api/user-api';

const fetchWarehouse = (filters?: { name?: string; page?: number }) => {
  const access_token = getCookie('access_token') || '';
  const warehouseApi = new WarehouseApi(access_token);
  return warehouseApi.getWarehouseList(filters);
};

const ManageWarehouse: React.FC = () => {
  const [messageApi, context] = useMessage();
  const [typing, setTyping] = useState<NodeJS.Timeout | null>();
  const [searchName, setSearchName] = useState('');
  const [pagination, setPagination] = useState(1);
  const [warehouseData, setWarehouseData] = useState(new Array<WarehouseType>());
  const { data, isValidating } = useSWR('warehouse-list', () => fetchWarehouse({ name: searchName, page: pagination }));

  const [currentUser, setCurrentUser] = useState<UserType>();
  useEffect(() => {
    const currentUserJson = getCookie('login-user')?.toString();
    if (currentUserJson) setCurrentUser(JSON.parse(currentUserJson));
  }, []);
  const currentUserRole = currentUser?.role.id;

  const renderColumns: ColumnsType<WarehouseType> = [
    {
      title: 'Tên kho nguyên vật liệu',
      dataIndex: 'name',
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
    },
  ];

  if (currentUserRole === 'nhanVienTongCuc') {
    renderColumns.push({
      title: 'Thao tác',
      render: (_, record) => (
        <Space size="middle">
          <a>
            <ModalUpdateWarehouse warehouse={record} />
          </a>
          <a>
            <ModalDeleteWarehouse warehouse={record} />
          </a>
        </Space>
      ),
    });
  }

  const handlePagination = (pagination: TableProps<WarehouseType>['pagination']) => {
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
        setSearchName(value);
        setPagination(1);
      }, 500),
    );
  };

  useEffect(() => {
    if (data?.success && data.warehouses) {
      const fetchedData = data.warehouses.map((item, index) => ({ key: index, ...item }));
      setWarehouseData(fetchedData);
    }
    if (data?.success === false) {
      messageApi.error(data?.message);
    }
  }, [data]);

  useEffect(() => {
    mutate('warehouse-list');
  }, [searchName, pagination]);

  return (
    <>
      {context}
      <Row gutter={16}>
        <Col span={7}>
          <Input placeholder="Tìm kiếm kho nguyên vật liệu" size="middle" onChange={handleSearch} />
        </Col>
        {currentUserRole === 'nhanVienTongCuc' ? (
          <Col span={17}>
            <ModalCreateWarehouse />
          </Col>
        ) : (
          <></>
        )}
      </Row>
      <Table
        columns={renderColumns}
        dataSource={warehouseData}
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

export default ManageWarehouse;
