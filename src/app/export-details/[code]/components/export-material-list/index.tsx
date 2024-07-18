import { SelectOptionDataType } from '@/app/components/SelectDropdown';
import ExportApi, { ExportType } from '@/libs/api/export-api';
import ExportDetailApi, { ExportDetailType } from '@/libs/api/export-detail-api';
import WarehouseMaterialApi from '@/libs/api/warehouse-material-api';
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

const fetchExportDetails = (exportCode: string) => {
  const exportDetailApi = new ExportDetailApi(access_token);
  return exportDetailApi.getExportDetails(exportCode);
};

const fetchWarehouseMaterial = async () => {
  const warehouseMaterialApi = new WarehouseMaterialApi(access_token);
  return (await warehouseMaterialApi.getWarehouseMaterialList()).warehouseMaterial;
};

const fetchExportReceipt = async (exportCode: string) => {
  const exportApi = new ExportApi(access_token);
  return await exportApi.getExport(exportCode);
};

const ExportDetailsMaterialList: React.FC<{ code: string }> = ({ code }) => {
  const [dataSource, setDataSource] = useState<ExportDetailType[]>([]);
  const [exportStatus, setExportStatus] = useState('');
  const [warehouseMateriaList, setWarehouseMaterialList] = useState<SelectOptionDataType[]>([]);

  const { data: exportData } = useSWR('export-info', () => fetchExportReceipt(code));
  const { data: exportDetailsData, isValidating } = useSWR('export-details-list', () => fetchExportDetails(code));
  const { data: warehouseMaterialData } = useSWR('warehouse-material-details', fetchWarehouseMaterial);

  //Re-render Add Row button when status changes
  useEffect(() => {
    if (exportData) {
      setExportStatus(exportData.exportReceipt.status);
    }
  }, [exportData]);

  //Role - permission handler
  const [currentUser, setCurrentUser] = useState<UserType>();

  useEffect(() => {
    const currentUserJson = getCookie('login-user')?.toString();
    if (currentUserJson) setCurrentUser(JSON.parse(currentUserJson));
  }, []);

  const currentUserRole = currentUser?.role.id || '';

  //Render material provider data
  useEffect(() => {
    if (warehouseMaterialData) {
      const list: SelectOptionDataType[] =
        warehouseMaterialData
          ?.filter((item) => item.warehouse.id === exportData?.exportReceipt.warehouse.id)
          .map((item) => ({
            value: item.id.toString(),
            label: `${item.materialProvider.material.code} - ${item.materialProvider.provider.name}`,
          })) || [];
      setWarehouseMaterialList(list);
    }
  }, [warehouseMaterialData, exportData]);

  //Render data to table
  useEffect(() => {
    if (exportDetailsData) {
      setDataSource(exportDetailsData.exportDetails);
    }
  }, [exportDetailsData]);

  const editable =
    currentUserRole === 'nhanVienTongCuc' &&
    (exportData?.exportReceipt.status === 'draft' || exportData?.exportReceipt.status === 'warehouse_confirm');

  const columns: ColumnsType<ExportDetailType> = [
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
      title: 'Số lượng mong muốn',
      dataIndex: 'expectQuantity',
      align: 'center',
    },
    {
      title: 'Số lượng hoàn trả',
      dataIndex: 'returnQuantity',
      align: 'center',
    },
    {
      title: 'Thao tác',
      align: 'center',
      render: (_, record: ExportDetailType) => (
        <>
          {editable ? <EditRow record={record} warehouseMaterialOptions={warehouseMateriaList} /> : null}
          {currentUserRole === 'nhanVienTongCuc' && exportStatus === 'draft' ? (
            <DeleteRow exportDetailId={record.id} />
          ) : null}
        </>
      ),
    },
  ];

  return (
    <div>
      <Divider orientation="left" orientationMargin="0">
        Nguyên vật liệu trong phiếu xuất
      </Divider>
      {currentUserRole === 'nhanVienTongCuc' && exportStatus === 'draft' ? (
        <AddRow
          exportReceipt={exportData?.exportReceipt as ExportType}
          warehouseMaterialOptions={warehouseMateriaList}
        />
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

export default ExportDetailsMaterialList;
