import TransferApi, { TransferType } from '@/libs/api/transfer-api';
import {
  TRANSFER_MAPPING_NEXT_STATUS_TO_BUTTON_LABEL,
  TRANSFER_MAPPING_ROLE_TO_STATUS,
} from '@/libs/enum/transfer-enum';
import { Button, Modal } from 'antd';
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

  if (record.warehouseExport.id !== currentUser?.warehouse?.id && currentStatus === 'open') {
    return <></>;
  }

  if (record.warehouseImport.id !== currentUser?.warehouse?.id && currentStatus === 'transfering') {
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
          mutate('transfer-list');
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
      {nextStatus?.map((status) => {
        const buttonLabel = TRANSFER_MAPPING_NEXT_STATUS_TO_BUTTON_LABEL[status];
        return (
          <div key={status}>
            <Button type="link" onClick={() => showUpdateModal(status)}>
              {buttonLabel}
            </Button>
            <br />
          </div>
        );
      })}
    </>
  );
};

export default ModalUpdateTransfer;
