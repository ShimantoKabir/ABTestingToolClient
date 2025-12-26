// Response when fetching a list or single user
export class UserResponseDto {
  id: number = 0;
  email: string = "";
  firstName?: string = "";
  lastName?: string = "";

  // These fields are necessary to populate the Edit Modal
  roleId: number | null = null;
  roleName?: string = "";

  menuTemplateId: number | null = null;
  menuTemplateName?: string = "";

  verified: boolean = false;
  disabled: boolean = false;
  super: boolean = false;
}

// Request body for PATCH update
export class UpdateUserRequestDto {
  roleId: number | null = null;
  menuTemplateId: number | null = null;
  disabled: boolean = false;
}

export class UpdateUserResponseDto {
  success: boolean = true;
}
