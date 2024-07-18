export const INVENTORY_ENUM_VI: { [key: string]: string } = {
  draft: 'Nháp',
  open: 'Mở',
  warehouse_confirm: 'Kho kiểm kê xong',
  cancel: 'Đã hủy',
  done: 'Hoàn thành',
};

export const INVENTORY_MAPPING_NEXT_STATUS_TO_BUTTON_LABEL: { [key: string]: string } = {
  draft: 'Mở lại phiếu',
  open: 'Mở phiếu',
  warehouse_confirm: 'Xác nhận đã kiểm kê',
  cancel: 'Hủy phiếu',
  done: 'Hoàn thành',
};

export const INVENTORY_MAPPING_ROLE_TO_STATUS: { [key: string]: { [key: string]: string[] } } = {
  nhanVienTongCuc: {
    draft: ['open'],
    open: ['cancel'],
    warehouse_confirm: ['done'],
    cancel: ['draft'],
  },
  nhanVienKho: {
    draft: ['open'],
    open: ['warehouse_confirm'],
  },
};
