'use client';

import ExportDetailsMaterialList from './components/export-material-list';
import ExportReceiptInfo from './components/export-receipt-info';

const ExportDetails: React.FC<{ params: { code: string } }> = async ({ params }) => {
  const exportCode = params.code;

  return (
    <>
      <ExportReceiptInfo code={exportCode} />
      <ExportDetailsMaterialList code={exportCode} />
    </>
  );
};

export default ExportDetails;
