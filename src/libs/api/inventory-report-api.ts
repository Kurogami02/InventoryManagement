import { INVENTORY_RECORD_URL } from '@/config/api';
import axios from 'axios';
import { WarehouseType } from './warehouse-api';

export type InventoryReportType = {
  code: string;
  warehouse: WarehouseType;
  inventoryReportAt: Date;
  status: string;
};

export type CreateInventoryReportType = {
  warehouse: number;
  inventoryReportAt: Date;
};

export default class InventoryReportApi {
  constructor(private readonly access_token: string) {}

  private readonly headers = {
    Authorization: 'Bearer ' + this.access_token,
  };

  async createInventoryReport(
    inventoryReport: CreateInventoryReportType,
  ): Promise<{ success: boolean; message: string }> {
    return axios
      .post(INVENTORY_RECORD_URL, inventoryReport, { headers: this.headers })
      .then(() => ({
        success: true,
        message: 'Thêm biên bản kiểm kê thành công!',
      }))
      .catch((err) => ({
        success: false,
        message: err.response?.data.message || 'Thêm biên bản kiểm kê thất bại!',
      }));
  }

  async getInventoryReport(
    code: string,
  ): Promise<{ inventoryReport: InventoryReportType; success: boolean; message: string }> {
    return axios
      .get(INVENTORY_RECORD_URL + '/' + code, { headers: this.headers })
      .then((res) => ({
        inventoryReport: {
          key: res.data.code,
          code: res.data.code,
          warehouse: res.data.warehouse,
          status: res.data.status,
          inventoryReportAt: res.data.inventoryReportAt,
        },
        success: true,
        message: '',
      }))
      .catch((err) => ({
        inventoryReport: {
          code: '',
          warehouse: { id: 0, name: '', address: '' },
          inventoryReportAt: new Date(),
          status: '',
        },
        success: false,
        message: err.response?.data.message || 'Thất bại!',
      }));
  }

  async getInventoryReportList(filters: {
    code?: string;
    page?: number;
    warehouse?: number;
    inventoryReportAt?: { from?: Date; to?: Date };
    size?: number;
  }): Promise<{ inventoryReports: InventoryReportType[]; success: boolean; message: string; total: number }> {
    return axios
      .get(INVENTORY_RECORD_URL, {
        headers: this.headers,
        params: filters,
      })
      .then((res) => ({
        inventoryReports: res.data.data?.map((item: InventoryReportType) => {
          return {
            key: item.code,
            code: item.code,
            warehouse: item.warehouse,
            inventoryReportAt: item.inventoryReportAt,
            status: item.status,
          };
        }),
        success: true,
        message: '',
        total: res.data.total,
      }))
      .catch((err) => ({
        inventoryReports: [],
        success: false,
        message: err.response?.data.message || 'Thất bại!',
        total: 0,
      }));
  }

  async updateInventoryStatus(code: string, status: string): Promise<{ success: boolean; message: string }> {
    return axios
      .patch(INVENTORY_RECORD_URL + '/' + code + '/status/' + status, {}, { headers: this.headers })
      .then(() => ({
        success: true,
        message: 'Cập nhật thành công',
      }))
      .catch((err) => ({
        success: false,
        message: err.response?.data.message,
      }));
  }

  async deleteInventoryReport(code: string): Promise<{ success: boolean; message: string }> {
    return axios
      .delete(INVENTORY_RECORD_URL + '/' + code, { headers: this.headers })
      .then(() => ({
        success: true,
        message: 'Xóa biên bản kiểm kê thành công!',
      }))
      .catch((err) => ({
        success: false,
        message: err.response?.data.message || 'Xóa biên bản kiểm kê thất bại!',
      }));
  }
}
