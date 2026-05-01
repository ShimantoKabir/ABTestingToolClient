import { ErrorResponseDto } from "@/app/network/error-response.dto";
import { PaginationResponseDto } from "@/app/utils/dtos/pagination-response.dto";
import { ActivityLogResponseDto } from "../dtos/activity-log.dto";

export interface ActivityLogService {
  getActivityLogs: (
    page: number,
    rows: number
  ) => Promise<PaginationResponseDto<ActivityLogResponseDto> | ErrorResponseDto>;
}

export const ActivityLogServiceToken = Symbol("ActivityLogService");
