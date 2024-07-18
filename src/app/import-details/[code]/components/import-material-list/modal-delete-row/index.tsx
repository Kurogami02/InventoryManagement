import ImportDetailApi from '@/libs/api/import-detail-api';
import { Button, Popconfirm } from 'antd';
import useMessage from 'antd/es/message/useMessage';
import { getCookie } from 'cookies-next';
import { mutate } from 'swr';

const DeleteRow: React.FC<{ importDetailId: number }> = ({ importDetailId }) => {
  const [messageApi, context] = useMessage();

  const handleDelete = async () => {
    const access_token = getCookie('access_token') || '';
    const importDetailApi = new ImportDetailApi(access_token);
    const { success, message } = await importDetailApi.deleteImportDetail(importDetailId);

    if (success) {
      mutate('import-details-list');
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
