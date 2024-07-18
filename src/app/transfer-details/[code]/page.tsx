'use client';

import TransferInfo from './components/transfer-info';
import TransferDetailsMaterialList from './components/transfer-material-list';

const TransferDetails: React.FC<{ params: { code: string } }> = async ({ params }) => {
  const transferId = params.code;

  return (
    <>
      <TransferInfo code={transferId} />
      <TransferDetailsMaterialList code={transferId} />
    </>
  );
};

export default TransferDetails;
