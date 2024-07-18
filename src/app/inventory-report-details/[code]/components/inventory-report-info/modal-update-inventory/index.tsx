import InventoryReportApi, { InventoryReportType } from '@/libs/api/inventory-report-api';
import {
  INVENTORY_MAPPING_NEXT_STATUS_TO_BUTTON_LABEL,
  INVENTORY_MAPPING_ROLE_TO_STATUS,
} from '@/libs/enum/inventory-enum';
import { Button, Modal, Space } from 'antd';
import useMessage from 'antd/es/message/useMessage';
import { getCookie } from 'cookies-next';
import { mutate } from 'swr';

const ModalUpdateInventory: React.FC<{ inventory: InventoryReportType }> = ({ inventory }) => {
  const [messageApi, context] = useMessage();
  const { confirm } = Modal;

  const currentStatus = inventory.status;
  const currentUser = getCookie('login-user')?.toString() || '';
  const currentUserRole = JSON.parse(currentUser).role.id;
  const nextStatus = INVENTORY_MAPPING_ROLE_TO_STATUS[currentUserRole][currentStatus] || [''];

  //Check whether current user unable to see modal => return blank
  if (nextStatus.filter((element) => element).length === 0) {
    return <></>;
  }

  const showUpdateModal = (nextStatus: string) => {
    const buttonLabel = INVENTORY_MAPPING_NEXT_STATUS_TO_BUTTON_LABEL[nextStatus];

    confirm({
      title: `${buttonLabel} cho phiếu ${inventory.code}?`,
      centered: true,
      okText: `${buttonLabel}`,
      okType: 'primary',
      okButtonProps: { htmlType: 'submit' },
      cancelText: 'Hủy',
      content: '', //nextStatus == 'qa_reject' ? <NoteForm></NoteForm> : '',
      async onOk() {
        //Handle API Update Export
        const access_token = getCookie('access_token') || '';
        const inventoryApi = new InventoryReportApi(access_token);
        const { success, message } = await inventoryApi.updateInventoryStatus(inventory.code, nextStatus);

        //Return message to UI
        if (success) {
          mutate('inventory-report-info');
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
          const buttonLabel = INVENTORY_MAPPING_NEXT_STATUS_TO_BUTTON_LABEL[status];
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

export default ModalUpdateInventory;
