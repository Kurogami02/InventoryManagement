import TransferDetailApi from '@/libs/api/transfer-detail-api';
import { Button, Popconfirm } from 'antd';
import useMessage from 'antd/es/message/useMessage';
import { getCookie } from 'cookies-next';
import { mutate } from 'swr';

const DeleteRow: React.FC<{ transfer: number }> = ({ transfer }) => {
  const [messageApi, context] = useMessage();

  const handleDelete = async () => {
    const access_token = getCookie('access_token') || '';
    const transferDetailApi = new TransferDetailApi(access_token);
    const { success, message } = await transferDetailApi.deleteTransferDetail(transfer);

    if (success) {
      mutate('transfer-details-list');
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
