import axios, { type AxiosResponse } from "axios";

const appUrl = (import.meta.env.VITE_BE_URL || "/").replace(/\/?$/, "/")
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
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        // Call your refresh endpoint
        const res = await axios.post(appUrl + "api/auth/refresh/", {
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
        window.location.href = '/signin';
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
  api_key?: string;
  apiKey?: string;
  current_api_key?: string;
  key?: string;
  token?: string;
}

export interface ApiKeyResponse {
  api_key?: string;
  apiKey?: string;
  current_api_key?: string;
  key?: string;
  token?: string;
  apiKeyValue?: string;
  value?: string;
  user?: User;
  data?: ApiKeyResponse;
  results?: ApiKeyResponse[];
  created_at?: string;
  updated_at?: string;
}

export interface DetechAI {
  fast_gpt: number;
  polarity: number;
  subjectivity: number;
  sentence_std: number;
}

export type DetectMethodId = "prob_mean" | "fastgpt";

export interface DetectMethod {
  id: DetectMethodId;
  label: string;
  description: string;
  long_text: boolean;
  default: boolean;
  loaded: boolean;
}

export interface DetectMethodsResponse {
  default: DetectMethodId;
  methods: DetectMethod[];
  supported_files: string[];
  max_upload_mb: number;
}

export interface DocumentSource {
  filename: string;
  file_type: string;
  n_chars: number;
  n_words: number;
  n_pages?: number;
  n_slides?: number;
  n_sheets?: number;
  n_chapters?: number;
}

/** Đặc trưng văn bản của mô hình cũ (rỗng nếu mô hình hồi quy không dùng) */
export interface BaseFeatures {
  ttr?: number;
  punct?: number;
  sentence_std?: number;
  polarity?: number;
  subjectivity?: number;
  flesch?: number;
  gunning_fog?: number;
}

export interface ChunkResult {
  index: number;
  start: number;
  end: number;
  n_tokens: number;
  prob_mean: number;
  nll_mean: number;
  ppl: number;
  base: BaseFeatures;
  score: number;
  is_ai: boolean;
}

interface DetectCommon {
  score: number;
  source?: DocumentSource;
  text?: string;
}

export interface ProbMeanResult extends DetectCommon {
  method: "prob_mean";
  model: string;
  prob_mean: number;
  nll_mean: number;
  ppl: number;
  base: BaseFeatures;
  prob_std: number;
  /** chỉ có khi mô hình hồi quy dùng đúng 1 đặc trưng prob_mean */
  threshold: number | null;
  features: string[];
  cv_auc: number | null;
  n_tokens: number;
  n_chunks: number;
  ai_fraction: number;
  truncated: boolean;
  warnings: string[];
  chunks: ChunkResult[];
}

export interface FastGptResult extends DetectCommon, DetechAI {
  method: "fastgpt";
}

export type DetectResult = ProbMeanResult | FastGptResult;

const userApi = {
  getMe(): Promise<AxiosResponse<User>> {
    const url = 'auth/me/'

    return axiosClient.get(url)
  },
  getCurrentApiKey(): Promise<AxiosResponse<ApiKeyResponse | ApiKeyResponse[] | string>> {
    const url = 'api-key/'

    return axiosClient.get(url)
  },
  refreshToken() {
    const url = 'auth/refresh/'
    return axiosClient.get(url)
  },
  detectAI(text: string, method?: DetectMethodId): Promise<AxiosResponse<DetectResult>> {
    const url = 'detect-ai/'
    return axiosClient.post(url, { text, method })
  },
  detectAIFile(file: File, method?: DetectMethodId): Promise<AxiosResponse<DetectResult>> {
    const url = 'detect-ai/'
    const form = new FormData()
    form.append('file', file)
    if (method) form.append('method', method)
    // để trình duyệt tự đặt multipart boundary
    return axiosClient.post(url, form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  extractText(file: File): Promise<AxiosResponse<{ text: string; source: DocumentSource }>> {
    const form = new FormData()
    form.append('file', file)
    return axiosClient.post('extract-text/', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  getDetectMethods(): Promise<AxiosResponse<DetectMethodsResponse>> {
    return axiosClient.get('detect-ai/methods/')
  }
}

export default userApi;
