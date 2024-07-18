import axios from 'axios';

import { WAREHOUSE_URL } from '@/config/api';
import { SelectOptionDataType } from '@/app/components/SelectDropdown';

export type WarehouseType = {
  id: number;
  name: string;
  address: string;
};

export default class WarehouseApi {
  constructor(private readonly access_token: string) {}

  private readonly headers = {
    Authorization: 'Bearer ' + this.access_token,
  };

  async createWarehouse(warehouse: WarehouseType): Promise<{ success: boolean; message: string }> {
    return axios
      .post(WAREHOUSE_URL, { name: warehouse.name, address: warehouse.address }, { headers: this.headers })
      .then((res) => ({
        success: true,
        message: 'Tạo kho nguyên vật liệu ' + res.data.name + ' thành công!',
      }))
      .catch((err) => ({
        success: false,
        message: err.response?.data.message,
      }));
  }

  async getWarehouse(warehouse_id: number): Promise<{ warehouse: WarehouseType; success: boolean; message: string }> {
    return axios
      .get(WAREHOUSE_URL + '/' + warehouse_id, { headers: this.headers })
      .then((res) => ({
        warehouse: {
          id: res.data.data.id,
          name: res.data.data.name,
          address: res.data.data.address,
        },
        success: true,
        message: '',
      }))
      .catch((err) => ({
        warehouse: { id: -1, name: '', address: '' },
        success: false,
        message: err.response?.data.message,
      }));
  }

  async getAllWarehouses(): Promise<{ warehouses: SelectOptionDataType[]; success: boolean; message: string }> {
    return axios
      .get(WAREHOUSE_URL, { headers: this.headers })
      .then((res) => ({
        warehouses: res.data.data.map((item: any) => ({ value: item.id, label: item.name })),
        success: true,
        message: '',
      }))
      .catch((err) => ({
        warehouses: [],
        success: false,
        message: err.response.data.message,
      }));
  }

  async getAllWarehousesExceptDepartment(): Promise<{
    warehouses: SelectOptionDataType[];
    success: boolean;
    message: string;
  }> {
    return axios
      .get(WAREHOUSE_URL, { headers: this.headers })
      .then((res) => ({
        warehouses: res.data.data
          .filter((item: any) => item.name !== 'Công ty TNHH Foobla')
          .map((item: any) => ({ value: item.id, label: item.name })),
        success: true,
        message: '',
      }))
      .catch((err) => ({
        warehouses: [],
        success: false,
        message: err.response.data.message,
      }));
  }

  async getWarehouseList(filters?: {
    name?: string;
    page?: number;
  }): Promise<{ warehouses: WarehouseType[]; success: boolean; message: string; total: number }> {
    type ParamType = {
      name?: string;
      page?: number;
    };

    const paramsObject: ParamType = {};

    if (filters?.name) {
      paramsObject.name = filters.name;
    }

    if (filters?.page) {
      paramsObject.page = filters.page;
    }

    return axios
      .get(WAREHOUSE_URL, { headers: this.headers, params: paramsObject })
      .then((res) => ({
        warehouses: res.data.data?.map((item: WarehouseType) => ({
          id: item.id,
          name: item.name,
          address: item.address,
        })),
        success: true,
        message: '',
        total: res.data.total,
      }))
      .catch((err) => ({
        warehouses: [],
        success: false,
        message: err.response?.data.message,
        total: 0,
      }));
  }

  async updateWarehouse(
    warehouse: WarehouseType,
    update_data: { name?: string; address?: string },
  ): Promise<{ success: boolean; message: string }> {
    if (update_data.name == warehouse.name && update_data.address == warehouse.address) {
      return { success: true, message: 'Thông tin kho nguyên vật liệu được giữ nguyên!' };
    }

    return axios
      .patch(WAREHOUSE_URL + '/' + warehouse.id, update_data, { headers: this.headers })
      .then(() => ({
        success: true,
        message: 'Cập nhật thành công',
      }))
      .catch((err) => ({
        success: false,
        message: err.response?.data.message,
      }));
  }

  async deleteWarehouse(warehouse_id: number): Promise<{ success: boolean; message: string }> {
    return axios
      .delete(WAREHOUSE_URL + '/' + warehouse_id, { headers: this.headers })
      .then(() => ({
        success: true,
        message: 'Xóa kho nguyên vật liệu thành công',
      }))
      .catch((err) => ({
        success: false,
        message: err.response?.data.message,
      }));
  }
}
