'use client';

import React, { useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { getCookie } from 'cookies-next';
import { Col, Input, Row, Space, Spin, Table } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import useMessage from 'antd/es/message/useMessage';

import ModalCreateUser from './components/modal-create';
import ModalUpdateUser from './components/modal-update';
import ModalDeleteUser from './components/modal-delete';
import SelectDropdown, { SelectOptionDataType } from '../components/SelectDropdown';
import NotFoundContent from '../components/NotFoundContent';
import UserApi, { UserType } from '@/libs/api/user-api';
import RoleApi from '@/libs/api/role-api';
import WarehouseApi from '@/libs/api/warehouse-api';

const access_token = getCookie('access_token') || '';

const fetchUser = (params?: { email_or_fullname?: string; page?: number; role?: string; warehouse?: number }) => {
  const userApi = new UserApi(access_token);
  return userApi.getUserList(params);
};

const fetchRoleOptions = () => {
  const roleApi = new RoleApi(access_token);
  return roleApi.getAllRoles();
};

const fetchWarehouseOptions = () => {
  const warehouseApi = new WarehouseApi(access_token);
  return warehouseApi.getAllWarehouses();
};

const ManageUser: React.FC = () => {
  const [messageApi, context] = useMessage();
  const [typing, setTyping] = useState<NodeJS.Timeout | null>();
  const [searchCriteria, setSearchCriteria] = useState('');
  const [role, setRole] = useState('');
  const [warehouse, setWarehouse] = useState<number>();
  const [pagination, setPagination] = useState(1);
  const [userData, setUserData] = useState(new Array<UserType>());
  const { data, isValidating } = useSWR('user-list', () =>
    fetchUser({ email_or_fullname: searchCriteria, page: pagination, role, warehouse }),
  );

  const [roleOptions, setRoleOptions] = useState<SelectOptionDataType[]>([]);
  const { data: roleData } = useSWR('role-dropdown', fetchRoleOptions);
  const [warehouseOptions, setWarehouseOptions] = useState<SelectOptionDataType[]>([]);
  const { data: warehouseData } = useSWR('warehouse-dropdown', fetchWarehouseOptions);

  const [currentUser, setCurrentUser] = useState<UserType>();
  useEffect(() => {
    const currentUserJson = getCookie('login-user')?.toString();
    if (currentUserJson) setCurrentUser(JSON.parse(currentUserJson));
  }, []);
  const currentUserRole = currentUser?.role.id;

  const renderColumns: ColumnsType<UserType> = [
    {
      title: 'Họ và tên',
      dataIndex: 'fullname',
    },
    {
      title: 'Email',
      dataIndex: 'email',
    },
    {
      title: 'Chức vụ',
      dataIndex: ['role', 'name'],
    },
    {
      title: 'Đơn vị công tác',
      dataIndex: ['warehouse', 'name'],
    },
  ];

  if (currentUserRole === 'nhanVienTongCuc') {
    renderColumns.push({
      title: 'Thao tác',
      render: (_, record) => (
        <Space size="middle">
          <a>
            <ModalUpdateUser
              user={{
                id: record.id,
                fullname: record.fullname,
                email: record.email,
                role: record.role.id,
                warehouse: record.warehouse.id,
              }}
              roleOptions={roleOptions}
              warehouseOptions={warehouseOptions}
            />
          </a>
          <a>
            <ModalDeleteUser user={{ id: record.id, fullname: record.fullname }} />
          </a>
        </Space>
      ),
    });
  }

  const handlePagination = (pagination: TableProps<UserType>['pagination']) => {
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
        setSearchCriteria(value);
        setPagination(1);
      }, 500),
    );
  };

  const handleSelectRole = (value: string) => {
    setRole(value);
    setPagination(1);
  };

  const handleSelectWarehouse = (value: number) => {
    setWarehouse(value == 0 ? undefined : value);
    setPagination(1);
  };

  useEffect(() => {
    if (roleData?.success && roleData.roles) {
      setRoleOptions(roleData.roles);
    }
    if (warehouseData?.success && warehouseData.warehouses) {
      setWarehouseOptions(warehouseData.warehouses);
    }
  });

  useEffect(() => {
    if (data?.success && data.users) {
      const fetchedData = data.users.map((item, index) => ({ key: index, ...item }));
      setUserData(fetchedData);
    }
    if (data?.success === false) {
      messageApi.error(data?.message);
    }
  }, [data]);

  useEffect(() => {
    mutate('user-list');
  }, [searchCriteria, pagination, role, warehouse]);

  return (
    <>
      {context}
      <Row gutter={16}>
        <Col span={7}>
          <Input placeholder="Tìm kiếm người dùng bằng email/ họ tên có dấu" size="middle" onChange={handleSearch} />
        </Col>
        <Col span={12}>
          <SelectDropdown options={roleOptions} optionName={'Chức vụ'} onSelect={handleSelectRole} />
          <span style={{ marginLeft: 16 }} />
          <SelectDropdown options={warehouseOptions} optionName={'Đơn vị công tác'} onSelect={handleSelectWarehouse} />
        </Col>
        {currentUserRole === 'nhanVienTongCuc' ? (
          <Col span={5}>
            <ModalCreateUser roleOptions={roleOptions} warehouseOptions={warehouseOptions} />
          </Col>
        ) : (
          <></>
        )}
      </Row>
      <Table
        columns={renderColumns}
        dataSource={userData}
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

export default ManageUser;
