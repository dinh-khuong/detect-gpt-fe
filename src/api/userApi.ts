import axios, { type AxiosResponse } from "axios";

const appUrl = import.meta.env.VITE_BE_URL
const axiosClient = axios.create({
  baseURL: appUrl + "api/",
  headers: {
    "Content-Type": "application/json",
  },
});


axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  config.headers["accept"] = "application/json";
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 3. Response Interceptor: Handle expiration
axiosClient.interceptors.response.use(
  (response) => response, // Pass through successful responses
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and we haven't tried refreshing yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        // Call your refresh endpoint
        const res = await axios.post(appUrl + "auth/refresh", {
          refresh: refreshToken
        })

        if (res.status === 200) {
          const { access } = res.data;
          
          // Save the new token
          localStorage.setItem('access_token', access);
          
          // Update the header and retry the original request
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return axiosClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token is also invalid/expired -> Log user out
        console.error("Session expired. Please log in again.");
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface DetechAI {
  'fast-gpt': number;
}

const userApi = {
  getMe(): Promise<AxiosResponse<User>> {
    const url = 'me/'

    return axiosClient.get(url)
  },
  refreshToken() {
    const url = 'auth/refresh/'
    return axiosClient.get(url)
  },
  detectAI(text: string): Promise<AxiosResponse<DetechAI>> {
    const url = 'detect-ai/'
    return axiosClient.post(url, { text })
  }
}

export default userApi;
