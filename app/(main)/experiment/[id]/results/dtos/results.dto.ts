export class ResultsResponseDto {
  metricId: number = 1;
  metricName: string = "";
  isPrimary: boolean = false;
  variationId: number = 1;
  variationName: string = "";
  triggeredOnQA: number = 0;
  triggeredOnLIVE: number = 0;
}

export class ResultDetailRequestDto {
  rows!: number;
  page!: number;
  fromDate?: string | null;
  toDate?: string | null;
}

export class ResultDetailDto {
  id!: number;
  experimentId!: number;
  metricName!: string;
  variationName!: string;
  visitorId!: number;
  mode!: string | null;
  revenue!: number;
  device!: string | null;
  browser!: string | null;
  urlPathname!: string | null;
  sessionId!: string | null;
  createdAt!: string | null;
}
