import { ErrorResponseDto } from "@/app/network/error-response.dto";
import { TreeNode } from "primereact/treenode";

export interface MenuService {
  getMenuJson: () => Promise<TreeNode[] | ErrorResponseDto>;
  getMenuTree: () => Promise<TreeNode[] | ErrorResponseDto>;
}

export const MenuServiceToken = Symbol("MenuService");
