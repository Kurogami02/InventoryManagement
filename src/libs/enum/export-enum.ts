export const EXPORT_ENUM_VI: { [key: string]: string } = {
  draft: 'Nháp',
  open: 'Mở',
  warehouse_confirm: 'Kho xác nhận đủ',
  warehouse_reject: 'Kho báo thiếu hàng',
  done: 'Hoàn thành',
  cancel: 'Đã hủy',
  returned: 'Hoàn trả',
};

export const EXPORT_MAPPING_NEXT_STATUS_TO_BUTTON_LABEL: { [key: string]: string } = {
  draft: 'Mở lại phiếu',
  open: 'Mở phiếu',
  warehouse_confirm: 'Xác nhận đủ',
  warehouse_reject: 'Báo thiếu hàng',
  done: 'Hoàn thành',
  cancel: 'Hủy phiếu',
  returned: 'Hoàn trả',
};

export const EXPORT_MAPPING_ROLE_TO_STATUS: { [key: string]: { [key: string]: string[] } } = {
  nhanVienTongCuc: {
    draft: ['open', 'cancel'],
    open: ['cancel'],
    warehouse_confirm: ['done', 'cancel'],
    warehouse_reject: ['cancel'],
    cancel: ['draft'],
  },
  nhanVienKho: {
    open: ['warehouse_confirm', 'warehouse_reject'],
  },
};
