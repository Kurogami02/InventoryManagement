export const TRANSFER_ENUM_VI: { [key: string]: string } = {
  draft: 'Nháp',
  open: 'Mở',
  transfering: 'Đang điều chuyển',
  transfered: 'Đã điều chuyển',
  reject_export: 'Từ chối xuất',
  reject_import: 'Từ chối nhập',
  returned: 'Đã hoàn về kho xuất',
  done: 'Hoàn thành',
  cancel: 'Đã hủy',
};

export const TRANSFER_MAPPING_NEXT_STATUS_TO_BUTTON_LABEL: { [key: string]: string } = {
  draft: 'Mở lại phiếu',
  open: 'Mở phiếu',
  transfering: 'Xuất hàng',
  transfered: 'Nhập hàng',
  reject_export: 'Từ chối xuất',
  reject_import: 'Từ chối nhập',
  returned: 'Hoàn trả',
  done: 'Hoàn thành',
  cancel: 'Hủy phiếu',
};

//Mapping list of status can be updated by specific role
export const TRANSFER_MAPPING_ROLE_TO_STATUS: { [key: string]: { [key: string]: string[] } } = {
  nhanVienTongCuc: {
    draft: ['open', 'cancel'],
    open: ['cancel'],
    transfered: ['done', 'cancel'],
    reject_export: ['cancel'],
    reject_import: ['cancel'],
    cancel: ['draft'],
  },
  nhanVienKho: {
    open: ['transfering', 'reject_export'],
    transfering: ['transfered', 'reject_import'],
  },
};
