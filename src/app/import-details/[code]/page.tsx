'use client';

import ImportReceiptInfo from './components/import-receipt-info';
import ImportDetailsMaterialList from './components/import-material-list/index';

const ImportDetails: React.FC<{ params: { code: string } }> = async ({ params }) => {
  const importCode = params.code;

  return (
    <>
      <ImportReceiptInfo code={importCode} />
      <ImportDetailsMaterialList code={importCode} />
    </>
  );
};

export default ImportDetails;
