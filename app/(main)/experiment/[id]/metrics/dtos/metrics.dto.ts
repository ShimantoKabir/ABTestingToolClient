export class MetricsResponseDto {
  id: number = 0;
  experimentId: number = 0;
  title: string = "";
  custom: boolean = false;
  selector: string | null = null;
  description: string | null = null;
  isPrimary: boolean = false;
  triggeredOnLIVE: number = 0;
  triggeredOnQA: number = 0;
}

export class MetricsCreateRequestDto {
  title: string = "";
  custom: boolean = false; // defaults to false in schema
  selector?: string | null = null;
  description?: string | null = null;
}

export class MetricsTrackResponseDto {
  message: string = "";
  triggered: boolean = true;
}

export class MetricsPrimaryUpdateRequestDto {
  email: string = "";
}

export class MetricsPrimaryUpdateResponseDto {
  id: number = 0;
  experimentId: number = 0;
  title: string = "";
  custom: boolean = true;
  selector: string = "";
  description: string = "";
  isPrimary: boolean = true;
}
