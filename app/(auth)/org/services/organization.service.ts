import { ErrorResponseDto } from "@/app/network/error-response.dto";
import { OrgCreateRequestDto } from "../dtos/org-create-request.dto";
import { OrgCreateResponseDto } from "../dtos/org-create-response.dto";
import { OrgSearchResDto } from "../dtos/org-search-res.dto";

export interface OrganizationService {
  createOrganization: (
    req: OrgCreateRequestDto
  ) => Promise<OrgCreateResponseDto | ErrorResponseDto>;

  searchOrganizations: (
    query: string
  ) => Promise<OrgSearchResDto[] | ErrorResponseDto>;
}

export const OrganizationServiceToken = Symbol("OrganizationService");
