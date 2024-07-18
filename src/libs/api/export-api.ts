import { EXPORT_URL } from '@/config/api';
import axios from 'axios';
import { ProductionUnitType } from './production-unit-api';
import { WarehouseType } from './warehouse-api';

export type ExportType = {
  code: string;
  productionUnit: ProductionUnitType;
  warehouse: WarehouseType;
  status: string;
  exportAt: Date;
  note: string;
};

export type CreateExportType = {
  exportAt: Date;
  warehouse: number;
  productionUnit: number;
};

export default class ExportApi {
  constructor(private readonly access_token: string) {}

  private readonly headers = {
    Authorization: 'Bearer ' + this.access_token,
  };

  async createExport(exportReceipt: CreateExportType): Promise<{ success: boolean; message: string }> {
    return axios
      .post(
        EXPORT_URL,
        {
          exportAt: exportReceipt.exportAt,
          warehouse: exportReceipt.warehouse,
          productionUnit: exportReceipt.productionUnit,
        },
        { headers: this.headers },
      )
      .then(() => ({
        success: true,
        message: 'Tạo phiếu xuất thành công!',
      }))
      .catch((err) => ({
        success: false,
        message: err.response?.data.message || 'Tạo phiếu xuất thất bại!',
      }));
  }

  async getExport(exportID: string): Promise<{ exportReceipt: ExportType; success: boolean; message: string }> {
    return axios
      .get(EXPORT_URL + '/' + exportID, { headers: this.headers })
      .then((res) => ({
        exportReceipt: {
          code: res.data.code,
          exportAt: res.data.exportAt,
          warehouse: res.data.warehouse,
          productionUnit: res.data.productionUnit,
          status: res.data.status,
          note: res.data.note,
        },
        success: true,
        message: '',
      }))
      .catch((err) => ({
        exportReceipt: {
          code: '',
          exportAt: new Date(),
          warehouse: { id: -1, name: '', address: '' },
          productionUnit: { id: -1, name: '', address: '', phone: '' },
          note: '',
          status: '',
        },
        success: false,
        message: err.response?.data.message,
      }));
  }

  async getExportList(filters?: {
    search_code?: string;
    page?: number;
    warehouse?: number;
    productionUnit?: number;
    exportAt?: { from?: Date; to?: Date };
    size?: number;
  }): Promise<{ exportReceipts: ExportType[]; success: boolean; message: string; total: number }> {
    type ParamType = {
      code?: string;
      page?: number;
      warehouse?: number;
      productionUnit?: number;
      exportAt?: { from?: Date; to?: Date };
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

    if (filters?.productionUnit) {
      paramsObject.productionUnit = filters.productionUnit;
    }

    if (filters?.exportAt) {
      paramsObject.exportAt = filters.exportAt;
    }

    if (filters?.size) {
      paramsObject.size = filters.size;
    }

    return axios
      .get(EXPORT_URL, { headers: this.headers, params: paramsObject })
      .then((res) => ({
        exportReceipts: res.data.data?.map((item: ExportType) => ({
          code: item.code,
          productionUnit: item.productionUnit,
          warehouse: item.warehouse,
          exportAt: item.exportAt,
          status: item.status,
          note: item.note || '---',
        })),
        success: true,
        message: '',
        total: res.data.total,
      }))
      .catch(() => ({
        exportReceipts: [],
        success: false,
        message: 'Người dùng không có quyền thực hiện tác vụ',
        total: 0,
      }));
  }

  async updateExportStatus(
    exportReceipt: ExportType,
    new_status: string,
  ): Promise<{ success: boolean; message: string }> {
    return axios
      .patch(EXPORT_URL + '/' + exportReceipt.code + '/status/' + new_status, {}, { headers: this.headers })
      .then(() => ({
        success: true,
        message: 'Cập nhật thành công',
      }))
      .catch((err) => ({
        success: false,
        message: err.response?.data.message,
      }));
  }

  async deleteExport(exportReceipt_code: string): Promise<{ success: boolean; message: string }> {
    return axios
      .delete(EXPORT_URL + '/' + exportReceipt_code, { headers: this.headers })
      .then(() => ({
        success: true,
        message: 'Xóa phiếu xuất thành công',
      }))
      .catch((err) => ({
        success: false,
        message: err.response?.data.message || 'Xóa phiếu xuất thất bại!',
      }));
  }
}
