export class ResultsResponseDto {
  metricId: number = 1;
  metricName: string = "";
  isPrimary: boolean = false;
  variationId: number = 1;
  variationName: string = "";
  triggeredOnQA: number = 0;
  triggeredOnLIVE: number = 0;
}
