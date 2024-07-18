import useMessage from 'antd/es/message/useMessage';

import { DeleteOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { Modal } from 'antd';
import { getCookie } from 'cookies-next';
import { mutate } from 'swr';

import ProductionUnitApi, { ProductionUnitType } from '@/libs/api/production-unit-api';

const { confirm } = Modal;

const ModalDeleteProductionUnit: React.FC<{ production_unit: ProductionUnitType }> = ({ production_unit }) => {
  const [messageApi, context] = useMessage();

  const showDeleteModal = () => {
    confirm({
      title: `Xóa đơn vị sản xuất ${production_unit.name || ''} ?`,
      icon: <ExclamationCircleFilled />,
      content: 'Tác vụ này không thể hoàn tác và bạn phải liên hệ bộ phận tổng cục để khôi phục đơn vị sản xuất',
      okText: 'Xóa đơn vị sản xuất',
      okType: 'danger',
      cancelText: 'Hủy',
      async onOk() {
        //Handle API Update ProductionUnit
        const access_token = getCookie('access_token') || '';
        const production_unitApi = new ProductionUnitApi(access_token);
        const { success, message } = await production_unitApi.deleteProductionUnit(production_unit.id);

        //Return message to UI
        if (success) {
          mutate('production-unit-list');
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

export default ModalDeleteProductionUnit;
