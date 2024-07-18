'use client';

import InventoryReportInfo from './components/inventory-report-info';
import InventoryReportDetailMaterialList from './components/inventory-report-material-list';

const InventoryReportDetails: React.FC<{ params: { code: string } }> = ({ params }) => {
  const inventoryReportCode = params.code;

  return (
    <>
      <InventoryReportInfo code={inventoryReportCode} />
      <InventoryReportDetailMaterialList code={inventoryReportCode} />
    </>
  );
};

export default InventoryReportDetails;
