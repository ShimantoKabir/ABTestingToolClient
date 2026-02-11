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
import {
  UserService,
  UserServiceToken,
} from "@/app/(main)/user/services/user.service";
import { UserServiceImp } from "@/app/(main)/user/services/user-imp.service";
import {
  ProjectService,
  ProjectServiceToken,
} from "@/app/(main)/project/services/project.service";
import { ProjectServiceImp } from "@/app/(main)/project/services/project-imp.service";
import {
  ExperimentService,
  ExperimentServiceToken,
} from "./(main)/experiment/services/experiment.service";
import { ExperimentServiceImp } from "./(main)/experiment/services/experiment-imp.service";
import {
  ConditionService,
  ConditionServiceToken,
} from "./(main)/experiment/[id]/condition/services/condition.service";
import { ConditionServiceImp } from "./(main)/experiment/[id]/condition/services/condition-imp.service";
import {
  VariationService,
  VariationServiceToken,
} from "./(main)/experiment/[id]/variation/services/variation.service";
import { VariationServiceImp } from "./(main)/experiment/[id]/variation/services/variation-imp.service";
import {
  TrafficService,
  TrafficServiceToken,
} from "./(main)/experiment/[id]/traffic/services/traffic.service";
import { TrafficServiceImp } from "./(main)/experiment/[id]/traffic/services/traffic-imp.service";
import {
  MetricsService,
  MetricsServiceToken,
} from "./(main)/experiment/[id]/metrics/services/metrics.service";
import { MetricsServiceImp } from "./(main)/experiment/[id]/metrics/services/metrics-imp.service";
import {
  ResultsService,
  ResultsServiceToken,
} from "./(main)/experiment/[id]/results/services/results.service";
import { ResultsServiceImp } from "./(main)/experiment/[id]/results/services/results-imp.service";

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
container.bind<UserService>(UserServiceToken).to(UserServiceImp);
container.bind<ProjectService>(ProjectServiceToken).to(ProjectServiceImp);
container
  .bind<ExperimentService>(ExperimentServiceToken)
  .to(ExperimentServiceImp);
container.bind<ConditionService>(ConditionServiceToken).to(ConditionServiceImp);
container.bind<VariationService>(VariationServiceToken).to(VariationServiceImp);
container.bind<TrafficService>(TrafficServiceToken).to(TrafficServiceImp);
container.bind<MetricsService>(MetricsServiceToken).to(MetricsServiceImp);
container.bind<ResultsService>(ResultsServiceToken).to(ResultsServiceImp);

export { container };
