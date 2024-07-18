import axios from 'axios';

import { WAREHOUSE_MATERIAL_URL } from '@/config/api';
import { WarehouseType } from './warehouse-api';
import { MaterialProviderType } from './material-provider-api';

export type WarehouseMaterialType = {
  id: number;
  warehouse: WarehouseType;
  materialProvider: MaterialProviderType;
  quantity?: number;
};

export type ParamType = {
  warehouse?: number;
  page?: number;
};

export default class WarehouseMaterialApi {
  constructor(private readonly access_token: string) {}

  private readonly headers = {
    Authorization: 'Bearer ' + this.access_token,
  };

  async getWarehouseMaterialList(
    filters?: ParamType,
  ): Promise<{ warehouseMaterial: WarehouseMaterialType[]; success: boolean; message: string; total: number }> {
    const paramsObject: ParamType = {};

    if (filters?.warehouse) {
      paramsObject.warehouse = filters.warehouse;
    }

    return axios
      .get(WAREHOUSE_MATERIAL_URL, { headers: this.headers, params: paramsObject })
      .then((res) => ({
        warehouseMaterial: res.data.data?.map((item: WarehouseMaterialType) => ({
          id: item.id,
          warehouse: item.warehouse,
          materialProvider: item.materialProvider,
          quantity: item.quantity,
        })),
        success: true,
        message: '',
        total: res.data.total,
      }))
      .catch((err) => ({
        warehouseMaterial: [],
        success: false,
        message: err.response?.data.message,
        total: 0,
      }));
  }
}
