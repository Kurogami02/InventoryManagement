import axios from 'axios';
import { ImportType } from './import-api';
import { MaterialProviderType } from './material-provider-api';
import { IMPORT_DETAIL_URL, IMPORT_URL } from '@/config/api';

export type ImportDetailType = {
  key?: any;
  id: number;
  materialProvider: MaterialProviderType;
  importReceipt: ImportType;
  expectQuantity: number;
  actualQuantity: number;
  warehouseNote: string;
  qaNote: string;
};

export type CreateImportDetailType = {
  materialProvider: MaterialProviderType;
  importReceipt: ImportType;
  expectQuantity: number;
};

export default class ImportDetailApi {
  constructor(private readonly access_token: string) {}

  private readonly headers = {
    Authorization: 'Bearer ' + this.access_token,
  };

  async createImportDetails(importDetails: CreateImportDetailType): Promise<{ success: boolean; message: string }> {
    return axios
      .post(
        IMPORT_DETAIL_URL,
        {
          materialProvider: +importDetails.materialProvider || +importDetails.materialProvider.id,
          import: importDetails.importReceipt.code,
          expectQuantity: +importDetails.expectQuantity,
        },
        { headers: this.headers },
      )
      .then(() => ({
        success: true,
        message: 'Thêm chi tiết phiếu nhập thành công!',
      }))
      .catch((err) => ({
        success: false,
        message: err.response?.data.message || 'Thêm chi tiết phiếu nhập thất bại!',
      }));
  }

  async getImportDetails(
    importCode: string,
  ): Promise<{ importDetails: ImportDetailType[]; success: boolean; message: string }> {
    return axios
      .get(IMPORT_URL + '/' + importCode + '/import-detail', { headers: this.headers })
      .then((res) => {
        return {
          importDetails: res.data.data.map((item: any) => ({
            key: item.id,
            id: item.id,
            materialProvider: item.materialProvider,
            importReceipt: item.import,
            expectQuantity: item.expectQuantity,
            actualQuantity: item.actualQuantity,
            warehouseNote: item.warehouseNote,
            qaNote: item.qaNote,
          })),
          success: true,
          message: '',
        };
      })
      .catch((err) => ({ importDetails: [], success: false, message: err.response?.data.message || 'Thất bại' }));
  }

  async updateImportDetail(
    id: number,
    updateData:
      | {
          expectQuantity?: number;
          actualQuantity?: number;
          qaNote?: string;
        }
      | CreateImportDetailType,
    loginRole: string,
  ): Promise<{ success: boolean; message: string }> {
    if (loginRole === 'nhanVienTongCuc') {
      const data = updateData as CreateImportDetailType;

      return this.createImportDetails(data);
    }

    const roleLabelInApi = loginRole === 'nhanVienKho' ? '/warehouse-staff' : '/qa';

    return axios
      .patch(IMPORT_DETAIL_URL + '/' + id + roleLabelInApi, updateData, { headers: this.headers })
      .then(() => ({
        success: true,
        message: 'Cập nhật chi tiết phiếu nhập thành công!',
      }))
      .catch((err) => ({
        success: false,
        message: err.response?.data.message,
      }));
  }

  async deleteImportDetail(id: number): Promise<{ success: boolean; message: string }> {
    return axios
      .delete(IMPORT_DETAIL_URL + '/' + id, { headers: this.headers })
      .then(() => ({
        success: true,
        message: 'Xóa chi tiết phiếu nhập thành công!',
      }))
      .catch((err) => ({
        success: false,
        message: err.response?.data.message,
      }));
  }
}
