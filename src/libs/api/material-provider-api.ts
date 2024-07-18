import axios from 'axios';

import { MATERIAL_PROVIDER_URL } from '@/config/api';
import { MaterialType } from './material-api';
import { ProviderType } from './provider-api';

export type MaterialProviderType = {
  id: number;
  quantity?: number;
  material: MaterialType;
  provider: ProviderType;
  unit: string;
};

export type CreateMaterialProviderType = {
  material: string;
  provider: number;
  unit: string;
};

export default class MaterialProviderApi {
  constructor(private readonly access_token: string) {}

  private readonly headers = {
    Authorization: 'Bearer ' + this.access_token,
  };

  async createMaterialProvider(
    materialProvider: CreateMaterialProviderType,
  ): Promise<{ success: boolean; message: string }> {
    return axios
      .post(MATERIAL_PROVIDER_URL, materialProvider, { headers: this.headers })
      .then((res) => ({
        success: true,
        message: 'Thêm mới thành công!',
      }))
      .catch((err) => ({
        success: false,
        message: err.response?.data.message,
      }));
  }

  async getMaterialProvider(
    materialProvider_id: number,
  ): Promise<{ materialProvider?: MaterialProviderType; success: boolean; message: string }> {
    return axios
      .get(MATERIAL_PROVIDER_URL + '/' + materialProvider_id, { headers: this.headers })
      .then((res) => ({
        materialProvider: {
          id: res.data.id,
          quantity: res.data.quantity,
          provider: res.data.provider,
          material: res.data.material,
          unit: res.data.unit,
        },
        success: true,
        message: '',
      }))
      .catch((err) => ({
        success: false,
        message: err.response?.data.message,
      }));
  }

  async getMaterialProviderList(filters?: {
    provider?: number;
    material?: string;
    page?: number;
  }): Promise<{ materialProviders: MaterialProviderType[]; success: boolean; message: string; total: number }> {
    type ParamType = {
      provider?: number;
      material?: string;
      page?: number;
    };

    const paramsObject: ParamType = {};

    if (filters?.provider) {
      paramsObject.provider = filters.provider;
    }

    if (filters?.material) {
      paramsObject.material = filters.material;
    }

    return axios
      .get(MATERIAL_PROVIDER_URL, { headers: this.headers, params: paramsObject })
      .then((res) => ({
        materialProviders: res.data.data?.map((item: MaterialProviderType) => ({
          id: item.id,
          quantity: item.quantity,
          provider: item.provider,
          material: item.material,
          unit: item.unit,
        })),
        success: true,
        message: '',
        total: res.data.total,
      }))
      .catch((err) => ({
        materialProviders: [],
        success: false,
        message: err.response?.data.message,
        total: 0,
      }));
  }

  async updateMaterialProvider(
    materialProvider: MaterialProviderType,
    update_data: { material?: string; provider?: number; unit?: string },
  ): Promise<{ success: boolean; message: string }> {
    if (
      update_data.material == materialProvider.material.code &&
      update_data.provider == materialProvider.provider.id &&
      update_data.unit == materialProvider.unit
    ) {
      return { success: true, message: 'Thông tin được giữ nguyên!' };
    }

    return axios
      .patch(MATERIAL_PROVIDER_URL + '/' + materialProvider.id, update_data, { headers: this.headers })
      .then(() => ({
        success: true,
        message: 'Cập nhật thành công',
      }))
      .catch((err) => ({
        success: false,
        message: err.response?.data.message,
      }));
  }

  async deleteMaterialProvider(materialProvider_id: number): Promise<{ success: boolean; message: string }> {
    return axios
      .delete(MATERIAL_PROVIDER_URL + '/' + materialProvider_id, { headers: this.headers })
      .then(() => ({
        success: true,
        message: 'Xóa bản ghi thành công',
      }))
      .catch((err) => ({
        success: false,
        message: err.response?.data.message,
      }));
  }
}
