import { JwtLoginInfoDto } from "./dtos/jwt-login-info.dto";

export interface CookieService {
  setCookie: (name: string, value: string, expiredDays: number) => boolean;
  getCookie: (name: string) => string | null;
  deleteCookie: (name: string) => boolean;
  getJwtLoginInfo: () => JwtLoginInfoDto | null;
}

export const CookieServiceToken = Symbol("CookieService");
