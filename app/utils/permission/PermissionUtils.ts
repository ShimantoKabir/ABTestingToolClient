import { RoleResponseDto } from "@/app/(main)/role/dtos/role-response.dto";
import { Toast } from "primereact/toast";

export class PermissionUtils {
  /**
   * Check if a user can be modified (edited/deleted)
   * Super users cannot be modified
   */
  static canModifyUser = (
    isSuper: boolean | null,
    toast?: React.RefObject<Toast | null>,
  ): boolean => {
    if (isSuper && toast) {
      toast.current?.show({
        severity: "warn",
        summary: "Warning",
        detail: "Cannot modify super user!",
      });

      return false;
    }
    return true;
  };

  /**
   * Check if a user's projects can be modified
   * Super users' projects cannot be modified
   */
  static canModifyUserProjects = (
    isSuper: boolean | null,
    toast?: React.RefObject<Toast | null>,
  ): boolean => {
    if (isSuper && toast) {
      toast.current?.show({
        severity: "warn",
        summary: "Warning",
        detail: "Cannot modify super user projects!",
      });

      return false;
    }
    return true;
  };

  /**
   * Check if a role can be modified
   * Prevents modification of system roles like 'Super Admin' and 'Admin'
   */
  static canModifyRole = (
    role: RoleResponseDto,
    toast?: React.RefObject<Toast> | null,
  ): boolean => {
    try {
      // Prevent modification of system roles
      const systemRoles = ["Admin"];
      const isSystemRole = systemRoles.includes(role.name);

      if (isSystemRole && toast) {
        toast.current?.show({
          severity: "warn",
          summary: "Warning",
          detail: "Cannot modify system roles!",
        });

        return false;
      }

      return true;
    } catch (error) {
      console.error("Permission check error:", error);
      return false;
    }
  };

  /**
   * Check if a menu template can be modified
   * Prevents modification of system menu templates
   */
  static canModifyMenuTemplate = (
    menuTemplate: any,
    toast?: React.RefObject<Toast> | null,
  ): boolean => {
    try {
      console.log("Checking permissions for menu template!");
      // Prevent modification of system menu templates
      const systemTemplates = ["Admin Menu Template"];
      const isSystemTemplate = systemTemplates.includes(menuTemplate.name);

      if (isSystemTemplate && toast) {
        toast.current?.show({
          severity: "warn",
          summary: "Warning",
          detail: "Cannot modify system menu templates!",
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error("Permission check error:", error);
      return false;
    }
  };
}
