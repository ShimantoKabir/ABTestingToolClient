import api from "@/app/network/interceptor";
import { MenuService } from "./menu.service";
import { ErrorResponseDto } from "@/app/network/error-response.dto";
import { TreeNode } from "primereact/treenode";

const MENU_FETCH_DELAY = 2000; // 2 seconds delay for demo purposes

export class MenuServiceImp implements MenuService {
  getMenuNodes = async (): Promise<TreeNode[] | ErrorResponseDto> => {
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
