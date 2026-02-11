import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { ErrorResponseDto } from "./error-response.dto";
import { ApiErrorDto } from "@/app/network/api-error.dto";
import { CookieServiceImp } from "@/app/utils/cookie/CookieServiceImp";

// Define response shape for the refresh call
interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

// --- State for Refresh Logic ---
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// --- 1. Request Interceptor (Email Header) ---
api.interceptors.request.use(
  (config) => {
    if (typeof document !== "undefined") {
      const cookieService = new CookieServiceImp();
      const loginInfo = cookieService.getJwtLoginInfo();
      const accessToken = cookieService.getCookie("access-token");

      if (loginInfo && loginInfo.sub && accessToken) {
        config.headers["email"] = loginInfo.sub;
        config.headers["authorization"] = "Bearer " + accessToken;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// --- 2. Response Interceptor (Error Handling & Refresh) ---
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // ---------------------------------------------------
    // PART A: Refresh Token Logic
    // ---------------------------------------------------
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (typeof document === "undefined") {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const cookieService = new CookieServiceImp();
      const currentRefreshToken = cookieService.getCookie("refresh-token");

      if (!currentRefreshToken) {
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const response = await axios.post<RefreshResponse>(
          `${baseURL}/auth/refresh`,
          { refreshToken: currentRefreshToken },
          { withCredentials: true },
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        cookieService.setCookie("access-token", accessToken, 1);
        cookieService.setCookie("refresh-token", newRefreshToken, 1);

        processQueue(null, accessToken);

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        cookieService.deleteCookie("access-token");
        cookieService.deleteCookie("refresh-token");
        window.location.href = "/login";

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ---------------------------------------------------
    // PART B: Error Mapping (Fixed Types)
    // ---------------------------------------------------
    const errorResponseDto: ErrorResponseDto = new ErrorResponseDto();

    if (axios.isAxiosError(error) && error.response) {
      // 1. Cast to 'any' to safely access dynamic properties
      const errorData = error.response.data as any;
      const status = error.response.status;

      // 2. Check if 'detail' is a simple string
      if (errorData && typeof errorData.detail === "string") {
        errorResponseDto.message = errorData.detail;
        errorResponseDto.status = status;
      }
      // 3. Check if 'detail' is an Array AND has items (CORRECTED LOGIC)
      else if (
        errorData &&
        Array.isArray(errorData.detail) &&
        errorData.detail.length > 0 // Ensure it's not empty
      ) {
        const apiErrorDto: ApiErrorDto = errorData.detail[0] as ApiErrorDto;
        errorResponseDto.message = apiErrorDto.msg;
        errorResponseDto.status = status;
      }
      // 4. Fallback for other error formats
      else {
        errorResponseDto.message = error.message;
        errorResponseDto.status = status;
      }
    } else {
      errorResponseDto.message = error.message;
      errorResponseDto.status = (error as any)?.status || 500;
    }

    return Promise.reject(errorResponseDto);
  },
);

export default api;
