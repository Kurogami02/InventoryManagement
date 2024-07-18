import axios from 'axios';

import { PRODUCTION_UNIT_URL } from '@/config/api';
import { SelectOptionDataType } from '@/app/components/SelectDropdown';

export type ProductionUnitType = {
  id: number;
  name: string;
  address: string;
  phone: string;
};

export default class ProductionUnitApi {
  constructor(private readonly access_token: string) {}

  private readonly headers = {
    Authorization: 'Bearer ' + this.access_token,
  };

  async createProductionUnit(production_unit: ProductionUnitType): Promise<{ success: boolean; message: string }> {
    return axios
      .post(
        PRODUCTION_UNIT_URL,
        { name: production_unit.name, address: production_unit.address, phone: production_unit.phone },
        { headers: this.headers },
      )
      .then((res) => ({
        success: true,
        message: 'Tạo đơn vị sản xuất ' + res.data.name + ' thành công!',
      }))
      .catch((err) => ({
        success: false,
        message: err.response?.data.message,
      }));
  }

  async getProductionUnit(
    production_unit_id: number,
  ): Promise<{ production_unit: ProductionUnitType; success: boolean; message: string }> {
    return axios
      .get(PRODUCTION_UNIT_URL + '/' + production_unit_id, { headers: this.headers })
      .then((res) => ({
        production_unit: {
          id: res.data.id,
          name: res.data.name,
          address: res.data.address,
          phone: res.data.phone,
        },
        success: true,
        message: '',
      }))
      .catch((err) => ({
        production_unit: { id: -1, name: '', address: '', phone: '' },
        success: false,
        message: err.response?.data.message,
      }));
  }

  async getProductionUnitList(filters?: {
    search_name?: string;
    page?: number;
  }): Promise<{ production_units: ProductionUnitType[]; success: boolean; message: string; total: number }> {
    type ParamType = {
      codeOrName?: string;
      page?: number;
    };

    const paramsObject: ParamType = {};

    if (filters?.search_name) {
      paramsObject.codeOrName = filters.search_name;
    }

    if (filters?.page) {
      paramsObject.page = filters.page;
    }

    return axios
      .get(PRODUCTION_UNIT_URL, { headers: this.headers, params: paramsObject })
      .then((res) => ({
        production_units: res.data.data?.map((item: ProductionUnitType) => ({
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
        production_units: [],
        success: false,
        message: err.response?.data.message,
        total: 0,
      }));
  }

  async getAllProductionUnits(): Promise<{
    productionUnits: SelectOptionDataType[];
    success: boolean;
    message: string;
    total: number;
  }> {
    return axios
      .get(PRODUCTION_UNIT_URL, { headers: this.headers })
      .then((res) => ({
        productionUnits: res.data.data.map((item: any) => ({ value: item.id, label: item.name })),
        success: true,
        message: '',
        total: res.data.total,
      }))
      .catch((err) => ({
        productionUnits: [],
        success: false,
        message: err.response?.data.message,
        total: 0,
      }));
  }

  async updateProductionUnit(
    production_unit: ProductionUnitType,
    update_data: { name?: string; address?: string; phone?: string },
  ): Promise<{ success: boolean; message: string }> {
    if (
      update_data.name === production_unit.name &&
      update_data.address === production_unit.address &&
      update_data.phone === production_unit.phone
    ) {
      return { success: true, message: 'Thông tin đơn vị sản xuất được giữ nguyên!' };
    }

    return axios
      .patch(PRODUCTION_UNIT_URL + '/' + production_unit.id, update_data, { headers: this.headers })
      .then(() => ({
        success: true,
        message: 'Cập nhật thành công',
      }))
      .catch((err) => ({
        success: false,
        message: err.response?.data.message,
      }));
  }

  async deleteProductionUnit(production_unit_id: number): Promise<{ success: boolean; message: string }> {
    return axios
      .delete(PRODUCTION_UNIT_URL + '/' + production_unit_id, { headers: this.headers })
      .then(() => ({
        success: true,
        message: 'Xóa đơn vị sản xuất thành công',
      }))
      .catch((err) => ({
        success: false,
        message: err.response?.data.message,
      }));
  }
}
