export class UserResponseDto {
  id: number = 0;
  email: string = "";
  verified: boolean = false;
  firstName: string = "";
  lastName: string = "";
  contactNumber: string = "";

  disabled: boolean | null = null;
  super: boolean | null = null;
  roleId: number | null = null;
  menuTemplateId: number | null = null;
  roleName: string | null = null;
  menuTemplateName: string | null = null;
}

export class UpdateUserRequestDto {
  disabled?: boolean | null;
  super?: boolean | null;
  firstName?: string | null;
  lastName?: string | null;
  contactNumber?: string | null;
  roleId?: number | null;
  menuTemplateId?: number | null;
}

export class UpdateUserResponseDto {
  id: number = 0;
  firstName: string = "";
  lastName: string = "";
  contactNumber: string = "";
  disabled: boolean | null = null;
  super: boolean | null = null;
}
