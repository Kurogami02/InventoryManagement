import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Result } from 'antd';

const ForbiddenError: React.FC = () => {
  const route = useRouter();
  return (
    <div className="center-card">
      <Result
        status="403"
        title="403"
        subTitle="Bạn không có quyền truy cập trang này."
        extra={
          <Button type="primary" onClick={() => route.push('/')} htmlType={'button'}>
            Trở về trang chủ
          </Button>
        }
      />
    </div>
  );
};

export default ForbiddenError;
