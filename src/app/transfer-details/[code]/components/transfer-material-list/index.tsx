import { SelectOptionDataType } from '@/app/components/SelectDropdown';
import WarehouseMateriaApi from '@/libs/api/warehouse-material-api';
import TransferApi, { TransferType } from '@/libs/api/transfer-api';
import TransferDetailApi, { TransferDetailType } from '@/libs/api/transfer-detail-api';
import { UserType } from '@/libs/api/user-api';
import Table, { ColumnsType } from 'antd/es/table';
import { getCookie } from 'cookies-next';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import EditRow from './modal-update-row';
import DeleteRow from './modal-delete-row';
import { Divider, Spin } from 'antd';
import AddRow from './modal-add-row';
import NotFoundContent from '@/app/components/NotFoundContent';

const access_token = getCookie('access_token') || '';

const fetchWarehouseMateria = async () => {
  const warehouseMateriaApi = new WarehouseMateriaApi(access_token);
  return (await warehouseMateriaApi.getWarehouseMaterialList()).warehouseMaterial;
};

const fetchTransferDetails = (transferId: string) => {
  const transferDetailApi = new TransferDetailApi(access_token);
  return transferDetailApi.getTransferDetails(transferId);
};

const fetchTransfer = async (transferId: string) => {
  const transferApi = new TransferApi(access_token);
  return (await transferApi.getTransfer(transferId)).transfer;
};

const TransferDetailsMaterialList: React.FC<{ code: string }> = ({ code }) => {
  const [dataSource, setDataSource] = useState<TransferDetailType[]>([]);
  const [transferStatus, setTransferStatus] = useState('');
  const [warehouseMateriaList, setWarehouseMateriaList] = useState<SelectOptionDataType[]>([]);

  const { data: transferData } = useSWR('transfer', () => fetchTransfer(code));
  const { data: warehouseMateriaData } = useSWR('warehouse-materials-details', fetchWarehouseMateria);
  const { data: transferDetailsData, isValidating } = useSWR('transfer-details-list', () => fetchTransferDetails(code));

  //Re-render component when status changes
  useEffect(() => {
    if (transferData) {
      setTransferStatus(transferData.status);
    }
  }, [transferData]);

  //Role - permission handler
  const [currentUser, setCurrentUser] = useState<UserType>();
  useEffect(() => {
    const currentUserJson = getCookie('login-user')?.toString();
    if (currentUserJson) setCurrentUser(JSON.parse(currentUserJson));
  }, []);

  const currentUserRole = currentUser?.role.id || '';

  //Render material provider data
  useEffect(() => {
    if (warehouseMateriaData) {
      const list: SelectOptionDataType[] = warehouseMateriaData
        .filter((item) => item.warehouse.id === transferData?.warehouseExport.id)
        .map((item) => ({
          value: item.id.toString(),
          label: `${item.materialProvider.material.code} - ${item.materialProvider.provider.name}`,
        }));
      setWarehouseMateriaList(list);
    }
  }, [warehouseMateriaData, transferData]);

  //Render data to table
  useEffect(() => {
    if (transferDetailsData) {
      setDataSource(transferDetailsData.transferDetails);
    }
  }, [transferDetailsData]);

  const columns: ColumnsType<TransferDetailType> = [
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
      title: 'Nhà cung cấp',
      dataIndex: ['materialProvider', 'provider', 'name'],
      align: 'center',
    },
    {
      title: 'Đơn vị',
      dataIndex: ['materialProvider', 'unit'],
      align: 'center',
    },
    {
      title: 'Số lượng điều chuyển',
      dataIndex: 'exportQuantity',
      align: 'center',
    },
    {
      title: 'Thao tác',
      align: 'center',
      render: (_, record: TransferDetailType) => (
        <>
          {currentUserRole === 'nhanVienTongCuc' && transferStatus === 'draft' ? (
            <>
              <EditRow record={record} warehouseMaterialOptions={warehouseMateriaList} />
              <DeleteRow transfer={record.id} />
            </>
          ) : null}
        </>
      ),
    },
  ];

  return (
    <div>
      <Divider orientation="left" orientationMargin="0">
        Nguyên vật liệu trong phiếu điều chuyển
      </Divider>
      {currentUserRole === 'nhanVienTongCuc' && transferData?.status === 'draft' ? (
        <AddRow transfer={transferData} warehouseMaterialOptions={warehouseMateriaList} />
      ) : (
        <></>
      )}
      <Table
        bordered
        dataSource={dataSource.map((items, index) => ({ ...items, key: index }))}
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

export default TransferDetailsMaterialList;
