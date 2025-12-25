import api from "@/app/network/interceptor";
import { MenuService } from "./menu.service";
import { ErrorResponseDto } from "@/app/network/error-response.dto";
import { TreeNode } from "primereact/treenode";
import { container } from "@/app/di"; // Import container
import {
  CookieService,
  CookieServiceToken,
} from "@/app/utils/cookie/CookieService"; // Import CookieService

const MENU_FETCH_DELAY = 2000; // 2 seconds delay for demo purposes

export class MenuServiceImp implements MenuService {
  // 1. Inject CookieService using Service Locator pattern
  private cookieService = container.get<CookieService>(CookieServiceToken);

  getMenuTree = async (): Promise<TreeNode[] | ErrorResponseDto> => {
    try {
      // 2. Get Login Info from CookieService
      const loginInfo = this.cookieService.getJwtLoginInfo();

      if (!loginInfo) {
        return new ErrorResponseDto("User is not authenticated", 401);
      }

      // 3. Extract Data
      const userId = loginInfo.userId;
      const email = loginInfo.sub;

      // Logic: Use the first organization by default.
      // (You can expand this later to support an 'activeOrgId' if needed)
      const orgId = loginInfo.activeOrg ? loginInfo.activeOrg.id : 0;

      if (orgId === 0) {
        return new ErrorResponseDto("No organization assigned to user", 400);
      }

      // 4. Call API with extracted data
      const response = await api.get<TreeNode[]>("/menu-templates/tree", {
        params: {
          userId: userId,
          orgId: orgId,
        },
      });

      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };

  getMenuJson = async (): Promise<TreeNode[] | ErrorResponseDto> => {
    try {
      const response = await api.get<TreeNode[]>("/static/menu.json");

      // Add delay to see loader (remove in production)
      // await new Promise((resolve) => setTimeout(resolve, MENU_FETCH_DELAY));

      return response.data;
    } catch (error) {
      return new ErrorResponseDto("Error fetching menu", 500);
    }
  };
}
