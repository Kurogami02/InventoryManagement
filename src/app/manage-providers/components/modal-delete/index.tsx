import useMessage from 'antd/es/message/useMessage';

import { DeleteOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { Modal } from 'antd';
import { getCookie } from 'cookies-next';
import { mutate } from 'swr';

import ProviderApi, { ProviderType } from '@/libs/api/provider-api';

const { confirm } = Modal;

const ModalDeleteProvider: React.FC<{ provider: ProviderType }> = ({ provider }) => {
  const [messageApi, context] = useMessage();

  const showDeleteModal = () => {
    confirm({
      title: `Xóa nhà cung cấp ${provider.name || ''} ?`,
      icon: <ExclamationCircleFilled />,
      content: 'Tác vụ này không thể hoàn tác và bạn phải liên hệ bộ phận tổng cục để khôi phục nhà cung cấp',
      okText: 'Xóa nhà cung cấp',
      okType: 'danger',
      cancelText: 'Hủy',
      async onOk() {
        //Handle API Update Provider
        const access_token = getCookie('access_token') || '';
        const providerApi = new ProviderApi(access_token);
        const { success, message } = await providerApi.deleteProvider(provider.id);

        //Return message to UI
        if (success) {
          mutate('provider-list');
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

export default ModalDeleteProvider;
