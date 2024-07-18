'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Result } from 'antd';

const Error: React.FC = () => {
  const route = useRouter();
  return (
    <div className="center-card">
      <Result
        status="500"
        title="Đã có lỗi xảy ra!"
        extra={
          <Button type="primary" onClick={() => route.back()} htmlType={'button'}>
            Quay lại
          </Button>
        }
      />
    </div>
  );
};

export default Error;
