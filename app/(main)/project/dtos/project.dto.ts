// For listing projects (Response)
export class ProjectResponseDto {
  id: number = 0;
  name: string = "";
  description: string = "";
}

// For creating a project (Request)
export class ProjectCreateRequestDto {
  name: string = "";
  description: string = "";
  orgId: number = 0;
}

// For creating a project (Response)
export class ProjectCreateResponseDto {
  id: number = 0;
  name: string = "";
  description?: string = "";
}

export class ProjectAssignUserRequestDto {
  userId: number = 0;
}

export class ProjectAssignUserResponseDto {
  projectId: number = 0;
  userId: number = 0;
  message: string = "";
}

export class ProjectRemoveUserResponseDto {
  message: string = "";
}
