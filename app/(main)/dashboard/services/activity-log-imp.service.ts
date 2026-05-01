import { injectable } from "inversify";
import api from "@/app/network/interceptor";
import { ActivityLogService } from "./activity-log.service";
import { ErrorResponseDto } from "@/app/network/error-response.dto";
import { PaginationResponseDto } from "@/app/utils/dtos/pagination-response.dto";
import { ActivityLogResponseDto } from "../dtos/activity-log.dto";

@injectable()
export class ActivityLogServiceImp implements ActivityLogService {
  getActivityLogs = async (
    page: number,
    rows: number
  ): Promise<PaginationResponseDto<ActivityLogResponseDto> | ErrorResponseDto> => {
    try {
      const response = await api.post<
        PaginationResponseDto<ActivityLogResponseDto>
      >("/activity/all", { page, rows });
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };
}
