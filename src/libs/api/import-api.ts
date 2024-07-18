import { IMPORT_URL } from '@/config/api';
import axios from 'axios';
import { ProviderType } from './provider-api';
import { WarehouseType } from './warehouse-api';

export type ImportType = {
  code: string;
  provider: ProviderType;
  warehouse: WarehouseType;
  status: string;
  importAt: Date;
  note: string;
};

export type CreateImportType = {
  importAt: Date;
  warehouse: number;
  provider: number;
};

export default class ImportApi {
  constructor(private readonly access_token: string) {}

  private readonly headers = {
    Authorization: 'Bearer ' + this.access_token,
  };

  async createImport(importReceipt: CreateImportType): Promise<{ success: boolean; message: string }> {
    return axios
      .post(
        IMPORT_URL,
        {
          importAt: importReceipt.importAt,
          warehouse: importReceipt.warehouse,
          provider: importReceipt.provider,
        },
        { headers: this.headers },
      )
      .then(() => ({
        success: true,
        message: 'Tạo phiếu nhập thành công!',
      }))
      .catch((err) => ({
        success: false,
        message: err.response?.data.message || 'Tạo phiếu nhập thất bại!',
      }));
  }

  async getImport(importReceipt_id: string): Promise<{ importReceipt: ImportType; success: boolean; message: string }> {
    return axios
      .get(IMPORT_URL + '/' + importReceipt_id, { headers: this.headers })
      .then((res) => ({
        importReceipt: {
          code: res.data.code,
          importAt: res.data.importAt,
          warehouse: res.data.warehouse,
          provider: res.data.provider,
          status: res.data.status,
          note: res.data.note,
        },
        success: true,
        message: '',
      }))
      .catch((err) => ({
        importReceipt: {
          code: '',
          importAt: new Date(),
          warehouse: { id: -1, name: '', address: '' },
          provider: { id: -1, name: '', address: '', phone: '' },
          note: '',
          status: '',
        },
        success: false,
        message: err.response?.data.message,
      }));
  }

  async getImportList(filters?: {
    search_code?: string;
    page?: number;
    warehouse?: number;
    provider?: number;
    importAt?: { from?: Date; to?: Date };
    size?: number;
  }): Promise<{ importReceipts: ImportType[]; success: boolean; message: string; total: number }> {
    type ParamType = {
      code?: string;
      page?: number;
      warehouse?: number;
      provider?: number;
      importAt?: { from?: Date; to?: Date };
      size?: number;
    };

    const paramsObject: ParamType = {};

    if (filters?.search_code) {
      paramsObject.code = filters.search_code;
    }

    if (filters?.page) {
      paramsObject.page = filters.page;
    }

    if (filters?.warehouse) {
      paramsObject.warehouse = filters.warehouse;
    }

    if (filters?.provider) {
      paramsObject.provider = filters.provider;
    }

    if (filters?.importAt) {
      paramsObject.importAt = filters.importAt;
    }

    if (filters?.size) {
      paramsObject.size = filters.size;
    }

    return axios
      .get(IMPORT_URL, { headers: this.headers, params: paramsObject })
      .then((res) => ({
        importReceipts: res.data.data?.map((item: ImportType) => ({
          code: item.code,
          provider: item.provider,
          warehouse: item.warehouse,
          importAt: item.importAt,
          status: item.status,
          note: item.note || '---',
        })),
        success: true,
        message: '',
        total: res.data.total,
      }))
      .catch(() => ({
        importReceipts: [],
        success: false,
        message: 'Người dùng không có quyền thực hiện tác vụ',
        total: 0,
      }));
  }

  async updateImportStatus(
    importReceipt: ImportType,
    new_status: string,
  ): Promise<{ success: boolean; message: string }> {
    return axios
      .patch(IMPORT_URL + '/' + importReceipt.code + '/status/' + new_status, {}, { headers: this.headers })
      .then(() => ({
        success: true,
        message: 'Cập nhật thành công',
      }))
      .catch((err) => ({
        success: false,
        message: err.response?.data.message,
      }));
  }

  async deleteImport(importReceipt_code: string): Promise<{ success: boolean; message: string }> {
    return axios
      .delete(IMPORT_URL + '/' + importReceipt_code, { headers: this.headers })
      .then(() => ({
        success: true,
        message: 'Xóa phiếu nhập thành công',
      }))
      .catch((err) => ({
        success: false,
        message: err.response?.data.message || 'Xóa phiếu nhập thất bại! ',
      }));
  }
}
