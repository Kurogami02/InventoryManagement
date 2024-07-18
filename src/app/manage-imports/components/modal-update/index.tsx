import useMessage from 'antd/es/message/useMessage';
import { Button, Modal } from 'antd';
import { getCookie } from 'cookies-next';
import { mutate } from 'swr';

import ImportApi, { ImportType } from '@/libs/api/import-api';
import { IMPORT_MAPPING_NEXT_STATUS_TO_BUTTON_LABEL, IMPORT_MAPPING_ROLE_TO_STATUS } from '@/libs/enum/import-enum';

const ModalUpdateImport: React.FC<{ importReceipt: ImportType }> = ({ importReceipt }) => {
  const [messageApi, context] = useMessage();
  const { confirm } = Modal;

  const currentStatus = importReceipt.status;
  const currentUser = getCookie('login-user')?.toString() || '';
  const currentUserRole = JSON.parse(currentUser).role.id;
  const nextStatus = IMPORT_MAPPING_ROLE_TO_STATUS[currentUserRole][currentStatus] || [''];

  //Check whether current user unable to see modal => return blank
  if (nextStatus.filter((element) => element).length === 0) {
    return <></>;
  }

  const showUpdateModal = (nextStatus: string) => {
    const buttonLabel = IMPORT_MAPPING_NEXT_STATUS_TO_BUTTON_LABEL[nextStatus];

    confirm({
      title: `${buttonLabel} cho phiếu ${importReceipt.code}?`,
      centered: true,
      okText: `${buttonLabel}`,
      okType: 'primary',
      okButtonProps: { htmlType: 'submit' },
      cancelText: 'Hủy',
      content: '', //nextStatus == 'qa_reject' ? <NoteForm></NoteForm> : '',
      async onOk() {
        //Handle API Update Import
        const access_token = getCookie('access_token') || '';
        const importReceiptApi = new ImportApi(access_token);
        const { success, message } = await importReceiptApi.updateImportStatus(importReceipt, nextStatus);

        //Return message to UI
        if (success) {
          mutate('import-list');
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
        const buttonLabel = IMPORT_MAPPING_NEXT_STATUS_TO_BUTTON_LABEL[status];
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

export default ModalUpdateImport;
