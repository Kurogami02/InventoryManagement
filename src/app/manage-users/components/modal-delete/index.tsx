import useMessage from 'antd/es/message/useMessage';

import { DeleteOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { Modal } from 'antd';
import { getCookie } from 'cookies-next';
import { mutate } from 'swr';

import UserApi, { UpdateUserType } from '@/libs/api/user-api';

const { confirm } = Modal;

const ModalDeleteUser: React.FC<{ user: UpdateUserType }> = ({ user }) => {
  const [messageApi, context] = useMessage();

  const showDeleteModal = () => {
    confirm({
      title: `Xóa người dùng ${user.fullname} ?`,
      icon: <ExclamationCircleFilled />,
      content: 'Tác vụ này không thể hoàn tác và bạn phải liên hệ bộ phận tổng cục để khôi phục người dùng',
      okText: 'Xóa người dùng',
      okType: 'danger',
      cancelText: 'Hủy',
      async onOk() {
        //Handle API Update User
        const access_token = getCookie('access_token') || '';
        const userApi = new UserApi(access_token);
        const { success, message } = await userApi.deleteUser(user.id);

        //Return message to UI
        if (success) {
          mutate('user-list');
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

export default ModalDeleteUser;
