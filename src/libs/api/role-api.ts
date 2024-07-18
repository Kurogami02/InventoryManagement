import axios from 'axios';

import { ROLE_URL } from '@/config/api';
import { SelectOptionDataType } from '@/app/components/SelectDropdown';

export default class RoleApi {
  constructor(private readonly access_token: string) {}

  private readonly headers = {
    Authorization: 'Bearer ' + this.access_token,
  };

  async getAllRoles(): Promise<{ roles: SelectOptionDataType[]; success: boolean; message: string }> {
    return axios
      .get(ROLE_URL, { headers: this.headers })
      .then((res) => ({
        roles: res.data.map((item: any) => ({ value: item.id, label: item.name })),
        success: true,
        message: '',
      }))
      .catch((err) => ({
        roles: [],
        success: false,
        message: err.response.data.message,
      }));
  }
}
