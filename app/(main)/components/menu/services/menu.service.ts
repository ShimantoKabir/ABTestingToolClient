import { ErrorResponseDto } from "@/app/network/error-response.dto";
import { TreeNode } from "primereact/treenode";

export interface MenuService {
  getMenuNodes: () => Promise<TreeNode[] | ErrorResponseDto>;
}

export const MenuServiceToken = Symbol("MenuService");
