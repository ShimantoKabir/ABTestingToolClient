import { injectable } from "inversify";
import { jwtDecode } from "jwt-decode";
import { LoginRequestDto } from "../dtos/login-request.dto";
import { LoginResponseDto } from "../dtos/login-response.dto";
import { LoginService } from "./login.service";
import { ErrorResponseDto } from "@/app/network/error-response.dto";
import api from "@/app/network/interceptor";
import {
  CookieService,
  CookieServiceToken,
} from "@/app/utils/cookie/CookieService";
import { container } from "@/app/di";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  ACTIVE_ORG_POSITION_COOKIE,
  ACTIVE_PROJECT_POSITION_COOKIE,
} from "@/app/constants";
import { JwtLoginInfoDto } from "@/app/utils/cookie/dtos/jwt-login-info.dto";

@injectable()
export class LoginServiceImp implements LoginService {
  cookieService = container.get<CookieService>(CookieServiceToken);

  onLogin = async (
    loginRequestDto: LoginRequestDto
  ): Promise<LoginResponseDto | ErrorResponseDto> => {
    try {
      const response = await api.post<LoginResponseDto>(
        "/auth/login",
        loginRequestDto
      );

      // 1. Decode the token directly to check permissions
      const decoded = jwtDecode<JwtLoginInfoDto>(response.data.accessToken);

      // 2. Check if the user has ANY projects in ANY organization
      const hasAnyProjects = decoded.orgs?.some(
        (org) => org.projects && org.projects.length > 0
      );

      if (!hasAnyProjects) {
        return new ErrorResponseDto(
          "No project found in any organization!",
          403
        );
      }

      // 3. Determine the default Active Organization (First one with projects)
      let targetOrgIndex = 0;
      if (decoded.orgs) {
        const foundIndex = decoded.orgs.findIndex(
          (org) => org.projects && org.projects.length > 0
        );

        if (foundIndex !== -1) {
          targetOrgIndex = foundIndex;
        }
      }

      // 4. Set Cookies only if validation passed
      this.cookieService.setCookie(
        ACCESS_TOKEN_COOKIE,
        response.data.accessToken,
        1
      );
      this.cookieService.setCookie(
        REFRESH_TOKEN_COOKIE,
        response.data.refreshToken,
        1
      );
      this.cookieService.setCookie(
        ACTIVE_ORG_POSITION_COOKIE,
        targetOrgIndex.toString(),
        1
      );
      this.cookieService.setCookie(ACTIVE_PROJECT_POSITION_COOKIE, "0", 1);

      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };
}
