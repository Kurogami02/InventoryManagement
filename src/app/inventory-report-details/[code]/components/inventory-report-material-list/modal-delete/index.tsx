import InventoryReportDetailApi from '@/libs/api/inventory-report-detail-api';
import { Button, Popconfirm } from 'antd';
import useMessage from 'antd/es/message/useMessage';
import { getCookie } from 'cookies-next';
import { mutate } from 'swr';

const DeleteRow: React.FC<{ inventoryReportDetailId: number }> = ({ inventoryReportDetailId }) => {
  const [messageApi, context] = useMessage();

  const handleDelete = async () => {
    const access_token = getCookie('access_token') || '';
    const inventoryReportDetailApi = new InventoryReportDetailApi(access_token);
    const { success, message } = await inventoryReportDetailApi.deleteInventoryReportDetail(inventoryReportDetailId);

    if (!success) {
      messageApi.error(message);
    } else {
      mutate('inventory-report-details-list');
      messageApi.success(message);
    }
  };

  return (
    <>
      {context}
      <Popconfirm title="Xóa hàng?" onConfirm={handleDelete} cancelText="Hủy">
        <Button type="link">Xóa</Button>
      </Popconfirm>
    </>
  );
};

export default DeleteRow;
