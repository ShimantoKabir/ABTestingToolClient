import { injectable } from "inversify";
import api from "@/app/network/interceptor";
import { DashboardSummaryService } from "./dashboard-summary.service";
import { DashboardSummaryDto } from "../dtos/dashboard-summary.dto";
import { ErrorResponseDto } from "@/app/network/error-response.dto";
import { container } from "@/app/di";
import {
  CookieService,
  CookieServiceToken,
} from "@/app/utils/cookie/CookieService";

@injectable()
export class DashboardSummaryServiceImp implements DashboardSummaryService {
  private cookieService = container.get<CookieService>(CookieServiceToken);

  getDashboardSummary = async (): Promise<
    DashboardSummaryDto | ErrorResponseDto
  > => {
    try {
      const loginInfo = this.cookieService.getJwtLoginInfo();
      const projectId = loginInfo?.activeProject?.id || 0;

      const response = await api.get<DashboardSummaryDto>(
        "/dashboard/summary",
        { params: { projectId } }
      );
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };
}
