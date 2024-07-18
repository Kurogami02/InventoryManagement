import axios from 'axios';
import { InventoryReportType } from './inventory-report-api';
import { MaterialProviderType } from './material-provider-api';
import { INVENTORY_RECORD_DETAIL_URL } from '@/config/api';

export type InventoryReportDetailType = {
  id: number;
  materialProvider: MaterialProviderType;
  inventoryReport: InventoryReportType;
  originQuantity: number;
  actualQuantity: number;
};

export type CreateInventoryReportDetailType = {
  materialProvider: number;
  inventoryReport: string;
  originQuantity: number;
};

export default class InventoryReportDetailApi {
  constructor(private readonly access_token: string) {}

  private readonly headers = {
    Authorization: 'Bearer ' + this.access_token,
  };

  async createInventoryReportDetail(
    inventoryReportDetail: CreateInventoryReportDetailType,
  ): Promise<{ success: boolean; message: string }> {
    return axios
      .post(
        INVENTORY_RECORD_DETAIL_URL,
        {
          inventory: inventoryReportDetail.inventoryReport,
          materialProvider: +inventoryReportDetail.materialProvider,
          originQuantity: +inventoryReportDetail.originQuantity,
        },
        { headers: this.headers },
      )
      .then(() => ({
        success: true,
        message: 'Thêm nguyên vật liệu thành công!',
      }))
      .catch((err) => ({
        success: false,
        message: err.response?.data.message || 'Thất bại!',
      }));
  }

  async getInventoryReportDetails(
    inventoryReport: string,
  ): Promise<{ inventoryDetails: InventoryReportDetailType[]; success: boolean; message: string }> {
    return axios
      .get(INVENTORY_RECORD_DETAIL_URL, { headers: this.headers, params: { inventoryReport } })
      .then((res) => ({
        inventoryDetails: res.data.data,
        success: true,
        message: '',
      }))
      .catch((err) => ({ inventoryDetails: [], success: false, message: err.response?.data || 'Thất bại' }));
  }

  async updateInventoryReportDetail(
    id: number,
    updateData: {
      actualQuantity?: number;
    },
  ): Promise<{ success: boolean; message: string }> {
    return axios
      .patch(INVENTORY_RECORD_DETAIL_URL + '/' + id + '/warehouse-staff', updateData, { headers: this.headers })
      .then(() => ({
        success: true,
        message: 'Cập nhật nguyên vật liệu thành công!',
      }))
      .catch((err) => ({
        success: false,
        message: err.response?.data.message || 'Cập nhật nguyên vật liệu thất bại!',
      }));
  }

  async deleteInventoryReportDetail(id: number): Promise<{ success: boolean; message: string }> {
    return axios
      .delete(INVENTORY_RECORD_DETAIL_URL + '/' + id, { headers: this.headers })
      .then(() => ({
        success: true,
        message: 'Xóa nguyên vật liệu thành công!',
      }))
      .catch((err) => ({
        success: false,
        message: err.response?.data.message || 'Xóa nguyên vật liệu thất bại!',
      }));
  }
}
