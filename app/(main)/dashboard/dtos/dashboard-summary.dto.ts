export class DashboardSummaryDto {
  activeExperiments!: number;
  activeExperimentsSinceLastWeek!: number;
  pendingDrafts!: number;
  totalUsers!: number;
  userGrowthPercent!: number;
  conversionRate!: number;
  conversionUpliftToday!: number;
}
