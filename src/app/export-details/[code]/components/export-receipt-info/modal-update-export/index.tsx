import ExportApi, { ExportType } from '@/libs/api/export-api';
import { EXPORT_MAPPING_ROLE_TO_STATUS, EXPORT_MAPPING_NEXT_STATUS_TO_BUTTON_LABEL } from '@/libs/enum/export-enum';
import { Button, Modal, Space } from 'antd';
import useMessage from 'antd/es/message/useMessage';
import { getCookie } from 'cookies-next';
import { mutate } from 'swr';

const ModalUpdateExport: React.FC<{ exportReceipt: ExportType }> = ({ exportReceipt }) => {
  const [messageApi, context] = useMessage();
  const { confirm } = Modal;

  const currentStatus = exportReceipt.status;
  const currentUser = getCookie('login-user')?.toString() || '';
  const currentUserRole = JSON.parse(currentUser).role.id;
  const nextStatus = EXPORT_MAPPING_ROLE_TO_STATUS[currentUserRole][currentStatus] || [''];

  //Check whether current user unable to see modal => return blank
  if (nextStatus.filter((element) => element).length === 0) {
    return <></>;
  }

  const showUpdateModal = (nextStatus: string) => {
    const buttonLabel = EXPORT_MAPPING_NEXT_STATUS_TO_BUTTON_LABEL[nextStatus];

    confirm({
      title: `${buttonLabel} cho phiếu ${exportReceipt.code}?`,
      centered: true,
      okText: `${buttonLabel}`,
      okType: 'primary',
      okButtonProps: { htmlType: 'submit' },
      cancelText: 'Hủy',
      content: '', //nextStatus == 'qa_reject' ? <NoteForm></NoteForm> : '',
      async onOk() {
        //Handle API Update Export
        const access_token = getCookie('access_token') || '';
        const exportReceiptApi = new ExportApi(access_token);
        const { success, message } = await exportReceiptApi.updateExportStatus(exportReceipt, nextStatus);

        //Return message to UI
        if (success) {
          mutate('export-info');
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
          const buttonLabel = EXPORT_MAPPING_NEXT_STATUS_TO_BUTTON_LABEL[status];
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

export default ModalUpdateExport;
