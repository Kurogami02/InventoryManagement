'use client';

import React, { useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { getCookie } from 'cookies-next';
import { AutoComplete, Col, Row, Spin, Table } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';

import NotFoundContent from '../components/NotFoundContent';
import useMessage from 'antd/es/message/useMessage';
import MaterialProviderApi, { MaterialProviderType } from '@/libs/api/material-provider-api';
import SelectDropdown, { SelectOptionDataType } from '../components/SelectDropdown';
import ProviderApi from '@/libs/api/provider-api';
import { UserType } from '@/libs/api/user-api';
import MaterialApi from '@/libs/api/material-api';
import ModalCreateMaterialProvider from './components/modal-create';

const access_token = getCookie('access_token') || '';

const fetchMaterialProvider = (filters?: { page?: number; provider?: number; material?: string }) => {
  const materialProviderApi = new MaterialProviderApi(access_token);
  return materialProviderApi.getMaterialProviderList(filters);
};

const fetchProviderOptions = () => {
  const providerApi = new ProviderApi(access_token);
  return providerApi.getAllProviders();
};

const fetchMaterialOptions = (materialCode?: string) => {
  const materialApi = new MaterialApi(access_token);
  return materialApi.getAllMaterials(materialCode);
};

const ManageMaterialProvider: React.FC = () => {
  const [messageApi, context] = useMessage();
  const [typing, setTyping] = useState<NodeJS.Timeout | null>();
  const [pagination, setPagination] = useState(1);
  const [material, setMaterial] = useState<string>();
  const [provider, setProvider] = useState<number>();
  const [materialProviderData, setMaterialProviderData] = useState(new Array<MaterialProviderType>());
  const { data, isValidating } = useSWR('material-provider-list', () =>
    fetchMaterialProvider({ page: pagination, provider, material }),
  );

  const [currentUser, setCurrentUser] = useState<UserType>();
  useEffect(() => {
    const currentUserJson = getCookie('login-user')?.toString();
    if (currentUserJson) setCurrentUser(JSON.parse(currentUserJson));
  }, []);

  const renderColumns: ColumnsType<MaterialProviderType> = [
    {
      title: 'Mã nguyên vật liệu',
      dataIndex: ['material', 'code'],
    },
    {
      title: 'Nguyên vật liệu',
      dataIndex: ['material', 'name'],
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: ['provider', 'name'],
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
    },
    {
      title: 'Đơn vị tính',
      dataIndex: 'unit',
    },
  ];

  //Provider dropdown fetching
  const [providerOptions, setProviderOptions] = useState<SelectOptionDataType[]>([]);
  const { data: providerData } = useSWR('provider-dropdown', fetchProviderOptions);

  //Material autocomplete live search
  const [materialOptions, setMaterialOptions] = useState<SelectOptionDataType[]>([]);

  const handlePagination = (pagination: TableProps<MaterialProviderType>['pagination']) => {
    setPagination((pagination && pagination.current) || 1);
  };

  const handleSearch = (value: string) => {
    if (typing) {
      clearTimeout(typing);
    }

    // After 500ms, perform the search in autocomplete list
    setTyping(
      setTimeout(async () => {
        setMaterialOptions((await fetchMaterialOptions(value)).materials);
      }, 500),
    );
  };

  const handleSelectProvider = (value: number) => {
    setProvider(value == 0 ? undefined : value);
    setPagination(1);
  };

  useEffect(() => {
    if (providerData?.success && providerData.providers) {
      setProviderOptions(providerData.providers);
    }
  }, [providerData]);

  useEffect(() => {
    const fetchData = async () => {
      const { materials } = await fetchMaterialOptions(material);
      setMaterialOptions(materials);
    };

    fetchData();
  }, [material]);

  useEffect(() => {
    if (data?.success && data.materialProviders) {
      const fetchedData = data.materialProviders.map((item, index) => ({ key: index, ...item }));
      setMaterialProviderData(fetchedData);
    }
    if (data?.success === false) {
      messageApi.error(data?.message);
    }
  }, [data]);

  useEffect(() => {
    mutate('material-provider-list');
  }, [pagination, provider, material]);

  return (
    <>
      {context}
      <Row gutter={16}>
        <Col span={5}>
          <AutoComplete
            style={{ width: '100%' }}
            placeholder="Tìm kiếm mã NVL"
            options={materialOptions}
            size="middle"
            onChange={handleSearch}
            onSelect={(value: string) => {
              setMaterial(value);
            }}
            onClear={() => setMaterial(undefined)}
            allowClear
            notFoundContent={<NotFoundContent />}
          />
        </Col>
        <Col span={7} style={{ width: '100%' }}>
          <SelectDropdown options={providerOptions} optionName={'nhà cung cấp'} onSelect={handleSelectProvider} />
        </Col>
        {currentUser?.role.id === 'nhanVienTongCuc' ? (
          <Col span={12}>
            <ModalCreateMaterialProvider materialOptions={materialOptions} providerOptions={providerOptions} />
          </Col>
        ) : (
          <></>
        )}
      </Row>
      <Table
        columns={renderColumns}
        dataSource={materialProviderData}
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

export default ManageMaterialProvider;
