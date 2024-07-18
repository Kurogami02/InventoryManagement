import axios from 'axios';

import { AUTH_URL } from '@/config/api';

export default class AuthApi {
  private email: string = '';
  private password: string = '';

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }

  async auth(): Promise<{ access_token: string; message: string }> {
    return axios
      .post(AUTH_URL, {
        email: this.email,
        password: this.password,
      })
      .then((res) => ({
        access_token: res.data?.access_token,
        message: 'Đăng nhập thành công',
      }))
      .catch((err) => ({
        access_token: '',
        message: 'Tài khoản hoặc mật khẩu không chính xác',
      }));
  }
}
