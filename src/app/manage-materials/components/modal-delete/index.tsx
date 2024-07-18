import useMessage from 'antd/es/message/useMessage';

import { DeleteOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { Modal } from 'antd';
import { getCookie } from 'cookies-next';
import { mutate } from 'swr';

import MaterialApi, { MaterialType } from '@/libs/api/material-api';

const { confirm } = Modal;

const ModalDeleteMaterial: React.FC<{ material: MaterialType }> = ({ material }) => {
  const [messageApi, context] = useMessage();

  const showDeleteModal = () => {
    confirm({
      title: `Xóa nguyên vật liệu ${material.name || ''} ?`,
      icon: <ExclamationCircleFilled />,
      content: 'Tác vụ này không thể hoàn tác và bạn phải liên hệ bộ phận tổng cục để khôi phục nguyên vật liệu',
      okText: 'Xóa nguyên vật liệu',
      okType: 'danger',
      cancelText: 'Hủy',
      async onOk() {
        //Handle API Update Material
        const access_token = getCookie('access_token') || '';
        const materialApi = new MaterialApi(access_token);
        const { success, message } = await materialApi.deleteMaterial(material.code);

        //Return message to UI
        if (success) {
          mutate('material-list');
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

export default ModalDeleteMaterial;
