'use client';

import React, { useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { getCookie } from 'cookies-next';
import { Col, Input, Row, Space, Spin, Table } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';

import NotFoundContent from '../components/NotFoundContent';
import useMessage from 'antd/es/message/useMessage';
import ProductionUnitApi, { ProductionUnitType } from '@/libs/api/production-unit-api';
import ModalCreateProductionUnit from './components/modal-create';
import ModalUpdateProductionUnit from './components/modal-update';
import ModalDeleteProductionUnit from './components/modal-delete';
import { UserType } from '@/libs/api/user-api';

const fetchProductionUnit = (filters?: { search_name?: string; page?: number }) => {
  const access_token = getCookie('access_token') || '';
  const production_unitApi = new ProductionUnitApi(access_token);
  return production_unitApi.getProductionUnitList(filters);
};

const ManageProductionUnit: React.FC = () => {
  const [messageApi, context] = useMessage();
  const [typing, setTyping] = useState<NodeJS.Timeout | null>();
  const [searchName, setSearchName] = useState('');
  const [pagination, setPagination] = useState(1);
  const [production_unitData, setProductionUnitData] = useState(new Array<ProductionUnitType>());
  const { data, isValidating } = useSWR('production-unit-list', () =>
    fetchProductionUnit({ search_name: searchName, page: pagination }),
  );

  const [currentUser, setCurrentUser] = useState<UserType>();
  useEffect(() => {
    const currentUserJson = getCookie('login-user')?.toString();
    if (currentUserJson) setCurrentUser(JSON.parse(currentUserJson));
  }, []);

  const renderColumns: ColumnsType<ProductionUnitType> = [
    {
      title: 'Tên đơn vị sản xuất',
      dataIndex: 'name',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
    },
  ];

  if (currentUser?.role.id === 'nhanVienTongCuc') {
    renderColumns.push({
      title: 'Thao tác',
      render: (_, record) => (
        <Space size="middle">
          <a>
            <ModalUpdateProductionUnit production_unit={record} />
          </a>
          <a>
            <ModalDeleteProductionUnit production_unit={record} />
          </a>
        </Space>
      ),
    });
  }

  const handlePagination = (pagination: TableProps<ProductionUnitType>['pagination']) => {
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
    if (data?.success && data.production_units) {
      const fetchedData = data.production_units.map((item, index) => ({ key: index, ...item }));
      setProductionUnitData(fetchedData);
    }
    if (data?.success === false) {
      messageApi.error(data?.message);
    }
  }, [data]);

  useEffect(() => {
    mutate('production-unit-list');
  }, [searchName, pagination]);

  return (
    <>
      {context}
      <Row gutter={16}>
        <Col span={7}>
          <Input placeholder="Tìm kiếm đơn vị sản xuất" size="middle" onChange={handleSearch} />
        </Col>
        {currentUser?.role.id === 'nhanVienTongCuc' ? (
          <Col span={17}>
            <ModalCreateProductionUnit />
          </Col>
        ) : (
          <></>
        )}
      </Row>
      <Table
        columns={renderColumns}
        dataSource={production_unitData}
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

export default ManageProductionUnit;
