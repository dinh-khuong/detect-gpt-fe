import axios, { type AxiosResponse } from "axios";

const appUrl = import.meta.env.VITE_BE_URL
const axiosAuth = axios.create({
  baseURL: appUrl + "api/auth/",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosAuth.interceptors.response.use(
  res => res,
  (error) => {
    return Promise.reject(error)
  }
)

const authApi = {
  async login(user: UserLogin): Promise<AxiosResponse<JwtTokens>> {
    const url = 'login/'
    const res: AxiosResponse<JwtTokens> = await axiosAuth.post(url, user);
    localStorage.setItem('access_token', res.data.access)
    localStorage.setItem('refresh_token', res.data.refresh)

    return res
  },
  async register(res: UserRegister) {
    const url = 'register/';
    const data = await axiosAuth.post(url, res)

    return data
  }
  // async refresh() {
  //   const url = 'refresh/';
  //   const refresh = localStorage.getItem('refresh_token')
  //   return axiosAuth.post(url, {
  //     refresh,
  //   })
  // }
};

export interface UserLogin {
  username: string;
  password: string;
}

export interface UserRegister {
  email: string;
  username: string;
  password: string;
}

export interface JwtTokens {
  access: string;
  refresh: string;
}

export default authApi;

