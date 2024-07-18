import axios from 'axios';
import { WarehouseType } from './warehouse-api';
import { TRANSFER_URL } from '@/config/api';

export type TransferType = {
  code: string;
  warehouseExport: WarehouseType;
  warehouseImport: WarehouseType;
  transferAt: Date;
  status: string;
};

export type CreateTransferType = {
  warehouseExport: number;
  warehouseImport: number;
  transferAt: Date;
};

export default class TransferApi {
  constructor(private readonly access_token: string) {}

  private readonly headers = {
    Authorization: 'Bearer ' + this.access_token,
  };

  async createTransfer(transfer: CreateTransferType): Promise<{ success: boolean; message: string }> {
    return axios
      .post(TRANSFER_URL, transfer, { headers: this.headers })
      .then(() => ({
        success: true,
        message: 'Tạo điều chuyển thành công',
      }))
      .catch((err) => ({
        success: false,
        message: err.response?.data.message || 'Tạo điều chuyển thất bại!',
      }));
  }

  async getTransfer(transferID: string): Promise<{ transfer: TransferType; success: boolean; message: string }> {
    return axios
      .get(TRANSFER_URL + '/' + transferID, { headers: this.headers })
      .then((res) => ({
        transfer: {
          key: res.data.key,
          code: res.data.code,
          warehouseExport: res.data.warehouseExport,
          warehouseImport: res.data.warehouseImport,
          transferAt: res.data.transferAt,
          status: res.data.status,
        },
        success: true,
        message: '',
      }))
      .catch((err) => ({
        transfer: {
          key: -1,
          code: '',
          warehouseExport: { id: -1, name: '', address: '' },
          warehouseImport: { id: -1, name: '', address: '' },
          transferAt: new Date(),
          status: '',
        },
        success: false,
        message: err.response?.data.message,
      }));
  }

  async getTransferList(filters?: {
    code?: string;
    page?: number;
    warehouseExport?: number;
    warehouseImport?: number;
    transferAt?: { from?: Date; to?: Date };
  }): Promise<{ transfers: TransferType[]; success: boolean; message: string; total: number }> {
    return axios
      .get(TRANSFER_URL, { headers: this.headers, params: filters })
      .then((res) => ({
        transfers: res.data.data,
        success: true,
        message: '',
        total: res.data.total,
      }))
      .catch(() => ({
        transfers: [],
        success: false,
        message: 'Người dùng không có quyền thực hiện tác vụ',
        total: 0,
      }));
  }

  async updateTransferStatus(
    transfer: TransferType,
    new_status: string,
  ): Promise<{ success: boolean; message: string }> {
    return axios
      .patch(TRANSFER_URL + '/' + transfer.code + '/status/' + new_status, {}, { headers: this.headers })
      .then(() => ({
        success: true,
        message: 'Cập nhật thành công',
      }))
      .catch((err) => ({
        success: false,
        message: err.response?.data.message,
      }));
  }

  async deleteTransfer(transfer_code: string): Promise<{ success: boolean; message: string }> {
    return axios
      .delete(TRANSFER_URL + '/' + transfer_code, { headers: this.headers })
      .then(() => ({
        success: true,
        message: 'Xóa điều chuyển thành công',
      }))
      .catch((err) => ({
        success: false,
        message: err.response?.data.message || 'Xóa điều chuyển thất bại! ',
      }));
  }
}
