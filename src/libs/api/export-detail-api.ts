import axios from 'axios';
import { ExportType } from './export-api';
import { MaterialProviderType } from './material-provider-api';
import { EXPORT_DETAIL_URL } from '@/config/api';

export type ExportDetailType = {
  id: number;
  materialProvider: MaterialProviderType;
  exportReceipt: ExportType;
  expectQuantity: number;
  returnQuantity: number;
  warehouseNote: string;
};

export type CreateExportDetailType = {
  materialProvider: MaterialProviderType;
  exportReceipt: ExportType;
  expectQuantity: number;
};

export default class ExportDetailApi {
  constructor(private readonly access_token: string) {}

  private readonly headers = {
    Authorization: 'Bearer ' + this.access_token,
  };

  async createExportDetails(exportDetails: CreateExportDetailType): Promise<{ success: boolean; message: string }> {
    return axios
      .post(
        EXPORT_DETAIL_URL,
        {
          materialProvider: +exportDetails.materialProvider || +exportDetails.materialProvider.id,
          export: exportDetails.exportReceipt.code,
          expectQuantity: +exportDetails.expectQuantity,
        },
        { headers: this.headers },
      )
      .then(() => ({
        success: true,
        message: 'Thêm chi tiết phiếu xuất thành công!',
      }))
      .catch((err) => ({
        success: false,
        message: err.response?.data.message || 'Thêm chi tiết phiếu xuất thất bại!',
      }));
  }

  async getExportDetails(
    exportCode: string,
  ): Promise<{ exportDetails: ExportDetailType[]; success: boolean; message: string }> {
    return axios
      .get(EXPORT_DETAIL_URL, { headers: this.headers, params: { export: exportCode } })
      .then((res) => {
        return {
          exportDetails: res.data.data.map((item: any) => ({
            id: item.id,
            materialProvider: item.materialProvider,
            exportReceipt: item.export,
            expectQuantity: item.expectQuantity,
            returnQuantity: item.returnQuantity,
            warehouseNote: item.warehouseNote,
            unit: item.unit,
          })),
          success: true,
          message: '',
        };
      })
      .catch((err) => ({ exportDetails: [], success: false, message: err.response?.data.message || 'Thất bại' }));
  }

  async updateExportDetail(
    id: number,
    updateData: {
      expectQuantity?: number;
      returnQuantity?: number;
    },
  ): Promise<{ success: boolean; message: string }> {
    return axios
      .patch(EXPORT_DETAIL_URL + '/' + id + '/department-staff', updateData, { headers: this.headers })
      .then(() => ({
        success: true,
        message: 'Cập nhật chi tiết phiếu xuất thành công!',
      }))
      .catch((err) => ({
        success: false,
        message: err.response?.data.message || 'Cập nhật chi tiết phiếu xuất thất bại!',
      }));
  }

  async deleteExportDetail(id: number): Promise<{ success: boolean; message: string }> {
    return axios
      .delete(EXPORT_DETAIL_URL + '/' + id, { headers: this.headers })
      .then(() => ({
        success: true,
        message: 'Xóa chi tiết phiếu xuất thành công!',
      }))
      .catch((err) => ({
        success: false,
        message: err.response?.data.message || 'Xóa chi tiết phiếu xuất thất bại!',
      }));
  }
}
