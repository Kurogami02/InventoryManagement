import React from 'react';
import { Space, Spin } from 'antd';

const Loading: React.FC = () => (
  <div>
    <Space
      direction="vertical"
      style={{ width: '100%', position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
    >
      <Spin tip="Đang tải" size="large">
        <div className="content" />
      </Spin>
    </Space>
  </div>
);

export default Loading;
