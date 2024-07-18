import axios from 'axios';

import { PROVIDER_URL } from '@/config/api';
import { SelectOptionDataType } from '@/app/components/SelectDropdown';

export type ProviderType = {
  id: number;
  name: string;
  address: string;
  phone: string;
};

export default class ProviderApi {
  constructor(private readonly access_token: string) {}

  private readonly headers = {
    Authorization: 'Bearer ' + this.access_token,
  };

  async createProvider(provider: ProviderType): Promise<{ success: boolean; message: string }> {
    return axios
      .post(
        PROVIDER_URL,
        { name: provider.name, address: provider.address, phone: provider.phone },
        { headers: this.headers },
      )
      .then((res) => ({
        success: true,
        message: 'Tạo nhà cung cấp ' + res.data.name + ' thành công!',
      }))
      .catch((err) => ({
        success: false,
        message: err.response?.data.message,
      }));
  }

  async getProvider(provider_id: number): Promise<{ provider: ProviderType; success: boolean; message: string }> {
    return axios
      .get(PROVIDER_URL + '/' + provider_id, { headers: this.headers })
      .then((res) => ({
        provider: {
          id: res.data.id,
          name: res.data.name,
          address: res.data.address,
          phone: res.data.phone,
        },
        success: true,
        message: '',
      }))
      .catch((err) => ({
        provider: { id: -1, name: '', address: '', phone: '' },
        success: false,
        message: err.response?.data.message,
      }));
  }

  async getProviderList(filters?: {
    search_name?: string;
    page?: number;
  }): Promise<{ providers: ProviderType[]; success: boolean; message: string; total: number }> {
    type ParamType = {
      name?: string;
      page?: number;
    };

    const paramsObject: ParamType = {};

    if (filters?.search_name) {
      paramsObject.name = filters.search_name;
    }

    if (filters?.page) {
      paramsObject.page = filters.page;
    }

    return axios
      .get(PROVIDER_URL, { headers: this.headers, params: paramsObject })
      .then((res) => ({
        providers: res.data.data?.map((item: ProviderType) => ({
          id: item.id,
          name: item.name,
          address: item.address,
          phone: item.phone,
        })),
        success: true,
        message: '',
        total: res.data.total,
      }))
      .catch((err) => ({
        providers: [],
        success: false,
        message: err.response?.data.message,
        total: 0,
      }));
  }

  async getAllProviders(): Promise<{
    providers: SelectOptionDataType[];
    success: boolean;
    message: string;
    total: number;
  }> {
    return axios
      .get(PROVIDER_URL, { headers: this.headers })
      .then((res) => ({
        providers: res.data.data.map((item: any) => ({ value: item.id, label: item.name })),
        success: true,
        message: '',
        total: res.data.total,
      }))
      .catch((err) => ({
        providers: [],
        success: false,
        message: err.response?.data.message,
        total: 0,
      }));
  }

  async updateProvider(
    provider: ProviderType,
    update_data: { name?: string; address?: string; phone?: string },
  ): Promise<{ success: boolean; message: string }> {
    if (
      update_data.name == provider.name &&
      update_data.address == provider.address &&
      update_data.phone == provider.phone
    ) {
      return { success: true, message: 'Thông tin nhà cung cấp được giữ nguyên!' };
    }

    return axios
      .patch(PROVIDER_URL + '/' + provider.id, update_data, { headers: this.headers })
      .then(() => ({
        success: true,
        message: 'Cập nhật thành công',
      }))
      .catch((err) => ({
        success: false,
        message: err.response?.data.message,
      }));
  }

  async deleteProvider(provider_id: number): Promise<{ success: boolean; message: string }> {
    return axios
      .delete(PROVIDER_URL + '/' + provider_id, { headers: this.headers })
      .then(() => ({
        success: true,
        message: 'Xóa nhà cung cấp thành công',
      }))
      .catch((err) => ({
        success: false,
        message: err.response?.data.message,
      }));
  }
}
