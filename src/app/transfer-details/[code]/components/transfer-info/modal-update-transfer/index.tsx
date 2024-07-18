import TransferApi, { TransferType } from '@/libs/api/transfer-api';
import {
  TRANSFER_MAPPING_ROLE_TO_STATUS,
  TRANSFER_MAPPING_NEXT_STATUS_TO_BUTTON_LABEL,
} from '@/libs/enum/transfer-enum';
import { Modal, Button, Space } from 'antd';
import useMessage from 'antd/es/message/useMessage';
import { getCookie } from 'cookies-next';
import { mutate } from 'swr';

const ModalUpdateTransfer: React.FC<{ record: TransferType }> = ({ record }) => {
  const [messageApi, context] = useMessage();
  const { confirm } = Modal;

  const currentStatus = record.status;
  const currentUserJson = getCookie('login-user')?.toString() || '';
  const currentUser = JSON.parse(currentUserJson || '');
  const currentUserRole = currentUser?.role?.id;
  const nextStatus = TRANSFER_MAPPING_ROLE_TO_STATUS[currentUserRole][currentStatus];

  //Check whether current user unable to see modal => return blank
  if (currentUserRole === 'QA') {
    return <></>;
  }

  if (record.warehouseImport.id === currentUser?.warehouse?.id && currentStatus !== 'transfering') {
    return <></>;
  }

  if (record.warehouseExport.id === currentUser?.warehouse?.id && currentStatus !== 'open') {
    return <></>;
  }

  const showUpdateModal = (nextStatus: string) => {
    const buttonLabel = TRANSFER_MAPPING_NEXT_STATUS_TO_BUTTON_LABEL[nextStatus];

    confirm({
      title: `${buttonLabel} phiếu ${record.code}?`,
      centered: true,
      okText: `${buttonLabel}`,
      okType: 'primary',
      okButtonProps: { htmlType: 'submit' },
      cancelText: 'Hủy',
      content: '',
      async onOk() {
        //Handle API Update Export
        const access_token = getCookie('access_token') || '';
        const transferApi = new TransferApi(access_token);
        const { success, message } = await transferApi.updateTransferStatus(record, nextStatus);

        //Return message to UI
        if (success) {
          mutate('transfer-info');
          messageApi.success(message);
        } else {
          messageApi.error(message);
        }
      },
    });
  };

  return (
    <>
      {context}
      <Space size="middle" style={{ float: 'right' }}>
        {nextStatus?.map((status) => {
          const buttonLabel = TRANSFER_MAPPING_NEXT_STATUS_TO_BUTTON_LABEL[status];
          return (
            <Button key={status} type="primary" onClick={() => showUpdateModal(status)}>
              {buttonLabel}
            </Button>
          );
        })}
      </Space>
    </>
  );
};

export default ModalUpdateTransfer;
