import { TRANSFER_DETAIL_URL } from '@/config/api';
import { MaterialProviderType } from './material-provider-api';
import axios from 'axios';
import { TransferType } from './transfer-api';

export type TransferDetailType = {
  id: number;
  materialProvider: MaterialProviderType;
  transfer: TransferType;
  exportQuantity: number;
};

export type CreateTransferDetailType = {
  materialProvider: MaterialProviderType;
  transfer: TransferType;
  exportQuantity: number;
};

export default class TransferDetailApi {
  constructor(private readonly access_token: string) {}

  private readonly headers = {
    Authorization: 'Bearer ' + this.access_token,
  };

  async createTransferDetails(
    transferDetails: CreateTransferDetailType,
  ): Promise<{ success: boolean; message: string }> {
    return axios
      .post(
        TRANSFER_DETAIL_URL,
        {
          exportQuantity: transferDetails.exportQuantity,
          materialProvider: +transferDetails.materialProvider,
          transfer: transferDetails.transfer.code,
        },
        { headers: this.headers },
      )
      .then(() => ({
        success: true,
        message: 'Thêm chi tiết điều chuyển thành công!',
      }))
      .catch((err) => ({
        success: false,
        message: err.response?.data.message || 'Thêm chi tiết điều chuyển thất bại!',
      }));
  }

  async getTransferDetails(
    transfer_code: string,
  ): Promise<{ transferDetails: TransferDetailType[]; success: boolean; message: string }> {
    return axios
      .get(TRANSFER_DETAIL_URL, { headers: this.headers, params: { transfer: transfer_code } })
      .then((res) => {
        return {
          transferDetails: res.data.data.map((item: any) => ({
            key: item.id,
            id: item.id,
            materialProvider: item.materialProvider,
            exportQuantity: item.exportQuantity,
          })),
          success: true,
          message: '',
        };
      })
      .catch((err) => ({ transferDetails: [], success: false, message: err.response?.data.message || 'Thất bại' }));
  }

  async updateTransferDetail(
    id: number,
    updateData: {
      exportQuantity?: number;
    },
  ): Promise<{ success: boolean; message: string }> {
    return axios
      .patch(TRANSFER_DETAIL_URL + '/' + id, updateData, { headers: this.headers })
      .then(() => ({
        success: true,
        message: 'Cập nhật chi tiết điều chuyển thành công!',
      }))
      .catch((err) => ({
        success: false,
        message: err.response?.data.message || 'Cập nhật chi tiết điều chuyển thất bại!',
      }));
  }

  async deleteTransferDetail(id: number): Promise<{ success: boolean; message: string }> {
    return axios
      .delete(TRANSFER_DETAIL_URL + '/' + id, { headers: this.headers })
      .then(() => ({
        success: true,
        message: 'Xóa chi tiết điều chuyển thành công!',
      }))
      .catch((err) => ({
        success: false,
        message: err.response?.data.message || 'Xóa chi tiết điều chuyển thất bại!',
      }));
  }
}
