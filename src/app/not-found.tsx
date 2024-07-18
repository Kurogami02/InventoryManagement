'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Result } from 'antd';

const NotFound: React.FC = () => {
  const route = useRouter();
  return (
    <div className={'center-card'}>
      <Result
        status="404"
        title="404"
        subTitle="Trang web không tồn tại!"
        extra={
          <Button type="primary" onClick={() => route.back()} htmlType={'button'}>
            Quay lại
          </Button>
        }
      />
    </div>
  );
};

export default NotFound;
