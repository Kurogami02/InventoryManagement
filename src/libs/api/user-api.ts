import axios from 'axios';

import { USER_URL } from '@/config/api';

export type UserType = {
  key?: React.Key;
  id: number;
  fullname: string;
  email: string;
  role: {
    id: string;
    name: string;
  };
  warehouse: {
    id: number;
    name: string;
  };
};

export type CreateUserType = {
  fullname: string;
  email: string;
  role: string;
  warehouse: number;
};

export type UpdateUserType = {
  id: number;
  fullname?: string;
  email?: string;
  role?: string;
  warehouse?: number;
};

export default class UserApi {
  constructor(private readonly access_token: string) {}

  private readonly headers = {
    Authorization: 'Bearer ' + this.access_token,
  };

  async createUser(user: CreateUserType): Promise<{ success: boolean; message: string }> {
    const payload = {
      fullname: user.fullname,
      email: user.email,
      role: user.role,
      warehouse: +user.warehouse,
      password: 'admin',
    };

    return axios
      .post(USER_URL, payload, { headers: this.headers })
      .then((res) => ({
        success: true,
        message: 'Tạo người dùng ' + res.data.fullname + ' thành công',
      }))
      .catch((err) => ({
        success: false,
        message: err.response.data.message,
      }));
  }

  async getUserProfile(): Promise<{ user: UserType; success: boolean; message: string }> {
    return axios
      .get(USER_URL + '/action/profile', { headers: this.headers })
      .then((res) => ({
        user: {
          id: res.data.id,
          fullname: res.data.fullname,
          email: res.data.email,
          role: res.data.role,
          warehouse: res.data.warehouse,
        },
        success: true,
        message: res.data.message,
      }))
      .catch((err) => {
        return {
          user: { id: -1, fullname: '', email: '', role: { id: '', name: '' }, warehouse: { id: -1, name: '' } },
          success: false,
          message: err.response?.data.message,
        };
      });
  }

  async getUserList(params?: {
    email_or_fullname?: string;
    page?: number;
    role?: string;
    warehouse?: number;
  }): Promise<{ users: UserType[]; success: boolean; message: string; total: number }> {
    type ParamType = {
      email_or_fullname?: string;
      page?: number;
      role?: string;
      warehouse?: number;
    };

    const paramsObject: ParamType = {};

    if (params?.email_or_fullname) {
      paramsObject.email_or_fullname = params?.email_or_fullname;
    }

    if (params?.page) {
      paramsObject.page = params.page;
    }

    if (params?.role) {
      paramsObject.role = params.role;
    }

    if (params?.warehouse) {
      paramsObject.warehouse = +params.warehouse;
    }

    return axios
      .get(USER_URL, {
        headers: this.headers,
        params: paramsObject,
      })
      .then((res) => ({
        users: res.data.data?.map((item: any) => ({
          id: item.id,
          fullname: item.fullname,
          email: item.email,
          role: item.role,
          warehouse: item.warehouse,
        })),
        success: true,
        message: '',
        total: res.data.total,
      }))
      .catch((err) => ({
        users: [],
        success: false,
        message: err.response.data.message,
        total: 0,
      }));
  }

  async changePassword(request_body: {
    current_password: string;
    new_password: string;
  }): Promise<{ success: boolean; message: string }> {
    return axios
      .patch(USER_URL + '/action/change-password', { request_body }, { headers: this.headers })
      .then(() => ({
        success: true,
        message: 'Đổi mật khẩu thành công',
      }))
      .catch((err) => ({
        success: false,
        message: err.response.data.message,
      }));
  }

  async updateUser(userUpdate: UpdateUserType): Promise<{ success: boolean; message: string }> {
    type UpdateBody = {
      fullname?: string;
      email?: string;
      role?: string;
      warehouse?: number;
    };

    const payload: UpdateBody = {};

    if (userUpdate.fullname) {
      payload.fullname = userUpdate.fullname;
    }

    if (userUpdate.email) {
      payload.email = userUpdate.email;
    }

    if (userUpdate.role) {
      payload.role = userUpdate.role;
    }

    if (userUpdate.warehouse) {
      payload.warehouse = +userUpdate.warehouse;
    }

    if (Object.keys(payload).length === 0) {
      return { success: true, message: 'Thông tin người dùng được giữ nguyên' };
    }

    return axios
      .patch(USER_URL + '/' + userUpdate.id, payload, { headers: this.headers })
      .then(() => ({
        success: true,
        message: 'Cập nhật thành công',
      }))
      .catch((err) => ({
        success: false,
        message: err.response.data.message,
      }));
  }

  async deleteUser(user_id: number): Promise<{ success: boolean; message: string }> {
    return axios
      .delete(USER_URL + '/' + user_id, { headers: this.headers })
      .then(() => ({
        success: true,
        message: 'Xóa người dùng thành công',
      }))
      .catch((err) => ({
        success: false,
        message: err.response.data.message,
      }));
  }
}
