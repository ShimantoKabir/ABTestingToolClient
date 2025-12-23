import "reflect-metadata";
import { injectable } from "inversify";
import api from "@/app/network/interceptor";
import { OrganizationService } from "./organization.service";
import { OrgCreateRequestDto } from "../dtos/org-create-request.dto";
import { OrgCreateResponseDto } from "../dtos/org-create-response.dto";
import { ErrorResponseDto } from "@/app/network/error-response.dto";
import { OrgSearchResDto } from "../dtos/org-search-res.dto";

@injectable()
export class OrganizationServiceImp implements OrganizationService {
  createOrganization = async (
    req: OrgCreateRequestDto
  ): Promise<OrgCreateResponseDto | ErrorResponseDto> => {
    try {
      const response = await api.post<OrgCreateResponseDto>(
        "/organizations",
        req
      );
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };

  searchOrganizations = async (
    query: string
  ): Promise<OrgSearchResDto[] | ErrorResponseDto> => {
    try {
      const response = await api.get<OrgSearchResDto[]>(
        "/organizations/search",
        {
          params: { q: query },
        }
      );
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };
}
