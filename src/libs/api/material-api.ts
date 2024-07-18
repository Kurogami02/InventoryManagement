import axios from 'axios';

import { MATERIAL_URL } from '@/config/api';
import { SelectOptionDataType } from '@/app/components/SelectDropdown';

export type MaterialType = {
  name: string;
  code: string;
  quantity?: number;
};

export default class MaterialApi {
  constructor(private readonly access_token: string) {}

  private readonly headers = {
    Authorization: 'Bearer ' + this.access_token,
  };

  async createMaterial(material: MaterialType): Promise<{ success: boolean; message: string }> {
    return axios
      .post(
        MATERIAL_URL,
        { name: material.name, code: material.code, quantity: material.quantity },
        { headers: this.headers },
      )
      .then((res) => ({
        success: true,
        message: 'Tạo nguyên vật liệu ' + res.data.name + ' thành công!',
      }))
      .catch((err) => ({
        success: false,
        message: err.response?.data.message,
      }));
  }

  async getMaterial(material_id: number): Promise<{ material: MaterialType; success: boolean; message: string }> {
    return axios
      .get(MATERIAL_URL + '/' + material_id, { headers: this.headers })
      .then((res) => ({
        material: {
          id: res.data.id,
          name: res.data.name,
          code: res.data.code,
          quantity: res.data.quantity,
        },
        success: true,
        message: '',
      }))
      .catch((err) => ({
        material: { id: -1, name: '', code: '', quantity: 0 },
        success: false,
        message: err.response?.data.message,
      }));
  }

  async getMaterialList(filters?: {
    codeOrName?: string;
    page?: number;
  }): Promise<{ materials: MaterialType[]; success: boolean; message: string; total: number }> {
    type ParamType = {
      codeOrName?: string;
      page?: number;
    };

    const paramsObject: ParamType = {};

    if (filters?.codeOrName) {
      paramsObject.codeOrName = filters.codeOrName;
    }

    if (filters?.page) {
      paramsObject.page = filters.page;
    }

    return axios
      .get(MATERIAL_URL, { headers: this.headers, params: paramsObject })
      .then((res) => ({
        materials: res.data.data?.map((item: MaterialType) => ({
          name: item.name,
          code: item.code,
          quantity: item.quantity,
        })),
        success: true,
        message: '',
        total: res.data.total,
      }))
      .catch((err) => ({
        materials: [],
        success: false,
        message: err.response?.data.message,
        total: 0,
      }));
  }

  async getAllMaterials(codeOrName?: string): Promise<{
    materials: SelectOptionDataType[];
    success: boolean;
    message: string;
    total: number;
  }> {
    return axios
      .get(MATERIAL_URL, { headers: this.headers, params: { codeOrName } || {} })
      .then((res) => ({
        materials: res.data.data.map((item: MaterialType) => ({ value: item.code, label: item.code })),
        success: true,
        message: '',
        total: res.data.total,
      }))
      .catch((err) => ({
        materials: [],
        success: false,
        message: err.response?.data.message,
        total: 0,
      }));
  }

  async updateMaterial(
    material: MaterialType,
    update_data: { name?: string; code?: string },
  ): Promise<{ success: boolean; message: string }> {
    if (update_data.name === material.name && update_data.code === material.code) {
      return { success: true, message: 'Thông tin nguyên vật liệu được giữ nguyên!' };
    }

    if (update_data.code === material.code) {
      return axios
        .patch(MATERIAL_URL + '/' + material.code, { name: update_data.name }, { headers: this.headers })
        .then(() => ({
          success: true,
          message: 'Cập nhật thành công',
        }))
        .catch((err) => ({
          success: false,
          message: err.response?.data.message,
        }));
    }

    return axios
      .patch(MATERIAL_URL + '/' + material.code, update_data, { headers: this.headers })
      .then(() => ({
        success: true,
        message: 'Cập nhật thành công',
      }))
      .catch((err) => ({
        success: false,
        message: err.response?.data.message,
      }));
  }

  async deleteMaterial(material_code: string): Promise<{ success: boolean; message: string }> {
    return axios
      .delete(MATERIAL_URL + '/' + material_code, { headers: this.headers })
      .then(() => ({
        success: true,
        message: 'Xóa nguyên vật liệu thành công',
      }))
      .catch((err) => ({
        success: false,
        message: err.response?.data.message,
      }));
  }
}
