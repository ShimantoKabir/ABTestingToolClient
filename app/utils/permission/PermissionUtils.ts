import { Toast } from "primereact/toast";
import { container } from "@/app/di";
import { CookieService, CookieServiceToken } from "@/app/utils/cookie/CookieService";

export interface PermissionContext {
  toast?: React.RefObject<Toast>;
}

export interface UserWithPermissions {
  super?: boolean;
  id?: number;
  roleName?: string | null;
  [key: string]: any;
}

export class PermissionUtils {
  /**
   * Check if a user can be modified (edited/deleted)
   * Super users cannot be modified
   */
  static canModifyUser = (user: UserWithPermissions, toast?: React.RefObject<Toast> | null): boolean => {
    if (user.super) {
      if (toast) {
        toast.current?.show({
          severity: "warn",
          summary: "Warning",
          detail: "Cannot modify super user!",
        });
      }
      return false;
    }
    return true;
  };

  /**
   * Check if a user's projects can be modified
   * Super users' projects cannot be modified
   */
  static canModifyUserProjects = (user: UserWithPermissions, toast?: React.RefObject<Toast> | null): boolean => {
    if (user.super) {
      if (toast) {
        toast.current?.show({
          severity: "warn",
          summary: "Warning",
          detail: "Cannot modify super user projects!",
        });
      }
      return false;
    }
    return true;
  };

  /**
   * Check if a role can be modified
   * Prevents modification of system roles like 'Super Admin' and 'Admin'
   */
  static canModifyRole = (role: any, toast?: React.RefObject<Toast> | null): boolean => {
    try {
      // Prevent modification of system roles
      const systemRoles = ['Super Admin', 'Admin'];
      const isSystemRole = systemRoles.includes(role.name);

      if (isSystemRole) {
        if (toast) {
          toast.current?.show({
            severity: "warn",
            summary: "Warning",
            detail: "Cannot modify system roles!",
          });
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  };

  /**
   * Check if a project can be modified
   * You can add project-specific logic here if needed
   */
  static canModifyProject = (project: any, toast?: React.RefObject<Toast> | null): boolean => {
    // Add project-specific permission logic here if needed
    // For now, all projects can be modified unless they have specific restrictions
    return true;
  };

  /**
   * Check if a menu template can be modified
   * Prevents modification of system menu templates
   */
  static canModifyMenuTemplate = (menuTemplate: any, toast?: React.RefObject<Toast> | null): boolean => {
    try {
      // Prevent modification of system menu templates
      const systemTemplates = ['Default Admin', 'Super Admin', 'System Default'];
      const isSystemTemplate = systemTemplates.includes(menuTemplate.name);

      if (isSystemTemplate) {
        if (toast) {
          toast.current?.show({
            severity: "warn",
            summary: "Warning",
            detail: "Cannot modify system menu templates!",
          });
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  };

  /**
   * Generic permission check for any entity
   */
  static canModify = (
    entity: any,
    entityType: 'user' | 'role' | 'project' | 'menuTemplate',
    toast?: React.RefObject<Toast> | null
  ): boolean => {
    switch (entityType) {
      case 'user':
        return this.canModifyUser(entity, toast);
      case 'role':
        return this.canModifyRole(entity, toast);
      case 'project':
        return this.canModifyProject(entity, toast);
      case 'menuTemplate':
        return this.canModifyMenuTemplate(entity, toast);
      default:
        return true;
    }
  };

  /**
   * HOC wrapper for permission checks
   */
  static withPermissionCheck = <T extends any[]>(
    handler: (item: T[0]) => void,
    itemType: 'user' | 'role' | 'project' | 'menuTemplate',
    toast?: React.RefObject<Toast> | null
  ) => {
    return (item: T[0]) => {
      if (this.canModify(item, itemType, toast)) {
        handler(item);
      }
    };
  };
}