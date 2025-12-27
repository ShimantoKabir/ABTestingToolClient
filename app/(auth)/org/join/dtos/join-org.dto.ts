export class UserJoinOrgRequestDto {
  email: string = "";
  orgId: number = 0;
}

export class UserJoinOrgResponseDto {
  message: string = "";
  userId: number = 0;
  orgId: number = 0;
}
