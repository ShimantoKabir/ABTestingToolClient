import { LoginServiceImp } from "@/app/(auth)/login/services/login-imp.service";
import {
  LoginService,
  LoginServiceToken,
} from "@/app/(auth)/login/services/login.service";
import {
  CookieService,
  CookieServiceToken,
} from "@/app/utils/cookie/CookieService";
import { CookieServiceImp } from "@/app/utils/cookie/CookieServiceImp";
import {
  RegistrationService,
  RegistrationServiceToken,
} from "@/app/(auth)/registration/services/registration.service";
import { RegistrationServiceImp } from "@/app/(auth)/registration/services/registration-imp.service";
import {
  MenuService,
  MenuServiceToken,
} from "@/app/(main)/components/menu/services/menu.service";
import { MenuServiceImp } from "@/app/(main)/components/menu/services/menu-imp.service";
import { Container } from "inversify";
import {
  OrganizationService,
  OrganizationServiceToken,
} from "@/app/(auth)/org/services/organization.service";
import { OrganizationServiceImp } from "@/app/(auth)/org/services/organization-imp.service";
import {
  RoleService,
  RoleServiceToken,
} from "@/app/(main)/role/services/role.service";
import { RoleServiceImp } from "@/app/(main)/role/services/role-imp.service";
import {
  MenuTemplateService,
  MenuTemplateServiceToken,
} from "@/app/(main)/menu-template/services/menu-template.service";
import { MenuTemplateServiceImp } from "@/app/(main)/menu-template/services/menu-template-imp.service";

const container: Container = new Container();

container.bind<LoginService>(LoginServiceToken).to(LoginServiceImp);
container
  .bind<RegistrationService>(RegistrationServiceToken)
  .to(RegistrationServiceImp);
container.bind<CookieService>(CookieServiceToken).to(CookieServiceImp);
container.bind<MenuService>(MenuServiceToken).to(MenuServiceImp);
container
  .bind<OrganizationService>(OrganizationServiceToken)
  .to(OrganizationServiceImp);
container.bind<RoleService>(RoleServiceToken).to(RoleServiceImp);
container
  .bind<MenuTemplateService>(MenuTemplateServiceToken)
  .to(MenuTemplateServiceImp);

export { container };
