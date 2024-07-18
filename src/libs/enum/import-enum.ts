export const IMPORT_ENUM_VI: { [key: string]: string } = {
  draft: 'Nháp',
  open: 'Mở',
  warehouse_confirm: 'Kho xác nhận đủ',
  qa_confirm: 'QA xác nhận đạt',
  qa_reject: 'QA từ chối nhập',
  done: 'Hoàn thành',
  cancel: 'Đã hủy',
};

export const IMPORT_MAPPING_NEXT_STATUS_TO_BUTTON_LABEL: { [key: string]: string } = {
  draft: 'Mở lại phiếu',
  open: 'Mở phiếu',
  warehouse_confirm: 'Xác nhận đủ',
  qa_confirm: 'Xác nhận đạt',
  qa_reject: 'Từ chối nhập',
  done: 'Hoàn thành',
  cancel: 'Hủy phiếu',
};

//Mapping list of status can be updated by specific role
export const IMPORT_MAPPING_ROLE_TO_STATUS: { [key: string]: { [key: string]: string[] } } = {
  nhanVienTongCuc: {
    draft: ['open', 'cancel'],
    open: ['cancel'],
    warehouse_confirm: ['cancel'],
    qa_confirm: ['done'],
    qa_reject: ['cancel'],
    cancel: ['draft'],
  },
  nhanVienKho: {
    open: ['warehouse_confirm'],
  },
  QA: {
    warehouse_confirm: ['qa_confirm', 'qa_reject'],
  },
};
