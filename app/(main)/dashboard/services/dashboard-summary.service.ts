import { ErrorResponseDto } from "@/app/network/error-response.dto";
import { DashboardSummaryDto } from "../dtos/dashboard-summary.dto";

export interface DashboardSummaryService {
  getDashboardSummary: () => Promise<DashboardSummaryDto | ErrorResponseDto>;
}

export const DashboardSummaryServiceToken = Symbol("DashboardSummaryService");
