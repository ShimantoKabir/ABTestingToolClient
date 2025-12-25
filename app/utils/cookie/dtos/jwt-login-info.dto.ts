export class JwtOrgDto {
  id: number = 0;
  name: string = "";
  disabled: boolean = false;
}

export class JwtProjectDto {
  id: number = 0;
  name: string = "";
  disabled: boolean = false;
}

export class JwtLoginInfoDto {
  sub: string = "";
  userId: number = 0;
  orgs: JwtOrgDto[] = [];
  projects: JwtProjectDto[] = [];
  exp: number = 0;
  activeOrg: JwtOrgDto | null = null;
  activeProject: JwtProjectDto | null = null;
}
