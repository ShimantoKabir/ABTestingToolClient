export class MetricsResponseDto {
  id: number = 0;
  experimentId: number = 0;
  title: string = "";
  type: string = ""; // e.g., 'click', 'pageview'
  selector: string = "";
}

export class MetricsCreateRequestDto {
  title: string = "";
  type: string = "";
  selector: string = "";
  experimentId: number = 0;
}
