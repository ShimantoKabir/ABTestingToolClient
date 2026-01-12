export class ResultsResponseDto {
  id: number = 0;
  experimentId: number = 0;
  variationId: number = 0;
  userId?: string = "";
  sessionId?: string = "";
  timestamp: string = "";
  metricId?: number = 0;
  metricValue?: string = "";
  converted: boolean = false;
  device?: string = "";
  browser?: string = "";
  os?: string = "";
  country?: string = "";
  city?: string = "";
}

export class ResultsStatsDto {
  totalParticipants: number = 0;
  conversionRate: number = 0;
  variationStats: VariationStatsDto[] = [];
}

export class VariationStatsDto {
  variationId: number = 0;
  variationName: string = "";
  participants: number = 0;
  conversions: number = 0;
  conversionRate: number = 0;
}
