import { SelectOptionDataType } from '@/app/components/SelectDropdown';
import InventoryReportApi, { InventoryReportType } from '@/libs/api/inventory-report-api';
import InventoryReportDetailApi, { InventoryReportDetailType } from '@/libs/api/inventory-report-detail-api';
import WarehouseMaterialApi from '@/libs/api/warehouse-material-api';
import { UserType } from '@/libs/api/user-api';
import Table, { ColumnsType } from 'antd/es/table';
import { getCookie } from 'cookies-next';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import EditRow from './modal-update';
import DeleteRow from './modal-delete';
import { Divider, Spin } from 'antd';
import AddRow from './modal-create';
import NotFoundContent from '@/app/components/NotFoundContent';

const access_token = getCookie('access_token') || '';

const fetchWarehouseMaterial = async () => {
  const warehouseMaterialApi = new WarehouseMaterialApi(access_token);
  return (await warehouseMaterialApi.getWarehouseMaterialList()).warehouseMaterial;
};

const fetchInventoryReportDetails = async (inventoryReportId: string) => {
  const inventoryReportDetailApi = new InventoryReportDetailApi(access_token);
  return inventoryReportDetailApi.getInventoryReportDetails(inventoryReportId);
};

const fetchInventoryReport = async (inventoryReportCode: string) => {
  const inventoryReportApi = new InventoryReportApi(access_token);
  return await inventoryReportApi.getInventoryReport(inventoryReportCode);
};

const InventoryReportDetailMaterialList: React.FC<{ code: string }> = ({ code }) => {
  const [dataSource, setDataSource] = useState<InventoryReportDetailType[]>([]);
  const [warehouseMaterialList, setWarehouseMaterialList] = useState<SelectOptionDataType[]>([]);
  const [inventoryReportStatus, setInventoryReportStatus] = useState('');

  //Role - permission handler
  const [currentUser, setCurrentUser] = useState<UserType>();

  useEffect(() => {
    const currentUserJson = getCookie('login-user')?.toString();
    if (currentUserJson) setCurrentUser(JSON.parse(currentUserJson));
  }, []);

  const { data: inventoryReportData } = useSWR('inventory-report-info', () => fetchInventoryReport(code));
  const { data: warehouseMaterialData } = useSWR('warehouse-material-details', fetchWarehouseMaterial);
  const { data: inventoryReportDetailsData, isValidating } = useSWR('inventory-report-details-list', () =>
    fetchInventoryReportDetails(code),
  );

  //Re-render component button when status changes
  useEffect(() => {
    if (inventoryReportData) {
      setInventoryReportStatus(inventoryReportData.inventoryReport.status);
    }
  }, [inventoryReportData]);

  //Render material provider data
  useEffect(() => {
    if (warehouseMaterialData) {
      const list: SelectOptionDataType[] = warehouseMaterialData
        .filter((item) => item.warehouse.id === inventoryReportData?.inventoryReport.warehouse.id)
        .map((item) => ({
          value: item.id.toString(),
          label: `${item.materialProvider.material.code} - ${item.materialProvider.provider.name}`,
        }));
      setWarehouseMaterialList(list);
    }
  }, [warehouseMaterialData, inventoryReportData]);

  //Render data to table
  useEffect(() => {
    if (inventoryReportDetailsData) {
      setDataSource(inventoryReportDetailsData.inventoryDetails);
    }
  }, [inventoryReportDetailsData]);

  const editable =
    ['nhanVienTongCuc', 'nhanVienKho'].includes(currentUser?.role.id || '') && inventoryReportStatus === 'draft';

  const columns: ColumnsType<InventoryReportDetailType> = [
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
      title: 'Số lượng hiện tại',
      dataIndex: 'originQuantity',
      align: 'center',
    },
    {
      title: 'Số lượng thực tế',
      dataIndex: 'actualQuantity',
      align: 'center',
    },
    {
      title: 'Thao tác',
      align: 'center',
      render: (_, record: InventoryReportDetailType) => (
        <>
          {currentUser?.role.id === 'nhanVienKho' && inventoryReportData?.inventoryReport.status === 'open' ? (
            <>
              <EditRow record={record} warehouseMaterialOptions={warehouseMaterialList} />
            </>
          ) : null}
          {editable ? (
            <>
              <DeleteRow inventoryReportDetailId={record.id} />
            </>
          ) : null}
        </>
      ),
    },
  ];

  return (
    <>
      <Divider orientation="left" orientationMargin="0">
        Danh sách kiểm kê
      </Divider>
      {editable ? (
        <AddRow
          inventoryReport={inventoryReportData?.inventoryReport as InventoryReportType}
          warehouseMaterialOptions={warehouseMaterialList}
        />
      ) : null}
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
    </>
  );
};

export default InventoryReportDetailMaterialList;
