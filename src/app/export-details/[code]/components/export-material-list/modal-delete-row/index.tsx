import ExportDetailApi from '@/libs/api/export-detail-api';
import { Button, Popconfirm } from 'antd';
import useMessage from 'antd/es/message/useMessage';
import { getCookie } from 'cookies-next';
import { mutate } from 'swr';

const DeleteRow: React.FC<{ exportDetailId: number }> = ({ exportDetailId }) => {
  const [messageApi, context] = useMessage();

  const handleDelete = async () => {
    const access_token = getCookie('access_token') || '';
    const exportDetailApi = new ExportDetailApi(access_token);
    const { success, message } = await exportDetailApi.deleteExportDetail(exportDetailId);

    if (success) {
      mutate('export-details-list');
      messageApi.success(message);
    } else {
      messageApi.error(message);
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
