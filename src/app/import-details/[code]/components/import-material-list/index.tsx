import React, { useEffect, useState } from 'react';
import { Divider, Spin, Table } from 'antd';
import ImportDetailApi, { ImportDetailType } from '@/libs/api/import-detail-api';
import { ColumnsType } from 'antd/es/table';
import useSWR from 'swr';
import { getCookie } from 'cookies-next';
import NotFoundContent from '@/app/components/NotFoundContent';
import MaterialProviderApi from '@/libs/api/material-provider-api';
import ImportApi, { ImportType } from '@/libs/api/import-api';
import { UserType } from '@/libs/api/user-api';
import { SelectOptionDataType } from '@/app/components/SelectDropdown';
import DeleteRow from './modal-delete-row';
import AddRow from './modal-add-row';
import EditRow from './modal-update-row';

const access_token = getCookie('access_token') || '';

const fetchImportDetails = (importCode: string) => {
  const importDetailApi = new ImportDetailApi(access_token);
  return importDetailApi.getImportDetails(importCode);
};

const fetchMaterialProvider = async (importCode: string) => {
  const provider = (await fetchImportReceipt(importCode)).importReceipt.provider;
  const materialProviderApi = new MaterialProviderApi(access_token);
  return (await materialProviderApi.getMaterialProviderList({ provider: provider.id })).materialProviders;
};

const fetchImportReceipt = async (importCode: string) => {
  const importApi = new ImportApi(access_token);
  return await importApi.getImport(importCode);
};

const ImportDetailsMaterialList: React.FC<{ code: string }> = ({ code }) => {
  const [dataSource, setDataSource] = useState<ImportDetailType[]>([]);
  const [materialProviderList, setMaterialProviderList] = useState<SelectOptionDataType[]>([]);
  const [importStatus, setImportStatus] = useState('');

  const { data: importData } = useSWR('import-info', () => fetchImportReceipt(code));
  const { data: importDetailsData, isValidating } = useSWR('import-details-list', () => fetchImportDetails(code));
  const { data: materialProviderData } = useSWR('material-provider-details', () => fetchMaterialProvider(code));

  //Re-render Add Row button when status changes
  useEffect(() => {
    if (importData) {
      setImportStatus(importData.importReceipt.status);
    }
  }, [importData]);

  //Role - permission handler
  const [currentUser, setCurrentUser] = useState<UserType>();

  useEffect(() => {
    const currentUserJson = getCookie('login-user')?.toString();
    if (currentUserJson) setCurrentUser(JSON.parse(currentUserJson));
  }, []);

  const currentUserRole = currentUser?.role.id || '';

  //Render material provider data
  useEffect(() => {
    if (materialProviderData) {
      const list: SelectOptionDataType[] = materialProviderData.map((item) => ({
        value: item.id.toString(),
        label: item.material.code,
      }));
      setMaterialProviderList(list);
    }
  }, [materialProviderData]);

  //Render data to table
  useEffect(() => {
    if (importDetailsData) {
      setDataSource(importDetailsData.importDetails);
    }
  }, [importDetailsData]);

  const columns: ColumnsType<ImportDetailType> = [
    {
      title: 'Mã nguyên vật liệu',
      dataIndex: ['materialProvider', 'material', 'code'],
      align: 'center',
    },
    {
      title: 'Tên nguyên vật liệu',
      dataIndex: ['materialProvider', 'material', 'name'],
      align: 'center',
    },
    {
      title: 'Đơn vị',
      dataIndex: ['materialProvider', 'unit'],
      align: 'center',
    },
    {
      title: 'Số lượng mong muốn',
      dataIndex: 'expectQuantity',
      align: 'center',
    },
    {
      title: 'Số lượng thực tế',
      dataIndex: 'actualQuantity',
      align: 'center',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'qaNote',
      align: 'center',
    },
    {
      title: 'Thao tác',
      align: 'center',
      render: (_, record: ImportDetailType) => (
        <>
          <EditRow
            record={record}
            importReceipt={importData?.importReceipt as ImportType}
            materialProviderOptions={materialProviderList}
            currentUserRole={currentUserRole}
          />
          {currentUserRole === 'nhanVienTongCuc' && importStatus === 'draft' ? (
            <DeleteRow importDetailId={record.key} />
          ) : null}
        </>
      ),
    },
  ];

  return (
    <div>
      <Divider orientation="left" orientationMargin="0">
        Nguyên vật liệu trong phiếu nhập
      </Divider>
      {currentUserRole === 'nhanVienTongCuc' && importStatus === 'draft' ? (
        <AddRow
          importReceipt={importData?.importReceipt as ImportType}
          materialProviderOptions={materialProviderList}
        />
      ) : (
        <></>
      )}
      <Table
        bordered
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        style={{ marginTop: 16 }}
        locale={{
          emptyText: isValidating ? <Spin size="large" /> : <NotFoundContent />,
        }}
      />
    </div>
  );
};

export default ImportDetailsMaterialList;
