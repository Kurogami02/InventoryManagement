'use client';

import React, { useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { getCookie } from 'cookies-next';
import { Col, Input, Row, Space, Spin, Table } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';

import NotFoundContent from '../components/NotFoundContent';
import useMessage from 'antd/es/message/useMessage';
import MaterialApi, { MaterialType } from '@/libs/api/material-api';
import ModalCreateMaterial from './components/modal-create';
import ModalUpdateMaterial from './components/modal-update';
import ModalDeleteMaterial from './components/modal-delete';
import { UserType } from '@/libs/api/user-api';

const currentUser = getCookie('login-user')?.toString() || '{"role":{"id":"null"}}';
const currentUserRole = JSON.parse(currentUser).role.id;

const fetchMaterial = (filters?: { codeOrName?: string; page?: number }) => {
  const access_token = getCookie('access_token') || '';
  const materialApi = new MaterialApi(access_token);
  return materialApi.getMaterialList(filters);
};

const ManageMaterial: React.FC = () => {
  const [messageApi, context] = useMessage();
  const [typing, setTyping] = useState<NodeJS.Timeout | null>();
  const [codeOrName, setCodeOrName] = useState('');
  const [pagination, setPagination] = useState(1);
  const [materialData, setMaterialData] = useState(new Array<MaterialType>());
  const { data, isValidating } = useSWR('material-list', () =>
    fetchMaterial({ codeOrName: codeOrName, page: pagination }),
  );

  const [currentUser, setCurrentUser] = useState<UserType>();
  useEffect(() => {
    const currentUserJson = getCookie('login-user')?.toString();
    if (currentUserJson) setCurrentUser(JSON.parse(currentUserJson));
  }, []);

  const renderColumns: ColumnsType<MaterialType> = [
    {
      title: 'Mã nguyên vật liệu',
      dataIndex: 'code',
    },
    {
      title: 'Tên nguyên vật liệu',
      dataIndex: 'name',
    },
  ];

  if (currentUser?.role.id === 'nhanVienTongCuc') {
    renderColumns.push({
      title: 'Thao tác',
      render: (_, record) => (
        <Space size="middle">
          <a>
            <ModalUpdateMaterial material={record} />
          </a>
          <a>
            <ModalDeleteMaterial material={record} />
          </a>
        </Space>
      ),
    });
  }

  const handlePagination = (pagination: TableProps<MaterialType>['pagination']) => {
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
        setCodeOrName(value);
        setPagination(1);
      }, 500),
    );
  };

  useEffect(() => {
    if (data?.success && data.materials) {
      const fetchedData = data.materials.map((item, index) => ({ key: index, ...item }));
      setMaterialData(fetchedData);
    }
    if (data?.success === false) {
      messageApi.error(data?.message);
    }
  }, [data]);

  useEffect(() => {
    mutate('material-list');
  }, [codeOrName, pagination]);

  return (
    <>
      {context}
      <Row gutter={16}>
        <Col span={7}>
          <Input placeholder="Tìm kiếm nguyên vật liệu" size="middle" onChange={handleSearch} />
        </Col>
        {currentUserRole === 'nhanVienTongCuc' ? (
          <Col span={17}>
            <ModalCreateMaterial />
          </Col>
        ) : (
          <></>
        )}
      </Row>
      <Table
        columns={renderColumns}
        dataSource={materialData}
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

export default ManageMaterial;
