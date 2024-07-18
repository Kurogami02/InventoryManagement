import useMessage from 'antd/es/message/useMessage';

import { DeleteOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { Modal } from 'antd';
import { getCookie } from 'cookies-next';
import { mutate } from 'swr';

import WarehouseApi, { WarehouseType } from '@/libs/api/warehouse-api';

const { confirm } = Modal;

const ModalDeleteWarehouse: React.FC<{ warehouse: WarehouseType }> = ({ warehouse }) => {
  const [messageApi, context] = useMessage();

  const showDeleteModal = () => {
    confirm({
      title: `Xóa kho nguyên vật liệu ${warehouse.name || ''} ?`,
      icon: <ExclamationCircleFilled />,
      content: 'Tác vụ này không thể hoàn tác và bạn phải liên hệ bộ phận tổng cục để khôi phục kho nguyên vật liệu',
      okText: 'Xóa kho nguyên vật liệu',
      okType: 'danger',
      cancelText: 'Hủy',
      async onOk() {
        //Handle API Update Warehouse
        const access_token = getCookie('access_token') || '';
        const warehouseApi = new WarehouseApi(access_token);
        const { success, message } = await warehouseApi.deleteWarehouse(warehouse.id);

        //Return message to UI
        if (success) {
          mutate('warehouse-list');
          messageApi.success(message);
        } else {
          messageApi.error(message);
        }
      },
      onCancel() {},
    });
  };

  return (
    <>
      {context}
      <DeleteOutlined onClick={showDeleteModal} />
    </>
  );
};

export default ModalDeleteWarehouse;
