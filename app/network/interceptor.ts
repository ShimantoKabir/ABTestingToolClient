import axios from "axios";
import { ErrorResponseDto } from "./error-response.dto";
import { ApiErrorDto } from "@/app/network/api-error.dto";

const baseURL = "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorResponseDto: ErrorResponseDto = new ErrorResponseDto();

    if (axios.isAxiosError(error)) {
      if (error.response && typeof error.response.data.detail === "string") {
        errorResponseDto.message = error.response.data.detail;
        errorResponseDto.status = error.status;
      } else if (
        error.response &&
        typeof Array.isArray(error.response.data.detail)
      ) {
        const apiErrorDto: ApiErrorDto = error.response.data
          .detail[0] as ApiErrorDto;

        errorResponseDto.message = apiErrorDto.msg;
        errorResponseDto.status = error.status;
      } else {
        errorResponseDto.message = error.message;
        errorResponseDto.status = error.status;
      }
    } else {
      errorResponseDto.message = error.message;
      errorResponseDto.status = error.status;
    }

    return Promise.reject(errorResponseDto);
  }
);

export default api;
