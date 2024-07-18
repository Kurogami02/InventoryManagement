'use client';

import React, { useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { getCookie } from 'cookies-next';
import { Col, Input, Row, Space, Spin, Table } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';

import NotFoundContent from '../components/NotFoundContent';
import useMessage from 'antd/es/message/useMessage';
import ProviderApi, { ProviderType } from '@/libs/api/provider-api';
import ModalCreateProvider from './components/modal-create';
import ModalUpdateProvider from './components/modal-update';
import ModalDeleteProvider from './components/modal-delete';
import { UserType } from '@/libs/api/user-api';

const fetchProvider = (filters?: { search_name?: string; page?: number }) => {
  const access_token = getCookie('access_token') || '';
  const providerApi = new ProviderApi(access_token);
  return providerApi.getProviderList(filters);
};

const ManageProvider: React.FC = () => {
  const [messageApi, context] = useMessage();
  const [typing, setTyping] = useState<NodeJS.Timeout | null>();
  const [searchName, setSearchName] = useState('');
  const [pagination, setPagination] = useState(1);
  const [providerData, setProviderData] = useState(new Array<ProviderType>());
  const { data, isValidating } = useSWR('provider-list', () =>
    fetchProvider({ search_name: searchName, page: pagination }),
  );

  const [currentUser, setCurrentUser] = useState<UserType>();
  useEffect(() => {
    const currentUserJson = getCookie('login-user')?.toString();
    if (currentUserJson) setCurrentUser(JSON.parse(currentUserJson));
  }, []);
  const currentUserRole = currentUser?.role.id;

  const renderColumns: ColumnsType<ProviderType> = [
    {
      title: 'Tên nhà cung cấp',
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

  if (currentUserRole === 'nhanVienTongCuc') {
    renderColumns.push({
      title: 'Thao tác',
      render: (_, record) => (
        <Space size="middle">
          <a>
            <ModalUpdateProvider provider={record} />
          </a>
          <a>
            <ModalDeleteProvider provider={record} />
          </a>
        </Space>
      ),
    });
  }

  const handlePagination = (pagination: TableProps<ProviderType>['pagination']) => {
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
    if (data?.success && data.providers) {
      const fetchedData = data.providers.map((item, index) => ({ key: index, ...item }));
      setProviderData(fetchedData);
    }
    if (data?.success === false) {
      messageApi.error(data?.message);
    }
  }, [data]);

  useEffect(() => {
    mutate('provider-list');
  }, [searchName, pagination]);

  return (
    <>
      {context}
      <Row gutter={16}>
        <Col span={7}>
          <Input placeholder="Tìm kiếm nhà cung cấp" size="middle" onChange={handleSearch} />
        </Col>
        {currentUserRole === 'nhanVienTongCuc' ? (
          <Col span={17}>
            <ModalCreateProvider />
          </Col>
        ) : (
          <></>
        )}
      </Row>
      <Table
        columns={renderColumns}
        dataSource={providerData}
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

export default ManageProvider;
