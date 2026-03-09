export class VariationStatsDto {
  variationId: number = 0;
  variationTitle: string = "";
  isControl: boolean = false;
  sampleSize: number = 0;
  conversions: number = 0;
  conversionRate: number = 0;
  pValue: number | null = null;
  probWinning: number | null = null;
  lift: number | null = null;
  isSignificant: boolean = false;
}

export class AnalyticsResponseDto {
  experimentId: number = 0;
  experimentTitle: string = "";
  targetMetricTitle: string = "";
  stats: VariationStatsDto[] = [];
}
